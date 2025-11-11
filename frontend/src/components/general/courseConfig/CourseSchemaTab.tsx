import { useEffect, useState } from "react";
import {
  schemaService,
  schemaEntryService,
  schemaCategoryService,
} from "../../../services";
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
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = {
  course: Course;
};

export default function CourseSchemaTab2({ course }: Props) {
  const [schema, setSchema] = useState<FullSchema | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiPrompt, setAiPrompt] = useState("");
  const [editingType, setEditingType] = useState(false);
  const [typeInput, setTypeInput] = useState(""); // valor del input
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

  const addCategory = async () => {
    if (!schema) return;

    try {
      // Crear categoría en backend
      const newCat = await schemaCategoryService.createCategory(
        schema.uuid!,
        "Nueva Categoría",
        schema.category_list.length
      );

      // Crear entry inicial en backend
      const newEntry = await schemaEntryService.createEntry({
        name: "Nuevo Entry",
        body: "",
        context: "",
        entry_type: "topic",
        position: 0,
        category_uuid: newCat.uuid,
      });

      newCat.entry_list = [newEntry];

      // Actualizar frontend
      setSchema({
        ...schema,
        category_list: [...schema.category_list, newCat],
      });

      setSelectedEntry(newEntry);
    } catch (err) {
      console.error("Error creando categoría o entry:", err);
      alert("Error creando categoría o entry. Revisa la consola.");
    }
  };

  const addEntry = async (categoryUuid: string) => {
    if (!schema) return;

    try {
      const cat = schema.category_list.find((c) => c.uuid === categoryUuid);
      if (!cat) return;

      const newEntry = await schemaEntryService.createEntry({
        name: "Nuevo Entry",
        body: "",
        context: "",
        entry_type: "topic",
        position: cat.entry_list.length,
        category_uuid: categoryUuid,
      });

      cat.entry_list.push(newEntry);
      setSchema({ ...schema });
    } catch (err) {
      console.error("Error creando entry:", err);
      alert("Error creando entry. Revisa la consola.");
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination || !schema) return;

    const { source, destination, type } = result;
    const newSchema: FullSchema = { ...schema };

    try {
      if (type === "CATEGORY") {
        // Mover categoría en frontend
        const [movedCat] = newSchema.category_list.splice(source.index, 1);
        newSchema.category_list.splice(destination.index, 0, movedCat);

        // Actualizar posiciones en frontend
        newSchema.category_list = newSchema.category_list.map((cat, idx) => ({
          ...cat,
          position: idx,
        }));

        // Actualizar posiciones en backend
        await Promise.all(
          newSchema.category_list.map((cat) =>
            schemaCategoryService.updateCategory(
              cat.uuid!,
              cat.name,
              cat.position
            )
          )
        );
      } else if (type === "ENTRY") {
        const sourceCat = newSchema.category_list.find(
          (c) => c.uuid === source.droppableId
        );
        const destCat = newSchema.category_list.find(
          (c) => c.uuid === destination.droppableId
        );
        if (!sourceCat || !destCat) return;

        // Mover entry en frontend
        const [movedEntry] = sourceCat.entry_list.splice(source.index, 1);
        movedEntry.category_uuid = destCat.uuid!;
        destCat.entry_list.splice(destination.index, 0, movedEntry);

        // Actualizar posiciones en frontend para ambas categorías
        sourceCat.entry_list = sourceCat.entry_list.map((en, idx) => ({
          ...en,
          position: idx,
        }));
        destCat.entry_list = destCat.entry_list.map((en, idx) => ({
          ...en,
          position: idx,
        }));

        // Actualizar backend
        const updateEntries = (entries: Entry[]) =>
          entries.map((en) =>
            schemaEntryService.updateEntry(en.uuid!, {
              position: en.position,
              category_uuid: en.category_uuid,
            })
          );

        await Promise.all([
          ...updateEntries(sourceCat.entry_list),
          ...updateEntries(destCat.entry_list),
        ]);
      }

      // Actualizar estado inmediatamente para que UI se refleje al vuelo
      setSchema(newSchema);
    } catch (err) {
      console.error("Error actualizando posiciones en backend:", err);
      alert("Error al mover elementos. Revisa la consola.");
    }
  };

  const handleGenerateSchema2 = async () => {
    if (!aiPrompt.trim())
      return alert("Escribe un prompt antes de generar el esquema.");

    try {
      setLoading(true);
      const response = await schemaService.generateSchemaByPrompt(
        course.uuid,
        aiPrompt
      );
      setSchema(response); // respuesta del backend (FullSchema)
    } catch (err) {
      console.error("Error generando esquema con IA:", err);
      alert("Hubo un error generando el esquema con IA. Revisa la consola.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBody = async () => {
    if (!selectedEntry) return;

    try {
      await schemaEntryService.updateEntry(selectedEntry.uuid!, {
        body: selectedEntry.body || "",
        context: selectedEntry.context || "",
        entry_type: selectedEntry.entry_type,
        position: selectedEntry.position ?? 0,
        category_uuid: selectedEntry.category_uuid!,
      });
      alert("Contenido guardado");
    } catch (err) {
      console.error(err);
      alert("Error guardando contenido");
    }
  };
  const handleGenerateContext = async () => {
    if (!selectedEntry) return;

    const prompt = selectedEntry.context?.trim();
    if (!prompt) return alert("Escribe un prompt para generar el contexto");

    try {
      setLoading(true);

      // Usamos el mismo endpoint que ya existe
      const response = await schemaService.generateSchemaByPrompt(
        course.uuid,
        prompt
      );

      // Sacamos solo la entry correspondiente
      const updatedEntry = response.category_list
        .flatMap((cat) => cat.entry_list)
        .find((en) => en.uuid === selectedEntry.uuid);

      if (!updatedEntry) {
        alert("No se pudo generar el contenido");
        return;
      }

      // Solo ponemos el texto generado en el body
      setSelectedEntry({
        ...selectedEntry,
        body: updatedEntry.body || "",
      });

      // Actualizamos también el schema local
      if (schema) {
        const newSchema = { ...schema };
        const cat = newSchema.category_list.find(
          (c) => c.uuid === selectedEntry.category_uuid
        );
        if (cat) {
          const entIdx = cat.entry_list.findIndex(
            (en) => en.uuid === selectedEntry.uuid
          );
          if (entIdx !== -1)
            cat.entry_list[entIdx].body = updatedEntry.body || "";
        }
        setSchema(newSchema);
      }

      alert("Contenido generado con IA ✅");
    } catch (err) {
      console.error(err);
      alert("Error generando contenido con IA");
    } finally {
      setLoading(false);
    }
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
        <button className={style.generateBtn} onClick={handleGenerateSchema2}>
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
                  <div className={style.markdownPreview}>
                    <h4>Vista previa (Markdown):</h4>
                    <div className={style.markdownBox}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {selectedEntry.body || "_Sin contenido_"}
                      </ReactMarkdown>
                    </div>
                  </div>
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
