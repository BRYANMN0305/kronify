<script setup>
import arrow from "@/assets/images/auth/arrow.svg";
</script>
<template>
  <div class="back-to-website">
    <button
        class="btn-back"
        @click="$emit('back', 'back-to-website')">
      <img :src="arrow" alt="back to main website" width="18" height="18"/>
    </button>
  </div>
</template>

<style scoped>
.back-to-website {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.btn-back {
  background: var(--acero-3);
  border: 1px solid var(--color-border-hover);
  border-radius: 8px;
  color: var(--color-text);
  font-size: 0.8rem;
  padding: 0.3rem 0.3rem;
  cursor: pointer;
  transition: all 0.2s;
  opacity: 50%;
}
</style>