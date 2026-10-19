import {readFileSync} from 'node:fs';
const data=JSON.parse(readFileSync(new URL('./institutions.json',import.meta.url),'utf8'));
const fields=['id','name','type','parent','region','address','lat','lng','aliases','source','updatedAt','verified'];
if(data.version!==1||!Array.isArray(data.institutions))throw Error('Unsupported registry format');
const ids=new Set();
for(const x of data.institutions){
 if(Object.keys(x).some(k=>!fields.includes(k)))throw Error('Unexpected field; do not include personnel data');
 if(fields.some(k=>!(k in x)))throw Error('Missing institution field');
 if(typeof x.id!=='string'||!x.id||ids.has(x.id))throw Error('Missing or duplicate institution ID');
 ids.add(x.id);
 if(!x.name||!Number.isFinite(x.lat)||!Number.isFinite(x.lng)||x.lat<32||x.lat>40||x.lng<124||x.lng>132)throw Error('Invalid name or coordinates: '+x.id);
 if(!Array.isArray(x.aliases)||x.aliases.some(a=>typeof a!=='string'))throw Error('Invalid aliases');
}
console.log(`Validated ${ids.size} public institutions. No unexpected fields.`);
