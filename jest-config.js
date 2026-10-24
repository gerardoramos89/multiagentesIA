```javascript
const { defaults } = require('jest-config');

module.exports = {
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'ts', 'tsx'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'],
  testPathIgnorePatterns: ['/node_modules/'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['/node_modules/'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

ARCHIVO: package.json

```json
{
  "name": "mi-proyecto",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "jest"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "jest": "^27.0.0",
    "ts-jest": "^27.0.0",
    "typescript": "^4.0.0"
  }
}
```

ARCHIVO: primer-test.test.ts

```typescript
import { suma } from './suma';

test('suma 1 + 2 es igual a 3', () => {
  expect(suma(1, 2)).toBe(3);
});
```

ARCHIVO: suma.ts

```typescript
export function suma(a: number, b: number): number {
  return a + b;
}
```

Este archivo de configuración de Jest incluye una serie de ajustes para que funcione con TypeScript, y también incluye un primer caso de prueba que verifica la función de suma.