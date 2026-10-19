import {readFileSync,writeFileSync} from 'node:fs';
const existing=JSON.parse(readFileSync(new URL('./institutions.json',import.meta.url),'utf8')).institutions;
const pending=JSON.parse(readFileSync(new URL('./pending-institutions.json',import.meta.url),'utf8'));
const key=process.env.KAKAO_REST_API_KEY;if(!key)throw Error('Set KAKAO_REST_API_KEY in the environment. Do not put it in a file.');
const results=[];
for(const item of pending){
 if(!item.name||typeof item.name!=='string')throw Error('Each item needs a public institution name');
 if(existing.some(x=>(x.id===item.id||(x.name===item.name&&x.parent===item.parent))&&Number.isFinite(x.lat)&&Number.isFinite(x.lng)))continue;
 const address=!!item.address;
 const url=new URL(`https://dapi.kakao.com/v2/local/search/${address?'address':'keyword'}.json`);
 url.searchParams.set('query',address?item.address:item.name);url.searchParams.set('size','5');
 const response=await fetch(url,{headers:{Authorization:`KakaoAK ${key}`},signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw Error(`Kakao request failed: ${response.status}`);
 const data=await response.json();
 results.push({id:item.id||'',name:item.name,parent:item.parent||'',needsReview:true,candidates:data.documents.map(x=>({name:x.place_name||x.road_address?.building_name||item.name,address:x.road_address_name||x.road_address?.address_name||x.address_name,lat:Number(x.y),lng:Number(x.x),source:'카카오 로컬 검색',verified:false}))});
}
writeFileSync(new URL('./location-candidates.json',import.meta.url),JSON.stringify(results,null,2));
console.log(`Prepared candidates for ${results.length} missing institutions. Review before updating the registry.`);
