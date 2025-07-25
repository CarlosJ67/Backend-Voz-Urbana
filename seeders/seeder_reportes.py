import mysql.connector
import random
import time
import sys
from datetime import datetime, timedelta

# Configuración de la base de datos
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '1234',
    'database': 'voz_urbana',
    'port': 3307
}

estados = ['nuevo', 'en_proceso', 'resuelto', 'cerrado']
prioridades = ['baja', 'media', 'alta']

titulosInfraestructura = [
    'Bache profundo en avenida principal', 'Hundimiento de pavimento reciente', 'Banqueta colapsada por raíces',
    'Puente peatonal deteriorado', 'Grietas en muros de contención', 'Construcción abandonada en vía pública',
    'Alcantarilla sin tapa en cruce peatonal', 'Desnivel peligroso en calle', 'Esquina sin rampa para discapacitados',
    'Pavimento levantado por raíces de árbol', 'Puente vehicular con fisuras visibles', 'Columna estructural con daño',
    'Falta de señalética de obra en construcción', 'Material de construcción obstruyendo calle', 'Zanja abierta sin protección',
    'Banquetas resbalosas sin textura', 'Rejilla de desagüe hundida', 'Poste de concreto dañado', 'Escaleras sin barandales',
    'Muros de contención con filtraciones'
]
titulosServiciosPublicos = [
    'Alumbrado público apagado en colonia', 'Poste de luz intermitente', 'Corte frecuente de energía eléctrica',
    'Transformador con fugas de aceite', 'Cableado colgante sobre calle', 'Parada de autobús vandalizada',
    'Medidor de luz expuesto', 'Toma de agua sin tapa', 'Tubería de gas expuesta', 'Fugas en sistema eléctrico público',
    'Contador de electricidad sin protección', 'Cables eléctricos sobre zona peatonal', 'Lámpara pública colgando',
    'Zona sin alumbrado desde hace semanas', 'Interruptores públicos dañados', 'Cajas eléctricas abiertas',
    'Zona con variaciones de voltaje', 'Red de agua sin presión constante', 'Conexión ilegal de luz',
    'Transformador haciendo ruidos extraños'
]

titulosSaneamiento = [
    'Fuga de agua en tubería principal', 'Drenaje colapsado en avenida', 'Inundación por lluvia en colonia',
    'Tubería rota en zona habitacional', 'Agua turbia en suministro', 'Alcantarilla obstruida con basura',
    'Falta de tapas en registros de drenaje', 'Pozo séptico sin mantenimiento', 'Humedad por filtración subterránea',
    'Malos olores por fuga de aguas negras', 'Charcos permanentes en calle', 'Agua estancada con larvas',
    'Cárcamo sin funcionamiento', 'Tubería pluvial desconectada', 'Drenaje con retorno de agua sucia',
    'Pozo de absorción colapsado', 'Fosas sépticas rebosadas', 'Sistema pluvial no funcional',
    'Conexión cruzada agua-potable/aguas-negras', 'Humedad saliendo de registro de drenaje'
]

titulosLimpieza = [
    'Basura acumulada en esquina', 'Contenedor de basura desbordado', 'Recolección de basura atrasada',
    'Restos de poda sin recoger', 'Escombros de construcción abandonados', 'Chatarra acumulada en vía pública',
    'Contenedor de reciclaje saturado', 'Basura en parque recreativo', 'Material médico abandonado',
    'Desechos electrónicos en banqueta', 'Focos rotos en la vía pública', 'Cartón mojado bloqueando acera',
    'Residuos sólidos flotando en canal', 'Tierra acumulada en banqueta', 'Basura doméstica expuesta a animales',
    'Mobiliario roto abandonado en calle', 'Basura tras eventos masivos sin limpieza', 'Contenedor con residuos peligrosos',
    'Montón de hojas secas sin recoger', 'Animales muertos no retirados de vía'
]

titulosSeguridad = [
    'Cámara de vigilancia dañada', 'Zona sin patrullaje policial', 'Vandalismo en parque infantil',
    'Robo de cableado público', 'Graffiti en edificio público', 'Personas sospechosas merodeando',
    'Vehículo abandonado en esquina', 'Asaltos frecuentes en calle', 'Robo a casa habitación',
    'Puerta forzada en escuela pública', 'Portón sin cerradura en lugar público', 'Robos constantes en zona escolar',
    'Cristales rotos en edificio abandonado', 'Incendio provocado en basurero', 'Violencia en cancha deportiva',
    'Grupo de personas intimidando en calle', 'Intento de saqueo a local', 'Zona oscura propensa a delitos',
    'Daño intencional a mobiliario urbano', 'Venta de droga en espacio público'
]

