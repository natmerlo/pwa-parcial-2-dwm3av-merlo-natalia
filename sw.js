
self.addEventListener("install", (e) => {
    console.log("install");
    const cache = caches.open("mi-cache-2").then((cache) => {
        cache.addAll([
            '/',
            'https://cdn.jsdelivr.net/npm/vue@2.7.14/dist/vue.js',
            'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
            '/main.js',
            'https://rickandmortyapi.com/api/character/?name=rick&status=alive',
            'https://rickandmortyapi.com/api/character',
            '/manifest.json',
            '/images/icon_128x128.png',
            'http://localhost/form/procesar_formulario.php',
            '/contacto.html',
            '/historial'
        ]);
    });// espera hasta que la promesa se resuelva
    e.waitUntil(cache);
});

self.addEventListener("fetch", (e) => {
    const url = e.request.url;
    console.log(url);
    const response =
        fetch(e.request)
            .then((res) => {
                return caches.open('mi-cache-2').then(cache => {
                    // guardo el clon en caché
                    cache.put(e.request, res.clone());
                    // devuelvo la respuesta original
                    return res;
                })
            })
            .catch((err) => {
                return caches.match(e.request);
            })
    e.respondWith(response);

});