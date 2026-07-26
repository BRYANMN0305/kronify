<!-- ============================================================
     ProfileTypeSelector.vue — Selector de tipo de perfil
     ============================================================
     Dos opciones estilo tarjeta con radio button: CLIENT y BUSINESS.
     ============================================================ -->

<template>
  <div>
    <label class="form-label">Tipo de perfil</label>
    <div class="d-flex gap-2">
      <label
        class="profile-option"
        :class="{ active: modelValue === 'CLIENT' }"
        @click="seleccionar('CLIENT')"
      >
        <span class="profile-radio"></span>
        <span class="profile-label">Cliente</span>
      </label>
      <label
        class="profile-option"
        :class="{ active: modelValue === 'BUSINESS' }"
        @click="seleccionar('BUSINESS')"
      >
        <span class="profile-radio"></span>
        <span class="profile-label">Negocio</span>
      </label>
    </div>
  </div>
</template>

<script setup>
/**
 * ProfileTypeSelector.vue
 * Selector de tipo de perfil con estilo de tarjeta.
 * @model {string} modelValue - 'CLIENT' | 'BUSINESS'
 */
const props = defineProps({
  modelValue: { type: String, default: 'CLIENT' },
})

const emit = defineEmits(['update:modelValue'])

function seleccionar(valor) {
  emit('update:modelValue', props.modelValue === valor ? '' : valor)
}
</script>

<style scoped>
.profile-option {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.profile-option:hover {
  border-color: var(--color-border-hover);
  background: var(--color-surface-alt);
}

.profile-option.active {
  border-color: var(--color-primary);
  background: rgba(var(--color-primary-rgb), 0.08);
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
}

.profile-radio {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid var(--color-text-dim);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: border-color 0.2s;
}

.profile-option.active .profile-radio {
  border-color: var(--color-primary);
}

.profile-option.active .profile-radio::after {
  content: '';
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--color-primary);
}

.profile-label {
  color: var(--color-text-placeholder);
  font-size: 0.875rem;
  font-weight: 500;
}

.profile-option.active .profile-label {
  color: var(--color-text);
}
</style>
