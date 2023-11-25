from flask import Flask, request, jsonify
import pyodbc
import re
from datetime import datetime
import base64
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename



app = Flask(__name__)
CORS(app)
# Conexión a la base de datos
conn_str = 'DRIVER={ODBC Driver 17 for SQL Server};SERVER=diseno2.database.windows.net;DATABASE=Diseño;UID=ehiderg;PWD=Diseño2023'
#conn_str = 'DRIVER={SQL Server};SERVER=diseno2.database.windows.net;DATABASE=Diseño;UID=ehiderg;PWD=Diseño2023'
conn = pyodbc.connect(conn_str)
cursor = conn.cursor()


script_directory = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


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
    print(fecha_actual)
    cursor.execute("INSERT INTO Log (CedulaPersona, TipoDocumento,Operacion, FechaOperacion, Detalles) VALUES (?, ?, ?, ?, ?)",
                   cedula, tipo_documento,operacion, fecha_actual, detalles)
    conn.commit()

@app.route('/testing', methods=['GET'])
def testeo():
    return jsonify({"mensaje": "Testeo exitoso"}), 200

@app.route('/registrar', methods=['POST'])
def registrar():
    data = request.form
    foto = request.files['Foto']

    #Consultar si la persona existe
    consulta_response = cursor.execute("SELECT * FROM Registro WHERE NumeroDocumento=?", data['NumeroDocumento'])
    row = consulta_response.fetchone()

    if row:
        # Persona encontrada, no realizar el registro
        return jsonify({"error": "La persona ya existe"}), 400

    # Validación de datos
    if not validar_tipo_documento(data['TipoDocumento']):
        return jsonify({"error": "Tipo de documento no válido"}), 400

    if not validar_numero_documento(data['NumeroDocumento']):
        return jsonify({"error": "Número de documento no válido"}), 400

    if not validar_nombre(data['PrimerNombre']):
        return jsonify({"error": "Primer nombre no válido"}), 400

    if not validar_nombre(data['SegundoNombre']):
        return jsonify({"error": "Segundo nombre no válido"}), 400    

    if not validar_apellidos(data['Apellidos']):
        return jsonify({"error": "Apellidos no válidos"}), 400

    #if not validar_fecha_nacimiento(data['FechaNacimiento']):
        #return jsonify({"error": "Fecha de nacimiento no válida"}), 400

    if not validar_genero(data['Genero']):
        return jsonify({"error": "Género no válido"}), 400

    if not validar_correo(data['CorreoElectronico']):
        return jsonify({"error": "Correo electrónico no válido"}), 400

    if not validar_celular(data['Celular']):
        return jsonify({"error": "Número de celular no válido"}), 400
    
    filename, file_extension = os.path.splitext(foto.filename)
 

    if foto:

        filename = secure_filename(f"{data['NumeroDocumento']}{file_extension}")
        filepath = os.path.join(script_directory,app.config['UPLOAD_FOLDER'], filename)

        # Verificar de que el directorio de carga exista
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        
        with open(filepath, 'wb') as f:
            f.write(foto.read())    
    # Insertar en la base de datos
    cursor.execute("INSERT INTO Registro VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                   data['TipoDocumento'], data['NumeroDocumento'], data['PrimerNombre'],
                   data['SegundoNombre'], data['Apellidos'], data['FechaNacimiento'],
                   data['Genero'], data['CorreoElectronico'], data['Celular'], filepath)
    conn.commit()

    # Agregar la operación al log
    agregar_log(data['NumeroDocumento'], data['TipoDocumento'], 'Registro', f"Se registró a la persona {data['PrimerNombre']} {data['Apellidos']}")

    return jsonify({"mensaje": "Registro exitoso"}), 201

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=4001)