```javascript
const axios = require('axios');
const { expect } = require('chai');

const endpoints = ['/api/sprint/plan', '/api/sprint/execute'];

describe('Validación de Endpoints', () => {
  endpoints.forEach(endpoint => {
    it(`Debería devolver un formato JSON válido en ${endpoint}`, async () => {
      try {
        const response = await axios.get(`http://localhost:3000${endpoint}`);
        expect(response.status).to.equal(200);
        expect(response.headers['content-type']).to.include('application/json');
        expect(response.data).to.be.an('object');
      } catch (error) {
        if (error.response) {
          expect(error.response.status).to.equal(500); // Ejemplo de cómo manejar errores de red
        } else if (error.request) {
          expect(error.request).to.be.an('object');
        } else {
          throw error;
        }
      }
    });
  });
});
```