// Opt-in display conversion for the simple notation in imported course notes.
// The downloadable source remains byte-for-byte unchanged. Unknown TeX fails closed.
export function readableMath(source) {
 const supers = {0:'⁰',1:'¹',2:'²',3:'³',4:'⁴',5:'⁵',6:'⁶',7:'⁷',8:'⁸',9:'⁹','+':'⁺','-':'⁻'};
 const subs = {0:'₀',1:'₁',2:'₂',3:'₃',4:'₄',5:'₅',6:'₆',7:'₇',8:'₈',9:'₉',c:'(c)',h:'ₕ'};
 return source.replace(/\$\$([\s\S]*?)\$\$|\$([^$\n]+)\$/g, (_, block, inline) => {
  let value = block ?? inline;
  value = value.replace(/\\text\{([^{}]*)\}/g, '$1')
   .replace(/\\xrightarrow\{([^{}]*)\}/g, ' —[$1]→ ')
   .replace(/\\longleftrightarrow/g,'↔').replace(/\\rightarrow/g,'→')
   .replace(/\\times/g,'×').replace(/\\sim/g,'～').replace(/\\pm/g,'±')
   .replace(/\^\\circ/g,'°').replace(/\\%/g,'%')
   .replace(/\^\{([0-9+\-]+)\}|\^([0-9+\-])/g,(_,a,b)=>[...(a??b)].map(c=>supers[c]).join(''))
   .replace(/_\{([0-9ch]+)\}|_([0-9ch])/g,(_,a,b)=>[...(a??b)].map(c=>subs[c]).join(''));
  if (/[\\{}^_]/.test(value)) throw new Error('Unsupported note formula: '+value);
  return value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
 });
}
