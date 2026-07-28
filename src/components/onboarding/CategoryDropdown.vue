<template>
  <div class="category-dropdown" ref="categoryRef">
    <label for="bizCategory" class="form-label">Categoría</label>
    <div
      class="category-trigger"
      :class="{ 'is-invalid': invalid, 'is-open': open }"
      @click="toggle"
    >
      <input
        id="bizCategory"
        :value="modelValue"
        type="text"
        class="category-input"
        placeholder="Ej: Barbería, Spa, Entrenador personal"
        @focus="open = true"
        @input="onInput"
      />
      <svg class="category-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </div>
    <div v-if="open" ref="panelRef" class="category-panel" :class="{ 'panel-above': panelAbove }">
      <button
        v-for="cat in filtered"
        :key="cat"
        type="button"
        class="category-option"
        :class="{ 'is-selected': modelValue === cat }"
        @click="select(cat)"
      >
        {{ cat }}
      </button>
      <div v-if="filtered.length === 0" class="category-empty">
        Presiona Enter para usar "{{ modelValue }}"
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  invalid: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])

const open = ref(false)
const panelAbove = ref(false)
const categoryRef = ref(null)
const panelRef = ref(null)

const categories = [
  'Salud y Bienestar',
  'Belleza y Estética',
  'Consultoría y Coaching',
  'Educación y Cursos',
  'Servicios Profesionales',
  'Hogar y Mantenimiento',
  'Tecnología y Soporte',
  'Eventos y Fotografía',
  'Fitness y Deporte',
  'Alimentación y Nutrición',
  'Otro',
]

const filtered = computed(() => {
  const q = props.modelValue.trim().toLowerCase()
  if (!q) return categories
  return categories.filter((c) => c.toLowerCase().includes(q))
})

function toggle() {
  open.value = !open.value
}

function onInput(e) {
  emit('update:modelValue', e.target.value)
  open.value = true
}

function select(cat) {
  emit('update:modelValue', cat)
  open.value = false
}

function onClickOutside(e) {
  if (categoryRef.value && !categoryRef.value.contains(e.target)) {
    open.value = false
  }
}

function positionPanel() {
  nextTick(() => {
    if (!categoryRef.value || !panelRef.value) return
    const triggerRect = categoryRef.value.getBoundingClientRect()
    const panelHeight = panelRef.value.scrollHeight
    const gap = 4
    const spaceBelow = window.innerHeight - triggerRect.bottom
    panelAbove.value = panelHeight + gap > spaceBelow
  })
}

watch(open, (val) => {
  if (val) positionPanel()
})

onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))
</script>

<style scoped>
.category-dropdown {
  position: relative;
}

.category-trigger {
  display: flex;
  align-items: center;
  background: #1a2632;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.category-trigger:hover {
  border-color: var(--color-border-hover);
}

.category-trigger:focus-within,
.category-trigger.is-open {
  border-color: var(--neon-dim);
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.18), 0 0 14px rgba(var(--color-primary-rgb), 0.25);
}

.category-trigger.is-invalid {
  border-color: var(--color-error);
  background: var(--color-surface-alt);
}

.category-input {
  flex: 1;
  background: transparent !important;
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  color: var(--color-text);
  font-size: 0.875rem;
  padding: 0.7rem 0.5rem 0.7rem 0.9rem;
}

.category-input::placeholder {
  color: rgba(255, 255, 255, 0.35);
}

.category-chevron {
  color: var(--color-text-muted);
  margin-right: 0.7rem;
  transition: transform 0.2s;
  flex-shrink: 0;
}

.category-trigger.is-open .category-chevron {
  transform: rotate(180deg);
}

.category-panel {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: #1a2632;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  max-height: 220px;
  overflow-y: auto;
  z-index: 20;
  padding: 0.25rem;
}

.category-panel.panel-above {
  top: auto;
  bottom: calc(100% + 4px);
}

.category-panel::-webkit-scrollbar {
  width: 4px;
}

.category-panel::-webkit-scrollbar-track {
  background: transparent;
}

.category-panel::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.category-option {
  display: block;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  color: var(--color-text);
  font-size: 0.825rem;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
}

.category-option:hover {
  background: rgba(var(--color-primary-rgb), 0.15);
}

.category-option.is-selected {
  background: rgba(var(--color-primary-rgb), 0.2);
  color: var(--neon);
}

.category-empty {
  padding: 0.75rem;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 0.75rem;
}
</style>
