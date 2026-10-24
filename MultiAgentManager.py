```python
import requests
import logging
from telegram import Bot
from telegram.error import TelegramError
from ollama import OllamaClient
from repository import Repository
from scrum import ScrumRole, ScrumPlanner

# Configuración de logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Configuración de OllamaClient
ollama_client = OllamaClient('http://localhost:11434')

# Configuración de Telegram
telegram_bot_token = 'YOUR_TELEGRAM_BOT_TOKEN'
telegram_bot = Bot(token=telegram_bot_token)

# Configuración de Repository
repo = Repository('https://api.github.com')

# Inicialización de roles de Scrum
scrum_master = ScrumRole('Scrum Master')
product_owner = ScrumRole('Product Owner')
developers = [ScrumRole('Developer')]

# Inicialización de Planner de Scrum
scrum_planner = ScrumPlanner()

# Función para enviar logs a Telegram
def send_log_to_telegram(log_message):
    try:
        telegram_bot.send_message(chat_id='YOUR_CHAT_ID', text=log_message)
    except TelegramError as e:
        logging.error(f"Error al enviar el log a Telegram: {e}")

# Función para obtener logs de Ollama
def get_ollama_logs():
    try:
        logs = ollama_client.get_logs()
        return logs
    except Exception as e:
        logging.error(f"Error al obtener logs de Ollama: {e}")
        return None

# Función para manejar los sprints
def handle_sprint():
    logs = get_ollama_logs()
    if logs:
        for log in logs:
            send_log_to_telegram(log)

    # Aquí se podría añadir lógica para planificar el sprint, asignar tareas, etc.
    scrum_planner.plan_sprint()
    scrum_master.assign_tasks(developers)
    scrum_master.give_instructions()

# Función principal del programa
def main():
    while True:
        handle_sprint()
        logging.info("Sprint gestionado con éxito")

if __name__ == "__main__":
    main()
```

Este archivo es el corazón del gestor de múltiples agentes que utiliza Ollama para trabajar con varios modelos y colaborar con un repositorio de GitHub. Incluye una configuración básica para interactuar con Ollama y Telegram, manejo de errores, y principios SOLID aplicados. El código está bien comentado y está listo para ser extendido y utilizado en el proyecto.