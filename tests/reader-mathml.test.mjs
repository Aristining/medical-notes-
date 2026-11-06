import test from 'node:test';
import assert from 'node:assert/strict';
import {Marked} from 'marked';
import {mathmlExtension} from '../reader-mathml.mjs';
test('native MathML preserves fractions, comparisons and ion superscripts',()=>{
 const parser=new Marked();parser.use(mathmlExtension);
 const html=parser.parse('FENa: $\\frac{U_{Na} P_{Cr}}{P_{Na} U_{Cr}}\\times100\\%$; $K^+$; $<0.5$');
 assert.match(html,/<mfrac>/);assert.match(html,/<msup>/);assert.match(html,/&lt;/);assert.doesNotMatch(html,/katex-error/);
});
test('math remains literal in code, and unsafe raw HTML is handled by the host renderer',()=>{
 const parser=new Marked({renderer:{html({text}){return text.replaceAll('<','&lt;');}}});parser.use(mathmlExtension);
 const html=parser.parse('`$x$` <script>alert(1)</script>');assert.match(html,/<code>\$x\$<\/code>/);assert.doesNotMatch(html,/<script>/);
});
