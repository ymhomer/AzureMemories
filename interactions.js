'use strict';
((root,factory)=>{const api=factory();root.AzureInteractions=api;if(typeof module==='object'&&module.exports)module.exports=api;})(globalThis,()=>{
 const places={
 '海風鎮大街':{x:50,y:51,title:'海風鎮大街',direction:'小鎮中心',icon:'◇',description:'沿著大街，前往下一次相遇。'},
 '海邊':{x:78,y:85,title:'海邊',direction:'朝向海岸',icon:'≈',description:'潮聲與海風傳來的方向。'},
 '商店街':{x:80,y:43,title:'商店街',direction:'沿街向右',icon:'⌂',description:'沿著店舖與櫥窗往前走。'},
 '海神寺':{x:20,y:20,title:'海神寺',direction:'往左上坡',icon:'✧',description:'沿著上坡的小路，往寺廟去。'},
 '帆船公園':{x:21,y:54,title:'帆船公園',direction:'沿街向左',icon:'♧',description:'走向樹蔭與公園步道。'},
 '彩虹天堂':{x:44,y:76,title:'彩虹天堂',direction:'回到民宿',icon:'⌂',description:'回到熟悉的民宿與吧台。'},
 '民宿大廳':{x:44,y:76,title:'民宿大廳',direction:'走向大廳',icon:'⌂',description:'前往民宿裡熱鬧的相聚處。'},
 '主角房間':{x:25,y:78,title:'房間',direction:'回房間',icon:'▱',description:'回到旅途中暫住的小房間。'},
 '醫院':{x:82,y:17,title:'醫院',direction:'往鎮內走',icon:'＋',description:'沿著鎮上的道路前往醫院。'}
 };
 function place(text){return places[String(text||'').trim()]||null;}
 function kind(w,e){if(w?.kind!=='choice')return null;const opts=w.options.filter(o=>o.text?.trim()).map(o=>o.text.trim()),real=opts.filter(x=>!['下一頁','取消'].includes(x));if(e?.id===51&&real.every(x=>['攻擊','防禦','逃跑'].includes(x)))return'combat';if(real.length&&real.every(x=>place(x)))return'route';if(real.length&&real.every(x=>['是','否'].includes(x))&&/存檔|結束/.test(e?.title||''))return'save';if(e?.id===26)return'wardrobe';if(e?.id===103)return opts.includes('雪綿冰')?'food':'drink';return'conversation';}
 function flatten(cs,out=[]){for(const c of cs||[]){if(c.kind==='dialogue')out.push(c);if(c.kind==='choice')for(const o of c.options||[])flatten(o.commands,out);if(c.kind==='conditional'){flatten(c.then,out);flatten(c.else,out);}}return out;}
 function actionInfo(action,engine){const actor=engine.scene().actors.find(a=>a.id===action.actor),selected=actor&&engine.selected(actor),commands=selected?.page.commands||[],choice=commands.find(c=>c.kind==='choice');if(choice&&kind(choice,engine.scene())==='route')return{type:'route',label:'查看路牌',subtitle:'看看現在可以往哪裡走',icon:'↗'};const line=flatten(commands).find(x=>x.has_name);if(line)return{type:'talk',label:/^[？?]+$/.test(line.name.trim())?'和眼前的人交談':'與'+line.name.trim()+'交談',subtitle:'聽聽這裡的故事',icon:'…'};return{type:'inspect',label:choice?'看看附近的去處':'查看附近',subtitle:choice?'選擇下一步行動':'留意眼前的小小發現',icon:'✧'};}
 class Battle{
  constructor(){this.reset();}reset(){this.player=1000;this.enemy=1000;this.round=1;this.lastKey=null;this.message='';this.flash='';}
  observe(w){if(w?.kind==='dialogue'&&w.key===this.lastKey)return;this.flash='';if(w?.kind==='choice'){this.round={2818:1,3688:2,4247:3}[w.offset]||this.round;return;}if(w?.kind!=='dialogue'||w.key===this.lastKey)return;this.lastKey=w.key;const text=w.text.normalize('NFKC');if(/我方損傷(\d+)/.test(text)){this.player=Math.max(0,this.player-Number(RegExp.$1));this.flash='player';}else if(/劉蠻減傷(\d+)/.test(text)){this.enemy=Math.max(0,this.enemy-Number(RegExp.$1));this.flash='enemy';}else if(/MISS/i.test(text))this.flash='miss';else if(/防禦成功/.test(text))this.flash='guard';this.message=text;}
 }
 function svgMap(options,current){const pos=(/房間/.test(current)?places['主角房間']:place(current))||places['海風鎮大街'],points=options.filter(o=>place(o.text)).map(o=>place(o.text));return{current:pos,points};}
 return{places,place,kind,actionInfo,Battle,svgMap};
});
