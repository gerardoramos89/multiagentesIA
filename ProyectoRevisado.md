# Proyecto Revisado

## Introducción
Debido a los retrasos en el proyecto, es necesario realizar una revisión detallada de las estimaciones de tiempo y esfuerzo para las tareas futuras. Este documento tiene como objetivo establecer un plan de ajuste y una estrategia para abordar las incertidumbres y riesgos identificados.

## Análisis de Retrasos
Se ha identificado que varios hitos clave han sufrido retrasos, afectando significativamente las estimaciones de tiempo y esfuerzo. Los principales retrasos se han atribuido a:

1. Complejidad de las tareas.
2. Cambios en los requerimientos.
3. Dependencias de otros proyectos.

## Plan de Ajuste
Para abordar estos problemas, se propone un plan de ajuste que incluye:

### 1. Patrones de Diseño
Se recomienda aplicar patrones de diseño para mejorar la modularidad y la mantenibilidad del software. Algunos patrones a considerar son:

- **Singleton**: Para instancias únicas y globales.
- **Observer**: Para acoplar observadores y sujetos de manera flexible.
- **Strategy**: Para definir familias de algoritmos y permitir que estos varíen independientemente.

### 2. Estructura de Carpetas
Se recomienda reorganizar la estructura de carpetas para mejorar la claridad y la facilidad de mantenimiento. La nueva estructura podría ser:

```
/src
  /components
  /services
  /models
  /utils
```

### 3. Decisiones Técnicas (ADR)
Se crearán ADR (Arquitectura de Decisión de Requisitos) para documentar las decisiones técnicas importantes, como la elección de tecnologías y herramientas.

### 4. Escalabilidad
Para mejorar la escalabilidad, se recomienda implementar una arquitectura de microservicios con balanceo de carga y escalado automático.

### 5. Reducción de Deuda Técnica
Se establecerá un plan para reducir la deuda técnica mediante la implementación de pruebas unitarias exhaustivas y refactorizaciones periódicas.

## Conclusiones
Este plan de ajuste busca abordar las incertidumbres y riesgos del proyecto, asegurando que el software pueda adaptarse a los cambios y seguir siendo sostenible a largo plazo.

## Anexos
- [ADR-001 - Elección de Tecnología Backend](ADR/ADR-001-Elección-de-Tecnologia-Backend.md)
- [ADR-002 - Arquitectura de Microservicios](ADR/ADR-002-Arquitectura-de-Microservicios.md)