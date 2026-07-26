<!-- ============================================================
     AnimatedBars.vue — Texto animado + 3 barritas decorativas
     ============================================================
     Muestra un tagline que cambia cada 4 segundos y 3 barritas
     horizontales que se iluminan en sincronía con el texto.
     ============================================================ -->

<template>
  <div class="auth-branding position-absolute bottom-0 start-0 end-0 z-1 p-4">

    <!-- Tagline animado -->
    <div class="auth-tagline">
      <span :key="current" style="animation: fadeSlideIn 0.8s ease-out both;">
        {{ taglines[current] }}
      </span>
    </div>

    <!-- 3 barritas indicadoras -->
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
 * Componente decorativo con taglines rotativos y 3 indicadores.
 */
import {ref, onMounted, onUnmounted} from 'vue'

const taglines = [
  'Tu agenda, sin complicaciones',
  'Reservas simples, negocios fuertes',
  'Cada cita en su Lugar',
  'Tu negocio, siempre a tiempo',
  'Agenda rápida, clientes felices',
  'Tu horario bajo control',
]

const current = ref(0)
let intervalo

onMounted(() => {
  intervalo = setInterval(() => {
    current.value = (current.value + 1) % taglines.length
  }, 7000)
})

onUnmounted(() => {
  clearInterval(intervalo)
})
</script>

<style scoped>
.auth-branding {
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.85));
}

.auth-tagline {
    color: var(--color-text);
    font-size: 32px;
    font-weight: 600;
    line-height: 1.4;
    margin-left: 15px;
}

.auth-bars {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 0.5rem;
    margin-bottom: 2rem;
    margin-left: 15px;
}

.auth-bar {
    width: 50px;
    height: 3px;
    border-radius: 3px;
    background: var(--color-text);
    opacity: 0.35;
    transition: opacity 0.6s ease;
}

.auth-bar.active {
    opacity: 0.85;
}

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
