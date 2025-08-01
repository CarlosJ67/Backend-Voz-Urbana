const { Report, User, Categoria } = require('../models');

const estados = ['nuevo', 'en_proceso', 'resuelto', 'cerrado', 'no_aprobado'];
const prioridades = ['baja', 'media', 'alta'];

// Ampliación masiva de títulos base (300+)
const titulosBase = [
  // Problemas de agua
  'Fuga de agua en tubería principal', 'Pérdida de agua en alcantarilla', 'Inundación en calle secundaria',
  'Bomba de agua averiada', 'Contador de agua dañado', 'Presión de agua insuficiente',
  'Agua turbia en suministro', 'Pozo de agua contaminado', 'Conexión ilegal de agua',
  'Estanque de agua abandonado', 'Filtraciones en edificio público', 'Humedades por tubería rota',
  
  // Problemas viales
  'Bache profundo en avenida', 'Hundimiento de pavimento', 'Señalización vial dañada',
  'Semáforo no funciona', 'Líneas peatonales borradas', 'Puente peatonal deteriorado',
  'Cuneta obstruida', 'Alcantarilla sin tapa', 'Poste de luz caído',
  'Esquina peligrosa sin visibilidad', 'Carril de bicicletas obstruido', 'Paso de cebra deteriorado',
  
  // Basura y limpieza
  'Basura acumulada por días', 'Contenedor desbordado', 'Desechos peligrosos abandonados',
  'Vertedero ilegal', 'Recolección de basura atrasada', 'Olores por descomposición',
  'Chatarra acumulada', 'Escombros de construcción', 'Material médico desechado',
  'Contenedor de reciclaje lleno', 'Basura en área natural', 'Desechos electrónicos abandonados',
  
  // Áreas verdes
  'Árbol caído bloqueando calle', 'Ramas peligrosas en árbol', 'Césped sin cortar',
  'Plaga en jardín público', 'Árbol enfermo', 'Invasión de maleza',
  'Daños en área de juegos', 'Bancas del parque rotas', 'Fuente pública sin mantenimiento',
  'Animales abandonados en parque', 'Nido de avispas peligroso', 'Inundación en área verde',
  
  // Seguridad pública
  'Alumbrado público apagado', 'Poste de luz intermitente', 'Cámara de seguridad dañada',
  'Vandalismo en propiedad pública', 'Pintas graffiti en muro', 'Robo de infraestructura',
  'Persona sospechosa merodeando', 'Actividad ilegal en calle', 'Ruido excesivo nocturno',
  'Vehiculo abandonado', 'Fiestas que alteran orden', 'Comercio ilegal en via pública',
  
  // Transporte público
  'Parada de bus vandalizada', 'Taxi realizando maniobras peligrosas', 'Bus con fallas mecánicas',
  'Horario de transporte no cumplido', 'Conductor imprudente', 'Accidente de tránsito',
  'Pasajeros en riesgo', 'Infraestructura de transporte dañada', 'Estación de metro sucia',
  'Aire acondicionado roto en bus', 'Asientos dañados en transporte', 'Cobro excesivo de pasaje',
  
  // Salud pública
  'Foco de infección en zona pública', 'Animales callejeros agresivos', 'Acumulación de agua estancada',
  'Restaurante con malas prácticas higiénicas', 'Hospital abandonado', 'Medicamentos vencidos',
  'Falta de vacunación en área', 'Brote de enfermedad', 'Falta de servicios médicos',
  'Contaminación por químicos', 'Residuos hospitalarios mal manejados', 'Falta de agua potable'
];

