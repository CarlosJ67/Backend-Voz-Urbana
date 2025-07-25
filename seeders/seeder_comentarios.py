import mysql.connector
import random
import sys
import time
from datetime import datetime, timedelta

# Configuración de la base de datos
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '12345',
    'database': 'voz_urbana',
    'port': 3306
}

# Ampliación masiva de textos base (200+ variaciones)
textos_base = [
    # Reportes de progreso
    "Gracias por reportar este problema, ya está siendo revisado por el equipo correspondiente.",
    "He verificado la situación y confirmo que el problema existe y requiere atención.",
    "El departamento de mantenimiento ha sido notificado sobre esta situación.",
    "Se ha programado una inspección para evaluar la magnitud del daño.",
    "Los materiales necesarios para la reparación ya han sido solicitados.",
    "El personal técnico visitará la zona en las próximas 48 horas.",
    "Se está coordinando con otras dependencias para resolver este problema.",
    "La reparación está programada para realizarse durante el fin de semana.",
    "Se ha asignado presupuesto para atender esta situación de manera prioritaria.",
    "El problema ha sido escalado al supervisor de zona correspondiente.",
    
    # Solicitudes de información
    "¿Podrían proporcionar más detalles sobre el horario en que ocurre este problema?",
    "Necesitamos confirmar la ubicación exacta para proceder con la reparación.",
    "¿Han notado si el problema se agrava durante ciertos días de la semana?",
    "Sería útil conocer si hay otros vecinos afectados por la misma situación.",
    "¿El problema persiste durante todo el día o solo en horarios específicos?",
    "Agradecería si pudieran enviar fotografías adicionales del área afectada.",
    "¿Han intentado reportar esto anteriormente? ¿Cuál fue la respuesta?",
    "¿Consideran que este problema representa un riesgo inmediato para la seguridad?",
    "¿Hay algún número de referencia de reportes anteriores relacionados?",
    "¿Podrían indicar aproximadamente cuándo comenzó a manifestarse este problema?",
    
    # Confirmaciones y actualizaciones
    "Confirmado: el equipo de trabajo ya se encuentra en el sitio realizando las reparaciones.",
    "Actualización: se ha completado el 60% de los trabajos de reparación programados.",
    "El problema ha sido resuelto temporalmente mientras se consiguen los materiales definitivos.",
    "Se ha instalado señalización de seguridad mientras se completan las reparaciones.",
    "Los trabajos fueron suspendidos temporalmente debido a las condiciones climáticas.",
    "Actualización: se requiere autorización adicional para proceder con la reparación completa.",
    "El área ha sido acordonada por seguridad hasta completar los trabajos necesarios.",
    "Se ha restablecido el servicio de manera temporal mientras se planifica la solución definitiva.",
    "Los trabajos de reparación se han extendido debido a complicaciones técnicas imprevistas.",
    "Confirmamos que el problema ha sido completamente resuelto y el área está operativa.",
    
    # Explicaciones técnicas
    "El problema se debe a deterioro normal de la infraestructura por uso y tiempo.",
    "Las lluvias recientes han exacerbado una situación preexistente en la zona.",
    "Se requiere reemplazar completamente la sección dañada, no solo reparar superficialmente.",
    "El problema está relacionado con falta de mantenimiento preventivo en el área.",
    "Las condiciones del subsuelo requieren un enfoque de reparación más especializado.",
    "Se necesita coordinar con servicios públicos para evitar dañar instalaciones subterráneas.",
    "El material original ya no se fabrica, por lo que se usará un equivalente moderno.",
    "La reparación debe realizarse por fases para no interrumpir completamente el tráfico.",
    "Se requiere equipo especializado que actualmente está siendo usado en otra zona.",
    "Las normas de seguridad actuales exigen un procedimiento más complejo que antes.",
    
    # Agradecimientos y reconocimientos
    "Agradecemos su reporte ciudadano, este tipo de participación es muy valiosa.",
    "Gracias por tomarse el tiempo de documentar y reportar esta situación.",
    "Su reporte nos ha permitido identificar un problema que requería atención inmediata.",
    "Valoramos mucho la colaboración de los vecinos para mantener la ciudad en buen estado.",
    "Este reporte es un excelente ejemplo de participación ciudadana responsable.",
    "Gracias por proporcionar fotografías claras que facilitan nuestro trabajo.",
    "Su persistencia al reportar este problema ha resultado en una solución efectiva.",
    "Apreciamos que hayan esperado pacientemente mientras se gestionaba la solución.",
    "Gracias por su comprensión durante el proceso de reparación que causó algunas molestias.",
    "Su reporte ha contribuido a mejorar la seguridad y calidad de vida en la zona.",
    
    # Disculpas y explicaciones
    "Lamentamos las molestias que esta situación ha causado a los residentes del área.",
    "Pedimos disculpas por el retraso en atender este problema reportado anteriormente.",
    "Entendemos la frustración que puede causar la demora en resolver esta situación.",
    "Lamentamos que el problema haya empeorado antes de que pudiéramos intervenir.",
    "Pedimos paciencia mientras coordinamos con diferentes dependencias la solución integral.",
    "Reconocemos que la reparación temporal no ha sido suficiente para resolver el problema completamente.",
    "Lamentamos cualquier inconveniente causado durante el proceso de reparación.",
    "Entendemos la preocupación de los vecinos y estamos trabajando para resolverla pronto.",
    "Pedimos disculpas por la falta de comunicación oportuna sobre el estado de este reporte.",
    "Lamentamos que las condiciones climáticas hayan retrasado los trabajos programados.",
    
    # Instrucciones y recomendaciones
    "Por favor eviten transitar por el área mientras se realizan los trabajos de reparación.",
    "Recomendamos usar rutas alternas hasta que se complete la reparación definitiva.",
    "Por seguridad, mantengan a los niños alejados del área de trabajo.",
    "Pueden reportar cualquier cambio o empeoramiento de la situación al número de emergencias.",
    "Les pedimos que no remuevan las señales de seguridad colocadas en el área.",
    "Por favor reporten inmediatamente si observan actividad sospechosa en la zona de trabajo.",
    "Recomendamos que los peatones usen la acera opuesta hasta completar las reparaciones.",
    "Por favor sean pacientes con las demoras de tráfico durante el horario de trabajo.",
    "Les sugerimos estar atentos a los horarios de trabajo para planificar sus actividades.",
    "Pueden seguir el progreso de este reporte a través del sistema de seguimiento en línea.",
    
    # Coordinación institucional
    "Estamos coordinando con el departamento de tránsito para minimizar las afectaciones.",
    "Se ha contactado a la empresa de servicios públicos para verificar instalaciones subterráneas.",
    "El departamento legal está revisando los permisos necesarios para la reparación completa.",
    "Se está gestionando con el área financiera la aprobación del presupuesto adicional requerido.",
    "Hemos solicitado apoyo técnico especializado de otra dependencia gubernamental.",
    "Se está coordinando con el departamento de medio ambiente por la proximidad al área verde.",
    "El área de comunicaciones preparará un boletín informativo para los vecinos afectados.",
    "Se ha solicitado asesoría técnica externa para garantizar una solución duradera.",
    "Estamos trabajando con el departamento de planeación urbana para prevenir futuros problemas.",
    "Se ha iniciado coordinación con empresas contratistas especializadas en este tipo de reparaciones.",
    
    # Seguimiento y monitoreo
    "Se realizará seguimiento semanal para verificar que la reparación se mantenga en buen estado.",
    "Hemos programado inspecciones regulares para prevenir que el problema se repita.",
    "Se implementará un plan de mantenimiento preventivo para esta zona.",
    "Se ha añadido esta ubicación al programa de monitoreo continuo de infraestructura.",
    "Realizaremos una evaluación posterior en 30 días para verificar la efectividad de la solución.",
    "Se ha creado un expediente de seguimiento para documentar todas las intervenciones futuras.",
    "Se programarán inspecciones adicionales durante la temporada de lluvias.",
    "Se implementará señalización permanente si se determina que es necesaria.",
    "Se ha incluido esta zona en el programa anual de mantenimiento preventivo.",
    "Se realizará una encuesta de satisfacción con los vecinos una vez completados los trabajos.",
    
    # Resultados y conclusiones
    "Los trabajos han sido completados satisfactoriamente y el área está completamente operativa.",
    "La reparación ha demostrado ser efectiva y no se han presentado problemas adicionales.",
    "Se ha logrado una solución integral que aborda tanto el problema inmediato como las causas subyacentes.",
    "Los vecinos han expresado satisfacción con la calidad y rapidez de la reparación realizada.",
    "La intervención ha mejorado significativamente las condiciones de seguridad en la zona.",
    "Se ha documentado el proceso completo para aplicar la misma solución en casos similares.",
    "Los materiales utilizados garantizan una durabilidad superior a la infraestructura original.",
    "La reparación se completó dentro del presupuesto asignado y en el tiempo programado.",
    "Se ha restablecido completamente la funcionalidad del área sin restricciones de uso.",
    "El problema ha sido marcado como resuelto definitivamente en nuestro sistema de seguimiento.",
    
    # Prevención y educación
    "Aprovechamos para recordar la importancia de reportar problemas en etapas tempranas.",
    "Este caso demuestra cómo la participación ciudadana contribuye al mantenimiento urbano.",
    "Recomendamos a los vecinos mantenerse atentos a signos tempranos de deterioro similar.",
    "La detección temprana de estos problemas permite soluciones más económicas y rápidas.",
    "Invitamos a la comunidad a participar en nuestros programas de vigilancia vecinal.",
    "Este tipo de mantenimiento preventivo ayuda a evitar problemas mayores en el futuro.",
    "Agradecemos la paciencia y colaboración de todos durante el proceso de mejora.",
    "La experiencia adquirida en este caso nos ayudará a mejorar nuestros procesos futuros.",
    "Recordamos que todos los ciudadanos pueden contribuir al cuidado de los espacios públicos.",
    "Este caso será usado como ejemplo en nuestros programas de capacitación de personal."
]

