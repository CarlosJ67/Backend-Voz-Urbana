const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { jwtSecret } = require('../config/config');

const authController = {
  async register(req, res) {
    try {
      const { name, email, password } = req.body;
      
      // Verifica si el usuario ya existe
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'El correo ya está registrado' });
      }

      // Crea el nuevo usuario
      const user = await User.create({ name, email, password, role: 'citizen' });
      
      // Genera token JWT
      const token = jwt.sign({ id: user.id, role: user.role }, jwtSecret, { expiresIn: '1h' });

      res.status(201).json({ 
        message: 'Usuario registrado exitosamente',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
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
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Credenciales inválidas' });
      }

      // Genera token JWT
      const token = jwt.sign({ id: user.id, role: user.role }, jwtSecret, { expiresIn: '1h' });

      res.json({
        message: 'Inicio de sesión exitoso',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          points: user.points
        },
        token
      });
    } catch (error) {
      res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
    }
  }
};

module.exports = authController;