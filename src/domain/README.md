# domain/ — Modelos del dominio

Define los modelos de datos, enums y tipos que representan las entidades del negocio.

## Subdirectorios

- `models/` — Modelos de datos (clases o interfaces)
- `enums/` — Enums y constantes del dominio

## Convenciones

- Los modelos se definen como clases con validaciones basicas
- Los enums usan `Object.freeze()` para inmutabilidad
- Este modulo NO depende de Vue ni de ningun framework
