from flask import Flask, jsonify, render_template
from flask_cors import CORS
import sqlite3
import os 
app = Flask(__name__, static_folder="static", template_folder="templates")
CORS(app)
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DB_PATH = os.path.join(BASE_DIR, '..', 'Database', 'Database.db')

@app.route('/')
def index():
    return render_template('index.html')

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
    
@app.route('/api/favorite/<int:term_id>/<int:state>', methods=['POST'])
def update_favorite(term_id, state):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("UPDATE Definitions SET Favorite = ? WHERE ID = ?", (state, term_id))
    conn.commit()
    conn.close()
    return jsonify({"status": "ok"})

if __name__ == '__main__':
    app.run(port=3001, debug=True)
