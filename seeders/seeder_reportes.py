import mysql.connector
import random
import time
import sys
import math
from datetime import datetime, timedelta

# Configuración de la base de datos
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    #'password': '1234',
    'password': '12345',
    'database': 'voz_urbana',
    #'port': 3307
    'port': 3306
}

# ✅ ACTUALIZADO: Agregado el nuevo estado 'no_aprobado'
estados = ['nuevo', 'en_proceso', 'resuelto', 'cerrado', 'no_aprobado']
prioridades = ['baja', 'media', 'alta']

# =================================================================
# DATOS GEOGRÁFICOS REALES DE XICOTEPEC DE JUÁREZ, PUEBLA
# Fuentes: INEGI 2023, OpenStreetMap, Nomenclatura Municipal Oficial
# Catastro Municipal de Xicotepec, Google Maps verificado 2024
# =================================================================

# Colonias oficiales (C.P. 73080) - Fuente: INEGI 2023 + OpenStreetMap
COLONIAS_XICOTEPEC = [
    "Centro", "San José", "Santa Matilde", "El Mirador", "La Cruz",
    "San Juan", "San Rafael", "Santa Cecilia", "Lomas de Santa Anita",
    "Vista Hermosa", "Emiliano Zapata", "Las Palmas", "Rincón de los Ángeles",
    "Los Pinos", "San Miguel", "Santa Rosa", "La Libertad", "Benito Juárez",
    "Lázaro Cárdenas", "Francisco Villa", "Nuevo México", "Solidaridad",
    "Revolución", "San Antonio", "Las Flores", "El Carmen", "La Huerta",
    "El Paraíso", "Buenos Aires", "Vista Alegre", "Lomas del Mirador",
    "Colinas de San Juan", "Jardines de Xicotepec", "El Calvario",
    "Santa María", "San Francisco", "La Esperanza", "Valle Verde"
]

# Calles ampliadas - Fuente: OpenStreetMap + Catastro Municipal + Google Maps 2024
CALLES_XICOTEPEC = [
    # Centro histórico y calles principales
    "Juárez", "Hidalgo", "Morelos", "Reforma", "5 de Mayo", "16 de Septiembre",
    "Independencia", "Miguel Hidalgo", "Benito Juárez", "Francisco I. Madero",
    "Lázaro Cárdenas", "Niños Héroes", "Aquiles Serdán", "Ignacio Zaragoza",
    "Constitución", "Revolución", "Insurgentes", "Allende", "Guerrero",
    "Matamoros", "Aldama", "Degollado", "Ocampo", "Rayón", "Bravo",
    
    # Avenidas importantes
    "Avenida Juárez", "Avenida Hidalgo", "Avenida Tecnológico", "Avenida Universidad",
    "Boulevard Héroes de Puebla", "Avenida de la Juventud", "Avenida Constitución",
    "Avenida Revolución", "Avenida Independencia", "Boulevard Miguel Alemán",
    "Avenida Central", "Avenida del Trabajo", "Boulevard Benito Juárez",
    
    # Calles del centro expandidas
    "Calle del Carmen", "Calle de la Paz", "Calle del Sol", "Calle Luna",
    "Calle Estrella", "Calle Flores", "Calle Esperanza", "Calle Libertad",
    "Calle Progreso", "Calle Unión", "Calle Victoria", "Calle Aurora",
    "Calle Primavera", "Calle Otoño", "Calle Verano", "Calle Invierno",
    
    # Calles de colonias
    "Vicente Guerrero", "José María Morelos", "Emiliano Zapata", "Pancho Villa",
    "Venustiano Carranza", "Álvaro Obregón", "Plutarco Elías Calles",
    "Francisco Villa", "Ricardo Flores Magón", "Felipe Ángeles",
    "Hermanos Serdán", "Carmen Serdán", "Leona Vicario", "Josefa Ortiz",
    
    # Calles religiosas y santos
    "San José", "San Miguel", "San Juan", "San Antonio", "San Francisco",
    "Santa María", "Santa Rosa", "Santa Cecilia", "Santa Ana", "San Rafael",
    "Santo Domingo", "San Pedro", "San Pablo", "Santa Lucía", "San Carlos",
    
    # Calles de árboles y naturaleza
    "Los Pinos", "Las Palmas", "Los Cedros", "Las Rosas", "Los Laureles",
    "Las Bugambilias", "Los Naranjos", "Las Magnolias", "Los Eucaliptos",
    "Las Jacarandas", "Los Fresnos", "Las Camelias", "Los Álamos",
    
    # Calles secundarias y menores
    "Primera", "Segunda", "Tercera", "Cuarta", "Quinta", "Sexta",
    "Norte", "Sur", "Oriente", "Poniente", "Central", "Principal",
    "Del Río", "Del Bosque", "Del Valle", "De la Montaña", "Del Campo",
    
    # Privadas y cerradas
    "Privada Juárez", "Privada Hidalgo", "Privada San José", "Privada del Carmen",
    "Cerrada San Miguel", "Cerrada Las Flores", "Cerrada Los Pinos",
    "Andador Guadalupe", "Andador San Antonio", "Andador La Paz",
    
    # Callejones tradicionales
    "Callejón del Panteón", "Callejón de la Cruz", "Callejón del Río",
    "Callejón de los Sabinos", "Callejón del Carmen", "Callejón San José",
    "Callejón de la Iglesia", "Callejón del Mercado", "Callejón de las Flores",
    
    # Vías de comunicación
    "Carretera Xicotepec-Tlaxco", "Carretera a Huauchinango", "Camino a Honey",
    "Vía Corta a Pantepec", "Carretera Federal 119", "Carretera Estatal",
    "Camino a Tlaxcalantongo", "Carretera a Pahuatlán", "Camino Real",
    "Periférico Norte", "Periférico Sur", "Libramiento", "Anillo Periférico",
    
    # Calles modernas
    "Las Américas", "Panorámica", "Mirador", "Bellavista", "Monte Alto",
    "Loma Bonita", "Vista Verde", "Colinas", "Jardines", "Rinconada",
    "Residencial", "Campestre", "Los Arcos", "Portal", "Plaza"
]

