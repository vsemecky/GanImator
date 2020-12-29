var app=function(){"use strict";function t(){}function e(t){return t()}function n(){return Object.create(null)}function o(t){t.forEach(e)}function s(t){return"function"==typeof t}function c(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}function l(t,e){t.appendChild(e)}function i(t,e,n){t.insertBefore(e,n||null)}function r(t){t.parentNode.removeChild(t)}function a(t){return document.createElement(t)}function u(){return t=" ",document.createTextNode(t);var t}function d(t,e,n,o){return t.addEventListener(e,n,o),()=>t.removeEventListener(e,n,o)}function f(t,e,n){null==n?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function p(t,e,n){t.classList[n?"add":"remove"](e)}let g;function m(t){g=t}function h(t){(function(){if(!g)throw new Error("Function called outside component initialization");return g})().$$.on_mount.push(t)}const b=[],y=[],$=[],v=[],w=Promise.resolve();let x=!1;function _(t){$.push(t)}let k=!1;const E=new Set;function C(){if(!k){k=!0;do{for(let t=0;t<b.length;t+=1){const e=b[t];m(e),S(e.$$)}for(m(null),b.length=0;y.length;)y.pop()();for(let t=0;t<$.length;t+=1){const e=$[t];E.has(e)||(E.add(e),e())}$.length=0}while(b.length);for(;v.length;)v.pop()();x=!1,k=!1,E.clear()}}function S(t){if(null!==t.fragment){t.update(),o(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(_)}}const I=new Set;function j(t,e){-1===t.$$.dirty[0]&&(b.push(t),x||(x=!0,w.then(C)),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function P(c,l,i,a,u,d,f=[-1]){const p=g;m(c);const h=l.props||{},b=c.$$={fragment:null,ctx:null,props:d,update:t,not_equal:u,bound:n(),on_mount:[],on_destroy:[],before_update:[],after_update:[],context:new Map(p?p.$$.context:[]),callbacks:n(),dirty:f,skip_bound:!1};let y=!1;if(b.ctx=i?i(c,h,((t,e,...n)=>{const o=n.length?n[0]:e;return b.ctx&&u(b.ctx[t],b.ctx[t]=o)&&(!b.skip_bound&&b.bound[t]&&b.bound[t](o),y&&j(c,t)),e})):[],b.update(),y=!0,o(b.before_update),b.fragment=!!a&&a(b.ctx),l.target){if(l.hydrate){const t=function(t){return Array.from(t.childNodes)}(l.target);b.fragment&&b.fragment.l(t),t.forEach(r)}else b.fragment&&b.fragment.c();l.intro&&(($=c.$$.fragment)&&$.i&&(I.delete($),$.i(v))),function(t,n,c){const{fragment:l,on_mount:i,on_destroy:r,after_update:a}=t.$$;l&&l.m(n,c),_((()=>{const n=i.map(e).filter(s);r?r.push(...n):o(n),t.$$.on_mount=[]})),a.forEach(_)}(c,l.target,l.anchor),C()}var $,v;m(p)}function T(t,e,n){const o=t.slice();return o[12]=e[n],o}function A(t){let e,n,o,c,g,m,h,b;return{c(){e=a("div"),n=a("img"),m=u(),f(n,"class","img-fluid svelte-59sriv"),n.src!==(o=t[12].url)&&f(n,"src",o),f(n,"title",c=t[12].seed),f(n,"alt",g=t[12].seed),p(n,"active",t[1].seed===t[12].seed),f(e,"class","thumb svelte-59sriv")},m(o,c){i(o,e,c),l(e,n),l(e,m),h||(b=d(n,"click",(function(){s(t[4](t[12]))&&t[4](t[12]).apply(this,arguments)})),h=!0)},p(e,s){t=e,1&s&&n.src!==(o=t[12].url)&&f(n,"src",o),1&s&&c!==(c=t[12].seed)&&f(n,"title",c),1&s&&g!==(g=t[12].seed)&&f(n,"alt",g),3&s&&p(n,"active",t[1].seed===t[12].seed)},d(t){t&&r(e),h=!1,b()}}}function O(e){let n,c,p,g,m,h,b,y,$,v,w,x,_,k,E,C,S,I,j,P,O,V,D,L,N,z,B,M=e[0],q=[];for(let t=0;t<M.length;t+=1)q[t]=A(T(e,M,t));return{c(){n=a("div"),c=a("section"),p=a("video"),g=u(),m=a("canvas"),h=u(),b=a("br"),y=u(),$=a("div"),v=a("button"),v.textContent="Delete image",w=u(),x=a("button"),x.textContent="Add tag",_=u(),k=a("aside"),E=a("div"),C=a("button"),C.textContent="+ Add random seed",S=u(),I=a("button"),I.textContent="Preload",j=u(),P=a("button"),P.textContent="Zoom +",O=u(),V=a("button"),V.textContent="Zoom -",D=u(),L=a("hr"),N=u();for(let t=0;t<q.length;t+=1)q[t].c();f(p,"id","player"),f(p,"width","384"),f(p,"height","640"),f(p,"class","svelte-59sriv"),f(m,"id","canvas"),f(m,"width","384"),f(m,"height","640"),f(m,"title","Canvas"),f(v,"type","button"),f(v,"class","btn btn-outline-light"),f(x,"type","button"),f(x,"class","btn btn-outline-light"),f($,"class","btn-group"),f(c,"class","col-9"),f(C,"type","button"),f(C,"class","btn btn-outline-light"),f(I,"type","button"),f(I,"class","btn btn-outline-light"),f(P,"type","button"),f(P,"class","btn btn-outline-light"),f(V,"type","button"),f(V,"class","btn btn-outline-light"),f(E,"class","btn-group"),f(k,"id","sidebar"),f(k,"class","col-3 svelte-59sriv"),f(n,"class","row")},m(t,o){i(t,n,o),l(n,c),l(c,p),l(c,g),l(c,m),l(c,h),l(c,b),l(c,y),l(c,$),l($,v),l($,w),l($,x),l(n,_),l(n,k),l(k,E),l(E,C),l(E,S),l(E,I),l(E,j),l(E,P),l(E,O),l(E,V),l(k,D),l(k,L),l(k,N);for(let t=0;t<q.length;t+=1)q[t].m(k,null);z||(B=[d(v,"click",(function(){s(e[6](e[1].seed))&&e[6](e[1].seed).apply(this,arguments)})),d(C,"click",e[5]),d(I,"click",e[7]),d(P,"click",e[2]),d(V,"click",e[3])],z=!0)},p(t,[n]){if(e=t,19&n){let t;for(M=e[0],t=0;t<M.length;t+=1){const o=T(e,M,t);q[t]?q[t].p(o,n):(q[t]=A(o),q[t].c(),q[t].m(k,null))}for(;t<q.length;t+=1)q[t].d(1);q.length=M.length}},i:t,o:t,d(t){t&&r(n),function(t,e){for(let n=0;n<t.length;n+=1)t[n]&&t[n].d(e)}(q,t),z=!1,o(B)}}}function V(t,e){return"/project/video/"+t+"-"+e+".mp4"}function D(t){return new Promise((e=>setTimeout(e,t)))}function L(t,e,n){let o,s,c,l=[],i={seed:0,url:""};async function r(t){let e;for(e of(await D(1e3),console.log("preloadSeedVideos(",t,"): START"),l)){if(t===e.seed)continue;if(t!==i.seed)return void console.log("preloadSeedVideos(",t,"): STOPPED");if(await D(100),t!==i.seed)return void console.log("preloadSeedVideos(",t,"): STOPPED");const n=await fetch(V(t,e.seed));await n.blob()}console.log("preloadSeedVideos(",t,"): FINISHED")}return h((async()=>{const t=await fetch("/api/project");let e=await t.json();console.log("Project",e),n(0,l=e.images),console.log("Images",l),n(1,i=l[0]),o=document.getElementById("player"),s=document.getElementById("canvas"),c=s.getContext("2d"),c.scale(.5,.5),o.addEventListener("play",(function(){!function t(){o.paused||o.ended||(c.drawImage(o,0,0),setTimeout(t,1e3/30))}()}),!1),o.src=V(l[1].seed,i.seed),o.autoplay=!0,o.muted=!0,o.load(),await r(i.seed)})),[l,i,async function(){console.log("zoomIn()"),c.scale(1.2,1.2),o.play()},async function(){console.log("zoomOut()"),c.scale(1/1.2,1/1.2),o.play()},function(t){if(t.seed===i.seed)return!1;document.body.style.cursor="progress",console.log("seedOnClick:",t),o.src=V(i.seed,t.seed),o.load(),o.onloadeddata=function(){o.play(),document.body.style.cursor="default"},n(1,i=t),r(i.seed)},async function(){console.log("addImageClick()");let t=prompt("Enter seed (number 1..1000):",(Math.floor(1e3*Math.random())+1).toString());if(null!=t){const e=await fetch("/api/add-image/"+t);let o=await e.json();n(0,l=o.images),console.log("addImage() RESULT",l)}},async function(t){if(console.log("removeImageClick()"),confirm("Delete image seed #"+t+" ?")){const e=await fetch("/api/remove-image/"+t);let o=await e.json();n(0,l=o.images)}},async function(){let t,e;for(t of(console.log("preloadVideos()",l),l))for(e of l){if(t.seed===e.seed)continue;console.log("preloadVideos():",t.seed,e.seed),await D(100);const n=await fetch(V(t.seed,e.seed));await n.blob()}}]}return new class extends class{$destroy(){!function(t,e){const n=t.$$;null!==n.fragment&&(o(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}(this,1),this.$destroy=t}$on(t,e){const n=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return n.push(e),()=>{const t=n.indexOf(e);-1!==t&&n.splice(t,1)}}$set(t){var e;this.$$set&&(e=t,0!==Object.keys(e).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}}{constructor(t){super(),P(this,t,L,O,c,{})}}({target:document.querySelector("#app"),props:{}})}();
//# sourceMappingURL=bundle.js.map
