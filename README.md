# MultiagentesIA

## Descripción del Proyecto

**Nombre:** MultiagentesIA

**Objetivo:** Desarrollar una plataforma multiagente para gestionar la Inteligencia Artificial y equipos de agentes con reglas de gestión de sprints autónomas, codificadas y creando todo lo necesario para un ciclo del software desde un cliclo.

## Estado del Desarrollo

El proyecto se encuentra en una etapa avanzada de desarrollo. Los principales módulos y tecnologías utilizadas incluyen:

- **Next.js** para el frontend.
- **React** para la interfaz de usuario.
- **Tailwind** para el diseño.
- **Node.js** para el backend.
- **Ollama** para la inteligencia artificial.
- **Trello API** para la gestión de tareas.
- **GitHub API** para integración y gestión de repositorios.

## Historial de Sprints

- **Sprint 1:** Configuración del entorno de desarrollo y base de datos.
- **Sprint 2:** Implementación de la autenticación y gestión básica de usuarios.
- **Sprint 3:** Integración de la API de Trello para la gestión de sprints.
- **Sprint 4:** Desarrollo de módulos de agentes autónomos.
- **Sprint 5:** Implementación de la inteligencia artificial con Ollama.
- **Sprint 6:** Pruebas y ajustes finales.

## Guía de Instalación y Uso

### Requisitos

- Node.js v14.x o superior
- npm v6.x o superior
- Una cuenta en Trello y GitHub.
- Ollama API key.

### Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/MultiagentesIA.git
   cd MultiagentesIA
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Configura las variables de entorno:
   - Crea un archivo `.env` en la raíz del proyecto.
   - Añade las siguientes variables:
     ```
     TRELLO_API_KEY=tu_api_key_de_trello
     TRELLO_TOKEN=tu_token_de_trello
     GITHUB_TOKEN=tu_token_de_github
     OLLAMA_API_KEY=tu_api_key_de_ollama
     ```

4. Inicia el servidor:
   ```bash
   npm run dev
   ```

### Uso

1. Una vez el servidor esté en funcionamiento, abre tu navegador y navega a `http://localhost:3000`.
2. Regístrate o inicia sesión para acceder a la plataforma.
3. Utiliza la interfaz para gestionar tus sprints y agentes.

## Próximos Pasos

- Implementar métricas y dashboards para la visualización de datos.
- Mejorar la interfaz de usuario para una experiencia de usuario más intuitiva.
- Integrar más APIs para una gestión de datos más robusta.

## Arquitectura del Proyecto

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

Este README.md proporciona una visión general del proyecto, su estado actual, instrucciones para su instalación y uso, y una descripción de la arquitectura y patrones de diseño utilizados.