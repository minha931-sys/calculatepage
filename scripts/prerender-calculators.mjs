#!/usr/bin/env node

/*
 * CalculatePage one-off static prerenderer.
 *
 * Default:
 *   node scripts/prerender-calculators.mjs --check
 *
 * Write:
 *   node scripts/prerender-calculators.mjs --write
 *
 * This file intentionally uses only Node built-ins. It executes the local
 * calculator/category renderers in a small deterministic DOM implemented
 * below. /js/site-audit-fix.js is deliberately excluded because it is the
 * late override layer being removed from the site.
 */

import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, '..');
const CALCULATOR_DIR = path.join(PROJECT_ROOT, 'calculators');
const CATEGORY_DIR = path.join(PROJECT_ROOT, 'categories');
const BASE_EDITORIAL_SCRIPT = path.join(PROJECT_ROOT, 'js', 'calculator-content.js');
const SITE_AUDIT_PATH = '/js/site-audit-fix.js';
const STATIC_CALCULATOR_PAGES = new Set(['cpm.html', 'jlpt-score.html']);
const SCENARIO_COMPARISON_PANELS = Object.freeze({
  'loan-interest': '<section class="scenario-panel scenario-loan" data-scenario-panel="loan-interest" aria-labelledby="loan-scenario-title"><div class="scenario-panel-header"><div><h2 id="loan-scenario-title">상환안 3개 비교</h2><p>원금·금리·기간·상환 방식을 바꿔 계산한 뒤 총이자와 월 부담을 한 표에서 비교하세요.</p></div><div class="scenario-actions"><button class="scenario-add" type="button" data-scenario-add disabled>현재 결과 추가</button><button class="scenario-clear" type="button" data-scenario-clear disabled>비교표 비우기</button></div></div><div class="scenario-empty" data-scenario-empty>계산 결과가 아직 없습니다. 대출을 계산한 뒤 ‘현재 결과 추가’를 눌러 상환안을 저장하세요.</div><div data-scenario-list hidden></div><p class="scenario-status" data-scenario-status aria-live="polite"></p><p class="scenario-storage-note">최대 3개까지 비교할 수 있으며 비교값은 이 화면에서만 유지됩니다.</p></section>',
  'loan-refinance': '<section class="scenario-panel scenario-refinance" data-scenario-panel="loan-refinance" aria-labelledby="refinance-scenario-title"><div class="scenario-panel-header"><div><h2 id="refinance-scenario-title">대환 후보 손익분기 보드</h2><p>은행별 제안 조건을 다시 계산해 저장하면 실질 절감액과 비용 회수 시점을 후보별로 비교할 수 있습니다.</p></div><div class="scenario-actions"><button class="scenario-add" type="button" data-scenario-add disabled>대환 후보 저장</button><button class="scenario-clear" type="button" data-scenario-clear disabled>후보 모두 지우기</button></div></div><div class="scenario-empty" data-scenario-empty>갈아타기 결과를 계산한 뒤 후보로 저장하세요. 금리뿐 아니라 기간과 전환 비용까지 함께 비교합니다.</div><div data-scenario-list hidden></div><p class="scenario-status" data-scenario-status aria-live="polite"></p><p class="scenario-storage-note">최대 3개까지 비교할 수 있으며 입력한 조건과 비교값은 서버에 전송하거나 저장하지 않습니다.</p></section>',
  'savings-interest': '<section class="scenario-panel scenario-savings" data-scenario-panel="savings-interest" aria-labelledby="savings-scenario-title"><div class="scenario-panel-header"><div><h2 id="savings-scenario-title">예·적금 상품 후보 카드</h2><p>예치금이나 월 납입액, 금리, 기간을 바꿔 계산하고 원금 대비 예상 수령 이자율이 높은 조건을 찾으세요.</p></div><div class="scenario-actions"><button class="scenario-add" type="button" data-scenario-add disabled>상품 후보 저장</button><button class="scenario-clear" type="button" data-scenario-clear disabled>후보 모두 지우기</button></div></div><div class="scenario-empty" data-scenario-empty>예금 또는 적금 결과를 계산한 뒤 후보로 저장하면 상품 설명서 형태로 비교해 드립니다.</div><div data-scenario-list hidden></div><p class="scenario-status" data-scenario-status aria-live="polite"></p><p class="scenario-storage-note">최대 3개까지 비교할 수 있습니다. 세금 반영 여부를 같게 맞추고 우대금리·중도해지 조건은 각 상품 설명서에서 확인하세요.</p></section>',
  salary: '<section class="scenario-panel scenario-salary" data-scenario-panel="salary" aria-labelledby="salary-scenario-title"><div class="scenario-panel-header"><div><h2 id="salary-scenario-title">현재 조건과 제안 조건 비교</h2><p>현재 급여를 먼저 계산해 저장하고, 이직·연봉협상 조건을 다시 계산해 월·연 실수령 차이를 확인하세요.</p></div><div class="scenario-actions"><button class="scenario-add" type="button" data-scenario-slot="current" disabled>현재 조건에 저장</button><button class="scenario-add" type="button" data-scenario-slot="offer" disabled>비교 조건에 저장</button><button class="scenario-clear" type="button" data-scenario-clear disabled>비교 초기화</button></div></div><div class="scenario-empty" data-scenario-empty>급여 결과를 계산한 뒤 현재 조건 또는 비교 조건에 저장하세요. 같은 결과를 다시 계산해 덮어쓸 수 있습니다.</div><div data-scenario-list hidden></div><p class="scenario-status" data-scenario-status aria-live="polite"></p><p class="scenario-storage-note">소득세 입력 여부와 보험 계산 기간이 같은지 확인해야 조건 간 차이를 올바르게 볼 수 있습니다.</p></section>',
  budget: '<section class="scenario-panel scenario-budget" data-scenario-panel="budget" aria-labelledby="budget-scenario-title"><div class="scenario-panel-header"><div><h2 id="budget-scenario-title">월 예산안 구성 비교</h2><p>주거비·생활비·저축 목표를 바꿔 저장하면 돈의 배분과 목표 달성 후 여유자금을 막대로 비교할 수 있습니다.</p></div><div class="scenario-actions"><button class="scenario-add" type="button" data-scenario-add disabled>현재 예산안 저장</button><button class="scenario-clear" type="button" data-scenario-clear disabled>예산안 모두 지우기</button></div></div><div class="scenario-empty" data-scenario-empty>생활비 예산을 계산한 뒤 예산안으로 저장하세요. 이사 전후나 절약 전후 조건을 최대 3개까지 비교할 수 있습니다.</div><div data-scenario-list hidden></div><p class="scenario-status" data-scenario-status aria-live="polite"></p><p class="scenario-storage-note">비교값은 새로고침할 때 초기화되며 브라우저나 서버에 저장되지 않습니다.</p></section>'
});
const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link',
  'meta', 'param', 'source', 'track', 'wbr'
]);
const BOOLEAN_ATTRIBUTES = new Set([
  'allowfullscreen', 'async', 'autofocus', 'autoplay', 'checked', 'controls',
  'default', 'defer', 'disabled', 'formnovalidate', 'hidden', 'inert', 'loop',
  'multiple', 'muted', 'nomodule', 'novalidate', 'open', 'playsinline',
  'readonly', 'required', 'reversed', 'selected'
]);
const RUNTIME_DATA_ATTRIBUTES = new Set([
  'data-audit-before',
  'data-example-normalized',
  'data-improved-related',
  'data-share-buttons-bound'
]);

function parseArgs(argv) {
  const options = {
    mode: 'check',
    failOnChange: false,
    verbose: false,
    only: new Set()
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--check') {
      options.mode = 'check';
    } else if (arg === '--write') {
      options.mode = 'write';
    } else if (arg === '--fail-on-change') {
      options.failOnChange = true;
    } else if (arg === '--verbose') {
      options.verbose = true;
    } else if (arg === '--only') {
      const value = argv[index + 1];
      if (!value) throw new Error('--only 뒤에 파일명 또는 slug가 필요합니다.');
      options.only.add(value.replace(/\.html$/i, ''));
      index += 1;
    } else if (arg.startsWith('--only=')) {
      options.only.add(arg.slice('--only='.length).replace(/\.html$/i, ''));
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else {
      throw new Error('알 수 없는 옵션: ' + arg);
    }
  }
  return options;
}

function printHelp() {
  console.log([
    'CalculatePage 계산기·카테고리 정적 프리렌더',
    '',
    '사용법:',
    '  node scripts/prerender-calculators.mjs --check',
    '  node scripts/prerender-calculators.mjs --write',
    '  node scripts/prerender-calculators.mjs --check --only salary',
    '',
    '옵션:',
    '  --check           파일을 바꾸지 않고 예상 변경과 오류만 검사합니다. 기본값입니다.',
    '  --write           모든 페이지 검증 성공 후에만 UTF-8로 파일을 갱신합니다.',
    '  --only NAME       특정 calculator/category slug만 검사합니다. 여러 번 지정할 수 있습니다.',
    '  --verbose         페이지별 렌더 통계를 출력합니다.',
    '  --fail-on-change  --check에서 변경 예정 파일이 있으면 종료 코드 2를 반환합니다.'
  ].join('\n'));
}

function decodeEntities(value) {
  return String(value)
    .replace(/&nbsp;/gi, '\u00a0')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#x([0-9a-f]+);/gi, function(_, hex) {
      return String.fromCodePoint(parseInt(hex, 16));
    })
    .replace(/&#([0-9]+);/g, function(_, decimal) {
      return String.fromCodePoint(parseInt(decimal, 10));
    });
}

function escapeText(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;');
}

