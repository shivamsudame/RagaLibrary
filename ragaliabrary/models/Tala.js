class Tala {
    constructor(db) {
        this.db = db;
    }

    // Method to get all talas
    getAllTalas() {
        return new Promise((resolve, reject) => {
            this.db.query('SELECT * FROM talas', (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    }

    // Method to get tala by ID
    getTalaById(id) {
        return new Promise((resolve, reject) => {
            this.db.query('SELECT * FROM talas WHERE id = ?', [id], (err, results) => {
                if (err) return reject(err);
                if (results.length === 0) return resolve(null); // No tala found
                resolve(results[0]); // Return the first result (should be only one tala)
            });
        });
    }
}

module.exports = Tala;

