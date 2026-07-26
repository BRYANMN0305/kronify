# styles/ — Hojas de estilo

## Archivos

- `variables.css` — Paleta de colores global (Acero Petróleo)
- `auth.css` — Estilos del módulo de autenticación (login, register, OAuth, animaciones)

## Paleta: Acero Petróleo

| Token     | Valor     | Uso                    |
|-----------|-----------|------------------------|
| acero-1   | `#081013` | Fondo principal        |
| acero-2   | `#10252C` | Superficies            |
| acero-3   | `#1E3D49` | Bordes / surface-alt   |
| acero-4   | `#3F6A78` | Primario / interactivos|
| acero-5   | `#D5F0F7` | Texto / highlights     |

## CSS Variables

Definidas en `:root` dentro de `variables.css`:

| Variable                | Valor         | Uso                          |
|-------------------------|---------------|------------------------------|
| `--color-bg`            | `var(--acero-1)` | Fondo principal           |
| `--color-surface`       | `var(--acero-2)` | Superficies / tarjetas    |
| `--color-surface-alt`   | `var(--acero-3)` | Superficie alternativa    |
| `--color-border`        | `var(--acero-3)` | Bordes por defecto        |
| `--color-border-hover`  | `var(--acero-4)` | Bordes al hover           |
| `--color-border-focus`  | `var(--acero-4)` | Bordes al enfocar         |
| `--color-primary`       | `var(--acero-4)` | Color primario            |
| `--color-primary-hover` | `var(--acero-5)` | Hover del primario        |
| `--color-text`          | `var(--acero-5)` | Texto principal           |
| `--color-text-muted`    | `var(--acero-4)` | Texto secundario          |
| `--color-text-dim`      | `var(--acero-3)` | Texto tenue / placeholder |
| `--color-error`         | `#ff6b6b`        | Errores de validación     |