function escapeAttribute(value) {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function escapeRegExp(value) {
  return String(value)
    .replace(/[.*+?^$()|[\]\\]/g, '\\$&')
    .replace(/[{}]/g, '\\$&');
}

function camelToData(value) {
  return 'data-' + String(value).replace(/[A-Z]/g, function(letter) {
    return '-' + letter.toLowerCase();
  });
}

function dataToCamel(value) {
  return String(value)
    .replace(/^data-/, '')
    .replace(/-([a-z0-9])/g, function(_, letter) {
      return letter.toUpperCase();
    });
}

class EventHub {
  constructor() {
    this._listeners = new Map();
  }

  addEventListener(type, callback) {
    if (!callback) return;
    const key = String(type);
    if (!this._listeners.has(key)) this._listeners.set(key, []);
    this._listeners.get(key).push(callback);
  }

  removeEventListener(type, callback) {
    const list = this._listeners.get(String(type));
    if (!list) return;
    const index = list.indexOf(callback);
    if (index >= 0) list.splice(index, 1);
  }

  dispatchEvent(event) {
    const actual = typeof event === 'string' ? new VirtualEvent(event) : event;
    if (!actual || !actual.type) return true;
    if (!actual.target) actual.target = this;
    actual.currentTarget = this;
    const property = this['on' + actual.type];
    if (typeof property === 'function') property.call(this, actual);
    const list = (this._listeners.get(actual.type) || []).slice();
    for (const callback of list) {
      if (typeof callback === 'function') callback.call(this, actual);
      else if (callback && typeof callback.handleEvent === 'function') callback.handleEvent(actual);
    }
    return !actual.defaultPrevented;
  }
}

class VirtualEvent {
  constructor(type, init) {
    this.type = String(type || '');
    this.bubbles = Boolean(init && init.bubbles);
    this.cancelable = Boolean(init && init.cancelable);
    this.defaultPrevented = false;
    this.target = null;
    this.currentTarget = null;
    this.key = init && init.key ? init.key : '';
  }

  preventDefault() {
    if (this.cancelable !== false) this.defaultPrevented = true;
  }

  stopPropagation() {}
  stopImmediatePropagation() {}
}

class VirtualNode extends EventHub {
  constructor(ownerDocument, nodeType) {
    super();
    this.ownerDocument = ownerDocument || null;
    this.nodeType = nodeType;
    this.parentNode = null;
    this.childNodes = [];
  }

  get parentElement() {
    return this.parentNode && this.parentNode.nodeType === 1 ? this.parentNode : null;
  }

  get firstChild() {
    return this.childNodes[0] || null;
  }

  get lastChild() {
    return this.childNodes[this.childNodes.length - 1] || null;
  }

  get children() {
    return this.childNodes.filter(function(node) {
      return node.nodeType === 1;
    });
  }

  get firstElementChild() {
    return this.children[0] || null;
  }

  get lastElementChild() {
    const elements = this.children;
    return elements[elements.length - 1] || null;
  }

  get nextElementSibling() {
    if (!this.parentNode) return null;
    const siblings = this.parentNode.children;
    const index = siblings.indexOf(this);
    return index >= 0 ? siblings[index + 1] || null : null;
  }

  get previousElementSibling() {
    if (!this.parentNode) return null;
    const siblings = this.parentNode.children;
    const index = siblings.indexOf(this);
    return index > 0 ? siblings[index - 1] : null;
  }

  appendChild(node) {
    if (!node) return node;
    if (node.nodeType === 11) {
      const children = node.childNodes.slice();
      for (const child of children) this.appendChild(child);
      return node;
    }
    if (node.parentNode) node.parentNode.removeChild(node);
    node.parentNode = this;
    setOwnerDocument(node, this.ownerDocument || this);
    this.childNodes.push(node);
    this._notify('childList', { addedNodes: [node], removedNodes: [] });
    return node;
  }

  append() {
    for (const item of arguments) {
      this.appendChild(coerceNode(item, this.ownerDocument));
    }
  }

  prepend() {
    const items = Array.from(arguments).map(function(item) {
      return coerceNode(item, this.ownerDocument);
    }, this);
    for (let index = items.length - 1; index >= 0; index -= 1) {
      const node = items[index];
      if (node.parentNode) node.parentNode.removeChild(node);
      node.parentNode = this;
      setOwnerDocument(node, this.ownerDocument || this);
      this.childNodes.unshift(node);
    }
    if (items.length) this._notify('childList', { addedNodes: items, removedNodes: [] });
  }

  after() {
    if (!this.parentNode) return;
    const parent = this.parentNode;
    const siblings = parent.childNodes;
    const reference = siblings[siblings.indexOf(this) + 1] || null;
    for (const item of arguments) {
      parent.insertBefore(coerceNode(item, this.ownerDocument), reference);
    }
  }

  insertBefore(node, reference) {
    if (!reference) return this.appendChild(node);
    const index = this.childNodes.indexOf(reference);
    if (index < 0) return this.appendChild(node);
    if (node.parentNode) node.parentNode.removeChild(node);
    node.parentNode = this;
    setOwnerDocument(node, this.ownerDocument || this);
    this.childNodes.splice(index, 0, node);
    this._notify('childList', { addedNodes: [node], removedNodes: [] });
    return node;
  }

  removeChild(node) {
    const index = this.childNodes.indexOf(node);
    if (index < 0) return node;
    this.childNodes.splice(index, 1);
    node.parentNode = null;
    this._notify('childList', { addedNodes: [], removedNodes: [node] });
    return node;
  }

  remove() {
    if (this.parentNode) this.parentNode.removeChild(this);
  }

  contains(node) {
    if (node === this) return true;
    return this.childNodes.some(function(child) {
      return child.contains ? child.contains(node) : child === node;
    });
  }

  get textContent() {
    return this.childNodes.map(function(node) {
      return node.textContent;
    }).join('');
  }

  set textContent(value) {
    const removed = this.childNodes.slice();
    this.childNodes = [];
    if (String(value || '') !== '') {
      const text = new VirtualText(this.ownerDocument, String(value));
      text.parentNode = this;
      this.childNodes.push(text);
    }
    this._notify('childList', { addedNodes: this.childNodes.slice(), removedNodes: removed });
  }

  _notify(type, extra) {
    const document = this.ownerDocument;
    if (document && typeof document._notifyMutation === 'function') {
      document._notifyMutation(this, Object.assign({ type: type, target: this }, extra || {}));
    }
  }
}

class VirtualText extends VirtualNode {
  constructor(ownerDocument, value, raw) {
    super(ownerDocument, 3);
    this.data = String(value || '');
    this.raw = Boolean(raw);
  }

  get textContent() {
    return this.data;
  }

  set textContent(value) {
    this.data = String(value || '');
    this._notify('characterData');
  }

  contains(node) {
    return node === this;
  }

  cloneNode() {
    return new VirtualText(this.ownerDocument, this.data, this.raw);
  }
}

class VirtualFragment extends VirtualNode {
  constructor(ownerDocument) {
    super(ownerDocument, 11);
  }

  cloneNode(deep) {
    const clone = new VirtualFragment(this.ownerDocument);
    if (deep) {
      for (const child of this.childNodes) clone.appendChild(child.cloneNode(true));
    }
    return clone;
  }
}

class VirtualClassList {
  constructor(element) {
    this.element = element;
  }

  _list() {
    return String(this.element.getAttribute('class') || '').split(/\s+/).filter(Boolean);
  }

  _save(list) {
    if (list.length) this.element.setAttribute('class', Array.from(new Set(list)).join(' '));
    else this.element.removeAttribute('class');
  }

  add() {
    const list = this._list();
    for (const name of arguments) {
      if (!list.includes(String(name))) list.push(String(name));
    }
    this._save(list);
  }

  remove() {
    const remove = new Set(Array.from(arguments).map(String));
    this._save(this._list().filter(function(name) {
      return !remove.has(name);
    }));
  }

  contains(name) {
    return this._list().includes(String(name));
  }

  toggle(name, force) {
    const exists = this.contains(name);
    const next = force === undefined ? !exists : Boolean(force);
    if (next) this.add(name);
    else this.remove(name);
    return next;
  }

  toString() {
    return this._list().join(' ');
  }
}

class VirtualElement extends VirtualNode {
  constructor(ownerDocument, tagName) {
    super(ownerDocument, 1);
    this.tagName = String(tagName || 'div').toUpperCase();
    this.localName = this.tagName.toLowerCase();
    this.attributesMap = new Map();
    this._value = '';
    this._valueSet = false;
    this._checked = false;
    this._checkedSet = false;
    this._selectedIndex = null;
    this._datasetProxy = null;
    this._styleProxy = null;
  }

  get nodeName() { return this.tagName; }
  get attributes() {
    return Array.from(this.attributesMap, function(entry) {
      return { name: entry[0], value: entry[1] };
    });
  }
  get id() { return this.getAttribute('id') || ''; }
  set id(value) { this.setAttribute('id', value); }
  get className() { return this.getAttribute('class') || ''; }
  set className(value) { this.setAttribute('class', value); }
  get classList() { return new VirtualClassList(this); }

  get dataset() {
    if (this._datasetProxy) return this._datasetProxy;
    const element = this;
    this._datasetProxy = new Proxy({}, {
      get: function(_, property) {
        if (typeof property !== 'string') return undefined;
        const value = element.getAttribute(camelToData(property));
        return value === null ? undefined : value;
      },
      set: function(_, property, value) {
        element.setAttribute(camelToData(property), String(value));
        return true;
      },
      deleteProperty: function(_, property) {
        element.removeAttribute(camelToData(property));
        return true;
      },
      ownKeys: function() {
        return Array.from(element.attributesMap.keys())
          .filter(function(name) { return name.startsWith('data-'); })
          .map(dataToCamel);
      },
      getOwnPropertyDescriptor: function() {
        return { enumerable: true, configurable: true };
      }
    });
    return this._datasetProxy;
  }

  get style() {
    if (this._styleProxy) return this._styleProxy;
    const element = this;
    this._styleProxy = new Proxy({}, {
      get: function(_, property) {
        if (property === 'cssText') return element.getAttribute('style') || '';
        const values = parseStyle(element.getAttribute('style') || '');
        return values.get(String(property).replace(/[A-Z]/g, function(letter) {
          return '-' + letter.toLowerCase();
        })) || '';
      },
      set: function(_, property, value) {
        if (property === 'cssText') {
          element.setAttribute('style', String(value));
          return true;
        }
        const values = parseStyle(element.getAttribute('style') || '');
        const key = String(property).replace(/[A-Z]/g, function(letter) {
          return '-' + letter.toLowerCase();
        });
        if (value === '' || value === null) values.delete(key);
        else values.set(key, String(value));
        element.setAttribute('style', Array.from(values, function(entry) {
          return entry[0] + ':' + entry[1];
        }).join(';'));
        return true;
      }
    });
    return this._styleProxy;
  }

  get innerHTML() {
    return this.childNodes.map(serializeNode).join('');
  }

  set innerHTML(value) {
    const removed = this.childNodes.slice();
    const fragment = parseFragment(String(value || ''), this.ownerDocument);
    this.childNodes = [];
    for (const child of fragment.childNodes.slice()) {
      child.parentNode = this;
      setOwnerDocument(child, this.ownerDocument);
      this.childNodes.push(child);
    }
    fragment.childNodes = [];
    if (this.id === 'calculator' || this.id === 'category') {
      this.ownerDocument.stats.rootAssignments += 1;
    } else {
      this.ownerDocument.stats.targetMutations += 1;
    }
    this._notify('childList', { addedNodes: this.childNodes.slice(), removedNodes: removed });
  }

  get outerHTML() { return serializeNode(this); }

  get value() {
    if (this.tagName === 'SELECT') {
      const option = this.selectedOptions[0];
      return option ? option.value : '';
    }
    if (this.tagName === 'OPTION') {
      const attribute = this.getAttribute('value');
      return attribute === null ? this.textContent : attribute;
    }
    if (this._valueSet) return this._value;
    const attribute = this.getAttribute('value');
    return attribute === null ? '' : attribute;
  }

  set value(value) {
    const string = String(value === null || value === undefined ? '' : value);
    if (this.tagName === 'SELECT') {
      const options = this.options;
      const index = options.findIndex(function(option) {
        return option.value === string;
      });
      this._selectedIndex = index >= 0 ? index : -1;
    } else {
      this._value = string;
      this._valueSet = true;
    }
  }

  get checked() { return this._checkedSet ? this._checked : this.hasAttribute('checked'); }
  set checked(value) { this._checked = Boolean(value); this._checkedSet = true; }
  get disabled() { return this.hasAttribute('disabled'); }
  set disabled(value) {
    if (value) this.setAttribute('disabled', '');
    else this.removeAttribute('disabled');
  }
  get hidden() { return this.hasAttribute('hidden'); }
  set hidden(value) {
    if (value) this.setAttribute('hidden', '');
    else this.removeAttribute('hidden');
  }
  get type() {
    const value = this.getAttribute('type');
    if (value) return value;
    if (this.tagName === 'INPUT') return 'text';
    if (this.tagName === 'BUTTON') return 'submit';
    return '';
  }
  set type(value) { this.setAttribute('type', value); }
  get name() { return this.getAttribute('name') || ''; }
  set name(value) { this.setAttribute('name', value); }
  get href() { return this.getAttribute('href') || ''; }
  set href(value) { this.setAttribute('href', value); }
  get src() { return this.getAttribute('src') || ''; }
  set src(value) { this.setAttribute('src', value); }
  get rel() { return this.getAttribute('rel') || ''; }
  set rel(value) { this.setAttribute('rel', value); }
  get target() { return this.getAttribute('target') || ''; }
  set target(value) { this.setAttribute('target', value); }
  get placeholder() { return this.getAttribute('placeholder') || ''; }
  set placeholder(value) { this.setAttribute('placeholder', value); }
  get step() { return this.getAttribute('step') || ''; }
  set step(value) { this.setAttribute('step', value); }
  get min() { return this.getAttribute('min') || ''; }
  set min(value) { this.setAttribute('min', value); }
  get max() { return this.getAttribute('max') || ''; }
  set max(value) { this.setAttribute('max', value); }
  get inputMode() { return this.getAttribute('inputmode') || ''; }
  set inputMode(value) { this.setAttribute('inputmode', value); }
  get htmlFor() { return this.getAttribute('for') || ''; }
  set htmlFor(value) { this.setAttribute('for', value); }
  get text() { return this.textContent; }

  get options() {
    if (this.tagName !== 'SELECT') return [];
    return descendants(this).filter(function(element) {
      return element.tagName === 'OPTION';
    });
  }
  get selectedIndex() {
    if (this.tagName !== 'SELECT') return -1;
    if (this._selectedIndex !== null) return this._selectedIndex;
    const options = this.options;
    const selected = options.findIndex(function(option) {
      return option.hasAttribute('selected');
    });
    return selected >= 0 ? selected : options.length ? 0 : -1;
  }
  set selectedIndex(value) {
    const number = Number(value);
    this._selectedIndex = Number.isInteger(number) ? number : -1;
  }
  get selectedOptions() {
    if (this.tagName !== 'SELECT') return [];
    const option = this.options[this.selectedIndex];
    return option ? [option] : [];
  }

  setAttribute(name, value) {
    const key = String(name).toLowerCase();
    this.attributesMap.set(key, String(value === null || value === undefined ? '' : value));
    this._notify('attributes', { attributeName: key });
  }
  getAttribute(name) {
    const key = String(name).toLowerCase();
    return this.attributesMap.has(key) ? this.attributesMap.get(key) : null;
  }
  hasAttribute(name) { return this.attributesMap.has(String(name).toLowerCase()); }
  removeAttribute(name) {
    const key = String(name).toLowerCase();
    if (!this.attributesMap.has(key)) return;
    this.attributesMap.delete(key);
    this._notify('attributes', { attributeName: key });
  }
  toggleAttribute(name, force) {
    const exists = this.hasAttribute(name);
    const next = force === undefined ? !exists : Boolean(force);
    if (next) this.setAttribute(name, '');
    else this.removeAttribute(name);
    return next;
  }
  querySelectorAll(selector) { return querySelectorAllFrom(this, selector, false); }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  matches(selector) {
    return splitSelectorGroups(selector).some(function(group) {
      return matchesComplexSelector(this, group, this);
    }, this);
  }
  closest(selector) {
    let current = this;
    while (current && current.nodeType === 1) {
      if (current.matches(selector)) return current;
      current = current.parentElement;
    }
    return null;
  }
  insertAdjacentHTML(position, html) {
    const fragment = parseFragment(String(html || ''), this.ownerDocument);
    const nodes = fragment.childNodes.slice();
    const where = String(position).toLowerCase();
    if (where === 'beforeend') {
      for (const node of nodes) this.appendChild(node);
    } else if (where === 'afterbegin') {
      for (let index = nodes.length - 1; index >= 0; index -= 1) {
        this.insertBefore(nodes[index], this.firstChild);
      }
    } else if (where === 'beforebegin' && this.parentNode) {
      for (const node of nodes) this.parentNode.insertBefore(node, this);
    } else if (where === 'afterend' && this.parentNode) {
      const siblings = this.parentNode.childNodes;
      const reference = siblings[siblings.indexOf(this) + 1] || null;
      for (const node of nodes) this.parentNode.insertBefore(node, reference);
    }
    this.ownerDocument.stats.targetMutations += 1;
  }
  insertAdjacentElement(position, element) {
    const where = String(position).toLowerCase();
    if (where === 'beforeend') this.appendChild(element);
    else if (where === 'afterbegin') this.insertBefore(element, this.firstChild);
    else if (where === 'beforebegin' && this.parentNode) this.parentNode.insertBefore(element, this);
    else if (where === 'afterend' && this.parentNode) {
      const siblings = this.parentNode.childNodes;
      const reference = siblings[siblings.indexOf(this) + 1] || null;
      this.parentNode.insertBefore(element, reference);
    }
    return element;
  }
  cloneNode(deep) {
    const clone = new VirtualElement(this.ownerDocument, this.localName);
    for (const entry of this.attributesMap) clone.attributesMap.set(entry[0], entry[1]);
    clone._value = this._value;
    clone._valueSet = this._valueSet;
    clone._checked = this._checked;
    clone._checkedSet = this._checkedSet;
    clone._selectedIndex = this._selectedIndex;
    if (deep) {
      for (const child of this.childNodes) clone.appendChild(child.cloneNode(true));
    }
    return clone;
  }
  focus() {}
  scrollIntoView() {}
  setCustomValidity() {}
  getBoundingClientRect() {
    return { x: 0, y: 0, top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 };
  }
}

class VirtualDocument extends VirtualNode {
  constructor(stats, reportError) {
    super(null, 9);
    this.ownerDocument = this;
    this.stats = stats;
    this.reportError = reportError;
    this.readyState = 'loading';
    this._observers = new Set();
    this._mutationFlushing = false;
    this.documentElement = new VirtualElement(this, 'html');
    this.head = new VirtualElement(this, 'head');
    this.body = new VirtualElement(this, 'body');
    this.documentElement.appendChild(this.head);
    this.documentElement.appendChild(this.body);
    this.childNodes.push(this.documentElement);
    this.documentElement.parentNode = this;
  }
  createElement(tagName) { return new VirtualElement(this, tagName); }
  createTextNode(value) { return new VirtualText(this, value); }
  createDocumentFragment() { return new VirtualFragment(this); }
  querySelectorAll(selector) { return querySelectorAllFrom(this.documentElement, selector, true); }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  getElementById(id) { return this.querySelector('#' + cssIdentifierEscape(id)); }
  getElementsByTagName(name) { return this.querySelectorAll(String(name)); }
  get title() {
    const title = this.head.querySelector('title');
    return title ? title.textContent : '';
  }
  set title(value) {
    let title = this.head.querySelector('title');
    if (!title) {
      title = this.createElement('title');
      this.head.appendChild(title);
    }
    title.textContent = value;
  }
  _notifyMutation(target, record) {
    for (const observer of this._observers) {
      if (!observer.active || !observer.target) continue;
      const inScope = target === observer.target ||
        (observer.options.subtree && observer.target.contains(target));
      if (!inScope) continue;
      if (record.type === 'attributes' && !observer.options.attributes) continue;
      if (record.type === 'childList' && !observer.options.childList) continue;
      if (record.type === 'attributes' && observer.options.attributeFilter &&
          !observer.options.attributeFilter.includes(record.attributeName)) continue;
      observer.records.push(record);
    }
  }
  flushMutations() {
    if (this._mutationFlushing) return;
    this._mutationFlushing = true;
    try {
      let passes = 0;
      while (passes < 100) {
        passes += 1;
        const pending = Array.from(this._observers).filter(function(observer) {
          return observer.active && observer.records.length;
        });
        if (!pending.length) break;
        for (const observer of pending) {
          const records = observer.records.splice(0);
          try {
            observer.callback(records, observer);
          } catch (error) {
            this.reportError('MutationObserver', error);
          }
        }
      }
      if (passes >= 100) this.reportError('MutationObserver', new Error('observer 반복 한도 초과'));
    } finally {
      this._mutationFlushing = false;
    }
  }
  execCommand() { return false; }
}

class Scheduler {
  constructor(invoke, flushMutations) {
    this.invoke = invoke;
    this.flushMutations = flushMutations;
    this.now = 0;
    this.nextId = 1;
    this.timers = [];
  }
  setTimeout(callback, delay) {
    const args = Array.prototype.slice.call(arguments, 2);
    const id = this.nextId++;
    this.timers.push({
      id: id,
      due: this.now + Math.max(0, Number(delay) || 0),
      callback: callback,
      args: args,
      cancelled: false
    });
    return id;
  }
  clearTimeout(id) {
    const timer = this.timers.find(function(item) { return item.id === id; });
    if (timer) timer.cancelled = true;
  }
  drain(maxTime) {
    let count = 0;
    while (count < 10000) {
      this.timers.sort(function(left, right) {
        return left.due - right.due || left.id - right.id;
      });
      const timer = this.timers.find(function(item) { return !item.cancelled; });
      if (!timer || timer.due > maxTime) break;
      this.timers.splice(this.timers.indexOf(timer), 1);
      this.now = timer.due;
      count += 1;
      this.invoke('timer ' + timer.due + 'ms', timer.callback, timer.args);
      this.flushMutations();
    }
    if (count >= 10000) throw new Error('timer 실행 한도 초과');
  }
}

function parseStyle(value) {
  const map = new Map();
  for (const part of String(value || '').split(';')) {
    const index = part.indexOf(':');
    if (index < 0) continue;
    const key = part.slice(0, index).trim();
    const item = part.slice(index + 1).trim();
    if (key) map.set(key, item);
  }
  return map;
}

function setOwnerDocument(node, document) {
  if (!node) return;
  node.ownerDocument = document;
  for (const child of node.childNodes || []) setOwnerDocument(child, document);
}

function coerceNode(value, document) {
  if (value && typeof value === 'object' && typeof value.nodeType === 'number') return value;
  return new VirtualText(document, String(value));
}

function descendants(node) {
  const output = [];
  for (const child of node.childNodes || []) {
    if (child.nodeType === 1) output.push(child);
    output.push.apply(output, descendants(child));
  }
  return output;
}

function serializeNode(node) {
  if (!node) return '';
  if (node.nodeType === 3) {
    const parent = node.parentElement;
    if (node.raw || (parent && (parent.tagName === 'STYLE' || parent.tagName === 'SCRIPT'))) {
      return node.data;
    }
    return escapeText(node.data);
  }
  if (node.nodeType === 11 || node.nodeType === 9) {
    return node.childNodes.map(serializeNode).join('');
  }
  const name = node.localName;
  let output = '<' + name;
  for (const entry of node.attributesMap) {
    const attribute = entry[0];
    const value = entry[1];
    if (BOOLEAN_ATTRIBUTES.has(attribute) && value === '') output += ' ' + attribute;
    else output += ' ' + attribute + '="' + escapeAttribute(value) + '"';
  }
  output += '>';
  if (VOID_ELEMENTS.has(name)) return output;
  output += node.childNodes.map(serializeNode).join('');
  output += '</' + name + '>';
  return output;
}

function findTagEnd(html, start) {
  let quote = '';
  for (let index = start + 1; index < html.length; index += 1) {
    const char = html[index];
    if (quote) {
      if (char === quote) quote = '';
    } else if (char === '"' || char === "'") {
      quote = char;
    } else if (char === '>') {
      return index;
    }
  }
  return html.length - 1;
}

function parseAttributeText(value) {
  const attributes = [];
  const source = String(value || '');
  const pattern = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>]+)))?/g;
  let match;
  while ((match = pattern.exec(source))) {
    const name = match[1];
    const item = match[2] !== undefined ? match[2] :
      match[3] !== undefined ? match[3] :
      match[4] !== undefined ? match[4] : '';
    attributes.push([name, decodeEntities(item)]);
  }
  return attributes;
}

