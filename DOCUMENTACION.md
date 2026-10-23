# MultiagentesIA

¡Bienvenido al proyecto MultiagentesIA! Este proyecto tiene como objetivo desarrollar una solución multiagente para problemas de IA. Aquí encontrarás toda la información necesaria para instalar, usar y contribuir al proyecto.

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
   cd multiagentesIA
   ```

2. Instala las dependencias:
   ```sh
   pip install -r requirements.txt
   ```

3. Configura el entorno:
   ```sh
   cp .env.example .env
   # Edita el archivo .env con tus variables de entorno
   ```

4. Ejecuta las migraciones de la base de datos:
   ```sh
   python manage.py migrate
   ```

## Uso

Para ejecutar el servidor de desarrollo, utiliza el siguiente comando:
```sh
python manage.py runserver
```

Una vez en funcionamiento, puedes acceder a la aplicación en tu navegador web a través de `http://localhost:8000`.

## Guía de Contribución

¡Estamos encantados de que quieras contribuir con MultiagentesIA! Aquí tienes una guía para hacerlo:

1. **Fork del repositorio**: Haz un fork del repositorio en GitHub.

2. **Clona tu fork**: Clona tu fork en tu máquina local.
   ```sh
   git clone https://github.com/tu-usuario/multiagentesIA.git
   cd multiagentesIA
   ```

3. **Crea una nueva rama**: Crea una nueva rama para tu contribución.
   ```sh
   git checkout -b nueva-caracteristica
   ```

4. **Realiza tus cambios**: Realiza los cambios necesarios y realiza commits.
   ```sh
   git add .
   git commit -m "Añadida nueva característica"
   ```

5. **Sube tus cambios**: Sube tus cambios a tu fork en GitHub.
   ```sh
   git push origin nueva-caracteristica
   ```

6. **Crea un Pull Request**: Ve a tu fork en GitHub y crea un Pull Request hacia el repositorio original.

## Documentación de API

La documentación de la API está disponible en el siguiente enlace: [Documentación de API](https://tu-usuario.github.io/multiagentesIA/api)

---

¡Gracias por contribuir al proyecto MultiagentesIA!