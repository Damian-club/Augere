type formType = {
  isLogin: boolean;
};

export default function ({ isLogin }: formType) {
  let emailField: React.ReactNode | null;

  if (!isLogin) {
    emailField = <input type="email" />;
  }

  let passwordForget: React.ReactNode | null;
  if (isLogin) {
    passwordForget = <p>¿Olvidaste tu contraseña?</p>;
  }

  const submitButton: string = isLogin ? "Ingresa" : "Registrarse";

  return (
    <>
      <h1>{isLogin ? "Iniciar sesión" : "Crear Cuenta"}</h1>
      <div>
        <form>
          {emailField}
          <input type="text" id="name" />
          <input type="password" id="password" />
          {passwordForget}
          <input type="submit" value={submitButton} />
        </form>

        <p>{isLogin ? "¿Eres nuev@?" : "¿Ya tienes cuenta?"}</p>

        <p>{isLogin ? "Regístrate aquí" : "Ingresa aquí"}</p>
      </div>
    </>
  );
}
