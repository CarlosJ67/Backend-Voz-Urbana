import mysql.connector
import bcrypt
import random
import time
from datetime import datetime, timedelta

# Configuración de la base de datos
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '12345',
    'database': 'voz_urbana',
    'port': 3306
}

nombres_hombres = [ 'Carlos', 'Juan', 'Pedro', 'Luis', 'Miguel', 'Jorge', 'Andrés', 'Fernando', 'Ricardo', 'Manuel',
  'Alejandro', 'Sergio', 'Eduardo', 'Roberto', 'Francisco', 'Raúl', 'Héctor', 'Adrián', 'Iván', 'Óscar',
  'Diego', 'Antonio', 'Javier', 'Rubén', 'Daniel', 'David', 'José', 'Ángel', 'Pablo', 'Víctor', 'Alberto',
  'Raul', 'Enrique', 'Arturo', 'Felipe', 'Jesús', 'Alfonso', 'Guillermo', 'Emilio', 'Marcos', 'Julio',
  'Salvador', 'Manuel', 'Agustín', 'Rafael', 'Santiago', 'Vicente', 'Alfredo', 'Ramón', 'Gerardo']
nombres_mujeres = ['María', 'Ana', 'Laura', 'Patricia', 'Sandra', 'Gabriela', 'Paola', 'Verónica', 'Carmen', 'Diana',
  'Alejandra', 'Claudia', 'Jessica', 'Mónica', 'Daniela', 'Lucía', 'Fernanda', 'Andrea', 'Sofía', 'Valeria',
  'Isabel', 'Beatriz', 'Rosa', 'Teresa', 'Silvia', 'Elena', 'Julia', 'Raquel', 'Marina', 'Adriana', 'Natalia',
  'Victoria', 'Carolina', 'Alicia', 'Irma', 'Leticia', 'Rocío', 'Olivia', 'Luisa', 'Esther', 'Ángela',
  'Pilar', 'Concepción', 'Consuelo', 'Mercedes', 'Josefina', 'Guadalupe', 'Margarita', 'Rebeca', 'Camila']
apellidos = ['García', 'Rodríguez', 'González', 'Fernández', 'López', 'Martínez', 'Sánchez', 'Pérez', 'Gómez', 'Martín',
  'Jiménez', 'Ruiz', 'Hernández', 'Díaz', 'Moreno', 'Álvarez', 'Muñoz', 'Romero', 'Alonso', 'Gutiérrez',
  'Navarro', 'Torres', 'Domínguez', 'Vázquez', 'Ramos', 'Gil', 'Ramírez', 'Serrano', 'Blanco', 'Suárez',
  'Molina', 'Morales', 'Ortega', 'Delgado', 'Castro', 'Ortiz', 'Rubio', 'Marín', 'Sanz', 'Iglesias',
  'Medina', 'Garrido', 'Cortés', 'Castillo', 'Santos', 'Lozano', 'Guerrero', 'Cano', 'Prieto', 'Méndez',
  'Cruz', 'Calvo', 'Gallego', 'Vidal', 'León', 'Herrera', 'Márquez', 'Peña', 'Flores', 'Cabrera', 'Reyes',
  'Acosta', 'Aguilar', 'Bravo', 'Campos', 'Cervantes', 'Contreras', 'Corona', 'Fuentes', 'Juárez', 'Mendoza',
  'Mejía', 'Miranda', 'Montes', 'Núñez', 'Ochoa', 'Pacheco', 'Padilla', 'Palacios', 'Quintero', 'Rangel',
  'Robles', 'Rosales', 'Solís', 'Tapia', 'Valdez', 'Vega', 'Zamora', 'Zúñiga']

def get_random_name():
    es_mujer = random.random() < 0.5
    nombre = random.choice(nombres_mujeres if es_mujer else nombres_hombres)
    apellido1 = random.choice(apellidos)
    apellido2 = random.choice(apellidos)
    while apellido1 == apellido2:
        apellido2 = random.choice(apellidos)
    return f"{nombre} {apellido1} {apellido2}"

def get_random_date_in_past_years(years=5):
    now = datetime.now()
    past = now - timedelta(days=365*years)
    random_date = past + timedelta(seconds=random.randint(0, int((now-past).total_seconds())))
    return random_date.strftime('%Y-%m-%d %H:%M:%S')

def get_random_date_after(date_str):
    date = datetime.strptime(date_str, '%Y-%m-%d %H:%M:%S')
    now = datetime.now() - timedelta(days=1)
    if date >= now:
        return date.strftime('%Y-%m-%d %H:%M:%S')
    random_date = date + timedelta(seconds=random.randint(0, int((now-date).total_seconds())))
    return random_date.strftime('%Y-%m-%d %H:%M:%S')

def main(total_admins=2, total_ciudadanos=999998, offset=0):
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()
    password = '123456'
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt(10)).decode('utf-8')
    timestamp = int(time.time())
    usuarios = []

    for i in range(total_admins):
        fecha_registro = get_random_date_in_past_years()
        fecha_actualizacion = get_random_date_after(fecha_registro)
        usuarios.append((
            get_random_name(),
            f"admin{timestamp}_{offset + i}@demo.com",
            password_hash,
            'admin',
            100,
            1,
            fecha_registro,
            fecha_actualizacion
        ))

    for i in range(total_ciudadanos):
        fecha_registro = get_random_date_in_past_years()
        fecha_actualizacion = get_random_date_after(fecha_registro)
        usuarios.append((
            get_random_name(),
            f"usuario{timestamp}_{offset + i}@demo.com",
            password_hash,
            'ciudadano',
            random.randint(0, 99),
            1,
            fecha_registro,
            fecha_actualizacion
        ))

    # Inserción por lotes para eficiencia
    batch_size = 10000
    for i in range(0, len(usuarios), batch_size):
        batch = usuarios[i:i+batch_size]
        cursor.executemany(
            "INSERT INTO usuarios (nombre, email, password_hash, rol, puntos, activo, fecha_registro, fecha_actualizacion) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)",
            batch
        )
        conn.commit()
        print(f"Insertados {i+len(batch)} usuarios...")

    cursor.close()
    conn.close()
    print("¡Usuarios generados exitosamente!")

if __name__ == "__main__":
    import sys
    total_admins = int(sys.argv[1]) if len(sys.argv) > 1 else 2
    total_ciudadanos = int(sys.argv[2]) if len(sys.argv) > 2 else 999998
    offset = int(sys.argv[3]) if len(sys.argv) > 3 else 0
    main(total_admins, total_ciudadanos, offset)