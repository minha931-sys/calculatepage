# AGENTS.md

Coding rules for this static calculator website.
- 관련 없는 파일은 열지말기
- Use only HTML, CSS, and vanilla JavaScript.
- Keep all pages static-hosting friendly.
- Think/work in English; answer the user in Korean.
- Be concise; ask briefly only when unclear.
- Before editing, identify target files and keep changes minimal.
- Do not rewrite, scan, or refactor unrelated code.
- Prefer small targeted patches; show only changed code unless full file is requested.
- Preserve existing site structure, category flow, and shared UI patterns.
- Prioritize mobile UX, speed, SEO, and AdSense/Search Console safety.
- Use placeholders like `예: 1000`; avoid prefilled fake values in user inputs.
- Keep form controls visually consistent, especially input/select height and spacing.
- Calculator pages must be practical: explain inputs, show useful results, and add tables/details when helpful.
- For tax, labor, finance, real estate, or legal-sensitive calculators, label results as estimates and avoid definitive advice.
- Add or update related links, category registration, search data, sitemap, and SEO text when adding calculators.
- If search volume/current facts are requested, verify with web sources before deciding.

Encoding and shared-render safety rules.
- Never edit or rewrite UTF-8 files with PowerShell `Get-Content | Set-Content`, `Out-File`, shell redirection, or line-number replacement scripts.
- Use `apply_patch` for manual edits. If a patch does not match because of encoding or text differences, stop and inspect instead of rewriting the file.
- Treat `js/app.js`, `js/category-pages.js`, shared CSS, and `AGENTS.md` as high-risk shared files because one syntax or encoding error can break the home and category pages.
- Before editing shared files, identify the exact block to change. After editing, run `git diff --check` and inspect the diff for mojibake, broken Korean text, unclosed quotes, or unexpectedly large rewrites.
- Prefer standalone calculator page scripts for calculator-specific logic. Add only small isolated registration blocks to shared files when search, category, or home exposure requires it.
- Do not save files through tools that may change encoding. Korean text must remain readable in the diff before finishing.

When modifying code, answer:

1. 수정 파일
2. 교체/추가할 코드
3. 확인할 점
