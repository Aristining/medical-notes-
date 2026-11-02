import test from 'node:test';
import assert from 'node:assert/strict';
import {readableMath} from '../reader-math.mjs';
test('course notation keeps units, signs, subscripts and a labelled reaction arrow',()=>{
 assert.equal(readableMath('$22 \\pm 2^\\circ\\text{C}$'), '22 ± 2°C');
 assert.equal(readableMath('$\\text{Rh}^- + 10^9\\text{/L} + A_1$'), 'Rh⁻ + 10⁹/L + A₁');
 assert.equal(readableMath('$$\\text{H} \\xrightarrow{\\text{enzyme}} \\text{A}$$'), 'H  —[enzyme]→  A');
 assert.equal(readableMath('$< 400\\text{ml}$'), '&lt; 400ml');
});
test('unsupported TeX is rejected and ordinary Markdown remains intact',()=>{
 assert.throws(()=>readableMath('$\\frac{1}{2}$'),/Unsupported/);
 assert.equal(readableMath('**原文** `6月14日`'), '**原文** `6月14日`');
});
