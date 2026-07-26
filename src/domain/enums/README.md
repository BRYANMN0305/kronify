# enums/ — Enums y constantes

Enums y constantes que representan valores fijos del dominio.

## Ejemplo de uso

```js
// enums/ProfileType.js
export const ProfileType = Object.freeze({
  CLIENT: 'CLIENT',
  BUSINESS: 'BUSINESS',
})
```

## Convenciones

- Usar `Object.freeze()` para inmutabilidad
- Un archivo por enum o grupo de constantes relacionadas
- Nombres en UPPER_SNAKE_CASE para las claves
- Valores como strings legibles
