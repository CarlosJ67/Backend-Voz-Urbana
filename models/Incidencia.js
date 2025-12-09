// models/Incidencia.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Incidencia = sequelize.define(
  "Incidencia",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tipo: {
      type: DataTypes.ENUM('error', 'warning', 'info', 'critical'),
      allowNull: false,
      defaultValue: 'error'
    },
    modulo: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Módulo donde ocurrió la incidencia (reports, auth, etc.)'
    },
    mensaje: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Descripción del error o incidencia'
    },
    stack_trace: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Stack trace del error (si aplica)'
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID del usuario que experimentó la incidencia'
    },
    ip_address: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'IP del cliente'
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'User agent del navegador/app'
    },
    endpoint: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Endpoint donde ocurrió el error'
    },
    metodo_http: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Método HTTP (GET, POST, etc.)'
    },
    datos_adicionales: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Datos adicionales en formato JSON'
    },
    resuelto: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si la incidencia ha sido resuelta'
    },
    fecha_resolucion: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha en que se resolvió la incidencia'
    }
  },
  {
    tableName: "incidencias",
    timestamps: true,
    createdAt: "fecha_creacion",
    updatedAt: "fecha_actualizacion",
  }
);

module.exports = Incidencia;