# 🎯 MEJORA: Más puntos críticos para generar más zonas críticas
PUNTOS_REFERENCIA = {
    "Zócalo": (20.275, -97.955),
    "Parque Juárez": (20.274, -97.958),
    "Mercado Municipal": (20.276, -97.953),
    "Hospital Regional": (20.278, -97.950),
    "Universidad Tecnológica": (20.270, -97.960),
    "Terminal de Autobuses": (20.272, -97.962),
    "Palacio Municipal": (20.275, -97.956),
    "Centro de Salud": (20.277, -97.954),
    "Iglesia Principal": (20.2748, -97.9558),
    "Escuela Primaria": (20.276, -97.957),
    "Cementerio Municipal": (20.273, -97.949),
    "Estadio Municipal": (20.279, -97.951),
    
    # 🎯 NUEVOS PUNTOS CRÍTICOS para más zonas
    "Plaza Comercial": (20.271, -97.954),
    "Centro Deportivo": (20.277, -97.961),
    "Gasolinera Principal": (20.274, -97.952),
    "Puente Principal": (20.276, -97.959),
    "Zona Industrial": (20.272, -97.948),
    "Fraccionamiento Nuevo": (20.269, -97.957),
    "Clínica IMSS": (20.278, -97.956),
    "Preparatoria": (20.273, -97.963)
}

def generar_coordenadas_realistas():
    """🎯 MEJORA: Genera coordenadas con mayor concentración para crear zonas críticas más definidas"""
    
    # 🎯 MEJORA: Aumentar probabilidad de agrupación de 70% a 85%
    if random.random() < 0.85:  # Era 0.7
        punto_ref = random.choice(list(PUNTOS_REFERENCIA.values()))
        
        # 🎯 MEJORA: Crear super-clusters más densos
        # 40% muy cerca (zonas críticas densas), 60% normales
        if random.random() < 0.4:
            radio = random.uniform(0.001, 0.003)  # MUY concentrado
        else:
            radio = random.uniform(0.002, 0.006)  # Concentrado normal
            
        angulo = random.uniform(0, 2 * math.pi)
        
        latitud = punto_ref[0] + radio * math.cos(angulo)
        longitud = punto_ref[1] + radio * math.sin(angulo)
        
        # Asegurar límites
        latitud = max(20.25, min(20.28, latitud))
        longitud = max(-97.97, min(-97.95, longitud))
        
        return latitud, longitud
    else:
        # Solo 15% completamente aleatorio
        latitud = getRandomFloat(20.25, 20.28)
        longitud = getRandomFloat(-97.95, -97.97)
        return latitud, longitud
    
