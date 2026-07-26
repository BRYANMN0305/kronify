<!-- ============================================================
     ChronoClock.vue — Reloj animado tipo hourglass orbital
     ============================================================
     SVG animado con SMIL (animaciones nativas SVG) que representa
     un reloj de arena estilizado con órbitas, partículas fluidas,
     núcleo pulsante y una línea de barrido vertical.
     ============================================================ -->

<template>
  <div class="d-flex">
    <div class="chrono-clock">
      <svg viewBox="0 0 340 340" :width="size" :height="size">

        <defs>
          <!-- Degradado neón para el núcleo pulsante -->
          <linearGradient id="coreGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--neon)"/>
            <stop offset="100%" stop-color="var(--neon-dim)"/>
          </linearGradient>
          <!-- Filtro de brillo (glow) para el núcleo -->
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <!-- Círculo punteado que rota lentamente -->
        <g class="ring ring-outer">
          <circle cx="170" cy="170" r="150" fill="none" stroke="var(--acero-3)" stroke-width="1.5"
                  stroke-dasharray="2 10"/>
        </g>

        <!-- Círculo con marcas de tick en los 4 puntos cardinales -->
        <g class="ring ring-mid">
          <circle cx="170" cy="170" r="122" fill="none" stroke="var(--acero-4)" stroke-width="1" opacity="0.6"/>
          <g stroke="var(--neon)" stroke-width="2" opacity="0.7">
            <line x1="170" y1="48" x2="170" y2="60"/>
            <line x1="170" y1="280" x2="170" y2="292"/>
            <line x1="48" y1="170" x2="60" y2="170"/>
            <line x1="280" y1="170" x2="292" y2="170"/>
          </g>
        </g>

        <g class="ring ring-tick" opacity="0.5">
          <circle cx="170" cy="170" r="98" fill="none" stroke="var(--acero-3)" stroke-width="1"/>
        </g>

        <!-- Dos chevrones enfrentados formando un hourglass -->
        <g stroke="var(--neon)" stroke-width="2" fill="none" opacity="0.9">
          <path d="M 128 96 L 212 96 L 170 168 Z"/>
          <path d="M 128 244 L 212 244 L 170 172 Z"/>
        </g>

        <!-- Líneas superior e inferior del hourglass -->
        <line x1="128" y1="96" x2="212" y2="96" stroke="var(--acero-5)" stroke-width="3"/>
        <line x1="128" y1="244" x2="212" y2="244" stroke="var(--acero-5)" stroke-width="3"/>

        <!-- Gotitas que caen por el cuello del reloj de arena -->
        <circle cx="170" cy="160" r="2.2" fill="var(--neon)">
          <animateTransform attributeName="transform" type="translate" from="0 -4" to="0 76" dur="1.8s"
                            repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.85;1" dur="1.8s"
                   repeatCount="indefinite"/>
        </circle>
        <circle cx="166" cy="160" r="1.6" fill="var(--neon)">
          <animateTransform attributeName="transform" type="translate" from="0 -4" to="0 76" dur="1.8s" begin="0.4s"
                            repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.85;1" dur="1.8s" begin="0.4s"
                   repeatCount="indefinite"/>
        </circle>
        <circle cx="174" cy="160" r="1.6" fill="var(--neon)">
          <animateTransform attributeName="transform" type="translate" from="0 -4" to="0 76" dur="1.8s" begin="0.9s"
                            repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.85;1" dur="1.8s" begin="0.9s"
                   repeatCount="indefinite"/>
        </circle>
        <circle cx="170" cy="160" r="1.3" fill="var(--neon)">
          <animateTransform attributeName="transform" type="translate" from="0 -4" to="0 76" dur="1.8s" begin="1.3s"
                            repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.85;1" dur="1.8s" begin="1.3s"
                   repeatCount="indefinite"/>
        </circle>

        <!-- Partículas secundarias que caen en la cámara inferior -->
        <circle cx="168" cy="164" r="1" fill="var(--neon)" opacity="0.6">
          <animateTransform attributeName="transform" type="translate" from="0 0" to="0 68" dur="2.4s" begin="0.6s"
                            repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0;0.8;0.8;0" keyTimes="0;0.1;0.8;1" dur="2.4s" begin="0.6s"
                   repeatCount="indefinite"/>
        </circle>
        <circle cx="172" cy="164" r="0.8" fill="var(--neon)" opacity="0.5">
          <animateTransform attributeName="transform" type="translate" from="0 0" to="0 68" dur="2.4s" begin="1.1s"
                            repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0;0.7;0.7;0" keyTimes="0;0.1;0.8;1" dur="2.4s" begin="1.1s"
                   repeatCount="indefinite"/>
        </circle>
        <circle cx="170" cy="164" r="0.9" fill="var(--neon)" opacity="0.5">
          <animateTransform attributeName="transform" type="translate" from="0 0" to="0 68" dur="2.4s" begin="1.8s"
                            repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0;0.7;0.7;0" keyTimes="0;0.1;0.8;1" dur="2.4s" begin="1.8s"
                   repeatCount="indefinite"/>
        </circle>

        <!-- Círculo central que late (cambia de tamaño y opacidad) -->
        <circle cx="170" cy="170" r="5" fill="url(#coreGrad)" filter="url(#glow)">
          <animate attributeName="r" values="5;7;5" dur="2.2s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.55;1;0.55" dur="2.2s" repeatCount="indefinite"/>
        </circle>

        <!-- Rectángulo horizontal que recorre el SVG de arriba abajo
             sincronizado con el ciclo de 7s de AnimatedBars -->
        <rect x="90" y="0" width="160" height="2" rx="1" fill="var(--acero-5)">
          <animateTransform attributeName="transform" type="translate" from="0 -5" to="0 345" dur="7s"
                            repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0;0.8;0.8;0" keyTimes="0;0.06;0.94;1" dur="7s"
                   repeatCount="indefinite"/>
        </rect>

      </svg>
    </div>
  </div>
</template>

<script setup>
/**
 * ChronoClock.vue
 *
 * Reloj animado decorativo para el panel izquierdo de autenticación.
 * Utiliza animaciones SMIL nativas de SVG para total compatibilidad
 * con navegadores modernos sin depender de CSS transforms en SVG.
 *
 * @component ChronoClock
 *
 * @prop {number} [size=380] - Ancho/alto del SVG en píxeles
 *
 * Animaciones incluidas:
 *   - 3 anillos concéntricos rotando a distintas velocidades (CSS keyframes)
 *   - Partículas (gotitas) cayendo por el cuello del hourglass (SMIL)
 *   - Núcleo pulsante con cambio de radio y opacidad (SMIL)
 *   - Línea de barrido vertical sincronizada a 7s (SMIL)
 */
defineProps({
  size: {type: Number, default: 380}
})
</script>

<style scoped>
/* Contenedor flex para centrar el SVG */
.chrono-clock {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Origen de rotación para todos los anillos (centro del SVG) */
.ring {
  transform-origin: 170px 170px;
}

/* Velocidades de rotación diferenciadas */
.ring-outer {
  animation: chrono-spin 30s linear infinite;
}

.ring-mid {
  animation: chrono-spin 22s linear infinite reverse;
}

.ring-tick {
  animation: chrono-spin 60s linear infinite;
}

@keyframes chrono-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
