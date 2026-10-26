import { Marked } from 'marked';
import { createHash } from 'node:crypto';
import vocabulary from './flashcard-terms.json' with { type: 'json' };

const lexer=new Marked();
const skipSection=/目录|文件索引|阅读导航|学习顺序|阅读方式|复习顺序|记忆策略|原始资料|原课件定位|回看|页码|来源|补充阅读|整理口径|核对说明|笔误|自测|答题|自检|复习安排|病例|历史示例|旧分组|旧折点|知识框架|核心脉络|学习方法|课程模块|学时|复习提纲|考前速记|高频考点|记忆口诀|发展史|练习看图/;
const generic=/^(?:组成|特点|特征|功能|作用|机制|定义|概念|意义|优点|缺点|局限|方法|结构|部位|位置|类型|分类|过程|结果|含义|对象|用途|读数|来源|临床|病理|光镜|电镜|比较|项目|正常|异常|主要改变|代表线索|常见菌群|检测思路|运输路径|关键结论|时间|形式|说明|核心|重点|表型|基因|蛋白产物|比较项|单株|提示|补充|辨析|男性|女性|其他|例外|参考范围|教学示例|课件口径|基本概念|最重要的三层区分)$/;
const tableMeaning=/含义|定义|机制|原理|说明|功能|作用|特点|特征|联系|意义|过程|要点|疾病|病原|检测|检验|临床|超微|分泌|胚层|起源/;
export function plain(text){return String(text).replace(/!?\[([^\]]+)\]\([^)]*\)/g,'$1').replace(/\*\*([^*]+)\*\*/g,'$1').replace(/`([^`]+)`/g,'$1').replace(/(?<!\w)_([^_]+)_(?!\w)/g,'$1').replace(/<\/?[a-z][^>]*>/gi,'').replace(/\s+/g,' ').trim();}
function termName(text){return plain(text).replace(/^(?:[一二三四五六七八九十]+[、.]\s*|\d+(?:\.\d+)*(?:[.、]\s*|\s+)|[（(]\d+[）)]\s*)/,'').replace(/【[^】]+】|\[高频\]|[：:]$/g,'').replace(/（课件.*$/,'').replace(/([）)])(?:自|是|指|的特点).*$/,'$1').replace(/[（(]\d+%\+?[）)]/g,'').trim();}
const termKey=text=>{const key=termName(text).toLowerCase().replace(/[（(].*$/,'').replace(/\s+/g,'').trim();return key.startsWith('最低抑菌浓度')?'mic':key==='临床折点breakpoint'?'临床折点':key;};
function validTerm(text){return text.length>=2&&text.length<=60&&!generic.test(text)&&/[\p{L}]/u.test(text)&&!/[。？！?：:→=＝；;]/.test(text)&&!/^第\d|^课件|^图内|^对应|^建议|^为什么|^如何|^不能|^不要|^注意|^记忆|^临床联系|^区分|^表述|^免疫组化可|^核心机制|^最重要|^关键|^校正|^辨析|^读数练习/.test(text);}
function shortHeading(text){return termName(text).replace(/^(核心|补充核心|进阶|补充)[：:]\s*/,'').split(/[：:]/)[0].replace(/是什么[？?]$/,'');}
function firstParagraph(tokens){return tokens?.find(t=>['paragraph','text'].includes(t.type)&&plain(t.raw||t.text).length>=12);}

// Cards are extracts of supplied notes. No external definitions or medical inferences are added.
export function extractFlashcards(source,headings,note){
 if(note.id==='diagnostics-00')return [];
 const approved=new Set((vocabulary[note.id]||'').split('|').map(termKey).filter(Boolean));
 const groups=[];let group;let context;let headingIndex=0;let parentBlocked=false;
 for(const token of lexer.lexer(source)){
  if(token.type==='heading'){
   if(token.depth===1)continue;
   const h=headings[headingIndex++];
   if(token.depth===2)parentBlocked=skipSection.test(h.text);
   if(token.depth<=3){group={id:h.id,title:h.text,depth:h.depth,blocked:parentBlocked||skipSection.test(h.text),tokens:[],candidates:[]};groups.push(group);}
   context=h;if(group)group.tokens.push({token,context});continue;
  }
  if(group)group.tokens.push({token,context});
 }
 const add=(g,term,raw,context,score,parts)=>{
  term=termName(term);const answer=parts||[plain(raw)];
  if(!validTerm(term)||!approved.has(termKey(term))||!answer.some(x=>x.length>=12)||answer.join('').length>750||!source.includes(raw))return;
  if(answer.length===1&&/^[（(]?课件\s*P?\d/i.test(answer[0]))return;
  if(term==='最低抑菌浓度，minimum inhibitory concentration'&&context.text.includes('MIC'))term='最低抑菌浓度（MIC）';
  if(term==='临床折点breakpoint')term='临床折点（breakpoint）';
  g.candidates.push({term,answer,sourceId:context.id,sourceHeading:plain(context.text),quote:raw,score});
 };
 for(const g of groups){
  if(g.blocked)continue;
  for(const {token:t,context:h}of g.tokens){
   if(!h||skipSection.test(h.text))continue;
   if(t.type==='table'){
    const headers=t.header.map(c=>plain(c.text));
    if(!tableMeaning.test(headers.slice(1).join(' '))||/比较|特征|部位|层面|类别.*课件/.test(headers[0])||headers.some(c=>/页码|课件200|旧|历史/.test(c)))continue;
    for(const row of t.rows){
     const term=plain(row[0].text);const parts=row.slice(1).map((c,i)=>`${headers[i+1]}：${plain(c.text)}`).filter(x=>!/[：:]\s*[—–-]$/.test(x));
     const raw=t.raw;add(g,term,raw,h,7,parts);
    }
   }
   const blocks=[];
   if(t.type==='paragraph')blocks.push(t);
   if(t.type==='list'){
    const walk=items=>{for(const item of items){const p=firstParagraph(item.tokens);if(p)blocks.push(p);for(const sub of item.tokens||[])if(sub.type==='list')walk(sub.items);}};walk(t.items);
   }
   for(const b of blocks){
    const raw=b.raw||b.text;const text=plain(raw);
    if(text.length<14||text.length>650)continue;
    const bold=raw.match(/^\s*\*\*([^*\n]+)\*\*\s*(?:（[^）]*）|\([^)]*\))?\s*(?:[：:]|的特点[：:])/);
    if(bold)add(g,bold[1],raw,h,12);
    for(const match of raw.matchAll(/\*\*([^*\n]+)\*\*/g))if(approved.has(termKey(match[1])))add(g,match[1],raw,h,10);
    const colon=text.match(/^([^：:]{2,44})[：:]\s*(.{10,})$/);
    if(colon)add(g,colon[1],raw,h,9);
    const name=shortHeading(h.text);
    if(validTerm(name)&&g.tokens.find(x=>x.context?.id===h.id&&x.token.type==='paragraph')?.token===t){
     const natural=text.match(/^([\p{L}\p{N}()（）/\-αβγδ₀₁₂₃₄₅₆₇₈₉ ]{2,36}?)(?:是指|是|指)(.{10,})$/u);
     if(natural)add(g,natural[1],raw,h,11);
     else if(!/^(对应|第\d|课件|图|注意|辨析|补充|原课件|建议|区分|重点[：:]|这是|要记|应记)/.test(text))add(g,name,raw,h,5);
    }
   }
  }
 }
 const seen=new Set();const result=[];
 for(const g of groups){
  const local=new Set(),answers=new Set();const selected=g.candidates.sort((a,b)=>b.score-a.score).filter(c=>{const key=termKey(c.term),answer=c.answer.join('\n');if(local.has(key)||seen.has(key)||answers.has(answer))return false;local.add(key);answers.add(answer);return true;}).slice(0,3);
  for(const c of selected){
   seen.add(termKey(c.term));
   // Retain nearby limitations alongside definitions, especially teaching-version qualifications.
   const nearby=[];
   for(const x of g.tokens.filter(x=>x.context?.id===c.sourceId)){
    if(x.token.type==='paragraph')nearby.push(plain(x.token.raw));
    if(x.token.type==='list')for(const item of x.token.items){const p=firstParagraph(item.tokens);if(p)nearby.push(plain(p.raw||p.text));}
   }
   const caveats=nearby.filter(x=>x.length<=340&&!c.answer.includes(x)&&/不能|不等于|不保证|旧版|历史版本|必须注意|并非|局限|不意味着/.test(x));
   c.caution=[];for(const text of [...new Set(caveats)])if(c.caution.length<2&&c.caution.join('').length+text.length<=380)c.caution.push(text);
   c.id='fc-'+createHash('sha256').update(note.id+'|'+g.id+'|'+c.term).digest('hex').slice(0,16);
   delete c.score;
  }
  if(selected.length)result.push({id:g.id,title:plain(g.title),cards:selected});
 }
 return result;
}