function parseFragment(html, document) {
  const fragment = new VirtualFragment(document);
  const stack = [fragment];
  let index = 0;
  while (index < html.length) {
    const less = html.indexOf('<', index);
    if (less < 0) {
      appendParsedText(stack[stack.length - 1], html.slice(index), document);
      break;
    }
    if (less > index) appendParsedText(stack[stack.length - 1], html.slice(index, less), document);
    if (html.startsWith('<!--', less)) {
      const end = html.indexOf('-->', less + 4);
      index = end < 0 ? html.length : end + 3;
      continue;
    }
    if (html.startsWith('<!', less) || html.startsWith('<?', less)) {
      const end = findTagEnd(html, less);
      index = end + 1;
      continue;
    }
    const closing = html.slice(less).match(/^<\/\s*([A-Za-z][\w:-]*)[^>]*>/);
    if (closing) {
      const name = closing[1].toLowerCase();
      for (let cursor = stack.length - 1; cursor > 0; cursor -= 1) {
        const candidate = stack[cursor];
        stack.pop();
        if (candidate.localName === name) break;
      }
      index = less + closing[0].length;
      continue;
    }
    const opening = html.slice(less).match(/^<\s*([A-Za-z][\w:-]*)/);
    if (!opening) {
      appendParsedText(stack[stack.length - 1], '<', document);
      index = less + 1;
      continue;
    }
    const end = findTagEnd(html, less);
    const raw = html.slice(less + 1, end);
    const selfClosing = /\/\s*$/.test(raw);
    const tagMatch = raw.match(/^\s*([A-Za-z][\w:-]*)/);
    const name = tagMatch[1].toLowerCase();
    const attributeText = raw.slice(tagMatch[0].length).replace(/\/\s*$/, '');
    const element = new VirtualElement(document, name);
    for (const entry of parseAttributeText(attributeText)) {
      element.attributesMap.set(entry[0].toLowerCase(), entry[1]);
    }
    stack[stack.length - 1].appendChild(element);
    index = end + 1;
    if ((name === 'style' || name === 'script') && !selfClosing) {
      const closingPattern = new RegExp('</\\s*' + escapeRegExp(name) + '\\s*>', 'ig');
      closingPattern.lastIndex = index;
      const closeMatch = closingPattern.exec(html);
      const rawText = closeMatch ? html.slice(index, closeMatch.index) : html.slice(index);
      element.appendChild(new VirtualText(document, rawText, true));
      index = closeMatch ? closingPattern.lastIndex : html.length;
      continue;
    }
    if (!selfClosing && !VOID_ELEMENTS.has(name)) stack.push(element);
  }
  return fragment;
}

