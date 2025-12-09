// tests/controllers/reportsController.test.js
const request = require('supertest');
const app = require('../../server');
const { Report, User, Categoria } = require('../../models');

describe('Reports Controller', () => {
  let authToken;
  let testUser;
  let testCategoria;

  beforeAll(async () => {
    // Crear usuario de prueba
    testUser = await User.create({
      nombre: 'Usuario Test',
      email: 'test@example.com',
      password_hash: 'hashedpassword',
      rol: 'ciudadano'
    });

    // Crear categoría de prueba
    testCategoria = await Categoria.create({
      nombre: 'Categoría Test',
      icono: 'test-icon',
      descripcion: 'Descripción de prueba'
    });

    // Obtener token de autenticación (simular login)
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    // Limpiar datos de prueba
    await Report.destroy({ where: { usuario_id: testUser.id } });
    await User.destroy({ where: { id: testUser.id } });
    await Categoria.destroy({ where: { id: testCategoria.id } });
  });

  describe('POST /api/reports', () => {
    test('debería crear un reporte exitosamente', async () => {
      const reportData = {
        titulo: 'Reporte de Prueba',
        descripcion: 'Descripción del reporte de prueba',
        categoria_id: testCategoria.id,
        latitud: 19.4326,
        longitud: -99.1332,
        ubicacion: 'Ciudad de México',
        prioridad: 'media'
      };

      const response = await request(app)
        .post('/api/reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reportData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Reporte creado exitosamente');
      expect(response.body.report).toHaveProperty('id');
      expect(response.body.report.titulo).toBe(reportData.titulo);
    });

    test('debería fallar sin autenticación', async () => {
      const response = await request(app)
        .post('/api/reports')
        .send({
          titulo: 'Reporte sin auth',
          descripcion: 'Test'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/reports', () => {
    test('debería obtener todos los reportes', async () => {
      const response = await request(app)
        .get('/api/reports');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('debería filtrar reportes por estado', async () => {
      const response = await request(app)
        .get('/api/reports?estado=nuevo');

      expect(response.status).toBe(200);
      response.body.forEach(report => {
        expect(report.estado).toBe('nuevo');
      });
    });
  });
});