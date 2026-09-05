import { readFile,readdir,writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export async function buildSearchIndex(){
  const index=[];
  for(const file of (await readdir(path.join(root,'calculators'))).filter(file=>file.endsWith('.html')).sort()){
    const html=await readFile(path.join(root,'calculators',file),'utf8');
    const name=html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1].replace(/<[^>]+>/g,'').trim();
    const description=html.match(/<meta name="description" content="([^"]+)"/)?.[1] || '';
    const category=html.match(/data-page-category="([^"]+)"/)?.[1];
    if(!name||!category)throw new Error(file+': search metadata missing');
    index.push({slug:file.slice(0,-5),name,description,category});
  }
  if(index.length!==113)throw new Error('Expected 113 calculators');
  await writeFile(path.join(root,'js/search-index.js'),'/* Generated from published calculator pages. */\nwindow.CP_SEARCH_INDEX = '+JSON.stringify(index).replace(/</g,'\\u003c')+';\n','utf8');
  return {count:index.length};
}
const processObject=globalThis.process;
if(processObject?.argv?.[1]&&path.resolve(processObject.argv[1])===fileURLToPath(import.meta.url))console.log(await buildSearchIndex());