def getRandomInt(min_val, max_val):
    """Genera un entero aleatorio entre min y max (inclusivo)"""
    return random.randint(min_val, max_val)

def get_fecha_comentario_por_estado(estado, fecha_reporte):
    """Genera fecha de comentario según estado del reporte (versión mejorada)"""
    if isinstance(fecha_reporte, str):
        fecha_reporte = datetime.strptime(fecha_reporte, "%Y-%m-%d %H:%M:%S")

    oneDay = timedelta(days=1)
    
    if estado == 'nuevo':
        # Últimos 3 días, después de la fecha del reporte
        return fecha_reporte + oneDay * getRandomInt(0, 3)
    elif estado == 'en_proceso':
        # Entre 4 y 14 días después del reporte
        return fecha_reporte + oneDay * getRandomInt(4, 14)
    elif estado == 'resuelto':
        # Entre 15 y 30 días después del reporte
        return fecha_reporte + oneDay * getRandomInt(15, 30)
    elif estado == 'cerrado':
        # Entre 30 y 180 días después del reporte
        return fecha_reporte + oneDay * getRandomInt(30, 180)
    else:
        return fecha_reporte + oneDay * getRandomInt(0, 7)

def get_random_comment(i, offset=0):
    """Sistema de variaciones mejorado"""
    base = random.choice(textos_base)
    
    # Sistema de variaciones como en Node.js
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

