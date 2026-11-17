<!-- ============================================================
     OAuthButtons.vue — Botones de autenticación con terceros
     ============================================================
     Proveedores disponibles: Google y Microsoft.
     Emite el evento "oauth" con el nombre del proveedor
     cuando el usuario hace clic en uno de los botones.
     ============================================================ -->

<template>
  <div class="d-flex flex-column gap-2">

    <!-- Botón: iniciar sesión con Google -->
    <button
        class="btn btn-outline-light d-flex align-items-center justify-content-center gap-2"
        :disabled="disabled"
        @click="$emit('oauth', 'google')"
    >
      <img :src="google" alt="Google" width="18" height="18"/>
      Continuar con Google
    </button>

    <!-- Botón: iniciar sesión con Microsoft -->
    <button
        class="btn btn-outline-light d-flex align-items-center justify-content-center gap-2"
        :disabled="disabled"
        @click="$emit('oauth', 'microsoft')"
    >
      <img :src="microsoft" alt="Microsoft" width="18" height="18"/>
      Continuar con Microsoft
    </button>

  </div>
</template>

<script setup>
/**
 * OAuthButtons.vue
 *
 * Botones para autenticación mediante proveedores externos (OAuth).
 *
 * @component OAuthButtons
 * @prop {boolean} disabled - Deshabilita ambos botones (p. ej. mientras se redirige)
 * @emits {string} oauth - Nombre del proveedor seleccionado ("google" | "microsoft")
 */
import google from '@/assets/images/auth/google.svg'
import microsoft from '@/assets/images/auth/microsoft.svg'

defineProps({
  disabled: { type: Boolean, default: false },
})

defineEmits(['oauth'])
</script>
