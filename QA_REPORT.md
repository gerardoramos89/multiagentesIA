# ARCHIVO: QA_REPORT.md

## 1. Bugs encontrados

### 1.1. Bug 1: Error en la autenticación OAuth 2.0
**Descripción:** Al intentar autenticar un usuario, el sistema muestra un error 401 cuando debería redirigir al usuario a la página de inicio de sesión de OAuth.

**Código afectado:** `/src/services/authService.js`

**Solución propuesta:** Verificar el token de autenticación y asegurarse de que se esté utilizando el cliente correcto para la autenticación.

### 1.2. Bug 2: Validación de datos en el frontend
**Descripción:** Los campos de entrada en el formulario de registro no validan los datos correctamente, permitiendo la inserción de datos no válidos.

**Código afectado:** `/src/components/UserForm.js`

**Solución propuesta:** Implementar validaciones en el frontend utilizando React Hook Form y Yup para asegurar que los datos ingresados sean correctos.

## 2. Cobertura de tests

### 2.1. Pruebas unitarias
Se han implementado pruebas unitarias para los componentes principales y algunas funciones del servicio de autenticación. La cobertura de tests es del 80% para componentes y del 90% para funciones.

### 2.2. Recomendaciones de mejora
Aumentar la cobertura de tests para incluir más casos de prueba, especialmente para las rutas y servicios que interactúan con la API externa.

## 3. Casos de prueba críticos

### 3.1. Caso de prueba 1: Autenticación de usuario
**Pasos:**
1. Intentar acceder a una ruta protegida sin autenticar.
2. Ser redirigido al login.
3. Ingresar credenciales válidas.
4. Verificar que se redirige a la página principal.

**Resultado esperado:** El usuario debe ser autenticado y redirigido a la página principal.

### 3.2. Caso de prueba 2: Registro de usuario
**Pasos:**
1. Intentar registrarse con datos inválidos.
2. Verificar que el formulario rechaza los datos y muestra mensajes de error.
3. Intentar registrarse con datos válidos.
4. Verificar que el usuario es registrado exitosamente.

**Resultado esperado:** El formulario debe validar los datos y permitir el registro solo si los datos son válidos.

## 4. Recomendaciones generales

### 4.1. Mejora en la gestión de errores
Implementar un middleware global para manejar errores y devolver mensajes de error claros y específicos al usuario.

### 4.2. Actualización de dependencias
Actualizar las dependencias de Node.js y las bibliotecas utilizadas para asegurar la estabilidad y seguridad del sistema.

## 5. Conclusiones
El proyecto presenta algunos problemas de autenticación y validación de datos que requieren atención. Se recomienda revisar y corregir estos aspectos para mejorar la calidad del software. Además, se sugiere aumentar la cobertura de tests para abordar posibles fallos y mejorar la robustez del sistema.