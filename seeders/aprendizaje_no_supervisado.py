import pandas as pd
import numpy as np
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import silhouette_score, calinski_harabasz_score
from sklearn.metrics import silhouette_samples  # 📈 nuevo para histograma de silueta
from sklearn.neighbors import NearestNeighbors
from sklearn.ensemble import RandomForestRegressor 
from sklearn.model_selection import train_test_split  
from sklearn.metrics import mean_absolute_error, r2_score, mean_squared_error  
import matplotlib.pyplot as plt
import joblib
from datetime import datetime, timedelta  
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

# ✅ MOVER ESTAS FUNCIONES ANTES DE LA FUNCIÓN PRINCIPAL
def generar_recomendaciones_inteligentes(predicciones_futuras, analisis_zonas):
    """Sistema de recomendaciones basado en predicciones"""
    recomendaciones = []
    
    for zona_key, predicciones in predicciones_futuras.items():
        zona_id = int(zona_key.split('_')[1])
        zona_info = analisis_zonas.loc[zona_id]
        
        # Calcular tendencia
        reportes_predichos = [p['reportes_predichos'] for p in predicciones]
        tendencia = np.mean(np.diff(reportes_predichos)) if len(reportes_predichos) > 1 else 0
        max_reportes = max(reportes_predichos)
        
        # Generar recomendaciones específicas
        if max_reportes > zona_info['densidad'] * 1.5:  # Aumento significativo esperado
            recomendaciones.append({
                'zona': f'Zona {zona_id}',
                'accion': f'Reforzar atención preventiva - Se esperan {max_reportes} reportes',
                'prioridad': 'ALTA',
                'tipo': 'preventivo',
                'coordenadas': f"({zona_info['lat_centro']:.4f}, {zona_info['lng_centro']:.4f})"
            })
        elif tendencia > 0:  # Tendencia creciente
            recomendaciones.append({
                'zona': f'Zona {zona_id}',
                'accion': f'Monitoreo intensificado - Tendencia creciente detectada',
                'prioridad': 'MEDIA',
                'tipo': 'monitoreo',
                'coordenadas': f"({zona_info['lat_centro']:.4f}, {zona_info['lng_centro']:.4f})"
            })
        elif max_reportes < zona_info['densidad'] * 0.5:  # Mejora esperada
            recomendaciones.append({
                'zona': f'Zona {zona_id}',
                'accion': f'Continuar estrategia actual - Reducción de reportes esperada',
                'prioridad': 'BAJA',
                'tipo': 'mantenimiento',
                'coordenadas': f"({zona_info['lat_centro']:.4f}, {zona_info['lng_centro']:.4f})"
            })
    
    # Ordenar por prioridad
    orden_prioridad = {'ALTA': 3, 'MEDIA': 2, 'BAJA': 1}
    recomendaciones.sort(key=lambda x: orden_prioridad.get(x['prioridad'], 0), reverse=True)
    
    return recomendaciones

