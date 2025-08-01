import pandas as pd
import numpy as np
from sqlalchemy import create_engine
from datetime import datetime
import os 
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def ejecutar_etl():
    """
    ETL mejorado para preparar datos óptimos para el modelo de zonas críticas
    """
    # Configuración de conexión MySQL
    db_user = 'root'
    db_password = '1234'
    #db_password = '12345'
    db_host = 'localhost'
    db_port = 3307
    #db_port = 3306
    db_name = 'voz_urbana'

    try:
        # Conexión
        engine = create_engine(f"mysql+pymysql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}")
        logger.info("Conexión establecida exitosamente")

        # ==========================================
        # 🔁 EXTRACCIÓN
        # ==========================================
        logger.info("Extrayendo datos de la tabla 'reportes'...")
        query = """
        SELECT r.*, c.nombre as categoria_nombre, u.nombre as usuario_nombre
        FROM reportes r
        LEFT JOIN categorias c ON r.categoria_id = c.id
        LEFT JOIN usuarios u ON r.usuario_id = u.id
        """
        df = pd.read_sql(query, engine)
        logger.info(f"Datos extraídos: {len(df)} registros")

        if df.empty:
            raise ValueError("No se encontraron datos en la tabla reportes")

        # ==========================================
        # 🧹 TRANSFORMACIÓN AVANZADA
        # ==========================================
        logger.info("Iniciando transformación avanzada de datos...")
        
        # Tamaño inicial
        registros_iniciales = len(df)
        
        # 1. LIMPIEZA BÁSICA DE STRINGS
        logger.info("Limpiando campos de texto...")
        df['titulo'] = df['titulo'].fillna('').str.strip()
        df['descripcion'] = df['descripcion'].fillna('').str.strip()
        df['ubicacion'] = df['ubicacion'].fillna('').str.strip()
        df['estado'] = df['estado'].fillna('nuevo').str.strip().str.lower()
        df['prioridad'] = df['prioridad'].fillna('media').str.strip().str.lower()
        df['imagen_path'] = df['imagen_url'].fillna('')
        
        # 2. LIMPIEZA Y VALIDACIÓN DE COORDENADAS
        logger.info("Validando y limpiando coordenadas...")
        
        # Convertir coordenadas a numérico
        df['latitud'] = pd.to_numeric(df['latitud'], errors='coerce')
        df['longitud'] = pd.to_numeric(df['longitud'], errors='coerce')
        
        # Contar coordenadas inválidas antes de limpiar
        coords_invalidas = df[df['latitud'].isna() | df['longitud'].isna()]
        logger.info(f"Coordenadas inválidas encontradas: {len(coords_invalidas)}")
        
        # Filtrar coordenadas válidas para Xicotepec de Juárez, Puebla
        # Rangos aproximados: Lat 20.25-20.28, Lng -97.97 a -97.95
        df_coords_validas = df[
            (df['latitud'].notna()) & 
            (df['longitud'].notna()) &
            (df['latitud'] >= 20.20) & (df['latitud'] <= 20.32) &  # Rango ampliado
            (df['longitud'] >= -98.00) & (df['longitud'] <= -97.90)  # Rango ampliado
        ].copy()
        
        coords_fuera_rango = len(df) - len(coords_invalidas) - len(df_coords_validas)
        logger.info(f"Coordenadas fuera del rango geográfico: {coords_fuera_rango}")
        logger.info(f"Coordenadas válidas: {len(df_coords_validas)}")
        
        # Usar solo datos con coordenadas válidas
        df = df_coords_validas.copy()
        
        if df.empty:
            raise ValueError("No hay registros con coordenadas válidas después de la limpieza")

        # 3. CONVERSIÓN Y VALIDACIÓN DE FECHAS
        logger.info("Procesando fechas...")
        df['fecha_creacion'] = pd.to_datetime(df['fecha_creacion'], errors='coerce')
        df['fecha_actualizacion'] = pd.to_datetime(df['fecha_actualizacion'], errors='coerce')
        
        # Filtrar fechas válidas
        fechas_invalidas = df[df['fecha_creacion'].isna()]
        logger.info(f"Registros con fechas inválidas: {len(fechas_invalidas)}")
        df = df[df['fecha_creacion'].notna()].copy()

        # 4. VALIDACIÓN DE CATEGORÍAS Y IDs
        logger.info("Validando campos de referencia...")
        df['categoria_id'] = pd.to_numeric(df['categoria_id'], errors='coerce').fillna(0).astype(int)
        df['usuario_id'] = pd.to_numeric(df['usuario_id'], errors='coerce').fillna(0).astype(int)
        
        # 5. CAMPOS DERIVADOS AVANZADOS PARA ML
        logger.info("Generando campos derivados para Machine Learning...")
        
        # Características temporales detalladas
        df['año_creacion'] = df['fecha_creacion'].dt.year
        df['mes_creacion'] = df['fecha_creacion'].dt.month
        df['dia_creacion'] = df['fecha_creacion'].dt.day
        df['dia_semana_creacion'] = df['fecha_creacion'].dt.dayofweek
        df['hora_creacion'] = df['fecha_creacion'].dt.hour
        df['minuto_creacion'] = df['fecha_creacion'].dt.minute
        
        # Características temporales categóricas
        df['nombre_dia_semana'] = df['fecha_creacion'].dt.day_name()
        df['nombre_mes'] = df['fecha_creacion'].dt.month_name()
        df['es_fin_semana'] = (df['dia_semana_creacion'] >= 5).astype(int)
        df['es_horario_laboral'] = ((df['hora_creacion'] >= 8) & (df['hora_creacion'] <= 18)).astype(int)
        df['es_horario_nocturno'] = ((df['hora_creacion'] >= 22) | (df['hora_creacion'] <= 6)).astype(int)
        
        # Características estacionales
        df['trimestre'] = df['fecha_creacion'].dt.quarter
        df['semana_año'] = df['fecha_creacion'].dt.isocalendar().week
        
        # Características geográficas derivadas
        centro_xicotepec = [20.27, -97.96]  # Centro aproximado
        df['distancia_centro_ciudad'] = np.sqrt(
            (df['latitud'] - centro_xicotepec[0])**2 + 
            (df['longitud'] - centro_xicotepec[1])**2
        )
        
        # Cuadrantes geográficos
        df['cuadrante_lat'] = np.where(df['latitud'] >= centro_xicotepec[0], 'Norte', 'Sur')
        df['cuadrante_lng'] = np.where(df['longitud'] >= centro_xicotepec[1], 'Este', 'Oeste')
        df['cuadrante'] = df['cuadrante_lat'] + '-' + df['cuadrante_lng']
        
        # Características de tiempo de procesamiento
        df['tiempo_procesamiento'] = (df['fecha_actualizacion'] - df['fecha_creacion']).dt.total_seconds() / 3600  # horas
        df['tiempo_procesamiento'] = df['tiempo_procesamiento'].fillna(0)
        df['procesamiento_rapido'] = (df['tiempo_procesamiento'] <= 24).astype(int)  # Procesado en menos de 24h
        
        # Características de prioridad numérica
        prioridad_map = {'baja': 1, 'media': 2, 'alta': 3}
        df['prioridad_numerica'] = df['prioridad'].map(prioridad_map).fillna(2)
        
        # Características de estado numérico
        estado_map = {'nuevo': 1, 'en_proceso': 2, 'resuelto': 3, 'cerrado': 4}
        df['estado_numerico'] = df['estado'].map(estado_map).fillna(1)
        
        # 6. DETECCIÓN Y LIMPIEZA DE OUTLIERS GEOGRÁFICOS
        logger.info("Detectando outliers geográficos...")
        
        # Usar IQR para detectar outliers en coordenadas
        def detectar_outliers_iqr(serie):
            Q1 = serie.quantile(0.25)
            Q3 = serie.quantile(0.75)
            IQR = Q3 - Q1
            limite_inferior = Q1 - 1.5 * IQR
            limite_superior = Q3 + 1.5 * IQR
            return (serie < limite_inferior) | (serie > limite_superior)
        
        outliers_lat = detectar_outliers_iqr(df['latitud'])
        outliers_lng = detectar_outliers_iqr(df['longitud'])
        outliers_total = outliers_lat | outliers_lng
        
        logger.info(f"Outliers geográficos detectados: {outliers_total.sum()}")
        
        # Marcar outliers pero no eliminarlos (pueden ser zonas periféricas válidas)
        df['es_outlier_geografico'] = outliers_total.astype(int)
        
        # 7. ELIMINACIÓN DE DUPLICADOS MEJORADA
        logger.info("Eliminando duplicados con criterios avanzados...")
        
        duplicados_antes = len(df)
        
        # Duplicados exactos
        df = df.drop_duplicates(subset=['titulo', 'descripcion', 'latitud', 'longitud', 'fecha_creacion'])
        
        # Duplicados por proximidad geográfica y temporal (posibles reportes duplicados)
        df['coord_redondeada'] = df['latitud'].round(4).astype(str) + '_' + df['longitud'].round(4).astype(str)
        df['fecha_redondeada'] = df['fecha_creacion'].dt.floor('h')  # Redondear a la hora
        
        duplicados_proximidad = df.duplicated(subset=['coord_redondeada', 'fecha_redondeada', 'categoria_id'], keep='first')
        logger.info(f"Duplicados por proximidad detectados: {duplicados_proximidad.sum()}")
        
        df = df[~duplicados_proximidad].copy()
        df = df.drop(['coord_redondeada', 'fecha_redondeada'], axis=1)
        
        duplicados_eliminados = duplicados_antes - len(df)
        logger.info(f"Duplicados eliminados: {duplicados_eliminados}")

        # 8. VALIDACIÓN FINAL DE CALIDAD
        logger.info("Ejecutando validación final de calidad...")
        
        # Estadísticas de calidad
        calidad_stats = {
            'registros_iniciales': registros_iniciales,
            'registros_finales': len(df),
            'coords_invalidas': len(coords_invalidas),
            'coords_fuera_rango': coords_fuera_rango,
            'fechas_invalidas': len(fechas_invalidas),
            'duplicados_eliminados': duplicados_eliminados,
            'outliers_geograficos': outliers_total.sum(),
            'tasa_retencion': (len(df) / registros_iniciales) * 100
        }
        
        # Validar que tenemos suficientes datos para ML
        reportes_alta_prioridad = len(df[df['prioridad'] == 'alta'])
        if reportes_alta_prioridad < 10:
            logger.warning(f"Pocos reportes de alta prioridad para ML: {reportes_alta_prioridad}")
        
        # 9. ORDENAMIENTO Y PREPARACIÓN FINAL
        logger.info("Preparando datos finales...")
        
        # Ordenar por fecha de creación
        df = df.sort_values('fecha_creacion').reset_index(drop=True)
        
        # Reordenar columnas de manera lógica
        columnas_principales = [
            'id', 'titulo', 'descripcion', 'categoria_id', 'categoria_nombre',
            'ubicacion', 'latitud', 'longitud', 'estado', 'prioridad', 
            'usuario_id', 'usuario_nombre', 'fecha_creacion', 'fecha_actualizacion',
            'imagen_path'
        ]
        
        columnas_derivadas = [col for col in df.columns if col not in columnas_principales]
        columnas_ordenadas = columnas_principales + sorted(columnas_derivadas)
        
        # Filtrar solo columnas que existen
        columnas_finales = [col for col in columnas_ordenadas if col in df.columns]
        df = df[columnas_finales]

        # ==========================================
        # 💾 CARGA: EXPORTACIÓN MEJORADA
        # ==========================================
        logger.info("Guardando datos procesados...")
        
        # Crear estructura de carpetas
        output_folder = "exports/etl_data"
        os.makedirs(output_folder, exist_ok=True)
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        # Archivo principal
        filename = f"etl_reportes_limpios_{timestamp}.csv"
        output_file = os.path.join(output_folder, filename)
        df.to_csv(output_file, index=False, encoding='utf-8')
        
        # Archivo de reporte de calidad
        reporte_filename = f"etl_reporte_calidad_{timestamp}.txt"
        reporte_file = os.path.join(output_folder, reporte_filename)
        
        with open(reporte_file, 'w', encoding='utf-8') as f:
            f.write("=== REPORTE DE CALIDAD ETL ===\n\n")
            f.write(f"Fecha de procesamiento: {datetime.now()}\n")
            f.write(f"Archivo generado: {filename}\n\n")
            
            f.write("ESTADÍSTICAS DE PROCESAMIENTO:\n")
            for key, value in calidad_stats.items():
                f.write(f"- {key}: {value}\n")
            
            f.write(f"\nDISTRIBUCIÓN POR PRIORIDAD:\n")
            distribucion_prioridad = df['prioridad'].value_counts()
            for prioridad, count in distribucion_prioridad.items():
                f.write(f"- {prioridad}: {count} ({count/len(df)*100:.1f}%)\n")
            
            f.write(f"\nRANGOS DE COORDENADAS:\n")
            f.write(f"- Latitud: {df['latitud'].min():.6f} a {df['latitud'].max():.6f}\n")
            f.write(f"- Longitud: {df['longitud'].min():.6f} a {df['longitud'].max():.6f}\n")
            
            f.write(f"\nCOLUMNAS GENERADAS ({len(df.columns)}):\n")
            for col in df.columns:
                f.write(f"- {col}\n")

        logger.info("=== ETL COMPLETADO EXITOSAMENTE ===")
        logger.info(f"Archivo principal: {output_file}")
        logger.info(f"Reporte de calidad: {reporte_file}")
        logger.info(f"Registros procesados: {len(df)}/{registros_iniciales} ({calidad_stats['tasa_retencion']:.1f}%)")
        logger.info(f"Reportes alta prioridad: {reportes_alta_prioridad}")
        
        return output_file

    except Exception as e:
        logger.error(f"Error en ETL: {str(e)}")
        raise

# 🔁 Ejecución directa
if __name__ == "__main__":
    try:
        archivo_generado = ejecutar_etl()
        print(f"\nETL completado exitosamente!")
        print(f"Archivo generado: {archivo_generado}")
    except Exception as e:
        print(f"\nError en ETL: {str(e)}")
        exit(1)