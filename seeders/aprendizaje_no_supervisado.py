import pandas as pd
import numpy as np
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import silhouette_score, calinski_harabasz_score
from sklearn.neighbors import NearestNeighbors
import matplotlib.pyplot as plt
import joblib
from datetime import datetime
import seaborn as sns
import os
import json
import traceback
import sys
from collections import Counter
import warnings
warnings.filterwarnings('ignore')

def generar_visualizacion_completa(df_resultados, analisis_zonas, n_clusters, grafico_path):
    """Versión minimalista - solo mapa de zonas críticas"""
    # Crear figura con un solo gráfico más grande
    fig, ax = plt.subplots(1, 1, figsize=(12, 8))
    fig.suptitle(f'Zonas Críticas Detectadas: {n_clusters}', fontsize=16, fontweight='bold')
    
    if not df_resultados.empty:
        # Scatter plot principal con todos los reportes coloreados por cluster
        scatter = ax.scatter(
            df_resultados['longitud'],
            df_resultados['latitud'],
            c=df_resultados['cluster'],
            cmap='viridis',  # Colormap más profesional
            s=50,  # Tamaño de puntos
            alpha=0.7,
            edgecolors='white',
            linewidth=0.3
        )
        
        # Marcar centros de zonas críticas si existen
        if not analisis_zonas.empty:
            ax.scatter(
                analisis_zonas['lng_centro'], 
                analisis_zonas['lat_centro'],
                marker='*',  # Estrella para centros
                s=400,  # Más grandes para destacar
                color='red',
                edgecolors='black',
                linewidth=2,
                label='Centros de Zonas Críticas',
                zorder=5  # Asegurar que esté encima
            )
            
            # Etiquetas simples para cada zona
            for idx, zona in analisis_zonas.iterrows():
                ax.annotate(
                    f'Z{idx}', 
                    (zona['lng_centro'], zona['lat_centro']),
                    xytext=(5, 5), 
                    textcoords='offset points',
                    fontsize=10, 
                    fontweight='bold',
                    color='white',
                    bbox=dict(boxstyle='circle,pad=0.3', facecolor='red', alpha=0.8)
                )
        
        # Configuración del gráfico
        ax.set_title('Mapa de Reportes de Alta Prioridad', fontsize=14, pad=20)
        ax.set_xlabel('Longitud', fontsize=12)
        ax.set_ylabel('Latitud', fontsize=12)
        
        # Colorbar para identificar clusters
        cbar = plt.colorbar(scatter, ax=ax, shrink=0.8)
        cbar.set_label('Cluster ID (-1 = Ruido)', fontsize=10)
        
        # Leyenda si hay centros
        if not analisis_zonas.empty:
            ax.legend(loc='upper right', fontsize=10)
        
        # Grid sutil
        ax.grid(True, alpha=0.2)
        
        # Información básica en la esquina
        n_reportes_en_zonas = len(df_resultados[df_resultados['cluster'] != -1])
        cobertura = (n_reportes_en_zonas / len(df_resultados) * 100) if len(df_resultados) > 0 else 0
        
        info_text = f"Reportes: {len(df_resultados):,} | Zonas: {n_clusters} | Cobertura: {cobertura:.1f}%"
        ax.text(
            0.02, 0.02, info_text, 
            transform=ax.transAxes, 
            fontsize=9,
            bbox=dict(boxstyle='round,pad=0.3', facecolor='white', alpha=0.8)
        )
    else:
        ax.text(0.5, 0.5, 'No hay datos para mostrar', ha='center', va='center', fontsize=16)
        ax.set_title('Sin datos disponibles')
    
    plt.tight_layout()
    plt.savefig(grafico_path, dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()

def entrenar_modelo_zonas_criticas_avanzado(input_csv, auto_params=True, eps=None, min_samples=None, verbose=True):
    """
    Modelo avanzado de detección de zonas críticas con:
    - Ingeniería de características avanzada
    - Optimización automática de parámetros
    - Validación de calidad con métricas
    - Análisis temporal y categórico
    - Visualización completa
    """

    def log_print(mensaje):
        """Imprime solo si verbose=True, y envía a stderr para no interferir con JSON"""
        if verbose:
            print(mensaje, file=sys.stderr)

    try:
        log_print(f"\n=== MODELO AVANZADO DE DETECCIÓN DE ZONAS CRÍTICAS ===")
        
        # ==========================================
        # ETAPA 1: CARGA Y VALIDACIÓN DE DATOS
        # ==========================================
        log_print(f"[ETAPA 1/6] Cargando y validando datos...")
        
        if not os.path.exists(input_csv):
            raise FileNotFoundError(f"Archivo no encontrado: {input_csv}")

        df = pd.read_csv(input_csv)
        log_print(f"✓ Datos cargados. Total de registros: {len(df)}")

        if df.empty:
            raise ValueError("El archivo CSV está vacío")
        
        # Validar columnas requeridas
        columnas_requeridas = ['latitud', 'longitud', 'prioridad']
        columnas_faltantes = [col for col in columnas_requeridas if col not in df.columns]
        if columnas_faltantes:
            raise ValueError(f"Columnas faltantes: {columnas_faltantes}")
        
        # Filtrar reportes de alta prioridad
        df_alta = df[df['prioridad'] == 'alta'].copy()
        log_print(f"✓ Reportes de alta prioridad: {len(df_alta)}")
        
        if len(df_alta) < 10:
            raise ValueError(f"Insuficientes reportes de alta prioridad: {len(df_alta)} (mínimo 10)")

        # Limpiar coordenadas inválidas
        df_alta = df_alta[
            (df_alta['latitud'].notna()) & 
            (df_alta['longitud'].notna()) &
            (df_alta['latitud'] != 'Latitud no especificada') &
            (df_alta['longitud'] != 'Longitud no especificada')
        ].copy()
        
        # Convertir a numérico
        df_alta['latitud'] = pd.to_numeric(df_alta['latitud'], errors='coerce')
        df_alta['longitud'] = pd.to_numeric(df_alta['longitud'], errors='coerce')
        df_alta = df_alta.dropna(subset=['latitud', 'longitud'])
        
        log_print(f"✓ Datos limpios: {len(df_alta)} reportes válidos")

        # ==========================================
        # ETAPA 2: INGENIERÍA DE CARACTERÍSTICAS AVANZADA
        # ==========================================
        log_print("[ETAPA 2/6] Generando características avanzadas...")
        
        # Coordenadas básicas (más importantes)
        df_features = df_alta[['latitud', 'longitud']].copy()
        
        # Características temporales
        if 'fecha_creacion' in df_alta.columns:
            df_alta['fecha_creacion'] = pd.to_datetime(df_alta['fecha_creacion'], errors='coerce')
            df_features['hora_reporte'] = df_alta['fecha_creacion'].dt.hour
            df_features['dia_semana'] = df_alta['fecha_creacion'].dt.dayofweek
            df_features['mes'] = df_alta['fecha_creacion'].dt.month
            
            # Características de temporalidad (normalizado 0-1)
            df_features['es_horario_laboral'] = ((df_features['hora_reporte'] >= 8) & 
                                               (df_features['hora_reporte'] <= 18)).astype(int)
            df_features['es_fin_semana'] = (df_features['dia_semana'] >= 5).astype(int)
        
        # Codificar categorías si existe
        if 'categoria_id' in df_alta.columns:
            df_alta['categoria_id'] = pd.to_numeric(df_alta['categoria_id'], errors='coerce').fillna(0)
            le_categoria = LabelEncoder()
            df_features['categoria_encoded'] = le_categoria.fit_transform(df_alta['categoria_id'])
        
        # Codificar estados si existe
        if 'estado' in df_alta.columns:
            le_estado = LabelEncoder()
            df_features['estado_encoded'] = le_estado.fit_transform(df_alta['estado'].fillna('nuevo'))
        
        # Densidad local de reportes (muy importante para clustering)
        coords_temp = df_features[['latitud', 'longitud']].values
        k_neighbors = min(10, len(coords_temp) - 1)
        if k_neighbors > 0:
            nbrs = NearestNeighbors(n_neighbors=k_neighbors, radius=0.01).fit(coords_temp)
            distances, indices = nbrs.kneighbors(coords_temp)
            df_features['densidad_local'] = np.mean(distances, axis=1)
            df_features['num_vecinos_cercanos'] = np.sum(distances < 0.005, axis=1)  # Vecinos muy cercanos
        
        # Características geográficas
        centro_ciudad = [df_features['latitud'].mean(), df_features['longitud'].mean()]
        df_features['distancia_centro'] = np.sqrt(
            (df_features['latitud'] - centro_ciudad[0])**2 + 
            (df_features['longitud'] - centro_ciudad[1])**2
        )
        
        # Características de dispersión espacial
        df_features['lat_normalizada'] = (df_features['latitud'] - df_features['latitud'].min()) / (df_features['latitud'].max() - df_features['latitud'].min())
        df_features['lng_normalizada'] = (df_features['longitud'] - df_features['longitud'].min()) / (df_features['longitud'].max() - df_features['longitud'].min())
        
        log_print(f"✓ Características generadas: {df_features.shape[1]} variables")
        
        # Normalización robusta
        scaler = StandardScaler()
        features_scaled = scaler.fit_transform(df_features)
        log_print(f"✓ Características normalizadas")

        # ==========================================
        # ETAPA 3: OPTIMIZACIÓN AUTOMÁTICA DE PARÁMETROS
        # ==========================================
        log_print("[ETAPA 3/6] Optimizando parámetros...")
        
        if auto_params:
            # Método k-distance para encontrar eps óptimo
            k = min(max(4, len(features_scaled) // 50), 15)  # k adaptativo
            nbrs = NearestNeighbors(n_neighbors=k).fit(features_scaled)
            distances, indices = nbrs.kneighbors(features_scaled)
            k_distances = np.sort(distances[:, k-1], axis=0)
            
            # Detectar el "codo" usando percentiles
            eps_candidates = [
                np.percentile(k_distances, 85),
                np.percentile(k_distances, 90),
                np.percentile(k_distances, 95)
            ]
            
            min_samples_candidates = [
                max(3, len(features_scaled) // 100),
                max(5, len(features_scaled) // 50),
                max(7, len(features_scaled) // 30)
            ]
            
            log_print(f"✓ Candidatos eps: {[f'{x:.4f}' for x in eps_candidates]}")
            log_print(f"✓ Candidatos min_samples: {min_samples_candidates}")
        else:
            eps_candidates = [eps or 0.5]
            min_samples_candidates = [min_samples or 5]
            log_print(f"✓ Parámetros manuales: eps={eps_candidates[0]}, min_samples={min_samples_candidates[0]}")

        # ==========================================
        # ETAPA 4: CLUSTERING CON VALIDACIÓN
        # ==========================================
        log_print("[ETAPA 4/6] Ejecutando clustering con validación...")
        
        best_score = -1
        best_labels = None
        best_params = None
        best_dbscan = None
        resultados_pruebas = []
        
        # Probar todas las combinaciones
        for test_eps in eps_candidates:
            for test_min_samples in min_samples_candidates:
                try:
                    dbscan_test = DBSCAN(eps=test_eps, min_samples=test_min_samples, metric='euclidean')
                    labels_test = dbscan_test.fit_predict(features_scaled)
                    
                    n_clusters_test = len(set(labels_test)) - (1 if -1 in labels_test else 0)
                    n_noise_test = list(labels_test).count(-1)
                    
                    # Validar que sea una solución viable
                    if n_clusters_test >= 1 and n_clusters_test <= len(features_scaled) // 3:
                        if n_clusters_test == 1:
                            # Solo un cluster - usar métrica simple
                            score = 1.0 - (n_noise_test / len(labels_test))
                        else:
                            # Múltiples clusters - usar silhouette
                            try:
                                score = silhouette_score(features_scaled, labels_test)
                            except:
                                score = 0.0
                        
                        resultado = {
                            'eps': test_eps,
                            'min_samples': test_min_samples,
                            'n_clusters': n_clusters_test,
                            'n_noise': n_noise_test,
                            'score': score
                        }
                        resultados_pruebas.append(resultado)
                        
                        # Actualizar mejor resultado
                        if score > best_score:
                            best_score = score
                            best_labels = labels_test
                            best_params = (test_eps, test_min_samples)
                            best_dbscan = dbscan_test
                            
                except Exception as e:
                    log_print(f"  Error con eps={test_eps:.4f}, min_samples={test_min_samples}: {str(e)}")
                    continue
        
        # Fallback si no se encontró ninguna solución
        if best_labels is None:
            log_print("  ⚠️  Aplicando configuración fallback...")
            fallback_eps = 0.5
            fallback_min_samples = max(3, min(10, len(features_scaled) // 20))
            
            best_dbscan = DBSCAN(eps=fallback_eps, min_samples=fallback_min_samples)
            best_labels = best_dbscan.fit_predict(features_scaled)
            best_params = (fallback_eps, fallback_min_samples)
            best_score = 0.0

        n_clusters = len(set(best_labels)) - (1 if -1 in best_labels else 0)
        n_noise = list(best_labels).count(-1)
        
        log_print(f"✓ Mejor configuración encontrada:")
        log_print(f"  - Parámetros: eps={best_params[0]:.4f}, min_samples={best_params[1]}")
        log_print(f"  - Zonas críticas detectadas: {n_clusters}")
        log_print(f"  - Reportes aislados: {n_noise}")
        log_print(f"  - Score de calidad: {best_score:.3f}")

        # ==========================================
        # ETAPA 5: ANÁLISIS DETALLADO DE RESULTADOS
        # ==========================================
        log_print("[ETAPA 5/6] Analizando resultados...")
        
        # Agregar resultados al dataframe original
        df_resultados = df_alta.copy()
        df_resultados['cluster'] = best_labels
        df_resultados['es_zona_critica'] = df_resultados['cluster'] != -1
        
        # Análisis detallado por zona crítica
        zonas_criticas = df_resultados[df_resultados['es_zona_critica']]
        
        if not zonas_criticas.empty:
            # Estadísticas básicas por cluster
            stats_basicos = zonas_criticas.groupby('cluster').agg({
                'latitud': ['mean', 'std', 'min', 'max', 'count'],
                'longitud': ['mean', 'std', 'min', 'max'],
            }).round(6)
            
            # Análisis adicional si hay más columnas
            stats_adicionales = {}
            if 'categoria_id' in zonas_criticas.columns:
                stats_adicionales['categoria_dominante'] = zonas_criticas.groupby('cluster')['categoria_id'].agg(
                    lambda x: Counter(x).most_common(1)[0][0] if len(x) > 0 else None
                )
            
            if 'estado' in zonas_criticas.columns:
                stats_adicionales['estado_dominante'] = zonas_criticas.groupby('cluster')['estado'].agg(
                    lambda x: Counter(x).most_common(1)[0][0] if len(x) > 0 else None
                )
            
            if 'fecha_creacion' in zonas_criticas.columns:
                stats_adicionales['periodo'] = zonas_criticas.groupby('cluster')['fecha_creacion'].agg(['min', 'max'])
            
            # Crear DataFrame de análisis final
            analisis_zonas = pd.DataFrame({
                'lat_centro': stats_basicos['latitud']['mean'],
                'lng_centro': stats_basicos['longitud']['mean'],
                'lat_std': stats_basicos['latitud']['std'].fillna(0),
                'lng_std': stats_basicos['longitud']['std'].fillna(0),
                'num_reportes': stats_basicos['latitud']['count'],
                'lat_min': stats_basicos['latitud']['min'],
                'lat_max': stats_basicos['latitud']['max'],
                'lng_min': stats_basicos['longitud']['min'],
                'lng_max': stats_basicos['longitud']['max']
            })
            
            # Agregar estadísticas adicionales
            for key, values in stats_adicionales.items():
                if isinstance(values, pd.DataFrame):
                    for col in values.columns:
                        analisis_zonas[f'{key}_{col}'] = values[col]
                else:
                    analisis_zonas[key] = values
            
            # Calcular métricas de criticidad
            analisis_zonas['densidad'] = analisis_zonas['num_reportes']
            analisis_zonas['area_cobertura'] = (analisis_zonas['lat_max'] - analisis_zonas['lat_min']) * (analisis_zonas['lng_max'] - analisis_zonas['lng_min'])
            analisis_zonas['compacidad'] = analisis_zonas['lat_std'] + analisis_zonas['lng_std']
            
            # Score de criticidad multifactorial
            analisis_zonas['score_criticidad'] = (
                (analisis_zonas['densidad'] / analisis_zonas['densidad'].max()) * 0.5 +  # 50% densidad
                (1 / (analisis_zonas['compacidad'] + 0.001)) * 0.3 +  # 30% compacidad
                (1 / (analisis_zonas['area_cobertura'] + 0.001)) * 0.2   # 20% concentración
            )
            
            # Clasificar nivel de criticidad
            if len(analisis_zonas) > 1:
                try:
                    analisis_zonas['nivel_criticidad'] = pd.qcut(
                        analisis_zonas['score_criticidad'], 
                        q=min(3, len(analisis_zonas)),
                        labels=['Media', 'Alta', 'Crítica'][:min(3, len(analisis_zonas))],
                        duplicates='drop'
                    )
                except:
                    analisis_zonas['nivel_criticidad'] = 'Alta'
            else:
                analisis_zonas['nivel_criticidad'] = 'Alta'
            
            log_print(f"✓ Análisis completado - Resumen por zona:")
            for idx, zona in analisis_zonas.iterrows():
                categoria_info = f", Cat. dominante: {zona.get('categoria_dominante', 'N/A')}" if 'categoria_dominante' in zona else ""
                log_print(f"  Zona {idx}: {zona['num_reportes']} reportes, Centro: ({zona['lat_centro']:.4f}, {zona['lng_centro']:.4f})")
                log_print(f"    Nivel: {zona['nivel_criticidad']}, Score: {zona['score_criticidad']:.2f}{categoria_info}")
        else:
            analisis_zonas = pd.DataFrame()
            log_print("  ℹ️  No se identificaron zonas críticas")

        # ==========================================
        # ETAPA 6: VISUALIZACIÓN Y GUARDADO
        # ==========================================
        log_print("[ETAPA 6/6] Generando visualización y guardando modelo...")

        # Crear directorios y generar timestamp
        os.makedirs("modelos", exist_ok=True)
        os.makedirs("graficos", exist_ok=True)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')

        # Calcular métricas de validación adicionales
        metricas_validacion = {
            'silhouette_score': float(best_score),
            'n_clusters': int(n_clusters),
            'n_noise': int(n_noise),
            'coverage_ratio': float(len(zonas_criticas) / len(df_resultados)) if len(df_resultados) > 0 else 0.0
        }
        
        # Intentar calcular Calinski-Harabasz si es posible
        try:
            if n_clusters > 1:
                metricas_validacion['calinski_harabasz'] = float(
                    calinski_harabasz_score(features_scaled, best_labels)
                )
        except:
            metricas_validacion['calinski_harabasz'] = 0.0

        # Guardar modelo completo
        modelo_path = os.path.join("modelos", f"zonas_criticas_avanzado_{timestamp}.joblib")
        
        modelo_data = {
            'dbscan': best_dbscan,
            'scaler': scaler,
            'feature_names': df_features.columns.tolist(),
            'zonas_criticas': analisis_zonas,
            'resultados_optimizacion': resultados_pruebas,
            'metricas_validacion': metricas_validacion,
            'metadata': {
                'fecha_entrenamiento': timestamp,
                'version': 'avanzado_v2.1',
                'caracteristicas_usadas': len(df_features.columns),
                'parametros_optimizados': auto_params,
                'parametros_finales': {
                    'eps': best_params[0],
                    'min_samples': best_params[1]
                },
                'estadisticas': {
                    'total_reportes_originales': len(df),
                    'reportes_alta_prioridad': len(df_alta),
                    'reportes_procesados': len(df_resultados),
                    'zonas_criticas_detectadas': n_clusters,
                    'reportes_en_zonas_criticas': len(zonas_criticas),
                    'reportes_aislados': n_noise
                }
            }
        }
        
        joblib.dump(modelo_data, modelo_path)
        log_print(f"✓ Modelo completo guardado: {modelo_path}")

        # Generar visualización completa - PASAR n_clusters como parámetro
        grafico_path = os.path.join("graficos", f"zonas_criticas_avanzado_{timestamp}.png")
        generar_visualizacion_completa(df_resultados, analisis_zonas, n_clusters, grafico_path)
        log_print(f"✓ Visualización completa generada: {grafico_path}")

        log_print(f"\n=== ENTRENAMIENTO COMPLETADO EXITOSAMENTE ===")
        log_print(f"Zonas críticas detectadas: {n_clusters}")
        log_print(f"Calidad del modelo: {best_score:.3f}")
        log_print(f"Cobertura de reportes: {(len(zonas_criticas)/len(df_resultados)*100):.1f}%")

        return modelo_path, grafico_path

    except Exception as e:
        error_details = {
            "error": str(e),
            "tipo": type(e).__name__,
            "archivo": input_csv,
            "traceback": traceback.format_exc()
        }
        log_print(f"\n❌ ERROR CRÍTICO:\n{json.dumps(error_details, indent=2)}")
        raise

# Mantener compatibilidad con versión anterior
def entrenar_modelo_zonas_criticas(input_csv, eps=0.01, min_samples=5, verbose=True):
    """Wrapper para compatibilidad con la versión anterior"""
    return entrenar_modelo_zonas_criticas_avanzado(
        input_csv, 
        auto_params=False, 
        eps=eps, 
        min_samples=min_samples, 
        verbose=verbose
    )

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Modelo avanzado de detección de zonas críticas')
    parser.add_argument('input_csv', help='Ruta al archivo CSV de entrada')
    parser.add_argument('--eps', type=float, help='Parámetro eps manual (desactiva optimización automática)')
    parser.add_argument('--min_samples', type=int, help='Parámetro min_samples manual')
    parser.add_argument('--no-auto', action='store_true', help='Desactivar optimización automática de parámetros')
    parser.add_argument('--quiet', action='store_true', help='Ejecutar sin logs verbosos')
    
    args = parser.parse_args()
    
    try:
        # Determinar si usar optimización automática
        usar_auto = not args.no_auto and args.eps is None
        
        modelo_path, grafico_path = entrenar_modelo_zonas_criticas_avanzado(
            args.input_csv,
            auto_params=usar_auto,
            eps=args.eps,
            min_samples=args.min_samples,
            verbose=not args.quiet
        )
        
        resultado = {
            "success": True,
            "modelo_path": modelo_path,
            "grafico_path": grafico_path,
            "version": "avanzado_v2.1"
        }
        print(json.dumps(resultado))
        
    except Exception as e:
        resultado_error = {
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc(),
            "version": "avanzado_v2.1"
        }
        print(json.dumps(resultado_error))
        sys.exit(1)