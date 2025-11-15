from flask import Flask, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)

@app.route('/api/terms')
def get_terms():
    conn = sqlite3.connect('../Database/Database.db') 
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Definitions")
    rows = cursor.fetchall()
    conn.close()

    terms = [dict(row) for row in rows]
    return jsonify(terms)

if __name__ == '__main__':
    app.run(port=3001, debug=True)

