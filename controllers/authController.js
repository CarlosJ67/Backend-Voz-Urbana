const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { jwtSecret } = require('../config/jwt');

const authController = {
  async register(req, res) {
    try {
      const { nombre, email, password } = req.body;

      // Verifica si el usuario ya existe
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'El correo ya está registrado' });
      }

      // Encripta la contraseña
      const password_hash = await bcrypt.hash(password, 10);

      // Crea el nuevo usuario
      const user = await User.create({ nombre, email, password_hash, rol: 'ciudadano' });

      // Genera token JWT
      const token = jwt.sign({ id: user.id, rol: user.rol }, jwtSecret, { expiresIn: '1h' });

      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        user: {
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          rol: user.rol
        },
        token
      });
    } catch (error) {
      res.status(500).json({ message: 'Error al registrar usuario', error: error.message });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Busca al usuario
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      // Verifica la contraseña
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(400).json({ message: 'Credenciales inválidas' });
      }

      // Genera token JWT
      const token = jwt.sign({ id: user.id, rol: user.rol }, jwtSecret, { expiresIn: '1h' });

      res.json({
        message: 'Inicio de sesión exitoso',
        user: {
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          rol: user.rol,
          puntos: user.puntos
        },
        token
      });
    } catch (error) {
      res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
    }
  }
};

module.exports = authController;