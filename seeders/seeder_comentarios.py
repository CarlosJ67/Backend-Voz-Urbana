import mysql.connector
import random
from datetime import datetime, timedelta

# Configuración de la base de datos
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '1234',
    'database': 'voz_urbana',
    'port': 3307
}

textos_base = [
  # Comentarios de apoyo
  'Totalmente de acuerdo con este reporte.',
  'Esto es exactamente lo que he estado experimentando también.',
  'Gracias por tomar el tiempo de reportar este problema.',
  'Yo también he notado esta situación en mi área.',
  '¡Finalmente alguien está hablando de esto!',
  'Este problema afecta a más personas de las que creen.',
  'Comparto completamente tu preocupación.',
  'Es bueno saber que no soy el único con este problema.',
  '¿Podemos organizarnos para presionar por una solución?',
  'Voy a compartir este reporte con mis vecinos.',
  
  # Comentarios con preguntas
  '¿Alguien sabe si hay avances en este caso?',
  '¿Qué autoridades son responsables de resolver esto?',
  '¿Hay algún número donde podamos llamar para seguimiento?',
  '¿Se ha presentado este problema en otras zonas?',
  '¿Cuál es el tiempo estimado para una solución?',
  '¿Han considerado crear una petición formal?',
  '¿Alguien tiene contacto con los responsables?',
  '¿Qué podemos hacer como comunidad para ayudar?',
  '¿Hay alguna reunión programada para tratar este tema?',
  '¿Se necesita más evidencia del problema?',
  
  # Comentarios de seguimiento
  'El problema parece estar empeorando con el tiempo.',
  'Hoy pasé por el lugar y sigue igual.',
  'Llevamos demasiado tiempo esperando una solución.',
  '¿Por qué tarda tanto en resolverse esto?',
  'He visto que ya han venido pero no lo arreglaron completamente.',
  'Parece que hicieron un arreglo temporal pero no duró.',
  'La solución anterior no funcionó, necesitamos algo mejor.',
  '¿Cuál es el siguiente paso en este proceso?',
  'Han pasado días desde el último update, ¿alguien sabe algo?',
  'Voy a documentar el progreso con fotos semanales.',
  
  # Comentarios críticos
  'Esto es inaceptable en nuestro vecindario.',
  'Las autoridades no están tomando esto en serio.',
  '¿Hasta cuándo tendremos que soportar esto?',
  'Es frustrante ver cómo ignoran problemas básicos.',
  'Pagamos impuestos para tener servicios de calidad.',
  'Esto representa un peligro para los niños del área.',
  'La respuesta ha sido demasiado lenta.',
  'Necesitamos acciones concretas, no solo promesas.',
  'Esto afecta nuestra calidad de vida diaria.',
  '¿Dónde están nuestros representantes cuando los necesitamos?',
  
  # Comentarios positivos
  '¡Gracias a quien resolvió este problema!',
  'Se nota la mejora después de la intervención.',
  'Aprecio el trabajo que han puesto en esto.',
  'La solución implementada ha sido efectiva.',
  'Finalmente podemos disfrutar de nuestro espacio público.',
  'El equipo de respuesta actuó rápidamente esta vez.',
  'Estoy satisfecho con cómo manejaron la situación.',
  'Esto demuestra que cuando trabajamos juntos logramos resultados.',
  '¡Buen trabajo a todos los involucrados!',
  'La comunicación durante el proceso fue excelente.',
  
  # Comentarios con sugerencias
  'Propongo que hagamos una reunión comunitaria.',
  'Sugiero documentar todo con fotos y videos.',
  'Deberíamos contactar a los medios locales.',
  '¿Qué tal si hacemos una petición firmada?',
  'Podríamos organizar un grupo de vigilancia.',
  'Sugiero reportar esto en múltiples plataformas.',
  'Deberían venir a verlo en [horario específico] cuando es peor.',
  'Propongo soluciones alternativas mientras se resuelve.',
  '¿Han considerado [solución específica]?',
  'Deberíamos establecer plazos concretos.',
  
  # Comentarios informativos
  'El problema comenzó aproximadamente hace [tiempo].',
  'He visto que afecta principalmente a [grupo/área].',
  'Los días [días] es cuando se pone peor.',
  'Entre [horario] es cuando más se nota el problema.',
  'Ya han venido [número] veces pero no lo solucionan.',
  'El problema parece originarse en [ubicación específica].',
  'Cuando llueve, la situación empeora considerablemente.',
  'He notado que [patrón específico].',
  'Esto comenzó después de [evento específico].',
  'Según mi observación, la causa podría ser [causa].',
  
  # Comentarios de experiencia personal
  'A mi familia le ha afectado de esta manera...',
  'Tuve un accidente debido a este problema.',
  'He gastado [cantidad] en reparaciones por esto.',
  'Mi negocio se ha visto afectado por esta situación.',
  'Mis hijos ya no pueden jugar afuera por esto.',
  'He tenido que cambiar mis rutinas debido al problema.',
  'Esto me ha causado [problema específico].',
  'Como [profesión/relevancia], puedo decir que...',
  'Llevo [tiempo] viviendo aquí y nunca había visto esto tan mal.',
  'Como persona con [condición], esto me afecta especialmente.'
]

