<template>
  <div class="month-scroll">
    <div class="month-grid" role="grid" aria-label="Calendario mensual">
      <div class="month-days-head">
        <span v-for="day in DAY_NAMES" :key="day" class="month-day-head">{{ day }}</span>
      </div>

      <div
        v-for="cell in cells"
        :key="cell.key"
        class="month-cell"
        :class="{ 'is-out': !cell.inMonth, 'is-today': cell.isToday }"
        role="gridcell"
      >
        <span class="month-day-number">{{ cell.day }}</span>

        <div class="month-aps">
          <button
            v-for="(ap, i) in cell.visibleAps"
            :key="ap.appointmentId"
            type="button"
            class="month-ap"
            :class="`month-ap-${ap.status}`"
            @click.stop="$emit('select', ap)"
          >
            <span class="month-ap-time">{{ timeOf(ap.startAt) }}</span>
            <span class="month-ap-name">{{ ap.serviceName }}</span>
          </button>
          <span v-if="cell.extraCount > 0" class="month-more">+{{ cell.extraCount }} mas</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import dayjs from 'dayjs'

const props = defineProps({
  appointments: { type: Array, default: () => [] },
  month: { type: String, required: true },
})
defineEmits(['select'])

const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MAX_PER_CELL = 3

const byDay = computed(() => {
  const map = {}
  for (const ap of props.appointments) {
    const key = dayjs(ap.startAt).format('YYYY-MM-DD')
    if (!map[key]) map[key] = []
    map[key].push(ap)
  }
  for (const key of Object.keys(map)) {
    map[key].sort((a, b) => (a.startAt > b.startAt ? 1 : -1))
  }
  return map
})

const todayKey = dayjs().format('YYYY-MM-DD')

const cells = computed(() => {
  const first = dayjs(props.month).startOf('month')
  const daysInMonth = first.daysInMonth()
  const offset = (first.day() + 6) % 7
  const prevEnd = first.subtract(1, 'month').endOf('month')
  const total = Math.ceil((offset + daysInMonth) / 7) * 7
  const list = []

  for (let i = 0; i < total; i++) {
    let date, inMonth
    if (i < offset) {
      date = prevEnd.subtract(offset - 1 - i, 'day')
      inMonth = false
    } else if (i < offset + daysInMonth) {
      date = first.add(i - offset, 'day')
      inMonth = true
    } else {
      date = first.add(1, 'month').add(i - offset - daysInMonth, 'day')
      inMonth = false
    }

    const key = date.format('YYYY-MM-DD')
    const aps = byDay.value[key] || []
    list.push({
      key,
      day: date.date(),
      inMonth,
      isToday: key === todayKey,
      visibleAps: aps.slice(0, MAX_PER_CELL),
      extraCount: Math.max(0, aps.length - MAX_PER_CELL),
    })
  }
  return list
})

const timeOf = (date) => dayjs(date).format('HH:mm')
</script>

<style scoped>
.month-scroll { overflow-x: auto; overscroll-behavior-x: contain; }
.month-grid {
  background: rgba(63, 106, 120, 0.4);
  border: 1px solid rgba(63, 106, 120, 0.35);
  border-radius: 12px;
  display: grid;
  gap: 1px;
  grid-auto-rows: minmax(96px, 1fr);
  grid-template-columns: repeat(7, minmax(118px, 1fr));
  min-width: 826px;
  overflow: hidden;
  box-shadow: 0 10px 34px rgba(0, 0, 0, 0.3);
}

.month-days-head {
  display: contents;
}
.month-day-head {
  align-items: center;
  background: rgba(30, 61, 73, 0.55);
  color: #d5f0f7;
  display: flex;
  font-size: 0.74rem;
  font-weight: 700;
  justify-content: center;
  letter-spacing: 0.02em;
  min-height: 40px;
  text-transform: uppercase;
}

.month-cell {
  background: #10252c;
  min-height: 96px;
  padding: 8px;
  position: relative;
  transition: background 0.15s;
}
.month-cell.is-out { background: rgba(6, 13, 16, 0.6); }
.month-cell:hover { background: #1e3d49; }
.month-cell.is-today .month-day-number {
  align-items: center;
  background: #3fe1ff;
  border-radius: 50%;
  color: #081013;
  display: inline-flex;
  font-weight: 900;
  height: 22px;
  justify-content: center;
  padding: 0;
  width: 22px;
}

.month-day-number {
  color: #d5f0f7;
  display: inline-block;
  font-size: 0.82rem;
  font-weight: 600;
  line-height: 1;
  padding: 2px 4px;
}
.month-cell.is-out .month-day-number { color: #3f6a78; }

.month-aps { display: flex; flex-direction: column; gap: 5px; margin-top: 7px; }
.month-ap {
  align-items: center;
  background: rgba(63, 225, 255, 0.14);
  border: 1px solid rgba(63, 225, 255, 0.28);
  border-radius: 6px;
  color: #d5f0f7;
  cursor: pointer;
  display: grid;
  font-size: 0.72rem;
  gap: 6px;
  grid-template-columns: 40px minmax(0, 1fr);
  min-height: 24px;
  padding: 3px 6px;
  text-align: left;
  transition: background 0.15s, border-color 0.15s;
  width: 100%;
}
.month-ap:hover { background: rgba(63, 225, 255, 0.26); border-color: rgba(63, 225, 255, 0.55); }
.month-ap-time { color: #3fe1ff; font-weight: 800; white-space: nowrap; }
.month-ap-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.month-cell.is-out .month-ap { display: none; }

.month-more { color: rgba(213, 240, 247, 0.6); font-size: 0.7rem; font-weight: 700; padding: 0 4px; }

@media (min-width: 1280px) {
  .month-grid { grid-auto-rows: minmax(118px, 1fr); }
}
</style>