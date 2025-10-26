# Augere

Esta aplicación permite **generar cursos online a partir de un prompt**.  
La idea es que el usuario/estudiante escriba un tema y la app se encarga de crear un curso con lecciones, objetivos y contenidos básicos.

## 🚀 Características
- Generación de cursos a partir de un tema o prompt.
- Estructura automática de **módulos y lecciones**.
- Contenido fácil de leer y seguir.
- Posibilidad de usar IA para mejor aprendizaje.

# Set up
Es necesario poner variables de entorno, se debe poner en el backend
./backend/.env
```conf
DB_CONN="<String de conexion>"
OPENAI_KEY="<Tu llave de OpenAI>"
SECRET_KEY="<Secreto>"
```