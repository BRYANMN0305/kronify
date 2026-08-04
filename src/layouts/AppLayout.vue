<!-- ============================================================
     AppLayout.vue — Layout principal de las vistas autenticadas
     ============================================================
     Sidebar fijo a la izquierda (desktop) + contenido a la derecha.
     BottomNav fija abajo en mobile.
     ============================================================ -->

<template>
  <div class="app-shell">
    <Sidebar />
    <main class="app-main">
      <RouterView />
    </main>
    <BottomNav />
  </div>
</template>

<script setup>
/**
 * AppLayout.vue
 * Layout compartido para todas las rutas autenticadas.
 * Renderiza el sidebar (desktop) y la barra inferior (mobile),
 * dejando el contenido de la vista en el slot.
 */
import { RouterView } from 'vue-router'
import Sidebar from '@/components/navigation/Sidebar.vue'
import BottomNav from '@/components/navigation/BottomNav.vue'
</script>