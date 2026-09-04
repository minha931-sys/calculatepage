#!/usr/bin/env node

import {
  readFile,
  readdir,
  rename,
  stat,
  unlink,
  writeFile
} from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_ORIGIN = 'https://calculatepage.com';
const ADSENSE_ACCOUNT = 'ca-pub-5944689754824076';
const ADS_TXT_PUBLISHER = 'pub-5944689754824076';
const EXPECTED_HTML_COUNT = 127;
const EXPECTED_CALCULATOR_COUNT = 114;
const EXPECTED_CATEGORY_COUNT = 6;
const EDITORIAL_SYSTEM_DATE = '2026-09-04';
const VIEWPORT_CONTENT = 'width=device-width,initial-scale=1';
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, '..');
const WRITE_RUN_ID = typeof globalThis.process === 'object' && globalThis.process?.pid
  ? String(globalThis.process.pid)
  : 'repl';
const HTML_DIRECTORIES = ['', 'calculators', 'categories', 'pages'];
const CATEGORY_ORDER = [
  'categories/money.html',
  'categories/education.html',
  'categories/health.html',
  'categories/life.html',
  'categories/business.html',
  'categories/conversion.html'
];
const FORBIDDEN_SCHEMA_KEYS = new Set([
  'aggregateRating',
  'review',
  'reviews',
  'author'
]);

