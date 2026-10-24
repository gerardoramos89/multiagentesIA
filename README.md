# MultiagentesIA

## Descripción del Proyecto

**Nombre:** MultiagentesIA

**Objetivo:** Desarrollar una plataforma multiagente para gestionar la Inteligencia Artificial y equipos de agentes con reglas de gestión de sprints autónomas.

## Estado del Desarrollo

El proyecto se encuentra en una etapa avanzada de desarrollo. Los principales módulos y tecnologías utilizadas incluyen:

- **Next.js** para el frontend.
- **React** para la interfaz de usuario.
- **Tailwind** para el diseño.
- **Node.js** para el backend.
- **Ollama** para la inteligencia artificial.
- **Trello API** para la gestión de proyectos.
- **GitHub API** para integración y gestión de repositorios.

## Historial de Sprints

- **Sprint 1:** Configuración del entorno de desarrollo y base de datos.
- **Sprint 2:** Implementación de la autenticación y gestión básica de usuarios.
- **Sprint 3:** Integración de la API de Trello para la gestión de sprints.
- **Sprint 4:** Desarrollo del módulo de inteligencia artificial con Ollama.
- **Sprint 5:** Implementación de la interfaz de usuario y pruebas finales.

## Guía de Instalación y Uso

### Requisitos

- Node.js v14.x o superior
- npm v6.x o superior
- Git

### Pasos de Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/MultiagentesIA.git
   cd MultiagentesIA
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   - Crear un archivo `.env` en la raíz del proyecto.
   - Agregar las variables de entorno necesarias (API keys, URLs, etc.).

4. **Ejecutar la aplicación:**
   ```bash
   npm run dev
   ```

### Ejemplos de Uso

1. **Iniciar sesión:**
   ```bash
   POST /api/auth/login
   ```

2. **Gestionar un sprint en Trello:**
   ```bash
   POST /api/sprint
   ```

3. **Consultar información de un sprint:**
   ```bash
   GET /api/sprint/:id
   ```

## Próximos Pasos

- **Sprint 6:** Mejora de la interfaz de usuario y optimización del rendimiento.
- **Sprint 7:** Integración con GitHub para gestión de repositorios y colaboración.
- **Sprint 8:** Implementación de métricas y monitoreo de la inteligencia artificial.

## Diseño de Arquitectura

### Diagrama de Componentes

```
+-------------------+
|    MultiagentesIA  |
+--------+----------+
         |
         |
+--------v----------+
|    Core Module    |
+--------+----------+
         |
         |
+--------v----------+
|    Agent Module   |
+--------+----------+
         |
         |
+--------v----------+
|    Communication  |
+-------------------+
```

### Patrones de Diseño Recomendados

- **Modularidad:** Se recomienda dividir el sistema en módulos independientes (Core Module, Agent Module, Communication) para facilitar la mantenimiento y la escalabilidad.
- **Inyección de Dependencias:** Se utilizará un contenedor de inversión de control (IoC) para manejar las dependencias entre módulos, lo que facilitará las pruebas y la sustitución de implementaciones.
- **CQRS (Command Query Responsibility Segregation):** Se recomienda separar las operaciones de comando (para cambios) y consulta (para lecturas) para mejorar la eficiencia y la escalabilidad.

Este README.md proporciona una visión general del proyecto, incluyendo su propósito, estado actual, guía de instalación y uso, y detalles sobre la arquitectura y los patrones de diseño utilizados.