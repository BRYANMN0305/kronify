<template>
  <form @submit.prevent="handleSubmit" novalidate class="onboarding-form">
    <OnboardingProgressBar :current="currentStep" :total="totalSteps" />

    <OnboardingStepHeader
      :current="currentStep"
      :total="totalSteps"
      :title="stepTitles[currentStep - 1]"
      :description="stepDescriptions[currentStep - 1]"
    />

    <Transition :name="transitionName" mode="out-in">
      <div :key="currentStep" class="step-content">
        <!-- Paso 1: Información básica -->
        <template v-if="currentStep === 1">
          <div class="mb-3">
            <label for="bizName" class="form-label">Nombre del negocio*</label>
            <input
              id="bizName"
              v-model="form.name"
              type="text"
              class="form-control"
              :class="{ 'is-invalid': errors.name }"
              placeholder="Ej: Barbería El Clásico"
              @input="autoSlug"
            />
            <div class="invalid-feedback">{{ errors.name }}</div>
          </div>

          <div class="mb-3">
            <label for="bizSlug" class="form-label">Slug (URL de tu negocio)*</label>
            <div class="slug-wrapper d-flex align-items-center rounded-2 overflow-hidden">
              <span class="slug-prefix text-nowrap user-select-none">kronifytech.vercel.app/</span>
              <input
                id="bizSlug"
                v-model="form.slug"
                type="text"
                class="form-control slug-input"
                :class="{ 'is-invalid': errors.slug }"
                placeholder="mi-barberia"
              />
            </div>
            <div class="field-error">{{ errors.slug }}</div>
          </div>

          <div class="mb-3">
            <CategoryDropdown v-model="form.category" :invalid="!!errors.category" />
            <div class="invalid-feedback">{{ errors.category }}</div>
          </div>
        </template>

        <!-- Paso 2: Contacto -->
        <template v-else-if="currentStep === 2">
          <div class="mb-3">
            <label for="bizEmail" class="form-label">Email*</label>
            <input
              id="bizEmail"
              v-model="form.email"
              type="email"
              class="form-control"
              :class="{ 'is-invalid': errors.email }"
              placeholder="contacto@negocio.com"
            />
            <div class="invalid-feedback">{{ errors.email }}</div>
          </div>

          <div class="mb-3">
            <label for="bizPhone" class="form-label">Teléfono*</label>
            <input
              id="bizPhone"
              v-model="form.phoneNumber"
              type="tel"
              class="form-control"
              :class="{ 'is-invalid': errors.phoneNumber }"
              placeholder="+57 3006217237"
            />
            <div class="invalid-feedback">{{ errors.phoneNumber }}</div>
          </div>

          <div class="mb-3">
            <label for="bizWhatsApp" class="form-label">WhatsApp*</label>
            <input
              id="bizWhatsApp"
              v-model="form.whatsApp"
              type="tel"
              class="form-control"
              :class="{ 'is-invalid': errors.whatsApp }"
              placeholder="+57 3006217237"
            />
            <div class="invalid-feedback">{{ errors.whatsApp }}</div>
          </div>

          <div class="mb-3">
            <label for="bizAddress" class="form-label">Dirección</label>
            <input
              id="bizAddress"
              v-model="form.address"
              type="text"
              class="form-control"
              placeholder="Calle 123 #45-67"
            />
          </div>
        </template>

        <!-- Paso 3: Personalización -->
        <template v-else-if="currentStep === 3">
          <div class="mb-3">
            <LogoUpload v-model="form.logoUrl" />
          </div>

          <div class="mb-3">
            <label for="bizDescription" class="form-label">Descripción</label>
            <textarea
              id="bizDescription"
              v-model="form.description"
              class="form-control"
              placeholder="Describe brevemente tu negocio..."
              rows="3"
            ></textarea>
          </div>
        </template>

        <!-- Paso 4: Activación -->
        <template v-else>
          <div class="mb-3">
            <label for="bizActivationCode" class="form-label">Código de activación</label>
            <input
              id="bizActivationCode"
              v-model="form.activationCode"
              type="text"
              class="form-control"
              placeholder="Ingresa tu código"
            />
            <p class="field-hint">Si tienes un código de activación, ingrésalo aquí para configurar tu plan automáticamente.</p>
          </div>
        </template>
      </div>
    </Transition>

    <div v-if="error" class="onboarding-error">{{ error }}</div>

    <div class="step-nav">
      <button
        v-if="currentStep > 1"
        type="button"
        class="btn-back-step"
        @click="prevStep"
      >
        &lsaquo; Atrás
      </button>
      <span v-else></span>
      <button
        v-if="currentStep < totalSteps"
        type="button"
        class="btn btn-primary"
        @click="nextStep"
      >
        Continuar &rsaquo;
      </button>
      <button
        v-else
        type="submit"
        class="btn btn-primary"
        :disabled="businessStore.loading"
      >
        <span v-if="businessStore.loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
        {{ businessStore.loading ? 'Creando...' : 'Crear negocio' }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useBusinessStore } from '@/stores/business'
