# MultiagentesIA

¡Bienvenido al proyecto MultiagentesIA! Este proyecto tiene como objetivo desarrollar una plataforma multiagente para la inteligencia artificial. Aquí encontrarás toda la información necesaria para instalar, usar y contribuir al proyecto.

## Tabla de contenidos

- [Instalación](#instalación)
- [Uso](#uso)
- [Guía de Contribución](#guía-de-contribución)
- [Documentación de API](#documentación-de-api)

## Instalación

Para instalar el proyecto MultiagentesIA, sigue estos pasos:

1. Clona el repositorio:
   ```sh
   git clone https://github.com/tu-usuario/multiagentesIA.git
   ```

2. Navega al directorio del proyecto:
   ```sh
   cd multiagentesIA
   ```

3. Instala las dependencias:
   ```sh
   pip install -r requirements.txt
   ```

4. Configura el entorno (si es necesario):
   ```sh
   cp .env.example .env
   # Edita el archivo .env con tus configuraciones específicas
   ```

5. Ejecuta las migraciones de la base de datos:
   ```sh
   python manage.py migrate
   ```

6. Inicia el servidor:
   ```sh
   python manage.py runserver
   ```

## Uso

Una vez instalado el proyecto, puedes usarlo de la siguiente manera:

1. Abre tu navegador y navega a:
   ```
   http://localhost:8000
   ```

2. Para más detalles sobre cómo usar la aplicación, consulta la [documentación de API](#documentación-de-api).

## Guía de Contribución

¡Estamos encantados de que quieras contribuir con MultiagentesIA! Aquí tienes una guía para ayudarte a empezar:

1. **Fork del repositorio**: Haz un fork del repositorio principal en tu cuenta de GitHub.

2. **Clona tu fork**: Clona tu fork en tu máquina local.
   ```sh
   git clone https://github.com/tu-usuario/multiagentesIA.git
   ```

3. **Crea una rama**: Crea una nueva rama para tu contribución.
   ```sh
   git checkout -b mi-nueva-caracteristica
   ```

4. **Realiza tus cambios**: Realiza los cambios necesarios en el código.

5. **Prueba tus cambios**: Asegúrate de que tus cambios pasan todas las pruebas.
   ```sh
   pytest
   ```

6. **Crea un pull request**: Envía un pull request a la rama principal del repositorio principal.

## Documentación de API

La documentación de la API está disponible en el siguiente enlace: [Documentación de API](https://tu-usuario.github.io/multiagentesIA/api)

---

¡Gracias por tu interés en MultiagentesIA! Esperamos que disfrutes contribuyendo al proyecto.