def crear_modelo_prediccion_reportes(df_resultados, analisis_zonas, grafico_path_base):
    """
    Modelo SUPERVISADO para predecir cantidad de reportes por zona
    """
    try:
        print(f"\n=== MODELO DE PREDICCIÓN DE REPORTES ===", file=sys.stderr)
        
        if analisis_zonas.empty:
            print("❌ No hay zonas críticas para entrenar el modelo predictivo", file=sys.stderr)
            return None
        
        # ==========================================
        # PREPARAR DATOS PARA PREDICCIÓN
        # ==========================================
        
        # Crear dataset temporal por zona
        datos_prediccion = []
        
        # Agrupar por zona y período temporal
        for zona_id in analisis_zonas.index:
            zona_reportes = df_resultados[df_resultados['cluster'] == zona_id].copy()
            
            if 'fecha_creacion' in zona_reportes.columns:
                zona_reportes['fecha_creacion'] = pd.to_datetime(zona_reportes['fecha_creacion'])
                
                # Agrupar por semana para crear series temporales
                zona_reportes.set_index('fecha_creacion', inplace=True)
                reportes_semanales = zona_reportes.resample('W').agg({
                    'latitud': 'count',  # Cantidad de reportes
                    'categoria_id': lambda x: x.mode().iloc[0] if len(x.mode()) > 0 else 1,
                    'estado': lambda x: x.mode().iloc[0] if len(x.mode()) > 0 else 'nuevo'
                }).rename(columns={'latitud': 'num_reportes'})
                
                for fecha, row in reportes_semanales.iterrows():
                    datos_prediccion.append({
                        'zona_id': zona_id,
                        'semana': fecha.isocalendar()[1],
                        'mes': fecha.month,
                        'dia_año': fecha.dayofyear,
                        'categoria_dominante': row['categoria_id'],
                        'lat_centro': analisis_zonas.loc[zona_id, 'lat_centro'],
                        'lng_centro': analisis_zonas.loc[zona_id, 'lng_centro'],
                        'densidad_zona': analisis_zonas.loc[zona_id, 'densidad'],
                        'num_reportes': row['num_reportes']  # VARIABLE OBJETIVO
                    })
        
        if len(datos_prediccion) < 10:
            print("❌ Insuficientes datos temporales para predicción", file=sys.stderr)
            return None
        
        df_pred = pd.DataFrame(datos_prediccion)
        
        # ==========================================
        # INGENIERÍA DE CARACTERÍSTICAS TEMPORALES
        # ==========================================
        
        # Características cíclicas (importante para patrones temporales)
        df_pred['semana_sin'] = np.sin(2 * np.pi * df_pred['semana'] / 52)
        df_pred['semana_cos'] = np.cos(2 * np.pi * df_pred['semana'] / 52)
        df_pred['mes_sin'] = np.sin(2 * np.pi * df_pred['mes'] / 12)
        df_pred['mes_cos'] = np.cos(2 * np.pi * df_pred['mes'] / 12)
        
        # Features geográficas y de contexto
        features_cols = [
            'semana_sin', 'semana_cos', 'mes_sin', 'mes_cos',
            'lat_centro', 'lng_centro', 'densidad_zona', 'categoria_dominante'
        ]
        
        X = df_pred[features_cols]
        y = df_pred['num_reportes']
        
        # ==========================================
        # ENTRENAR MODELO PREDICTIVO
        # ==========================================
        
        if len(X) < 4:
            print("❌ Insuficientes registros para división train/test", file=sys.stderr)
            return None
        
        # División temporal (más realista que aleatoria)
        split_point = int(len(X) * 0.8)
        X_train, X_test = X.iloc[:split_point], X.iloc[split_point:]
        y_train, y_test = y.iloc[:split_point], y.iloc[split_point:]
        
        # Modelo ensemble (robusto para pocos datos)
        modelo_pred = RandomForestRegressor(
            n_estimators=50,
            max_depth=5,
            min_samples_split=2,
            random_state=42
        )
        
        modelo_pred.fit(X_train, y_train)
        
        # ==========================================
        # VALIDACIÓN Y MÉTRICAS
        # ==========================================
        
        y_pred = modelo_pred.predict(X_test)
        mae = mean_absolute_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred) if len(y_test) > 1 else 0.0
        
        print(f"🎯 Modelo predictivo entrenado:", file=sys.stderr)
        print(f"   MAE: {mae:.2f} reportes", file=sys.stderr)
        print(f"   R²: {r2:.3f}", file=sys.stderr)
        print(f"   Precisión: {max(0, (1 - mae/y.mean()))*100:.1f}%", file=sys.stderr)
        
        # ==========================================
        # 📈 GRÁFICAS (SUPERVISADO) — 3 gráficos
        # ==========================================
        try:
            os.makedirs("graficos", exist_ok=True)
            base_dir = os.path.dirname(grafico_path_base) if grafico_path_base else "graficos"
            timestamp_pred = datetime.now().strftime('%Y%m%d_%H%M%S')
            
            # 1) Predicho vs Real
            plt.figure(figsize=(7,6))
            plt.scatter(y_test, y_pred, alpha=0.7, edgecolors='white', linewidth=0.4)
            min_v = min(np.min(y_test), np.min(y_pred))
            max_v = max(np.max(y_test), np.max(y_pred))
            plt.plot([min_v, max_v], [min_v, max_v], linestyle='--')
            plt.title('Predicho vs Real (Regresión)')
            plt.xlabel('Real')
            plt.ylabel('Predicho')
            plt.grid(True, alpha=0.2)
            path_pred_vs_real = os.path.join(base_dir, f"sup_pred_vs_real_{timestamp_pred}.png")
            plt.tight_layout(); plt.savefig(path_pred_vs_real, dpi=300, bbox_inches='tight', facecolor='white'); plt.close()

            # 2) Histograma de residuales
            resid = y_test - y_pred
            plt.figure(figsize=(7,5))
            plt.hist(resid, bins=20, alpha=0.85)
            plt.title('Histograma de Residuales')
            plt.xlabel('Residual (Real - Predicho)')
            plt.ylabel('Frecuencia')
            plt.grid(True, alpha=0.2)
            path_resid = os.path.join(base_dir, f"sup_residuals_{timestamp_pred}.png")
            plt.tight_layout(); plt.savefig(path_resid, dpi=300, bbox_inches='tight', facecolor='white'); plt.close()

            # 3) Importancia de características
            if hasattr(modelo_pred, "feature_importances_"):
                importancias = modelo_pred.feature_importances_
                order = np.argsort(importancias)[::-1]
                plt.figure(figsize=(8,5))
                plt.bar(range(len(importancias)), importancias[order], tick_label=np.array(features_cols)[order])
                plt.title('Importancia de Características (RandomForest)')
                plt.xticks(rotation=45, ha='right')
                plt.ylabel('Importancia')
                plt.grid(True, axis='y', alpha=0.2)
                path_imp = os.path.join(base_dir, f"sup_feature_importance_{timestamp_pred}.png")
                plt.tight_layout(); plt.savefig(path_imp, dpi=300, bbox_inches='tight', facecolor='white'); plt.close()
        except Exception as e_plot_sup:
            print(f"⚠️ Error generando gráficas supervisado: {str(e_plot_sup)}", file=sys.stderr)

        # ==========================================
        # GENERAR PREDICCIONES Y RECOMENDACIONES
        # ==========================================
        
        # Predecir próximas 4 semanas para cada zona
        predicciones_futuras = {}
        
        for zona_id in analisis_zonas.index:
            zona_info = analisis_zonas.loc[zona_id]
            predicciones_zona = []
            
            # Obtener contexto actual de la zona
            categoria_dom = df_pred[df_pred['zona_id'] == zona_id]['categoria_dominante'].mode()
            categoria_dom = categoria_dom.iloc[0] if len(categoria_dom) > 0 else 1
            
            for semana_futura in range(1, 5):  # Próximas 4 semanas
                fecha_futura = datetime.now() + timedelta(weeks=semana_futura)
                
                X_futuro = pd.DataFrame([{
                    'semana_sin': np.sin(2 * np.pi * fecha_futura.isocalendar()[1] / 52),
                    'semana_cos': np.cos(2 * np.pi * fecha_futura.isocalendar()[1] / 52),
                    'mes_sin': np.sin(2 * np.pi * fecha_futura.month / 12),
                    'mes_cos': np.cos(2 * np.pi * fecha_futura.month / 12),
                    'lat_centro': zona_info['lat_centro'],
                    'lng_centro': zona_info['lng_centro'],
                    'densidad_zona': zona_info['densidad'],
                    'categoria_dominante': categoria_dom
                }])
                
                pred_reportes = modelo_pred.predict(X_futuro)[0]
                predicciones_zona.append({
                    'semana': semana_futura,
                    'fecha': fecha_futura.strftime('%Y-%m-%d'),
                    'reportes_predichos': max(0, round(pred_reportes))
                })
            
            predicciones_futuras[f'zona_{zona_id}'] = predicciones_zona

            
        
        # ==========================================
        # SISTEMA DE RECOMENDACIONES
        # ==========================================
        
        recomendaciones = generar_recomendaciones_inteligentes(predicciones_futuras, analisis_zonas)
        
        print(f"\n📋 RECOMENDACIONES GENERADAS:", file=sys.stderr)
        for rec in recomendaciones[:3]:  # Top 3
            print(f"   🔸 {rec['accion']}", file=sys.stderr)
            print(f"     Zona: {rec['zona']}, Prioridad: {rec['prioridad']}", file=sys.stderr)
        
        # Guardar modelo predictivo
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        modelo_pred_path = f"modelos/prediccion_reportes_{timestamp}.joblib"
        
        joblib.dump({
            'modelo_prediccion': modelo_pred,
            'feature_names': features_cols,
            'predicciones_futuras': predicciones_futuras,
            'recomendaciones': recomendaciones,
            'metricas': {'mae': mae, 'r2': r2},
            'metadata': {
                'fecha_entrenamiento': timestamp,
                'tipo': 'prediccion_reportes_v1.0'
            }
        }, modelo_pred_path)
        
        print(f"✅ Modelo predictivo guardado: {modelo_pred_path}", file=sys.stderr)
        
        return {
            'modelo_path': modelo_pred_path,
            'predicciones': predicciones_futuras,
            'recomendaciones': recomendaciones,
            'metricas': {'mae': mae, 'r2': r2}
        }
        
    except Exception as e:
        print(f"❌ Error en modelo predictivo: {str(e)}", file=sys.stderr)
        print(f"📋 Traceback: {traceback.format_exc()}", file=sys.stderr)
        return None

