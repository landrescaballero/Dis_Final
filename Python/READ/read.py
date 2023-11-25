from flask import Flask, jsonify, send_file
import pyodbc
import io
from datetime import datetime
import os
from werkzeug.utils import secure_filename
from flask_cors import CORS


app = Flask(__name__)
CORS(app)

# Conexión a la base de datos
conn_str = 'DRIVER={ODBC Driver 17 for SQL Server};SERVER=diseno2.database.windows.net;DATABASE=Diseño;UID=ehiderg;PWD=Diseño2023'
#conn_str = 'DRIVER={SQL Server};SERVER=diseno2.database.windows.net;DATABASE=Diseño;UID=ehiderg;PWD=Diseño2023'
conn = pyodbc.connect(conn_str)
cursor = conn.cursor()


def agregar_log(cedula, tipo_documento,operacion, detalles):
    # Agregar registro al log
    now=datetime.now()
    fecha_actual=now.strftime("%Y-%m-%d")
    cursor.execute("INSERT INTO Log (CedulaPersona, TipoDocumento,Operacion, FechaOperacion, Detalles) VALUES (?, ?, ?, ?, ?)",
                   cedula, tipo_documento,operacion, fecha_actual, detalles)
    conn.commit()

    
@app.route('/logs', methods=['GET'])
def logs():
    cursor.execute("SELECT * FROM Log")
    rows = cursor.fetchall()
    logsa = []
    if rows:
        for row in rows:    
            Log = {
                'Cedula': row.CedulaPersona,
                'TipoDocumento': row.TipoDocumento,
                'Accion': row.Operacion,
                'Fecha': row.FechaOperacion,
                'Detalles': row.Detalles
            }
            logsa.append(Log)
        return jsonify(logsa), 201
    else:
        return jsonify({"error": "Log sin registros"}), 404

@app.route('/log/<num_documento>', methods=['GET'])
def logsNum(num_documento):
    cursor.execute("SELECT * FROM Log WHERE CedulaPersona=?",num_documento)
    rows = cursor.fetchall()
    logsa = []
    if rows:
        for row in rows:    
            Log = {
                'Cedula': row.CedulaPersona,
                'TipoDocumento': row.TipoDocumento,
                'Accion': row.Operacion,
                'Fecha': row.FechaOperacion,
                'Detalles': row.Detalles
            }
            logsa.append(Log)
        return jsonify(logsa), 201
    else:
        return jsonify({"error": "No se encontro registros con ese tipo de documento"}), 404

@app.route('/testing', methods=['GET'])
def testeo():
    return jsonify({"mensaje": "Testeo exitoso"}), 200

@app.route('/consultar/<numero_documento>', methods=['GET'])
def consultar(numero_documento):
    # Consultar en la base de datos
    cursor.execute("SELECT * FROM Registro WHERE NumeroDocumento=?", numero_documento)
    row = cursor.fetchone()
    print(row)
    if row:
        # diccionario con los datos de la persona
        persona = {
            'TipoDocumento': row.TipoDocumento,
            'NumeroDocumento': row.NumeroDocumento,
            'PrimerNombre': row.PrimerNombre,
            'SegundoNombre': row.SegundoNombre,
            'Apellidos': row.Apellidos,
            'FechaNacimiento': row.FechaNacimiento,
            'Genero': row.Genero,
            'CorreoElectronico': row.CorreoElectronico,
            'Celular': row.Celular
        }
         
        
        agregar_log(row.NumeroDocumento, row.TipoDocumento, 'Consulta', f"Se consultó a la persona {row.PrimerNombre} {row.Apellidos}")

        return jsonify(persona), 200
    
    else:
        return jsonify({"error": "Persona no encontrada"}), 404

@app.route('/obtener_foto/<numero_documento>', methods=['GET'])
def obtener_foto(numero_documento):
    # Consultar en la base de datos para obtener la foto
    try:
        cursor.execute("SELECT Foto FROM Registro WHERE NumeroDocumento=?", numero_documento)
        row = cursor.fetchone()
        print(row)
        if row:
            foto = row.Foto
            filename, file_extension = os.path.splitext(foto)

            if os.path.exists(foto):
            # Enviar la imagen
                return send_file(foto, mimetype=f'image/{file_extension[1:]}'), 200
            else:
                return jsonify({"error": "Foto no encontrada"}), 404
    except Exception as e:
        print(f"Error en la consulta SQL: {e}")
        return jsonify({"error": "Error interno del servidor"}), 500
            
@app.route('/consultarall/', methods=['GET'])
def consultarAll():
    # Consultar en la base de datos
    cursor.execute("SELECT * FROM Registro")
    rows = cursor.fetchall()

    personas = []

    for row in rows:
        # diccionario con los datos de la persona
        persona = {
            'TipoDocumento': row.TipoDocumento,
            'NumeroDocumento': row.NumeroDocumento,
            'PrimerNombre': row.PrimerNombre,
            'SegundoNombre': row.SegundoNombre,
            'Apellidos': row.Apellidos,
            'FechaNacimiento': row.FechaNacimiento,
            'Genero': row.Genero,
            'CorreoElectronico': row.CorreoElectronico,
            'Celular': row.Celular
        }
        
        personas.append(persona)

    if personas:
        return jsonify(personas), 200
    else:
        return jsonify({"error": "No se encontraron personas"}), 404

@app.route('/obtenerall', methods=['GET'])
def obtenerall():
    try:
        cursor.execute("SELECT Foto FROM Registro")
        rows = cursor.fetchall()
        print(rows)
        if rows:
            images = []
            for row in rows:
                foto = row["Foto"]
                filename, file_extension = os.path.splitext(foto)

                if os.path.exists(foto):
                    images.append({
                        "filename": filename,
                        "extension": file_extension[1:],
                        "image": send_file(foto, mimetype=f'image/{file_extension[1:]}').response
                    })
                else:
                    images.append({"error": "Foto no encontrada"})

            return jsonify({"images": images}), 200
        else:
            return jsonify({"error": "No se encontraron fotos"}), 404
    except Exception as e:
        print(f"Error en la consulta SQL: {e}")
        return jsonify({"error": "Error interno del servidor"}), 500

if __name__ == '__main__':
    app.run(debug=True,host="0.0.0.0", port=4002)