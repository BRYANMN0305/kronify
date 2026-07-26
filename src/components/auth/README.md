# auth/ — Componentes de autenticacion

Componentes que forman el formulario de login y registro, renderizados dentro de `AuthView.vue` con animacion slide.

## Archivos

| Archivo                  | Descripcion                                           |
|--------------------------|-------------------------------------------------------|
| `LoginForm.vue`          | Formulario de inicio de sesion (email + password)     |
| `RegisterForm.vue`       | Formulario de registro (nombre, telefono, email, password, tipo perfil) |
| `OAuthButtons.vue`       | Botones de autenticacion con Google y Microsoft        |
| `ProfileTypeSelector.vue`| Selector Cliente/Negocio con estilo de tarjeta radio   |
| `AnimatedBars.vue`       | Taglines rotativos + 3 barritas indicadoras decorativas |

## Flujo

```
AuthView.vue
├── LoginForm.vue        (v-if !showRegister)
│   └── emite @switch → irARegister()
└── RegisterForm.vue     (v-else)
    └── emite @switch → irALogin()
```

- `LoginForm` y `RegisterForm` usan `useAuth()` para login/registro via API
- `OAuthButtons` emite `@oauth` con el nombre del proveedor
- `ProfileTypeSelector` usa `v-model` para alternar CLIENT/BUSINESS
