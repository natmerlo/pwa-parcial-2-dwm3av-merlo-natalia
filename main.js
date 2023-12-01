if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js")
        .then((registration) => {
            console.log("service worker registrado");
        })
        .catch((error) => {
            console.log("service worker no registrado");
        });
}
Vue.component('componente-form', {
    data() {
        return {
            nombre: '',
            correo: '',
            errorCorreo: '',
            datosRecibidos: null,
            mensajeAgradecimiento: '',
        };
    },
    methods: {
        validarFormulario() {
            this.errorCorreo = '';
            if (!this.correo.includes('@')) {
                this.errorCorreo = 'Ingrese un correo electrónico válido.';
                return false;
            }
            return true;
        },
        enviarFormulario: async function () {
            if (this.validarFormulario()) {
                const respuesta = await fetch("http://localhost/form/procesar_formulario.php", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    body: `nombre=${this.nombre}&correo=${this.correo}`,
                });

                const datos = await respuesta.json();
                console.log(datos);

                this.datosRecibidos = datos;

                // Mensaje personalizado
                this.mensajeAgradecimiento = `Gracias ${this.nombre} por enviarnos tu solicitud. Nos comunicaremos al siguiente correo: ${this.correo}`;


            }
        }
    },
    template: `
    <div class="formulario col-md-9 m-auto my-5">
    <h2>Suscríbete al Newsletter</h2>
    <p>¡Mantente actualizado sobre nuestros nuevos contenidos! Suscríbete a nuestro newsletter para recibir
        notificaciones sobre lanzamientos y noticias emocionantes.</p>
    <form @submit.prevent="enviarFormulario" class="d-flex flex-column gap-3">

        <div class="d-flex gap-3">
            <div class="w-50">
                <label for="nombre" class="fw-bold">Nombre</label>
                <input class="w-100" v-model="nombre" type="text" id="nombre" name="nombre" required>
            </div>

            <div class="w-50">
                <label for="correo" class="fw-bold">Correo electrónico</label>
                <input class="w-100" v-model="correo" type="email" id="correo" name="correo" required>
            </div>

        </div>

        <div>
            <button class="btn style-btn" type="submit">Suscribirse</button>
        </div>

    </form>

    <div v-if="datosRecibidos" class="my-3">
        <h2>¡Recibimos tus datos!</h2>

        <!-- Mostrar mensaje personalizado -->
        <p v-if="mensajeAgradecimiento">{{ mensajeAgradecimiento }}</p>
    </div>
</div>

`

});


// instancia principal de Vue
const app = new Vue({
    el: '#app',
    data: {
        instalacionPendiente: true,
        eventoDeInstalacion: null,
        titulo: '¡Bienvenido!',
        personajes: [],
        personajeActual: null,
        estadoModal: false,
        historial: []
    },
    methods: {
        instalarAplicacion() {
            if (this.eventoDeInstalacion != null) {
                this.eventoDeInstalacion.prompt()
                    .then(({ outcome }) => {
                        if (outcome == "accepted") {
                            this.instalacionPendiente = false;
                        } else {
                            console.log("no se instaló")
                        }
                    })
            } else {
                console.log("no puedo instalar");
            }
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
        if (this.eventoDeInstalacion == null) {
            this.instalacionPendiente = false;
        }

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