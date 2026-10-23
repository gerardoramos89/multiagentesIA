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
    "jest": "^27.0.0"
  },
  "devDependencies": {
    "@babel/preset-env": "^7.15.4",
    "@babel/preset-react": "^7.15.4",
    "babel-jest": "^27.0.0",
    "ts-jest": "^27.0.0",
    "typescript": "^4.4.3"
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

ARCHIVO: src/primer-test.test.js

```javascript
describe('Primer test de ejemplo', () => {
  test('Debería sumar 1 + 2 igual a 3', () => {
    const suma = require('../src/suma');
    expect(suma(1, 2)).toBe(3);
  });
});
```

ARCHIVO: src/suma.js

```javascript
function suma(a, b) {
  return a + b;
}

module.exports = suma;
```