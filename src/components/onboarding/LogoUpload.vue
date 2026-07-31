<template>
  <div class="logo-upload">
    <label for="bizLogo" class="form-label">Logo del negocio</label>
    <div
      class="logo-dropzone"
      :class="{ 'has-preview': previewUrl }"
      @click="triggerFileInput"
      @dragover.prevent="dragOver = true"
      @dragleave.prevent="dragOver = false"
      @drop.prevent="handleDrop"
    >
      <input
        ref="fileInput"
        id="bizLogo"
        type="file"
        accept="image/*"
        class="d-none"
        @change="handleFileSelect"
      />
      <template v-if="previewUrl">
        <img :src="previewUrl" alt="Logo preview" class="logo-preview" />
        <button type="button" class="logo-remove" @click.stop="removeLogo">&times;</button>
      </template>
      <template v-else>
        <div class="logo-placeholder">
          <span class="logo-placeholder-icon" v-html="imageIcon"></span>
          <span>Haz clic o arrastra una imagen aquí</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'
import imageIcon from '@/assets/images/icons/image.svg?raw'

const props = defineProps({
  modelValue: { type: [File, String], default: null },
})
const emit = defineEmits(['update:modelValue'])

const fileInput = ref(null)
const dragOver = ref(false)
const previewUrl = ref(null)

watch(
  () => props.modelValue,
  (val) => {
    revokePreview()
    previewUrl.value = val instanceof File ? URL.createObjectURL(val) : val
  },
  { immediate: true }
)

onUnmounted(() => revokePreview())

function revokePreview() {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = null
  }
}

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileSelect(e) {
  const file = e.target.files?.[0]
  if (file) processFile(file)
}

function handleDrop(e) {
  dragOver.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) processFile(file)
}

function processFile(file) {
  if (!file.type.startsWith('image/')) return
  emit('update:modelValue', file)
}

function removeLogo() {
  emit('update:modelValue', null)
  if (fileInput.value) fileInput.value.value = ''
}
</script>

<style scoped>
.logo-upload {
  max-width: 280px;
}

.logo-dropzone {
  position: relative;
  width: 140px;
  height: 140px;
  border: 1px dashed rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.2s, background 0.2s;
}

.logo-dropzone:hover {
  border-color: var(--neon-dim);
  background: rgba(255, 255, 255, 0.03);
}

.logo-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text-muted);
  text-align: center;
  padding: 1rem;
}

.logo-placeholder .logo-placeholder-icon {
  display: inline-flex;
}

.logo-placeholder svg {
  width: 28px;
  height: 28px;
  opacity: 0.5;
}

.logo-placeholder span {
  font-size: 0.7rem;
  line-height: 1.3;
}

.logo-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.logo-remove {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 1rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
}

.logo-dropzone:hover .logo-remove {
  opacity: 1;
}
</style>
