<!-- ============================================================
     PlanTab.vue — Plan del negocio (solo dueño)
     ============================================================
       - Plan actual (GET /business/plan)
       - Uso del plan con gráficas doughnut (Chart.js)
       - Cambiar plan (POST /business/plan + catálogo /public/plans)
       - Historial de planes (GET /business/plan/history)
     ============================================================ -->

<template>
  <div class="settings-tab">
  <!-- Sección: Plan actual -->
  <section class="settings-section">
    <div class="settings-section-header">
      <div>
        <h3 class="settings-section-title">Plan actual</h3>
        <p class="settings-section-subtitle">Tu suscripción y límites</p>
      </div>
      <span v-if="settingsStore.plan" class="status-badge" :class="statusMeta[subscriptionStatus]?.cls || 'status-default'">
        {{ statusMeta[subscriptionStatus]?.label || subscriptionStatus }}
      </span>
    </div>

    <div v-if="settingsStore.plan" class="settings-data-grid">
      <div>
        <div class="settings-data-label">Plan</div>
        <div class="settings-data-value">{{ planName }}</div>
      </div>
      <div>
        <div class="settings-data-label">Precio</div>
        <div class="settings-data-value">
          {{ formatPrice(planPrice) }}
          <span v-if="subscriptionStatus === 'TRIAL'" class="plan-trial-tag">prueba</span>
        </div>
      </div>
      <div>
        <div class="settings-data-label">Inicio</div>
        <div class="settings-data-value">{{ formatDate(settingsStore.plan.startAt) }}</div>
      </div>
      <div>
        <div class="settings-data-label">Fin</div>
        <div class="settings-data-value">{{ formatDate(settingsStore.plan.endAt) }}</div>
      </div>
    </div>

    <p v-if="settingsStore.plan?.plan?.description" class="plan-description">
      {{ settingsStore.plan.plan.description }}
    </p>
  </section>

  <!-- Sección: Uso del plan -->
  <section class="settings-section">
    <div class="settings-section-header">
      <div>
        <h3 class="settings-section-title">Uso del plan</h3>
        <p class="settings-section-subtitle">Consumo de los límites de tu plan</p>
      </div>
    </div>

    <div v-if="usageItems.length" class="plan-charts-grid">
      <div v-for="item in usageItems" :key="item.label" class="plan-chart-item">
        <template v-if="item.unlimited">
          <div class="plan-chart plan-chart-unlimited">
            <span class="plan-unlimited-symbol">&infin;</span>
          </div>
        </template>
        <template v-else>
          <div class="plan-chart">
            <Doughnut :data="item.data" :options="item.options" />
          </div>
        </template>
        <div class="plan-chart-label">{{ item.label }}</div>
        <div v-if="!item.unlimited" class="plan-chart-status" :class="item.statusCls">
          {{ item.statusText }}
        </div>
        <div v-else class="plan-chart-status plan-status-ok">Sin límite</div>
      </div>
    </div>
  </section>

  <!-- Sección: Cambiar plan -->
  <section class="settings-section">
    <div class="settings-section-header">
      <div>
        <h3 class="settings-section-title">Cambiar plan</h3>
        <p class="settings-section-subtitle">Selecciona un nuevo plan para tu negocio</p>
      </div>
    </div>

    <div v-if="settingsStore.availablePlans.length === 0" class="settings-empty">
      No hay planes disponibles.
    </div>

    <div v-else class="plan-cards-grid">
      <div
        v-for="pl in settingsStore.availablePlans"
        :key="pl.planId"
        class="plan-card"
        :class="{ 'is-current': pl.planId === currentPlanId }"
      >
        <div class="plan-card-head">
          <div>
            <h4 class="plan-card-name">{{ pl.displayName || pl.name }}</h4>
            <p class="plan-card-price">
              {{ formatPrice(pl.monthlyPriceCents) }}<span>/mes</span>
            </p>
          </div>
          <span v-if="pl.planId === currentPlanId" class="status-badge status-accepted">Tu plan</span>
        </div>

        <p v-if="pl.description" class="plan-card-desc">{{ pl.description }}</p>

        <ul class="plan-card-features">
          <li v-if="pl.serviceLimit > 0">Hasta {{ pl.serviceLimit }} servicios</li>
          <li v-else>Servicios ilimitados</li>
          <li v-if="pl.monthlyAppointmentLimit > 0">Hasta {{ pl.monthlyAppointmentLimit }} citas al mes</li>
          <li v-else>Citas mensuales ilimitadas</li>
          <li v-if="pl.employeeLimit > 0">Hasta {{ pl.employeeLimit }} empleados</li>
          <li v-else>Empleados ilimitados</li>
        </ul>

        <div v-if="pl.planId !== currentPlanId && pl.requiresActivationCode" class="plan-card-code">
          <label class="form-label" :for="'code-' + pl.planId">Código de activación</label>
          <input
            :id="'code-' + pl.planId"
            v-model="codes[pl.planId]"
            type="text"
            class="form-control"
            placeholder="Ingresa tu código"
          />
          <div class="field-hint">Este plan requiere un código de activación.</div>
        </div>

        <button
          v-if="pl.planId !== currentPlanId"
          type="button"
          class="btn btn-primary plan-card-btn"
          :disabled="changingPlanId === pl.planId"
          @click="handleChangePlan(pl.planId)"
        >
          <span v-if="changingPlanId === pl.planId" class="spinner-border spinner-border-sm me-2" role="status"></span>
          {{ changingPlanId === pl.planId ? 'Cambiando...' : 'Cambiar a este plan' }}
        </button>
        <div v-else class="plan-card-current">Estás en este plan</div>
      </div>
    </div>

    <div v-if="success" class="settings-alert settings-alert-success mt-3">
      <span v-html="checkIcon"></span>
      <span>{{ success }}</span>
    </div>

    <div v-if="error" class="settings-alert settings-alert-error mt-3">
      <span v-html="alertIcon"></span>
      <span>{{ error }}</span>
    </div>
  </section>

  <!-- Sección: Historial de planes -->
  <section class="settings-section">
    <div class="settings-section-header">
      <div>
        <h3 class="settings-section-title">Historial de planes</h3>
        <p class="settings-section-subtitle">Cambios de plan anteriores</p>
      </div>
    </div>

    <div v-if="settingsStore.planHistory.length === 0" class="settings-empty">
      Sin cambios de plan registrados.
    </div>

    <div v-else class="invitations-table">
      <div class="invitations-row invitations-head">
        <span>Plan</span>
        <span>Estado</span>
        <span>Inicio</span>
        <span>Fin</span>
        <span></span>
      </div>

      <div v-for="(h, i) in settingsStore.planHistory" :key="i" class="invitations-row">
        <span class="inv-email">{{ h.plan?.displayName || h.plan?.name || '—' }}</span>
        <span>
          <span class="status-badge" :class="statusMeta[h.subscriptionStatus]?.cls || 'status-default'">
            {{ statusMeta[h.subscriptionStatus]?.label || h.subscriptionStatus }}
          </span>
        </span>
        <span class="inv-date">{{ formatDate(h.startAt) }}</span>
        <span class="inv-date">{{ formatDate(h.endAt) }}</span>
        <span></span>
      </div>
    </div>
  </section>
  </div>
