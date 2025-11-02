import { useEffect, useState } from "react";
import { schemaService } from "../../../services";
import type { Course } from "../../../schemas/course";
import {
  IoClipboardOutline,
  IoDocumentTextOutline,
  IoCodeSlashOutline,
  IoArrowDownCircleOutline,
} from "react-icons/io5";
import styles from "./CourseSchemaTab.module.css";
import {
  type Category,
  type Entry,
  type FullSchema,
} from "../../../schemas/schema";

type Props = {
  course: Course;
};

export default function CourseSchemaTab2({ course }: Props) {
  const [schema, setSchema] = useState<FullSchema | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSchema = async () => {
      try {
        // Obtener esquema por el course_id
        const fullSchema = await schemaService.getFullSchemaByCourse(course.uuid);
        setSchema(fullSchema);
      } catch (err) {
        console.warn("No se encontro esquema, creando uno nuevo...");
        try {
          // Crear esquema
          const newSchema = await schemaService.createSchema(course.uuid);
          const fullSchema = await schemaService.getFullSchemaByCourse(course.uuid);
          setSchema(fullSchema);
        } catch (err2) {
          console.error("Error creando el esquema: ", err2);
        }
      } finally {
        setLoading(false);
      }
    };
    loadSchema();
  }, [course.uuid]);

  if (loading) return <p>Cargando esquema...</p>;
  if (!schema) return <p>No se pudo cargar el esquema.</p>;

  // Manejar topic seleccionado
  const handleSelect = (entry: Entry) => {
    setSelectedEntry(entry);
  };

  // Obtener icono del topic
  const getIcon = (entryType: string) => {
    switch (entryType) {
      case "assignment":
        return <IoClipboardOutline className={styles.icon} />;
      case "topic":
        return <IoDocumentTextOutline className={styles.icon} />;
      default:
        return <IoCodeSlashOutline className={styles.icon} />;
    }
  };

  // Agrupar subtemas
  const groupEntries = (entries: Entry[]) => {
    const grouped: Record<string, Entry[]> = {};
    entries.forEach((entry) => {
      const parent = entry.context || "root";
      if (!grouped[parent]) grouped[parent] = [];
      grouped[parent].push(entry);
    });
    return grouped;
  };

  // Renderizar Categoria
  const renderCatgory = (category: Category) => {
    const grouped = groupEntries(category.entry_list);
    const roots = category.entry_list.filter(
      (e) => e.context === "Algoritmos básicos"
    );

    return (
      <div key={category.name} className={styles.category}>
        <h3 className={styles.categoryTitle}>
          <IoArrowDownCircleOutline className={styles.iconMain} />
          {category.name}
        </h3>

        <div className={styles.entries}>
          {roots.map((topic) => (
            <div key={topic.name} className={styles.topicBlock}>
              <div
                className={`${styles.entryItem} ${
                  selectedEntry?.name === topic.name ? styles.selected : ""
                }`}
                onClick={() => handleSelect(topic)}
              >
                {getIcon(topic.entry_type)}
                <span>{topic.name}</span>
              </div>
              {/* Subtemas */}
              {grouped[topic.name]?.map((sub) => (
                <div
                  key={sub.name}
                  className={`${styles.subEntryItem} ${
                    selectedEntry?.name === sub.name ? styles.selected : ""
                  }`}
                  onClick={() => handleSelect(sub)}
                >
                  {getIcon(sub.entry_type)}
                  <span>{sub.name}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.schemaContainer}>
      <div className={styles.schemaView}>
        {schema.category_list.map((cat) => renderCatgory(cat))}
      </div>

      <div className={styles.editPanel}>
        {selectedEntry ? (
          <>
            <h3>{selectedEntry.name}</h3>
            <p className={styles.entryType}>
              Tipo: <strong>{selectedEntry.entry_type}</strong>
            </p>
            <label>
              Cuerpo:
              <textarea
                placeholder="Escriba aquí el contenido del cuerpo..."
                value={selectedEntry.body || ""}
                onChange={(e) =>
                  setSelectedEntry({
                    ...selectedEntry,
                    body: e.target.value,
                  })
                }
              />
              <button className={styles.saveBtn}>Guardar</button>
            </label>

            <label>
              Contexto IA:
              <textarea
                placeholder="Agrega aquí contexto adicional para la IA..."
                value={selectedEntry.context || ""}
                onChange={(e) =>
                  setSelectedEntry({
                    ...selectedEntry,
                    context: e.target.value,
                  })
                }
              />
              <button className={styles.sendBtn}>Enviar</button>
            </label>
          </>
        ) : (
          <p className={styles.placeholder}>
            Selecciona un subtema para editar su contenido.
          </p>
        )}
      </div>
    </div>
  );
}