def generar_comentarios_lote(total_comentarios=1000000, offset=0):
    # Removida la limitación de 2000 comentarios
    
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor(dictionary=True)

        # Obtener reportes con estado y fecha
        cursor.execute("SELECT id, estado, fecha_creacion FROM reportes")
        reportes = cursor.fetchall()

        cursor.execute("SELECT id FROM usuarios")
        usuarios = cursor.fetchall()

        if not reportes or not usuarios:
            print({
                "message": "No hay reportes o usuarios disponibles."
            })
            return

        # Procesar en lotes para evitar problemas de memoria
        batch_size = 5000  # Reducido para mejor estabilidad
        total_insertados = 0
        
        for batch_start in range(0, total_comentarios, batch_size):
            comentarios = []
            batch_end = min(batch_start + batch_size, total_comentarios)
            
            for i in range(batch_start, batch_end):
                reporte = random.choice(reportes)
                usuario_id = random.choice(usuarios)['id']
                texto = get_random_comment(i, offset)
                fecha = get_fecha_comentario_por_estado(reporte['estado'], reporte['fecha_creacion'])
                
                # Activo: 0 para cerrado, 1 para los demás
                activo = 0 if reporte['estado'] == 'cerrado' else 1

                comentarios.append((
                    reporte['id'],
                    usuario_id,
                    texto,
                    fecha.strftime('%Y-%m-%d %H:%M:%S'),
                    activo
                ))

            # Inserción con reintentos para deadlocks
            max_retries = 3
            for retry in range(max_retries):
                try:
                    insert_query = """
                        INSERT INTO comentarios (reporte_id, usuario_id, texto, fecha_comentario, activo)
                        VALUES (%s, %s, %s, %s, %s)
                    """
                    cursor.executemany(insert_query, comentarios)
                    conn.commit()
                    total_insertados += len(comentarios)
                    print(f"Insertados {total_insertados} comentarios...")
                    break  # Éxito, salir del bucle de reintentos
                except mysql.connector.errors.InternalError as e:
                    if e.errno == 1213 and retry < max_retries - 1:  # Deadlock
                        print(f"Deadlock detectado, reintentando... ({retry + 1}/{max_retries})")
                        time.sleep(random.uniform(0.1, 0.5))
                        conn.rollback()
                    else:
                        raise

        # Estadísticas finales
        cursor.execute("SELECT COUNT(*) as total FROM comentarios")
        total_final = cursor.fetchone()['total']
        
        # Estadísticas por estado
        por_estado = {}
        cursor.execute("""
            SELECT r.estado, COUNT(*) as total 
            FROM comentarios c 
            JOIN reportes r ON c.reporte_id = r.id 
            GROUP BY r.estado
        """)
        for row in cursor.fetchall():
            por_estado[row['estado']] = row['total']
        
        print({
            "message": f"Comentarios generados: {total_insertados}",
            "totalEnBD": total_final,
            "nextOffset": offset + total_comentarios,
            "detalles": {
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

if __name__ == "__main__":
    total_comentarios = int(sys.argv[1]) if len(sys.argv) > 1 else 1000000  # Default 1M
    offset = int(sys.argv[2]) if len(sys.argv) > 2 else 0
    generar_comentarios_lote(total_comentarios, offset)