titulosTransporte = [
    'Semáforo descompuesto en cruce', 'Parada de autobús sin techo', 'Señal de tránsito caída',
    'Líneas peatonales borradas', 'Carril de bicicleta obstruido', 'Bus con fallas mecánicas',
    'Horario de transporte incumplido', 'Conductor imprudente en zona escolar', 'Trafico intenso por mal diseño vial',
    'Accidente por señalización deficiente', 'Pasajeros viajando de pie en exceso', 'Rutas de bus mal planificadas',
    'Tiempos de espera muy largos', 'Choferes con música muy alta', 'Transportes sin ventilación adecuada',
    'Unidades de transporte muy sucias', 'Cobros de pasaje no autorizados', 'Conductor sin identificación visible',
    'Transporte informal operando en ruta oficial', 'Paradero sin iluminación'
]

titulosMedioAmbiente = [
    'Árbol caído tras tormenta', 'Ramas obstruyendo cables eléctricos', 'Inundación en área verde',
    'Plaga en jardín público', 'Árbol enfermo sin atención', 'Nido de avispas en parque',
    'Contaminación del aire por quema', 'Ruido excesivo por maquinaria', 'Maleza invadiendo banquetas',
    'Residuos químicos vertidos en canal', 'Humo constante en zona residencial', 'Vertido de aceite en calle',
    'Tala no autorizada de árboles', 'Falta de mantenimiento a jardineras', 'Contaminación visual por anuncios ilegales',
    'Contaminación auditiva por altavoces', 'Basura flotante en río', 'Fuga de gases industriales',
    'Fauna silvestre en peligro urbano', 'Quema de llantas en baldío'
]

titulosSaludPublica = [
    'Foco de infección por basura', 'Animales callejeros agresivos', 'Acumulación de agua estancada',
    'Restaurante con malas prácticas sanitarias', 'Medicamentos caducados en clínica', 'Falta de vacunación comunitaria',
    'Hospital sin atención médica', 'Falta de agua potable en clínica', 'Residuos hospitalarios mal manejados',
    'Brote de enfermedad en la zona', 'Mercado con condiciones insalubres', 'Clínica sin insumos básicos',
    'Ambulancias sin mantenimiento', 'Refugio de animales con condiciones antihigiénicas', 'Venta ilegal de medicamentos',
    'Zona sin acceso a servicios médicos', 'Contenedores con jeringas usadas', 'Baños públicos contaminados',
    'Infecciones respiratorias por polución', 'Casos de dengue sin fumigación'
]

titulosOtros = [
    'Comercio informal bloqueando banquetas', 'Fiestas con música excesiva', 'Obras sin permiso municipal',
    'Publicidad invasiva en postes', 'Venta de pirotecnia ilegal', 'Personas viviendo en vía pública',
    'Maltrato animal en espacio urbano', 'Falta de baños públicos', 'Solicitantes de apoyo en semáforos',
    'Reclamos vecinales sin respuesta del gobierno', 'Fuga de mascotas en calle', 'Circos o ferias con instalaciones inseguras',
    'Vecinos usando bocinas de alto volumen', 'Quema de basura en casa particular', 'Eventos masivos sin control',
    'Obstrucción de accesos para discapacitados', 'Personas haciendo fogatas en parques', 'Autos estacionados sobre banquetas',
    'Derrumbes menores en laderas', 'Falta de atención a denuncias previas'
]

descripcionesBase = [
    'El problema persiste desde hace más de una semana y está afectando a varios vecinos.',
    'Se ha reportado en múltiples ocasiones sin que se realice la reparación correspondiente.',
    'La situación empeora con las lluvias recientes y requiere atención inmediata.',
    'Representa un riesgo para la salud pública y la seguridad de los transeúntes.',
    'Varios ciudadanos han presentado quejas similares en la misma zona.',
    'El daño en la vía ha causado varios accidentes menores en los últimos días.',
    'Es particularmente peligroso durante la noche cuando la visibilidad es reducida.',
    'La reparación temporal realizada no ha sido suficiente para resolver el problema.',
    'Se encuentra en una zona de alto tráfico peatonal y vehicular.',
    'Las lluvias recientes han exacerbado el daño en la superficie.',
    'La acumulación atrae plagas y genera malos olores en toda la manzana.',
    'Los vecinos han intentado comunicarse con el servicio de limpieza sin respuesta.',
    'Los desechos incluyen materiales que podrían ser peligrosos para los niños.',
    'El contenedor está dañado y necesita ser reemplazado urgentemente.',
    'La basura se ha esparcido por el área debido al viento y animales.',
    'El árbol presenta signos de enfermedad y podría caer completamente pronto.',
    'El área se ha convertido en un criadero de mosquitos y otros insectos.',
    'Los equipos recreativos presentan bordes filosos que son peligrosos.',
    'La vegetación ha crecido tanto que obstruye el paso peatonal.',
    'El lugar favorito de los niños ahora es inseguro para su uso.',
    'La oscuridad en la zona ha incrementado los actos delictivos recientemente.',
    'Varios residentes han reportado sentir inseguridad al pasar por el área.',
    'El equipo dañado forma parte de un sistema crítico de vigilancia.',
    'Los actos vandálicos ocurren casi todas las noches sin que haya respuesta.',
    'La situación está escalando y podría terminar en un incidente grave.',
    'Se solicita intervención urgente antes de que ocurra un accidente.',
    'El problema afecta principalmente a adultos mayores y niños de la zona.',
    'La comunidad está dispuesta a colaborar con las autoridades para resolverlo.',
    'Es un riesgo latente que ha sido ignorado por demasiado tiempo.',
    'La solución temporal aplicada anteriormente ya no es efectiva.',
    'Varias personas han resultado afectadas por esta situación.',
    'El daño parece ser estructural y requiere atención profesional.',
    'Se han presentado quejas formales pero no ha habido seguimiento.',
    'El problema se extiende a varias cuadras a la redonda.',
    'La temporada de lluvias podría empeorar significativamente la situación.'
]