function appendParsedText(parent, value, document) {
  if (!value) return;
  parent.appendChild(new VirtualText(document, decodeEntities(value)));
}

function splitSelectorGroups(selector) {
  const output = [];
  let buffer = '';
  let square = 0;
  let round = 0;
  let quote = '';
  for (const char of String(selector || '')) {
    if (quote) {
      buffer += char;
      if (char === quote) quote = '';
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      buffer += char;
    } else if (char === '[') {
      square += 1;
      buffer += char;
    } else if (char === ']') {
      square -= 1;
      buffer += char;
    } else if (char === '(') {
      round += 1;
      buffer += char;
    } else if (char === ')') {
      round -= 1;
      buffer += char;
    } else if (char === ',' && square === 0 && round === 0) {
      if (buffer.trim()) output.push(buffer.trim());
      buffer = '';
    } else {
      buffer += char;
    }
  }
  if (buffer.trim()) output.push(buffer.trim());
  return output;
}

function parseComplexSelector(selector) {
  const parts = [];
  let buffer = '';
  let square = 0;
  let round = 0;
  let quote = '';
  let pending = null;
  const push = function() {
    const value = buffer.trim();
    if (!value) return;
    parts.push({ simple: value, combinator: parts.length ? pending || ' ' : null });
    buffer = '';
    pending = null;
  };
  const source = String(selector || '').trim();
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (quote) {
      buffer += char;
      if (char === quote) quote = '';
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      buffer += char;
    } else if (char === '[') {
      square += 1;
      buffer += char;
    } else if (char === ']') {
      square -= 1;
      buffer += char;
    } else if (char === '(') {
      round += 1;
      buffer += char;
    } else if (char === ')') {
      round -= 1;
      buffer += char;
    } else if (square === 0 && round === 0 && char === '>') {
      push();
      pending = '>';
    } else if (square === 0 && round === 0 && /\s/.test(char)) {
      push();
      if (pending !== '>') pending = ' ';
    } else {
      buffer += char;
    }
  }
  push();
  return parts;
}

function querySelectorAllFrom(root, selector, includeRoot) {
  const candidates = (includeRoot && root.nodeType === 1 ? [root] : []).concat(descendants(root));
  const groups = splitSelectorGroups(selector);
  const output = [];
  for (const candidate of candidates) {
    if (groups.some(function(group) {
      return matchesComplexSelector(candidate, group, root);
    }) && !output.includes(candidate)) output.push(candidate);
  }
  return output;
}

function matchesComplexSelector(element, selector, scope) {
  const parts = parseComplexSelector(selector);
  if (!parts.length || !matchSimpleSelector(element, parts[parts.length - 1].simple, scope)) return false;
  let current = element;
  for (let index = parts.length - 1; index > 0; index -= 1) {
    const combinator = parts[index].combinator;
    const wanted = parts[index - 1].simple;
    if (combinator === '>') {
      current = current.parentElement;
      if (!current || !matchSimpleSelector(current, wanted, scope)) return false;
    } else {
      let parent = current.parentElement;
      while (parent && !matchSimpleSelector(parent, wanted, scope)) parent = parent.parentElement;
      if (!parent) return false;
      current = parent;
    }
  }
  return true;
}

function readIdentifier(source, start) {
  let index = start;
  while (index < source.length && /[\w-]/.test(source[index])) index += 1;
  return { value: source.slice(start, index), end: index };
}

function readBalanced(source, start, open, close) {
  let depth = 0;
  let quote = '';
  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    if (quote) {
      if (char === quote) quote = '';
      continue;
    }
    if (char === '"' || char === "'") quote = char;
    else if (char === open) depth += 1;
    else if (char === close) {
      depth -= 1;
      if (depth === 0) return { value: source.slice(start + 1, index), end: index + 1 };
    }
  }
  return { value: source.slice(start + 1), end: source.length };
}

function matchSimpleSelector(element, selector, scope) {
  if (!element || element.nodeType !== 1) return false;
  const source = String(selector || '').trim();
  let index = 0;
  const tag = source.slice(index).match(/^([A-Za-z][\w-]*|\*)/);
  if (tag) {
    if (tag[1] !== '*' && element.localName !== tag[1].toLowerCase()) return false;
    index += tag[0].length;
  }
  while (index < source.length) {
    const char = source[index];
    if (char === '#') {
      const item = readIdentifier(source, index + 1);
      if (element.id !== item.value) return false;
      index = item.end;
    } else if (char === '.') {
      const item = readIdentifier(source, index + 1);
      if (!element.classList.contains(item.value)) return false;
      index = item.end;
    } else if (char === '[') {
      const item = readBalanced(source, index, '[', ']');
      if (!matchAttributeSelector(element, item.value)) return false;
      index = item.end;
    } else if (char === ':') {
      const item = readIdentifier(source, index + 1);
      index = item.end;
      let argument = null;
      if (source[index] === '(') {
        const balanced = readBalanced(source, index, '(', ')');
        argument = balanced.value;
        index = balanced.end;
      }
      if (!matchPseudo(element, item.value.toLowerCase(), argument, scope)) return false;
    } else {
      index += 1;
    }
  }
  return true;
}

function matchAttributeSelector(element, source) {
  const match = String(source).match(
    /^\s*([^\s~|^$*=\]]+)\s*(?:(\^=|\$=|\*=|~=|\|=|=)\s*(?:"([^"]*)"|'([^']*)'|([^\s]+)))?\s*$/
  );
  if (!match) return false;
  const name = match[1].toLowerCase();
  const operator = match[2];
  const expected = decodeEntities(
    match[3] !== undefined ? match[3] :
    match[4] !== undefined ? match[4] :
    match[5] !== undefined ? match[5] : ''
  );
  if (!operator) return element.hasAttribute(name);
  const actual = element.getAttribute(name);
  if (actual === null) return false;
  if (operator === '=') return actual === expected;
  if (operator === '^=') return actual.startsWith(expected);
  if (operator === '$=') return actual.endsWith(expected);
  if (operator === '*=') return actual.includes(expected);
  if (operator === '~=') return actual.split(/\s+/).includes(expected);
  if (operator === '|=') return actual === expected || actual.startsWith(expected + '-');
  return false;
}

function matchPseudo(element, name, argument, scope) {
  if (name === 'not') {
    return !splitSelectorGroups(argument).some(function(selector) {
      return matchesComplexSelector(element, selector, scope);
    });
  }
  if (name === 'is' || name === 'where') {
    return splitSelectorGroups(argument).some(function(selector) {
      return matchesComplexSelector(element, selector, scope);
    });
  }
  if (name === 'has') return Boolean(element.querySelector(argument));
  if (name === 'checked') return Boolean(element.checked);
  if (name === 'disabled') return Boolean(element.disabled);
  if (name === 'enabled') return !element.disabled;
  if (name === 'scope') return element === scope;
  if (name === 'first-child') return element.parentElement && element.parentElement.children[0] === element;
  if (name === 'last-child') {
    const siblings = element.parentElement ? element.parentElement.children : [];
    return siblings[siblings.length - 1] === element;
  }
  if (name === 'empty') return !element.childNodes.some(function(node) {
    return node.nodeType === 1 || (node.nodeType === 3 && node.textContent.trim());
  });
  if (name === 'nth-child') {
    if (!element.parentElement) return false;
    const position = element.parentElement.children.indexOf(element) + 1;
    const value = String(argument || '').trim().toLowerCase();
    if (value === 'odd') return position % 2 === 1;
    if (value === 'even') return position % 2 === 0;
    return position === Number(value);
  }
  return true;
}

function cssIdentifierEscape(value) {
  return String(value).replace(/([^\w-])/g, '\\$1');
}

function createMutationObserverClass(document) {
  return class VirtualMutationObserver {
    constructor(callback) {
      this.callback = callback;
      this.records = [];
      this.active = false;
      this.target = null;
      this.options = {};
      document._observers.add(this);
    }
    observe(target, options) {
      this.target = target;
      this.options = Object.assign({}, options || {});
      this.active = true;
    }
    disconnect() { this.active = false; this.records = []; }
    takeRecords() { return this.records.splice(0); }
  };
}

function createStorage() {
  const values = new Map();
  return {
    getItem: function(key) { return values.has(String(key)) ? values.get(String(key)) : null; },
    setItem: function(key, value) { values.set(String(key), String(value)); },
    removeItem: function(key) { values.delete(String(key)); },
    clear: function() { values.clear(); },
    key: function(index) { return Array.from(values.keys())[index] || null; },
    get length() { return values.size; }
  };
}

function extractRootBlock(html, id) {
  const pattern = new RegExp(
    '(<main\\b(?=[^>]*\\bid=["\\\']' + escapeRegExp(id) + '["\\\'])[^>]*>)([\\s\\S]*?)(</main>)',
    'i'
  );
  const match = pattern.exec(html);
  if (!match) return null;
  return { full: match[0], open: match[1], inner: match[2], close: match[3], index: match.index };
}

function extractElementBlock(html, tagName) {
  const pattern = new RegExp('(<'+ tagName + '\\b[^>]*>[\\s\\S]*?</' + tagName + '>)', 'i');
  const match = pattern.exec(html);
  return match ? match[1] : '';
}

function extractOpeningAttributes(html, tagName) {
  const pattern = new RegExp('<' + tagName + '\\b([^>]*)>', 'i');
  const match = pattern.exec(html);
  return match ? parseAttributeText(match[1]) : [];
}

