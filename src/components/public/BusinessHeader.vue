<template>
  <div class="business-header">
    <div class="hero-bg"></div>

    <div class="hero-inner">
      <div class="identity">
        <div class="logo-wrap">
          <img v-if="business.logoUrl" :src="business.logoUrl" :alt="business.name" class="logo" />
          <div v-else class="logo logo--placeholder">{{ business.name?.charAt(0) }}</div>
        </div>

        <div class="copy">
          <div class="category-row">
            <span v-if="business.category" class="category">{{ business.category }}</span>
            <span class="status-dot"></span>
            <span class="status-text">Reservas disponibles</span>
          </div>
          <h1 class="name">{{ business.name }}</h1>
          <p v-if="business.description" class="description">{{ business.description }}</p>

          <div class="quick-info">
            <span v-if="business.address" class="info-pill">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              {{ business.address }}
            </span>
            <span v-if="business.phoneNumber || business.whatsapp" class="info-pill">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.9.32 1.77.59 2.61a2 2 0 0 1-.45 2.11L8 9.64a16 16 0 0 0 6.36 6.36l1.2-1.2a2 2 0 0 1 2.11-.45c.84.27 1.71.47 2.61.59A2 2 0 0 1 22 16.92Z"/></svg>
              {{ business.whatsapp || business.phoneNumber }}
            </span>
          </div>
        </div>
      </div>

      <aside class="booking-card">
        <span class="booking-label">Reserva online</span>
        <strong>Programa tu próxima cita</strong>
        <p>Elige servicio, profesional y horario disponible en minutos.</p>
        <button class="btn btn-primary" @click="$emit('book')">Programar ahora</button>
      </aside>
    </div>

    <section v-if="hoursRanges.length" class="hours">
      <span class="hours-label">Horarios</span>
      <div class="hours-list">
        <span v-for="(h, i) in hoursRanges" :key="i" class="hours-item">{{ h }}</span>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  business: { type: Object, required: true },
})
defineEmits(['book'])

const WEEK_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const fmtTime = (t) => (t ? String(t).slice(0, 5) : '')

/** Agrupa días consecutivos con el mismo horario: "Lun a Vie · 9:00 – 18:00" */
const hoursRanges = computed(() => {
  const hours = (props.business.openingHours || [])
    .slice()
    .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
  const ranges = []
  for (const h of hours) {
    const label = `${fmtTime(h.startTime)} – ${fmtTime(h.endTime)}`
    const last = ranges[ranges.length - 1]
    if (last && last.hours === label) {
      last.end = h.dayOfWeek
    } else {
      ranges.push({ hours: label, start: h.dayOfWeek, end: h.dayOfWeek })
    }
  }
  return ranges.map((r) => {
    const days = r.start === r.end ? WEEK_SHORT[r.start - 1] : `${WEEK_SHORT[r.start - 1]} a ${WEEK_SHORT[r.end - 1]}`
    return `${days} · ${r.hours}`
  })
})
</script>

