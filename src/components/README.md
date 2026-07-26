# components/ — Componentes reutilizables

Componentes organizados por dominio funcional. Cada subdirectorio agrupa componentes relacionados.

## Subdirectorios

- `auth/` — Componentes del modulo de autenticacion (login, register, OAuth, barras animadas)

## Convenciones

- Cada componente usa `<script setup>` (Composition API)
- Los componentes emiten eventos con `defineEmits()` para comunicarse con el padre
- Los estilos especificos usan `<style scoped>`
- Los colores siempre en HEX, nunca en nombres CSS ni `rgb()`
