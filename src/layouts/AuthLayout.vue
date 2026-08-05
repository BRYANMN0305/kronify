<!-- ============================================================
     AuthLayout.vue — Layout de las páginas de autenticación
     ============================================================
     Divide la pantalla en dos paneles:
       - Izquierdo: reloj animado ChronoClock + texto + AnimatedBars (45%)
       - Derecho: formularios de login/register centrados (55%)
     ============================================================ -->

<template>
  <div
      class="auth-page d-flex"
      style="min-height: 100vh; min-height: 100dvh; overflow-x: hidden;"
  >

    <!-- ============ PANEL IZQUIERDO ============ -->
    <!-- Hero visual: oculto en móviles (< lg), ocupa 45% en desktop -->
    <div
        class="auth-panel-left d-none d-lg-flex flex-column align-items-center position-relative rounded-3 overflow-hidden shadow-lg m-2"
        style="flex: 0 0 45%;"
    >
      <!-- Overlay de cuadrícula (grid) decorativo -->
      <div class="auth-grid-overlay"></div>

      <!-- Botón de volver al sitio web, anclado arriba a la derecha -->
      <div class="w-100 d-flex justify-content-end p-3" style="position:relative; z-index:1;">
        <BackToWebsiteButtom />
      </div>

      <!-- Reloj animado + texto centrado vertical y horizontalmente -->
      <div class="flex-grow-1 d-flex flex-column align-items-center justify-content-center px-4" style="position:relative; z-index:1;">
        <ChronoClock />
        <p class="chrono-eyebrow">Sistema de agendamiento</p>
      </div>

      <!-- Texto animado y barritas indicadoras en la parte inferior -->
      <AnimatedBars />
    </div>

    <!-- ============ PANEL DERECHO ============ -->
    <!-- Contenedor del formulario (LoginForm o RegisterForm) -->
    <div class="flex-grow-1 d-flex flex-column p-4" style="overflow-y: auto;">
      <!-- Botón volver al sitio web solo en móvil/tablet (< lg) -->
      <div class="d-lg-none w-100 mb-3" style="position: relative; z-index: 1;">
        <BackToWebsiteButtom />
      </div>
      <!-- margin: auto centra y, si el form es más alto que la pantalla,
           nunca corta el inicio (se puede hacer scroll desde arriba) -->
      <div class="auth-card w-100 py-3" style="max-width: 400px; margin: auto;">
        <slot />
      </div>
    </div>

  </div>
</template>

<script setup>
/**
 * AuthLayout.vue
 *
 * Layout compartido para las vistas de Login y Register.
 * Renderiza un panel visual decorativo a la izquierda y un slot
 * para el formulario correspondiente a la derecha.
 *
 * @component AuthLayout
 * @requires AnimatedBars - Texto rotativo con barritas decorativas
 * @requires BackToWebsiteButtom - Botón para volver al sitio principal
 * @requires ChronoClock - Reloj animado SVG
 *
 * @slot default - Contenido del formulario (LoginForm | RegisterForm)
 */
import AnimatedBars from '@/components/auth/AnimatedBars.vue'
import BackToWebsiteButtom from "@/components/auth/BackToWebsiteButtom.vue";
import ChronoClock from '@/components/auth/ChronoClock.vue'
</script>
