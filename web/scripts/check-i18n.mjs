import fs from "node:fs/promises";
import path from "node:path";
const root=process.cwd();
const flatten=(value,prefix="")=>Object.entries(value).flatMap(([key,item])=>item&&typeof item==="object"&&!Array.isArray(item)?flatten(item,prefix?prefix+"."+key:key):[prefix?prefix+"."+key:key]);
const en=JSON.parse(await fs.readFile(path.join(root,"i18n/locales/en.json"),"utf8"));
const ur=JSON.parse(await fs.readFile(path.join(root,"i18n/locales/ur.json"),"utf8"));
const enKeys=flatten(en),urKeys=flatten(ur),enSet=new Set(enKeys),urSet=new Set(urKeys);
const missing=enKeys.filter(k=>!urSet.has(k)),extra=urKeys.filter(k=>!enSet.has(k));
const sources=[];
async function walk(dir){for(const entry of await fs.readdir(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())await walk(file);else if(/\.(tsx?|jsx?)$/.test(file))sources.push([file,await fs.readFile(file,"utf8")]);}}
for(const dir of ["app","components","hooks","lib","providers"])await walk(path.join(root,dir)).catch(()=>{});
const sourceText=sources.map(([,s])=>s).join("\n");
const used=new Set();
for(const match of sourceText.matchAll(/\bt\s*\(\s*["']([^"']+)["']/g))used.add(match[1].replace(/^.*:/,""));
const dynamicPrefixes=[...sourceText.matchAll(/\bt\s*\(\s*`([A-Za-z0-9_-]+\.[A-Za-z0-9_.-]*)\$\{/g)].map(m=>m[1]);
// Keys referenced from structured data objects (e.g. legalDocs bodyKeys/titleKey).
for(const match of sourceText.matchAll(/\bbodyKeys\s*:\s*\[([\s\S]*?)\]/g)){
  for(const key of match[1].matchAll(/["']([A-Za-z0-9_.-]+)["']/g))used.add(key[1]);
}
for(const match of sourceText.matchAll(/\b(?:titleKey|labelKey|lastUpdatedKey)\s*:\s*["']([A-Za-z0-9_.-]+)["']/g))used.add(match[1]);
const unused=enKeys.filter(k=>!used.has(k)&&!dynamicPrefixes.some(prefix=>k.startsWith(prefix)));
const unknownUsed=[...used].filter(k=>!enSet.has(k));
console.log(`EN_KEYS ${enKeys.length}`);
console.log(`UR_KEYS ${urKeys.length}`);
console.log(`MISSING_IN_UR ${missing.length}${missing.length?": "+missing.join(", "):""}`);
console.log(`EXTRA_IN_UR ${extra.length}${extra.length?": "+extra.join(", "):""}`);
console.log(`UNUSED_KEYS ${unused.length}${unused.length?": "+unused.join(", "):""}`);
console.log(`UNKNOWN_USED_KEYS ${unknownUsed.length}${unknownUsed.length?": "+unknownUsed.join(", "):""}`);
if(missing.length||extra.length||unused.length||unknownUsed.length)process.exitCode=1;