// Ampliación masiva de descripciones base (150+)
const descripcionesBase = [
  // Variaciones de problemas de agua
  'El problema persiste desde hace más de una semana y está afectando a varios vecinos.',
  'Se ha reportado en múltiples ocasiones sin que se realice la reparación correspondiente.',
  'La situación empeora con las lluvias recientes y requiere atención inmediata.',
  'Representa un riesgo para la salud pública y la seguridad de los transeúntes.',
  'Varios ciudadanos han presentado quejas similares en la misma zona.',
  
  // Variaciones para problemas viales
  'El daño en la vía ha causado varios accidentes menores en los últimos días.',
  'Es particularmente peligroso durante la noche cuando la visibilidad es reducida.',
  'La reparación temporal realizada no ha sido suficiente para resolver el problema.',
  'Se encuentra en una zona de alto tráfico peatonal y vehicular.',
  'Las lluvias recientes han exacerbado el daño en la superficie.',
  
  // Variaciones para basura
  'La acumulación atrae plagas y genera malos olores en toda la manzana.',
  'Los vecinos han intentado comunicarse con el servicio de limpieza sin respuesta.',
  'Los desechos incluyen materiales que podrían ser peligrosos para los niños.',
  'El contenedor está dañado y necesita ser reemplazado urgentemente.',
  'La basura se ha esparcido por el área debido al viento y animales.',
  
  // Variaciones para áreas verdes
  'El árbol presenta signos de enfermedad y podría caer completamente pronto.',
  'El área se ha convertido en un criadero de mosquitos y otros insectos.',
  'Los equipos recreativos presentan bordes filosos que son peligrosos.',
  'La vegetación ha crecido tanto que obstruye el paso peatonal.',
  'El lugar favorito de los niños ahora es inseguro para su uso.',
  
  // Variaciones para seguridad
  'La oscuridad en la zona ha incrementado los actos delictivos recientemente.',
  'Varios residentes han reportado sentir inseguridad al pasar por el área.',
  'El equipo dañado forma parte de un sistema crítico de vigilancia.',
  'Los actos vandálicos ocurren casi todas las noches sin que haya respuesta.',
  'La situación está escalando y podría terminar en un incidente grave.',
  
  // Variaciones genéricas
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
];

// Sistema de variaciones mejorado
function getRandomTitulo(i, categoriaNombre = '', offset = 0) {
  const base = titulosBase[Math.floor(Math.random() * titulosBase.length)];
  
  // Sistema de variaciones
  const variaciones = [
    `[Urgente] ${base}`,
    `${base} en estado crítico`,
    `Nuevo reporte: ${base}`,
    `${base} (sin resolver)`,
    `Reincidente: ${base}`,
    `${categoriaNombre ? `[${categoriaNombre}] ` : ''}${base}`,
    `${base} - necesita atención inmediata`,
    `Reporte ciudadano: ${base}`,
    `${base} - peligro público`,
    `Incidente reportado: ${base}`,
    `${base} - daños colaterales`,
    `Alerta comunitaria: ${base}`,
    `${base} - riesgo inminente`
  ];
  
  const variante = variaciones[Math.floor(Math.random() * variaciones.length)];
  return `${variante} #${offset + i + 1}`;
}

function getRandomDescripcion(i, titulo = '') {
  const base = descripcionesBase[Math.floor(Math.random() * descripcionesBase.length)];
  
  // Combinar aleatoriamente 2 descripciones diferentes
  const segundaParte = descripcionesBase.filter(d => d !== base)[
    Math.floor(Math.random() * (descripcionesBase.length - 1))
  ];
  
  const combinaciones = [
    `${base} ${segundaParte}`,
    `${base}. Además, ${segundaParte.toLowerCase()}`,
    `${base}. Cabe destacar que ${segundaParte.toLowerCase()}`,
    `Primer reporte: ${base}. Actualización: ${segundaParte.toLowerCase()}`,
    `${titulo ? `Relacionado con "${titulo.split('#')[0]}": ` : ''}${base}. ${segundaParte}`,
    `Descripción del problema: ${base}. Contexto adicional: ${segundaParte.toLowerCase()}`,
    `Reporte inicial: ${base}. Desarrollo reciente: ${segundaParte.toLowerCase()}`,
    `${base}. Sumado a esto, ${segundaParte.toLowerCase()}`
  ];
  
  return combinaciones[Math.floor(Math.random() * combinaciones.length)];
}