def getRandomDescripcion(i, titulo=''):
    base = random.choice(descripcionesBase)
    segunda = random.choice([d for d in descripcionesBase if d != base])
    combinaciones = [
        f"{base} {segunda}",
        f"{base}. Además, {segunda.lower()}",
        f"{base}. Cabe destacar que {segunda.lower()}",
        f"Primer reporte: {base}. Actualización: {segunda.lower()}",
        f"{titulo if titulo else ''}: {base}. {segunda}",
    ]
    return random.choice(combinaciones)

def getRandomInt(mini, maxi):
    return random.randint(mini, maxi)

def getRandomFloat(mini, maxi, decimals=6):
    return round(random.uniform(mini, maxi), decimals)

def addRandomTime(date, minMinutes=0, maxMinutes=1440):
    minutos = getRandomInt(minMinutes, maxMinutes)
    segundos = getRandomInt(0, 59)
    milisegundos = getRandomInt(0, 999)
    nuevaFecha = date + timedelta(minutes=minutos, seconds=segundos, milliseconds=milisegundos)
    return nuevaFecha

def getDateBasedOnStatus(status, fecha_inicio=None, fecha_fin=None):
    if fecha_inicio and fecha_fin:
        return getRandomDateInRange(fecha_inicio, fecha_fin)

    now = datetime.now()
    oneDay = timedelta(days=1)
    if status == 'nuevo':
        daysAgoNew = getRandomInt(0, 3)
        return now - oneDay * daysAgoNew
    elif status == 'en_proceso':
        daysAgoInProgress = getRandomInt(7, 15)
        return now - oneDay * daysAgoInProgress
    elif status == 'resuelto':
        daysAgoResolved = getRandomInt(30, 60)
        return now - oneDay * daysAgoResolved
    elif status == 'cerrado':
        monthsAgoClosed = getRandomInt(6, 24)
        past = now.replace()
        month = past.month - monthsAgoClosed
        year = past.year
        while month <= 0:
            month += 12
            year -= 1
        try:
            past = past.replace(year=year, month=month)
        except ValueError:
            past = past.replace(year=year, month=month, day=28)
        return past
    return now

def getRandomDateInRange(fecha_inicio, fecha_fin):
    """Genera una fecha aleatoria entre fecha_inicio y fecha_fin"""
    start = datetime.strptime(fecha_inicio, '%Y-%m-%d')
    end = datetime.strptime(fecha_fin, '%Y-%m-%d')
    
    if start > end:
        start, end = end, start
    
    delta = end - start
    random_days = getRandomInt(0, delta.days)
    return start + timedelta(days=random_days)

def getUpdateDateBasedOnStatus(creationDate, status):
    now = datetime.now()
    oneDay = timedelta(days=1)
    if status == 'nuevo':
        # 90% de probabilidad de no tener actualización, 10% de tener una reciente
        if random.random() < 0.9:
            return creationDate
        else:
            return creationDate + oneDay * getRandomInt(1, 3)
    elif status == 'en_proceso':
        # Actualizado entre 1-7 días después de creación
        maxDays = min(7, (now - creationDate).days)
        if maxDays <= 1:
            return creationDate
        else:
            return creationDate + oneDay * getRandomInt(1, maxDays)
    elif status == 'resuelto':
        # Resuelto entre 7-30 días después de creación
        resolvedDays = getRandomInt(7, 30)
        return creationDate + oneDay * resolvedDays
    elif status == 'cerrado':
        # Cerrado entre 1-3 meses después de creación
        closedMonths = getRandomInt(1, 3)
        closedDate = creationDate.replace()
        month = closedDate.month + closedMonths
        year = closedDate.year
        while month > 12:
            month -= 12
            year += 1
        try:
            closedDate = closedDate.replace(year=year, month=month)
        except ValueError:
            closedDate = closedDate.replace(year=year, month=month, day=28)
        return closedDate if closedDate <= now else now
    else:
        return creationDate

