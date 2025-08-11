const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Usuario:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del usuario
 *           example: 1
 *         nombre:
 *           type: string
 *           description: Nombre completo del usuario
 *           example: "Juan Pérez González"
 *         email:
 *           type: string
 *           format: email
 *           description: Correo electrónico único del usuario
 *           example: "juan.perez@vozurbana.com"
 *         rol:
 *           type: string
 *           enum: [ciudadano, admin]
 *           description: Rol del usuario en el sistema
 *           example: "ciudadano"
 *         puntos:
 *           type: integer
 *           description: Puntos acumulados por participación ciudadana
 *           example: 150
 *         fecha_registro:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de registro del usuario
 *           example: "2024-08-08T10:30:00Z"
 *     
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Correo electrónico registrado en el sistema
 *           example: "juan.perez@vozurbana.com"
 *         password:
 *           type: string
 *           minLength: 6
 *           description: Contraseña del usuario (mínimo 6 caracteres)
 *           example: "miPassword123"
 *     
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - nombre
 *         - email
 *         - password
 *       properties:
 *         nombre:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           description: Nombre completo del ciudadano (mínimo 2 caracteres)
 *           example: "Juan Pérez González"
 *         email:
 *           type: string
 *           format: email
 *           description: Correo electrónico único para crear la cuenta
 *           example: "juan.perez@vozurbana.com"
 *         password:
 *           type: string
 *           minLength: 6
 *           description: Contraseña segura (mínimo 6 caracteres, se recomienda incluir mayúsculas, números y símbolos)
 *           example: "MiPassword123!"
 *         rol:
 *           type: string
 *           enum: [ciudadano, admin]
 *           default: ciudadano
 *           description: Rol del usuario - 'ciudadano' para usuarios normales, 'admin' para administradores municipales
 *           example: "ciudadano"
 *     
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indica si la operación fue exitosa
 *           example: true
 *         message:
 *           type: string
 *           description: Mensaje descriptivo del resultado
 *           example: "Usuario autenticado correctamente"
 *         token:
 *           type: string
 *           description: Token JWT para autenticación en requests posteriores
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         user:
 *           $ref: '#/components/schemas/Usuario'
 *     
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           description: Descripción del error ocurrido
 *           example: "Error en la validación de datos"
 *         error:
 *           type: string
 *           description: Detalles técnicos del error (solo en desarrollo)
 *           example: "ValidationError: email is required"
 *   
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: Token JWT obtenido del endpoint de login
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registro de nuevo usuario ciudadano
 *     description: |
 *       Permite a un ciudadano crear una nueva cuenta en la plataforma Voz Urbana.
 *       
 *       **Funcionalidad:**
 *       - Crea un nuevo usuario con rol 'ciudadano' por defecto
 *       - Valida que el email no esté previamente registrado
 *       - Encripta la contraseña usando bcrypt con salt rounds
 *       - Asigna puntos iniciales (0) al nuevo usuario
 *       - Retorna un token JWT válido para uso inmediato
 *       
 *       **Validaciones aplicadas:**
 *       - Email debe ser único en el sistema
 *       - Contraseña mínimo 6 caracteres
 *       - Nombre es obligatorio y debe tener al menos 2 caracteres
 *       - Formato de email válido
 *       
 *       **Casos de uso:**
 *       - Ciudadano que quiere reportar problemas urbanos
 *       - Registro desde aplicación móvil o web
 *       - Crear cuenta para participar en la comunidad
 *     tags: [🔐 Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           examples:
 *             ciudadano_normal:
 *               summary: Registro de ciudadano normal
 *               description: Ejemplo típico de registro de un ciudadano
 *               value:
 *                 nombre: "María González López"
 *                 email: "maria.gonzalez@email.com"
 *                 password: "miPassword123"
 *                 rol: "ciudadano"
 *             admin_municipal:
 *               summary: Registro de administrador (uso interno)
 *               description: Registro de un administrador municipal
 *               value:
 *                 nombre: "Carlos Administrador"
 *                 email: "admin@vozurbana.gob.mx"
 *                 password: "AdminPassword2024!"
 *                 rol: "admin"
 *     responses:
 *       201:
 *         description: ✅ Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             examples:
 *               registro_exitoso:
 *                 summary: Registro completado
 *                 value:
 *                   success: true
 *                   message: "Usuario registrado correctamente. ¡Bienvenido a Voz Urbana!"
 *                   token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywicm9sIjoiY2l1ZGFkYW5vIiwiaWF0IjoxNjkxNDg2NDAwfQ.token_example"
 *                   user:
 *                     id: 123
 *                     nombre: "María González López"
 *                     email: "maria.gonzalez@email.com"
 *                     rol: "ciudadano"
 *                     puntos: 0
 *                     fecha_registro: "2024-08-08T10:30:00Z"
 *       400:
 *         description: ❌ Error en los datos proporcionados
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               email_duplicado:
 *                 summary: Email ya registrado
 *                 value:
 *                   success: false
 *                   message: "Este correo electrónico ya está registrado en el sistema"
 *                   error: "DUPLICATE_EMAIL"
 *               validacion_error:
 *                 summary: Datos inválidos
 *                 value:
 *                   success: false
 *                   message: "Error en la validación de datos"
 *                   error: "El nombre debe tener al menos 2 caracteres"
 *       422:
 *         description: ❌ Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               password_corto:
 *                 summary: Contraseña muy corta
 *                 value:
 *                   success: false
 *                   message: "La contraseña debe tener al menos 6 caracteres"
 *       500:
 *         description: ❌ Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión en Voz Urbana
 *     description: |
 *       Autentica a un usuario registrado (ciudadano o administrador) y proporciona acceso a la plataforma.
 *       
 *       **Funcionalidad:**
 *       - Valida credenciales contra la base de datos
 *       - Verifica la contraseña usando bcrypt
 *       - Genera un token JWT válido por 24 horas
 *       - Actualiza la fecha de último acceso del usuario
 *       - Retorna información del usuario para el frontend
 *       
 *       **Seguridad implementada:**
 *       - Contraseñas hasheadas con bcrypt
 *       - Tokens JWT con expiración automática
 *       - No exposición de contraseñas en respuestas
 *       - Validación de formato de email
 *       
 *       **Casos de uso:**
 *       - Ciudadano accediendo para crear reportes
 *       - Administrador municipal gestionando reportes
 *       - Acceso desde app móvil o web
 *       - Reanudación de sesión después de logout
 *     tags: [🔐 Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           examples:
 *             ciudadano_login:
 *               summary: Login de ciudadano
 *               description: Acceso típico de un ciudadano
 *               value:
 *                 email: "maria.gonzalez@email.com"
 *                 password: "miPassword123"
 *             admin_login:
 *               summary: Login de administrador
 *               description: Acceso de administrador municipal
 *               value:
 *                 email: "admin@vozurbana.gob.mx"
 *                 password: "AdminPassword2024!"
 *     responses:
 *       200:
 *         description: ✅ Autenticación exitosa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             examples:
 *               login_ciudadano:
 *                 summary: Login exitoso de ciudadano
 *                 value:
 *                   success: true
 *                   message: "Bienvenido de vuelta, María. Sesión iniciada correctamente"
 *                   token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywicm9sIjoiY2l1ZGFkYW5vIiwiaWF0IjoxNjkxNDg2NDAwLCJleHAiOjE2OTE1NzI4MDB9.example_token"
 *                   user:
 *                     id: 123
 *                     nombre: "María González López"
 *                     email: "maria.gonzalez@email.com"
 *                     rol: "ciudadano"
 *                     puntos: 150
 *                     fecha_registro: "2024-06-15T08:00:00Z"
 *               login_admin:
 *                 summary: Login exitoso de administrador
 *                 value:
 *                   success: true
 *                   message: "Acceso de administrador autorizado. Panel de control disponible"
 *                   token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbCI6ImFkbWluIiwiaWF0IjoxNjkxNDg2NDAwLCJleHAiOjE2OTE1NzI4MDB9.admin_token"
 *                   user:
 *                     id: 1
 *                     nombre: "Carlos Administrador"
 *                     email: "admin@vozurbana.gob.mx"
 *                     rol: "admin"
 *                     puntos: 0
 *                     fecha_registro: "2024-01-01T00:00:00Z"
 *       400:
 *         description: ❌ Credenciales inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               credenciales_incorrectas:
 *                 summary: Email o contraseña incorrectos
 *                 value:
 *                   success: false
 *                   message: "Email o contraseña incorrectos. Verifica tus credenciales"
 *                   error: "INVALID_CREDENTIALS"
 *               usuario_no_existe:
 *                 summary: Usuario no registrado
 *                 value:
 *                   success: false
 *                   message: "No existe una cuenta asociada a este correo electrónico"
 *                   error: "USER_NOT_FOUND"
 *       422:
 *         description: ❌ Formato de datos inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               email_invalido:
 *                 summary: Formato de email inválido
 *                 value:
 *                   success: false
 *                   message: "El formato del correo electrónico no es válido"
 *                   error: "INVALID_EMAIL_FORMAT"
 *               campos_faltantes:
 *                 summary: Campos requeridos faltantes
 *                 value:
 *                   success: false
 *                   message: "Email y contraseña son obligatorios"
 *                   error: "MISSING_REQUIRED_FIELDS"
 *       429:
 *         description: ❌ Demasiados intentos de login
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               rate_limit:
 *                 summary: Límite de intentos excedido
 *                 value:
 *                   success: false
 *                   message: "Demasiados intentos de login. Intenta de nuevo en 15 minutos"
 *                   error: "RATE_LIMIT_EXCEEDED"
 *       500:
 *         description: ❌ Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/login', authController.login);

module.exports = router;