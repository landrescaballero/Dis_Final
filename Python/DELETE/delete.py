from flask import Flask, jsonify
from flask_cors import CORS
import pyodbc
from datetime import datetime
import os


app = Flask(__name__)
CORS(app)
# Configuración de conexión a la base de datos
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



@app.route('/borrar/<numero_documento>', methods=['DELETE'])
def borrar(numero_documento):
    # Consultar en el microservicio de consulta para verificar la existencia
    print("iniciando borrado de: ",numero_documento)
    consulta_response = cursor.execute("SELECT * FROM Registro WHERE NumeroDocumento=?", numero_documento)
    row = consulta_response.fetchone()
    print("se borrara la informacion:\n",row)
    if row:
        print("no se skipeo el borrado")
        foto_path = os.path.join(row.Foto)
        # Agregar operación al log
        agregar_log(numero_documento, row.TipoDocumento, 'Borrado', f"Se eliminó la información de {row.PrimerNombre} {row.Apellidos} con número de documento {numero_documento}")

        # Persona encontrada, proceder con el borrado
        print("borrando...")
        cursor.execute("DELETE FROM Registro WHERE NumeroDocumento=?", numero_documento)
        conn.commit()
        if os.path.exists(foto_path):
            os.remove(row.Foto) 
        return jsonify({"mensaje": "Borrado exitoso"}), 200
        
       
    else:
        # Persona no encontrada, devolver un mensaje de error
        return jsonify({"error": "Persona no encontrada"}), 404

if __name__ == '__main__':
    app.run(debug=True,host="0.0.0.0", port=4003)