def get_random_comment(i, offset=0):
    base = random.choice(textos_base)
    variaciones = [
        f'{base}',
        f'{base} #{offset + i + 1}',
        f'[Importante] {base}',
        f'{base} - {datetime.now().year}',
        f'{base} (reportado por vecino)',
        f'Comentario: {base}',
        f'{base} - necesita seguimiento',
        f'Actualización: {base.lower()}',
        f'Nuevo: {base.lower()}',
        f'Respuesta: {base.lower()}'
    ]
    return random.choice(variaciones)

# Fecha de comentario según estado
def get_fecha_comentario_por_estado(estado, fecha_reporte):
    if isinstance(fecha_reporte, str):
        fecha_reporte = datetime.strptime(fecha_reporte, "%Y-%m-%d %H:%M:%S")

    if estado == 'nuevo':
        return fecha_reporte + timedelta(days=random.randint(0, 3))
    elif estado == 'en_proceso':
        return fecha_reporte + timedelta(days=random.randint(4, 14))
    elif estado == 'resuelto':
        return fecha_reporte + timedelta(days=random.randint(15, 30))
    elif estado == 'cerrado':
        return fecha_reporte + timedelta(days=random.randint(30, 180))
    else:
        return fecha_reporte + timedelta(days=random.randint(0, 7))

# Función principal
def generar_comentarios_lote(total_comentarios=2000, offset=0):
    if total_comentarios > 2000:
        print({
            "message": "Máximo 2000 comentarios por petición."
        })
        return

    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT id, estado, fecha_creacion FROM reportes")
        reportes = cursor.fetchall()

        cursor.execute("SELECT id FROM usuarios")
        usuarios = cursor.fetchall()

        if not reportes or not usuarios:
            print({
                "message": "No hay reportes o usuarios disponibles."
            })
            return

        comentarios = []
        for i in range(total_comentarios):
            reporte = random.choice(reportes)
            usuario_id = random.choice(usuarios)['id']
            texto = get_random_comment(i, offset)
            fecha = get_fecha_comentario_por_estado(reporte['estado'], reporte['fecha_creacion'])
            activo = 0 if reporte['estado'] == 'cerrado' else 1

            comentarios.append((
                reporte['id'],
                usuario_id,
                texto,
                fecha.strftime('%Y-%m-%d %H:%M:%S'),
                activo
            ))

        # Inserción masiva
        insert_query = """
            INSERT INTO comentarios (reporte_id, usuario_id, texto, fecha_comentario, activo)
            VALUES (%s, %s, %s, %s, %s)
        """
        cursor.executemany(insert_query, comentarios)
        conn.commit()

        # Estadísticas
        por_estado = {}
        for c in comentarios:
            estado = next(r['estado'] for r in reportes if r['id'] == c[0])
            por_estado[estado] = por_estado.get(estado, 0) + 1

        comentarios_unicos = len(set(c[2].split('#')[0] for c in comentarios))

        print({
            "message": f"Comentarios generados: {len(comentarios)}",
            "nextOffset": offset + total_comentarios,
            "detalles": {
                "comentariosUnicos": comentarios_unicos,
                "porEstado": por_estado
            }
        })

    except mysql.connector.Error as error:
        print({
            "message": "Error al generar comentarios",
            "error": str(error)
        })
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()

# Llamada principal
if __name__ == "__main__":
    import sys

    # Leer argumentos desde la línea de comandos
    total = int(sys.argv[1]) if len(sys.argv) > 1 and sys.argv[1].isdigit() else 100
    offset = int(sys.argv[2]) if len(sys.argv) > 2 and sys.argv[2].isdigit() else 0

    generar_comentarios_lote(total_comentarios=total, offset=offset)