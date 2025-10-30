import { useState } from "react";
import styles from "./Auth.module.css";
import { authService } from "../../../services";
import type { RegisterData, LoginData } from "../../../schemas/auth";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  const navigate = useNavigate();

  const [loginForm, setLoginForm] = useState<LoginData>({
    email: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState<RegisterData>({
    name: "",
    email: "",
    password: "",
  });

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterForm((prev) => ({ ...prev, [name]: value }));
  };

  // Manejar Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");
    setMessage("");

    try {
      console.log("🔄 Iniciando proceso de login...");

      if (!loginForm.email || !loginForm.password) {
        throw new Error("Por favor, completa todos los campos");
      }

      // 1. Hacer login
      await authService.login({
        email: loginForm.email.trim(),
        password: loginForm.password,
      });

      console.log("✅ Login exitoso, obteniendo usuario...");

      await new Promise((resolve) => setTimeout(resolve, 100));
      // 2. Obtener usuario inmediatamente
      const user = await authService.getCurrentUser();

      console.log("✅ Usuario obtenido, redirigiendo...");

      setStatus("success");
      setMessage(`Bienvenido ${user.name || "usuario"}`);

      // 3. Redirigir
      navigate("/dashboard");
    } catch (err: any) {
      console.error("❌ Error completo en login:", err);
      setStatus("error");
      setMessage(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  // Manejar Registro
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");
    setMessage("");

    try {
      const result = await authService.register(registerForm);
      setStatus("success");
      setMessage(`Usuario ${registerForm.name} registrado correctamente`);
      console.log("Usuario registrado:", result);

      // Cambiar a login automáticamente
      setTimeout(() => setIsLogin(true), 800);
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Error al registrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.card}>
        <div
          className={`${styles.cardInner} ${!isLogin ? styles.flipped : ""}`}
        >
          {/* --- LOGIN --- */}
          <div className={`${styles.cardFace} ${styles.cardFront}`}>
            <h2 className={styles.authTitle}>
              INICIAR <span className={styles.blue}>SESIÓN</span>
            </h2>
            <form className={styles.authForm} onSubmit={handleLogin}>
              <input
                className={styles.authImputs}
                type="email"
                name="email"
                placeholder="Correo"
                value={loginForm.email}
                onChange={handleLoginChange}
                required
                disabled={loading}
              />
              <input
                className={styles.authImputs}
                type="password"
                name="password"
                placeholder="Contraseña"
                value={loginForm.password}
                onChange={handleLoginChange}
                required
                disabled={loading}
              />
              <button
                className={styles.authBtnAuth}
                type="submit"
                disabled={loading}
              >
                {loading ? "Cargando..." : "Ingresar"}
              </button>
              <p className={styles.link}>¿Olvidaste tu contraseña?</p>
            </form>
          </div>

          {/* --- REGISTRO --- */}
          <div className={`${styles.cardFace} ${styles.cardBack}`}>
            <h2 className={styles.authTitle}>
              CREAR <span className={styles.blue}>CUENTA</span>
            </h2>
            <form className={styles.authForm} onSubmit={handleRegister}>
              <input
                className={styles.authImputs}
                type="text"
                name="name"
                placeholder="Nombre"
                value={registerForm.name}
                onChange={handleRegisterChange}
                required
                disabled={loading}
              />
              <input
                className={styles.authImputs}
                type="email"
                name="email"
                placeholder="Correo"
                value={registerForm.email}
                onChange={handleRegisterChange}
                required
                disabled={loading}
              />
              <input
                className={styles.authImputs}
                type="password"
                name="password"
                placeholder="Contraseña"
                value={registerForm.password}
                onChange={handleRegisterChange}
                required
                disabled={loading}
              />
              <button
                className={styles.authBtnAuth}
                type="submit"
                disabled={loading}
              >
                {loading ? "Registrando..." : "Registrarse"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Boton cambio */}
      <button
        className={`${styles.authBtnAuth} ${styles.toggleBtn}`}
        onClick={() => setIsLogin(!isLogin)}
        disabled={loading}
      >
        {isLogin
          ? "¿Nuevo aquí? Regístrate"
          : "¿Ya tienes cuenta? Inicia sesión"}
      </button>

      {/* Mensaje de estado */}
      {status !== "idle" && (
        <p
          style={{
            color: status === "success" ? "green" : "red",
            marginTop: "10px",
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}