function fail(message) {
  throw new Error(message);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function escapeRegex(value) {
  return value.replace(/[.*+?^{}$()|[\]\\]/g, '\\$&');
}

function decodeHtml(value) {
  return String(value ?? '').replace(
    /&(#x[0-9a-f]+|#[0-9]+|amp|quot|apos|#39|lt|gt);/gi,
    (match, entity) => {
      const lower = entity.toLowerCase();
      if (lower === 'amp') return '&';
      if (lower === 'quot') return '"';
      if (lower === 'apos' || lower === '#39') return "'";
      if (lower === 'lt') return '<';
      if (lower === 'gt') return '>';
      const radix = lower.startsWith('#x') ? 16 : 10;
      const digits = lower.replace(/^#x?/, '');
      const codePoint = Number.parseInt(digits, radix);
      try {
        return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : match;
      } catch {
        return match;
      }
    }
  );
}

function textOnly(value) {
  return decodeHtml(
    String(value ?? '')
      .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
  ).replace(/\s+/g, ' ').trim();
}

function escapeAttribute(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeText(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function getAttribute(tag, name) {
  const pattern = new RegExp(
    '(?:\\s|<)' + escapeRegex(name)
      + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))',
    'i'
  );
  const match = tag.match(pattern);
  if (!match) return undefined;
  return decodeHtml(match[1] ?? match[2] ?? match[3] ?? '');
}

function hasAttribute(tag, name) {
  const pattern = new RegExp(
    '(?:\\s|<)' + escapeRegex(name) + '(?:\\s*=|\\s|>)',
    'i'
  );
  return pattern.test(tag);
}

function setAttribute(tag, name, value) {
  const pattern = new RegExp(
    '(\\s' + escapeRegex(name) + '\\s*=\\s*)'
      + '(?:"[^"]*"|\'[^\']*\'|[^\\s>]+)',
    'i'
  );
  assert(pattern.test(tag), '속성 교체 실패: ' + name + ' / ' + tag);
  return tag.replace(pattern, (whole, prefix) => {
    return prefix + '"' + escapeAttribute(value) + '"';
  });
}

function tagMatches(html, tagName) {
  const pattern = new RegExp('<' + tagName + '\\b[^>]*>', 'gi');
  return [...html.matchAll(pattern)].map((match) => match[0]);
}

function single(items, message) {
  assert(items.length === 1, message + ' (발견 ' + items.length + '개)');
  return items[0];
}

function tagsByAttribute(html, tagName, attribute, expectedValue) {
  return tagMatches(html, tagName).filter((tag) => {
    const value = getAttribute(tag, attribute);
    return value !== undefined
      && value.toLowerCase() === expectedValue.toLowerCase();
  });
}

function replaceOnce(text, before, after, message) {
  const first = text.indexOf(before);
  assert(first >= 0, message + ': 교체 대상을 찾지 못했습니다.');
  assert(text.indexOf(before, first + before.length) < 0, message + ': 교체 대상이 중복됩니다.');
  return text.slice(0, first) + after + text.slice(first + before.length);
}

function expectedCanonical(relativePath) {
  return SITE_ORIGIN + '/' + (relativePath === 'index.html' ? '' : relativePath);
}

function absolutePath(relativePath) {
  return path.join(ROOT, ...relativePath.split('/'));
}

function detectEol(html) {
  return html.includes('\r\n') ? '\r\n' : '\n';
}

function extractProtectedMarkup(html) {
  const scripts = [...html.matchAll(/<script\b[^>]*>[\s\S]*?<\/script>/gi)]
    .map((match) => match[0]);
  const metas = tagMatches(html, 'meta');
  return {
    ga: scripts.filter((script) => script.includes('G-70L97RBRT5')),
    clarity: scripts.filter((script) => script.includes('xd6sj9htsp')),
    naver: metas.filter((meta) => {
      return (getAttribute(meta, 'name') ?? '').toLowerCase()
        === 'naver-site-verification';
    })
  };
}

function extractMetadata(html, relativePath) {
  const headMatches = [...html.matchAll(/<head\b[^>]*>[\s\S]*?<\/head>/gi)];
  const head = single(headMatches, relativePath + ': head가 정확히 1개여야 합니다.')[0];
  const titleMatches = [...head.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)];
  const titleMatch = single(titleMatches, relativePath + ': title이 정확히 1개여야 합니다.');
  const h1Matches = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
  const h1Match = single(h1Matches, relativePath + ': H1이 정확히 1개여야 합니다.');
  const metaTags = tagMatches(head, 'meta');
  const linkTags = tagMatches(head, 'link');
  const descriptionTag = single(
    metaTags.filter((tag) => {
      return (getAttribute(tag, 'name') ?? '').toLowerCase() === 'description';
    }),
    relativePath + ': meta description이 정확히 1개여야 합니다.'
  );
  const viewportTag = single(
    metaTags.filter((tag) => {
      return (getAttribute(tag, 'name') ?? '').toLowerCase() === 'viewport';
    }),
    relativePath + ': viewport가 정확히 1개여야 합니다.'
  );
  const canonicalTag = single(
    linkTags.filter((tag) => {
      const rel = (getAttribute(tag, 'rel') ?? '').toLowerCase().split(/\s+/);
      return rel.includes('canonical');
    }),
    relativePath + ': canonical이 정확히 1개여야 합니다.'
  );
  const ogTitleTag = single(
    tagsByAttribute(head, 'meta', 'property', 'og:title'),
    relativePath + ': og:title이 정확히 1개여야 합니다.'
  );
  const ogDescriptionTag = single(
    tagsByAttribute(head, 'meta', 'property', 'og:description'),
    relativePath + ': og:description이 정확히 1개여야 합니다.'
  );
  const ogUrlTag = single(
    tagsByAttribute(head, 'meta', 'property', 'og:url'),
    relativePath + ': og:url이 정확히 1개여야 합니다.'
  );
  const adsenseTags = metaTags.filter((tag) => {
    return (getAttribute(tag, 'name') ?? '').toLowerCase()
      === 'google-adsense-account';
  });
  const title = textOnly(titleMatch[1]);
  const description = getAttribute(descriptionTag, 'content') ?? '';
  const h1 = textOnly(h1Match[1]);
  const canonical = getAttribute(canonicalTag, 'href') ?? '';
  assert(title, relativePath + ': title이 비어 있습니다.');
  assert(description, relativePath + ': meta description이 비어 있습니다.');
  assert(h1, relativePath + ': H1이 비어 있습니다.');
  assert(
    canonical === expectedCanonical(relativePath),
    relativePath + ': canonical이 자기 URL과 다릅니다. (' + canonical + ')'
  );
  return {
    head,
    title,
    description,
    h1,
    canonical,
    descriptionTag,
    viewportTag,
    viewportContent: getAttribute(viewportTag, 'content') ?? '',
    canonicalTag,
    ogTitleTag,
    ogTitle: getAttribute(ogTitleTag, 'content') ?? '',
    ogDescriptionTag,
    ogDescription: getAttribute(ogDescriptionTag, 'content') ?? '',
    ogUrlTag,
    ogUrl: getAttribute(ogUrlTag, 'content') ?? '',
    adsenseTags,
    protectedMarkup: extractProtectedMarkup(html)
  };
}

async function listHtmlFiles() {
  const files = [];
  for (const directory of HTML_DIRECTORIES) {
    const directoryPath = directory ? absolutePath(directory) : ROOT;
    const entries = await readdir(directoryPath, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.toLowerCase().endsWith('.html')) continue;
      files.push(directory ? directory + '/' + entry.name : entry.name);
    }
  }
  return files.sort();
}

async function readPages(files) {
  return Promise.all(files.map(async (relativePath) => {
    const html = await readFile(absolutePath(relativePath), 'utf8');
    return {
      relativePath,
      html,
      metadata: extractMetadata(html, relativePath)
    };
  }));
}

function categoryRank(relativePath) {
  const rank = CATEGORY_ORDER.indexOf(relativePath);
  return rank >= 0 ? rank : CATEGORY_ORDER.length;
}

function buildCategoryIndex(pages) {
  const pageByPath = new Map(pages.map((page) => [page.relativePath, page]));
  const calculatorPaths = new Set(
    pages
      .filter((page) => page.relativePath.startsWith('calculators/'))
      .map((page) => page.relativePath)
  );
  const categoryPages = pages
    .filter((page) => page.relativePath.startsWith('categories/'))
    .sort((left, right) => {
      return categoryRank(left.relativePath) - categoryRank(right.relativePath)
        || left.relativePath.localeCompare(right.relativePath);
    });
  assert(
    categoryPages.length === EXPECTED_CATEGORY_COUNT,
    '카테고리 HTML 수가 예상과 다릅니다.'
  );
  for (const expected of CATEGORY_ORDER) {
    assert(pageByPath.has(expected), '필수 카테고리 파일이 없습니다: ' + expected);
  }

  const inverse = new Map();
  for (const page of categoryPages) {
    const staticGridMatches = [...page.html.matchAll(
      /<div\b(?=[^>]*\bclass\s*=\s*["'][^"']*\bstatic-category-grid\b[^"']*["'])[^>]*>([\s\S]*?)<\/div>/gi
    )];
    let grid = '';
    if (staticGridMatches.length) {
      grid = single(
        staticGridMatches,
        page.relativePath + ': static-category-grid가 정확히 1개여야 합니다.'
      )[1];
    } else {
      const categoryAll = page.html.match(
        /<section\b(?=[^>]*\bclass\s*=\s*["'][^"']*\bcategory-all\b[^"']*["'])[^>]*>([\s\S]*?)<\/section>/i
      );
      assert(categoryAll, page.relativePath + ': category-all 정적 목록이 없습니다.');
      const cardGrids = [...categoryAll[1].matchAll(
        /<div\b(?=[^>]*\bclass\s*=\s*["'][^"']*\bcard-grid\b[^"']*["'])[^>]*>([\s\S]*?)<\/div>/gi
      )];
      grid = single(cardGrids, page.relativePath + ': category-all 카드 목록이 정확히 1개여야 합니다.')[1];
    }
    const anchors = tagMatches(grid, 'a');
    assert(anchors.length > 0, page.relativePath + ': 정적 계산기 카드가 없습니다.');
    const category = {
      relativePath: page.relativePath,
      canonical: page.metadata.canonical,
      href: new URL(page.metadata.canonical).pathname,
      label: page.metadata.h1
    };
    const seenHere = new Set();
    for (const anchor of anchors) {
      const href = getAttribute(anchor, 'href');
      if (!href) continue;
      const url = new URL(href, page.metadata.canonical);
      if (url.origin !== SITE_ORIGIN || !url.pathname.startsWith('/calculators/')) continue;
      const calculatorPath = decodeURIComponent(url.pathname.replace(/^\/+/, ''));
      assert(
        calculatorPaths.has(calculatorPath),
        page.relativePath + ': 존재하지 않는 계산기 카드 ' + href
      );
      if (seenHere.has(calculatorPath)) continue;
      seenHere.add(calculatorPath);
      const categories = inverse.get(calculatorPath) ?? [];
      categories.push(category);
      inverse.set(calculatorPath, categories);
    }
  }

  const chosen = new Map();
  for (const calculatorPath of calculatorPaths) {
    const categories = inverse.get(calculatorPath) ?? [];
    assert(
      categories.length > 0,
      calculatorPath + ': 정적 카테고리 카드 역색인 결과가 없습니다.'
    );
    chosen.set(calculatorPath, categories[0]);
  }
  return chosen;
}

function normalizeHead(html, metadata, eol, operations, relativePath) {
  let head = metadata.head;
  let viewportTag = metadata.viewportTag;
  if (metadata.viewportContent !== VIEWPORT_CONTENT) {
    const updated = setAttribute(viewportTag, 'content', VIEWPORT_CONTENT);
    head = replaceOnce(head, viewportTag, updated, relativePath + ': viewport');
    viewportTag = updated;
    operations.push('viewport');
  }

  const adsenseIsExact = metadata.adsenseTags.length === 1
    && getAttribute(metadata.adsenseTags[0], 'content') === ADSENSE_ACCOUNT;
  if (!adsenseIsExact) {
    for (const tag of metadata.adsenseTags) {
      head = replaceOnce(head, tag, '', relativePath + ': 기존 AdSense meta 제거');
    }
    const adsenseMeta = '<meta name="google-adsense-account" content="'
      + ADSENSE_ACCOUNT + '">';
    head = replaceOnce(
      head,
      viewportTag,
      viewportTag + eol + '  ' + adsenseMeta,
      relativePath + ': AdSense meta 삽입'
    );
    operations.push('adsense-meta');
  }

  const normalizations = [
    {
      name: 'og:title',
      tag: metadata.ogTitleTag,
      current: metadata.ogTitle,
      wanted: metadata.title
    },
    {
      name: 'og:description',
      tag: metadata.ogDescriptionTag,
      current: metadata.ogDescription,
      wanted: metadata.description
    },
    {
      name: 'og:url',
      tag: metadata.ogUrlTag,
      current: metadata.ogUrl,
      wanted: metadata.canonical
    }
  ];
  for (const item of normalizations) {
    if (item.current === item.wanted) continue;
    const updated = setAttribute(item.tag, 'content', item.wanted);
    head = replaceOnce(
      head,
      item.tag,
      updated,
      relativePath + ': ' + item.name
    );
    operations.push(item.name);
  }

  return replaceOnce(html, metadata.head, head, relativePath + ': head');
}

function schemaTypeIncludes(node, type) {
  const types = Array.isArray(node?.['@type'])
    ? node['@type']
    : [node?.['@type']];
  return types.includes(type);
}

function sanitizeSchemaValue(value) {
  if (Array.isArray(value)) return value.map(sanitizeSchemaValue);
  if (!value || typeof value !== 'object') return value;
  const result = {};
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_SCHEMA_KEYS.has(key)) continue;
    result[key] = sanitizeSchemaValue(child);
  }
  return result;
}

function primarySchemaMatches(html) {
  return [...html.matchAll(
    /([ \t]*)<script\b(?=[^>]*\b(?:data-primary-image-schema|data-calculator-schema)\b)[^>]*>([\s\S]*?)<\/script>/gi
  )];
}

function calculatorModifiedDate(relativePath) {
  void relativePath;
  return EDITORIAL_SYSTEM_DATE;
}

function buildCalculatorGraph(existingSchema, metadata, category, relativePath) {
  const nodes = Array.isArray(existingSchema?.['@graph'])
    ? existingSchema['@graph']
    : [existingSchema];
  const existingWebPages = nodes.filter((node) => schemaTypeIncludes(node, 'WebPage'));
  const oldWebPage = sanitizeSchemaValue(
    single(existingWebPages, '기존 primary schema의 WebPage가 정확히 1개여야 합니다.')
  );
  const preserved = { ...oldWebPage };
  delete preserved['@context'];
  delete preserved['@graph'];
  delete preserved['@type'];
  delete preserved['@id'];
  delete preserved.name;
  delete preserved.url;
  delete preserved.description;
  delete preserved.inLanguage;
  delete preserved.dateModified;
  delete preserved.publisher;
  delete preserved.image;
  delete preserved.primaryImageOfPage;
  delete preserved.breadcrumb;
  delete preserved.mainEntity;

  const pageId = metadata.canonical + '#webpage';
  const applicationId = metadata.canonical + '#application';
  const breadcrumbId = metadata.canonical + '#breadcrumb';
  const webPage = {
    '@type': 'WebPage',
    '@id': pageId,
    ...preserved,
    name: metadata.title,
    url: metadata.canonical,
    description: metadata.description,
    inLanguage: 'ko-KR',
    dateModified: calculatorModifiedDate(relativePath),
    publisher: {
      '@type': 'Organization',
      name: '계산페이지',
      url: SITE_ORIGIN + '/pages/about.html'
    },
    image: SITE_ORIGIN + '/assets/og-image.png',
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: SITE_ORIGIN + '/assets/og-image.png',
      contentUrl: SITE_ORIGIN + '/assets/og-image.png',
      width: 1200,
      height: 630,
      caption: '계산페이지 - 생활·금융·건강 무료 계산기 모음'
    },
    breadcrumb: { '@id': breadcrumbId },
    mainEntity: { '@id': applicationId }
  };
  const webApplication = {
    '@type': 'WebApplication',
    '@id': applicationId,
    name: metadata.h1,
    description: metadata.description,
    url: metadata.canonical,
    applicationCategory: 'CalculatorApplication',
    operatingSystem: 'Any',
    inLanguage: 'ko-KR',
    isAccessibleForFree: true
  };
  const breadcrumb = {
    '@type': 'BreadcrumbList',
    '@id': breadcrumbId,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: '홈',
        item: SITE_ORIGIN + '/'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: category.label,
        item: category.canonical
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: metadata.h1,
        item: metadata.canonical
      }
    ]
  };
  return {
    '@context': 'https://schema.org',
    '@graph': [webPage, webApplication, breadcrumb]
  };
}

function normalizeCalculatorSchema(
  html,
  metadata,
  category,
  eol,
  operations,
  relativePath
) {
  const matches = primarySchemaMatches(html);
  const match = single(
    matches,
    relativePath + ': 계산기 primary schema가 정확히 1개여야 합니다.'
  );
  let existing;
  try {
    existing = JSON.parse(match[2].trim());
  } catch (error) {
    fail(relativePath + ': 기존 primary JSON-LD 문법 오류: ' + error.message);
  }
  const graph = buildCalculatorGraph(existing, metadata, category, relativePath);
  const indent = match[1];
  const json = JSON.stringify(graph, null, 2)
    .split('\n')
    .map((line) => indent + line)
    .join(eol);
  const replacement = indent
    + '<script type="application/ld+json" data-primary-image-schema '
    + 'data-calculator-schema="true">'
    + eol + json + eol + indent + '</script>';
  if (replacement !== match[0]) operations.push('calculator-schema');
  return html.slice(0, match.index)
    + replacement
    + html.slice(match.index + match[0].length);
}

function isBreadcrumbNav(markup) {
  const opening = markup.match(/^<nav\b[^>]*>/i)?.[0] ?? '';
  const classes = (getAttribute(opening, 'class') ?? '').split(/\s+/);
  return hasAttribute(opening, 'data-seo-breadcrumb')
    || classes.includes('breadcrumb')
    || classes.includes('calculator-breadcrumb');
}

function breadcrumbMarkup(metadata, category) {
  return '<nav class="breadcrumb calculator-breadcrumb" '
    + 'aria-label="현재 위치" data-seo-breadcrumb="true">'
    + '<a href="/">홈</a><span aria-hidden="true"> > </span>'
    + '<a href="' + escapeAttribute(category.href) + '">'
    + escapeText(category.label) + '</a>'
    + '<span aria-hidden="true"> > </span>'
    + '<span aria-current="page">' + escapeText(metadata.h1) + '</span>'
    + '</nav>';
}

function normalizeCalculatorBreadcrumb(
  html,
  metadata,
  category,
  eol,
  operations,
  relativePath
) {
  const mainMatches = [...html.matchAll(
    /(<main\b[^>]*>)([\s\S]*?)(<\/main>)/gi
  )];
  const main = single(mainMatches, relativePath + ': main이 정확히 1개여야 합니다.');
  const content = main[2];
  const breadcrumbMatches = [...content.matchAll(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi)]
    .filter((match) => isBreadcrumbNav(match[0]));
  assert(
    breadcrumbMatches.length <= 1,
    relativePath + ': 기존 breadcrumb nav가 2개 이상입니다.'
  );
  let remaining = content;
  if (breadcrumbMatches.length === 1) {
    const existing = breadcrumbMatches[0];
    remaining = remaining.slice(0, existing.index)
      + remaining.slice(existing.index + existing[0].length);
  }
  remaining = remaining.trimStart();
  const nav = breadcrumbMarkup(metadata, category);
  const replacement = main[1] + eol + '  ' + nav + eol + '  '
    + remaining + main[3];
  if (replacement !== main[0]) operations.push('visible-breadcrumb');
  return html.slice(0, main.index)
    + replacement
    + html.slice(main.index + main[0].length);
}

function forbiddenSchemaPaths(value, prefix = '$') {
  const paths = [];
  if (Array.isArray(value)) {
    value.forEach((child, index) => {
      paths.push(...forbiddenSchemaPaths(child, prefix + '[' + index + ']'));
    });
    return paths;
  }
  if (!value || typeof value !== 'object') return paths;
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_SCHEMA_KEYS.has(key)) paths.push(prefix + '.' + key);
    paths.push(...forbiddenSchemaPaths(child, prefix + '.' + key));
  }
  return paths;
}

