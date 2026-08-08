<script setup>
import arrow from "@/assets/images/auth/arrow.svg";

const MAIN_WEBSITE_URL = "https://kronify.page.gd/";
</script>
<template>
  <div class="back-to-website">
<a
        class="btn-back"
        :href="MAIN_WEBSITE_URL"
        aria-label="Volver al sitio principal">
      <img :src="arrow" alt="back to main website" width="18" height="18"/>
    </a>
  </div>
</template>

<style scoped>
.back-to-website {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  background: var(--acero-3);
  border: 1px solid var(--color-border-hover);
  border-radius: 8px;
  color: var(--color-text);
  font-size: 0.8rem;
  padding: 0.3rem 0.3rem;
  cursor: pointer;
  transition: all 0.2s;
  opacity: 50%;
  text-decoration: none;
}

.btn-back:hover {
  opacity: 100%;
}
</style>