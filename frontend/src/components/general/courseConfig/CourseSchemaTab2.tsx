import { useEffect, useState } from "react";
import { schemaService } from "../../../services";
import type { Course } from "../../../schemas/course";
import {
  IoClipboardOutline,
  IoDocumentTextOutline,
  IoCodeSlashOutline,
  IoArrowDownCircleOutline,
  IoSparklesOutline,
  IoSaveOutline,
  IoTrashOutline,
} from "react-icons/io5";
import {
  // type Category,
  type Entry,
  type FullSchema,
} from "../../../schemas/schema";
import style from "./CourseSchemaTab.module.css";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";

type Props = {
  course: Course;
};

export default function CourseSchemaTab2({ course }: Props) {
  const [schema, setSchema] = useState<FullSchema | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiPrompt, setAiPrompt] = useState("");

  useEffect(() => {
    const loadSchema = async () => {
      try {
        const fullSchema = await schemaService.getFullSchemaByCourse(
          course.uuid
        );
        setSchema(fullSchema);
      } catch (err) {
        console.warn("No se encontró esquema, creando uno nuevo...");
        try {
          await schemaService.createSchema(course.uuid);
          const fullSchema = await schemaService.getFullSchemaByCourse(
            course.uuid
          );
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

  // === DRAG & DROP ===
  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination || !schema) return;

    const newSchema = { ...schema };
    const category = newSchema.category_list.find(
      (cat) => cat.uuid === source.droppableId
    );
    if (!category) return;

    const [movedEntry] = category.entry_list.splice(source.index, 1);
    category.entry_list.splice(destination.index, 0, movedEntry);
    category.entry_list = category.entry_list.map((entry, idx) => ({
      ...entry,
      position: idx,
    }));

    setSchema(newSchema);
  };

  // === SELECCIONAR ENTRY ===
  const handleSelectEntry = (entry: Entry) => setSelectedEntry(entry);

  // === GENERAR ESQUEMA MOCK ===
  const handleGenerateSchema = () => {
    // Aquí normalmente llamarías al servicio real
    const mockSchema: FullSchema = {
      course_uuid: course.uuid,
      uuid: "schema-uuid-" + Date.now(),
      category_list: [
        {
          name: "Introducción a Algoritmos",
          position: 0,
          schema_uuid: "schema-uuid-123",
          uuid: "cat-intro",
          entry_list: [
            {
              name: "¿Qué es un algoritmo?",
              body: "Contenido...",
              context: "Contexto...",
              entry_type: "topic",
              position: 0,
              category_uuid: "cat-intro",
              uuid: "entry-intro-1",
            },
            {
              name: "Notación Big O",
              body: "Contenido...",
              context: "Contexto...",
              entry_type: "topic",
              position: 1,
              category_uuid: "cat-intro",
              uuid: "entry-intro-2",
            },
            {
              name: "Tarea: Análisis de Complejidad",
              body: "Contenido...",
              context: "Contexto...",
              entry_type: "assignment",
              position: 2,
              category_uuid: "cat-intro",
              uuid: "entry-intro-3",
            },
          ],
        },
      ],
    };
    setSchema(mockSchema);
  };

  // === GUARDAR BODY ===
  const handleSaveBody = () => {
    if (!selectedEntry) return;
    console.log("Guardando cuerpo para:", selectedEntry.name);
    // Llamar al servicio para guardar
  };

  // === GENERAR CONTEXTO IA ===
  const handleGenerateContext = () => {
    if (!selectedEntry) return;
    console.log("Generando contexto IA para:", selectedEntry.name);
  };

  // === ICONOS ===
  const getIcon = (entryType: string) => {
    switch (entryType) {
      case "assignment":
        return <IoClipboardOutline className={style.icon} />;
      case "topic":
        return <IoDocumentTextOutline className={style.icon} />;
      default:
        return <IoCodeSlashOutline className={style.icon} />;
    }
  };

  if (loading) return <p>Cargando esquema...</p>;

  return (
    <div className={style.schemaContainer}>
      {/* === IA PROMPT === */}
      <div className={style.aiPromptSection}>
        <div className={style.promptHeader}>
          <IoSparklesOutline className={style.sparkleIcon} />
          <h2>Generar Esquema con IA</h2>
        </div>
        <textarea
          className={style.aiPromptInput}
          placeholder="Describe el esquema..."
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          rows={3}
        />
        <button className={style.generateBtn} onClick={handleGenerateSchema}>
          <IoSparklesOutline /> Generar Esquema
        </button>
      </div>

      {schema?.category_list.length === 0 ? (
        <div className={style.noSchemaState}>
          <IoDocumentTextOutline className={style.noSchemaIcon} />
          <h3>No has creado un esquema todavía</h3>
          <p>
            Usa el campo de arriba para generar un esquema con IA o crea uno
            manualmente desde el backend.
          </p>
        </div>
      ) : (
        <div className={style.mainContent}>
          {/* === PANEL ESQUEMA === */}
          <div className={style.schemaPanel}>
            <h3 className={style.panelTitle}>Esquema del Curso</h3>
            <DragDropContext onDragEnd={handleDragEnd}>
              {schema?.category_list
                .sort((a, b) => a.position - b.position)
                .map((category) => (
                  <div key={category.uuid} className={style.category}>
                    <div className={style.categoryHeader}>
                      <IoArrowDownCircleOutline
                        className={style.categoryIcon}
                      />
                      <input
                        className={style.categoryName}
                        value={category.name}
                        onChange={(e) => {
                          const newSchema = { ...schema };
                          const cat = newSchema.category_list.find(
                            (c) => c.uuid === category.uuid
                          );
                          if (cat) cat.name = e.target.value;
                          setSchema(newSchema);
                        }}
                      />
                      <IoTrashOutline
                        className={style.trashIcon}
                        onClick={() => {
                          const newSchema = { ...schema };
                          newSchema.category_list =
                            newSchema.category_list.filter(
                              (c) => c.uuid !== category.uuid
                            );
                          setSchema(newSchema);
                          // Si selectedEntry estaba en esta categoría, limpiar editor
                          if (
                            selectedEntry &&
                            selectedEntry.category_uuid === category.uuid
                          ) {
                            setSelectedEntry(null);
                          }
                        }}
                      />
                    </div>

                    <Droppable droppableId={category.uuid!}>
                      {(provided) => (
                        <div
                          className={style.entriesList}
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                        >
                          {category.entry_list
                            .sort((a, b) => a.position - b.position)
                            .map((entry, index) => (
                              <Draggable
                                key={entry.uuid}
                                draggableId={entry.uuid!}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`${style.entryItem} ${
                                      selectedEntry?.uuid === entry.uuid
                                        ? style.selected
                                        : ""
                                    } ${
                                      snapshot.isDragging ? style.dragging : ""
                                    }`}
                                    style={{ ...provided.draggableProps.style }}
                                    onClick={() => handleSelectEntry(entry)}
                                  >
                                    {getIcon(entry.entry_type)}
                                    <input
                                      className={style.entryName}
                                      value={entry.name}
                                      onChange={(e) => {
                                        const newSchema = { ...schema! };
                                        const cat =
                                          newSchema.category_list.find(
                                            (c) => c.uuid === category.uuid
                                          );
                                        const ent = cat?.entry_list.find(
                                          (en) => en.uuid === entry.uuid
                                        );
                                        if (ent) ent.name = e.target.value;
                                        setSchema(newSchema);

                                        // Sincronizar selectedEntry si corresponde
                                        if (
                                          selectedEntry?.uuid === entry.uuid &&
                                          ent
                                        ) {
                                          setSelectedEntry({
                                            uuid: ent.uuid!,
                                            name: ent.name!,
                                            body: ent.body || "",
                                            context: ent.context || "",
                                            entry_type: ent.entry_type!,
                                            position: ent.position!,
                                            category_uuid: ent.category_uuid!,
                                          });
                                        }
                                      }}
                                    />
                                    <span className={style.entryBadge}>
                                      {entry.entry_type}
                                    </span>
                                    <IoTrashOutline
                                      className={style.trashIcon}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const newSchema = { ...schema! };
                                        const cat =
                                          newSchema.category_list.find(
                                            (c) => c.uuid === category.uuid
                                          );
                                        if (cat)
                                          cat.entry_list =
                                            cat.entry_list.filter(
                                              (en) => en.uuid !== entry.uuid
                                            );
                                        setSchema(newSchema);
                                        if (selectedEntry?.uuid === entry.uuid)
                                          setSelectedEntry(null);
                                      }}
                                    />
                                  </div>
                                )}
                              </Draggable>
                            ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                ))}
            </DragDropContext>
          </div>

          {/* === PANEL EDITOR === */}
          <div className={style.editorPanel}>
            <h3 className={style.panelTitle}>Editor de Contenido</h3>
            {!selectedEntry ? (
              <div className={style.placeholderState}>
                <IoDocumentTextOutline className={style.placeholderIcon} />
                <p>Selecciona un tema o tarea del esquema para editarlo</p>
              </div>
            ) : (
              <div className={style.editorContent}>
                <div className={style.selectedHeader}>
                  <h4>{selectedEntry.name}</h4>
                  <span
                    className={`${style.typeBadge} ${
                      selectedEntry.entry_type === "topic"
                        ? style.topic
                        : style.assignment
                    }`}
                  >
                    {selectedEntry.entry_type === "topic" ? "Tema" : "Tarea"}
                  </span>
                </div>

                <div className={style.editorField}>
                  <label className={style.fieldLabel}>
                    <IoDocumentTextOutline />
                    Cuerpo del contenido
                  </label>
                  <textarea
                    className={style.fieldTextarea}
                    value={selectedEntry.body || ""}
                    onChange={(e) => {
                      setSelectedEntry({
                        ...selectedEntry,
                        body: e.target.value,
                      });

                      // Actualizar en schema
                      if (schema) {
                        const newSchema = { ...schema };
                        const cat = newSchema.category_list.find(
                          (c) => c.uuid === selectedEntry.category_uuid
                        );
                        const ent = cat?.entry_list.find(
                          (en) => en.uuid === selectedEntry.uuid
                        );
                        if (ent) ent.body = e.target.value;
                        setSchema(newSchema);
                      }
                    }}
                    rows={6}
                  />
                  <button className={style.saveBtn} onClick={handleSaveBody}>
                    <IoSaveOutline /> Guardar Cuerpo
                  </button>
                </div>

                <div className={style.editorField}>
                  <label className={style.fieldLabel}>
                    <IoSparklesOutline />
                    Contexto para IA
                  </label>
                  <textarea
                    className={style.fieldTextarea}
                    value={selectedEntry.context || ""}
                    onChange={(e) => {
                      setSelectedEntry({
                        ...selectedEntry,
                        context: e.target.value,
                      });

                      // Actualizar en schema
                      if (schema) {
                        const newSchema = { ...schema };
                        const cat = newSchema.category_list.find(
                          (c) => c.uuid === selectedEntry.category_uuid
                        );
                        const ent = cat?.entry_list.find(
                          (en) => en.uuid === selectedEntry.uuid
                        );
                        if (ent) ent.context = e.target.value;
                        setSchema(newSchema);
                      }
                    }}
                    rows={4}
                  />
                  <button
                    className={style.generateContextBtn}
                    onClick={handleGenerateContext}
                  >
                    <IoSparklesOutline /> Generar con IA
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
