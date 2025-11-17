from flask import Flask, jsonify
from flask_cors import CORS
import sqlite3
import os 
app = Flask(__name__)
CORS(app)
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DB_PATH = os.path.join(BASE_DIR, '..', 'Database', 'Database.db')

@app.route('/api/terms')
def get_terms():
    conn = sqlite3.connect(DB_PATH) 
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Definitions") 
    rows = cursor.fetchall()
    conn.close()

    terms = [dict(row) for row in rows]
    return jsonify(terms)

if __name__ == '__main__':
    app.run(port=3001, debug=True)