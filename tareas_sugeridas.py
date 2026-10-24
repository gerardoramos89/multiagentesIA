```python
# Importaciones estándar
import logging
from typing import List, Dict, Any

# Configuración de logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Definición de tipos
Task = Dict[str, Any]
TaskList = List[Task]

# Funciones auxiliares
def load_tasks() -> TaskList:
    """Carga las tareas desde un archivo o base de datos."""
    # Simulación de carga de tareas
    return [
        {"id": 1, "title": "Hacer la compra", "completed": False},
        {"id": 2, "title": "Estudiar para el examen", "completed": False},
        {"id": 3, "title": "Llamar al médico", "completed": True}
    ]

def save_tasks(tasks: TaskList):
    """Guarda las tareas en un archivo o base de datos."""
    # Simulación de guardado de tareas
    logger.info(f"Guardando {len(tasks)} tareas.")

# Servicios de tareas
class TaskService:
    def __init__(self, task_list: TaskList):
        self.task_list = task_list

    def get_tasks(self) -> TaskList:
        """Obtiene todas las tareas."""
        return self.task_list

    def add_task(self, task: Task):
        """Agrega una nueva tarea."""
        if task["id"] in [t["id"] for t in self.task_list]:
            raise ValueError(f"La tarea con ID {task['id']} ya existe.")
        self.task_list.append(task)
        logger.info(f"Tarea agregada: {task['title']}")

    def complete_task(self, task_id: int):
        """Marca una tarea como completada."""
        for task in self.task_list:
            if task["id"] == task_id:
                task["completed"] = True
                logger.info(f"Tarea completada: {task['title']}")
                return
        raise ValueError(f"La tarea con ID {task_id} no existe.")

# Manejo de errores
class TaskError(Exception):
    """Excepción personalizada para errores en el manejo de tareas."""
    pass

# Pruebas unitarias
def test_task_service():
    task_service = TaskService(load_tasks())

    # Prueba de agregar una tarea
    task_service.add_task({"id": 4, "title": "Nueva tarea", "completed": False})
    assert len(task_service.get_tasks()) == 4

    # Prueba de completar una tarea
    task_service.complete_task(4)
    tasks = task_service.get_tasks()
    assert tasks[3]["completed"] is True

    logger.info("Todas las pruebas unitarias pasaron.")

# Ejecución de pruebas unitarias
if __name__ == "__main__":
    test_task_service()

# Guardar tareas al finalizar
save_tasks(load_tasks())
```

Este archivo implementa una aplicación simple para gestionar tareas pendientes. Utiliza principios SOLID, manejo de errores y código testeable. Las tareas se cargan desde una fuente simulada, se agregan y completan, y se guardan al finalizar. Las pruebas unitarias verifican el funcionamiento de las operaciones principales.