</template>

<script setup>
/**
 * PlanTab.vue
 * Solo se renderiza cuando el usuario es dueño del negocio (isOwner).
 * Registra solo los componentes de Chart.js necesarios (doughnut).
 */
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { useSettingsStore } from '@/stores/settings'

import checkIcon from '@/assets/images/icons/check.svg?raw'
import alertIcon from '@/assets/images/icons/alert-circle.svg?raw'

ChartJS.register(ArcElement, Tooltip, Legend)

// Tema oscuro por defecto para Chart.js
ChartJS.defaults.color = 'rgba(255, 255, 255, 0.5)'
ChartJS.defaults.font.family = 'inherit'

// Plugin: texto centrado en el doughnut (usado / de límite)
const centerTextPlugin = {
  id: 'centerText',
  afterDraw(chart) {
    const { ctx } = chart
    const meta = chart.getDatasetMeta(0)
    const arc = meta?.data?.[0]
    if (!arc) return
    const { label = '', sub = '' } = chart.options.plugins?.centerText || {}
    const { x, y } = arc
    ctx.save()
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#fff'
    ctx.font = '700 15px inherit'
    ctx.fillText(label, x, y - 7)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)'
    ctx.font = '600 10px inherit'
    ctx.fillText(sub, x, y + 11)
    ctx.restore()
  },
}

