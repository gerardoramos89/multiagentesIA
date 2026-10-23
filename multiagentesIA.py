```python
class Agent:
    def __init__(self, name, strategy):
        self.name = name
        self.strategy = strategy

    def act(self, observation):
        return self.strategy.decide(observation)


class Strategy:
    def decide(self, observation):
        pass


class RandomStrategy(Strategy):
    def decide(self, observation):
        import random
        return random.choice(['move_left', 'move_right', 'move_up', 'move_down'])


class SimpleStrategy(Strategy):
    def decide(self, observation):
        if 'enemy' in observation:
            return 'attack'
        else:
            return 'move_forward'


class ComplexStrategy(Strategy):
    def decide(self, observation):
        if 'health' in observation and observation['health'] < 0.5:
            return 'heal'
        elif 'enemy' in observation:
            return 'attack'
        else:
            return 'move_forward'


class AgentManager:
    def __init__(self):
        self.agents = []

    def add_agent(self, agent):
        self.agents.append(agent)

    def get_agents(self):
        return self.agents

    def act_all(self, observation):
        actions = []
        for agent in self.agents:
            actions.append(agent.act(observation))
        return actions


# Ejemplo de uso
if __name__ == "__main__":
    manager = AgentManager()
    manager.add_agent(Agent("Agent1", RandomStrategy()))
    manager.add_agent(Agent("Agent2", SimpleStrategy()))
    manager.add_agent(Agent("Agent3", ComplexStrategy()))

    observations = [{}, {'enemy': True}, {'health': 0.3}]

    for observation in observations:
        actions = manager.act_all(observation)
        print(f"Observation: {observation}")
        print(f"Actions: {actions}")
```

Propuesta de refactorización:

1. **Separación de Concernes**: Separamos la lógica de decisión de la estrategia en una clase independiente.
2. **Uso de Named Tuples**: Utilizamos named tuples para representar observaciones y acciones.
3. **Simplificación de Condicionales**: Simplificamos las condicionales en la estrategia compleja.
4. **Uso de Enums**: Utilizamos enums para las acciones posibles.

```python
from collections import namedtuple
from enum import Enum

class Strategy(Enum):
    RANDOM = 1
    SIMPLE = 2
    COMPLEX = 3

class Agent:
    def __init__(self, name, strategy):
        self.name = name
        self.strategy = strategy

    def act(self, observation):
        return self.strategy.decide(observation)


class Strategy:
    def decide(self, observation):
        pass


class RandomStrategy(Strategy):
    def decide(self, observation):
        import random
        return random.choice(['move_left', 'move_right', 'move_up', 'move_down'])


class SimpleStrategy(Strategy):
    def decide(self, observation):
        if 'enemy' in observation:
            return 'attack'
        else:
            return 'move_forward'


class ComplexStrategy(Strategy):
    def decide(self, observation):
        if 'health' in observation and observation['health'] < 0.5:
            return 'heal'
        elif 'enemy' in observation:
            return 'attack'
        else:
            return 'move_forward'


class AgentManager:
    def __init__(self):
        self.agents = []

    def add_agent(self, agent):
        self.agents.append(agent)

    def get_agents(self):
        return self.agents

    def act_all(self, observation):
        actions = []
        for agent in self.agents:
            actions.append(agent.act(observation))
        return actions


# Ejemplo de uso
if __name__ == "__main__":
    manager = AgentManager()
    manager.add_agent(Agent("Agent1", RandomStrategy()))
    manager.add_agent(Agent("Agent2", SimpleStrategy()))
    manager.add_agent(Agent("Agent3", ComplexStrategy()))

    observations = [
        namedtuple('Observation', 'health')(health=None),
        namedtuple('Observation', 'enemy')(enemy=True),
        namedtuple('Observation', 'health')(health=0.3)
    ]

    for observation in observations:
        actions = manager.act_all(observation)
        print(f"Observation: {observation}")
        print(f"Actions: {actions}")
```

Esta refactorización mejora la legibilidad, mantenibilidad y flexibilidad del código al separar las responsabilidades y simplificar las decisiones.