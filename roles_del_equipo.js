```javascript
// roles_del_equipo.js

/**
 * @file roles_del_equipo.js
 * @description Define los roles del equipo en el proyecto MultiagentesIA.
 * @module roles_del_equipo
 */

// Importaciones necesarias
import { injectable } from 'inversify';

// Definición de los roles
export const roles = {
  ARCHITECT: 'Arquitecto',
  PRODUCT_OWNER: 'Product Owner',
  SCRUM_MASTER: 'Scrum Master',
  DEVELOPER: 'Desarrollador',
  QA_ENGINEER: 'Ingeniero de Pruebas',
  UI_UX_DESIGNER: 'Diseñador UX/UI',
  DATA_SCIENTIST: 'Científico de Datos',
  AI_ENGINE: 'Enginyer IA'
};

// Definición de la interfaz IRole para asegurar consistencia en los roles
export interface IRole {
  id: number;
  name: string;
}

// Implementación de la interfaz IRole para los roles definidos
@injectable()
class Role implements IRole {
  id: number;
  name: string;

  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
  }
}

// Exportación de los roles como un array de objetos Role
export const rolesList: Role[] = [
  new Role(1, roles.ARCHITECT),
  new Role(2, roles.PRODUCT_OWNER),
  new Role(3, roles.SCRUM_MASTER),
  new Role(4, roles.DEVELOPER),
  new Role(5, roles.QA_ENGINEER),
  new Role(6, roles.UI_UX_DESIGNER),
  new Role(7, roles.DATA_SCIENTIST),
  new Role(8, roles.AI_ENGINE)
];

// Función para obtener un rol por su ID
export function getRoleById(id: number): Role | undefined {
  return rolesList.find(role => role.id === id);
}

// Función para obtener todos los roles
export function getAllRoles(): Role[] {
  return rolesList;
}
```