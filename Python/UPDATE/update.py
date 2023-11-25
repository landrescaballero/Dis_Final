from flask import Flask, request, jsonify
import pyodbc
import re
from datetime import datetime
import os
from werkzeug.utils import secure_filename
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
# Configuración de conexión a la base de datos
conn_str = 'DRIVER={ODBC Driver 17 for SQL Server};SERVER=diseno2.database.windows.net;DATABASE=Diseño;UID=ehiderg;PWD=Diseño2023'
#conn_str = 'DRIVER={SQL Server};SERVER=diseno2.database.windows.net;DATABASE=Diseño;UID=ehiderg;PWD=Diseño2023'
conn = pyodbc.connect(conn_str)
cursor = conn.cursor()

def validar_tipo_documento(tipo_documento):
    return tipo_documento in ['Tarjeta de identidad', 'Cédula']

def validar_numero_documento(numero_documento):
    return numero_documento.isdigit() and len(numero_documento) <= 10

def validar_nombre(nombre):
    return nombre.isalpha() and len(nombre) <= 30

def validar_apellidos(apellidos):
    return all(caracter.isalpha() or caracter.isspace() for caracter in apellidos) and len(apellidos) <= 60

def validar_fecha_nacimiento(fecha_nacimiento):
    try:
        # Intenta parsear la fecha
        datetime.strptime(fecha_nacimiento, '%d-%b-%Y')
        return True
    except ValueError:
        return False

def validar_genero(genero):
    return genero in ['Masculino', 'Femenino', 'No binario', 'Prefiero no reportar']

def validar_correo(correo):
    # Validación básica del formato de correo electrónico
    regex = r'^[\w\.-]+@[a-zA-Z\d\.-]+\.[a-zA-Z]{2,}$'
    return re.match(regex, correo)

def validar_celular(celular):
    return celular.isdigit() and len(celular) == 10


def agregar_log(cedula, tipo_documento,operacion, detalles):
    # Agregar registro al log
    now=datetime.now()
    fecha_actual=now.strftime("%Y-%m-%d")
    cursor.execute("INSERT INTO Log (CedulaPersona, TipoDocumento,Operacion, FechaOperacion, Detalles) VALUES (?, ?, ?, ?, ?)",
                   cedula, tipo_documento,operacion, fecha_actual, detalles)
    conn.commit()

@app.route('/actualizar/<numero_documento>', methods=['PUT'])
def actualizar(numero_documento):
    print(request.files)
    print(request.form)
    data = request.form
    #foto = request.files['Foto']
#Consultar si la persona existe
    consulta_response = cursor.execute("SELECT * FROM Registro WHERE NumeroDocumento=?", numero_documento)
    row = consulta_response.fetchone()

    if not row:
        # Persona encontrada, no realizar el registro
        return jsonify({"error": "La persona no existe"}), 400

    # Persona encontrada, proceder con la actualización
    # Validación de datos
    # ...
    if not validar_tipo_documento(row.TipoDocumento):
        return jsonify({"error": "Tipo de documento no válido"}), 400

    if not validar_nombre(data['PrimerNombre']):
        return jsonify({"error": "Primer nombre no válido"}), 400

    if not validar_nombre(data['SegundoNombre']):
        return jsonify({"error": "Segundo nombre no válido"}), 400    

    if not validar_apellidos(data['Apellidos']):
        return jsonify({"error": "Apellidos no válidos"}), 400

    #if not validar_fecha_nacimiento(data['FechaNacimiento']):
     #   return jsonify({"error": "Fecha de nacimiento no válida"}), 400

    if not validar_genero(data['Genero']):
        return jsonify({"error": "Género no válido"}), 400

    if not validar_correo(data['CorreoElectronico']):
        return jsonify({"error": "Correo electrónico no válido"}), 400

    if not validar_celular(data['Celular']):
        return jsonify({"error": "Número de celular no válido"}), 400
 

    # Actualizar en la base de datos
    cursor.execute("UPDATE Registro SET TipoDocumento=?, PrimerNombre=?, SegundoNombre=?, Apellidos=?, FechaNacimiento=?, Genero=?, CorreoElectronico=?, Celular=?, Foto=? WHERE NumeroDocumento=?",
                   data['TipoDocumento'], data['PrimerNombre'], data['SegundoNombre'],
                   data['Apellidos'], data['FechaNacimiento'], data['Genero'],
                   data['CorreoElectronico'], data['Celular'], "F:\DocumentosHDD\Diseño2\DiseñoII_PF\CRUD-Frontend\img\pic1.png", numero_documento)
    conn.commit()

    # Agregar la operación al log
    agregar_log(numero_documento, data['TipoDocumento'], 'Actualización', f"Se actualizó la información de {data['PrimerNombre']} {data['Apellidos']} con número de documento {numero_documento}")

    return jsonify({"mensaje": "Actualización exitosa"}), 200


if __name__ == '__main__':
    app.run(debug=True,host="0.0.0.0", port=4004)