```python
# definir_arquitectura_bd.py

import sqlite3
from typing import List, Dict, Any

class DatabaseManager:
    """Clase para manejar la base de datos SQLite."""
    
    def __init__(self, db_name: str):
        """Inicializa la conexión a la base de datos SQLite."""
        self.conn = sqlite3.connect(db_name)
        self.conn.row_factory = sqlite3.Row
        self.cursor = self.conn.cursor()

    def create_table(self, table_name: str, columns: List[str]):
        """Crea una nueva tabla en la base de datos."""
        columns_str = ', '.join(columns)
        query = f"CREATE TABLE IF NOT EXISTS {table_name} ({columns_str})"
        self.cursor.execute(query)
        self.conn.commit()

    def insert(self, table_name: str, data: Dict[str, Any]):
        """Inserta un nuevo registro en la tabla especificada."""
        columns = ', '.join(data.keys())
        placeholders = ', '.join('?' for _ in data.values())
        query = f"INSERT INTO {table_name} ({columns}) VALUES ({placeholders})"
        self.cursor.execute(query, list(data.values()))
        self.conn.commit()

    def query(self, table_name: str, columns: List[str], conditions: Dict[str, Any] = None):
        """Realiza una consulta a la base de datos."""
        columns_str = ', '.join(columns)
        query = f"SELECT {columns_str} FROM {table_name}"
        if conditions:
            where_conditions = ' AND '.join([f"{col} = ?" for col in conditions.keys()])
            query += f" WHERE {where_conditions}"
        self.cursor.execute(query, list(conditions.values()) if conditions else [])
        return self.cursor.fetchall()

    def close(self):
        """Cierra la conexión a la base de datos."""
        self.conn.close()

# Ejemplo de uso
if __name__ == "__main__":
    db = DatabaseManager("example.db")
    db.create_table("users", ["id", "name", "age"])
    db.insert("users", {"id": 1, "name": "Alice", "age": 30})
    result = db.query("users", ["name", "age"], {"id": 1})
    print(list(result))
    db.close()
```

Este archivo define una clase `DatabaseManager` que maneja la conexión y operaciones básicas de una base de datos SQLite. Incluye métodos para crear tablas, insertar registros y realizar consultas. El código está bien comentado y sigue los principios de diseño SOLID, facilitando la extensión y mantenimiento del proyecto.