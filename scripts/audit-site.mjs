import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_ORIGIN = 'https://calculatepage.com';
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = path.resolve(SCRIPT_DIR, '..');
const HTML_DIRS = ['', 'calculators', 'categories', 'pages'];
const FORBIDDEN_COPY = [
  '언제 쓰면 좋나요', '결과를 빠르게 비교', '입력한 조건을 기준으로',
  '같은 단위와 기간', '원자료와 최종 조건', '실제 신청·계약·신고 전',
  '판매가, 견적, 근무시간, 단가', '금액, 이자, 세금, 공제, 수수료',
  '제도·요율·상품 조건', '2026년 7월 10일'
];

function matches(text, regex) {
  return [...text.matchAll(regex)].map(match => match[1] ?? match[0]);
}

function first(text, regex) {
  return text.match(regex)?.[1]?.trim() ?? '';
}

function attribute(tag, name) {
  return tag.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, 'i'))?.[1]?.trim() ?? '';
}

function metaContent(html, attributeName, attributeValue) {
  const tag = [...html.matchAll(/<meta\b[^>]*>/gi)]
    .map(match => match[0])
    .find(item => attribute(item, attributeName).toLowerCase() === attributeValue.toLowerCase());
  return tag ? attribute(tag, 'content') : '';
}

function linkHref(html, relation) {
  const tag = [...html.matchAll(/<link\b[^>]*>/gi)]
    .map(match => match[0])
    .find(item => attribute(item, 'rel').toLowerCase().split(/\s+/).includes(relation.toLowerCase()));
  return tag ? attribute(tag, 'href') : '';
}

