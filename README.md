# MultiagentesIA

## Descripción del Proyecto

**Nombre:** MultiagentesIA

**Objetivo:** Desarrollar una plataforma multiagente para gestionar la Inteligencia Artificial y equipos de agentes con reglas de gestión de sprints autónomas, codificadas y creando todo lo necesario para un ciclo del software en un solo clic.

## Estado del Desarrollo

El proyecto se encuentra en una fase avanzada de desarrollo. Se han completado los siguientes sprints:

- Sprint 1: Configuración del entorno de desarrollo con Next.js y React.
- Sprint 2: Integración de Tailwind para el diseño responsive.
- Sprint 3: Implementación de Node.js para la lógica de negocio.
- Sprint 4: Conexión con la API de Trello para la gestión de tareas.
- Sprint 5: Integración de Ollama para la IA en el sistema.

## Historial de Sprints

- **Sprint 1:** Configuración del entorno de desarrollo con Next.js y React.
  - **Tecnologías:** Next.js, React, Tailwind CSS.
  - **Tareas:** Setup del proyecto, configuración de rutas, creación de componentes básicos.
  - **Resultados:** Entorno de desarrollo configurado, estructura básica del proyecto.

- **Sprint 2:** Integración de Tailwind para el diseño responsive.
  - **Tareas:** Implementación de Tailwind CSS para estilos responsivos.
  - **Resultados:** Diseño responsive implementado, componentes estilizados.

- **Sprint 3:** Implementación de Node.js para la lógica de negocio.
  - **Tareas:** Creación de endpoints para la API de Node.js.
  - **Resultados:** API básica configurada, integración con la base de datos.

- **Sprint 4:** Conexión con la API de Trello para la gestión de tareas.
  - **Tareas:** Autenticación con Trello API, integración de endpoints.
  - **Resultados:** Sistema de gestión de tareas conectado a Trello.

- **Sprint 5:** Integración de Ollama para la IA en el sistema.
  - **Tareas:** Implementación de Ollama para tareas de IA.
  - **Resultados:** Sistema de IA en funcionamiento, integración con la API de Node.js.

## Guía de Instalación y Uso

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
   - Crea un archivo `.env` en la raíz del proyecto.
   - Agrega las variables de entorno necesarias, como las credenciales de Trello y Ollama.

4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

### Ejemplos de Uso

1. **Gestión de Tareas:**
   - Autenticarse con Trello API.
   - Crear, actualizar y eliminar tareas en un tablero de Trello.

2. **Integración de IA:**
   - Utilizar Ollama para tareas de IA, como análisis de datos y recomendaciones.

## Próximos Pasos

- **Sprint 6:** Mejora de la interfaz de usuario.
- **Sprint 7:** Implementación de pruebas unitarias y de integración.
- **Sprint 8:** Optimización de la API y reducción de latencia.

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

## Contribución

¡Estamos emocionados de recibir contribuciones de la comunidad! Para contribuir, sigue estos pasos:

1. Haz un fork del repositorio.
2. Crea una nueva rama para tu feature o bugfix.
3. Haz los cambios y haz un commit.
4. Haz un pull request a la rama main.

## Licencia

Este proyecto está bajo la licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.

---

¡Gracias por usar MultiagentesIA!