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

// Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

// Estilos personalizados (variables primero, luego tema)
import './assets/styles/variables.css'
import './assets/styles/auth.css'
import './assets/styles/settings.css'

const app = createApp(App)

// Plugins
app.use(createPinia())   // estado global con Pinia
app.use(router)          // enrutador Vue Router

app.mount('#app')