function textOnly(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(?:nbsp|amp|lt|gt|quot|#39);/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function expectedUrl(relativePath) {
  const posix = relativePath.split(path.sep).join('/');
  return `${SITE_ORIGIN}/${posix === 'index.html' ? '' : posix}`;
}

function localTarget(from, href) {
  if (!href || /^(?:[a-z]+:|#|\/\/)/i.test(href)) return null;
  const clean = href.split(/[?#]/)[0];
  if (!clean) return null;
  const base = path.posix.dirname('/' + from.split(path.sep).join('/'));
  let resolved = clean.startsWith('/') ? clean : path.posix.resolve(base, clean);
  if (resolved.endsWith('/')) resolved += 'index.html';
  if (!path.posix.extname(resolved)) resolved += '.html';
  return resolved.replace(/^\//, '');
}

function tokens(text) {
  return new Set(textOnly(text).toLowerCase().split(/[^0-9a-zㄱ-힝]+/u).filter(word => word.length > 1));
}

function similarity(left, right) {
  if (!left.size || !right.size) return 0;
  let common = 0;
  for (const word of left) if (right.has(word)) common += 1;
  return common / (left.size + right.size - common);
}

async function exists(root, relativePath) {
  try {
    return (await stat(path.join(root, relativePath))).isFile();
  } catch {
    return false;
  }
}

async function htmlFiles(root) {
  const files = [];
  for (const directory of HTML_DIRS) {
    const absolute = path.join(root, directory);
    for (const name of await readdir(absolute)) {
      if (!name.endsWith('.html')) continue;
      files.push(path.join(directory, name) || name);
    }
  }
  return files.sort();
}

function add(map, key, file) {
  if (!key) return;
  const values = map.get(key) ?? [];
  values.push(file);
  map.set(key, values);
}

function duplicateEntries(map) {
  return [...map.entries()].filter(([, files]) => files.length > 1).map(([value, files]) => ({ value, files }));
}

export async function auditSite(root = DEFAULT_ROOT) {
  const files = await htmlFiles(root);
  const issues = [];
  const warnings = [];
  const records = [];
  const uniqueness = {
    title: new Map(), description: new Map(), h1: new Map(), canonical: new Map()
  };
  if (files.length !== 127) issues.push(`HTML 수 불일치 (${files.length}개, 기대 127개)`);

  for (const relativePath of files) {
    const html = await readFile(path.join(root, relativePath), 'utf8');
    const title = first(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
    const description = metaContent(html, 'name', 'description');
    const h1s = matches(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/gi).map(textOnly);
    const canonical = linkHref(html, 'canonical');
    const ogTitle = metaContent(html, 'property', 'og:title');
    const ogDescription = metaContent(html, 'property', 'og:description');
    const ogUrl = metaContent(html, 'property', 'og:url');
    const ids = matches(html, /\sid=["']([^"']+)["']/gi);
    const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
    const headings = [...html.matchAll(/<h([1-6])\b[^>]*>/gi)].map(match => Number(match[1]));
    const jumps = headings.filter((level, index) => index > 0 && level - headings[index - 1] > 1);
    const isCalculator = relativePath.startsWith(`calculators${path.sep}`);
    const expected = expectedUrl(relativePath);
    const lang = first(html, /<html\b[^>]*lang=["']([^"']+)["']/i);
    const viewport = /<meta\s+[^>]*name=["']viewport["']/i.test(html);
    const noindex = /<meta\s+[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html);
    const visible = textOnly(html);

    for (const [key, value] of Object.entries({ title, description, h1: h1s[0] ?? '', canonical })) add(uniqueness[key], value, relativePath);
    if (!title) issues.push(`${relativePath}: title 누락`);
    if (!description) issues.push(`${relativePath}: meta description 누락`);
    if (h1s.length !== 1) issues.push(`${relativePath}: H1 ${h1s.length}개`);
    if (canonical !== expected) issues.push(`${relativePath}: canonical 불일치 (${canonical || '누락'})`);
    if (!lang.toLowerCase().startsWith('ko')) issues.push(`${relativePath}: html lang 누락/오류`);
    if (!viewport) issues.push(`${relativePath}: viewport 누락`);
    if (noindex) issues.push(`${relativePath}: noindex`);
    if (!ogTitle || !ogDescription || ogUrl !== expected) issues.push(`${relativePath}: Open Graph 정보 누락/URL 불일치`);
    if (duplicateIds.length) issues.push(`${relativePath}: 중복 ID ${duplicateIds.join(', ')}`);
    if (jumps.length) warnings.push(`${relativePath}: heading 단계 건너뜀`);

    const schemas = matches(html, /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
    const schemaTypes = [];
    schemas.forEach((raw, index) => {
      try {
        const parsed = JSON.parse(raw);
        const nodes = parsed['@graph'] ?? [parsed];
        for (const node of nodes) if (node?.['@type']) schemaTypes.push(node['@type']);
      } catch (error) {
        issues.push(`${relativePath}: JSON-LD ${index + 1} 문법 오류 (${error.message})`);
      }
    });
    const duplicatedSchemaTypes = [...new Set(schemaTypes.filter((type, index) => schemaTypes.indexOf(type) !== index))];
    if (duplicatedSchemaTypes.length) issues.push(`${relativePath}: 중복 schema ${duplicatedSchemaTypes.join(', ')}`);
    if (isCalculator) {
      if (!schemaTypes.includes('WebApplication')) issues.push(`${relativePath}: 정적 WebApplication 누락`);
      if (!schemaTypes.includes('BreadcrumbList')) issues.push(`${relativePath}: 정적 BreadcrumbList 누락`);
      if (!/<section\b[^>]*class=["'][^"']*calculator-box/i.test(html)) issues.push(`${relativePath}: 정적 계산 입력 UI 누락`);
      if (!/\bsrc=["']\/js\/static-calculator-runtime\.js["']/i.test(html)) issues.push(`${relativePath}: 정적 계산 런타임 보호 스크립트 누락`);
      if (/\bsrc=["']\/js\/(?:site-audit-fix|calculator-content)\.js["']/i.test(html)) issues.push(`${relativePath}: 이전 동적 콘텐츠 스크립트 참조 잔류`);
      const required = [
        ['editorial-input', '입력 설명'], ['editorial-formula', '공식'], ['editorial-example', '숫자 예시'],
        ['editorial-result', '결과 해석'], ['editorial-caution', '주의사항'],
        ['editorial-use-cases', '구체적 활용 상황'], ['editorial-checks', '검산 체크리스트'],
        ['editorial-faq', '고유 FAQ'], ['editorial-review', '검수 정보'], ['related', '관련 계산기']
      ];
      for (const [className, label] of required) if (!new RegExp(`class=["'][^"']*\\b${className}\\b`, 'i').test(html)) issues.push(`${relativePath}: 정적 ${label} 누락`);
      const main = first(html, /<main\b[^>]*>([\s\S]*?)<\/main>/i);
      const mainTextLength = textOnly(main).length;
      if (mainTextLength < 1400) issues.push(`${relativePath}: 고유 본문 부족 (${mainTextLength}자, 최소 1400자)`);
      const editorialBlock = first(main, /<div\b[^>]*data-calculator-editorial=["'][^"']+["'][^>]*>([\s\S]*?)<\/div>/i);
      for (const [className, label, minimum] of [
        ['editorial-input', '입력 설명', 40],
        ['editorial-formula', '공식', 40],
        ['editorial-example', '숫자 예시', 40],
        ['editorial-result', '결과 해석', 30]
      ]) {
        const block = first(editorialBlock, new RegExp(`<section\\b[^>]*class=["'][^"']*\\b${className}\\b[^"']*["'][^>]*>([\\s\\S]*?)<\\/section>`, 'i'));
        const length = textOnly(block).length;
        if (length < minimum) issues.push(`${relativePath}: ${label} 내용 부족 (${length}자, 최소 ${minimum}자)`);
      }
      const faqBlock = first(main, /<section\b[^>]*class=["'][^"']*\beditorial-faq\b[^"']*["'][^>]*>([\s\S]*?)<\/section>/i);
      if (matches(faqBlock, /<details\b/gi).length < 3) issues.push(`${relativePath}: FAQ 3개 미만`);
      const useCaseBlock = first(main, /<section\b[^>]*class=["'][^"']*\beditorial-use-cases\b[^"']*["'][^>]*>([\s\S]*?)<\/section>/i);
      if (matches(useCaseBlock, /<li\b/gi).length < 2) issues.push(`${relativePath}: 활용 상황 2개 미만`);
      const checkBlock = first(main, /<section\b[^>]*class=["'][^"']*\beditorial-checks\b[^"']*["'][^>]*>([\s\S]*?)<\/section>/i);
      if (matches(checkBlock, /<li\b/gi).length < 3) issues.push(`${relativePath}: 검산 체크리스트 3개 미만`);
      const cautionBlock = first(main, /<section\b[^>]*class=["'][^"']*\beditorial-caution\b[^"']*["'][^>]*>([\s\S]*?)<\/section>/i);
      if (matches(cautionBlock, /<li\b/gi).length < 2) issues.push(`${relativePath}: 주의사항 2개 미만`);
      const reviewBlock = first(main, /<aside\b[^>]*class=["'][^"']*\beditorial-review\b[^"']*["'][^>]*>([\s\S]*?)<\/aside>/i);
      if (!reviewBlock.includes('2026-08-17')) issues.push(`${relativePath}: 최신 검수일 누락`);
      if (matches(html, /data-calculator-editorial=["'][^"']+["']/gi).length !== 1) issues.push(`${relativePath}: 계산기 본문 중복/누락`);
      if (matches(html, /<h2>관련 계산기<\/h2>/gi).length !== 1) issues.push(`${relativePath}: 관련 계산기 섹션 중복/누락`);
      if (/__staticCalculatorGuide|restoreStaticCalculatorGuide/.test(html)) issues.push(`${relativePath}: 이전 콘텐츠 복원 코드 잔류`);
    } else if (relativePath === 'index.html' && !schemaTypes.includes('WebSite')) {
      issues.push('index.html: WebSite schema 누락');
    }
    if (!/href=["']\/pages\/methodology\.html["']/i.test(html)) issues.push(`${relativePath}: 검수 기준 링크 누락`);

    for (const phrase of FORBIDDEN_COPY) if (visible.includes(phrase)) warnings.push(`${relativePath}: 범용 문구 "${phrase}"`);
    if (/\b(?:undefined|null|NaN|Infinity|TODO)\b/.test(visible)) issues.push(`${relativePath}: 임시/오류 문구 노출 위험`);

    const refs = [...html.matchAll(/<(?:a|img|script|link)\b[^>]*(?:href|src)=["']([^"']+)["'][^>]*>/gi)].map(match => match[1]);
    for (const href of refs) {
      const target = localTarget(relativePath, href);
      if (target && !await exists(root, target)) issues.push(`${relativePath}: 깨진 경로 ${href}`);
    }
    const images = [...html.matchAll(/<img\b([^>]*)>/gi)].map(match => match[1]);
    if (images.some(attributes => !/\balt=["'][^"']*["']/i.test(attributes))) issues.push(`${relativePath}: img alt 누락`);
    const selfLinks = refs.filter(href => localTarget(relativePath, href) === relativePath
      && !(relativePath === 'index.html' && href === '/'));
    if (selfLinks.length) warnings.push(`${relativePath}: 자기 자신 링크 ${selfLinks.join(', ')}`);

    const category = isCalculator ? first(html, /href=["']\/categories\/([a-z-]+)\.html["']/i) : '';
    const relatedBlock = isCalculator ? [...html.matchAll(/<div\b[^>]*class=["'][^"']*\brelated\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi)].at(-1)?.[1] ?? '' : '';
    const relatedSlugs = isCalculator ? matches(relatedBlock, /href=["']\/calculators\/([^"']+)\.html["']/gi) : [];
    records.push({ relativePath, canonical, title, description, category, relatedSlugs, bodyTokens: tokens(first(html, /<main\b[^>]*>([\s\S]*?)<\/main>/i)) });
  }

  for (const [key, map] of Object.entries(uniqueness)) {
    for (const entry of duplicateEntries(map)) issues.push(`중복 ${key}: ${entry.files.join(', ')}`);
  }

  const sitemap = await readFile(path.join(root, 'sitemap.xml'), 'utf8');
  const sitemapUrls = new Set(matches(sitemap, /<loc>([^<]+)<\/loc>/gi));
  const sitemapEntries = [...sitemap.matchAll(
    /<url>\s*<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>\s*<\/url>/gi
  )].map(match => ({ url: match[1], lastmod: match[2] }));
  const unchangedPolicyDates = new Map([
    [`${SITE_ORIGIN}/pages/contact.html`, '2026-07-31'],
    [`${SITE_ORIGIN}/pages/privacy.html`, '2026-07-31'],
    [`${SITE_ORIGIN}/pages/terms.html`, '2026-07-29']
  ]);
  const currentContentDates = new Map([
    [`${SITE_ORIGIN}/`, '2026-08-23'],
    [`${SITE_ORIGIN}/pages/about.html`, '2026-08-23'],
    [`${SITE_ORIGIN}/pages/guides.html`, '2026-08-23'],
    [`${SITE_ORIGIN}/pages/methodology.html`, '2026-08-23']
  ]);
  if (sitemapEntries.length !== files.length) {
    issues.push(`sitemap: lastmod 누락 (${sitemapEntries.length}개, 기대 ${files.length}개)`);
  }
  for (const entry of sitemapEntries) {
    const changedInReview = entry.url.startsWith(`${SITE_ORIGIN}/calculators/`)
      || entry.url.startsWith(`${SITE_ORIGIN}/categories/`)
    const expectedLastmod = currentContentDates.get(entry.url)
      || (changedInReview ? '2026-08-17' : unchangedPolicyDates.get(entry.url));
    if (!expectedLastmod || entry.lastmod !== expectedLastmod) {
      issues.push(`sitemap: ${entry.url} lastmod 불일치 (${entry.lastmod})`);
    }
  }
  const publicCanonicals = new Set(records.map(record => record.canonical).filter(Boolean));
  for (const url of sitemapUrls) {
    const relativePath = url === `${SITE_ORIGIN}/` ? 'index.html' : url.replace(`${SITE_ORIGIN}/`, '');
    if (!url.startsWith(`${SITE_ORIGIN}/`) || !await exists(root, relativePath)) issues.push(`sitemap: 존재하지 않는 URL ${url}`);
    if (!publicCanonicals.has(url)) issues.push(`sitemap: canonical이 아닌 URL ${url}`);
  }
  for (const canonical of publicCanonicals) if (!sitemapUrls.has(canonical)) issues.push(`sitemap: canonical 누락 ${canonical}`);

  const robots = await readFile(path.join(root, 'robots.txt'), 'utf8');
  if (/Disallow:\s*\/(?:\s*$|calculators|categories|css|js)/mi.test(robots)) issues.push('robots.txt: 주요 경로 차단');
  if (!robots.includes(`${SITE_ORIGIN}/sitemap.xml`)) issues.push('robots.txt: sitemap URL 누락/오류');

  const calculatorRecords = records.filter(record => record.relativePath.startsWith(`calculators${path.sep}`));
  if (calculatorRecords.length !== 114) issues.push(`계산기 수 불일치 (${calculatorRecords.length}개, 기대 114개)`);
  const calculatorBySlug = new Map(calculatorRecords.map(record => [path.basename(record.relativePath, '.html'), record]));
  for (const record of calculatorRecords) {
    for (const slug of record.relatedSlugs) {
      const target = calculatorBySlug.get(slug);
      if (!target) issues.push(`${record.relativePath}: 관련 계산기 대상 없음 (${slug})`);
      else if (record.category && target.category && record.category !== target.category) issues.push(`${record.relativePath}: 주제 불일치 관련 계산기 (${slug})`);
    }
  }
  const similar = [];
  for (let left = 0; left < calculatorRecords.length; left += 1) {
    for (let right = left + 1; right < calculatorRecords.length; right += 1) {
      const score = similarity(calculatorRecords[left].bodyTokens, calculatorRecords[right].bodyTokens);
      if (score >= 0.82) similar.push({ files: [calculatorRecords[left].relativePath, calculatorRecords[right].relativePath], score: Number(score.toFixed(3)) });
    }
  }
  if (similar.length) warnings.push(...similar.map(pair => `본문 유사 ${pair.score}: ${pair.files.join(', ')}`));

  return {
    ok: issues.length === 0,
    summary: { html: files.length, calculators: calculatorRecords.length, sitemap: sitemapUrls.size, issues: issues.length, warnings: warnings.length },
    issues: [...new Set(issues)], warnings: [...new Set(warnings)]
  };
}

if (typeof process !== 'undefined' && process.argv?.[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = await auditSite(process.cwd());
  const json = process.argv.includes('--json');
  console.log(json ? JSON.stringify(report, null, 2) : [
    `HTML ${report.summary.html} | 계산기 ${report.summary.calculators} | sitemap ${report.summary.sitemap}`,
    `오류 ${report.summary.issues} | 경고 ${report.summary.warnings}`,
    ...report.issues.map(issue => `ERROR ${issue}`),
    ...report.warnings.map(warning => `WARN  ${warning}`)
  ].join('\n'));
  process.exitCode = report.ok ? 0 : 1;
}