// Funciones utilitarias

function addRandomTime(date, minMinutes = 0, maxMinutes = 1440) {
  // Suma entre minMinutes y maxMinutes minutos aleatorios
  const minutos = getRandomInt(minMinutes, maxMinutes);
  const segundos = getRandomInt(0, 59);
  const milisegundos = getRandomInt(0, 999);
  const nuevaFecha = new Date(date);
  nuevaFecha.setMinutes(nuevaFecha.getMinutes() + minutos);
  nuevaFecha.setSeconds(nuevaFecha.getSeconds() + segundos);
  nuevaFecha.setMilliseconds(milisegundos);
  return nuevaFecha;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max, decimals = 6) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function getDateBasedOnStatus(status) {
  const now = new Date();
  const oneDay = 24 * 60 * 60 * 1000; // milisegundos en un día
  
  switch(status) {
    case 'nuevo':
      // Reportes nuevos: últimos 3 días (0-3 días atrás)
      const daysAgoNew = getRandomInt(0, 3);
      return new Date(now.getTime() - (daysAgoNew * oneDay));
      
    case 'en_proceso':
      // Reportes en proceso: últimos 7-15 días
      const daysAgoInProgress = getRandomInt(7, 15);
      return new Date(now.getTime() - (daysAgoInProgress * oneDay));
      
    case 'resuelto':
      // Reportes resueltos: últimos 30-60 días
      const daysAgoResolved = getRandomInt(30, 60);
      return new Date(now.getTime() - (daysAgoResolved * oneDay));
      
    case 'cerrado':
      // Reportes cerrados: 6-24 meses atrás
      const monthsAgoClosed = getRandomInt(6, 24);
      const past = new Date();
      past.setMonth(now.getMonth() - monthsAgoClosed);
      return past;

    case 'no_aprobado':
      // Reportes no aprobados: últimos 7-30 días
      const daysAgoNotApproved = getRandomInt(7, 30);
      return new Date(now.getTime() - (daysAgoNotApproved * oneDay));
      
    default:
      return new Date();
  }
}

function getUpdateDateBasedOnStatus(creationDate, status) {
  const now = new Date();
  const oneDay = 24 * 60 * 60 * 1000;
  
  switch(status) {
    case 'nuevo':
      // 90% de probabilidad de no tener actualización, 10% de tener una reciente
      return Math.random() < 0.9 ? creationDate : 
        new Date(creationDate.getTime() + getRandomInt(1, 3) * oneDay);
        
    case 'en_proceso':
      // Actualizado entre 1-7 días después de creación
      const maxDays = Math.min(7, (now - creationDate) / oneDay);
      return maxDays <= 1 ? creationDate :
        new Date(creationDate.getTime() + getRandomInt(1, maxDays) * oneDay);
        
    case 'resuelto':
      // Resuelto entre 7-30 días después de creación
      const resolvedDays = getRandomInt(7, 30);
      return new Date(creationDate.getTime() + resolvedDays * oneDay);
      
    case 'cerrado':
      // Cerrado entre 1-3 meses después de creación
      const closedMonths = getRandomInt(1, 3);
      const closedDate = new Date(creationDate);
      closedDate.setMonth(creationDate.getMonth() + closedMonths);
      return closedDate > now ? now : closedDate;

    case 'no_aprobado':
      // No aprobado entre 1-7 días después de creación
      const notApprovedDays = getRandomInt(1, 7);
      return new Date(creationDate.getTime() + notApprovedDays * oneDay);
      
    default:
      return creationDate;
  }
}

