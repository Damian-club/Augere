import { useState } from "react";
import {
  IoSparklesOutline,
  IoSendOutline,
  IoCloseOutline,
} from "react-icons/io5";
import style from "./AIChatWidget.module.css";

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div className={style.chatContainer}>
      {/* Cuadro flotante del chat */}
      <div className={`${style.chatBox} ${open ? style.open : ""}`}>
        <div className={style.header}>
          <h3>Asistente IA</h3>
          <button onClick={() => setOpen(false)} className={style.closeBtn}>
            <IoCloseOutline />
          </button>
        </div>

        <div className={style.messages}>
          <p className={style.messageIA}>
            🐟 ¡Hola Pez JoJo! ¿En qué puedo ayudarte con este curso?
          </p>
        </div>

        <div className={style.inputArea}>
          <input
            type="text"
            placeholder="Escribe tu pregunta..."
            className={style.input}
          />
          <button className={style.sendBtn}>
            <IoSendOutline />
          </button>
        </div>
      </div>

      {/* Botón flotante para abrir */}
      {!open && (
        <button className={style.fab} onClick={() => setOpen(true)}>
          <IoSparklesOutline className={style.fabIcon} />
          <span className={style.fabLabel}>¿Tienes preguntas?</span>
        </button>
      )}
    </div>
  );
}