function seedDocument(html, rootId, stats, reportError) {
  const document = new VirtualDocument(stats, reportError);
  for (const entry of extractOpeningAttributes(html, 'html')) {
    document.documentElement.attributesMap.set(entry[0].toLowerCase(), entry[1]);
  }
  for (const entry of extractOpeningAttributes(html, 'body')) {
    document.body.attributesMap.set(entry[0].toLowerCase(), entry[1]);
  }
  const titleMatch = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch) {
    const title = document.createElement('title');
    title.textContent = decodeEntities(titleMatch[1]);
    document.head.appendChild(title);
  }
  const descriptionMatch = html.match(/<meta\b(?=[^>]*\bname=["']description["'])[^>]*>/i);
  if (descriptionMatch) {
    const fragment = parseFragment(descriptionMatch[0], document);
    if (fragment.firstElementChild) document.head.appendChild(fragment.firstElementChild);
  }
  const scriptPattern = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let scriptMatch;
  while ((scriptMatch = scriptPattern.exec(html))) {
    const script = document.createElement('script');
    for (const entry of parseAttributeText(scriptMatch[1])) {
      script.attributesMap.set(entry[0].toLowerCase(), entry[1]);
    }
    document.head.appendChild(script);
  }
  const header = extractElementBlock(html, 'header');
  if (header) appendFragment(document.body, parseFragment(header, document));
  const rootBlock = extractRootBlock(html, rootId);
  if (!rootBlock) throw new Error('#' + rootId + ' main을 찾을 수 없습니다.');
  appendFragment(document.body, parseFragment(rootBlock.full, document));
  const footer = extractElementBlock(html, 'footer');
  if (footer) appendFragment(document.body, parseFragment(footer, document));
  return document;
}

function appendFragment(parent, fragment) {
  for (const child of fragment.childNodes.slice()) parent.appendChild(child);
}

function extractScriptTasks(html, mainIndex) {
  const tasks = [];
  const pattern = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = pattern.exec(html))) {
    const attributes = new Map(parseAttributeText(match[1]).map(function(entry) {
      return [entry[0].toLowerCase(), entry[1]];
    }));
    const src = attributes.get('src') || '';
    const type = (attributes.get('type') || '').toLowerCase();
    if (type === 'application/ld+json') continue;
    if (src) {
      if (!src.startsWith('/js/')) continue;
      if (src === SITE_AUDIT_PATH || src === '/js/calculator-content.js') {
        tasks.push({ kind: 'excluded', src: src, position: match.index });
        continue;
      }
      tasks.push({
        kind: attributes.has('defer') ? 'defer' : 'immediate-src',
        src: src,
        position: match.index
      });
    } else if (match.index > mainIndex && match[2].trim()) {
      tasks.push({ kind: 'inline', code: match[2], position: match.index });
    }
  }
  return tasks;
}

function createRuntime(document, pathname, errors, logs) {
  let scheduler;
  let windowObject;
  const reportError = function(stage, error) {
    errors.push({
      stage: stage,
      message: error && error.stack ? error.stack.split('\n').slice(0, 4).join('\n') : String(error)
    });
  };
  document.reportError = reportError;
  const invoke = function(stage, callback, args) {
    if (typeof callback !== 'function') return;
    try {
      callback.apply(windowObject, args || []);
    } catch (error) {
      reportError(stage, error);
    }
  };
  scheduler = new Scheduler(invoke, function() { document.flushMutations(); });
  windowObject = new EventHub();
  const location = {
    origin: 'https://calculatepage.com',
    protocol: 'https:',
    host: 'calculatepage.com',
    hostname: 'calculatepage.com',
    pathname: pathname,
    search: '',
    hash: '',
    href: 'https://calculatepage.com' + pathname,
    assign: function(value) { this.href = String(value); },
    replace: function(value) { this.href = String(value); },
    reload: function() {}
  };
  const consoleProxy = {
    log: function() { logs.push(Array.from(arguments).join(' ')); },
    info: function() { logs.push(Array.from(arguments).join(' ')); },
    warn: function() { logs.push('WARN ' + Array.from(arguments).join(' ')); },
    error: function() { logs.push('ERROR ' + Array.from(arguments).join(' ')); }
  };
  Object.assign(windowObject, {
    window: windowObject,
    self: windowObject,
    globalThis: windowObject,
    document: document,
    location: location,
    navigator: {
      language: 'ko-KR',
      userAgent: 'CalculatePagePrerender/1.0',
      clipboard: { writeText: function() { return Promise.resolve(); } }
    },
    console: consoleProxy,
    Event: VirtualEvent,
    CustomEvent: VirtualEvent,
    Node: { ELEMENT_NODE: 1, TEXT_NODE: 3, DOCUMENT_NODE: 9, DOCUMENT_FRAGMENT_NODE: 11 },
    Element: VirtualElement,
    HTMLElement: VirtualElement,
    MutationObserver: createMutationObserverClass(document),
    IntersectionObserver: class { observe() {} unobserve() {} disconnect() {} },
    ResizeObserver: class { observe() {} unobserve() {} disconnect() {} },
    setTimeout: scheduler.setTimeout.bind(scheduler),
    clearTimeout: scheduler.clearTimeout.bind(scheduler),
    setInterval: scheduler.setTimeout.bind(scheduler),
    clearInterval: scheduler.clearTimeout.bind(scheduler),
    queueMicrotask: function(callback) { return scheduler.setTimeout(callback, 0); },
    requestAnimationFrame: function(callback) {
      return scheduler.setTimeout(function() { callback(scheduler.now); }, 16);
    },
    cancelAnimationFrame: scheduler.clearTimeout.bind(scheduler),
    getComputedStyle: function() {
      return { display: 'block', visibility: 'visible', getPropertyValue: function() { return ''; } };
    },
    localStorage: createStorage(),
    sessionStorage: createStorage(),
    history: { pushState: function() {}, replaceState: function() {} },
    performance: { now: function() { return scheduler.now; } },
    matchMedia: function() {
      return { matches: false, addEventListener: function() {}, removeEventListener: function() {} };
    },
    alert: function() {},
    confirm: function() { return true; },
    prompt: function() { return null; },
    fetch: function() {
      return Promise.resolve({ ok: false, status: 404, json: function() { return Promise.resolve({}); } });
    },
    atob: function(value) { return Buffer.from(String(value), 'base64').toString('binary'); },
    btoa: function(value) { return Buffer.from(String(value), 'binary').toString('base64'); },
    URL: URL,
    URLSearchParams: URLSearchParams,
    Intl: Intl,
    Date: Date,
    Math: Math,
    JSON: JSON,
    Number: Number,
    String: String,
    Boolean: Boolean,
    Array: Array,
    Object: Object,
    RegExp: RegExp,
    Map: Map,
    Set: Set,
    WeakMap: WeakMap,
    WeakSet: WeakSet,
    Promise: Promise,
    parseInt: parseInt,
    parseFloat: parseFloat,
    isNaN: isNaN,
    isFinite: isFinite,
    CSS: { escape: cssIdentifierEscape }
  });
  return { windowObject: windowObject, scheduler: scheduler, reportError: reportError };
}

function snapshotRuntimeRoot(root) {
  if (!root) return { markup: '', controls: '' };
  const markup = root.childNodes.map(function(node) { return serializeNode(node); }).join('');
  const controls = root.querySelectorAll('input, select, textarea').map(function(control) {
    const id = control.id || '';
    const type = control.type || control.tagName.toLowerCase();
    const value = control.value || '';
    const checked = control.checked ? '1' : '0';
    return [control.tagName, id, type, value, checked].join('|');
  }).join('\n');
  return { markup: markup, controls: controls };
}

async function executePageScripts(html, filePath, rootId) {
  const errors = [];
  const logs = [];
  const stats = {
    rootAssignments: 0,
    targetMutations: 0,
    scriptsRun: 0,
    legacyScriptsExcluded: 0
  };
  const rootBlock = extractRootBlock(html, rootId);
  const pathname = '/' + path.relative(PROJECT_ROOT, filePath).split(path.sep).join('/');
  let runtime;
  let document;
  try {
    document = seedDocument(html, rootId, stats, function(stage, error) {
      errors.push({ stage: stage, message: String(error && error.message ? error.message : error) });
    });
    runtime = createRuntime(document, pathname, errors, logs);
  } catch (error) {
    return { document: null, errors: [{ stage: 'DOM seed', message: error.message }], logs: logs, stats: stats };
  }
  const initialSnapshot = snapshotRuntimeRoot(document.querySelector('#' + rootId));
  const context = vm.createContext(runtime.windowObject, {
    name: 'prerender:' + path.basename(filePath),
    codeGeneration: { strings: true, wasm: false }
  });
  const tasks = extractScriptTasks(html, rootBlock.index);
  const immediate = tasks.filter(function(task) {
    return task.kind === 'inline' || task.kind === 'immediate-src';
  }).sort(function(left, right) { return left.position - right.position; });
  const deferred = tasks.filter(function(task) {
    return task.kind === 'defer';
  }).sort(function(left, right) { return left.position - right.position; });
  stats.legacyScriptsExcluded = tasks.filter(function(task) {
    return task.kind === 'excluded';
  }).length;
  const runCode = function(code, filename, stage) {
    try {
      vm.runInContext(code, context, { filename: filename, timeout: 2000 });
      stats.scriptsRun += 1;
    } catch (error) {
      errors.push({
        stage: stage,
        message: error && error.stack ? error.stack.split('\n').slice(0, 5).join('\n') : String(error)
      });
    }
    document.flushMutations();
  };
  const runTask = async function(task) {
    if (task.kind === 'inline') {
      runCode(task.code, filePath + ':inline', 'inline script');
      return;
    }
    const resolved = path.resolve(PROJECT_ROOT, '.' + task.src);
    if (!resolved.startsWith(PROJECT_ROOT + path.sep)) {
      errors.push({ stage: task.src, message: '프로젝트 외부 스크립트 경로입니다.' });
      return;
    }
    try {
      const code = await readFile(resolved, 'utf8');
      runCode(code, resolved, task.src);
    } catch (error) {
      errors.push({ stage: task.src, message: error.message });
    }
  };
  for (const task of immediate) await runTask(task);
  for (const task of deferred) await runTask(task);
  document.readyState = 'interactive';
  try {
    document.dispatchEvent(new VirtualEvent('DOMContentLoaded'));
    runtime.windowObject.dispatchEvent(new VirtualEvent('DOMContentLoaded'));
  } catch (error) {
    runtime.reportError('DOMContentLoaded', error);
  }
  document.flushMutations();
  document.readyState = 'complete';
  try {
    runtime.windowObject.dispatchEvent(new VirtualEvent('load'));
  } catch (error) {
    runtime.reportError('load', error);
  }
  document.flushMutations();
  try {
    runtime.scheduler.drain(5000);
  } catch (error) {
    errors.push({ stage: 'timers', message: error.message });
  }
  const finalSnapshot = snapshotRuntimeRoot(document.querySelector('#' + rootId));
  stats.runtimeLayoutChanged = initialSnapshot.markup !== finalSnapshot.markup;
  stats.runtimeControlStateChanged = initialSnapshot.controls !== finalSnapshot.controls;
  return {
    document: document,
    errors: errors,
    logs: logs,
    stats: stats,
    initialSnapshot: initialSnapshot,
    finalSnapshot: finalSnapshot
  };
}

