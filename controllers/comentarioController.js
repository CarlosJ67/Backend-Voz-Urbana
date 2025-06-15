const { Comentario, User } = require('../models');

exports.createComentario = async (req, res) => {
  try {
    const { reporte_id, texto } = req.body;
    const usuario_id = req.user.id;

    const comentario = await Comentario.create({
      reporte_id,
      usuario_id,
      texto
    });

    res.status(201).json(comentario);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear comentario', error: error.message });
  }
};

exports.getComentariosByReporte = async (req, res) => {
  try {
    const { reporte_id } = req.params;
    const comentarios = await Comentario.findAll({
      where: { reporte_id, activo: true },
      include: [{ model: User, attributes: ['id', 'nombre'] }],
      order: [['fecha_comentario', 'ASC']]
    });
    res.json(comentarios);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener comentarios', error: error.message });
  }
};