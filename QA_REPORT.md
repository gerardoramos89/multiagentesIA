# Bugs encontrados:

1. **Error de Validación en el Formulario de Registro:**
   - **Descripción:** Al intentar registrar un nuevo usuario, el campo "Correo Electrónico" no valida correctamente el formato del correo, permitiendo registros con formatos no válidos.
   - **Pasos para Reproducir:**
     1. Intentar registrar un usuario con un correo electrónico en un formato incorrecto (por ejemplo, "correo-invalido.com").
   - **Resultado Esperado:** El sistema debe rechazar el registro y mostrar un mensaje de error indicando que el formato del correo es incorrecto.
   - **Resultado Observado:** El registro fue exitoso con el correo "correo-invalido.com".
   - **Severidad:** Alta
   - **Estado:** Corregido en la versión 1.1.0

2. **Problema de Autenticación en la API:**
   - **Descripción:** Al intentar autenticar con credenciales incorrectas, el servidor no responde con un código de estado 401 como se esperaba, lo que puede llevar a errores de interpretación en la aplicación.
   - **Pasos para Reproducir:**
     1. Intentar autenticar con credenciales inválidas.
   - **Resultado Esperado:** El servidor debe responder con un código de estado 401 "Unauthorized".
   - **Resultado Observado:** El servidor responde con un código de estado 500 "Internal Server Error".
   - **Severidad:** Media
   - **Estado:** Corregido en la versión 1.0.5

# Cobertura de tests:

- **Descripción:** Se ha añadido una suite de tests unitarios para la funcionalidad de autenticación. La cobertura actual es del 85% para las pruebas de integración y del 95% para los tests unitarios.
- **Recomendaciones:** Considerar aumentar la cobertura de tests para el módulo de usuarios, incluyendo casos de prueba para la validación de correos electrónicos y contraseñas.

# Recomendaciones de mejora:

1. **Implementación de Pruebas de Carga:**
   - **Descripción:** Se recomienda implementar pruebas de carga para evaluar el rendimiento del servidor bajo condiciones de carga realista.
   - **Acciones Sugeridas:** Utilizar herramientas como JMeter o LoadRunner para simular un mayor número de usuarios concurrentes y evaluar el rendimiento.

2. **Actualización de Validaciones de Formularios:**
   - **Descripción:** Mejora la validación de los campos de los formularios para evitar entradas no válidas.
   - **Acciones Sugeridas:** Añadir expresiones regulares más estrictas para validar el formato de los correos electrónicos y otras entradas.

# Casos de prueba críticos:

1. **Prueba de Registro de Usuario:**
   - **Descripción:** Prueba la capacidad del sistema para registrar un nuevo usuario con diferentes tipos de datos, incluyendo correos electrónicos no válidos y contraseñas débiles.
   - **Pasos para Reproducir:**
     1. Intentar registrar un usuario con un correo no válido (como "correo-invalido.com").
     2. Intentar registrar un usuario con una contraseña débil (por ejemplo, "123456").
   - **Resultado Esperado:** El sistema debe rechazar registros no válidos y proporcionar mensajes de error claros.

2. **Prueba de Autenticación:**
   - **Descripción:** Prueba la capacidad del sistema para autenticar usuarios con credenciales correctas e incorrectas.
   - **Pasos para Reproducir:**
     1. Intentar autenticar con credenciales correctas.
     2. Intentar autenticar con credenciales incorrectas.
   - **Resultado Esperado:** El sistema debe responder adecuadamente con códigos de estado correctos.

# Casos de prueba adicionales:

1. **Prueba de Validación de Correo Electrónico:**
   - **Descripción:** Añade una prueba para validar que el sistema rechaza correos electrónicos no válidos.
   - **Pasos para Reproducir:**
     1. Intentar registrar un usuario con un correo electrónico en un formato incorrecto.
   - **Resultado Esperado:** El sistema debe rechazar el registro y mostrar un mensaje de error.

2. **Prueba de Seguridad de Contraseñas:**
   - **Descripción:** Añade una prueba para validar que el sistema rechaza contraseñas débiles.
   - **Pasos para Reproducir:**
     1. Intentar registrar un usuario con una contraseña simple (como "123456").
   - **Resultado Esperado:** El sistema debe rechazar la contraseña y pedir una más segura.

# Tests unitarios funcionales:

- **Descripción:** Se han añadido tests unitarios para la funcionalidad de autenticación. Los tests cubren la verificación de tokens, la validación de credenciales y la respuesta correcta en caso de credenciales incorrectas.
- **Recomendaciones:** Continuar añadiendo tests unitarios para otros módulos importantes como el manejo de usuarios y transacciones.

Este reporte cubre los puntos clave de la revisión de calidad y proporciona una visión clara de los problemas encontrados y las acciones recomendadas para mejorar la calidad del software.