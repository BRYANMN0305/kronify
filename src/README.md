# src/ — Codigo fuente de Kronify

Punto de entrada: `main.js` inicializa Vue 3, Pinia, Vue Router, Bootstrap 5 y los estilos del tema oscuro.

## Estructura

| Directorio       | Descripcion                                            |
|------------------|--------------------------------------------------------|
| `api/`           | Cliente HTTP y endpoints del backend REST              |
| `assets/`        | Estilos CSS (tema oscuro) e imagenes estaticas         |
| `components/`    | Componentes reutilizables, organizados por dominio     |
| `composables/`   | Composables Vue con logica reactiva compartida         |
| `domain/`        | Modelos de datos, enums y tipos del dominio            |
| `layouts/`       | Layouts de pagina (AuthLayout, etc.)                   |
| `router/`        | Configuracion de Vue Router y guardias                 |
| `stores/`        | Stores de Pinia para estado global                     |
| `views/`         | Vistas/paginas de la aplicacion                         |

## Convenciones

- Todos los textos visibles en pantalla en **espanol**
- Colores definidos en **HEX** via CSS variables (`:root` en `auth.css`)
- Archivos `.vue` en PascalCase, archivos `.js` en camelCase
- Cada componente tiene commentario JSDoc al inicio del `<script setup>`
