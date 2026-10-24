```python
# Importaciones estándar
import os
import sys
import logging
from typing import List, Dict

# Configuración de logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Definición de constantes
EXPECTED_SECTIONS = ['Introducción', 'Características', 'Instalación', 'Uso', 'Contribuciones', 'Licencia']

# Función para verificar el contenido del README
def verificar_readme(ruta_proyecto: str) -> Dict[str, bool]:
    """
    Verifica el contenido del archivo README.md en el proyecto.
    
    Args:
        ruta_proyecto (str): Ruta al directorio del proyecto.
    
    Returns:
        Dict[str, bool]: Un diccionario con las secciones como claves y un valor booleano indicando si la sección está presente.
    """
    ruta_readme = os.path.join(ruta_proyecto, 'README.md')
    
    if not os.path.exists(ruta_readme):
        logger.error(f"El archivo README.md no existe en la ruta: {ruta_proyecto}")
        sys.exit(1)
    
    with open(ruta_readme, 'r', encoding='utf-8') as file:
        contenido = file.read()
    
    secciones_presentes = {seccion: False for seccion in EXPECTED_SECTIONS}
    
    for seccion in EXPECTED_SECTIONS:
        if seccion.replace(' ', '').lower() in contenido.lower():
            secciones_presentes[seccion] = True
    
    return secciones_presentes

# Función principal para la revisión del README
def revisar_readme(ruta_proyecto: str) -> None:
    """
    Revisa el contenido del archivo README.md en el proyecto y muestra los resultados.
    
    Args:
        ruta_proyecto (str): Ruta al directorio del proyecto.
    """
    secciones_presentes = verificar_readme(ruta_proyecto)
    
    logger.info("Revisión del contenido del README.md:")
    for seccion, presente in secciones_presentes.items():
        estado = "Presente" if presente else "Ausente"
        logger.info(f"{seccion}: {estado}")
    
    if all(secciones_presentes.values()):
        logger.info("El README.md parece estar completo.")
    else:
        logger.warning("El README.md puede estar incompleto. Revise las secciones faltantes.")

# Manejo de errores
if __name__ == "__main__":
    if len(sys.argv) != 2:
        logger.error("Uso: python revisar_readme.py <ruta_al_proyecto>")
        sys.exit(1)
    
    ruta_proyecto = sys.argv[1]
    
    if not os.path.isdir(ruta_proyecto):
        logger.error(f"La ruta proporcionada no es un directorio: {ruta_proyecto}")
        sys.exit(1)
    
    revisar_readme(ruta_proyecto)
```

Este archivo incluye una función principal `revisar_readme` que verifica si las secciones esperadas están presentes en el archivo README.md de un proyecto. Utiliza logging para informar sobre la presencia o ausencia de las secciones, y maneja errores de manera clara. El código es modular y fácil de testear, siguiendo los principios SOLID.