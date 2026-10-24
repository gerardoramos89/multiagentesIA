```markdown
# MultiagentesIA

¡Bienvenido al proyecto MultiagentesIA! Este proyecto tiene como objetivo desarrollar una plataforma multiagente para gestionar la Inteligencia Artificial, con equipos de agentes que sigan reglas Scrum para ser autónomos, codificados y creando todo lo que un ciclo del software requiera.

## Requisitos previos

Antes de comenzar, asegúrate de tener instalados los siguientes requisitos:

- **Node.js**: Asegúrate de tener Node.js instalado en tu máquina. Puedes descargar la última versión desde [nodejs.org](https://nodejs.org/).

- **Ollama**: Este proyecto utiliza Ollama como framework principal. Asegúrate de tener Ollama instalado. Puedes encontrar la guía de instalación en el [repositorio oficial de Ollama](https://github.com/ollama/ollama).

- **DeepSeek**: Para una experiencia de usuario completa, es recomendable tener DeepSeek instalado. Puedes obtener DeepSeek desde su [sitio web oficial](https://www.deepseek.com/).

## Variables de entorno necesarias

Para ejecutar este proyecto, necesitas configurar algunas variables de entorno. Crea un archivo `.env.local` en la raíz del proyecto y configura las siguientes variables:

```env
# Variable de entorno para la API Key de Ollama
OLLAMA_API_KEY=tu_api_key_de_ollama

# Variable de entorno para la API Key de DeepSeek
DEEPSEEK_API_KEY=tu_api_key_de_deepseek
```

## Guía de inicio rápido paso a paso

### Paso 1: Clonar el repositorio

Primero, clona este repositorio en tu máquina local:

```bash
git clone https://github.com/tu_usuario/multiagentesia.git
cd multiagentesia
```

### Paso 2: Instalar dependencias

Instala las dependencias necesarias utilizando npm:

```bash
npm install
```

### Paso 3: Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto y configura las variables de entorno como se indica en la sección de [Variables de entorno necesarias](#variables-de-entorno-necesarias).

### Paso 4: Ejecutar el proyecto

Para iniciar el servidor de desarrollo, utiliza el siguiente comando:

```bash
npm run dev
```

Esto iniciará el servidor en modo de desarrollo. Abre tu navegador y navega a `http://localhost:3000` para ver la aplicación en funcionamiento.

### Paso 5: Uso de la aplicación

Una vez que la aplicación esté en funcionamiento, podrás utilizarla de acuerdo con las funcionalidades que ofrece. Para más detalles, consulta la [documentación oficial de Ollama](https://docs.ollama.ai/) y [DeepSeek](https://docs.deepseek.com/).

¡Gracias por usar MultiagentesIA!
```

Este archivo README.md proporciona una guía completa para instalar, configurar y utilizar el proyecto MultiagentesIA, incluyendo los requisitos previos, las variables de entorno necesarias y un paso a paso para el inicio rápido.