/**
 * main.js — Punto de entrada de la aplicación
 * ======================================================
 * Inicializa Vue, instala Pinia (estado), el Router,
 * Bootstrap (CSS + JS) y los estilos personalizados.
 * ======================================================
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Dayjs plugins (globales)
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
dayjs.extend(utc)

// Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

// Estilos personalizados (variables primero, luego tema)
import './assets/styles/variables.css'
import './assets/styles/auth.css'
import './assets/styles/settings.css'
import './assets/styles/services.css'
import './assets/styles/schedules.css'
import './assets/styles/forms.css'
import './assets/styles/sidebar.css'

const app = createApp(App)

// Plugins
app.use(createPinia())   // estado global con Pinia
app.use(router)          // enrutador Vue Router

// Si la sesión cambia desde otra pestaña (token/user en localStorage),
// recarga la app para no mostrar datos de una cuenta anterior
window.addEventListener('storage', (event) => {
  if (event.key === 'token' || event.key === 'user') {
    window.location.reload()
  }
})

app.mount('#app')
