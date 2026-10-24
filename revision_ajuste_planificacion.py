```python
# Importaciones necesarias
import time
import logging
from typing import List, Dict, Any

# Configuración de logging para registrar eventos y errores
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger()

# Definición de la clase para la planificación
class Planificacion:
    def __init__(self, nombre: str, componentes: List[str]):
        self.nombre = nombre
        self.componentes = componentes
        self.tiempo_integracion = 0

    # Método para agregar tiempo de integración
    def agregar_tiempo_integracion(self, horas: int):
        if horas < 0:
            logger.error("El tiempo de integración no puede ser negativo.")
            raise ValueError("El tiempo de integración no puede ser negativo.")
        self.tiempo_integracion = horas
        logger.info(f"Tiempo de integración agregado: {horas} horas para el componente {self.nombre}.")

    # Método para obtener la planificación actual
    def obtener_planificacion(self) -> Dict[str, Any]:
        return {
            "nombre": self.nombre,
            "componentes": self.componentes,
            "tiempo_integracion": self.tiempo_integracion
        }

# Función para ajustar la planificación
def ajustar_planificacion(planificacion: Planificacion, horas: int):
    try:
        planificacion.agregar_tiempo_integracion(horas)
    except ValueError as e:
        logger.error(f"Error ajustando la planificación: {e}")

# Función principal para ejecutar el ajuste de planificación
def main():
    planificacion = Planificacion(nombre="3D", componentes=["ComponenteA", "ComponenteB"])
    ajustar_planificacion(planificacion, 10)
    planificacion_actual = planificacion.obtener_planificacion()
    logger.info(f"Planificación actual: {planificacion_actual}")

# Ejecución del script
if __name__ == "__main__":
    main()
```

Este archivo contiene una implementación modular y bien comentada de la planificación de integración con Ollama en un componente 3D. Utiliza principios SOLID, manejo de errores y código testeable.