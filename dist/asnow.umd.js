!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t((e="undefined"!=typeof globalThis?globalThis:e||self).Asnow={})}(this,(function(e){"use strict";
/*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */function t(e,t){var n="function"==typeof Symbol&&e[Symbol.iterator];if(!n)return e;var r,o,i=n.call(e),l=[];try{for(;(void 0===t||t-- >0)&&!(r=i.next()).done;)l.push(r.value)}catch(e){o={error:e}}finally{try{r&&!r.done&&(n=i.return)&&n.call(i)}finally{if(o)throw o.error}}return l}function n(){for(var e=[],n=0;n<arguments.length;n++)e=e.concat(t(arguments[n]));return e}function r(e){return!!e&&(e instanceof HTMLElement||1===e.nodeType)}function o(e){return 8===e.nodeType}function i(e){return 3===e.nodeType}function l(e){var t=new Function("with(this) { return ("+e+") }");return"unit_test"===process.env.NODE_ENV&&(t.toString=function(){return e}),t}function a(e){return"string"==typeof e?e.indexOf("-")>0:r(e)&&e.tagName.indexOf("-")>0}function f(e){if("meta"in e)return e;var t=(new DOMParser).parseFromString(e.template.trim(),"text/html");if(!t.body.firstElementChild||1!==t.body.firstElementChild.nodeType)throw new Error("Invalid template of component "+e.name);if(1!==t.body.childNodes.length)throw new Error("Component template must only have one root element."+e.name);var n=e.components||{};Object.keys(n).forEach((function(e){if(!a(e)){var t=n[e];delete n[e],n[function(e){for(var t=[e[0].toLowerCase()],n=1;n<e.length;n++)/[A-Z]/.test(e[n])?(t.push("-"),t.push(e[n].toLowerCase())):t.push(e[n]);return t.join("")}(e)]=t}})),e.components=n;var r=p(t.body.firstElementChild,n),o=e;return o.meta=r,o}function c(e,t){return a(e)?function(e,t){var r="{"+n(e.attributes).map((function(e){var t=e.name,n=e.value;return n="{"===(n=n.trim())[0]&&"}"===n[n.length-1]?n.slice(1,-1):JSON.stringify(n),JSON.stringify(t)+":("+n+"),"}))+"}",o=e.tagName.toLowerCase();if(!t[o])throw new Error("component "+o+" can not be resolved.");return{type:"component",component:f(t[o]),props:l(r)}}(e,t):p(e,t)}function u(e,t){for(var n,r,o,i={type:"condition",conditions:[]},a=0;a<e.length;a++){var f=e[a],u={type:"",condition:null,node:null};if(0===a){if(!(s=null===(n=f.getAttribute("#if"))||void 0===n?void 0:n.trim()))throw new Error("#if can not be empty.");u.type="if",u.condition=l("!!("+s+")"),f.removeAttribute("#if")}else if(a===e.length-1&&f.hasAttribute("#else")){if(s=null===(r=f.getAttribute("#else"))||void 0===r?void 0:r.trim())throw new Error("#else must be empty.");u.type="else",u.condition=function(){return!0},f.removeAttribute("#else")}else{var s;if(!(s=null===(o=f.getAttribute("#elif"))||void 0===o?void 0:o.trim()))throw new Error("#elif can not be empty.");u.condition=l("!!("+s+")"),f.removeAttribute("#elif")}u.node=c(f,t),i.conditions.push(u)}return i}function s(e){var t,n=null!==(t=e.textContent)&&void 0!==t?t:"",r=!/\{[^}]+?\}/.test(n);return{type:"text",text:r?n:l("`"+n.replace(/\{/g,"${")+"`"),static:r}}function d(e,t){var n,r={type:"loop",loop:null,item:null,node:null},o=null===(n=e.getAttribute("#for"))||void 0===n?void 0:n.trim();if(!o)throw new Error("#for can not be empty.");var i=o.split(/ +(of|by) +/).map((function(e){return e.trim()})).filter(Boolean);if(3!==i.length&&5!==i.length)throw new Error("Invalid #for value: "+o);var a=i[0],f=i[2],u=i[4];if(/^\(.+\)$/.test(a)){var s=a.slice(1,-1).split(",").map((function(e){return e.trim()})).filter(Boolean);if(s.length>2)throw new Error("Invalid #for value: "+o);r.item=s[0],s[1]&&(r.index=s[1])}else r.item=a;return u&&(r.key=l(u)),r.loop=l(f),e.removeAttribute("#for"),r.node=c(e,t),r}function p(e,t){var o,a,f=/^([^(]+?)\(([^)]+?)\)$/;n(e.attributes).forEach((function(t){var n=t.name,r=t.value;if(r=r.trim(),"@"===n[0]){o=o||{};var i=r.match(f);return o[n.slice(1)]=i?[i[1].trim(),l("["+i[2]+"]")]:[r],void e.removeAttribute(n)}if("{"===r[0]&&"}"===r[r.length-1])return(a=a||{})[n]=l(r.slice(1,-1)),void e.removeAttribute(n)}));var p={type:"element",element:null},h=function(e,t){for(var o,l=[],a=[],f=0;f<e.length;f++){var p=e[f];if(r(p)||i(p))if(r(p))if(p.hasAttribute("#if"))a.length&&(l.push(u(n(a),t)),a.length=0),a.push(p);else if(p.hasAttribute("#elif")){if(!a.length)throw new Error("#elif must be next to #if");a.push(p)}else if(p.hasAttribute("#else")){if(!a.length)throw new Error("#else must be next to #if or #elif");a.push(p),l.push(u(n(a),t)),a.length=0}else a.length&&(l.push(u(n(a),t)),a.length=0),p.hasAttribute("#for")?l.push(d(p,t)):l.push(c(p,t));else i(p)&&((null===(o=p.textContent)||void 0===o?void 0:o.trim())?(a.length&&(l.push(u(a.slice(),t)),a.length=0),l.push(s(p))):a.length||l.push({type:"text",static:!0,text:" "}))}return a.length&&(l.push(u(n(a),t)),a.length=0),l}(n(e.childNodes),t);return e.innerHTML="",p.element=e.cloneNode(!0),o&&(p.actions=o),a&&(p.bindings=a),h.length&&(p.children=h),p}function h(e){return"element"===e.type?b.call(this,e):x.call(this,e)}function v(e){var t=this,n=e.conditions.findIndex((function(e){return e.condition.call(t)}));if(-1===n)return document.createComment("if");var r=e.conditions[n].node,o=h.call(this,r);return o._if=n,o}function m(e){var n=e.loop.call(this);if(!n.length)return document.createComment("for");var r,o,i=document.createDocumentFragment(),l=[],a=Object.create(this);return Object.defineProperty(a,e.item,{get:function(){return r}}),e.index&&Object.defineProperty(a,e.index,{get:function(){return o}}),n.forEach((function(n,f){var c;c=t([n,f],2),r=c[0],o=c[1];var u=e.key?e.key.call(a):f;if(l.includes(u))throw new Error("Repeat key in #for "+u);l.push(u);var s=h.call(a,e.node);0===f&&(s._for=l),i.appendChild(s)})),i}function y(e){return"component"===e.type?x.call(this,e):"condition"===e.type?v.call(this,e):"loop"===e.type?m.call(this,e):"element"===e.type?b.call(this,e):"text"===e.type?"string"==typeof e.text?document.createTextNode(e.text):document.createTextNode(e.text.call(this)):void 0}function b(e){var r=this,o=e.element.cloneNode(!0);if(e.bindings&&Object.entries(e.bindings).forEach((function(e){var n=t(e,2),i=n[0],l=n[1];o.setAttribute(i,l.call(r)+"")})),e.actions){var i=o._listeners={};Object.entries(e.actions).forEach((function(e){var l=t(e,2),a=l[0],f=t(l[1],2),c=f[0],u=f[1],s=function(e){var t=u?u.call(r):[];return t.push(e),r[c].apply(r,n(t))};o.addEventListener(a,s),o.dataset.event="true",i[a]=s}))}if(e.children){var l=document.createDocumentFragment();e.children.forEach((function(e){var t=y.call(r,e);t&&l.appendChild(t)})),o.appendChild(l)}return o}var g=new Map,w=Symbol("vmid"),E=Symbol("props");function x(e){var t=e.component,n=e.props.call(this),r=new t(n),o=t.name+"-"+g.size;r[w]=o,r[E]=n,g.set(o,r);var i=b.call(r,t.meta);return i.dataset.vmid=o,i}function O(e,t){if("string"==typeof t&&(t=document.querySelector(t)),!(t instanceof HTMLElement))throw new Error("invalid target: "+t);var n=f(e);t.appendChild(x.call({},{type:"component",component:n,props:function(){return{}}}))}function A(e,t){if("element"===e.type&&r(t))return t;if("component"===e.type&&r(t)&&t.dataset.vmid)return t;if("condition"===e.type){if(o(t))return t;if(r(t)&&"number"==typeof t._if)return t}if("loop"===e.type){if(o(t))return t;if(r(t)&&Array.isArray(t._for))return t}if("text"===e.type&&i(t))return t;throw"development"===process.env.NODE_ENV&&console.error(e,t),new Error("Unmatched meta and node")}function _(e,r){var o,i=this;if(r.bindings&&Object.entries(r.bindings).forEach((function(n){var r=t(n,2),o=r[0],l=r[1],a=e.getAttribute(o),f=l.call(i);f!==a&&e.setAttribute(o,f)})),r.children)for(var l=n(e.childNodes),a=0,f=0;a<r.children.length;a++,f++){var c=r.children[a],u=l[f];if(A(c,u),"element"===c.type)_.call(this,u,c);else if("text"===c.type){if("function"==typeof c.text){var s=u.textContent,d=c.text.call(this);s!==d&&(u.textContent=d)}}else if("component"===c.type)j.call(this,u,c);else if("condition"===c.type)A(c,u),N.call(this,u,c);else if("loop"===c.type){var p=u;f+=((null===(o=p._for)||void 0===o?void 0:o.length)||1)-1,k.call(this,p,c)}}}function C(e,r){var o=n(e.querySelectorAll("[data-vmid]")),i=n(e.querySelectorAll("[data-event]"));e.dataset.vmid&&o.push(e),e.dataset.event&&i.push(e),i.forEach((function(e){var n=e._listeners;Object.entries(n).forEach((function(n){var r=t(n,2),o=r[0],i=r[1];e.removeEventListener(o,i)}))})),o.forEach((function(e){var t=e.dataset.vmid;if(!t||!g.has(t))throw new Error("vmid "+t+" in document but not in vmmap");var n=g.get(t);"function"==typeof n.BeforeRemove&&n.BeforeRemove(),g.delete(t)})),!0===r?e.remove():e.replaceWith(r)}function j(e,t){var n=e.dataset.vmid,r=g.get(n);if(!r)throw new Error("Can not find vm instance of "+n);var o=t.props.call(this);"function"==typeof r.PropsUpdate&&r.PropsUpdate(o,r[E])}function S(e,t){"element"===t.type?_.call(this,e,t):j.call(this,e,t)}function N(e,t){var n=this,r=t.conditions.findIndex((function(e){return e.condition.call(n)}));if(-1!==r){var i=t.conditions[r].node;if(o(e)){var l=h.call(this,i);l._if=r,e.replaceWith(l)}else if(e._if===r)S.call(this,e,i);else{var a=h.call(this,i);a._if=r,C(e,a)}}else{if(o(e))return;C(e,document.createComment("if"))}}function k(e,n){var i,l,a=n.loop.call(this),f=e.parentElement;if(!f)throw new Error("Error in #for update, no parent element.");if(0!==a.length){if(o(e)){var c,u,s=document.createDocumentFragment(),d=[],p=Object.create(this);return Object.defineProperty(p,n.item,{get:function(){return c}}),n.index&&Object.defineProperty(p,n.index,{get:function(){return u}}),a.forEach((function(e,r){var o;o=t([e,r],2),c=o[0],u=o[1];var i=n.key?n.key.call(p):r;if(d.includes(i))throw new Error("Repeat key in #for "+i);d.push(i);var l=h.call(p,n.node);0===r&&(l._for=d),s.appendChild(l)})),f.insertBefore(s,e),void e.remove()}var v=e._for,m={},y=e;try{for(var b=function(e){var t="function"==typeof Symbol&&Symbol.iterator,n=t&&e[t],r=0;if(n)return n.call(e);if(e&&"number"==typeof e.length)return{next:function(){return e&&r>=e.length&&(e=void 0),{value:e&&e[r++],done:!e}}};throw new TypeError(t?"Object is not iterable.":"Symbol.iterator is not defined.")}(v),g=b.next();!g.done;g=b.next()){var w=g.value;if(!r(y))throw new Error("Error in #for update, node is not element.");if(w in m)throw new Error("Repeat key in #for: "+w);m[w]=y,y=y.nextSibling}}catch(e){i={error:e}}finally{try{g&&!g.done&&(l=b.return)&&l.call(b)}finally{if(i)throw i.error}}var E=y;y=e;var x,O,A=[],_=Object.create(this);for(Object.defineProperty(_,n.item,{get:function(){return x}}),n.index&&Object.defineProperty(_,n.index,{get:function(){return O}}),a.forEach((function(e,r){var o;o=t([e,r],2),x=o[0],O=o[1];var i=n.key?n.key.call(_):r;if(A.includes(i))throw new Error("Repeat key in #for: "+i);A.push(i);var l=m[i];if(l){if(l===y)return 0===r&&(y._for=A),S.call(_,y,n.node),void(y=y.nextSibling)}else l=h.call(_,n.node);0===r&&(l._for=A),f.insertBefore(l,y)}));y!==E;){N=y;if(!r(y))throw new Error("Error in #for update, node is not element.");y=y.nextSibling,C(N,!0)}}else{if(o(e))return;for(var j=e._for.length;--j;){var N;if(!r(N=e.nextSibling))throw new Error("Error in #for update");C(N,!0)}C(e,document.createComment("for"))}}function T(e,t){var n=Object.assign(e,t),o=e[w],i=document.querySelector('[data-vmid="'+o+'"]');if(!r(i))throw new Error("Failed to update "+o);var l=e.constructor.meta;_.call(n,i,l)}"development"===process.env.NODE_ENV&&(window._vmap=g);var P={render:O,update:T};e.default=P,e.render=O,e.update=T,Object.defineProperty(e,"__esModule",{value:!0})}));
