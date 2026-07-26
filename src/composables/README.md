# composables/ — Logica reactiva compartida

Composables Vue 3 que encapsulan logica reutilizable entre componentes.

## Archivos

| Archivo     | Descripcion                                                         |
|-------------|---------------------------------------------------------------------|
| `useAuth.js`| Hook de autenticacion: login, register, loginWithOAuth, loading, error |

## useAuth()

```js
const { login, register, loginWithOAuth, loading, error } = useAuth()
```

- `login({ email, password })` — Inicia sesion, redirige a `/dashboard`
- `register({ name, lastName, phoneNumber, email, passwordHash, profileType })` — Registra usuario, redirige a `/dashboard`
- `loginWithOAuth(proveedor)` — Redirige al OAuth del backend (`/api/auth/google` o `/api/auth/microsoft`)
- `loading` — `ref<boolean>`, true mientras hay peticion en curso
- `error` — `ref<string|null>`, ultimo mensaje de error

## Dependencias

- `useRouter()` de Vue Router para redirigir post-login
- `useAuthStore()` de Pinia para guardar token y usuario
- `authService` de `api/auth.js` para las peticiones HTTP
