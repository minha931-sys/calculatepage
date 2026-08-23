#!/usr/bin/env node

import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { inspectRuntimeStability } from './prerender-calculators.mjs';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const calculatorDirectory = path.resolve(scriptDirectory, '..', 'calculators');
const slugs = (await readdir(calculatorDirectory))
  .filter(function(file) { return file.endsWith('.html'); })
  .map(function(file) { return file.slice(0, -5); })
  .sort();

const failures = [];
for (const slug of slugs) {
  const result = await inspectRuntimeStability(slug);
  if (result.errors.length || result.layoutChanged || result.controlsChanged) {
    failures.push({
      slug: slug,
      errors: result.errors,
      layoutChanged: result.layoutChanged,
      controlsChanged: result.controlsChanged
    });
  }
}

console.log('런타임 안정성: ' + slugs.length + '개 검사 / 실패 ' + failures.length + '개');
for (const failure of failures) {
  console.error(JSON.stringify(failure));
}

if (failures.length) process.exitCode = 1;
