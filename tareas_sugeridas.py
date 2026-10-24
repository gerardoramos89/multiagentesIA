```python
# Importaciones estándar
import logging
from typing import List, Optional

# Configuración de logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Definición de la clase Task
class Task:
    """Clase que representa una tarea."""
    
    def __init__(self, id: int, name: str, description: str, completed: bool = False):
        """
        Inicializa una nueva tarea.
        
        :param id: Identificador único de la tarea.
        :param name: Nombre de la tarea.
        :param description: Descripción detallada de la tarea.
        :param completed: Estado de completitud de la tarea (por defecto False).
        """
        self.id = id
        self.name = name
        self.description = description
        self.completed = completed

    def mark_as_completed(self):
        """Marca la tarea como completada."""
        self.completed = True
        logger.info(f'Tarea {self.name} (ID {self.id}) marcada como completada.')

    def to_dict(self):
        """Convierte la tarea a un diccionario."""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'completed': self.completed
        }

# Definición de la clase TaskManager
class TaskManager:
    """Clase que gestiona una lista de tareas."""
    
    def __init__(self):
        """Inicializa una lista vacía de tareas."""
        self.tasks: List[Task] = []

    def add_task(self, task: Task):
        """
        Agrega una nueva tarea a la lista.
        
        :param task: Instancia de Task a agregar.
        """
        self.tasks.append(task)
        logger.info(f'Tarea {task.name} (ID {task.id}) agregada.')

    def get_task(self, task_id: int) -> Optional[Task]:
        """
        Obtiene una tarea por su ID.
        
        :param task_id: Identificador de la tarea.
        :return: Instancia de Task o None si no se encuentra.
        """
        for task in self.tasks:
            if task.id == task_id:
                return task
        return None

    def list_tasks(self) -> List[Task]:
        """
        Lista todas las tareas.
        
        :return: Lista de tareas.
        """
        return self.tasks

    def mark_task_as_completed(self, task_id: int):
        """
        Marca una tarea como completada por su ID.
        
        :param task_id: Identificador de la tarea.
        """
        task = self.get_task(task_id)
        if task:
            task.mark_as_completed()
        else:
            logger.error(f'Tarea con ID {task_id} no encontrada.')

# Función principal para interactuar con el usuario
def main():
    """Función principal para interactuar con el usuario."""
    task_manager = TaskManager()
    
    while True:
        print("\n1. Agregar tarea")
        print("2. Marcar tarea como completada")
        print("3. Listar tareas")
        print("4. Salir")
        choice = input("Seleccione una opción: ")
        
        if choice == '1':
            id = int(input("Ingrese el ID de la tarea: "))
            name = input("Ingrese el nombre de la tarea: ")
            description = input("Ingrese la descripción de la tarea: ")
            task = Task(id, name, description)
            task_manager.add_task(task)
        elif choice == '2':
            task_id = int(input("Ingrese el ID de la tarea: "))
            task_manager.mark_task_as_completed(task_id)
        elif choice == '3':
            tasks = task_manager.list_tasks()
            for task in tasks:
                print(f'ID: {task.id}, Nombre: {task.name}, Descripción: {task.description}, Completada: {task.completed}')
        elif choice == '4':
            break
        else:
            print("Opción no válida. Por favor, seleccione una opción válida.")

if __name__ == "__main__":
    main()
```

Este archivo define una aplicación simple para gestionar tareas. Incluye una clase `Task` para representar cada tarea, una clase `TaskManager` para gestionar las tareas, y una función principal `main` para interactuar con el usuario. El código está bien comentado y sigue los principios SOLID, con un manejo de errores básico y una estructura modular.