```python
import unittest
from unittest.mock import patch
from io import StringIO
from main import plataforma_multiagente

class TestPlataformaMultiagente(unittest.TestCase):

    @patch('sys.stdout', new_callable=StringIO)
    def test_agregar_agente(self, mock_stdout):
        # Caso de prueba para agregar un agente
        plataforma_multiagente.agregar_agente("Agente1")
        self.assertEqual(plataforma_multiagente.agentes, ["Agente1"])

    @patch('sys.stdout', new_callable=StringIO)
    def test_agregar_agente_existente(self, mock_stdout):
        # Caso de prueba para agregar un agente ya existente
        plataforma_multiagente.agregar_agente("Agente1")
        plataforma_multiagente.agregar_agente("Agente1")
        self.assertEqual(plataforma_multiagente.agentes, ["Agente1"])
        self.assertIn("El agente ya existe", mock_stdout.getvalue().strip())

    @patch('sys.stdout', new_callable=StringIO)
    def test_mostrar_agentes(self, mock_stdout):
        # Caso de prueba para mostrar los agentes
        plataforma_multiagente.agentes = ["Agente1", "Agente2"]
        plataforma_multiagente.mostrar_agentes()
        self.assertIn("Agentes registrados:", mock_stdout.getvalue().strip())
        self.assertIn("Agente1", mock_stdout.getvalue().strip())
        self.assertIn("Agente2", mock_stdout.getvalue().strip())

    @patch('sys.stdout', new_callable=StringIO)
    def test_eliminar_agente(self, mock_stdout):
        # Caso de prueba para eliminar un agente
        plataforma_multiagente.agentes = ["Agente1", "Agente2"]
        plataforma_multiagente.eliminar_agente("Agente1")
        self.assertEqual(plataforma_multiagente.agentes, ["Agente2"])

    @patch('sys.stdout', new_callable=StringIO)
    def test_eliminar_agente_inexistente(self, mock_stdout):
        # Caso de prueba para eliminar un agente inexistente
        plataforma_multiagente.agentes = ["Agente1", "Agente2"]
        plataforma_multiagente.eliminar_agente("Agente3")
        self.assertEqual(plataforma_multiagente.agentes, ["Agente1", "Agente2"])
        self.assertIn("El agente no existe", mock_stdout.getvalue().strip())

if __name__ == '__main__':
    unittest.main()
```

Este archivo contiene una serie de casos de prueba para la plataforma multiagente. Se han añadido más casos de prueba para asegurar que la funcionalidad de agregar, mostrar y eliminar agentes funciona correctamente.