function validateBreadcrumb(html, metadata, category, relativePath) {
  const main = single(
    [...html.matchAll(/(<main\b[^>]*>)([\s\S]*?)(<\/main>)/gi)],
    relativePath + ': 결과 main 검증'
  );
  const navs = [...main[2].matchAll(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi)]
    .filter((match) => isBreadcrumbNav(match[0]));
  const nav = single(navs, relativePath + ': visible breadcrumb 검증')[0];
  assert(
    main[2].trimStart().startsWith(nav),
    relativePath + ': breadcrumb가 main의 첫 콘텐츠가 아닙니다.'
  );
  const anchors = [...nav.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/gi)];
  assert(anchors.length === 2, relativePath + ': breadcrumb 링크 수가 2개가 아닙니다.');
  const homeOpening = anchors[0][0].match(/^<a\b[^>]*>/i)?.[0] ?? '';
  const categoryOpening = anchors[1][0].match(/^<a\b[^>]*>/i)?.[0] ?? '';
  assert(
    getAttribute(homeOpening, 'href') === '/' && textOnly(anchors[0][1]) === '홈',
    relativePath + ': breadcrumb 홈 링크가 잘못되었습니다.'
  );
  assert(
    getAttribute(categoryOpening, 'href') === category.href
      && textOnly(anchors[1][1]) === category.label,
    relativePath + ': breadcrumb 카테고리 링크가 잘못되었습니다.'
  );
  const current = nav.match(
    /<span\b(?=[^>]*\baria-current\s*=\s*["']page["'])[^>]*>([\s\S]*?)<\/span>/i
  );
  assert(
    current && textOnly(current[1]) === metadata.h1,
    relativePath + ': breadcrumb 현재 페이지명이 H1과 다릅니다.'
  );
}

function validateCalculatorSchema(html, metadata, category, relativePath) {
  const matches = primarySchemaMatches(html);
  const match = single(matches, relativePath + ': 결과 primary schema 검증');
  const opening = match[0].match(/<script\b[^>]*>/i)?.[0] ?? '';
  assert(
    hasAttribute(opening, 'data-calculator-schema'),
    relativePath + ': 런타임 중복 방지 data-calculator-schema가 없습니다.'
  );
  let parsed;
  try {
    parsed = JSON.parse(match[2].trim());
  } catch (error) {
    fail(relativePath + ': 결과 JSON-LD 문법 오류: ' + error.message);
  }
  assert(
    parsed['@context'] === 'https://schema.org' && Array.isArray(parsed['@graph']),
    relativePath + ': primary schema가 단일 @graph 형식이 아닙니다.'
  );
  assert(parsed['@graph'].length === 3, relativePath + ': @graph 노드 수가 3개가 아닙니다.');
  const webPage = single(
    parsed['@graph'].filter((node) => schemaTypeIncludes(node, 'WebPage')),
    relativePath + ': WebPage schema 검증'
  );
  const application = single(
    parsed['@graph'].filter((node) => schemaTypeIncludes(node, 'WebApplication')),
    relativePath + ': WebApplication schema 검증'
  );
  const breadcrumb = single(
    parsed['@graph'].filter((node) => schemaTypeIncludes(node, 'BreadcrumbList')),
    relativePath + ': BreadcrumbList schema 검증'
  );
  assert(
    webPage.url === metadata.canonical
      && webPage.name === metadata.title
      && webPage.description === metadata.description
      && webPage.dateModified === calculatorModifiedDate(relativePath)
      && webPage.publisher?.name === '계산페이지'
      && webPage.primaryImageOfPage?.url === SITE_ORIGIN + '/assets/og-image.png',
    relativePath + ': WebPage schema와 메타데이터가 다릅니다.'
  );
  assert(
    application.url === metadata.canonical
      && application.name === metadata.h1
      && application.description === metadata.description,
    relativePath + ': WebApplication schema와 화면이 다릅니다.'
  );
  assert(
    forbiddenSchemaPaths(parsed).length === 0,
    relativePath + ': 금지된 평점·리뷰·저자 schema가 있습니다.'
  );
  const items = breadcrumb.itemListElement;
  assert(Array.isArray(items) && items.length === 3, relativePath + ': breadcrumb schema 항목 오류');
  const expectedItems = [
    { position: 1, name: '홈', item: SITE_ORIGIN + '/' },
    { position: 2, name: category.label, item: category.canonical },
    { position: 3, name: metadata.h1, item: metadata.canonical }
  ];
  expectedItems.forEach((expected, index) => {
    const actual = items[index];
    assert(
      actual?.['@type'] === 'ListItem'
        && actual.position === expected.position
        && actual.name === expected.name
        && actual.item === expected.item,
      relativePath + ': breadcrumb schema ' + (index + 1) + '번째 항목 불일치'
    );
  });
}

function validatePage(beforePage, afterHtml, category) {
  const relativePath = beforePage.relativePath;
  const before = beforePage.metadata;
  const after = extractMetadata(afterHtml, relativePath);
  assert(after.title === before.title, relativePath + ': title이 변경되었습니다.');
  assert(
    after.description === before.description,
    relativePath + ': meta description이 변경되었습니다.'
  );
  assert(after.h1 === before.h1, relativePath + ': H1이 변경되었습니다.');
  assert(after.canonical === before.canonical, relativePath + ': canonical이 변경되었습니다.');
  assert(
    JSON.stringify(after.protectedMarkup) === JSON.stringify(before.protectedMarkup),
    relativePath + ': GA, Clarity 또는 Naver 확인 코드가 변경되었습니다.'
  );
  assert(
    after.adsenseTags.length === 1
      && getAttribute(after.adsenseTags[0], 'content') === ADSENSE_ACCOUNT,
    relativePath + ': AdSense 계정 meta가 정확히 1개가 아닙니다.'
  );
  assert(
    after.viewportContent === VIEWPORT_CONTENT,
    relativePath + ': viewport가 정규화되지 않았습니다.'
  );
  assert(
    after.ogTitle === after.title
      && after.ogDescription === after.description
      && after.ogUrl === after.canonical,
    relativePath + ': Open Graph가 메타데이터와 다릅니다.'
  );
  if (relativePath.startsWith('calculators/')) {
    validateBreadcrumb(afterHtml, after, category, relativePath);
    validateCalculatorSchema(afterHtml, after, category, relativePath);
  }
  return after;
}

function ensureUnique(records, key, label) {
  const seen = new Map();
  for (const record of records) {
    const value = record[key];
    const existing = seen.get(value);
    assert(
      !existing,
      label + ' 중복: ' + existing + ', ' + record.relativePath
    );
    seen.set(value, record.relativePath);
  }
}

function validateGlobal(pages, outputRecords) {
  assert(pages.length === EXPECTED_HTML_COUNT, 'HTML 수가 127개가 아닙니다.');
  const calculators = pages.filter((page) => page.relativePath.startsWith('calculators/'));
  const categories = pages.filter((page) => page.relativePath.startsWith('categories/'));
  assert(
    calculators.length === EXPECTED_CALCULATOR_COUNT,
    '계산기 HTML 수가 114개가 아닙니다.'
  );
  assert(
    categories.length === EXPECTED_CATEGORY_COUNT,
    '카테고리 HTML 수가 6개가 아닙니다.'
  );
  for (const key of ['title', 'description', 'h1', 'canonical']) {
    ensureUnique(outputRecords, key, key);
  }
  const calculatorDescriptions = outputRecords
    .filter((record) => record.relativePath.startsWith('calculators/'));
  ensureUnique(calculatorDescriptions, 'description', '계산기 schema description');

  for (const page of pages) {
    assert(
      page.metadata.protectedMarkup.ga.length === 2,
      page.relativePath + ': 기존 GA script 구성은 2개여야 합니다.'
    );
    assert(
      page.metadata.protectedMarkup.clarity.length === 1,
      page.relativePath + ': 기존 Clarity script 구성은 1개여야 합니다.'
    );
  }
  const naverCount = pages.reduce((sum, page) => {
    return sum + page.metadata.protectedMarkup.naver.length;
  }, 0);
  assert(naverCount === 1, '기존 Naver 확인 meta 수가 1개가 아닙니다.');
}

function transformPage(page, categoryIndex) {
  const operations = [];
  const eol = detectEol(page.html);
  let html = normalizeHead(
    page.html,
    page.metadata,
    eol,
    operations,
    page.relativePath
  );
  let category;
  if (page.relativePath.startsWith('calculators/')) {
    category = categoryIndex.get(page.relativePath);
    assert(category, page.relativePath + ': 선택된 카테고리가 없습니다.');
    html = normalizeCalculatorSchema(
      html,
      page.metadata,
      category,
      eol,
      operations,
      page.relativePath
    );
    html = normalizeCalculatorBreadcrumb(
      html,
      page.metadata,
      category,
      eol,
      operations,
      page.relativePath
    );
  }
  const outputMetadata = validatePage(page, html, category);
  return {
    relativePath: page.relativePath,
    before: page.html,
    after: html,
    operations,
    outputMetadata
  };
}

function operationSummary(plans) {
  const summary = new Map();
  for (const plan of plans) {
    for (const operation of new Set(plan.operations)) {
      summary.set(operation, (summary.get(operation) ?? 0) + 1);
    }
  }
  return [...summary.entries()].sort(([left], [right]) => left.localeCompare(right));
}

async function validateAdsTxt() {
  const adsTxt = await readFile(path.join(ROOT, 'ads.txt'), 'utf8');
  const publishers = [...adsTxt.matchAll(
    /^\s*google\.com\s*,\s*(pub-\d+)\s*,\s*DIRECT\s*,\s*f08c47fec0942fa0\s*$/gim
  )].map((match) => match[1]);
  assert(
    publishers.length === 1 && publishers[0] === ADS_TXT_PUBLISHER,
    'ads.txt 게시자 ID가 예상값과 정확히 일치하지 않습니다.'
  );
  assert(
    ADSENSE_ACCOUNT === 'ca-' + publishers[0],
    'AdSense meta ID와 ads.txt ID가 다릅니다.'
  );
}

async function atomicWrite(relativePath, content, serial) {
  const target = absolutePath(relativePath);
  const fileStat = await stat(target);
  const temporary = target + '.finalize-seo-' + WRITE_RUN_ID + '-' + serial + '.tmp';
  await writeFile(temporary, content, {
    encoding: 'utf8',
    flag: 'wx',
    mode: fileStat.mode
  });
  try {
    await rename(temporary, target);
  } catch (error) {
    await unlink(temporary).catch(() => {});
    throw error;
  }
}

async function writePlans(plans) {
  const changed = plans.filter((plan) => plan.before !== plan.after);
  let serial = 0;
  for (const plan of changed) {
    serial += 1;
    await atomicWrite(plan.relativePath, plan.after, serial);
  }
  for (const plan of changed) {
    const written = await readFile(absolutePath(plan.relativePath), 'utf8');
    assert(written === plan.after, plan.relativePath + ': 쓰기 후 바이트 검증 실패');
  }
}

function parseMode(argumentsList) {
  const known = new Set(['--check', '--write', '--help']);
  for (const argument of argumentsList) {
    assert(known.has(argument), '알 수 없는 옵션: ' + argument);
  }
  if (argumentsList.includes('--help')) return 'help';
  assert(
    !(argumentsList.includes('--check') && argumentsList.includes('--write')),
    '--check와 --write를 동시에 사용할 수 없습니다.'
  );
  return argumentsList.includes('--write') ? 'write' : 'check';
}

function printUsage() {
  console.log('사용법:');
  console.log('  node scripts/finalize-seo.mjs --check');
  console.log('  node scripts/finalize-seo.mjs --write');
  console.log('');
  console.log('--check는 파일을 쓰지 않으며 변경 필요 시 종료 코드 1을 반환합니다.');
  console.log('--write는 127개 대상과 모든 불변 조건을 메모리에서 검증한 뒤에만 씁니다.');
}

export async function finalizeSeo(mode = 'check') {
  assert(mode === 'check' || mode === 'write', 'mode는 check 또는 write여야 합니다.');
  await validateAdsTxt();
  const files = await listHtmlFiles();
  assert(
    files.length === EXPECTED_HTML_COUNT,
    '안전 중단: 대상 HTML이 127개가 아닙니다. (현재 ' + files.length + '개)'
  );
  const pages = await readPages(files);
  const categoryIndex = buildCategoryIndex(pages);
  const plans = pages.map((page) => transformPage(page, categoryIndex));
  const outputRecords = plans.map((plan) => ({
    relativePath: plan.relativePath,
    ...plan.outputMetadata
  }));
  validateGlobal(pages, outputRecords);

  const changed = plans.filter((plan) => plan.before !== plan.after);
  console.log('검사 대상: HTML ' + pages.length + '개 / 계산기 '
    + EXPECTED_CALCULATOR_COUNT + '개');
  console.log('변경 필요: ' + changed.length + '개');
  for (const [operation, count] of operationSummary(plans)) {
    console.log('  ' + operation + ': ' + count + '개');
  }

  if (mode === 'check') {
    if (changed.length > 0) {
      console.error('검사 결과: 변경이 필요합니다. --write 실행 전 Git 백업 커밋을 확인하세요.');
    } else {
      console.log('검사 결과: 모든 SEO 정규화 조건을 충족합니다.');
    }
    return { changed: changed.length, plans: plans, valid: true };
  }

  console.log('쓰기 전 검증 완료. 변경 파일을 원자적으로 교체합니다.');
  await writePlans(plans);
  console.log('쓰기 및 재읽기 검증 완료: ' + changed.length + '개');
  return { changed: changed.length, plans: plans, valid: true };
}

const cliProcess = typeof globalThis.process === 'object' ? globalThis.process : null;
const invokedAsCli = cliProcess && cliProcess.argv && cliProcess.argv[1] &&
  path.resolve(cliProcess.argv[1]) === fileURLToPath(import.meta.url);
if (invokedAsCli) {
  const cliMode = parseMode(cliProcess.argv.slice(2));
  if (cliMode === 'help') {
    printUsage();
  } else {
    finalizeSeo(cliMode).then(function(result) {
      if (cliMode === 'check' && result.changed) cliProcess.exitCode = 1;
    }).catch((error) => {
      console.error('finalize-seo 실패: ' + error.message);
      cliProcess.exitCode = 1;
    });
  }
}
