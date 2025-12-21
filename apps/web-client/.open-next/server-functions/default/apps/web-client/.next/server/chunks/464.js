exports.id=464,exports.ids=[464],exports.modules={196:(a,b,c)=>{"use strict";c.r(b),c.d(b,{default:()=>e});var d=c(2131);let e=async a=>[{type:"image/x-icon",sizes:"16x16",url:(0,d.fillMetadataSegment)(".",await a.params,"favicon.ico")+"?603d046c9a6fdfbb"}]},408:()=>{},1398:()=>{},1971:()=>{},2390:(a,b,c)=>{Promise.resolve().then(c.t.bind(c,8599,23))},2874:(a,b,c)=>{Promise.resolve().then(c.t.bind(c,5696,23)),Promise.resolve().then(c.t.bind(c,9411,23)),Promise.resolve().then(c.t.bind(c,8447,23)),Promise.resolve().then(c.t.bind(c,674,23)),Promise.resolve().then(c.t.bind(c,8886,23)),Promise.resolve().then(c.t.bind(c,4194,23)),Promise.resolve().then(c.t.bind(c,3431,23)),Promise.resolve().then(c.bind(c,3858))},2928:(a,b,c)=>{"use strict";let d,e;c.d(b,{Ay:()=>O,oR:()=>G});var f,g=c(1277);let h={data:""},i=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,j=/\/\*[^]*?\*\/|  +/g,k=/\n+/g,l=(a,b)=>{let c="",d="",e="";for(let f in a){let g=a[f];"@"==f[0]?"i"==f[1]?c=f+" "+g+";":d+="f"==f[1]?l(g,f):f+"{"+l(g,"k"==f[1]?"":b)+"}":"object"==typeof g?d+=l(g,b?b.replace(/([^,])+/g,a=>f.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,b=>/&/.test(b)?b.replace(/&/g,a):a?a+" "+b:b)):f):null!=g&&(f=/^--/.test(f)?f:f.replace(/[A-Z]/g,"-$&").toLowerCase(),e+=l.p?l.p(f,g):f+":"+g+";")}return c+(b&&e?b+"{"+e+"}":e)+d},m={},n=a=>{if("object"==typeof a){let b="";for(let c in a)b+=c+n(a[c]);return b}return a};function o(a){let b,c,d=this||{},e=a.call?a(d.p):a;return((a,b,c,d,e)=>{var f;let g=n(a),h=m[g]||(m[g]=(a=>{let b=0,c=11;for(;b<a.length;)c=101*c+a.charCodeAt(b++)>>>0;return"go"+c})(g));if(!m[h]){let b=g!==a?a:(a=>{let b,c,d=[{}];for(;b=i.exec(a.replace(j,""));)b[4]?d.shift():b[3]?(c=b[3].replace(k," ").trim(),d.unshift(d[0][c]=d[0][c]||{})):d[0][b[1]]=b[2].replace(k," ").trim();return d[0]})(a);m[h]=l(e?{["@keyframes "+h]:b}:b,c?"":"."+h)}let o=c&&m.g?m.g:null;return c&&(m.g=m[h]),f=m[h],o?b.data=b.data.replace(o,f):-1===b.data.indexOf(f)&&(b.data=d?f+b.data:b.data+f),h})(e.unshift?e.raw?(b=[].slice.call(arguments,1),c=d.p,e.reduce((a,d,e)=>{let f=b[e];if(f&&f.call){let a=f(c),b=a&&a.props&&a.props.className||/^go/.test(a)&&a;f=b?"."+b:a&&"object"==typeof a?a.props?"":l(a,""):!1===a?"":a}return a+d+(null==f?"":f)},"")):e.reduce((a,b)=>Object.assign(a,b&&b.call?b(d.p):b),{}):e,(a=>{if("object"==typeof window){let b=(a?a.querySelector("#_goober"):window._goober)||Object.assign(document.createElement("style"),{innerHTML:" ",id:"_goober"});return b.nonce=window.__nonce__,b.parentNode||(a||document.head).appendChild(b),b.firstChild}return a||h})(d.target),d.g,d.o,d.k)}o.bind({g:1});let p,q,r,s=o.bind({k:1});function t(a,b){let c=this||{};return function(){let d=arguments;function e(f,g){let h=Object.assign({},f),i=h.className||e.className;c.p=Object.assign({theme:q&&q()},h),c.o=/ *go\d+/.test(i),h.className=o.apply(c,d)+(i?" "+i:""),b&&(h.ref=g);let j=a;return a[0]&&(j=h.as||a,delete h.as),r&&j[0]&&r(h),p(j,h)}return b?b(e):e}}var u=(a,b)=>"function"==typeof a?a(b):a,v=(d=0,()=>(++d).toString()),w="default",y=(a,b)=>{let{toastLimit:c}=a.settings;switch(b.type){case 0:return{...a,toasts:[b.toast,...a.toasts].slice(0,c)};case 1:return{...a,toasts:a.toasts.map(a=>a.id===b.toast.id?{...a,...b.toast}:a)};case 2:let{toast:d}=b;return y(a,{type:+!!a.toasts.find(a=>a.id===d.id),toast:d});case 3:let{toastId:e}=b;return{...a,toasts:a.toasts.map(a=>a.id===e||void 0===e?{...a,dismissed:!0,visible:!1}:a)};case 4:return void 0===b.toastId?{...a,toasts:[]}:{...a,toasts:a.toasts.filter(a=>a.id!==b.toastId)};case 5:return{...a,pausedAt:b.time};case 6:let f=b.time-(a.pausedAt||0);return{...a,pausedAt:void 0,toasts:a.toasts.map(a=>({...a,pauseDuration:a.pauseDuration+f}))}}},z=[],A={toasts:[],pausedAt:void 0,settings:{toastLimit:20}},B={},C=(a,b=w)=>{B[b]=y(B[b]||A,a),z.forEach(([a,c])=>{a===b&&c(B[b])})},D=a=>Object.keys(B).forEach(b=>C(a,b)),E=(a=w)=>b=>{C(b,a)},F=a=>(b,c)=>{let d,e=((a,b="blank",c)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:b,ariaProps:{role:"status","aria-live":"polite"},message:a,pauseDuration:0,...c,id:(null==c?void 0:c.id)||v()}))(b,a,c);return E(e.toasterId||(d=e.id,Object.keys(B).find(a=>B[a].toasts.some(a=>a.id===d))))({type:2,toast:e}),e.id},G=(a,b)=>F("blank")(a,b);G.error=F("error"),G.success=F("success"),G.loading=F("loading"),G.custom=F("custom"),G.dismiss=(a,b)=>{let c={type:3,toastId:a};b?E(b)(c):D(c)},G.dismissAll=a=>G.dismiss(void 0,a),G.remove=(a,b)=>{let c={type:4,toastId:a};b?E(b)(c):D(c)},G.removeAll=a=>G.remove(void 0,a),G.promise=(a,b,c)=>{let d=G.loading(b.loading,{...c,...null==c?void 0:c.loading});return"function"==typeof a&&(a=a()),a.then(a=>{let e=b.success?u(b.success,a):void 0;return e?G.success(e,{id:d,...c,...null==c?void 0:c.success}):G.dismiss(d),a}).catch(a=>{let e=b.error?u(b.error,a):void 0;e?G.error(e,{id:d,...c,...null==c?void 0:c.error}):G.dismiss(d)}),a};var H=s`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,I=s`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,J=s`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`;t("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${a=>a.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${H} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${I} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${a=>a.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${J} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`;var K=s`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;t("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${a=>a.secondary||"#e0e0e0"};
  border-right-color: ${a=>a.primary||"#616161"};
  animation: ${K} 1s linear infinite;
`;var L=s`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,M=s`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`;t("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${a=>a.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${L} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${M} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${a=>a.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,t("div")`
  position: absolute;
`,t("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`;var N=s`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`;t("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${N} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,t("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,t("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,f=g.createElement,l.p=void 0,p=f,q=void 0,r=void 0,o`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`;var O=G},3258:(a,b,c)=>{Promise.resolve().then(c.t.bind(c,2594,23))},4330:(a,b,c)=>{"use strict";c.r(b),c.d(b,{default:()=>g});var d=c(2474),e=c(1310),f=c.n(e);function g(){return(0,d.jsxs)("div",{children:[(0,d.jsx)("h2",{children:"Not Found"}),(0,d.jsx)("p",{children:"Could not find requested resource"}),(0,d.jsx)(f(),{href:"/",children:"Return Home"})]})}},6018:(a,b,c)=>{Promise.resolve().then(c.t.bind(c,2594,23)),Promise.resolve().then(c.t.bind(c,6413,23)),Promise.resolve().then(c.t.bind(c,1437,23)),Promise.resolve().then(c.t.bind(c,9476,23)),Promise.resolve().then(c.t.bind(c,1452,23)),Promise.resolve().then(c.t.bind(c,6792,23)),Promise.resolve().then(c.t.bind(c,8465,23)),Promise.resolve().then(c.t.bind(c,3592,23))},6306:(a,b,c)=>{Promise.resolve().then(c.t.bind(c,5696,23))},7032:()=>{},8270:(a,b,c)=>{"use strict";c.d(b,{N:()=>i});var d=c(8957);let e=a=>{try{if("undefined"!=typeof process&&process.env)return process.env[a]}catch{}},f={SUPABASE_URL:"undefined"!=typeof process&&"https://gdnltvvxiychrsdzenia.supabase.co"||"undefined"!=typeof process&&process.env?.VITE_SUPABASE_URL||e("EXPO_PUBLIC_SUPABASE_URL")||"https://placeholder.supabase.co",SUPABASE_ANON_KEY:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0",GOOGLE_MAPS_KEY:"undefined"!=typeof process&&process.env?.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY||"undefined"!=typeof process&&process.env?.VITE_GOOGLE_MAPS_API_KEY||e("EXPO_PUBLIC_GOOGLE_MAPS_API_KEY")||"",IS_DEV:"true"===e("DEV"),IS_TEST_MODE:"undefined"!=typeof process||"undefined"!=typeof process&&process.env?.VITE_TEST_MODE==="true"||"true"===e("EXPO_PUBLIC_TEST_MODE"),ENABLE_OTP_BYPASS:"undefined"!=typeof process||"undefined"!=typeof process&&process.env?.VITE_ENABLE_OTP_BYPASS==="true"||"true"===e("EXPO_PUBLIC_ENABLE_OTP_BYPASS")},g=f.SUPABASE_URL||"https://placeholder.supabase.co",h=f.SUPABASE_ANON_KEY||"placeholder";"https://placeholder.supabase.co"===g&&console.warn("⚠️ Supabase environment variables are missing! Using placeholder values. Auth will not work.");let i=(0,d.UU)(g,h,{auth:{persistSession:!0,autoRefreshToken:!0,detectSessionInUrl:!0},global:{headers:{Accept:"application/json"}}})},8702:()=>{},9694:(a,b,c)=>{Promise.resolve().then(c.t.bind(c,5953,23))},9834:(a,b,c)=>{"use strict";c.r(b),c.d(b,{default:()=>g,metadata:()=>e,viewport:()=>f});var d=c(2474);c(1971);let e={title:"lokals - Trusted Local Services",description:"Find trusted local professionals for all your home service needs.",manifest:"/manifest.json"},f={themeColor:"#000000",width:"device-width",initialScale:1,maximumScale:1,userScalable:!1};function g({children:a}){return(0,d.jsxs)("html",{lang:"en",children:[(0,d.jsxs)("head",{children:[(0,d.jsx)("meta",{charSet:"utf-8"}),(0,d.jsx)("meta",{name:"viewport",content:"width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"}),(0,d.jsx)("meta",{name:"apple-mobile-web-app-capable",content:"yes"}),(0,d.jsx)("meta",{name:"apple-mobile-web-app-status-bar-style",content:"black-translucent"}),(0,d.jsx)("meta",{name:"apple-mobile-web-app-title",content:"lokals"}),(0,d.jsx)("meta",{name:"theme-color",content:"#6366f1"})]}),(0,d.jsxs)("body",{className:"antialiased",children:[a,(0,d.jsx)("script",{dangerouslySetInnerHTML:{__html:`
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then((registration) => {
                      console.log('SW registered:', registration);
                    })
                    .catch((error) => {
                      console.log('SW registration failed:', error);
                    });
                });
              }
            `}})]})]})}}};