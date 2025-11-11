import { useState } from "react";
import {
  IoSparklesOutline,
  IoSendOutline,
  IoCloseOutline,
} from "react-icons/io5";
import { aiChatService } from "../../../services";
import style from "./AIChatWidget.module.css";

interface Props {
  progressUuid: string;
}

export default function AIChatWidget({ progressUuid }: Props) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<
    { author: "user" | "ai"; content: string }[]
  >([]);

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMsg = { author: "user" as const, content: message };
    setMessages((prev) => [...prev, userMsg]);
    setMessage("");

    try {
      const res = await aiChatService.sendPrompt(progressUuid, message);
      // el backend devuelve { user, ai }
      setMessages((prev) => [...prev, res.ai]);
    } catch (err) {
      console.error("Error en chat IA:", err);
    }
  };

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
          {messages.map((msg, i) => (
            <p
              key={i}
              className={
                msg.author === "ai" ? style.messageIA : style.messageUser
              }
            >
              {msg.content}
            </p>
          ))}
        </div>

        <div className={style.inputArea}>
          <input
            type="text"
            placeholder="Escribe tu pregunta..."
            className={style.input}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button className={style.sendBtn} onClick={handleSend}>
            <IoSendOutline />
          </button>
        </div>
      </div>

      {/* Botón flotante */}
      {!open && (
        <button className={style.fab} onClick={() => setOpen(true)}>
          <IoSparklesOutline className={style.fabIcon} />
          <span className={style.fabLabel}>¿Tienes preguntas?</span>
        </button>
      )}
    </div>
  );
}
