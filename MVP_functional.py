```python
# Importaciones necesarias
import logging
from typing import List, Dict, Any
import requests
import json

# Configuración de logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Definición de constantes
API_URL = "https://api.example.com/data"

# Definición de funciones y clases
class DataFetcher:
    """Clase para obtener datos de una API."""
    
    def __init__(self, api_url: str):
        self.api_url = api_url

    def fetch_data(self) -> List[Dict[str, Any]]:
        """Obtiene datos de la API."""
        try:
            response = requests.get(self.api_url)
            response.raise_for_status()
            data = response.json()
            logging.info("Datos obtenidos con éxito.")
            return data
        except requests.exceptions.RequestException as e:
            logging.error(f"Error al obtener datos de la API: {e}")
            raise

class DataProcessor:
    """Clase para procesar datos."""
    
    @staticmethod
    def process_data(data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Procesa los datos obtenidos."""
        processed_data = []
        for item in data:
            # Aquí puedes agregar lógica de procesamiento específica
            processed_item = {k: v for k, v in item.items() if k != 'private_key'}
            processed_data.append(processed_item)
        logging.info("Datos procesados con éxito.")
        return processed_data

class DataSaver:
    """Clase para guardar datos en un archivo."""
    
    @staticmethod
    def save_data(data: List[Dict[str, Any]], filename: str):
        """Guarda los datos en un archivo."""
        try:
            with open(filename, 'w') as file:
                json.dump(data, file, indent=4)
            logging.info(f"Datos guardados en {filename} con éxito.")
        except IOError as e:
            logging.error(f"Error al guardar datos en el archivo: {e}")
            raise

# Función principal
def main():
    """Función principal del script."""
    fetcher = DataFetcher(API_URL)
    try:
        data = fetcher.fetch_data()
        processed_data = DataProcessor.process_data(data)
        DataSaver.save_data(processed_data, "processed_data.json")
    except Exception as e:
        logging.error(f"Error en el proceso: {e}")

# Ejecución del script
if __name__ == "__main__":
    main()
```

Este archivo contiene un script Python modular y bien comentado que implementa un MVP (Minimum Viable Product) funcional. Incluye clases para obtener, procesar y guardar datos de una API externa, utilizando principios SOLID y manejo de errores adecuado.