import pandas as pd
from sqlalchemy import create_engine
from datetime import datetime

def ejecutar_etl():
    # Configuración de conexión MySQL
    db_user = 'root'
    db_password = '1234'
    db_host = 'localhost'
    db_port = 3307
    db_name = 'voz_urbana'

    # Conexión
    engine = create_engine(f"mysql+pymysql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}")

    # 🔁 EXTRACCIÓN
    print("Conectando y extrayendo datos de la tabla 'reportes'...")
    query = "SELECT * FROM reportes"
    df = pd.read_sql(query, engine)

    # 🧹 TRANSFORMACIÓN
    print("Procesando los datos...")

    # Limpieza básica
    df['titulo'] = df['titulo'].fillna('').str.strip()
    df['descripcion'] = df['descripcion'].fillna('').str.strip()
    df['latitud'] = df['latitud'].fillna('Latitud no especificada')
    df['longitud'] = df['longitud'].fillna('Longitud no especificada')
    df['estado'] = df['estado'].fillna('nuevo')
    df['prioridad'] = df['prioridad'].fillna('media')
    df['imagen_url'] = df['imagen_url'].fillna('')

    # Conversión de fechas
    df['fecha_creacion'] = pd.to_datetime(df['fecha_creacion'], errors='coerce')
    df['fecha_actualizacion'] = pd.to_datetime(df['fecha_actualizacion'], errors='coerce')

    # Campos derivados
    df['año_creacion'] = df['fecha_creacion'].dt.year
    df['mes_creacion'] = df['fecha_creacion'].dt.month
    df['dia_semana_creacion'] = df['fecha_creacion'].dt.day_name()

    # Eliminar duplicados si existieran
    df = df.drop_duplicates(subset=['titulo', 'descripcion', 'latitud', 'longitud', 'fecha_creacion'])

    # 💾 CARGA: exportar como CSV
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    output_file = f"etl_reportes_limpios_{timestamp}.csv"
    df.to_csv(output_file, index=False, encoding='utf-8')

    print(f" ETL completado. Archivo generado: {output_file}")
    return output_file  # 👈 útil si quieres capturar el path desde Node.js

# 🔁 Ejecución directa
if __name__ == "__main__":
    ejecutar_etl()
