import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import type { ContactData } from "../../../schemas/contact";
import { contactService } from "../../../services";
import styles from "./Contact.module.css";

const initialForm: ContactData = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

export default function Contact() {
  const [form, setForm] = useState<ContactData>(initialForm);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");

    try {
      await contactService.sendContactMessage(form);
      setStatus("success");
      setForm(initialForm);
    } catch (error) {
      console.log("Error al enviar: ", error)
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.contactContainer}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2 className={styles.title}>CONTACTO</h2>

        {/* Nombre y correo */}
        <div className={styles.row}>
          <div className={styles.inputGroup}>
            <input
              id="name"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder=" "
              disabled={loading}
            />
            <label htmlFor="name">Nombre</label>
          </div>

          <div className={styles.inputGroup}>
            <input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder=" "
              disabled={loading}
            />
            <label htmlFor="email">Correo</label>
          </div>
        </div>

        {/* Tema */}
        <div className={styles.row}>
          <div className={styles.inputGroup}>
            <input
              id="subject"
              type="text"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              required
              placeholder=" "
              disabled={loading}
            />
            <label htmlFor="subject">Tema</label>
          </div>
        </div>

        {/* Mensaje */}
        <div className={`${styles.inputGroup} ${styles.textareaGroup}`}>
          <textarea
            id="message"
            name="message"
            value={form.message}
            onChange={handleChange}
            rows={5}
            required
            placeholder=" "
            disabled={loading}
          ></textarea>
          <label htmlFor="message">Mensaje</label>
        </div>

        <button
          type="submit"
          className={`${styles.submitBtn} ${loading ? styles.loading : ""}`}
          disabled={loading}
        >
          {loading ? "Enviando..." : "Enviar"}
        </button>

        {/* Estado del envio */}
        {status === "success" && (
          <p className={styles.succesMsg}>Mensaje enviado correctamente.</p>
        )}
        {status === "error" && (
          <p className={styles.errorMsg}>
            Ocurrio un error al enviar el mensaje.
          </p>
        )}
      </form>
    </div>
  );
}
