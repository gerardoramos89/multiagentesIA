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
  "scripts": {
    "test": "jest"
  },
  "devDependencies": {
    "jest": "^27.0.0",
    "ts-jest": "^27.0.0",
    "babel-jest": "^27.0.0"
  }
}
```

ARCHIVO: src/primer-test.test.ts

```typescript
import { suma } from './primer-test';

test('suma de 1 + 2 es igual a 3', () => {
  expect(suma(1, 2)).toBe(3);
});
```

ARCHIVO: src/primer-test.ts

```typescript
export function suma(a: number, b: number): number {
  return a + b;
}
```