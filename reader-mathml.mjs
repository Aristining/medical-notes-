import {renderToString} from 'katex';

// Build-time only: native MathML needs no CDN, scripts, fonts or account access.
export const mathmlExtension = {
 extensions: [{
  name:'courseMath', level:'inline',
  start(source){return source.indexOf('$');},
  tokenizer(source){
   const match=/^\$\$([\s\S]+?)\$\$/.exec(source) || /^\$([^$\n]+?)\$/.exec(source);
   if(match)return {type:'courseMath',raw:match[0],text:match[1],display:match[0].startsWith('$$')};
  },
  renderer(token){
   return renderToString(token.text,{output:'mathml',displayMode:token.display,throwOnError:true,trust:false,strict:'ignore',maxExpand:1000});
  }
 }]
};
