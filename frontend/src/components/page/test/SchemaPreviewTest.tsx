import { useState } from "react";
import CourseSchemaView from "../../general/courseSchema/CourseSchemaView";
import type { FullSchema, Entry } from "../../../schemas/schema";

export default function SchemaPreviewTest() {
  const mockSchema: FullSchema = {
    course_uuid: "course-uuid-demo",
    uuid: "schema-uuid-demo",
    category_list: [
      {
        name: "Introducción a Algoritmos",
        position: 0,
        schema_uuid: "schema-uuid-demo",
        uuid: "cat-intro",
        entry_list: [
          {
            name: "¿Qué es un algoritmo?",
            body: "Contenido introductorio...",
            context: "Contexto inicial...",
            entry_type: "topic",
            position: 0,
            category_uuid: "cat-intro",
            uuid: "entry-intro-1",
          },
          {
            name: "Notación Big O",
            body: "Explicación de complejidad temporal.",
            context: "Comparación entre algoritmos...",
            entry_type: "topic",
            position: 1,
            category_uuid: "cat-intro",
            uuid: "entry-intro-2",
          },
          {
            name: "Tarea: Análisis de Complejidad",
            body: "Resuelve ejercicios sobre Big O.",
            context: "Aplicación práctica de complejidad.",
            entry_type: "assignment",
            position: 2,
            category_uuid: "cat-intro",
            uuid: "entry-intro-3",
          },
        ],
      },
      {
        name: "Estructuras de Datos",
        position: 1,
        schema_uuid: "schema-uuid-demo",
        uuid: "cat-ds",
        entry_list: [
          {
            name: "Listas y Pilas",
            body: "Contenido sobre estructuras lineales.",
            context: "Uso en algoritmos clásicos.",
            entry_type: "topic",
            position: 0,
            category_uuid: "cat-ds",
            uuid: "entry-ds-1",
          },
        ],
      },
    ],
  };

  const [schema] = useState<FullSchema>(mockSchema);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);

  return (
    <div style={{ padding: "2rem" }}>
      <CourseSchemaView
        schema={schema}
        selectedEntry={selectedEntry}
        setSelectedEntry={setSelectedEntry}
        editable={false}
      />

      {selectedEntry && (
        <div
          style={{
            marginTop: "1.5rem",
            padding: "1rem",
            border: "1px solid #ddd",
            borderRadius: "8px",
          }}
        >
          <h3>Seleccionaste:</h3>
          <p>
            <strong>{selectedEntry.name}</strong>
          </p>
          <p>{selectedEntry.body}</p>
        </div>
      )}
    </div>
  );
}
