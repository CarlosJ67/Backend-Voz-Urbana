const { Categoria } = require('../models');

// Obtener todas las categorías activas
exports.getCategorias = async (req, res) => {
  try {
    const categorias = await Categoria.findAll({ where: { activa: true }, order: [['orden_visualizacion', 'ASC']] });
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener categorías', error: error.message });
  }
};

// Crear una nueva categoría
exports.createCategoria = async (req, res) => {
  try {
    const { nombre, icono, descripcion, activa, orden_visualizacion } = req.body;
    const nuevaCategoria = await Categoria.create({ nombre, icono, descripcion, activa, orden_visualizacion });
    res.status(201).json(nuevaCategoria);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear categoría', error: error.message });
  }
};

// Actualizar una categoría
exports.updateCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Categoria.update(req.body, { where: { id } });
    if (updated) {
      const categoriaActualizada = await Categoria.findByPk(id);
      res.json(categoriaActualizada);
    } else {
      res.status(404).json({ message: 'Categoría no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar categoría', error: error.message });
  }
};

// Eliminar (desactivar) una categoría
exports.deleteCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Categoria.update({ activa: false }, { where: { id } });
    if (updated) {
      res.json({ message: 'Categoría desactivada' });
    } else {
      res.status(404).json({ message: 'Categoría no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar categoría', error: error.message });
  }
};