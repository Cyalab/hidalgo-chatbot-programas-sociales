# Cómo Agregar Nuevas Reglas de Prioridad

Este sistema decide qué programas sociales recomendar basándose en la **Comunidad/Región** del ciudadano. Estas reglas están guardadas en el archivo `priority_rules.json`.

## Ubicación del Archivo
`hidalgo_mx_chatbot_twin/backend/priority_rules.json`

## Formato de una Regla
Cada regla es un bloque de texto como este:

```json
  {
    "id": "nombre_unico_de_la_regla",
    "description": "Descripción breve",
    "conditions": {
      "AND": [
        {"field": "region", "operator": "==", "value": "NOMBRE_DE_LA_COMUNIDAD"}
      ]
    },
    "actions": {
      "priority_programs": ["Nombre Exacto del Programa 1", "Nombre Exacto del Programa 2"]
    }
  }
```

## Pasos para Agregar una Nueva Comunidad

1.  Abre el archivo `priority_rules.json` con cualquier editor de texto (Notepad, VS Code).
2.  Copia un bloque existente (desde `{` hasta `},`).
3.  Pégalo al final de la lista (antes del último `]`).
4.  Modifica los siguientes campos:
    *   **"value"**: Pon el nombre de la nueva comunidad (ej: "Tulancingo").
    *   **"priority_programs"**: Escribe la lista de programas que quieres resaltar para esa comunidad.

### Ejemplo Práctico
Si quieres agregar **Tulancingo** y priorizar "Beca Universitaria":

```json
  {
    "id": "regla_tulancingo",
    "description": "Prioridad para Tulancingo",
    "conditions": {
      "AND": [
        {"field": "region", "operator": "==", "value": "Tulancingo"}
      ]
    },
    "actions": {
      "priority_programs": ["Beca Universitaria"]
    }
  }
```

## Nota Importante
*   Asegúrate de que las comas (`,`) estén bien puestas al final de cada bloque, excepto en el último.
*   Si el archivo tiene errores de formato, el sistema podría ignorar las reglas nuevas.
