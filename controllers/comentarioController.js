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

// PATCH - Actualizar comentario
exports.updateComentario = async (req, res) => {
  try {
    const { id } = req.params;
    const { texto } = req.body;
    const usuario_id = req.user.id;

    const comentario = await Comentario.findByPk(id);

    if (!comentario || !comentario.activo) {
      return res.status(404).json({ message: 'Comentario no encontrado o inactivo' });
    }

    // Solo autor puede editar
    if (comentario.usuario_id !== usuario_id) {
      return res.status(403).json({ message: 'No tienes permisos para editar este comentario' });
    }

    comentario.texto = texto || comentario.texto;
    await comentario.save();

    res.json({ message: 'Comentario actualizado', comentario });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar comentario', error: error.message });
  }
};

// DELETE - Eliminar comentario (lógico)
exports.deleteComentario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario_id = req.user.id;

    const comentario = await Comentario.findByPk(id);

    if (!comentario || !comentario.activo) {
      return res.status(404).json({ message: 'Comentario no encontrado o ya inactivo' });
    }
     // Solo el admin o el creador del comentario pueden eliminarlo
    if (req.user.rol !== 'admin' && comentario.usuario_id !== usuario_id)  {
      return res.status(403).json({ message: 'No autorizado para eliminar este comentario' });
    }

    comentario.activo = false;
    await comentario.save();

    res.json({ message: 'Comentario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar comentario', error: error.message });
  }
};