<style scoped>
.business-header {
  background: linear-gradient(180deg, #0c2027 0%, var(--color-surface) 100%);
  border-bottom: 1px solid rgba(63, 225, 255, 0.18);
  position: relative;
  overflow: hidden;
}
.hero-bg {
  background:
    radial-gradient(circle at 82% 18%, rgba(63, 225, 255, 0.18), transparent 26%),
    repeating-linear-gradient(135deg, rgba(63,225,255,0.06) 0px, rgba(63,225,255,0.06) 2px, transparent 2px, transparent 28px);
  inset: 0;
  opacity: 0.9;
  position: absolute;
}
.hero-inner {
  align-items: center;
  display: grid;
  gap: 28px;
  grid-template-columns: minmax(0, 1fr) 320px;
  margin: 0 auto;
  max-width: 1180px;
  min-height: 330px;
  padding: 56px 28px 30px;
  position: relative;
}
.identity { align-items: center; display: flex; gap: 24px; min-width: 0; }
.logo-wrap { flex-shrink: 0; }
.logo { width: 118px; height: 118px; border-radius: 24px; border: 4px solid rgba(213, 240, 247, 0.18); box-shadow: 0 18px 48px rgba(0, 0, 0, 0.28); object-fit: cover; }
.logo--placeholder {
  display: flex; align-items: center; justify-content: center;
  background: var(--color-surface-alt); color: var(--neon); font-size: 2.6rem; font-weight: 800;
}
.copy { min-width: 0; }
.category-row { align-items: center; color: rgba(213, 240, 247, 0.72); display: flex; flex-wrap: wrap; font-size: 0.82rem; font-weight: 700; gap: 8px; margin-bottom: 8px; text-transform: uppercase; }
.category { color: var(--neon); }
.status-dot { background: #53e28f; border-radius: 50%; box-shadow: 0 0 0 5px rgba(83, 226, 143, 0.12); height: 8px; width: 8px; }
.status-text { text-transform: none; }
.name { color: var(--color-text); font-size: clamp(2rem, 4vw, 3.3rem); font-weight: 900; letter-spacing: 0; line-height: 1.02; margin: 0; }
.description { color: rgba(213, 240, 247, 0.68); font-size: 1rem; line-height: 1.55; margin: 14px 0 0; max-width: 680px; }
.quick-info { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 18px; }
.info-pill { align-items: center; background: rgba(6, 13, 16, 0.42); border: 1px solid rgba(213, 240, 247, 0.12); border-radius: 999px; color: rgba(213, 240, 247, 0.8); display: inline-flex; gap: 7px; max-width: 100%; padding: 0.5rem 0.8rem; }
.icon { width: 14px; height: 14px; flex-shrink: 0; }
.booking-card { background: rgba(6, 13, 16, 0.45); border: 1px solid rgba(63, 225, 255, 0.22); border-radius: 16px; box-shadow: var(--shadow-lg); padding: 22px; }
.booking-label { color: var(--neon); font-size: 0.74rem; font-weight: 800; text-transform: uppercase; }
.booking-card strong { color: var(--color-text); display: block; font-size: 1.25rem; margin-top: 8px; }
.booking-card p { color: rgba(213, 240, 247, 0.62); font-size: 0.9rem; line-height: 1.45; margin: 8px 0 18px; }
.booking-card {
  background: rgba(6, 13, 16, 0.45);
  border: 1px solid rgba(63, 225, 255, 0.22);
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
  padding: 22px;

  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
}

.booking-card .btn-primary {
  width: 100%;
  margin-top: auto;

  background: var(--color-primary);
  border: 1px solid var(--neon-dim);
  border-radius: 8px;
  padding: 0.6rem 1.3rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.01em;

  box-shadow: 0 0 10px rgba(var(--color-primary-rgb), 0.2);

  transition:
    background 0.2s,
    transform 0.1s,
    box-shadow 0.2s;
}

.booking-card .btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 0 18px rgba(var(--color-primary-rgb), 0.45);
}
 
.hours { align-items: center; border-top: 1px solid rgba(213, 240, 247, 0.09); display: flex; gap: 14px; margin: 0 auto; max-width: 1180px; padding: 16px 28px 20px; position: relative; }
.hours-label { color: var(--color-text-label); flex-shrink: 0; font-size: 0.78rem; font-weight: 800; text-transform: uppercase; }
.hours-list { display: flex; flex-wrap: wrap; gap: 8px; }
.hours-item { background: rgba(63, 225, 255, 0.12); border: 1px solid rgba(63, 225, 255, 0.16); color: var(--color-text-label); border-radius: 999px; padding: 0.32rem 0.78rem; font-size: 0.8rem; }
@media (max-width: 860px) {
  .hero-inner { grid-template-columns: 1fr; min-height: 0; }
  .identity { align-items: flex-start; }
  .booking-card { max-width: none; }
}
@media (max-width: 560px) {
  .hero-inner { padding: 34px 18px 22px; }
  .identity { flex-direction: column; gap: 16px; }
  .logo { height: 88px; width: 88px; border-radius: 18px; }
  .hours { align-items: flex-start; flex-direction: column; padding: 14px 18px 18px; }
}
</style>
