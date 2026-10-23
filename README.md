# MultiagentesIA

¡Bienvenido al proyecto MultiagentesIA! Este proyecto tiene como objetivo desarrollar una plataforma multiagente para la Inteligencia Artificial. Aquí encontrarás toda la información necesaria para instalar, usar y contribuir al proyecto.

## Tabla de contenidos

- [Instalación](#instalación)
- [Uso](#uso)
- [Contribución](#contribución)
- [Documentación de API](#documentación-de-api)

## Instalación

Para instalar el proyecto, sigue estos pasos:

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

## Uso

Para ejecutar el proyecto, utiliza el siguiente comando:
```sh
python main.py
```

## Contribución

¡Estamos encantados de recibir contribuciones de la comunidad! Para contribuir, sigue estos pasos:

1. Haz un fork del repositorio.
2. Clona tu fork:
   ```sh
   git clone https://github.com/tu-usuario/multiagentesIA.git
   ```
3. Navega al directorio del proyecto:
   ```sh
   cd multiagentesIA
   ```
4. Crea una nueva rama:
   ```sh
   git checkout -b mi-nueva-caracteristica
   ```
5. Realiza tus cambios y haz commit:
   ```sh
   git commit -m "Añade una nueva característica"
   ```
6. Haz push a tu fork:
   ```sh
   git push origin mi-nueva-caracteristica
   ```
7. Abre una Pull Request en el repositorio original.

## Documentación de API

La documentación de la API se encuentra en el archivo `api_docs.md`. Para ver la documentación, abre el archivo en tu editor de texto o sigue estos enlaces:

[Documentación de API](api_docs.md)

¡Gracias por tu interés en el proyecto MultiagentesIA!

ARCHIVO: CONTRIBUTING.md

# Guía de Contribución

¡Gracias por tu interés en contribuir al proyecto MultiagentesIA! Aquí encontrarás todas las pautas y normas que debes seguir para contribuir de manera efectiva.

## Cómo contribuir

1. **Fork del repositorio**: Primero, haz un fork del repositorio en GitHub.
2. **Clona tu fork**: Clona tu fork en tu máquina local.
3. **Crea una nueva rama**: Crea una nueva rama para tu contribución.
   ```sh
   git checkout -b mi-nueva-caracteristica
   ```
4. **Realiza tus cambios**: Realiza los cambios necesarios en el código.
5. **Haz commit de tus cambios**: Haz commit de tus cambios con un mensaje descriptivo.
   ```sh
   git commit -m "Añade una nueva característica"
   ```
6. **Haz push a tu fork**: Haz push de tus cambios a tu fork en GitHub.
   ```sh
   git push origin mi-nueva-caracteristica
   ```
7. **Abre una Pull Request**: Abre una Pull Request en el repositorio original.

## Código de conducta

Este proyecto y la comunidad que lo rodea están regidos por un Código de Conducta. Por favor, lee el [Código de Conducta](CODE_OF_CONDUCT.md) antes de contribuir.

## Buenas prácticas

- **Documentación**: Asegúrate de documentar tu código y las funciones que añadas.
- **Tests**: Escribe tests para tu código y asegúrate de que todos los tests pasen antes de que tu contribución sea aceptada.
- **Comunicación**: Mantén una comunicación clara y respetuosa con otros contribuyentes.

¡Gracias por tu contribución!

ARCHIVO: api_docs.md

# Documentación de API

Esta es la documentación de la API del proyecto MultiagentesIA. Aquí encontrarás información detallada sobre los endpoints disponibles y cómo utilizarlos.

## Endpoints

### GET /agents

Obtiene la lista de agentes disponibles.

**Respuesta:**
```json
{
  "agents": ["agent1", "agent2", "agent3"]
}
```

### POST /agents

Crea un nuevo agente.

**Parámetros:**
- `name` (string): Nombre del agente.
- `type` (string): Tipo de agente.

**Respuesta:**
```json
{
  "message": "Agente creado exitosamente",
  "agent": {
    "id": 1,
    "name": "agent1",
    "type": "tipo1"
  }
}
```

### GET /agents/{id}

Obtiene la información de un agente específico.

**Parámetros:**
- `id` (int): ID del agente.

**Respuesta:**
```json
{
  "agent": {
    "id": 1,
    "name": "agent1",
    "type": "tipo1"
  }
}
```

### PUT /agents/{id}

Actualiza la información de un agente específico.

**Parámetros:**
- `id` (int): ID del agente.
- `name` (string): Nombre del agente.
- `type` (string): Tipo de agente.

**Respuesta:**
```json
{
  "message": "Agente actualizado exitosamente",
  "agent": {
    "id": 1,
    "name": "agent1",
    "type": "tipo2"
  }
}
```

### DELETE /agents/{id}

Elimina un agente específico.

**Parámetros:**
- `id` (int): ID del agente.

**Respuesta:**
```json
{
  "message": "Agente eliminado exitosamente"
}
```

¡Gracias por usar la API de MultiagentesIA!