```python
import requests
import json

# Configuración de la API de Trello
TRELLO_API_KEY = 'TU_API_KEY'
TRELLO_TOKEN = 'TU_TOKEN'
TRELLO_BOARD_ID = 'ID_DE_TU_BOARD'
TRELLO_DONE_COLUMN_ID = 'ID_DE_LA_COLUMNA_DONE'

# Función para obtener el ID de la tarjeta por su nombre
def get_card_id_by_name(card_name):
    url = f'https://api.trello.com/1/search'
    params = {
        'key': TRELLO_API_KEY,
        'token': TRELLO_TOKEN,
        'query': card_name
    }
    response = requests.get(url, params=params)
    if response.status_code == 200:
        data = response.json()
        if 'cards' in data:
            for card in data['cards']:
                if card['name'] == card_name:
                    return card['id']
    raise ValueError(f"Tarjeta '{card_name}' no encontrada")

# Función para mover una tarjeta a la columna "Done"
def move_card_to_done(card_id):
    url = f'https://api.trello.com/1/cards/{card_id}'
    params = {
        'key': TRELLO_API_KEY,
        'token': TRELLO_TOKEN,
        'idList': TRELLO_DONE_COLUMN_ID
    }
    response = requests.put(url, params=params)
    if response.status_code == 200:
        print(f"Tarjeta con ID {card_id} movida a la columna 'Done'")
    else:
        raise Exception(f"Error al mover la tarjeta: {response.json()}")

# Función para manejar el commit exitoso y mover la tarjeta
def handle_commit_success(card_name):
    try:
        card_id = get_card_id_by_name(card_name)
        move_card_to_done(card_id)
    except ValueError as e:
        print(f"Error: {e}")
    except Exception as e:
        print(f"Error al procesar el commit: {e}")

# Ejemplo de uso
if __name__ == "__main__":
    card_name = 'Nombre de la Tarjeta'
    handle_commit_success(card_name)
```

Este código implementa la funcionalidad para mover automáticamente una tarjeta de Trello a la columna "Done" cuando se completa un commit exitosamente. Utiliza la API de Trello para interactuar con los datos de las tarjetas y listas. La función `handle_commit_success` es la encargada de manejar el commit exitoso y mover la tarjeta a la columna correspondiente.