import OnboardingProgressBar from '@/components/onboarding/OnboardingProgressBar.vue'
import OnboardingStepHeader from '@/components/onboarding/OnboardingStepHeader.vue'
import CategoryDropdown from '@/components/onboarding/CategoryDropdown.vue'
import LogoUpload from '@/components/onboarding/LogoUpload.vue'
import { businessService } from '@/api/business'

const router = useRouter()
const businessStore = useBusinessStore()

const totalSteps = 4
const currentStep = ref(1)
const direction = ref(1)

const transitionName = computed(() => direction.value === 1 ? 'slide-left' : 'slide-right')

const stepTitles = ['Información básica', 'Contacto', 'Personalización', 'Activación']
const stepDescriptions = [
  'Lo esencial para identificar tu negocio',
  'Formas en que los clientes podrán contactarte',
  'Añade tu marca personal',
  'Configura tu plan de servicio',
]

const form = reactive({
  name: '',
  slug: '',
  category: '',
  description: '',
  address: '',
  logoUrl: null,
  email: '',
  phoneNumber: '',
  whatsApp: '',
  activationCode: '',
})

const errors = reactive({
  name: '',
  slug: '',
  category: '',
  email: '',
  phoneNumber: '',
  whatsApp: '',
})

const error = ref('')

function generarSlug(texto) {
  return texto
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function autoSlug() {
  const auto = generarSlug(form.name)
  if (!form.slug || form.slug.startsWith(auto) || form.slug === generarSlug(form.name.slice(0, -1))) {
    form.slug = auto
  }
}

function clearErrors() {
  Object.keys(errors).forEach((k) => (errors[k] = ''))
}

function validateStep(step) {
  clearErrors()
  let valido = true

  if (step === 1) {
    if (!form.name.trim()) {
      errors.name = 'El nombre del negocio es obligatorio'
      valido = false
    }
    if (!form.slug.trim()) {
      errors.slug = 'El slug es obligatorio'
      valido = false
    } else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(form.slug)) {
      errors.slug = 'Usa minúsculas, números y guiones sin espacios'
      valido = false
    }
    if (!form.category.trim()) {
      errors.category = 'Selecciona o escribe una categoría'
      valido = false
    }
  }

  if (step === 2) {
    if (!form.email.trim()) {
      errors.email = 'El email es obligatorio'
      valido = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'Ingresa un email válido'
      valido = false
    }
    if (!form.phoneNumber.trim()) {
      errors.phoneNumber = 'El teléfono es obligatorio'
      valido = false
    }
    if (!form.whatsApp.trim()) {
      errors.whatsApp = 'El WhatsApp es obligatorio'
      valido = false
    }
  }

  return valido
}

function nextStep() {
  if (!validateStep(currentStep.value)) return
  direction.value = 1
  if (currentStep.value < totalSteps) currentStep.value++
}

function prevStep() {
  direction.value = -1
  if (currentStep.value > 1) currentStep.value--
}

function optionalText(value) {
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

async function handleSubmit() {
  if (!validateStep(currentStep.value)) return
  error.value = ''
  try {
    let logoUrl = form.logoUrl ? (form.logoUrl instanceof File ? null : form.logoUrl) : null

    if (form.logoUrl instanceof File) {
      const res = await businessService.uploadImage(form.logoUrl)
      logoUrl = res.url
    }

    await businessStore.createBusiness({
      name: form.name.trim(),
      slug: form.slug.trim(),
      category: form.category.trim(),
      description: optionalText(form.description),
      address: optionalText(form.address),
      logoUrl,
      email: form.email.trim(),
      phoneNumber: form.phoneNumber.trim(),
      whatsApp: form.whatsApp.trim(),
      activationCode: optionalText(form.activationCode),
    })
    router.push('/dashboard')
  } catch (e) {
    error.value = e.message || 'Error al crear el negocio'
  }
}
</script>

<style scoped>
.onboarding-form {
  max-width: 520px;
  margin: 0 auto;
}

.field-error {
  color: var(--color-error);
  font-size: 0.75rem;
  margin-top: 0.3rem;
}

.field-hint {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin: 0.5rem 0 0;
}

.onboarding-error {
  background: var(--color-error-bg);
  color: var(--color-error);
  border: 1px solid var(--color-error-border);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  font-size: 0.8rem;
  margin-bottom: 1rem;
}

.step-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  padding-top: 1rem;
}

.btn-back-step {
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  transition: color 0.2s, background 0.2s;
}

.btn-back-step:hover {
  color: var(--color-text-label);
  background: rgba(255, 255, 255, 0.05);
}

.slug-wrapper {
  background: var(--color-bg-dark);
  border: 1px solid var(--color-border);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.slug-wrapper:focus-within {
  border-color: var(--neon-dim);
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.18), 0 0 14px rgba(var(--color-primary-rgb), 0.25);
}

.slug-prefix {
  color: var(--color-text-dim);
  font-size: 0.875rem;
  padding: 0.7rem 0.6rem 0.7rem 0.9rem;
}

.slug-input {
  background: transparent !important;
  box-shadow: none !important;
  padding-left: 0.6rem;
  border: none !important;
}

.slug-input:focus {
  box-shadow: none !important;
  outline: none;
}

.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.25s ease;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
