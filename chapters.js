'use strict';
((root,factory)=>{const api=factory();root.AzureChapters=api;if(typeof module==='object'&&module.exports)module.exports=api;})(globalThis,()=>{
 class Memory {
  constructor(data,stored){this.data=data;this.lines=new Map();this.headings=new Map(data.chapters.map((c,i)=>[c.heading,i+1]));const walk=(commands,scene)=>{for(const c of commands||[]){if(c.kind==='dialogue')this.lines.set(scene+':'+c.offset,{...c,scene,key:scene+':'+c.offset});for(const o of c.options||[])walk(o.commands,scene);walk(c.then,scene);walk(c.else,scene);}};for(const e of data.events)for(const a of e.actors)for(const p of a.pages)walk(p.commands,e.id);this.book={schema:1,source:data.sourceHash,chapters:{}};
   if(stored?.schema===1&&stored.source===data.sourceHash)for(const [id,c]of Object.entries(stored.chapters||{})){const n=Number(id);if(!Number.isInteger(n)||n<0||n>data.chapters.length)continue;const keys=this.clean(c?.keys);if(keys.length)this.book.chapters[n]={keys,previousKeys:this.clean(c.previousKeys),variants:Array.isArray(c.variants)?c.variants.filter(Array.isArray).map(x=>this.clean(x)).filter(x=>x.length):[],updatedAt:typeof c.updatedAt==='string'?c.updatedAt:''};}
  }
  clean(keys){return [...new Set((Array.isArray(keys)?keys:[]).slice(0,6000).filter(k=>typeof k==='string'&&this.lines.has(k)&&this.lines.get(k).text.trim()))];}
  capture(snapshot){if(!snapshot||snapshot.source!==this.data.sourceHash||!Array.isArray(snapshot.seen))return false;const groups=new Map();let chapter=0;for(const key of this.clean(snapshot.seen)){const line=this.lines.get(key),number=this.headings.get(line.text);if(number!==undefined)chapter=number;if(!groups.has(chapter))groups.set(chapter,[]);groups.get(chapter).push(key);}let changed=false;
   for(const [number,keys]of groups){const old=this.book.chapters[number];if(old&&keys.every((k,i)=>old.keys[i]===k))continue;const diverged=old&&!old.keys.every((k,i)=>keys[i]===k);const variants=this.paths(number);this.book.chapters[number]={keys,previousKeys:diverged?old.keys:old?.previousKeys||[],variants,updatedAt:new Date().toISOString()};changed=true;}return changed;
  }
  entries(number,previous=false){const c=this.book.chapters[number],keys=(previous?c?.previousKeys:c?.keys)||[];return keys.map(k=>{const c=this.lines.get(k);return{...c,flags:c.flags?.slice()};});}
  list(){return Array.from({length:this.data.chapters.length+1},(_,n)=>{const c=this.book.chapters[n];return{number:n,title:n?this.data.chapters[n-1].title:'海風之前',heading:n?this.data.chapters[n-1].heading:'海風之前 · 序章',count:c?.keys.length||0,previousCount:c?.previousKeys?.length||0};});}
  paths(number){const c=this.book.chapters[number];if(!c)return[];const paths=[];for(const raw of [c.keys,c.previousKeys,...(c.variants||[])]){const keys=this.clean(raw);if(!keys.length||paths.some(p=>keys.every((k,i)=>p[i]===k)))continue;for(let i=paths.length-1;i>=0;i--)if(paths[i].every((k,j)=>keys[j]===k))paths.splice(i,1);paths.push(keys);}return paths;}
  routeEntries(number,index=0){return(this.paths(number)[index]||[]).map(k=>({...this.lines.get(k)}));}
  tree(number){const paths=this.paths(number);let common=paths[0]?.length||0;for(const p of paths)for(let i=0;i<common;i++)if(p[i]!==paths[0][i]){common=i;break;}return{number,common,paths:paths.map((keys,index)=>{const segments=[];for(const [at,key]of keys.entries()){const line=this.lines.get(key),last=segments[segments.length-1];if(last?.scene===line.scene)last.count++;else segments.push({scene:line.scene,at,count:1,title:this.data.events.find(e=>e.id===line.scene)?.title||'旅途片段'});}return{index,count:keys.length,segments};})};}
  serialize(){return JSON.stringify(this.book);}
 }
 return{Memory};
});
