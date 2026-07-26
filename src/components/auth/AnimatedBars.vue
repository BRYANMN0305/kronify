<!-- ============================================================
     AnimatedBars.vue — Texto animado + 3 barritas decorativas
     ============================================================
     Muestra un tagline que cambia cada 7 segundos y 3 barritas
     horizontales que se iluminan en sincronía con el texto.
     Posicionado en la parte inferior del panel izquierdo.
     ============================================================ -->

<template>
  <div class="auth-branding position-absolute bottom-0 start-0 end-0 z-1 p-4">

    <!-- Tagline rotativo con animación de entrada -->
    <div class="auth-tagline">
      <span :key="current" style="animation: fadeSlideIn 0.8s ease-out both;">
        {{ taglines[current] }}
      </span>
    </div>

    <!-- 3 barritas indicadoras: se ilumina una por cada subíndice -->
    <div class="auth-bars">
      <div
          v-for="i in 3"
          :key="i"
          class="auth-bar"
          :class="{ 'active': current % 3 === i - 1 }"
      />
    </div>

  </div>
</template>

<script setup>
/**
 * AnimatedBars.vue
 *
 * Componente decorativo posicionado al pie del panel izquierdo.
 * Cicla a través de 6 taglines promocionales cada 7 segundos
 * y resalta una de las 3 barritas en cada cambio.
 *
 * @component AnimatedBars
 *
 * Animaciones:
 *   - fadeSlideIn: desliza el tagline desde abajo con fade
 *   - Barritas: cambian de opacidad vía clase .active
 */
import {ref, onMounted, onUnmounted} from 'vue'

/** Lista de frases promocionales que rotan en bucle */
const taglines = [
  'Tu agenda, sin complicaciones',
  'Reservas simples, negocios fuertes',
  'Cada cita en su Lugar',
  'Tu negocio, siempre a tiempo',
  'Agenda rápida, clientes felices',
  'Tu horario bajo control',
]

/** Índice del tagline actual */
const current = ref(0)
let intervalo

onMounted(() => {
  /** Cambia al siguiente tagline cada 7 segundos (ciclo base para sincronización) */
  intervalo = setInterval(() => {
    current.value = (current.value + 1) % taglines.length
  }, 7000)
})

onUnmounted(() => {
  clearInterval(intervalo)
})
</script>

<style scoped>
/* --- Contenedor con degradado de fondo hacia abajo --- */
.auth-branding {
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.85));
}

/* --- Texto del tagline --- */
.auth-tagline {
    color: var(--color-text-label);
    font-size: 32px;
    font-weight: 600;
    line-height: 1.4;
    margin-left: 15px;
}

/* --- Contenedor de barritas --- */
.auth-bars {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 0.5rem;
    margin-bottom: 2rem;
    margin-left: 15px;
}

/* --- Barrita individual (inactiva) --- */
.auth-bar {
    width: 50px;
    height: 3px;
    border-radius: 3px;
    background: var(--color-text);
    opacity: 0.35;
    transition: opacity 0.6s ease;
}

/* --- Barrita activa (iluminada) --- */
.auth-bar.active {
    opacity: 0.85;
}

/* --- Animación de entrada del tagline --- */
@keyframes fadeSlideIn {
    from {
        opacity: 0;
        transform: translateY(8px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
