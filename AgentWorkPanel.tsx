```typescript
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// Componente para la barra de progreso animada
const ProgressBar = styled.div`
  height: 10px;
  background-color: #007bff;
  width: 0%;
  transition: width 0.5s ease-in-out;
`;

// Componente principal del panel de trabajo del agente
const AgentWorkPanel: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulación de la generación de código
    const generateCode = () => {
      for (let i = 0; i <= 100; i++) {
        setTimeout(() => {
          setProgress(i);
        }, i * 50);
      }
    };

    generateCode();
  }, []);

  return (
    <div>
      <h1>Agent Work Panel</h1>
      <ProgressBar style={{ width: `${progress}%` }} />
    </div>
  );
};

export default AgentWorkPanel;
```

Este código define un componente `AgentWorkPanel` que muestra una barra de progreso animada mientras el agente está generando el código en Ollama. Utiliza `useState` para mantener el estado del progreso y `useEffect` para simular la generación de código. El progreso se representa mediante un estilo CSS en línea que ajusta el ancho de la barra de progreso.