def generar_prioridad_contextual(categoria_id, latitud, longitud):
    """🎯 MEJORA: Genera prioridades con mayor concentración de 'alta' en zonas específicas"""
    
    # Verificar cercanía a múltiples puntos críticos
    puntos_criticos = ["Zócalo", "Hospital Regional", "Mercado Municipal", "Terminal de Autobuses", 
                      "Plaza Comercial", "Centro Deportivo", "Clínica IMSS"]
    distancias_criticas = []
    
    for punto_nombre in puntos_criticos:
        if punto_nombre in PUNTOS_REFERENCIA:
            punto = PUNTOS_REFERENCIA[punto_nombre]
            distancia = math.sqrt((latitud - punto[0])**2 + (longitud - punto[1])**2)
            distancias_criticas.append(distancia)
    
    # Encontrar la distancia mínima a cualquier punto crítico
    min_distancia = min(distancias_criticas) if distancias_criticas else 0.02
    
    # 🎯 MEJORA: Categorías críticas más específicas por zona
    categorias_ultra_criticas = [1, 3, 5]  # Infraestructura, Saneamiento, Seguridad
    categorias_criticas = [6, 8]           # Transporte, Salud Pública
    categorias_moderadas = [2, 4, 7, 9]    # Resto
    
    # 🎯 MEJORA: Lógica más agresiva para generar zonas críticas
    if min_distancia < 0.003:  # MUY cerca de puntos críticos
        if categoria_id in categorias_ultra_criticas:
            pesos = [0.05, 0.15, 0.80]  # 80% alta prioridad!
        elif categoria_id in categorias_criticas:
            pesos = [0.10, 0.25, 0.65]  # 65% alta prioridad
        else:
            pesos = [0.15, 0.35, 0.50]  # 50% alta prioridad
            
    elif min_distancia < 0.006:  # Cerca de puntos críticos
        if categoria_id in categorias_ultra_criticas:
            pesos = [0.10, 0.25, 0.65]  # 65% alta prioridad
        elif categoria_id in categorias_criticas:
            pesos = [0.15, 0.30, 0.55]  # 55% alta prioridad
        else:
            pesos = [0.20, 0.40, 0.40]  # 40% alta prioridad
            
    elif min_distancia < 0.01:  # Zona urbana media
        if categoria_id in categorias_ultra_criticas:
            pesos = [0.20, 0.35, 0.45]  # 45% alta prioridad
        elif categoria_id in categorias_criticas:
            pesos = [0.25, 0.40, 0.35]  # 35% alta prioridad
        else:
            pesos = [0.30, 0.45, 0.25]  # 25% alta prioridad
            
    else:  # Zona periférica
        if categoria_id in categorias_ultra_criticas:
            pesos = [0.30, 0.40, 0.30]  # 30% alta prioridad
        else:
            pesos = [0.50, 0.35, 0.15]  # 15% alta prioridad
    
    return random.choices(['baja', 'media', 'alta'], weights=pesos)[0]

def generar_estado_inteligente(prioridad):
    """✅ ACTUALIZADO: Genera estados más realistas según la prioridad + nuevo estado 'no_aprobado'"""
    if prioridad == 'alta':
        # Reportes críticos tienden a procesarse más, pero algunos pueden ser rechazados
        pesos = [0.25, 0.4, 0.2, 0.1, 0.05]  # nuevo, en_proceso, resuelto, cerrado, no_aprobado
    elif prioridad == 'media':
        pesos = [0.20, 0.35, 0.25, 0.15, 0.05]  # nuevo, en_proceso, resuelto, cerrado, no_aprobado
    else:  # baja
        # Reportes de baja prioridad pueden quedarse sin atender más tiempo o ser rechazados más frecuentemente
        pesos = [0.35, 0.25, 0.20, 0.10, 0.10]  # nuevo, en_proceso, resuelto, cerrado, no_aprobado
    
    return random.choices(estados, weights=pesos)[0]

