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
- **Sprint 3:** Integración de la API de Trello para la gestión de tareas.
- **Sprint 4:** Desarrollo del módulo de inteligencia artificial con Ollama.
- **Sprint 5:** Pruebas y ajustes finales.

## Guía de Instalación

### Requisitos

- Node.js v14.x o superior
- npm v6.x o superior
- Git

### Pasos para Instalar

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
   - Renombra el archivo `.env.example` a `.env`.
   - Completa las variables de entorno con tus credenciales y configuraciones.

4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Ejemplos de Uso

### Iniciar la Aplicación

Para iniciar la aplicación en modo de desarrollo:
```bash
npm run dev
```

### Gestión de Tareas en Trello

1. Autentícate con tu cuenta de Trello:
   ```javascript
   const trello = require('trello-api');
   trello.setApiKey('tu_api_key');
   trello.setToken('tu_token');
   ```

2. Crear una nueva tarjeta en un tablero:
   ```javascript
   trello.cards.create({
     name: 'Nueva Tarjeta',
     desc: 'Descripción de la tarjeta',
     idList: 'id_del_lista'
   });
   ```

### Integración con GitHub

1. Autentícate con tu cuenta de GitHub:
   ```javascript
   const github = require('github-api');
   const client = new github({
     token: 'tu_token_de_github'
   });
   ```

2. Crear un nuevo repositorio:
   ```javascript
   const repo = client.getRepo('usuario', 'nuevo_repo');
   repo.create();
   ```

## Próximos Pasos

- **Sprint 6:** Implementación de métricas y monitoreo.
- **Sprint 7:** Mejora de la interfaz de usuario y experiencia del usuario.
- **Sprint 8:** Integración de módulos de aprendizaje automático.

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

Este README.md proporciona una visión general del proyecto, incluyendo su propósito, estado actual, guía de instalación, ejemplos de uso y detalles de la arquitectura, todo ello estructurado y profesionalmente presentado.