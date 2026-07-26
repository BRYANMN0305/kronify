# models/ — Modelos de datos

Clases e interfaces que representan las entidades del dominio.

## Ejemplo de uso

```js
// models/User.js
export class User {
  constructor({ id, name, email, profileType }) {
    this.id = id
    this.name = name
    this.email = email
    this.profileType = profileType
  }

  get isClient() {
    return this.profileType === 'CLIENT'
  }

  get isBusiness() {
    return this.profileType === 'BUSINESS'
  }
}
```

## Convenciones

- Un archivo por modelo
- Exportar clases con `export class`
- Incluir getters computados para propiedades derivadas
- No importar dependencias de Vue ni de frameworks
