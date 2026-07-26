# auth/ — Modulo de autenticacion

Vista unica de autenticacion con animacion slide entre login y registro.

## Archivos

| Archivo        | Descripcion                                                          |
|----------------|----------------------------------------------------------------------|
| `AuthView.vue` | Contenedor principal: alterna LoginForm/RegisterForm con animacion slide |

## AuthView.vue

Punto unico de entrada para `/login` y `/register`.

- Usa `<Transition :name="direccion" mode="out-in">` para alternar entre formularios
- `watch(route.name)` sincroniza el estado con la URL
- `router.push()` actualiza la URL al cambiar de formulario
- Direcciones: `slide-left` (login → register), `slide-right` (register → login)

## Flujo de navegacion

```
/login  → AuthView → LoginForm    → click "Registrarme" → slide-left
/register → AuthView → RegisterForm → click "Iniciar sesion" → slide-right
```

Ambas rutas apuntan a la **misma referencia** de AuthView para que Vue Router reutilice la instancia.
