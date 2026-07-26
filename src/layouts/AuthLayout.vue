<!-- ============================================================
     AuthLayout.vue — Layout de las páginas de autenticación
     ============================================================
     Divide la pantalla en dos paneles:
       - Izquierdo: imagen decorativa + texto animado (45%)
       - Derecho: formulario centrado (55%)
     ============================================================ -->

<template>
  <div class="auth-page vh-100 d-flex">

    <!-- Panel izquierdo: imagen decorativa (oculto en móvil) -->
    <div
        class="auth-panel-left d-none d-lg-flex flex-column position-relative rounded-3 overflow-hidden shadow-lg m-2"
        style="flex: 0 0 45%;"
    >
      <div class="d-flex justify-content-end p-3">
        <BackToWebsiteButtom />
      </div>

      <AnimatedBars />
    </div>

    <!-- Panel derecho: formulario -->
    <div class="flex-grow-1 d-flex align-items-center justify-content-center p-4" style="overflow-y: auto;">
      <!-- auth-card: aplica estilos oscuros via CSS -->
      <div class="auth-card w-100 py-3" style="max-width: 400px;">
        <slot />
      </div>
    </div>

  </div>
</template>

<script setup>
/**
 * AuthLayout.vue
 * Layout compartido para Login y Register.
 * @component AuthLayout
 * @requires AnimatedBars
 */
import AnimatedBars from '@/components/auth/AnimatedBars.vue'
import BackToWebsiteButtom from "@/components/auth/BackToWebsiteButtom.vue";
</script>
