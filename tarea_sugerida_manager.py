```python
# tarea_sugerida_manager.py

import logging
from typing import List, Optional
from dataclasses import dataclass

# Configuración de logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Definición de la clase Task
@dataclass
class Task:
    id: int
    name: str
    description: str
    completed: bool = False

# Definición de la clase TaskManager
class TaskManager:
    def __init__(self):
        self.tasks: List[Task] = []

    def add_task(self, task: Task):
        """Añade una nueva tarea a la lista de tareas."""
        if task.id in [t.id for t in self.tasks]:
            logging.error(f"La tarea con ID {task.id} ya existe.")
        else:
            self.tasks.append(task)
            logging.info(f"Tarea '{task.name}' añadida con éxito.")

    def mark_task_completed(self, task_id: int):
        """Marca una tarea como completada."""
        task = self._find_task_by_id(task_id)
        if task:
            task.completed = True
            logging.info(f"Tarea '{task.name}' marcada como completada.")
        else:
            logging.error(f"No se encontró la tarea con ID {task_id}.")

    def get_tasks(self) -> List[Task]:
        """Devuelve la lista de tareas."""
        return self.tasks

    def get_task_by_id(self, task_id: int) -> Optional[Task]:
        """Devuelve una tarea por su ID."""
        return self._find_task_by_id(task_id)

    def _find_task_by_id(self, task_id: int) -> Optional[Task]:
        """Busca una tarea por su ID y la devuelve si existe."""
        for task in self.tasks:
            if task.id == task_id:
                return task
        return None

# Ejemplo de uso
if __name__ == "__main__":
    manager = TaskManager()
    task1 = Task(id=1, name="Comprar leche", description="Ir a la tienda y comprar leche")
    task2 = Task(id=2, name="Hacer ejercicio", description="Ir al gimnasio y hacer ejercicio")

    manager.add_task(task1)
    manager.add_task(task2)

    logging.info("Tareas agregadas:")
    for task in manager.get_tasks():
        logging.info(f"ID: {task.id}, Nombre: {task.name}, Completada: {task.completed}")

    manager.mark_task_completed(1)

    logging.info("Tareas después de marcar una como completada:")
    for task in manager.get_tasks():
        logging.info(f"ID: {task.id}, Nombre: {task.name}, Completada: {task.completed}")
```

Este archivo define una clase `TaskManager` que maneja una lista de tareas. Incluye métodos para agregar tareas, marcar tareas como completadas, obtener todas las tareas y obtener una tarea por su ID. También se utiliza logging para registrar eventos importantes como la adición de tareas y la marca de tareas como completadas.