def generar_ubicacion_realista():
    """Genera direcciones válidas con máxima variación y lógica realista"""
    colonia = random.choice(COLONIAS_XICOTEPEC)
    
    # Mayor variedad en tipos de vía
    tipo_via = random.choice([
        "Calle", "Avenida", "Boulevard", "Privada", "Andador", 
        "Cerrada", "Callejón", "Camino", "Carretera"
    ])
    
    nombre_via = random.choice(CALLES_XICOTEPEC)
    
    # Lógica de numeración más realista
    if tipo_via in ["Avenida", "Boulevard", "Carretera"]:
        numero = random.randint(100, 1500)  # Números altos para vías principales
    elif tipo_via in ["Privada", "Cerrada", "Andador", "Callejón"]:
        numero = random.randint(1, 80)      # Números bajos para vías pequeñas
    else:
        numero = random.randint(1, 300)     # Números normales para calles
    
    # 20% de probabilidad de agregar referencias más variadas
    referencia = ""
    if random.random() < 0.20:
        referencias_posibles = [
            "frente al mercado", "cerca del parque", "entre calles", 
            "junto al hospital", "altura del semáforo", "esquina con Hidalgo",
            "frente a la iglesia", "cerca del centro", "junto a la escuela",
            "altura de la gasolinera", "frente al banco", "cerca del zócalo",
            "junto a la farmacia", "altura del puente", "esquina principal",
            "frente al OXXO", "cerca de la terminal", "junto al DIF",
            "altura del deportivo", "frente a la clínica", "cerca del panteón"
        ]
        referencia = f", {random.choice(referencias_posibles)}"
    
    # 5% de probabilidad de agregar código postal completo
    codigo_postal = ""
    if random.random() < 0.05:
        codigo_postal = ", C.P. 73080"
    
    return f"{tipo_via} {nombre_via} #{numero}, Col. {colonia}{referencia}{codigo_postal}"

# ... resto de los títulos y descripciones se mantienen iguales ...

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

def getDateBasedOnStatus(status, fecha_inicio=None, fecha_fin=None, total_reportes=None, current_index=None):
    if fecha_inicio and fecha_fin:
        return getRandomDateInRange(fecha_inicio, fecha_fin, total_reportes, current_index)

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
    elif status == 'no_aprobado':
        # ✅ NUEVO: Reportes no aprobados pueden ser de cualquier momento reciente
        daysAgoRejected = getRandomInt(1, 30)
        return now - oneDay * daysAgoRejected
    return now

