self.addEventListener('fetch', (event) => {
    if (event.request.url.includes('?')) {
      event.respondWith(fetch(event.request));
    } else {
      event.respondWith(
        caches.match(event.request).then((response) => {
          return response || fetch(event.request);
        })
      );
    }
  });