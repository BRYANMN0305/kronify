# layouts/ — Layouts de pagina

Layouts que estructuran la disposicion visual de las paginas.

## Archivos

| Archivo          | Descripcion                                                              |
|------------------|--------------------------------------------------------------------------|
| `AuthLayout.vue` | Layout de autenticacion: panel izquierdo (imagen + barras animadas) + panel derecho (formulario) |

## AuthLayout.vue

Layout de dos paneles para login/register:

- **Panel izquierdo (45%):** Imagen de fondo con degradado + `AnimatedBars` con taglines rotativos. Oculto en movil (`d-none d-lg-flex`).
- **Panel derecho (55%):** Contenedor centrado con `max-width: 400px` y scroll vertical automatico para formularios largos.

```vue
<AuthLayout>
  <LoginForm />
</AuthLayout>
```

## Convenciones

- Los layouts usan `<slot />` para inyectar contenido
- Los estilos del panel izquierdo estan en `auth.css`
- Los colores usan HEX, nunca nombres CSS