async function loadEditorialCatalogue() {
  const source = await readFile(BASE_EDITORIAL_SCRIPT, 'utf8');
  const assignment = source.indexOf('const content=');
  const dataUse = source.indexOf('const data=content[slug]');
  if (assignment < 0 || dataUse < 0) {
    throw new Error('calculator-content.js에서 editorial catalogue를 찾지 못했습니다.');
  }
  const objectStart = source.indexOf('{', assignment);
  const objectEnd = source.lastIndexOf('};', dataUse);
  if (objectStart < 0 || objectEnd < objectStart) {
    throw new Error('calculator-content.js editorial object 범위를 해석하지 못했습니다.');
  }
  const literal = source.slice(objectStart, objectEnd + 1);
  const base = vm.runInNewContext('(' + literal + ')', {
    official: function(label, url) { return [label, url]; }
  }, { filename: BASE_EDITORIAL_SCRIPT, timeout: 1000 });
  const catalogue = Object.assign({}, base);
  const names = (await readdir(SCRIPT_DIR))
    .filter(function(name) { return /^editorial-.*\.mjs$/i.test(name); })
    .sort(function(left, right) { return left.localeCompare(right, 'en'); });
  let overrideCount = 0;
  for (const name of names) {
    const module = await import(pathToFileURL(path.join(SCRIPT_DIR, name)).href);
    const entries = module.default;
    if (!entries || typeof entries !== 'object' || Array.isArray(entries)) {
      throw new Error(name + '의 default export는 slug 객체여야 합니다.');
    }
    for (const entry of Object.entries(entries)) {
      if (catalogue[entry[0]]) overrideCount += 1;
      catalogue[entry[0]] = Object.assign({}, catalogue[entry[0]] || {}, entry[1]);
    }
  }
  return {
    catalogue: catalogue,
    baseCount: Object.keys(base).length,
    pluginFiles: names,
    overrideCount: overrideCount
  };
}

const CATEGORY_RELATED_LINKS = {
  money: [
    ['예금 이자 계산기', '/calculators/savings-interest.html'],
    ['대출 이자 계산기', '/calculators/loan-interest.html'],
    ['월급 실수령액 계산기', '/calculators/salary.html']
  ],
  education: [
    ['학점 계산기', '/calculators/gpa.html'],
    ['내신 등급 계산기', '/calculators/school-grade.html'],
    ['시험 D-day 계산기', '/calculators/exam-dday.html']
  ],
  health: [
    ['BMI 계산기', '/calculators/bmi.html'],
    ['기초대사량 계산기', '/calculators/bmr.html'],
    ['운동 칼로리 계산기', '/calculators/exercise-calorie.html']
  ],
  life: [
    ['날짜 계산기', '/calculators/date.html'],
    ['디데이 계산기', '/calculators/d-day.html'],
    ['나이 계산기', '/calculators/age.html']
  ],
  business: [
    ['부가세 계산기', '/calculators/vat.html'],
    ['마진율 계산기', '/calculators/margin.html'],
    ['견적 계산기', '/calculators/estimate.html']
  ],
  conversion: [
    ['단위 변환 계산기', '/calculators/unit.html'],
    ['길이 단위 변환', '/calculators/length-conversion.html'],
    ['무게 단위 변환', '/calculators/weight-conversion.html']
  ]
};

function inferredRelated(root, slug) {
  const categoryLink = root.querySelectorAll('a').find(function(link) {
    return /\/categories\/[a-z-]+\.html(?:$|[?#])/i.test(link.getAttribute('href') || '');
  }) || root.querySelector('.calculator-home');
  const categoryHref = categoryLink && categoryLink.getAttribute('href') || '';
  const categoryMatch = categoryHref.match(/\/categories\/([a-z-]+)\.html/i);
  const category = categoryMatch ? categoryMatch[1] : 'money';
  const links = CATEGORY_RELATED_LINKS[category] || CATEGORY_RELATED_LINKS.money;
  return links.filter(function(link) {
    return !link[1].endsWith('/' + slug + '.html');
  }).slice(0, 3);
}

function editorialMarkup(slug, data, relatedLinks) {
  const list = function(items) {
    return '<ul>' + items.map(function(item) {
      return '<li>' + escapeText(item) + '</li>';
    }).join('') + '</ul>';
  };
  const orderedList = function(items) {
    return '<ol>' + items.map(function(item) {
      return '<li>' + escapeText(item) + '</li>';
    }).join('') + '</ol>';
  };
  const useCases = Array.isArray(data.useCases) && data.useCases.length ?
    '<section class="content-block editorial-use-cases"><h2>이 계산기가 유용한 상황</h2>' +
      list(data.useCases) + '</section>' : '';
  const checks = Array.isArray(data.checks) && data.checks.length ?
    '<section class="content-block editorial-checks"><h2>계산 전후 확인할 점</h2>' +
      orderedList(data.checks) + '</section>' : '';
  const sources = Array.isArray(data.sources) && data.sources.length ?
    '<section class="content-block editorial-sources"><h2>공식 기준 확인</h2><ul>' +
      data.sources.map(function(source) {
        return '<li><a href="' + escapeAttribute(source[1]) +
          '" target="_blank" rel="noopener noreferrer">' +
          escapeText(source[0]) + '</a></li>';
      }).join('') + '</ul></section>' : '';
  const related = relatedLinks && relatedLinks.length ?
    '<section class="content-block"><h2>관련 계산기</h2><div class="related">' +
      relatedLinks.map(function(link) {
        return '<a href="' + escapeAttribute(link[1]) + '">' + escapeText(link[0]) + '</a>';
      }).join('') + '</div></section>' : '';
  const detail = Array.isArray(data.detail) && data.detail.length ?
    '<section class="content-block editorial-detail"><h2>' +
      escapeText(data.detailTitle || '계산 결과를 읽는 방법') + '</h2><ul>' +
      data.detail.map(function(item) { return '<li>' + escapeText(item) + '</li>'; }).join('') +
      '</ul></section>' : '';
  const faq = Array.isArray(data.faq) && data.faq.length ?
    '<section class="content-block editorial-faq"><h2>자주 묻는 질문</h2>' +
      data.faq.map(function(item) {
        return '<details><summary>' + escapeText(item[0]) + '</summary><p>' + escapeText(item[1]) + '</p></details>';
      }).join('') + '</section>' : '';
  const reviewed = data.reviewed ?
    '<aside class="editorial-review" aria-label="콘텐츠 검수 정보"><strong>콘텐츠 검수 정보</strong>' +
      '<span>최종 내용 검토: ' + escapeText(data.reviewed) + '</span>' +
      '<span>검토 범위: 계산식·입력 조건·예시 결과·주의사항</span>' +
      '<a href="/pages/methodology.html">검수 기준 보기</a></aside>' : '';
  return '<div class="calculator-editorial" data-calculator-editorial="' +
    escapeAttribute(slug) + '">' +
    '<section class="content-block editorial-input"><h2>입력 항목 설명</h2>' +
    list(data.input || []) + '</section>' + useCases +
    '<section class="content-block editorial-formula"><h2>계산 공식</h2><p>' +
    escapeText(data.formula || '') + '</p></section>' +
    '<section class="content-block editorial-example"><h2>계산 예시</h2><p>' +
    escapeText(data.example || '') + '</p></section>' +
    '<section class="content-block editorial-result"><h2>결과 해석</h2><p>' +
    escapeText(data.result || '') + '</p></section>' +
    checks + '<section class="content-block editorial-caution"><h2>주의사항</h2>' +
    list(data.cautions || []) + '</section>' + detail + faq + sources + reviewed + related + '</div>';
}

function mergeEditorial(root, slug, data) {
  root.querySelectorAll('[data-calculator-editorial]').forEach(function(element) {
    element.remove();
  });
  if (!data) return false;
  const relatedLinks = Array.isArray(data.related) && data.related.length ?
    data.related : inferredRelated(root, slug);
  const markup = editorialMarkup(slug, data,
    root.querySelector('.related') ? [] : relatedLinks);
  const related = root.querySelectorAll('.content-block').find(function(section) {
    const heading = section.querySelector('h2');
    return heading && heading.textContent.trim() === '관련 계산기';
  });
  if (related) related.insertAdjacentHTML('beforebegin', markup);
  else root.insertAdjacentHTML('beforeend', markup);
  return true;
}

function normalizeStaticInputs(root) {
  let normalizedValues = 0;
  let normalizedNumbers = 0;
  for (const input of root.querySelectorAll('input')) {
    const typeAttribute = (input.getAttribute('type') || 'text').toLowerCase();
    if (typeAttribute === 'number' || typeAttribute === 'text') {
      const attributeValue = input.getAttribute('value');
      if (attributeValue !== null && attributeValue !== '') {
        if (!input.placeholder) input.placeholder = '예: ' + attributeValue;
        input.removeAttribute('value');
        input._value = '';
        input._valueSet = true;
        normalizedValues += 1;
      }
    }
    if (typeAttribute === 'number') {
      if (!input.step) input.step = 'any';
      if (!input.inputMode) input.inputMode = input.step === '1' ? 'numeric' : 'decimal';
      normalizedNumbers += 1;
    }
    if (input.placeholder) {
      const next = input.placeholder
        .replace(/^ex\)\s*/i, '예: ')
        .replace(/^예[):]?\s*/, '예: ');
      if (next !== input.placeholder) input.placeholder = next;
    }
    if (input._checkedSet) {
      if (input.checked) input.setAttribute('checked', '');
      else input.removeAttribute('checked');
    }
  }
  for (const select of root.querySelectorAll('select')) {
    if (select._selectedIndex === null) continue;
    select.options.forEach(function(option, index) {
      if (index === select.selectedIndex) option.setAttribute('selected', '');
      else option.removeAttribute('selected');
    });
  }
  return { values: normalizedValues, numbers: normalizedNumbers };
}

function stripRuntimeState(root) {
  const elements = [root].concat(descendants(root));
  for (const element of elements) {
    for (const attribute of RUNTIME_DATA_ATTRIBUTES) element.removeAttribute(attribute);
  }
}

function countDuplicateIds(root) {
  const ids = new Map();
  for (const element of [root].concat(descendants(root))) {
    if (!element.id) continue;
    ids.set(element.id, (ids.get(element.id) || 0) + 1);
  }
  return Array.from(ids).filter(function(entry) { return entry[1] > 1; });
}

function formatVirtualRoot(root, eol) {
  const opening = serializeOpeningTag(root);
  const lines = root.innerHTML.split(/\r?\n/);
  while (lines.length && !lines[0].trim()) lines.shift();
  while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
  if (!lines.length) return opening + '</' + root.localName + '>';
  const normalized = [];
  let previousBlank = false;
  for (const line of lines) {
    if (!line.trim()) {
      if (!previousBlank) normalized.push('');
      previousBlank = true;
      continue;
    }
    previousBlank = false;
    const trimmed = line.replace(/\s+$/, '');
    normalized.push(/^(?: {2}|\t)/.test(trimmed) ? trimmed : '  ' + trimmed);
  }
  const indented = normalized.join(eol);
  return opening + eol + indented + eol + '</' + root.localName + '>';
}

function serializeOpeningTag(element) {
  let output = '<' + element.localName;
  for (const entry of element.attributesMap) {
    if (BOOLEAN_ATTRIBUTES.has(entry[0]) && entry[1] === '') output += ' ' + entry[0];
    else output += ' ' + entry[0] + '="' + escapeAttribute(entry[1]) + '"';
  }
  return output + '>';
}

function addStaticMarkers(root, kind) {
  root.setAttribute('data-static-rendered', 'true');
  if (kind === 'calculator') root.setAttribute('data-static-calculator', 'true');
}

