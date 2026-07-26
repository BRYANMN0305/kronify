# stores/ — Estado global (Pinia)

Stores de Pinia que manejan el estado global de la aplicacion.

## Archivos

| Archivo    | Descripcion                                    |
|------------|------------------------------------------------|
| `auth.js`  | Estado de autenticacion: token JWT y datos del usuario |

## auth.js — Store de autenticacion

### State

| Propiedad  | Tipo             | Descripcion                        |
|------------|------------------|------------------------------------|
| `token`    | `string\|null`   | JWT del usuario                    |
| `user`     | `object\|null`   | Datos del usuario autenticado      |

### Getters

| Getter          | Tipo      | Descripcion                        |
|-----------------|-----------|------------------------------------|
| `isAuthenticated` | `boolean` | `true` si hay token valido       |

### Actions

| Action                       | Descripcion                              |
|------------------------------|------------------------------------------|
| `setAuth({ token, user })`   | Guarda token y usuario en state + localStorage |
| `logout()`                   | Elimina sesion del state y localStorage  |

### Persistencia

El store se inicializa desde `localStorage` al cargar la app, manteniendo la sesion entre recargas de pagina.
