import { createPortal } from "react-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import {
  IoArrowDownCircleOutline,
  IoAddOutline,
  IoTrashOutline,
  IoClipboardOutline,
  IoDocumentTextOutline,
  IoCodeSlashOutline,
} from "react-icons/io5";
import type { FullSchema, Entry } from "../../../schemas/schema";
import style from "./CourseSchemaView.module.css";
import {
  progressService,
  schemaCategoryService,
  schemaEntryService,
} from "../../../services";
import { useState } from "react";
import type { User } from "../../../schemas/auth";

type Props = {
  schema: FullSchema | null;
  setSchema?: (s: FullSchema) => void;
  selectedEntry: Entry | null;
  isTutor?: boolean;
  setSelectedEntry: (e: Entry | null) => void;
  onDragEnd?: (result: DropResult) => void;
  onAddCategory?: () => void;
  onAddEntry?: (catUuid: string) => void;
  editable?: boolean;
  user?: User | null;
  studentRecordUuid?: string | null;
  progressMap?: Record<string, { finished: boolean; uuid?: string }>;
  setProgressMap?: React.Dispatch<
    React.SetStateAction<Record<string, { finished: boolean; uuid?: string }>>
  >;
};

export default function CourseSchemaView({
  schema,
  setSchema,
  selectedEntry,
  setSelectedEntry,
  onDragEnd,
  onAddCategory,
  onAddEntry,
  editable = true,
  user,
  studentRecordUuid,
  progressMap = {},
  setProgressMap,
  isTutor,
}: Props) {
  const [loadingEntry, setLoadingEntry] = useState<string | null>(null);
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

  // MANEJAR PROGRESO
  const handleToggleProgress = async (entryUuid: string, checked: boolean) => {
    if (!user || !setProgressMap || !studentRecordUuid) {
      console.error("❌ Faltan datos para actualizar progreso");
      return;
    }

    setLoadingEntry(entryUuid);
    try {
      const current = progressMap[entryUuid];

      if (!current?.uuid) {
        // ANTES DE CREAR, verifica que no exista en el backend
        console.log("🔍 Verificando si ya existe progreso para:", entryUuid);

        // Crear nuevo progreso
        const created = await progressService.create({
          entry_uuid: entryUuid,
          student_uuid: studentRecordUuid,
          finished: checked,
        });

        setProgressMap((prev) => ({
          ...prev,
          [entryUuid]: { finished: checked, uuid: created.uuid },
        }));
      } else {
        // Actualizar progreso existente
        await progressService.update(current.uuid, {
          entry_uuid: entryUuid,
          student_uuid: studentRecordUuid,
          finished: checked,
        });

        setProgressMap((prev) => ({
          ...prev,
          [entryUuid]: { ...prev[entryUuid], finished: checked },
        }));
      }
    } catch (err) {
      console.error("Error al actualizar progreso:", err);
    } finally {
      setLoadingEntry(null);
    }
  };

  const categories =
    schema?.category_list?.sort((a, b) => a.position - b.position) || [];

  const CategoryWrapper = editable
    ? Draggable
    : ({ children }: any) => children;
  const EntryWrapper = editable ? Draggable : ({ children }: any) => children;

  const Content = (
    <Droppable
      droppableId="categories"
      type="CATEGORY"
      isDropDisabled={!editable}
    >
      {(provided) => (
        <div ref={provided.innerRef} {...provided.droppableProps}>
          {categories.map((category, index) => (
            <CategoryWrapper
              key={category.uuid}
              draggableId={category.uuid!}
              index={index}
            >
              {(providedCat: any, snapshotCat: any) => {
                const categoryContent = (
                  <div
                    key={category.uuid}
                    ref={editable ? providedCat.innerRef : undefined}
                    {...(editable ? providedCat.draggableProps : {})}
                    className={style.category}
                  >
                    <div
                      {...(editable ? providedCat.dragHandleProps : {})}
                      className={style.categoryHeader}
                    >
                      <IoArrowDownCircleOutline
                        className={style.categoryIcon}
                      />

                      {editable ? (
                        <input
                          className={style.categoryName}
                          value={category.name}
                          onChange={(e) => {
                            if (!setSchema) return;
                            const newSchema = { ...schema! };
                            const cat = newSchema.category_list.find(
                              (c) => c.uuid === category.uuid
                            );
                            if (cat) cat.name = e.target.value;
                            setSchema(newSchema);
                          }}
                          onBlur={async () => {
                            try {
                              await schemaCategoryService.updateCategory(
                                category.uuid!,
                                category.name,
                                category.position
                              );
                            } catch (err) {
                              console.error("Error guardando categoría:", err);
                              alert(
                                "No se pudo guardar el nombre de la categoría"
                              );
                            }
                          }}
                        />
                      ) : (
                        <h3 className={style.categoryName}>{category.name}</h3>
                      )}

                      {editable && (
                        <>
                          <IoAddOutline
                            className={`${style.addEntryIcon} ${style.addCategoryIcon}`}
                            onClick={onAddCategory}
                          />
                          <IoTrashOutline
                            className={style.trashIcon}
                            onClick={() => {
                              if (!setSchema) return;
                              const newSchema = { ...schema! };
                              newSchema.category_list =
                                newSchema.category_list.filter(
                                  (c) => c.uuid !== category.uuid
                                );
                              setSchema(newSchema);
                              if (
                                selectedEntry &&
                                selectedEntry.category_uuid === category.uuid
                              ) {
                                setSelectedEntry(null);
                              }
                            }}
                          />
                        </>
                      )}
                    </div>

                    <Droppable
                      droppableId={category.uuid!}
                      type="ENTRY"
                      isDropDisabled={!editable}
                    >
                      {(providedEntries) => (
                        <div
                          className={style.entriesList}
                          {...providedEntries.droppableProps}
                          ref={providedEntries.innerRef}
                        >
                          {category.entry_list
                            .sort((a, b) => a.position - b.position)
                            .map((entry, index) => (
                              <EntryWrapper
                                key={entry.uuid}
                                draggableId={entry.uuid!}
                                index={index}
                              >
                                {(providedEnt: any, snapshotEnt: any) => {
                                  const entryContent = (
                                    <div
                                      ref={
                                        editable
                                          ? providedEnt.innerRef
                                          : undefined
                                      }
                                      {...(editable
                                        ? {
                                            ...providedEnt.draggableProps,
                                            ...providedEnt.dragHandleProps,
                                          }
                                        : {})}
                                      className={`${style.entryItem} ${
                                        selectedEntry?.uuid === entry.uuid
                                          ? style.selected
                                          : ""
                                      } ${
                                        snapshotEnt?.isDragging
                                          ? style.dragging
                                          : ""
                                      }`}
                                      onClick={() => setSelectedEntry(entry)}
                                    >
                                      {getIcon(entry.entry_type)}
                                      {editable ? (
                                        <input
                                          className={style.entryName}
                                          value={entry.name}
                                          onChange={(e) => {
                                            if (!setSchema) return;
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
                                            if (
                                              selectedEntry?.uuid ===
                                                entry.uuid &&
                                              ent
                                            ) {
                                              setSelectedEntry({ ...ent });
                                            }
                                          }}
                                          onBlur={async () => {
                                            try {
                                              await schemaEntryService.updateEntry(
                                                entry.uuid!,
                                                { name: entry.name }
                                              );
                                            } catch (err) {
                                              console.error(
                                                "Error guardando entry:",
                                                err
                                              );
                                              alert(
                                                "No se pudo guardar el nombre del entry"
                                              );
                                            }
                                          }}
                                        />
                                      ) : (
                                        <span className={style.entryName}>
                                          {entry.name}
                                        </span>
                                      )}

                                      {editable && (
                                        <>
                                          <IoAddOutline
                                            className={style.addEntryIcon}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              onAddEntry?.(category.uuid!);
                                            }}
                                          />
                                          <IoTrashOutline
                                            className={style.trashIcon}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              if (!setSchema) return;
                                              const newSchema = { ...schema! };
                                              const cat =
                                                newSchema.category_list.find(
                                                  (c) =>
                                                    c.uuid === category.uuid
                                                );
                                              if (cat)
                                                cat.entry_list =
                                                  cat.entry_list.filter(
                                                    (en) =>
                                                      en.uuid !== entry.uuid
                                                  );
                                              setSchema(newSchema);
                                              if (
                                                selectedEntry?.uuid ===
                                                entry.uuid
                                              )
                                                setSelectedEntry(null);
                                            }}
                                          />
                                        </>
                                      )}
                                    </div>
                                  );
                                  if (snapshotEnt?.isDragging)
                                    return createPortal(
                                      entryContent,
                                      document.body
                                    );
                                  return entryContent;
                                }}
                              </EntryWrapper>
                            ))}
                          {providedEntries.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                );

                if (snapshotCat?.isDragging)
                  return createPortal(categoryContent, document.body);
                return categoryContent;
              }}
            </CategoryWrapper>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );

  if (!editable) {
    return (
      <div className={style.schemaReadOnly}>
        {categories.map((category) => (
          <div key={category.uuid} className={style.category}>
            <div className={style.categoryHeader}>
              <IoArrowDownCircleOutline className={style.categoryIcon} />
              <h3 className={style.categoryName}>{category.name}</h3>
            </div>

            <div className={style.entriesList}>
              {category.entry_list.map((entry) => (
                <div
                  key={entry.uuid}
                  className={`${style.entryItem} ${
                    selectedEntry?.uuid === entry.uuid ? style.selected : ""
                  }`}
                  onClick={() => setSelectedEntry(entry)}
                >
                  {!isTutor && (
                    <input
                      type="checkbox"
                      className={style.entryCheckbox}
                      checked={progressMap?.[entry.uuid!]?.finished || false}
                      disabled={
                        loadingEntry === entry.uuid ||
                        entry.entry_type === "assignment"
                      }
                      onChange={(e) => {
                        e.stopPropagation();
                        if (entry.entry_type === "assignment") return;
                        handleToggleProgress(entry.uuid!, e.target.checked);
                      }}
                    />
                  )}
                  {getIcon(entry.entry_type)}
                  <span className={style.entryName}>{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return <DragDropContext onDragEnd={onDragEnd!}>{Content}</DragDropContext>;
}
