```python
import random

class Agente:
    def __init__(self, nombre):
        self.nombre = nombre
        self.estrategia = None

    def set_estrategia(self, estrategia):
        self.estrategia = estrategia

    def actuar(self):
        if self.estrategia:
            return self.estrategia.actuar()
        else:
            return "El agente no tiene estrategia definida."

class Estrategia:
    def actuar(self):
        pass

class EstrategiaAleatoria(Estrategia):
    def actuar(self):
        acciones = ["atacar", "defender", "moverse"]
        return random.choice(acciones)

class AgenteInteligente(Agente):
    def actuar(self):
        return "Usar estrategia inteligente"

# Ejemplo de uso
agente1 = Agente("Agente1")
agente2 = Agente("Agente2")

estrategia_aleatoria = EstrategiaAleatoria()
agente1.set_estrategia(estrategia_aleatoria)
agente2.set_estrategia(EstrategiaAleatoria())

print(agente1.actuar())
print(agente2.actuar())

# Propuesta de refactorización
# 1. Separar las estrategias en un módulo diferente.
# 2. Utilizar polimorfismo para manejar diferentes estrategias.
# 3. Eliminar la redundancia en la creación de instancias de Agente.

# Nuevo archivo estrategias.py
# ARCHIVO: estrategias.py

```

```python
from abc import ABC, abstractmethod

class Estrategia(ABC):
    @abstractmethod
    def actuar(self):
        pass

class EstrategiaAleatoria(Estrategia):
    def actuar(self):
        acciones = ["atacar", "defender", "moverse"]
        return random.choice(acciones)

class EstrategiaInteligente(Estrategia):
    def actuar(self):
        return "Usar estrategia inteligente"

# Nuevo archivo agentes.py
# ARCHIVO: agentes.py

from estrategias import Estrategia, EstrategiaAleatoria, EstrategiaInteligente

class Agente:
    def __init__(self, nombre, estrategia):
        self.nombre = nombre
        self.estrategia = estrategia

    def set_estrategia(self, estrategia):
        self.estrategia = estrategia

    def actuar(self):
        return self.estrategia.actuar()

# Ejemplo de uso
from agentes import Agente
from estrategias import EstrategiaAleatoria

agente1 = Agente("Agente1", EstrategiaAleatoria())
agente2 = Agente("Agente2", EstrategiaAleatoria())

print(agente1.actuar())
print(agente2.actuar())
```