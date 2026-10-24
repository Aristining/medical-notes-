'use strict';
(() => {
 const groups=[...document.querySelectorAll('[data-card-group]')];if(!groups.length)return;
 const storageKey='mednotes:card-mastery';
 function read(){try{const value=JSON.parse(localStorage.getItem(storageKey)||'{}');return value&&typeof value==='object'&&!Array.isArray(value)?value:{};}catch{return {};}}
 let mastered=read();
 const toast=document.getElementById('toast');let toastTimer;
 function announce(text){if(!toast)return;toast.textContent=text;toast.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.hidden=true,2500);}
 function persist(){try{localStorage.setItem(storageKey,JSON.stringify(mastered));return true;}catch{return false;}}
 function sync(group){
  const cards=[...group.querySelectorAll('[data-card-id]')];const onlyPending=group.querySelector('[data-card-filter]').getAttribute('aria-pressed')==='true';let done=0;
  for(const card of cards){
   const known=mastered[card.dataset.cardId]===true;done+=known?1:0;card.classList.toggle('is-mastered',known);card.hidden=onlyPending&&known;
   card.querySelector('.card-mastered-label').hidden=!known;
   const button=card.querySelector('[data-card-master]');button.setAttribute('aria-pressed',String(known));button.textContent=known?'改为待巩固':'标记已掌握';button.setAttribute('aria-label',(known?'改为待巩固：':'标记已掌握：')+card.querySelector('summary strong').textContent);
  }
  group.querySelector('[data-card-progress]').textContent=`已掌握 ${done} / ${cards.length}`;
  group.querySelector('[data-card-empty]').hidden=!(onlyPending&&done===cards.length);
 }
 for(const group of groups){
  sync(group);
  group.querySelector('[data-card-filter]').addEventListener('click',e=>{const button=e.currentTarget;const next=button.getAttribute('aria-pressed')!=='true';button.setAttribute('aria-pressed',String(next));button.textContent=next?'显示全部':'只看待巩固';sync(group);});
  group.querySelector('[data-card-close]').addEventListener('click',()=>{for(const card of group.querySelectorAll('[data-card-id]'))card.open=false;});
  group.querySelector('[data-card-shuffle]').addEventListener('click',()=>{const grid=group.querySelector('.knowledge-grid'),cards=[...grid.children];for(let i=cards.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[cards[i],cards[j]]=[cards[j],cards[i]];}if(cards.length>1&&cards.every((card,i)=>card===grid.children[i]))[cards[0],cards[1]]=[cards[1],cards[0]];grid.append(...cards);announce('卡片顺序已打乱');});
  for(const card of group.querySelectorAll('[data-card-id]'))card.querySelector('[data-card-master]').addEventListener('click',e=>{
   const next=mastered[card.dataset.cardId]!==true;if(next)mastered[card.dataset.cardId]=true;else delete mastered[card.dataset.cardId];
   const saved=persist();const filtering=group.querySelector('[data-card-filter]').getAttribute('aria-pressed')==='true';
   if(filtering&&next)group.querySelector('[data-card-filter]').focus();sync(group);
   announce(saved?(next?'已标记掌握':'已加入待巩固'):'状态仅保留在本次阅读中');
  });
 }
 document.getElementById('jumpToCards')?.addEventListener('click',()=>{
  let target=groups[0];for(const group of groups){const heading=document.getElementById(group.dataset.sourceId);if(heading&&heading.getBoundingClientRect().top<=170)target=group;}
  location.hash=target.id;target.scrollIntoView({block:'start'});target.querySelector('summary')?.focus({preventScroll:true});
 });
 window.addEventListener('storage',e=>{if(e.key===storageKey){mastered=read();groups.forEach(sync);}});
})();
