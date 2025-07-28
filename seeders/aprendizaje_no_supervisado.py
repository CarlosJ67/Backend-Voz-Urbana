import pandas as pd
import numpy as np
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import IsolationForest
import matplotlib.pyplot as plt
import joblib
from datetime import datetime
import seaborn as sns
import os
import json
import traceback
import sys

def entrenar_modelo_zonas_criticas(input_csv, eps=0.01, min_samples=5, verbose=True):
    """
    Entrena un modelo para identificar zonas críticas basado en concentración 
    de reportes de alta prioridad.
    """

    def log_print(mensaje):
        """Imprime solo si verbose=True, y envía a stderr para no interferir con JSON"""
        if verbose:
            print(mensaje, file=sys.stderr)  # ← CLAVE: usar stderr en lugar de stdout

    try:
        # Validación inicial de parámetros
        if not isinstance(eps, (int, float)) or eps <= 0:
            raise ValueError("El parámetro eps debe ser un número positivo")
        if not isinstance(min_samples, int) or min_samples <= 0:
            raise ValueError("El parámetro min_samples debe ser un entero positivo")

        log_print(f"\nIniciando entrenamiento con parámetros - eps: {eps}, min_samples: {min_samples}")
        
        # Cargar datos
        log_print(f"[ETAPA 1/4] Cargando datos desde {input_csv}...")
        if not os.path.exists(input_csv):
            raise FileNotFoundError(f"Archivo no encontrado: {input_csv}")

        df = pd.read_csv(input_csv)
        log_print(f" Datos cargados. Total de registros: {len(df)}")

        if df.empty:
            raise ValueError("El archivo CSV está vacío.")
        
        # Filtrar solo reportes de alta prioridad
        df_alta = df[df['prioridad'] == 'alta'].copy()
        log_print(f"  Reportes de alta prioridad: {len(df_alta)}")
        
        if len(df_alta) < min_samples:
            raise ValueError(f"No hay suficientes reportes de alta prioridad (mínimo {min_samples} requeridos, encontrados {len(df_alta)})")
        
        # Preprocesamiento de coordenadas
        log_print("[ETAPA 2/4] Preprocesando coordenadas...")
        coords = df_alta[['latitud', 'longitud']].values
        scaler = StandardScaler()
        coords_scaled = scaler.fit_transform(coords)
        log_print("Coordenadas escaladas")

        # Detección de zonas críticas con DBSCAN
        log_print("[ETAPA 3/4] Identificando zonas críticas con DBSCAN...")
        dbscan = DBSCAN(eps=eps, min_samples=min_samples, metric='euclidean')
        clusters = dbscan.fit_predict(coords_scaled)
        n_clusters = len(set(clusters)) - (1 if -1 in clusters else 0)
        log_print(f" Clusters identificados: {n_clusters}")

        # Detección de anomalías
        log_print("  Identificando anomalías con Isolation Forest...")
        iso_forest = IsolationForest(contamination=0.1, random_state=42)
        anomalias = iso_forest.fit_predict(coords_scaled)
        n_anomalias = sum(anomalias == -1)
        log_print(f"  Anomalías detectadas: {n_anomalias}")

        # Crear dataframe con resultados
        df_resultados = df_alta.copy()
        df_resultados['cluster'] = clusters
        df_resultados['es_anomalia'] = anomalias == -1
        df_resultados['es_zona_critica'] = df_resultados['cluster'] != -1
        
        # Calcular criticidad por zona
        log_print("[ETAPA 4/4] Calculando criticidad por zona...")
        zonas_criticas = df_resultados[df_resultados['es_zona_critica']]
        
        if zonas_criticas.empty:
            criticidad_por_zona = pd.DataFrame()
            log_print("  No se identificaron zonas críticas")
        else:
            criticidad_por_zona = zonas_criticas.groupby('cluster').agg({
                'latitud': 'mean',
                'longitud': 'mean',
                'es_zona_critica': 'count'
            }).rename(columns={'es_zona_critica': 'densidad'})
            
            try:
                densidades = criticidad_por_zona['densidad']
                valores_unicos = densidades.nunique()

                if valores_unicos >= 4:
                    criticidad_por_zona['criticidad'] = pd.qcut(
                        densidades,
                        q=4,
                        duplicates='drop'
                    )
                else:
                    log_print(f"[Advertencia] Solo hay {valores_unicos} valores únicos de densidad. Se asignará criticidad fija.")
                    criticidad_por_zona['criticidad'] = 'media'  # o algún valor por defecto
            except ValueError as e:
                log_print(f"[Error] Falló el cálculo de criticidad: {e}")
                criticidad_por_zona['criticidad'] = 'desconocida'
           
        
        # Guardar modelo y generar visualización
        def generar_visualizacion(df_resultados, criticidad_por_zona, grafico_path):
            plt.figure(figsize=(10, 6))
            sns.scatterplot(
                data=df_resultados,
                x='longitud',
                y='latitud',
                hue='cluster',
                style='es_anomalia',
                palette='tab10',
                alpha=0.6
            )
            plt.title('Zonas Críticas y Anomalías Detectadas')
            plt.xlabel('Longitud')
            plt.ylabel('Latitud')
            plt.legend(loc='best', bbox_to_anchor=(1, 1))
            plt.tight_layout()
            plt.savefig(grafico_path)
            plt.close()


        # Crear directorios necesarios (una sola vez)
        os.makedirs("modelos", exist_ok=True)
        os.makedirs("graficos", exist_ok=True)

        # Generar timestamp único para ambos archivos
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')

        # 1. Guardar el modelo
        modelo_path = os.path.join("modelos", f"modelo_zonas_criticas_{timestamp}.joblib")

        joblib.dump({
            'dbscan': dbscan,
            'isolation_forest': iso_forest,
            'scaler': scaler,
            'zonas_criticas': criticidad_por_zona,
            'metadata': {
                'fecha_entrenamiento': timestamp,
                'parametros': {
                    'eps': eps,
                    'min_samples': min_samples
                },
                'estadisticas': {
                    'total_reportes': len(df),
                    'reportes_alta': len(df_alta),
                    'zonas_criticas': n_clusters,
                    'anomalias': n_anomalias
                }
            }
        }, modelo_path)
        log_print(f"  Modelo guardado en: {modelo_path}")

        # 2. Generar visualización
        grafico_path = os.path.join("graficos", f"zonas_criticas_{timestamp}.png")
        generar_visualizacion(df_resultados, criticidad_por_zona, grafico_path)
        log_print(f"  Gráfico generado en: {grafico_path}")

        # Retornar rutas de ambos archivos
        return modelo_path, grafico_path

    except Exception as e:
        error_details = {
            "error": str(e),
            "tipo": type(e).__name__,
            "archivo": input_csv,
            "parametros": {"eps": eps, "min_samples": min_samples},
            "traceback": traceback.format_exc()
        }
        log_print(f"\n ERROR DETALLADO:\n{json.dumps(error_details, indent=2)}")
        raise
    
# Añade al final del archivo Python:
if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser()
    parser.add_argument('input_csv', help='Ruta al archivo CSV de entrada')
    parser.add_argument('--eps', type=float, default=0.01, help='Parámetro eps para DBSCAN')
    parser.add_argument('--min_samples', type=int, default=5, help='Parámetro min_samples para DBSCAN')
    parser.add_argument('--quiet', action='store_true', help='Ejecutar sin logs verbosos')

    args = parser.parse_args()
    
    try:
        modelo_path, grafico_path = entrenar_modelo_zonas_criticas(
            args.input_csv,
            eps=args.eps,
            min_samples=args.min_samples,
            verbose=not args.quiet
        )
        
        # Devuelve las rutas como JSON para que Node.js pueda parsearlo
        # SOLO imprimir el JSON en stdout (sin logs adicionales)
        resultado = {
            "success": True,
            "modelo_path": modelo_path,
            "grafico_path": grafico_path
        }
        print(json.dumps(resultado))  # ← SOLO esto va a stdout

    except Exception as e:
        resultado_error = {
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc()
        }
        print(json.dumps(resultado_error))  # ← SOLO esto va a stdout
        sys.exit(1)