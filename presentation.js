(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.AzurePresentation=api})(globalThis,()=>{
'use strict';
const tutorials={
 '13:1704':'哦～這裡有個路牌啊！點選畫面上的目的地，就能選擇接下來要前往的地方吧？',
 '16:3761':'在房間裡，想出去玩時，只要點選目的地，再選「民宿大廳」或「海風鎮大街」，就可以出門囉！',
 '16:4389':'只要打開右上角的選單，選擇「保存回憶」，就可以把現在的進度保存下來囉！',
 '16:6818':'嗯…錢包、手機、相機都帶齊了，接下來就點選「民宿大廳」，準備出門吧！'
};
function text(item){return tutorials[item.scene+':'+item.offset]??item.text;}
const cards=new Set(['海風鎮大街','海邊','彩虹天堂','海神寺','帆船公園','商店街','海神寺廟會','試膽大會','醫院','一年後','已儲存進度','是否要儲存進度？','《ＴＨＥ　ＥＮＤ》']);
function isTransientBlank(wait){return wait?.kind==='dialogue'&&wait.flags?.[1]===false&&!wait.text.trim();}
function mode(wait){if(wait.kind==='dialogue'){if(wait.flags?.[1]===false)return (/^第.+章\s*《/.test(wait.text)||cards.has(wait.text.trim()))?'chapter':'fulltext';return'dialogue';}return{choice:'choice',explore:'explore',savepoint:'system',credits:'fulltext',ending:'chapter',missing:'system'}[wait.kind]||'dialogue';}
return{text,mode,tutorials,isTransientBlank};});
