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

ARCHIVO: src/suma.test.ts

```typescript
import { suma } from './suma';

test('suma de 1 + 2 es igual a 3', () => {
  expect(suma(1, 2)).toBe(3);
});
```

ARCHIVO: src/suma.ts

```typescript
export function suma(a: number, b: number): number {
  return a + b;
}
```