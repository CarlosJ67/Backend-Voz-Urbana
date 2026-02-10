#!/usr/bin/env python3
"""
Script para verificar que todas las dependencias de Python estén correctamente instaladas
Proyecto: Voz Urbana Backend
"""

import sys

def verificar_dependencias():
    dependencias = [
        ('mysql.connector', 'mysql-connector-python'),
        ('sklearn', 'scikit-learn'),
        ('pandas', 'pandas'),
        ('numpy', 'numpy'),
        ('matplotlib', 'matplotlib'),
        ('sqlalchemy', 'sqlalchemy'),
        ('pymysql', 'pymysql'),
        ('bcrypt', 'bcrypt'),
        ('joblib', 'joblib')
    ]
    
    print("=== VERIFICACIÓN DE DEPENDENCIAS PYTHON ===")
    print("Proyecto: Voz Urbana Backend")
    print("=" * 50)
    
    todas_instaladas = True
    
    for modulo, paquete in dependencias:
        try:
            __import__(modulo)
            print(f"✅ {paquete}: OK")
        except ImportError:
            print(f"❌ {paquete}: NO ENCONTRADO")
            todas_instaladas = False
    
    print("=" * 50)
    
    if todas_instaladas:
        print("🎉 ¡Todas las dependencias están instaladas correctamente!")
        print("\nPuedes ejecutar:")
        print("  - Seeders: python seeders/seeder_usuarios.py")
        print("  - ETL: python seeders/etl_reportes.py")
        print("  - ML: python seeders/aprendizaje_no_supervisado.py")
        return True
    else:
        print("⚠️  Faltan algunas dependencias.")
        print("Para instalarlas ejecuta: pip install -r requirements.txt")
        return False

if __name__ == "__main__":
    verificar_dependencias()