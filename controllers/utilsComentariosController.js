const { Comentario, Report, User } = require('../models');

// Ampliación masiva de textos base (200+ variaciones)
const textosBase = [
  // Comentarios de apoyo
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
  
  // Comentarios con preguntas
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
  
  // Comentarios de seguimiento
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
  
  // Comentarios críticos
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
  
  // Comentarios positivos
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
  
  // Comentarios con sugerencias
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
  
  // Comentarios informativos
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
  
  // Comentarios de experiencia personal
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
];

// Sistema de variaciones mejorado
function getRandomComment(i, offset = 0) {
  const base = textosBase[Math.floor(Math.random() * textosBase.length)];
  
  // Sistema de variaciones
  const variaciones = [
    `${base}`,
    `${base} #${offset + i + 1}`,
    `[Importante] ${base}`,
    `${base} - ${new Date().getFullYear()}`,
    `${base} (reportado por vecino)`,
    `Comentario: ${base}`,
    `${base} - necesita seguimiento`,
    `Actualización: ${base.toLowerCase()}`,
    `Nuevo: ${base.toLowerCase()}`,
    `Respuesta: ${base.toLowerCase()}`
  ];
  
  return variaciones[Math.floor(Math.random() * variaciones.length)];
}

// Funciones utilitarias
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Genera fecha según estado del reporte (versión mejorada)
function getFechaComentarioPorEstado(estado, fechaReporte) {
  const now = new Date();
  const oneDay = 24 * 60 * 60 * 1000;
  const reportDate = new Date(fechaReporte);
  
  switch (estado) {
    case 'nuevo':
      // Últimos 3 días, después de la fecha del reporte
      return new Date(reportDate.getTime() + getRandomInt(0, 3) * oneDay);
    case 'en_proceso':
      // Entre 4 y 14 días después del reporte
      return new Date(reportDate.getTime() + getRandomInt(4, 14) * oneDay);
    case 'resuelto':
      // Entre 15 y 30 días después del reporte
      return new Date(reportDate.getTime() + getRandomInt(15, 30) * oneDay);
    case 'cerrado':
      // Entre 1 y 6 meses después del reporte
      return new Date(reportDate.getTime() + getRandomInt(30, 180) * oneDay);
    default:
      return new Date(reportDate.getTime() + getRandomInt(0, 7) * oneDay);
  }
}

exports.generarComentariosLote = async (req, res) => {
  try {
    const { totalComentarios = 2000, offset = 0 } = req.body || {};

    if (totalComentarios > 2000) {
      return res.status(400).json({ message: 'Máximo 2000 comentarios por petición.' });
    }

    // Obtén reportes con sus fechas de creación
    const reportes = await Report.findAll({ 
      attributes: ['id', 'estado', 'fecha_creacion'] 
    });
    const usuarios = await User.findAll({ attributes: ['id'] });
    
    const reporteIds = reportes.map(r => ({ 
      id: r.id, 
      estado: r.estado,
      fecha_creacion: r.fecha_creacion
    }));
    const usuarioIds = usuarios.map(u => u.id);

    if (reporteIds.length === 0 || usuarioIds.length === 0) {
      return res.status(400).json({ message: 'No hay reportes o usuarios disponibles.' });
    }

    const comentarios = [];
    for (let i = 0; i < totalComentarios; i++) {
      const reporte = reporteIds[getRandomInt(0, reporteIds.length - 1)];
      const usuario_id = usuarioIds[getRandomInt(0, usuarioIds.length - 1)];
      const texto = getRandomComment(i, offset);
      const fecha_comentario = getFechaComentarioPorEstado(
        reporte.estado, 
        reporte.fecha_creacion
      );

      // Activo: 1 para todos menos 'cerrado', 0 para 'cerrado'
      const activo = reporte.estado === 'cerrado' ? 0 : 1;

      comentarios.push({
        reporte_id: reporte.id,
        usuario_id,
        texto,
        fecha_comentario,
        activo
      });
    }

    await Comentario.bulkCreate(comentarios);
    res.json({ 
      message: `Comentarios generados: ${comentarios.length}`,
      nextOffset: offset + totalComentarios,
      detalles: {
        comentariosUnicos: new Set(comentarios.map(c => c.texto.split('#')[0])).size,
        porEstado: comentarios.reduce((acc, c) => {
          const estado = reportes.find(r => r.id === c.reporte_id).estado;
          acc[estado] = (acc[estado] || 0) + 1;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al generar comentarios', 
      error: error.message 
    });
  }
};