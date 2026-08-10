<template>
  <section class="agenda-filters">
    <div class="filter-field">
      <span>Desde</span>
      <input v-model="local.startDate" class="agenda-control" type="date" aria-label="Fecha inicial" />
    </div>

    <div class="filter-field">
      <span>Hasta</span>
      <input v-model="local.endDate" class="agenda-control" type="date" aria-label="Fecha final" />
    </div>

    <div class="filter-field">
      <span>Empleado</span>
      <select v-model="local.employeeId" class="agenda-control" aria-label="Empleado">
        <option value="">Todos</option>
        <option v-for="employee in employees" :key="employee.employeeId" :value="employee.employeeId">
          {{ employee.name }}
        </option>
      </select>
    </div>

    <div class="filter-field">
      <span>Servicio</span>
      <select v-model="local.serviceId" class="agenda-control" aria-label="Servicio">
        <option value="">Todos</option>
        <option v-for="service in services" :key="service.serviceId || service.id" :value="service.serviceId || service.id">
          {{ service.name }}
        </option>
      </select>
    </div>

    <div class="filter-field">
      <span>Estado</span>
      <select v-model="local.status" class="agenda-control" aria-label="Estado">
        <option value="">Todos</option>
        <option value="PENDING">Pendiente</option>
        <option value="CONFIRMED">Confirmada</option>
        <option value="CANCELLED">Cancelada</option>
        <option value="COMPLETED">Completada</option>
        <option value="NO_SHOW">No asistio</option>
      </select>
    </div>

    <div class="filter-field">
      <span>Origen</span>
      <select v-model="local.origin" class="agenda-control" aria-label="Origen">
        <option value="">Todos</option>
        <option value="PUBLIC">Publica</option>
        <option value="PRIVATE">Negocio</option>
        <option value="ADMIN">Admin</option>
      </select>
    </div>

    <button class="filter-button" type="button" @click="$emit('apply', local)">Filtrar</button>
  </section>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  filters: { type: Object, required: true },
  employees: { type: Array, default: () => [] },
  services: { type: Array, default: () => [] },
})

defineEmits(['apply'])

const local = reactive({ ...props.filters })
watch(() => props.filters, (filters) => Object.assign(local, filters), { deep: true })
</script>

<style scoped>
.agenda-filters {
  align-items: end;
  background: rgba(16, 37, 44, 0.72);
  border: 1px solid rgba(63, 225, 255, 0.12);
  border-radius: 8px;
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(140px, 170px)) repeat(4, minmax(135px, 1fr)) auto;
  margin-bottom: 18px;
  padding: 14px;
}
.filter-field { display: grid; gap: 6px; min-width: 0; }
.filter-field span {
  color: rgba(213, 240, 247, 0.72);
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
}
.agenda-control {
  appearance: none;
  background: #0d1a20;
  border: 1px solid rgba(213, 240, 247, 0.14);
  border-radius: 7px;
  color: #fff;
  font-size: 0.88rem;
  height: 40px;
  min-width: 0;
  padding: 0 34px 0 12px;
  width: 100%;
}
select.agenda-control {
  background-image: linear-gradient(45deg, transparent 50%, rgba(213, 240, 247, 0.7) 50%), linear-gradient(135deg, rgba(213, 240, 247, 0.7) 50%, transparent 50%);
  background-position: calc(100% - 17px) 17px, calc(100% - 12px) 17px;
  background-repeat: no-repeat;
  background-size: 5px 5px, 5px 5px;
}
.agenda-control:focus { border-color: var(--neon); outline: none; }
.agenda-control option { background: var(--color-surface); }
.filter-button {
  background: var(--neon);
  border: 0;
  border-radius: 7px;
  color: var(--color-bg);
  font-weight: 800;
  height: 40px;
  padding: 0 18px;
}
@media (max-width: 1280px) { .agenda-filters { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (max-width: 820px) { .agenda-filters { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 560px) { .agenda-filters { grid-template-columns: 1fr; } }
</style>
