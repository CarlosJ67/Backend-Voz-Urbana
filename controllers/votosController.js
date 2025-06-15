const { VotoReporte } = require('../models');

exports.votar = async (req, res) => {
  try {
    const { reporte_id, tipo_voto } = req.body;
    const usuario_id = req.user.id;

    // Evita votos duplicados (por unique index)
    const [voto, created] = await VotoReporte.findOrCreate({
      where: { reporte_id, usuario_id },
      defaults: { tipo_voto }
    });

    if (!created) {
      // Si ya existe, actualiza el voto
      voto.tipo_voto = tipo_voto;
      await voto.save();
      return res.json({ message: 'Voto actualizado', voto });
    }

    res.status(201).json({ message: 'Voto registrado', voto });
  } catch (error) {
    res.status(500).json({ message: 'Error al votar', error: error.message });
  }
};

exports.getVotosPorReporte = async (req, res) => {
  try {
    const { reporte_id } = req.params;
    const votos = await VotoReporte.findAll({ where: { reporte_id } });

    // Conteo simple
    const up = votos.filter(v => v.tipo_voto === 'up').length;
    const down = votos.filter(v => v.tipo_voto === 'down').length;

    res.json({ up, down, total: votos.length });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener votos', error: error.message });
  }
};