ChartJS.register(centerTextPlugin)

const settingsStore = useSettingsStore()

const codes = ref({})
const changingPlanId = ref(null)
const success = ref('')
const error = ref('')

const statusMeta = {
  TRIAL: { label: 'Prueba', cls: 'status-pending' },
  ACTIVE: { label: 'Activo', cls: 'status-accepted' },
  PAST_DUE: { label: 'Mora', cls: 'status-cancelled' },
  CANCELLED: { label: 'Cancelado', cls: 'status-cancelled' },
  EXPIRED: { label: 'Expirado', cls: 'status-expired' },
}

const subscriptionStatus = computed(() => settingsStore.plan?.subscriptionStatus || '')
const planPrice = computed(() => settingsStore.plan?.plan?.monthlyPriceCents || 0)
const planName = computed(() => {
  const p = settingsStore.plan?.plan
  return p?.displayName || p?.name || '—'
})

const currentPlanId = computed(() => settingsStore.plan?.plan?.planId || null)

const formatPrice = (cents) => {
  const n = Number(cents) || 0
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n / 100)
}

const formatDate = (value) => (value ? dayjs(value).format('DD MMM YYYY') : '—')

/** buildUsage — Crea datos y opciones de una gráfica doughnut de uso */
const buildUsage = (label, used, limit, reached, exceeded) => {
  const safeLimit = Number(limit) || 0
  const safeUsed = Number(used) || 0
  const item = { label, unlimited: safeLimit <= 0 }
  if (item.unlimited) return item

  const color = exceeded ? '#ff8a8a' : reached ? '#ffc75b' : '#3fe1ff'
  item.data = {
    labels: ['Uso', 'Disponible'],
    datasets: [
      {
        data: [safeUsed, Math.max(0, safeLimit - safeUsed)],
        backgroundColor: [color, 'rgba(255, 255, 255, 0.08)'],
        borderWidth: 0,
      },
    ],
  }
  item.options = {
    cutout: '72%',
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
      centerText: { label: `${safeUsed}`, sub: `de ${safeLimit}` },
    },
  }
  item.statusText = exceeded ? 'Límite superado' : reached ? 'Límite alcanzado' : 'Disponible'
  item.statusCls = exceeded ? 'plan-status-exceeded' : reached ? 'plan-status-reached' : 'plan-status-ok'
  return item
}

const usageItems = computed(() => {
  const p = settingsStore.plan
  if (!p) return []
  const limits = p.plan || {}
  return [
    buildUsage('Servicios', p.serviceCount, limits.serviceLimit, p.serviceLimitReached, p.serviceLimitExceeded),
    buildUsage('Citas del mes', p.currentMonthAppointmentCount, limits.monthlyAppointmentLimit, p.appointmentLimitReached, p.appointmentLimitExceeded),
    buildUsage('Empleados', p.employeeCount, limits.employeeLimit, p.employeeLimitReached, p.employeeLimitExceeded),
  ]
})

const handleChangePlan = async (planId) => {
  success.value = ''
  error.value = ''
  changingPlanId.value = planId
  try {
    await settingsStore.changePlan(planId, codes.value[planId]?.trim() || undefined)
    codes.value[planId] = ''
    success.value = 'Plan actualizado correctamente'
  } catch (e) {
    error.value = e.message || 'Error al cambiar el plan'
  } finally {
    changingPlanId.value = null
  }
}
</script>
