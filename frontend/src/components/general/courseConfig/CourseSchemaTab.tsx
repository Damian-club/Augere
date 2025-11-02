import { useEffect, useState } from "react";
import {
  IoDocumentText,
  IoCubeOutline,
  IoReaderOutline,
} from "react-icons/io5";
import type { Course } from "../../../schemas/course";
import type { FullSchema } from "../../../schemas/schema";
import styles from "./CourseSchemaTab.module.css";

type Props = {
  course: Course;
};

export default function CourseSchemaTab({ course }: Props) {
  const [schema, setSchema] = useState<FullSchema | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedEntry, setSelectedEntry] = useState<{
    categoryIdx: number;
    entryIdx: number;
  } | null>(null);

  useEffect(() => {
    const testSchema: FullSchema = {
      uuid: "test-uuid-123",
      course_id: course.uuid,
      category_list: [
        {
          name: "Algoritmos",
          position: 0,
          entry_list: [
            {
              name: "Búsqueda binaria",
              body: "",
              context: "",
              entry_type: "topic",
              position: 0,
            },
            {
              name: "Explicación",
              body: "",
              context: "Búsqueda binaria",
              entry_type: "topic",
              position: 1,
            },
            {
              name: "Trabajo algoritmo",
              body: "",
              context: "Búsqueda binaria",
              entry_type: "assignment",
              position: 2,
            },
            {
              name: "Búsqueda secuencial",
              body: "",
              context: "",
              entry_type: "topic",
              position: 3,
            },
            {
              name: "Concepto lista",
              body: "",
              context: "Búsqueda secuencial",
              entry_type: "topic",
              position: 4,
            },
            {
              name: "Idea búsqueda",
              body: "",
              context: "Búsqueda secuencial",
              entry_type: "topic",
              position: 5,
            },
            {
              name: "Trabajo algoritmo",
              body: "",
              context: "Búsqueda secuencial",
              entry_type: "assignment",
              position: 6,
            },
          ],
        },
      ],
    };

    setSchema(testSchema);
    setLoading(false);
  }, [course.uuid]);

  if (loading) return <p>Cargando esquema...</p>;

  const handleSaveBody = () => {
    if (!selectedEntry || !schema) return;
    alert(
      "Body guardado:\n" +
        schema.category_list[selectedEntry.categoryIdx].entry_list[
          selectedEntry.entryIdx
        ].body
    );
  };

  const handleSendContext = () => {
    if (!selectedEntry || !schema) return;
    alert(
      "Context enviado:\n" +
        schema.category_list[selectedEntry.categoryIdx].entry_list[
          selectedEntry.entryIdx
        ].context
    );
  };

  return (
    <div className={styles.schemaContainer}>
      {schema?.category_list.map((cat, catIdx) => (
        <div key={cat.name} className={styles.categoryCard}>
          <h2 className={styles.categoryTitle}>{cat.name}</h2>

          {/* Topics principales */}
          {cat.entry_list
            .filter((e) => e.context === "")
            .map((topic) => {
              const topicIdx = cat.entry_list.indexOf(topic);
              const isSelected =
                selectedEntry?.categoryIdx === catIdx &&
                selectedEntry?.entryIdx === topicIdx;

              return (
                <div key={topic.name}>
                  <div
                    className={`${styles.entryCard} ${
                      isSelected ? styles.selected : ""
                    }`}
                    onClick={() =>
                      setSelectedEntry({
                        categoryIdx: catIdx,
                        entryIdx: topicIdx,
                      })
                    }
                  >
                    <div className={styles.entryHeader}>
                      <IoDocumentText />
                      {topic.name}
                    </div>
                  </div>
                  {/* ASIIGMENT Y SUBTOPICS COMO TOPICS */}
                  {cat.entry_list
                    .filter((e) => e.context === topic.name)
                    .map((sub) => {
                      const subIdx = cat.entry_list.indexOf(sub);
                      const isSelectedSub =
                        selectedEntry?.categoryIdx === catIdx &&
                        selectedEntry?.entryIdx === subIdx;
                      return (
                        <div
                          key={sub.name}
                          className={`${styles.entryCard} ${styles.subtopic} ${
                            isSelectedSub ? styles.selected : ""
                          }`}
                          onClick={() =>
                            setSelectedEntry({
                              categoryIdx: catIdx,
                              entryIdx: subIdx,
                            })
                          }
                        >
                          <div className={styles.entryHeader}>
                            {sub.entry_type === "assignment" ? (
                              <IoReaderOutline />
                            ) : (
                              <IoCubeOutline />
                            )}
                            {sub.name}
                          </div>
                        </div>
                      );
                    })}
                </div>
              );
            })}
        </div>
      ))}

      {/* Seccion de Edicion */}
      {selectedEntry && schema && (
        <div className={styles.editPanel}>
          <h3>
            Editando:{" "}
            {
              schema.category_list[selectedEntry.categoryIdx].entry_list[
                selectedEntry.entryIdx
              ].name
            }
          </h3>
          <p>
            Tipo:{" "}
            {
              schema.category_list[selectedEntry.categoryIdx].entry_list[
                selectedEntry.entryIdx
              ].entry_type
            }
          </p>

          <div className={styles.editField}>
            <label>Body (Markdown):</label>
            <textarea
              placeholder="Escribe el contenido aquí..."
              value={
                schema.category_list[selectedEntry.categoryIdx].entry_list[
                  selectedEntry.entryIdx
                ].body
              }
              onChange={(e) => {
                const newSchema = { ...schema };
                newSchema.category_list[selectedEntry.categoryIdx].entry_list[
                  selectedEntry.entryIdx
                ].body = e.target.value;
                setSchema(newSchema);
              }}
            />
            <button onClick={handleSaveBody}>Guardar Body</button>
          </div>

          <div className={styles.editField}>
            <label>Contexto (IA):</label>
            <textarea
              placeholder="Escribe el contexto aquí..."
              value={
                schema.category_list[selectedEntry.categoryIdx].entry_list[
                  selectedEntry.entryIdx
                ].context
              }
              onChange={(e) => {
                const newSchema = { ...schema };
                newSchema.category_list[selectedEntry.categoryIdx].entry_list[
                  selectedEntry.entryIdx
                ].context = e.target.value;
                setSchema(newSchema);
              }}
            />
            <button onClick={handleSendContext}>Enviar Context</button>
          </div>
        </div>
      )}
    </div>
  );
}
