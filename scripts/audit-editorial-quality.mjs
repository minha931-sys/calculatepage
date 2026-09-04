#!/usr/bin/env node

import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const calculatorDirectory = path.resolve(scriptDirectory, '..', 'calculators');
const files = (await readdir(calculatorDirectory))
  .filter(function(file) { return file.endsWith('.html'); })
  .sort();

function decodeEntities(value) {
  return String(value)
    .replace(/&nbsp;/gi, ' ')
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

function visibleText(value) {
  return decodeEntities(String(value).replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

function section(html, className) {
  const expression = new RegExp(
    '<section\\b[^>]*class="[^"]*\\bcontent-block\\b[^"]*\\b' + className + '\\b[^"]*"[^>]*>([\\s\\S]*?)<\\/section>'
  );
  const match = html.match(expression);
  return match ? match[1] : '';
}

function countTag(html, tagName) {
  return (html.match(new RegExp('<' + tagName + '\\b', 'g')) || []).length;
}

function addOccurrence(map, text, slug) {
  if (!map.has(text)) map.set(text, []);
  map.get(text).push(slug);
}

const failures = [];
const detailTitles = new Map();
const detailBullets = new Map();
const editorialParagraphs = new Map();

for (const file of files) {
  const slug = file.slice(0, -5);
  const html = await readFile(path.join(calculatorDirectory, file), 'utf8');
  const editorialMatch = html.match(
    /<div\b[^>]*class="[^"]*\bcalculator-editorial\b[^"]*"[^>]*>[\s\S]*?<\/div>/
  );
  const editorial = editorialMatch ? editorialMatch[0] : '';
  const detail = section(html, 'editorial-detail');
  const titleMatch = detail.match(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/);
  const title = titleMatch ? visibleText(titleMatch[1]) : '';
  const detailItems = [...detail.matchAll(/<li>([\s\S]*?)<\/li>/g)]
    .map(function(match) { return visibleText(match[1]); });
  const editorialCharacters = visibleText(editorial).replace(/\s/g, '').length;
  const detailCharacters = visibleText(detail).replace(/\s/g, '').length;
  const useCaseCount = countTag(section(html, 'editorial-use-cases'), 'li');
  const checkCount = countTag(section(html, 'editorial-checks'), 'li');
  const faqCount = countTag(section(html, 'editorial-faq'), 'details');

  if (!editorial) failures.push(slug + ': editorial 본문 없음');
  if (editorialCharacters < 900) {
    failures.push(slug + ': editorial 본문이 900자 미만 (' + editorialCharacters + '자)');
  }
  if (!title) failures.push(slug + ': 고유 심층 해설 제목 없음');
  if (detailItems.length !== 3) {
    failures.push(slug + ': 심층 해설 항목이 3개가 아님 (' + detailItems.length + '개)');
  }
  if (detailCharacters < 150) {
    failures.push(slug + ': 심층 해설이 150자 미만 (' + detailCharacters + '자)');
  }
  if (useCaseCount < 2) failures.push(slug + ': 사용 상황이 2개 미만');
  if (checkCount !== 3) failures.push(slug + ': 확인 항목이 3개가 아님');
  if (faqCount !== 3) failures.push(slug + ': FAQ가 3개가 아님');

  if (title) addOccurrence(detailTitles, title, slug);
  for (const item of detailItems) addOccurrence(detailBullets, item, slug);
  const auditableEditorial = editorial.replace(
    /<header\b[^>]*class="[^"]*\beditorial-guide-head\b[^"]*"[^>]*>[\s\S]*?<\/header>/,
    ''
  );
  for (const match of auditableEditorial.matchAll(/<(?:p|li)[^>]*>([\s\S]*?)<\/(?:p|li)>/g)) {
    const paragraph = visibleText(match[1]);
    if (paragraph.length >= 30) addOccurrence(editorialParagraphs, paragraph, slug);
  }
}

for (const [title, slugs] of detailTitles) {
  if (slugs.length > 1) failures.push('중복 심층 해설 제목: ' + title + ' (' + slugs.join(', ') + ')');
}
for (const [item, slugs] of detailBullets) {
  if (slugs.length > 1) failures.push('중복 심층 해설 문장: ' + item + ' (' + slugs.join(', ') + ')');
}
for (const [paragraph, slugs] of editorialParagraphs) {
  if (slugs.length > 1) failures.push('중복 editorial 문단: ' + paragraph + ' (' + slugs.join(', ') + ')');
}

console.log('콘텐츠 품질: ' + files.length + '개 검사 / 실패 ' + failures.length + '개');
for (const failure of failures) console.error(failure);
if (failures.length && typeof globalThis.process === 'object') globalThis.process.exitCode = 1;

export const editorialAuditResult = {
  calculatorCount: files.length,
  failureCount: failures.length,
  failures: failures
};