# ✅ AHORA SÍ LA FUNCIÓN PRINCIPAL (después de las funciones auxiliares)
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
        log_print(f"[ETAPA 1/7] Cargando y validando datos...")
        
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
        log_print("[ETAPA 2/7] Generando características avanzadas...")
        
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
        log_print("[ETAPA 3/7] Optimizando parámetros...")
        
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
        log_print("[ETAPA 4/7] Ejecutando clustering con validación...")
        
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
        log_print("[ETAPA 5/7] Analizando resultados...")
        
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
        log_print("[ETAPA 6/7] Generando visualización y guardando modelo...")

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
                'version': 'hibrido_v2.1',
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

        # Generar visualización completa - PASAR n_clusters como parámetro
        grafico_path = os.path.join("graficos", f"zonas_criticas_avanzado_{timestamp}.png")
        generar_visualizacion_completa(df_resultados, analisis_zonas, n_clusters, grafico_path)
        log_print(f"✓ Visualización completa generada: {grafico_path}")

        # 📈 EXTRA: 2 gráficas adicionales
        try:
            # 1) Tamaños de clúster (incluye ruido)
            counts = df_resultados['cluster'].value_counts().sort_index()
            plt.figure(figsize=(8,5))
            counts.plot(kind='bar')
            plt.title('Tamaño de Clúster (incluye -1=ruido)')
            plt.xlabel('Cluster ID')
            plt.ylabel('Número de reportes')
            plt.grid(True, axis='y', alpha=0.2)
            path_cluster_sizes = os.path.join("graficos", f"zonas_cluster_sizes_{timestamp}.png")
            plt.tight_layout(); plt.savefig(path_cluster_sizes, dpi=300, bbox_inches='tight', facecolor='white'); plt.close()

            # 2) Histograma de siluetas (solo puntos en clústeres válidos)
            mask_valid = df_resultados['cluster'] != -1
            if n_clusters > 1 and mask_valid.any():
                sil_vals = silhouette_samples(features_scaled[mask_valid.values], df_resultados.loc[mask_valid, 'cluster'].values)
                plt.figure(figsize=(8,5))
                plt.hist(sil_vals, bins=20, alpha=0.85)
                plt.title('Distribución de Silhouette (solo clústeres válidos)')
                plt.xlabel('Silhouette')
                plt.ylabel('Frecuencia')
                plt.grid(True, alpha=0.2)
                path_sil = os.path.join("graficos", f"zonas_silhouette_{timestamp}.png")
                plt.tight_layout(); plt.savefig(path_sil, dpi=300, bbox_inches='tight', facecolor='white'); plt.close()
        except Exception as e_unsup_plot:
            log_print(f"⚠️ Error generando gráficas adicionales (no supervisado): {str(e_unsup_plot)}")

        log_print(f"\n=== ENTRENAMIENTO COMPLETADO EXITOSAMENTE ===")
        log_print(f"Zonas críticas detectadas: {n_clusters}")
        log_print(f"Calidad del modelo: {best_score:.3f}")
        log_print(f"Cobertura de reportes: {(len(zonas_criticas)/len(df_resultados)*100):.1f}%")

        # ==========================================
        # ✅ ETAPA 7: MODELO PREDICTIVO HÍBRIDO INTEGRADO
        # ==========================================
        if not analisis_zonas.empty and len(df_resultados) > 50:  # Solo si hay suficientes datos
            log_print("\n[ETAPA 7/7] Generando predicciones y recomendaciones híbridas...")
            
            try:
                resultado_prediccion = crear_modelo_prediccion_reportes(
                    df_resultados, analisis_zonas, grafico_path
                )
                
                if resultado_prediccion:
                    log_print(f"✅ Modelo predictivo integrado exitosamente")
                    log_print(f"   MAE: {resultado_prediccion['metricas']['mae']:.2f} reportes")
                    log_print(f"   R²: {resultado_prediccion['metricas']['r2']:.3f}")
                    log_print(f"   Predicciones generadas para {len(resultado_prediccion['predicciones'])} zonas")
                    log_print(f"   Recomendaciones: {len(resultado_prediccion['recomendaciones'])}")
                    
                    # Agregar predicciones a las métricas principales
                    metricas_validacion['prediccion'] = resultado_prediccion['metricas'] 
                    metricas_validacion['zonas_con_prediccion'] = len(resultado_prediccion['predicciones'])
                    metricas_validacion['total_recomendaciones'] = len(resultado_prediccion['recomendaciones'])
                    
                    # Actualizar el modelo_data con predicciones
                    modelo_data['modelo_prediccion'] = {
                        'modelo_path': resultado_prediccion['modelo_path'],
                        'predicciones_futuras': resultado_prediccion['predicciones'],
                        'recomendaciones': resultado_prediccion['recomendaciones'],
                        'metricas_prediccion': resultado_prediccion['metricas']
                    }
                    
                    # Agregar flag de modelo híbrido
                    modelo_data['metadata']['es_modelo_hibrido'] = True
                    modelo_data['metadata']['version'] = 'hibrido_v2.1'
                    
                    # Re-guardar modelo completo con predicciones
                    joblib.dump(modelo_data, modelo_path)
                    log_print(f"✅ Modelo híbrido completo guardado: {modelo_path}")
                    
                    # Mostrar resumen de recomendaciones principales
                    log_print(f"\n📋 TOP RECOMENDACIONES:")
                    for i, rec in enumerate(resultado_prediccion['recomendaciones'][:3], 1):
                        log_print(f"   {i}. [{rec['prioridad']}] {rec['accion']}")
                        log_print(f"      Zona: {rec['zona']} - {rec['coordenadas']}")
                
                else:
                    log_print("⚠️ No se pudo generar el modelo predictivo")
                    modelo_data['metadata']['es_modelo_hibrido'] = False
                    
            except Exception as e:
                log_print(f"⚠️ Error en modelo predictivo integrado: {str(e)}")
                log_print(f"   Continuando con modelo solo clustering...")
                modelo_data['metadata']['es_modelo_hibrido'] = False
                modelo_data['metadata']['error_prediccion'] = str(e)

        else:
            log_print(f"\n[INFO] Saltando modelo predictivo:")
            if analisis_zonas.empty:
                log_print(f"   - No hay zonas críticas detectadas")
            if len(df_resultados) <= 50:
                log_print(f"   - Insuficientes datos: {len(df_resultados)} (mín. 50)")
            
            modelo_data['metadata']['es_modelo_hibrido'] = False
            modelo_data['metadata']['razon_no_hibrido'] = "Datos insuficientes o sin zonas críticas"

        # ✅ GUARDAR MODELO CON TODAS LAS MÉTRICAS ACTUALIZADAS
        joblib.dump(modelo_data, modelo_path)
        log_print(f"✅ Modelo completo guardado: {modelo_path}")

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
            "version": "hibrido_v2.1"
        }
        print(json.dumps(resultado))
        
    except Exception as e:
        resultado_error = {
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc(),
            "version": "hibrido_v2.1"
        }
        print(json.dumps(resultado_error))
        sys.exit(1)