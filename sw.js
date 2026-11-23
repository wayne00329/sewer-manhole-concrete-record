const CACHE = "manhole-record-shell-v2";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon.svg"];
const ACTIVITY_MARKER = "data-activity-collapse-toggle";

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))));
  self.clients.claim();
});

async function collapseActivitySection(response) {
  if (!response || !response.ok) return response;

  const html = await response.text();
  if (html.includes(ACTIVITY_MARKER)) return response;

  const script = `<script>${ACTIVITY_MARKER};(()=>{const section=document.querySelector('[aria-labelledby="activity-title"]');const toolbar=section?.querySelector('.toolbar');if(!section||!toolbar)return;const button=document.createElement('button');button.type='button';button.className='secondary';button.textContent='顯示異動紀錄';button.setAttribute('aria-expanded','false');const content=[section.querySelector('.activity-tools'),section.querySelector('#activitySummary'),section.querySelector('#activityRecords')].filter(Boolean);content.forEach(element=>element.hidden=true);button.addEventListener('click',()=>{const expanded=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(expanded));button.textContent=expanded?'收合異動紀錄':'顯示異動紀錄';content.forEach(element=>element.hidden=!expanded)});toolbar.append(button)})();</script>`;
  const rewritten = html.includes("</body>") ? html.replace("</body>", `${script}</body>`) : `${html}${script}`;
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  headers.delete("content-encoding");
  headers.delete("etag");
  return new Response(rewritten, { status: response.status, statusText: response.statusText, headers });
}

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;

  const isPage = request.mode === "navigate" || new URL(request.url).pathname.endsWith("/index.html");
  event.respondWith(fetch(request).then(async response => {
    if (!response.ok) return response;
    const result = isPage ? await collapseActivitySection(response) : response;
    caches.open(CACHE).then(cache => cache.put(request, result.clone()));
    return result;
  }).catch(async () => {
    const cached = await caches.match(request);
    if (!cached) return Response.error();
    return isPage ? collapseActivitySection(cached) : cached;
  }));
});
