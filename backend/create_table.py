import sqlite3

# Conectarse a la base de datos
conn = sqlite3.connect("test.db")
cursor = conn.cursor()

# Crear tabla
cursor.execute("""
CREATE TABLE IF NOT EXISTS schema_generation_tasks (
    uuid TEXT PRIMARY KEY,
    course_uuid TEXT NOT NULL,
    prompt TEXT NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL,
    progress INTEGER DEFAULT 0,
    current_step TEXT,
    error_message TEXT,
    result_schema_uuid TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP
);
""")

# Crear índices
cursor.execute("""
CREATE INDEX IF NOT EXISTS idx_schema_gen_task_course 
ON schema_generation_tasks(course_uuid);
""")

cursor.execute("""
CREATE INDEX IF NOT EXISTS idx_schema_gen_task_status 
ON schema_generation_tasks(status);
""")

# Guardar cambios
conn.commit()
conn.close()

print("✅ Tabla creada correctamente")