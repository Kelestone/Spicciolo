const C="spicciolo-v17";
const SHELL=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png"].concat(["./fonts/ibm-plex-mono-latin-500-normal.woff2", "./fonts/ibm-plex-mono-latin-600-normal.woff2", "./fonts/ibm-plex-mono-latin-700-normal.woff2", "./fonts/ibm-plex-sans-latin-400-normal.woff2", "./fonts/ibm-plex-sans-latin-500-normal.woff2", "./fonts/ibm-plex-sans-latin-600-normal.woff2", "./fonts/ibm-plex-sans-latin-700-normal.woff2", "./fonts/pixelify-sans-latin-500-normal.woff2", "./fonts/pixelify-sans-latin-600-normal.woff2", "./fonts/pixelify-sans-latin-700-normal.woff2"]);
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(SHELL)));self.skipWaiting();});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))));self.clients.claim();});
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  if(e.request.mode==="navigate"){
    // rete prima (per gli aggiornamenti), ma senza aspettare all'infinito: dopo 2,5 s si apre la copia salvata
    const net=fetch(e.request).then(r=>{ if(r&&r.ok){ const cp=r.clone(); caches.open(C).then(c=>c.put("./index.html",cp)); } return r; });
    e.waitUntil(net.catch(()=>{}));
    e.respondWith(caches.match("./index.html").then(cached=>{
      if(!cached) return net;
      const wait=new Promise(res=>setTimeout(()=>res(cached),2500));
      return Promise.race([net.then(r=>r&&r.ok?r:cached).catch(()=>cached), wait]);
    }));
    return;}
  e.respondWith(caches.match(e.request).then(m=>m||fetch(e.request).then(r=>{if(r&&(r.ok||r.type==="opaque")){const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp));}return r;})));
});