def main(total_reportes=1000000, offset=0, fecha_inicio='', fecha_fin=''):
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()

    # Obtener usuarios y categorías existentes
    cursor.execute("SELECT id FROM usuarios")
    usuarioIds = [row[0] for row in cursor.fetchall()]
    cursor.execute("SELECT id, nombre FROM categorias")
    categorias = cursor.fetchall()
    categoriaMap = {row[0]: row[1] for row in categorias}

    if not usuarioIds or not categoriaMap:
        print("No hay usuarios o categorías disponibles.")
        return

    # Convertir fechas si se proporcionaron
    use_custom_dates = bool(fecha_inicio and fecha_fin)
    if use_custom_dates:
        print(f"Generando reportes entre {fecha_inicio} y {fecha_fin}")

    batch_size = 5000
    for batch_start in range(0, total_reportes, batch_size):
        reportes = []
        for i in range(batch_start, min(batch_start + batch_size, total_reportes)):
            categoria_id = random.choice(list(categoriaMap.keys()))
            # Diccionario que mapea IDs de categoría a los arrays de títulos
            titulosPorCategoria = {
                1: titulosInfraestructura,
                2: titulosServiciosPublicos,
                3: titulosSaneamiento,
                4: titulosLimpieza,
                5: titulosSeguridad,
                6: titulosTransporte,
                7: titulosMedioAmbiente,
                8: titulosSaludPublica,
                9: titulosOtros
            }
            titulosCategoria = titulosPorCategoria.get(categoria_id, [])
            titulo_base = random.choice(titulosCategoria)
            titulo = f"{titulo_base} #{offset + i + 1}"
            usuario_id = random.choice(usuarioIds)
            descripcion = getRandomDescripcion(i, titulo)
            estado = random.choice(estados)
            prioridad = random.choice(prioridades)
            latitud = getRandomFloat(20.25, 20.28)
            longitud = getRandomFloat(-97.95, -97.97)
            
            # Genera fecha de creación
            if use_custom_dates:
                fecha_creacion_base = getDateBasedOnStatus(estado, fecha_inicio, fecha_fin)
            else:
                fecha_creacion_base = getDateBasedOnStatus(estado)
            
            fecha_creacion = addRandomTime(fecha_creacion_base)

            # Genera fecha de actualización
            fecha_actualizacion_base = getUpdateDateBasedOnStatus(fecha_creacion, estado)
            fecha_actualizacion = addRandomTime(fecha_actualizacion_base, 1, 1440)

            if fecha_actualizacion <= fecha_creacion:
                fecha_actualizacion = fecha_creacion + timedelta(minutes=getRandomInt(1, 1440))
            
            ubicacion = f"Colonia {getRandomInt(1, 50)}, Calle {getRandomInt(1, 100)}"
            reportes.append((
                titulo, descripcion, categoria_id, ubicacion, latitud, longitud, estado, prioridad,
                None, usuario_id, None, fecha_creacion.strftime('%Y-%m-%d %H:%M:%S'),
                fecha_actualizacion.strftime('%Y-%m-%d %H:%M:%S')
            ))
        
        # Intenta insertar con reintentos en caso de deadlock
        max_retries = 3
        for retry in range(max_retries):
            try:
                cursor.executemany(
                    "INSERT INTO reportes (titulo, descripcion, categoria_id, ubicacion, latitud, longitud, estado, prioridad, imagen_url, usuario_id, asignado_a, fecha_creacion, fecha_actualizacion) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)",
                    reportes
                )
                conn.commit()
                print(f"Insertados {batch_start + len(reportes)} reportes...")
                break  # Éxito, salir del bucle de reintentos
            except mysql.connector.errors.InternalError as e:
                if e.errno == 1213 and retry < max_retries - 1:  # Deadlock
                    print(f"Deadlock detectado, reintentando... ({retry + 1}/{max_retries})")
                    time.sleep(random.uniform(0.1, 0.5))  # Espera aleatoria antes de reintentar
                    conn.rollback()
                else:
                    raise  # Re-lanzar la excepción si no es deadlock o se agotaron los reintentos

    cursor.close()
    conn.close()
    print("¡Reportes generados exitosamente!")

if __name__ == "__main__":
    total_reportes = int(sys.argv[1]) if len(sys.argv) > 1 else 1000000
    offset = int(sys.argv[2]) if len(sys.argv) > 2 else 0
    fecha_inicio = sys.argv[3] if len(sys.argv) > 3 and sys.argv[3] else ''
    fecha_fin = sys.argv[4] if len(sys.argv) > 4 and sys.argv[4] else ''
    main(total_reportes, offset, fecha_inicio, fecha_fin)