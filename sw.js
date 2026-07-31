/* v5: HTML은 네트워크 우선(항상 최신), 정적 파일은 캐시 우선.
   → 앞으로 파일을 올리면 새로고침 한 번에 최신 화면이 반영됩니다. 오프라인이면 캐시로 동작. */
const CACHE="study-v15";
const ASSETS=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png","./icon-512-maskable.png","./apple-touch-icon.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));self.skipWaiting();});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  const url=new URL(e.request.url);
  const isHTML=e.request.mode==="navigate"||url.pathname.endsWith("/")||url.pathname.endsWith("index.html");
  if(isHTML){
    // 네트워크 우선: 최신 HTML을 받아 캐시도 갱신, 실패 시 캐시 폴백
    e.respondWith(fetch(e.request).then(res=>{const c=res.clone();caches.open(CACHE).then(cc=>cc.put("./index.html",c)).catch(()=>{});return res;})
      .catch(()=>caches.match(e.request).then(h=>h||caches.match("./index.html"))));
  }else{
    // 정적 파일: 캐시 우선
    e.respondWith(caches.match(e.request).then(h=>h||fetch(e.request).then(res=>{const c=res.clone();caches.open(CACHE).then(cc=>cc.put(e.request,c)).catch(()=>{});return res;})));
  }
});
