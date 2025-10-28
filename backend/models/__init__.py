# backend/models/__init__.py
import os
import importlib

# Obtener el directorio actual (donde están los modelos)
package_dir = os.path.dirname(__file__)

# Recorrer todos los archivos .py en este directorio
for filename in os.listdir(package_dir):
    if filename.endswith(".py") and filename not in ["__init__.py"]:
        module_name = f"models.{filename[:-3]}"  # quitar .py
        importlib.import_module(module_name)
