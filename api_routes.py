```python
# api_routes.py

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import logging

# Configurar el logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Modelo de datos para las rutas
class Ruta(BaseModel):
    id: int
    nombre: str
    url: str

# Datos simulados para las rutas
rutas_data = []

# Ruta para obtener todas las rutas
@app.get("/rutas/", response_model=List[Ruta])
def obtener_rutas():
    logger.info("Obteniendo todas las rutas")
    return rutas_data

# Ruta para obtener una ruta por ID
@app.get("/rutas/{id}", response_model=Ruta)
def obtener_ruta_por_id(id: int):
    logger.info(f"Obteniendo ruta con ID {id}")
    ruta = next((ruta for ruta in rutas_data if ruta.id == id), None)
    if ruta is None:
        raise HTTPException(status_code=404, detail="Ruta no encontrada")
    return ruta

# Ruta para crear una nueva ruta
@app.post("/rutas/", response_model=Ruta)
def crear_ruta(ruta: Ruta):
    logger.info(f"Creando nueva ruta: {ruta.nombre}")
    rutas_data.append(ruta)
    return ruta

# Ruta para actualizar una ruta existente
@app.put("/rutas/{id}", response_model=Ruta)
def actualizar_ruta(id: int, ruta_actualizada: Ruta):
    logger.info(f"Actualizando ruta con ID {id}")
    for index, ruta in enumerate(rutas_data):
        if ruta.id == id:
            rutas_data[index] = ruta_actualizada
            return ruta_actualizada
    raise HTTPException(status_code=404, detail="Ruta no encontrada")

# Ruta para eliminar una ruta
@app.delete("/rutas/{id}", response_model=Ruta)
def eliminar_ruta(id: int):
    logger.info(f"Eliminando ruta con ID {id}")
    ruta_eliminada = None
    for index, ruta in enumerate(rutas_data):
        if ruta.id == id:
            ruta_eliminada = ruta
            del rutas_data[index]
            return ruta_eliminada
    if ruta_eliminada is None:
        raise HTTPException(status_code=404, detail="Ruta no encontrada")
    return ruta_eliminada

# Manejo de errores personalizado
@app.exception_handler(HTTPException)
def http_exception_handler(request, exc):
    logger.error(f"Error en la solicitud: {exc.detail}")
    return {"error": exc.detail}

# Comentarios adicionales
# - Se utiliza FastAPI para crear una API RESTful.
# - Se definen modelos Pydantic para las rutas.
# - Se implementan endpoints para CRUD (Crear, Leer, Actualizar, Eliminar).
# - Se manejan errores personalizados y se registra información relevante.

# Ejemplo de uso
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
```

Este archivo contiene una implementación básica de una API RESTful utilizando FastAPI. Incluye:
- Definición de modelos Pydantic para las rutas.
- Implementación de endpoints para CRUD (Crear, Leer, Actualizar, Eliminar).
- Manejo de errores personalizado.
- Registro de información relevante mediante un logger.
- Configuración para ejecutar la aplicación FastAPI localmente.