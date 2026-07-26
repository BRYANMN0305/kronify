<!-- ============================================================
     AuthView.vue — Punto único de autenticación con slide animado
     ============================================================
     Contiene LoginForm y RegisterForm dentro de AuthLayout.
     Alterna entre ellos con animación de deslizamiento lateral
     sin recargar la página. La URL se actualiza con router.push.
     ============================================================ -->

<template>
  <AuthLayout>
    <Transition :name="direccion" mode="out-in">
      <LoginForm
        v-if="!showRegister"
        key="login"
        @switch="irARegister"
      />
      <RegisterForm
        v-else
        key="register"
        @switch="irALogin"
      />
    </Transition>
  </AuthLayout>
</template>

<script setup>
/**
 * AuthView.vue
 * Vista única de autenticación. Alterna entre login y register
 * con animación slide left/right.
 * Escucha el cambio de ruta para mantener sincronizada la URL.
 */
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import LoginForm from '@/components/auth/LoginForm.vue'
import RegisterForm from '@/components/auth/RegisterForm.vue'

const route = useRoute()
const router = useRouter()

// Estado del formulario actual: true = register, false = login
const showRegister = ref(route.name === 'Register')

// Dirección del slide: 'slide-left' (login → register)
//                    'slide-right' (register → login)
const direccion = ref('slide-left')

// Escucha cambios en la ruta para sincronizar el estado
watch(
  () => route.name,
  (nuevoNombre) => {
    showRegister.value = nuevoNombre === 'Register'
  }
)

/** Cambia al formulario de registro con slide izquierda */
function irARegister() {
  direccion.value = 'slide-left'
  showRegister.value = true
  router.push({ name: 'Register' })
}

/** Cambia al formulario de login con slide derecha */
function irALogin() {
  direccion.value = 'slide-right'
  showRegister.value = false
  router.push({ name: 'Login' })
}
</script>

<style scoped>
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
    transition: transform 0.35s ease, opacity 0.35s ease;
}

.slide-left-enter-from {
    transform: translateX(30px);
    opacity: 0;
}
.slide-left-leave-to {
    transform: translateX(-30px);
    opacity: 0;
}

.slide-right-enter-from {
    transform: translateX(-30px);
    opacity: 0;
}
.slide-right-leave-to {
    transform: translateX(30px);
    opacity: 0;
}
</style>
