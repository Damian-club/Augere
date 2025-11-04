import { useEffect, useState } from "react";
import { schemaService } from "../../../services";
import type { Course } from "../../../schemas/course";
import {
  IoDocumentTextOutline,
  IoSparklesOutline,
  IoSaveOutline,
} from "react-icons/io5";
import { type Entry, type FullSchema } from "../../../schemas/schema";
import style from "./CourseSchemaTab.module.css";
import type { DropResult } from "@hello-pangea/dnd";
import CourseSchemaView from "../courseSchema/CourseSchemaView";

type Props = {
  course: Course;
};

export default function CourseSchemaTab2({ course }: Props) {
  const [schema, setSchema] = useState<FullSchema | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiPrompt, setAiPrompt] = useState("");
  const [editingType, setEditingType] = useState(false);
  const [typeInput, setTypeInput] = useState(""); // valor del input mientras editas
  const [customTypes, setCustomTypes] = useState<string[]>([]); // para nuevos tipos

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

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, type } = result;
    if (!destination || !schema) return;

    const newSchema = { ...schema };

    if (type === "CATEGORY") {
      // mover categoría
      const [movedCat] = newSchema.category_list.splice(source.index, 1);
      newSchema.category_list.splice(destination.index, 0, movedCat);
      newSchema.category_list = newSchema.category_list.map((cat, idx) => ({
        ...cat,
        position: idx,
      }));
    } else if (type === "ENTRY") {
      // mover entry (intra o inter-categoría)
      const sourceCat = newSchema.category_list.find(
        (c) => c.uuid === source.droppableId
      );
      const destCat = newSchema.category_list.find(
        (c) => c.uuid === destination.droppableId
      );
      if (!sourceCat || !destCat) return;

      const [movedEntry] = sourceCat.entry_list.splice(source.index, 1);
      movedEntry.category_uuid = destCat.uuid!; // actualizar categoría si cambió
      destCat.entry_list.splice(destination.index, 0, movedEntry);

      // recalcular posiciones
      sourceCat.entry_list = sourceCat.entry_list.map((en, idx) => ({
        ...en,
        position: idx,
      }));
      destCat.entry_list = destCat.entry_list.map((en, idx) => ({
        ...en,
        position: idx,
      }));
    }

    setSchema(newSchema);
  };

  const handleGenerateSchema = () => {
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

  const handleSaveBody = () => {
    if (!selectedEntry) return;
    console.log("Guardando cuerpo para:", selectedEntry.name);
  };

  const handleGenerateContext = () => {
    if (!selectedEntry) return;
    console.log("Generando contexto IA para:", selectedEntry.name);
  };

  const saveType = (value: string) => {
    if (!value.trim()) {
      setEditingType(false);
      return;
    }

    let newType = value.trim();

    // Si no es topic ni assignment, lo añadimos a customTypes
    if (!["topic", "assignment"].includes(newType.toLowerCase())) {
      setCustomTypes((prev) => [...prev, newType]);
    }

    // Actualizamos el selectedEntry
    if (selectedEntry) {
      setSelectedEntry({ ...selectedEntry, entry_type: newType });
    }

    // Actualizamos el schema
    if (schema && selectedEntry) {
      const newSchema = { ...schema };
      const cat = newSchema.category_list.find(
        (c) => c.uuid === selectedEntry.category_uuid
      );
      const ent = cat?.entry_list.find((en) => en.uuid === selectedEntry.uuid);
      if (ent) ent.entry_type = newType;
      setSchema(newSchema);
    }

    setEditingType(false);
  };

  const addCategory = () => {
    if (!schema) return;

    const newCatUuid = "cat-" + Date.now();
    const newEntryUuid = "entry-" + Date.now();

    const newCategory = {
      name: "Nueva Categoría",
      position: schema.category_list.length,
      schema_uuid: schema.uuid,
      uuid: newCatUuid,
      entry_list: [
        {
          name: "Nuevo Entry",
          body: "",
          context: "",
          entry_type: "topic",
          position: 0,
          category_uuid: newCatUuid,
          uuid: newEntryUuid,
        },
      ],
    };

    setSchema({
      ...schema,
      category_list: [...schema.category_list, newCategory],
    });

    // Selecciona automáticamente el entry recién creado
    setSelectedEntry(newCategory.entry_list[0]);
  };

  const addEntry = (categoryUuid: string) => {
    if (!schema) return;

    const cat = schema.category_list.find((c) => c.uuid === categoryUuid);
    if (!cat) return;

    const newEntryUuid = "entry-" + Date.now();
    const newEntry: Entry = {
      name: "Nuevo Entry",
      body: "",
      context: "",
      entry_type: "topic",
      position: cat.entry_list.length,
      category_uuid: categoryUuid,
      uuid: newEntryUuid,
    };

    cat.entry_list.push(newEntry);

    setSchema({ ...schema });
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
            <CourseSchemaView
              schema={schema}
              setSchema={setSchema}
              selectedEntry={selectedEntry}
              setSelectedEntry={setSelectedEntry}
              onDragEnd={handleDragEnd}
              onAddCategory={addCategory}
              onAddEntry={addEntry}
              editable={true}
            />
          </div>

          {/* === PANEL EDITOR === */}
          <div className={style.editorPanel}>
            {/* ... resto del código sin cambios ... */}
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
                  {editingType ? (
                    <input
                      className={style.typeBadgeInput}
                      value={typeInput}
                      onChange={(e) => setTypeInput(e.target.value)}
                      onBlur={() => saveType(typeInput)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveType(typeInput);
                        if (e.key === "Escape") setEditingType(false);
                      }}
                      autoFocus
                      list="entryTypes"
                    />
                  ) : (
                    <span
                      className={`${style.typeBadge} ${
                        selectedEntry.entry_type === "topic"
                          ? style.topic
                          : selectedEntry.entry_type === "assignment"
                          ? style.assignment
                          : style.customType
                      }`}
                      onClick={() => {
                        setTypeInput(selectedEntry.entry_type);
                        setEditingType(true);
                      }}
                    >
                      {selectedEntry.entry_type}
                    </span>
                  )}

                  <datalist id="entryTypes">
                    <option value="topic" />
                    <option value="assignment" />
                    {customTypes.map((t) => (
                      <option key={t} value={t} />
                    ))}
                  </datalist>

                  <datalist id="entryTypes">
                    <option value="topic" />
                    <option value="assignment" />
                  </datalist>
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