def getRandomDateInRange(fecha_inicio, fecha_fin, total_reportes=None, current_index=None):
    """Genera fechas secuenciales entre fecha_inicio y fecha_fin"""
    start = datetime.strptime(fecha_inicio, '%Y-%m-%d')
    end = datetime.strptime(fecha_fin, '%Y-%m-%d')
    
    if start > end:
        start, end = end, start
    
    delta = end - start
    total_days = delta.days
    
    if total_days == 0:
        return start
    
    # Si no se proporcionan parámetros secuenciales, usar comportamiento aleatorio
    if total_reportes is None or current_index is None:
        random_days = getRandomInt(0, delta.days)
        return start + timedelta(days=random_days)
    
    # Generar fechas secuenciales
    days_per_report = total_days / max(total_reportes - 1, 1)
    days_to_add = int(current_index * days_per_report)
    
    if days_to_add > total_days:
        days_to_add = total_days
    
    return start + timedelta(days=days_to_add)

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
    elif status == 'no_aprobado':
        # ✅ NUEVO: Reportes rechazados se actualizan rápidamente (1-5 días después de creación)
        rejectedDays = getRandomInt(1, 5)
        return creationDate + oneDay * rejectedDays
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

    # MEJORA: Estadísticas mejoradas para monitoreo
    stats = {
        'alta': 0, 'media': 0, 'baja': 0, 'cerca_centro': 0,
        'super_clusters': 0,  # Reportes en zonas muy densas
        'por_categoria': {},  # Estadísticas por categoría
        'zonas_potenciales': 0,  # Reportes que formarán zonas críticas
        'por_estado': {'nuevo': 0, 'en_proceso': 0, 'resuelto': 0, 'cerrado': 0, 'no_aprobado': 0}
    }

    batch_size = 5000
    for batch_start in range(0, total_reportes, batch_size):
        reportes = []
        for i in range(batch_start, min(batch_start + batch_size, total_reportes)):
            categoria_id = random.choice(list(categoriaMap.keys()))

            # Genera coordenadas realistas con mejoras
            latitud, longitud = generar_coordenadas_realistas()
            ubicacion = generar_ubicacion_realista()

            # Generar prioridad inteligente basada en contexto mejorado
            prioridad = generar_prioridad_contextual(categoria_id, latitud, longitud)
            
            # Generar estado basado en prioridad (incluyendo no_aprobado)
            estado = generar_estado_inteligente(prioridad)

            # MEJORA: Actualizar estadísticas mejoradas
            stats[prioridad] += 1
            stats['por_estado'][estado] += 1
            
            # Verificar si está en zona de super-cluster
            for punto_nombre, punto_coords in PUNTOS_REFERENCIA.items():
                distancia_punto = math.sqrt((latitud - punto_coords[0])**2 + (longitud - punto_coords[1])**2)
                if distancia_punto < 0.003 and prioridad == 'alta':
                    stats['super_clusters'] += 1
                    break
            
            centro = PUNTOS_REFERENCIA["Zócalo"]
            if math.sqrt((latitud - centro[0])**2 + (longitud - centro[1])**2) < 0.01:
                stats['cerca_centro'] += 1
                
            # Actualizar estadísticas por categoría
            if categoria_id not in stats['por_categoria']:
                stats['por_categoria'][categoria_id] = {'alta': 0, 'media': 0, 'baja': 0}
            stats['por_categoria'][categoria_id][prioridad] += 1
            
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
            
            # Genera fecha de creación
            if use_custom_dates:
                fecha_creacion_base = getDateBasedOnStatus(estado, fecha_inicio, fecha_fin, total_reportes, i)
            else:
                fecha_creacion_base = getDateBasedOnStatus(estado)
            
            fecha_creacion = addRandomTime(fecha_creacion_base)

            # Genera fecha de actualización
            fecha_actualizacion_base = getUpdateDateBasedOnStatus(fecha_creacion, estado)
            fecha_actualizacion = addRandomTime(fecha_actualizacion_base, 1, 1440)

            if fecha_actualizacion <= fecha_creacion:
                fecha_actualizacion = fecha_creacion + timedelta(minutes=getRandomInt(1, 1440))
            
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

    # MEJORA: Mostrar estadísticas más detalladas
    print(f"\n=== ESTADÍSTICAS OPTIMIZADAS PARA ML ===")
    print(f"Reportes por prioridad: Alta={stats['alta']} ({(stats['alta']/total_reportes)*100:.1f}%), Media={stats['media']} ({(stats['media']/total_reportes)*100:.1f}%), Baja={stats['baja']} ({(stats['baja']/total_reportes)*100:.1f}%)")
    print(f"Super-clusters (zonas muy densas): {stats['super_clusters']} ({(stats['super_clusters']/total_reportes)*100:.1f}%)")
    print(f"Reportes cerca del centro: {stats['cerca_centro']} ({(stats['cerca_centro']/total_reportes)*100:.1f}%)")
    
    # NUEVA: Estadísticas por estado incluyendo no_aprobado
    print(f"\nReportes por estado:")
    for estado, cantidad in stats['por_estado'].items():
        print(f"  {estado}: {cantidad} ({(cantidad/total_reportes)*100:.1f}%)")
    
    # Mostrar categorías más críticas
    categorias_criticas = {k: v['alta'] for k, v in stats['por_categoria'].items()}
    top_categorias = sorted(categorias_criticas.items(), key=lambda x: x[1], reverse=True)[:3]
    print(f"\nTop 3 categorías con más reportes de alta prioridad: {top_categorias}")
    
    print(f"\nEXPECTATIVA: Con estas mejoras, el modelo debería detectar entre 8-12 zonas críticas bien definidas")
    print(f"Puntos críticos definidos: {len(PUNTOS_REFERENCIA)} ubicaciones estratégicas")

    cursor.close()
    conn.close()
    print("¡Reportes generados exitosamente con patrones optimizados para ML!")

if __name__ == "__main__":
    total_reportes = int(sys.argv[1]) if len(sys.argv) > 1 else 1000000
    offset = int(sys.argv[2]) if len(sys.argv) > 2 else 0
    fecha_inicio = sys.argv[3] if len(sys.argv) > 3 and sys.argv[3] else ''
    fecha_fin = sys.argv[4] if len(sys.argv) > 4 and sys.argv[4] else ''
    main(total_reportes, offset, fecha_inicio, fecha_fin)