<!-- ============================================================
     OAuthButtons.vue — Botones de autenticación con terceros
     ============================================================
     Proveedores: Google y Microsoft.
     Emite evento "oauth" con el nombre del proveedor.
     ============================================================ -->

<template>
  <div class="d-flex flex-column gap-2">
    <button
        class="btn btn-outline-light d-flex align-items-center justify-content-center gap-2"
        @click="$emit('oauth', 'google')"
    >
      <img :src="google" alt="Google" width="18" height="18"/>
      Continuar con Google
    </button>
    <button
        class="btn btn-outline-light d-flex align-items-center justify-content-center gap-2"
        @click="$emit('oauth', 'microsoft')"
    >
      <img :src="microsoft" alt="Microsoft" width="18" height="18"/>
      Continuar con Microsoft
    </button>
  </div>
</template>

<script setup>
import google from '@/assets/images/auth/google.svg'
import microsoft from '@/assets/images/auth/microsoft.svg'

/**
 * OAuthButtons.vue
 * Botones para iniciar sesión con Google o Microsoft.
 * @emits {string} oauth - Nombre del proveedor (google | microsoft)
 */
defineEmits(['oauth'])
</script>

<style scoped>
.btn-outline-light {
    border: 1px solid var(--color-border);
    border-radius: 10px;
    padding: 0.6rem;
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--color-text-label);
    background: var(--color-surface);
    transition: all 0.2s;
}

.btn-outline-light:hover {
    background: var(--color-surface-alt);
    border-color: var(--color-border-hover);
    color: var(--color-text);
    box-shadow: var(--shadow-sm);
}
</style>