// Controlador para actualizar el estado de un reporte (solo admin)
exports.updateStatusAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    // Validar que el estado sea válido
    if (!estados.includes(estado)) {
      return res.status(400).json({ 
        message: 'Estado inválido', 
        estadosValidos: estados 
      });
    }

    // Buscar el reporte
    const reporte = await Report.findByPk(id);
    if (!reporte) {
      return res.status(404).json({ message: 'Reporte no encontrado' });
    }

    // Actualizar el estado
    await reporte.update({ estado });

    res.json({ 
      message: 'Estado actualizado correctamente',
      reporte: {
        id: reporte.id,
        titulo: reporte.titulo,
        estado: reporte.estado,
        fecha_actualizacion: reporte.fecha_actualizacion
      }
    });
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({ 
      message: 'Error al actualizar el estado del reporte', 
      error: error.message 
    });
  }
};

exports.generarReportesLote = async (req, res) => {
  try {
    const { totalReportes = 2000, offset = 0 } = req.body || {};

    if (totalReportes > 2000) {
      return res.status(400).json({ message: 'Máximo 2000 reportes por petición.' });
    }

    // Obtén IDs de usuarios y categorías (incluyendo nombres para contexto)
    const usuarios = await User.findAll({ attributes: ['id'] });
    const categorias = await Categoria.findAll({ attributes: ['id', 'nombre'] });
    const usuarioIds = usuarios.map(u => u.id);
    const categoriaMap = new Map(categorias.map(c => [c.id, c.nombre]));

    if (usuarioIds.length === 0 || categoriaMap.size === 0) {
      return res.status(400).json({ message: 'No hay usuarios o categorías disponibles.' });
    }

    const reportes = [];
    for (let i = 0; i < totalReportes; i++) {
      const categoria_id = Array.from(categoriaMap.keys())[getRandomInt(0, categoriaMap.size - 1)];
      const categoria_nombre = categoriaMap.get(categoria_id);
      const usuario_id = usuarioIds[getRandomInt(0, usuarioIds.length - 1)];
      const titulo = getRandomTitulo(i, categoria_nombre, offset);
      const descripcion = getRandomDescripcion(i, titulo);
      const estado = estados[getRandomInt(0, estados.length - 1)];
      const prioridad = prioridades[getRandomInt(0, prioridades.length - 1)];
      const latitud = getRandomFloat(19.20, 19.60);
      const longitud = getRandomFloat(-99.30, -99.00);
      
      // Genera fecha de creación con hora/min/seg/miliseg aleatorios
      const fecha_creacion_base = getDateBasedOnStatus(estado);
      const fecha_creacion = addRandomTime(fecha_creacion_base);

      // Genera fecha de actualización posterior y diferente a la de creación
      let fecha_actualizacion_base = getUpdateDateBasedOnStatus(fecha_creacion, estado);
      let fecha_actualizacion = addRandomTime(fecha_actualizacion_base, 1, 1440);

      // Si por alguna razón la actualización queda antes o igual que la creación, corrige:
      if (fecha_actualizacion <= fecha_creacion) {
        fecha_actualizacion = new Date(fecha_creacion.getTime() + getRandomInt(1, 1440) * 60 * 1000);
      }
      reportes.push({
        titulo,
        descripcion,
        categoria_id,
        ubicacion: `Colonia ${getRandomInt(1, 50)}, Calle ${getRandomInt(1, 100)}`,
        latitud,
        longitud,
        estado,
        prioridad,
        imagen_url: null,
        usuario_id,
        asignado_a: null,
        fecha_creacion,
        fecha_actualizacion
      });
    }

    await Report.bulkCreate(reportes);
    res.json({ 
      message: `Reportes generados: ${reportes.length}`,
      nextOffset: offset + totalReportes,
      detalles: {
        titulosUnicos: new Set(reportes.map(r => r.titulo.split('#')[0])).size,
        descripcionesUnicas: new Set(reportes.map(r => r.descripcion.split('.')[0])).size,
        estadosGenerados: reportes.reduce((acc, r) => {
          acc[r.estado] = (acc[r.estado] || 0) + 1;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al generar reportes', error: error.message });
  }
};