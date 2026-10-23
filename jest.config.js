```javascript
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
```

ARCHIVO: package.json

```json
{
  "name": "tu-proyecto",
  "version": "1.0.0",
  "description": "Tu descripción del proyecto",
  "main": "index.js",
  "scripts": {
    "test": "jest"
  },
  "dependencies": {
    "jest": "^27.0.0",
    "ts-jest": "^27.0.0",
    "babel-jest": "^27.0.0"
  },
  "devDependencies": {
    "@babel/core": "^7.14.6",
    "@babel/preset-env": "^7.14.7",
    "@babel/preset-typescript": "^7.14.5",
    "jest": "^27.0.0"
  },
  "jest": {
    "testEnvironment": "node",
    "roots": ["<rootDir>/src"],
    "testMatch": ["**/?(*.)+(spec|test).[jt]s?(x)"],
    "transform": {
      "^.+\\.jsx?$": "babel-jest",
      "^.+\\.tsx?$": "ts-jest"
    },
    "moduleFileExtensions": ["ts", "tsx", "js", "jsx", "json", "node"]
  }
}
```

ARCHIVO: primer_test.test.ts

```typescript
import { suma } from './suma';

test('suma de 1 + 2 es igual a 3', () => {
  expect(suma(1, 2)).toBe(3);
});
```

ARCHIVO: suma.ts

```typescript
export function suma(a: number, b: number): number {
  return a + b;
}
```

Este conjunto de archivos configura Jest para un proyecto de Node.js, incluyendo la configuración inicial, un primer caso de prueba y los scripts necesarios para ejecutar los tests.