const { VotoReporte } = require('../models');

exports.votarUp = async (req, res) => {
  try {
    const { reporte_id } = req.body;
    const usuario_id = req.user.id;

    const [voto, created] = await VotoReporte.findOrCreate({
      where: { reporte_id, usuario_id },
      defaults: { tipo_voto: 'up' }
    });

    if (!created) {
      if (voto.tipo_voto === 'up') {
        voto.tipo_voto = 'none';
        await voto.save();
        return res.json({ message: 'Voto eliminado (up)', voto });
      } else {
        voto.tipo_voto = 'up';
        await voto.save();
        return res.json({ message: 'Voto cambiado a up', voto });
      }
    }

    res.status(201).json({ message: 'Voto up registrado', voto });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar voto up', error: error.message });
  }
};
exports.votarDown = async (req, res) => {
  try {
    const { reporte_id } = req.body;
    const usuario_id = req.user.id;

    const [voto, created] = await VotoReporte.findOrCreate({
      where: { reporte_id, usuario_id },
      defaults: { tipo_voto: 'down' }
    });

    if (!created) {
      if (voto.tipo_voto === 'down') {
        voto.tipo_voto = 'none';
        await voto.save();
        return res.json({ message: 'Voto eliminado (down)', voto });
      } else {
        voto.tipo_voto = 'down';
        await voto.save();
        return res.json({ message: 'Voto cambiado a down', voto });
      }
    }

    res.status(201).json({ message: 'Voto down registrado', voto });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar voto down', error: error.message });
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