const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');
const authMiddleware = require('../middleware/auth');

// Rutas protegidas por autenticación
router.post('/', authMiddleware, reportsController.createReport);
router.get('/', reportsController.getAllReports);
router.get('/location/:lat/:lng/:radius', reportsController.getReportsByLocation);

module.exports = router;