function materializeStaticPage(originalBlock, root, eol) {
  let output = addAttributesToOpeningTag(originalBlock, {
    'data-static-rendered': 'true',
    'data-static-calculator': 'true'
  });
  for (const id of ['cpm-rows', 'jlpt-fields']) {
    const virtual = root.querySelector('#' + id);
    if (!virtual || !virtual.innerHTML.trim()) continue;
    const pattern = new RegExp(
      '(<([A-Za-z][\\w:-]*)\\b(?=[^>]*\\bid=["\\\']' + escapeRegExp(id) +
      '["\\\'])[^>]*>)([\\s\\S]*?)(</\\2>)',
      'i'
    );
    output = output.replace(pattern, function(full, open, tag, current, close) {
      if (current.trim()) return full;
      const content = virtual.innerHTML.trim().split(/\r?\n/).map(function(line) {
        return '      ' + line.trimEnd();
      }).join(eol);
      return open + eol + content + eol + '    ' + close;
    });
  }
  const editorial = root.querySelector('[data-calculator-editorial]');
  if (editorial) {
    const replacement = editorial.outerHTML;
    const existing = /<div\b(?=[^>]*\bdata-calculator-editorial=["'][^"']+["'])[^>]*>[\s\S]*?<\/div>/i;
    if (existing.test(output)) {
      output = output.replace(existing, replacement);
    } else {
      const related = /(?=<section\b[^>]*class=["'][^"']*\bcontent-block\b[^"']*["'][^>]*>\s*<h2[^>]*>\s*관련 계산기\s*<\/h2>)/i;
      if (related.test(output)) output = output.replace(related, replacement + eol + '    ');
      else output = output.replace(/<\/main>$/i, replacement + eol + '</main>');
    }
  }

  // Preserve the hand-authored shell while mirroring deterministic startup
  // state and accessibility metadata into the initial document.
  output = syncStaticOpeningTags(output, root, 'table');
  output = syncStaticOpeningTags(output, root, 'th');
  output = syncStaticElementById(output, root, 'cpm-result');
  output = syncStaticElementById(output, root, 'jlpt-result');
  output = syncStaticElementById(output, root, 'jlpt-field-note');
  output = syncStaticElementByClass(
    output,
    root,
    '.cpm-actions .calculator-note',
    'calculator-note'
  );
  return output;
}

function syncStaticOpeningTags(output, root, tagName) {
  const elements = root.querySelectorAll(tagName);
  let index = 0;
  const pattern = new RegExp('<' + escapeRegExp(tagName) + '\\b[^>]*>', 'gi');
  return output.replace(pattern, function(openingTag) {
    const element = elements[index];
    index += 1;
    return element ? serializeOpeningTag(element) : openingTag;
  });
}

function syncStaticElementById(output, root, id) {
  const element = root.querySelector('#' + id);
  if (!element) return output;
  const tagName = escapeRegExp(element.localName);
  const pattern = new RegExp(
    '<' + tagName + '\\b(?=[^>]*\\bid=["\']' + escapeRegExp(id) +
      '["\'])[^>]*>[\\s\\S]*?<\\/' + tagName + '>',
    'i'
  );
  return output.replace(pattern, element.outerHTML);
}

function syncStaticElementByClass(output, root, selector, className) {
  const element = root.querySelector(selector);
  if (!element) return output;
  const tagName = escapeRegExp(element.localName);
  const pattern = new RegExp(
    '<' + tagName + '\\b(?=[^>]*\\bclass=["\'][^"\']*\\b' +
      escapeRegExp(className) + '\\b[^"\']*["\'])[^>]*>[\\s\\S]*?<\\/' +
      tagName + '>',
    'i'
  );
  return output.replace(pattern, element.outerHTML);
}

function addAttributesToOpeningTag(block, attributes) {
  return block.replace(/^<main\b([^>]*)>/i, function(full, current) {
    let output = '<main' + current;
    for (const entry of Object.entries(attributes)) {
      const pattern = new RegExp('\\s' + escapeRegExp(entry[0]) + '\\s*=', 'i');
      if (!pattern.test(output)) output += ' ' + entry[0] + '="' + entry[1] + '"';
    }
    return output + '>';
  });
}

function removeEmptyStaticGuideBootstrap(html, originalRootInner) {
  const intro = String(originalRootInner || '').match(
    /<section\b(?=[^>]*class=["'][^"']*\bstatic-calculator-intro\b[^"']*["'])[^>]*>([\s\S]*?)<\/section>/i
  );
  if (!intro) return { html: html, removed: 0, skipped: 0 };
  const remainder = intro[1]
    .replace(/<h1\b[\s\S]*?<\/h1>/i, '')
    .replace(/<p\b[^>]*class=["'][^"']*\blead\b[^"']*["'][^>]*>[\s\S]*?<\/p>/i, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, '');
  if (remainder) return { html: html, removed: 0, skipped: 1 };
  let removed = 0;
  const output = html.replace(/<script\b(?![^>]*\bsrc=)[^>]*>[\s\S]*?<\/script>/gi, function(script) {
    if (!script.includes('__staticCalculatorGuide') ||
        !script.includes('static-calculator-intro')) return script;
    removed += 1;
    return '';
  });
  return { html: output, removed: removed, skipped: 0 };
}

function removeLegacyScriptReferences(html) {
  let removed = 0;
  const output = html.replace(
    /[ \t]*<script\b(?=[^>]*\bsrc=["']\/js\/(?:site-audit-fix|calculator-content)\.js["'])[^>]*>\s*<\/script>[ \t]*(?:\r?\n)?/gi,
    function() {
      removed += 1;
      return '';
    }
  );
  return { html: output, removed: removed };
}

function ensureStaticRuntimeScript(html) {
  if (/\bsrc=["']\/js\/static-calculator-runtime\.js["']/i.test(html)) return html;
  const tag = '<script defer src="/js/static-calculator-runtime.js"></script>';
  const localScript = /<script\b(?=[^>]*\bsrc=["']\/js\/)[^>]*>\s*<\/script>/i;
  if (localScript.test(html)) return html.replace(localScript, tag + '$&');
  return html.replace(/<\/head>/i, tag + '</head>');
}

function addScenarioComparisonPanel(root, slug) {
  const markup = SCENARIO_COMPARISON_PANELS[slug];
  if (!markup || root.querySelector('[data-scenario-panel]')) return false;
  const editorial = root.querySelector('[data-calculator-editorial]');
  if (editorial) editorial.insertAdjacentHTML('beforebegin', markup);
  else root.insertAdjacentHTML('beforeend', markup);
  return true;
}

function ensureScenarioComparisonAssets(html, slug, eol) {
  if (!SCENARIO_COMPARISON_PANELS[slug]) return html;
  let output = html;
  if (!/href=["']\/css\/scenario-comparisons\.css["']/i.test(output)) {
    const style = /<link\b(?=[^>]*\bhref=["']\/css\/style\.css["'])[^>]*>/i;
    const tag = '<link rel="stylesheet" href="/css/scenario-comparisons.css">';
    output = style.test(output)
      ? output.replace(style, match => match + eol + '  ' + tag + eol)
      : output.replace(/<\/head>/i, '  ' + tag + eol + '</head>');
  }
  output = output.replace(
    /(<link\b(?=[^>]*\bhref=["']\/css\/scenario-comparisons\.css["'])[^>]*>)[ \t]*(?=<script)/i,
    '$1' + eol
  );
  if (!/src=["']\/js\/scenario-comparisons\.js["']/i.test(output)) {
    output = output.replace(/<\/head>/i,
      '  <script defer src="/js/scenario-comparisons.js"></script>' + eol + '</head>');
  }
  return output;
}

const CALCULATOR_HEADER_NAV = '<nav aria-label="계산기 카테고리"><a href="/categories/money.html">금융</a><a href="/categories/education.html">교육</a><a href="/categories/health.html">건강</a><a href="/categories/life.html">생활</a><a href="/categories/business.html">업무</a><a href="/categories/conversion.html">단위환산</a></nav>';

function ensureCalculatorHeaderNavigation(html) {
  const headerPattern = /<header\b(?=[^>]*\bclass=["'][^"']*\bsite-header\b[^"']*["'])[^>]*>[\s\S]*?<\/header>/i;
  if (!headerPattern.test(html)) {
    return html.replace(/(<body\b[^>]*>)/i, '$1<header class="site-header"><a class="logo" href="/">계산페이지</a>' + CALCULATOR_HEADER_NAV + '</header>');
  }
  return html.replace(headerPattern, function(header) {
    if (/<nav\b/i.test(header)) return header;
    return header.replace(/<\/header>$/i, CALCULATOR_HEADER_NAV + '</header>');
  });
}

function ensureTrustFooter(html) {
  const footerPattern = /<footer\b[^>]*>[\s\S]*?<\/footer>/i;
  if (!footerPattern.test(html)) return html;
  return html.replace(footerPattern, function(footer) {
    if (/href=["']\/pages\/methodology\.html["']/i.test(footer)) return footer;
    const about = /(<a\b[^>]*href=["']\/pages\/about\.html["'][^>]*>[\s\S]*?<\/a>)/i;
    if (about.test(footer)) {
      return footer.replace(about, '$1<a href="/pages/methodology.html">검수 기준</a>');
    }
    return footer.replace(/<\/footer>$/i,
      '<a href="/pages/methodology.html">검수 기준</a></footer>');
  });
}

function normalizeStaticCopy(html) {
  return html.replace(
    /<h([2-4])\b([^>]*)>([^<]*?)언제\s*쓰면\s*좋나요\?\s*<\/h\1>/gi,
    function(_, level, attributes, prefix) {
      return '<h' + level + attributes + '>' + prefix.trim() + ' 활용 방법</h' + level + '>';
    }
  ).replaceAll('2026년 7월 10일', '2026년 7월 11일')
    .replaceAll('몸무게, 운동 강도, 시간을 입력해 예상 운동 소모 칼로리를 계산합니다.', '몸무게, 운동 종류, 시간을 입력해 예상 운동 소모 칼로리를 계산합니다.')
    .replaceAll('실제 소모량은 운동 강도, 체성분, 심박수에 따라 달라집니다.', '선택한 운동 종류 안에서도 실제 속도, 휴식, 체성분과 심박수에 따라 소모량이 달라집니다.')
    .replaceAll('여러 과목 점수를 입력해 단순 평균 또는 가중 평균을 계산합니다.', '여러 점수를 입력해 단순 산술평균을 계산합니다.')
    .replaceAll('평균 점수 계산기 · 가중 평균 | 계산페이지', '평균 점수 계산기 | 단순 산술평균 계산 | 계산페이지')
    .replaceAll('과목별 점수를 입력해 단순 평균과 가중 평균을 계산하고 시험·과제 점수 흐름을 확인하세요.', '여러 점수를 입력해 단순 산술평균을 계산하고 시험·과제 점수의 평균을 확인하세요.')
    .replace(/\r?\n[ \t]+(?=\r?\n)/g, '\n');
}

function guardStaticInlineInitializers(html, filename) {
  if (filename !== 'cpm.html') return { html: html, guarded: 0 };
  if (/if\s*\(\s*!tbody\.children\.length\s*\)\s*addRow\(\)/.test(html)) {
    return { html: html, guarded: 0 };
  }
  let guarded = 0;
  const output = html.replace(
    /(^[ \t]*)addRow\(\);([ \t]*\r?\n[ \t]*syncAllRows\(\);)/m,
    function(_, indentation, tail) {
      guarded += 1;
      return indentation + 'if(!tbody.children.length) addRow();' + tail;
    }
  );
  return { html: output, guarded: guarded };
}

function validateRoot(root, kind) {
  const errors = [];
  const warnings = [];
  const h1Count = root.querySelectorAll('h1').length;
  if (h1Count !== 1) errors.push('H1 개수가 ' + h1Count + '개입니다.');
  const duplicateIds = countDuplicateIds(root);
  if (duplicateIds.length) {
    errors.push('중복 ID: ' + duplicateIds.map(function(entry) {
      return entry[0] + '(' + entry[1] + ')';
    }).join(', '));
  }
  if (/\b(?:undefined|NaN|Infinity)\b/.test(root.innerHTML)) {
    errors.push('정적 마크업에 undefined/NaN/Infinity가 포함됐습니다.');
  }
  if (kind === 'calculator') {
    if (!root.querySelector('.calculator-box')) errors.push('.calculator-box가 없습니다.');
    if (!root.querySelector('input, select, textarea')) warnings.push('정적 입력 컨트롤이 없습니다.');
    if (!root.querySelector('.related')) warnings.push('관련 계산기 영역이 없습니다.');
  } else {
    for (const selector of [
      '.category-featured',
      '.category-purpose',
      '.category-comparison',
      '.category-guide',
      '.category-faq'
    ]) {
      if (!root.querySelector(selector)) warnings.push(selector + ' 영역이 없습니다.');
    }
  }
  return { errors: errors, warnings: warnings };
}

async function renderArtifact(filePath, kind, catalogue) {
  const filename = path.basename(filePath);
  const slug = filename.replace(/\.html$/i, '');
  const rawBuffer = await readFile(filePath);
  const raw = rawBuffer.toString('utf8');
  const hasBom = raw.startsWith('\uFEFF');
  const html = hasBom ? raw.slice(1) : raw;
  const eol = html.includes('\r\n') ? '\r\n' : '\n';
  const rootId = kind === 'calculator' ? 'calculator' : 'category';
  const originalRoot = extractRootBlock(html, rootId);
  if (!originalRoot) {
    return {
      filePath: filePath, filename: filename, slug: slug, kind: kind,
      changed: false, errors: ['원본 #' + rootId + ' main을 찾을 수 없습니다.'], warnings: []
    };
  }
  const executableHtml = kind === 'calculator' ? ensureStaticRuntimeScript(html) : html;
  const execution = await executePageScripts(executableHtml, filePath, rootId);
  const errors = execution.errors.map(function(item) {
    return item.stage + ': ' + item.message;
  });
  const warnings = [];
  if (!execution.document) {
    return {
      filePath: filePath, filename: filename, slug: slug, kind: kind,
      changed: false, errors: errors, warnings: warnings, stats: execution.stats
    };
  }
  const root = execution.document.querySelector('#' + rootId);
  if (!root) {
    errors.push('실행 후 #' + rootId + '가 사라졌습니다.');
    return {
      filePath: filePath, filename: filename, slug: slug, kind: kind,
      changed: false, errors: errors, warnings: warnings, stats: execution.stats
    };
  }
  if (kind === 'calculator' && root.insertAdjacentHTML !== VirtualElement.prototype.insertAdjacentHTML) {
    root.insertAdjacentHTML = VirtualElement.prototype.insertAdjacentHTML.bind(root);
  }
  let editorial = false;
  if (kind === 'calculator') {
    const data = catalogue[slug];
    if (!data) errors.push('editorial catalogue에 slug가 없습니다: ' + slug);
    else editorial = mergeEditorial(root, slug, data);
    addScenarioComparisonPanel(root, slug);
  }
  const inputStats = normalizeStaticInputs(root);
  stripRuntimeState(root);
  addStaticMarkers(root, kind);
  const validation = validateRoot(root, kind);
  errors.push.apply(errors, validation.errors);
  warnings.push.apply(warnings, validation.warnings);
  let nextRoot;
  let preservedStatic = false;
  if (kind === 'calculator' && STATIC_CALCULATOR_PAGES.has(filename)) {
    nextRoot = materializeStaticPage(originalRoot.full, root, eol);
    preservedStatic = true;
  } else {
    nextRoot = formatVirtualRoot(root, eol);
  }
  let output = html.slice(0, originalRoot.index) + nextRoot +
    html.slice(originalRoot.index + originalRoot.full.length);
  let bootstrap = { removed: 0, skipped: 0 };
  let initializer = { guarded: 0 };
  let legacy = { removed: 0 };
  if (kind === 'calculator') {
    bootstrap = removeEmptyStaticGuideBootstrap(output, originalRoot.inner);
    output = bootstrap.html;
    initializer = guardStaticInlineInitializers(output, filename);
    output = initializer.html;
    legacy = removeLegacyScriptReferences(output);
    output = legacy.html;
    output = ensureStaticRuntimeScript(output);
    output = ensureScenarioComparisonAssets(output, slug, eol);
    output = ensureCalculatorHeaderNavigation(output);
  }
  output = ensureTrustFooter(output);
  output = normalizeStaticCopy(output);
  if (hasBom) output = '\uFEFF' + output;
  return {
    filePath: filePath,
    filename: filename,
    slug: slug,
    kind: kind,
    changed: output !== raw,
    output: output,
    errors: errors,
    warnings: warnings,
    logs: execution.logs,
    stats: Object.assign({}, execution.stats, {
      controls: root.querySelectorAll('input, select, textarea').length,
      editorial: editorial,
      normalizedValues: inputStats.values,
      normalizedNumbers: inputStats.numbers,
      bootstrapRemoved: bootstrap.removed,
      bootstrapSkipped: bootstrap.skipped,
      inlineInitializerGuarded: initializer.guarded,
      legacyReferencesRemoved: legacy.removed,
      preservedStatic: preservedStatic
    })
  };
}

async function listHtmlFiles(directory) {
  const names = await readdir(directory);
  return names.filter(function(name) {
    return name.toLowerCase().endsWith('.html');
  }).sort(function(left, right) {
    return left.localeCompare(right, 'en');
  }).map(function(name) {
    return path.join(directory, name);
  });
}

function selected(filePath, options) {
  if (!options.only.size) return true;
  const slug = path.basename(filePath).replace(/\.html$/i, '');
  return options.only.has(slug);
}

function printResult(result, options) {
  const prefix = result.kind === 'calculator' ? 'CALC' : 'CAT ';
  const status = result.errors.length ? 'ERROR' : result.changed ? 'CHANGE' : 'OK';
  if (options.verbose || result.errors.length || result.warnings.length) {
    console.log(prefix + ' ' + status + ' ' + result.filename);
    if (result.stats && options.verbose) {
      console.log('  root=' + result.stats.rootAssignments +
        ', target=' + result.stats.targetMutations +
        ', controls=' + result.stats.controls +
        ', editorial=' + Boolean(result.stats.editorial) +
        ', input-values=' + result.stats.normalizedValues +
        ', legacy-excluded=' + result.stats.legacyScriptsExcluded);
    }
    for (const warning of result.warnings) console.log('  경고: ' + warning);
    for (const error of result.errors) console.log('  오류: ' + error.replace(/\n/g, '\n        '));
    if (options.verbose && result.logs && result.logs.length) {
      for (const log of result.logs) console.log('  로그: ' + log);
    }
  }
}

export async function runPrerender(argv = [], runtimeProcess = null) {
  let options;
  try {
    options = parseArgs(argv);
  } catch (error) {
    console.error(error.message);
    printHelp();
    if (runtimeProcess) runtimeProcess.exitCode = 1;
    return { errors: 1, warnings: 0, changed: 0, results: [] };
  }
  if (options.help) {
    printHelp();
    return { errors: 0, warnings: 0, changed: 0, results: [] };
  }
  const allCalculatorFiles = await listHtmlFiles(CALCULATOR_DIR);
  const allCategoryFiles = await listHtmlFiles(CATEGORY_DIR);
  const editorialInfo = await loadEditorialCatalogue();
  const catalogueSlugs = new Set(Object.keys(editorialInfo.catalogue));
  const missingCatalogue = allCalculatorFiles.map(function(file) {
    return path.basename(file, '.html');
  }).filter(function(slug) {
    return !catalogueSlugs.has(slug);
  });
  const calculatorFiles = allCalculatorFiles.filter(function(file) {
    return selected(file, options);
  });
  const categoryFiles = allCategoryFiles.filter(function(file) {
    return selected(file, options);
  });
  const results = [];
  for (const file of calculatorFiles) {
    results.push(await renderArtifact(file, 'calculator', editorialInfo.catalogue));
  }
  for (const file of categoryFiles) {
    results.push(await renderArtifact(file, 'category', editorialInfo.catalogue));
  }
  for (const result of results) printResult(result, options);
  let errors = results.reduce(function(sum, result) {
    return sum + result.errors.length;
  }, 0);
  const warnings = results.reduce(function(sum, result) {
    return sum + result.warnings.length;
  }, 0);
  const changed = results.filter(function(result) { return result.changed; });
  const calculatorResults = results.filter(function(result) { return result.kind === 'calculator'; });
  const categoryResults = results.filter(function(result) { return result.kind === 'category'; });
  const editorialCount = calculatorResults.filter(function(result) {
    return result.stats && result.stats.editorial;
  }).length;
  const legacyExcluded = results.reduce(function(sum, result) {
    return sum + (result.stats ? result.stats.legacyScriptsExcluded : 0);
  }, 0);
  if (missingCatalogue.length) {
    console.error('오류: editorial catalogue 누락 ' + missingCatalogue.length + '개: ' +
      missingCatalogue.join(', '));
    errors += missingCatalogue.length;
  }
  console.log('');
  console.log('프리렌더 요약');
  console.log('  계산기: ' + calculatorResults.length + '개');
  console.log('  카테고리: ' + categoryResults.length + '개');
  console.log('  base editorial: ' + editorialInfo.baseCount + '개');
  console.log('  editorial plugin: ' + editorialInfo.pluginFiles.length + '개');
  console.log('  최종 catalogue: ' + catalogueSlugs.size + '개');
  console.log('  editorial 합성: ' + editorialCount + '개');
  console.log('  legacy script 실행 제외: ' + legacyExcluded + '회');
  console.log('  변경 예정: ' + changed.length + '개');
  console.log('  경고: ' + warnings + '개');
  console.log('  오류: ' + errors + '개');
  if (errors) {
    console.error('오류가 있어 파일을 쓰지 않았습니다.');
    if (runtimeProcess) runtimeProcess.exitCode = 1;
    return { errors: errors, warnings: warnings, changed: changed.length, results: results };
  }
  if (options.mode === 'write') {
    for (const result of changed) {
      await writeFile(result.filePath, result.output, 'utf8');
    }
    console.log('UTF-8 파일 ' + changed.length + '개를 갱신했습니다.');
  } else {
    console.log('검사 모드이므로 파일을 변경하지 않았습니다.');
    if (options.failOnChange && changed.length && runtimeProcess) runtimeProcess.exitCode = 2;
  }
  return { errors: errors, warnings: warnings, changed: changed.length, results: results };
}

export async function inspectRuntimeStability(slug) {
  const filePath = path.join(CALCULATOR_DIR, slug + '.html');
  const html = await readFile(filePath, 'utf8');
  const execution = await executePageScripts(ensureStaticRuntimeScript(html), filePath, 'calculator');
  return {
    slug: slug,
    errors: execution.errors,
    layoutChanged: execution.stats.runtimeLayoutChanged,
    controlsChanged: execution.stats.runtimeControlStateChanged,
    initial: execution.initialSnapshot,
    final: execution.finalSnapshot
  };
}

const cliProcess = typeof globalThis.process === 'object' ? globalThis.process : null;
const invokedAsCli = cliProcess && cliProcess.argv && cliProcess.argv[1] &&
  path.resolve(cliProcess.argv[1]) === fileURLToPath(import.meta.url);
if (invokedAsCli) {
  runPrerender(cliProcess.argv.slice(2), cliProcess).catch(function(error) {
    console.error(error && error.stack ? error.stack : error);
    cliProcess.exitCode = 1;
  });
}
