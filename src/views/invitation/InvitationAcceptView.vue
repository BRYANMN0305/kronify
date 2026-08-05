<!-- ============================================================
     InvitationAcceptView.vue — Aceptar invitación de empleado
     ============================================================
     /invitacion/aceptar?token=XXX
       - Sin sesión: guarda el token y ofrece crear cuenta o iniciar
         sesión (al completar, useAuth retoma la aceptación).
       - Con sesión: llama POST /business/invitations/accept y
         muestra el resultado.
     ============================================================ -->

<template>
  <AuthLayout>
    <div v-if="!token" class="invite-accept">
      <h1 class="auth-title">Enlace inválido</h1>
      <p class="auth-subtitle">El enlace de invitación está incompleto o ya no es válido.</p>
      <div class="auth-error mt-3">No se encontró el token de invitación en la URL.</div>
      <a href="/" class="btn btn-primary w-100 mt-3">Ir al inicio</a>
    </div>

    <div v-else-if="!isAuthenticated" class="invite-accept">
      <h1 class="auth-title">Te invitaron a un equipo</h1>
      <p class="auth-subtitle">Para aceptar la invitación, crea una cuenta o inicia sesión con el correo al que llegó la invitación.</p>

      <button type="button" class="btn btn-primary w-100" @click="goToRegister">
        Crear mi cuenta
      </button>
      <button type="button" class="btn btn-ghost-inline w-100 mt-2" @click="goToLogin">
        Ya tengo una cuenta — Iniciar sesión
      </button>
    </div>

    <div v-else class="invite-accept">
      <template v-if="processing">
        <h1 class="auth-title">Aceptando invitación…</h1>
        <div class="d-flex justify-content-center mt-4">
          <span class="spinner-border text-info" role="status"></span>
        </div>
      </template>

      <template v-else-if="resultOk">
        <h1 class="auth-title">¡Invitación aceptada!</h1>
        <p class="auth-subtitle">Ya formas parte del equipo. Puedes gestionar tu horario desde la sección Horarios.</p>
        <button type="button" class="btn btn-primary w-100 mt-3" @click="router.push('/horarios')">
          Ir a mis horarios
        </button>
        <button type="button" class="btn btn-ghost-inline w-100 mt-2" @click="router.push('/calendario')">
          Ir al calendario
        </button>
      </template>

      <template v-else>
        <h1 class="auth-title">No se pudo aceptar</h1>
        <p class="auth-subtitle">{{ resultMessage }}</p>
        <div class="auth-error mt-3">{{ resultError }}</div>
        <button type="button" class="btn btn-primary w-100 mt-3" @click="router.push('/horarios')">
          Ir a Horarios
        </button>
      </template>
    </div>
  </AuthLayout>
</template>

<script setup>
/**
 * InvitationAcceptView.vue
 * Consume el token del correo y acepta la invitación contra el backend.
 */
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { invitationService } from '@/api/invitation'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const token = computed(() => String(route.query.token || '').trim())
const isAuthenticated = computed(() => authStore.isAuthenticated)

const processing = ref(false)
const resultOk = ref(false)
const resultMessage = ref('')
const resultError = ref('')

const goToRegister = () => {
  sessionStorage.setItem('inviteToken', token.value)
  router.push({ name: 'Registro' })
}

const goToLogin = () => {
  sessionStorage.setItem('inviteToken', token.value)
  router.push({ name: 'IniciarSesion' })
}

onMounted(async () => {
  if (!token.value || !isAuthenticated.value) return

  processing.value = true
  try {
    await invitationService.accept(token.value)
    resultOk.value = true
  } catch (e) {
    const msg = e.message || 'Ocurrió un error al aceptar la invitación'
    // Casos donde ya está vinculado: se trata como éxito informativo
    resultOk.value = /ya (eres|forma parte)|ya fue procesada|procesada/i.test(msg)
    resultMessage.value = resultOk.value
      ? 'Tu cuenta ya está vinculada a este equipo.'
      : 'La invitación no pudo ser procesada.'
    resultError.value = msg
  } finally {
    processing.value = false
  }
})
</script>

<style scoped>
.btn-ghost-inline {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.7);
  padding: 0.7rem;
  font-weight: 600;
  font-size: 0.85rem;
  transition: color 0.2s, border-color 0.2s;
}

.btn-ghost-inline:hover {
  color: #fff;
  border-color: rgba(255, 255, 255, 0.35);
}
</style>