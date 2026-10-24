# QA_REPORT.md

## Bugs encontrados

### Bug 1: Error en la lógica de cálculo de impuestos
**Descripción:**
El sistema de cálculo de impuestos no está aplicando correctamente las tasas de impuestos para ciertos productos.

**Pasos para reproducir:**
1. Ingresar a la sección de productos.
2. Seleccionar un producto con un precio mayor a $100.
3. Verificar que el impuesto aplicado sea el correcto.

**Resultado esperado:**
El impuesto debería ser del 10% para productos con precio mayor a $100.

**Resultado obtenido:**
El impuesto se está aplicando como si fuera un producto con precio menor a $100, lo que resulta en un impuesto menor al esperado.

**Solución propuesta:**
Revisar y ajustar la lógica de cálculo de impuestos para considerar el precio del producto y aplicar la tasa correspondiente.

---

## Cobertura de tests

### Pruebas unitarias
Se han añadido pruebas unitarias para validar la lógica de cálculo de impuestos. Las pruebas cubren casos de productos con precios menores y mayores a $100.

```javascript
// Test para verificar el cálculo de impuestos
test('Cálculo de impuestos para productos con precio mayor a $100', () => {
  const producto = { precio: 150 };
  const resultado = calcularImpuesto(producto);
  expect(resultado).toBe(15); // 10% de 150
});

test('Cálculo de impuestos para productos con precio menor a $100', () => {
  const producto = { precio: 90 };
  const resultado = calcularImpuesto(producto);
  expect(resultado).toBe(9); // 10% de 90
});
```

### Casos de prueba adicionales
Se han identificado casos de prueba adicionales que podrían mejorar la cobertura de tests:
- Pruebas para productos con precios en el límite de $100.
- Pruebas para productos con precios en el límite de $0.

---

## Recomendaciones de mejora

### Optimización de código
El código actual puede ser optimizado para reducir la redundancia y mejorar la legibilidad. Se recomienda refactorizar la función `calcularImpuesto` para separar la lógica de cálculo y evitar duplicación de código.

### Integración de tests automatizados
Se recomienda integrar un sistema de pruebas automatizadas para detectar errores y fallas temprano en el ciclo de desarrollo.

---

## Casos de prueba críticos

### Caso 1: Validación de formulario de registro
**Descripción:**
El formulario de registro no valida correctamente los campos obligatorios, lo que permite registros incompletos.

**Pasos para reproducir:**
1. Intentar registrarse sin completar todos los campos obligatorios.
2. Observar el resultado de la operación.

**Resultado esperado:**
El sistema debe bloquear el registro y mostrar un mensaje de error indicando que todos los campos son obligatorios.

**Resultado obtenido:**
El registro se completa sin validación de campos, lo que permite registros con información incompleta.

**Solución propuesta:**
Implementar validaciones en el frontend y backend para asegurar que todos los campos obligatorios estén completos antes de permitir el registro.

---

### Caso 2: Verificación de stock en el carrito de compras
**Descripción:**
El sistema no verifica el stock disponible al agregar productos al carrito, lo que puede llevar a situaciones en las que se intenta agregar más unidades de las disponibles.

**Pasos para reproducir:**
1. Agregar un producto al carrito.
2. Intentar agregar más unidades de ese producto del stock disponible.

**Resultado esperado:**
El sistema debe actualizar el carrito solo con la cantidad disponible en stock.

**Resultado obtenido:**
El sistema permite agregar más unidades de un producto del carrito sin verificar el stock, lo que puede llevar a errores de stock.

**Solución propuesta:**
Implementar una verificación del stock disponible al agregar productos al carrito y ajustar la cantidad agregada según el stock disponible.