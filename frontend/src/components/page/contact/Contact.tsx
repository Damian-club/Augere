import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import styles from "./Contact.module.css";

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function Contact() {
  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log("Formulario enviado:", form);
    alert("Gracias por tu mensaje. Te contactaremos pronto.");
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className={styles.contactContainer}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2 className={styles.title}>CONTACTO</h2>

        {/* Nombre y correo */}
        <div className={styles.row}>
          <div className={styles.inputGroup}>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder=" "
            />
            <label>Nombre</label>
          </div>

          <div className={styles.inputGroup}>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder=" "
            />
            <label>Correo</label>
          </div>
        </div>

        {/* Tema */}
        <div className={styles.row}>
          <div className={styles.inputGroup}>
            <input
              type="text"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              required
              placeholder=" "
            />
            <label>Tema</label>
          </div>
        </div>

        {/* Mensaje */}
        <div className={`${styles.inputGroup} ${styles.textareaGroup}`}>
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            rows={5}
            required
            placeholder=" "
          ></textarea>
          <label>Mensaje</label>
        </div>

        <button type="submit" className={styles.submitBtn}>
          Enviar
        </button>
      </form>
    </div>
  );
}
