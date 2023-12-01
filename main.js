if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js")
        .then((registration) => {
            console.log("service worker registrado");
        })
        .catch((error) => {
            console.log("service worker no registrado");
        });
}




// instancia principal de Vue
const app = new Vue({
    el: '#app',
    data: {
        eventoDeInstalacion: null,
        titulo: 'Mis personajes',
        personajes: [],
        personajeActual: null,
        estadoModal: false,
        historial: []
    },
    methods: {
        instalarAplicacion() {
            console.log("instalando aplicación")
        },
        //Ver más detalles de personaje
        async verPersonaje(url) {
            try {
                const response = await fetch(url);
                const data = await response.json();

                const { name, gender, location, species, origin } = data;
                this.personajeActual = { name, gender, location, species, origin };
                this.mostrarModal();

                // Verifica si el personaje actual ya existe en el historial
                const personaje = this.historial.find(personaje => personaje.name === this.personajeActual.name);
                if (!personaje) {
                    // Si no existe en el historial lo agrega
                    this.historial.push(this.personajeActual);
                    // Guarda el historial en el Local Storage
                    localStorage.setItem('historial', JSON.stringify(this.historial));
                }
            } catch (error) {
                console.error("Error al cargar datos del personaje:", error);
            }
        },
        mostrarModal() {
            this.estadoModal = true;
        },
        ocultarModal() {
            this.estadoModal = false;
        },
        cargarHistorial() {
            // Recupera el historial del Local Storage
            const historialGuardado = localStorage.getItem('historial');
            if (historialGuardado) {
                this.historial = JSON.parse(historialGuardado);
            }
        },
        borrarHistorial() {
            // Borra el historial en la instancia de Vue
            this.historial = [];
            // Borra el historial en el Local Storage
            localStorage.removeItem('historial');
        }
    },
    mounted() {

        window.addEventListener("beforeinstallprompt", (event) => {
            this.eventoDeInstalacion = event;
            this.instalacionPendiente = true;
        });

        // Realiza una solicitud de fetch a la API para obtener una lista de personajes vivos
        fetch('https://rickandmortyapi.com/api/character/?name=rick&status=alive')
            .then(response => response.json())
            .then(data => {
                this.personajes = data.results.map(personaje => {
                    const { name, image, status, url } = personaje;
                    return {
                        name,
                        image,
                        status,
                        url
                    };
                });
            });
        this.cargarHistorial();
    }
});