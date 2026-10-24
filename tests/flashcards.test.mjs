import test from 'node:test';
import assert from 'node:assert/strict';
import { extractFlashcards,plain } from '../flashcards.mjs';

const note={id:'diagnostics-04b'};
const headings=[{depth:2,text:'二、抗菌药物名词',id:'terms'},{depth:3,text:'2.2 MIC',id:'mic'}];
const source='## 二、抗菌药物名词\n\n### 2.2 MIC\n\n**最低抑菌浓度，minimum inhibitory concentration：在规定试验条件下，抑制细菌可见生长的最低抗菌药物浓度。**\n\n**不能仅凭不同药物的MIC数值直接选药。**\n';
test('definitions keep the source excerpt, provenance and nearby limitations',()=>{
 const groups=extractFlashcards(source,headings,note);const card=groups.flatMap(g=>g.cards).find(c=>c.term.includes('MIC'));
 assert.ok(card);assert.ok(source.includes(card.quote));assert.equal(card.sourceId,'mic');assert.ok(card.caution.some(x=>x.includes('不能仅凭')));assert.ok(card.answer[0].includes('规定试验条件'));
});
test('a Chinese definition and its acronym do not produce duplicate answers in a section',()=>{
 const cards=extractFlashcards(source,headings,note).flatMap(g=>g.cards);assert.equal(cards.length,1);assert.equal(cards[0].term,'最低抑菌浓度（MIC）');
});
test('administrative or self-test sections do not become term decks, including their children',()=>{
 const altered=source.replace('二、抗菌药物名词','二、自测题');
 assert.deepEqual(extractFlashcards(altered,[{...headings[0],text:'二、自测题'},headings[1]],note),[]);
 assert.deepEqual(extractFlashcards(source,headings,{id:'diagnostics-00'}),[]);
});
test('comparison rows are not mislabeled as definitions of the row label',()=>{
 const s='## 二、抗菌药物名词\n\n| 比较项 | 含义 |\n|---|---|\n| MIC | 这里只是比较项目，没有术语定义。 |\n';
 assert.deepEqual(extractFlashcards(s,[headings[0]],note),[]);
});
test('adding unrelated material leaves existing card identities stable',()=>{
 const before=extractFlashcards(source,headings,note).flatMap(g=>g.cards);
 const after=extractFlashcards(source+'\n这是一段不属于名词定义的普通说明。\n',headings,note).flatMap(g=>g.cards);
 assert.deepEqual(before.map(c=>c.id),after.map(c=>c.id));
});
test('mathematical comparisons and concentrations survive text extraction',()=>{
 assert.equal(plain('**fT>MIC**：浓度<0.5时不可据此改动方案。'),'fT>MIC：浓度<0.5时不可据此改动方案。');
});
test('unreviewed generic labels are not promoted into knowledge cards',()=>{
 const s='## 二、抗菌药物名词\n\n### 2.2 MIC\n\n**重点：** 这是重要内容，应该记住，但不是一个名词的解释。\n';
 assert.deepEqual(extractFlashcards(s,headings,note),[]);
});
