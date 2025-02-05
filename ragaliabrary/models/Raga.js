class Raga {
    constructor(db) {
        this.db = db;
    }

    getAllRagas() {
        return new Promise((resolve, reject) => {
            this.db.query('SELECT * FROM ragas', (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    }

    getUserFavorites(userId) {
        return new Promise((resolve, reject) => {
            this.db.query(
                'SELECT * FROM favorites INNER JOIN ragas ON favorites.raga_id = ragas.id WHERE user_id = ?',
                [userId],
                (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                }
            );
        });
    }

    addFavorite(userId, ragaId) {
        return new Promise((resolve, reject) => {
            this.db.query('INSERT INTO favorites (user_id, raga_id) VALUES (?, ?)', [userId, ragaId], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    }

    removeFavorite(userId, ragaId) {
        return new Promise((resolve, reject) => {
            this.db.query('DELETE FROM favorites WHERE user_id = ? AND raga_id = ?', [userId, ragaId], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    }
	
	
	
	getRagaById(id) {
        return new Promise((resolve, reject) => {
            this.db.query('SELECT * FROM ragas WHERE id = ?', [id], (err, results) => {
                if (err) return reject(err);
                resolve(results[0]);
            });
        });
    }
	
	    async getRagaByNotes(notes) {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM ragas WHERE binary notes = ? LIMIT 1'; // Adjust the table/column names
			this.db.query(query, [notes], (error, results) => {
			//const query = 'SELECT * FROM ragas WHERE REPLACE(notes, " ", "") = REPLACE(?, " ", "") LIMIT 1'; // Remove spaces before matching
            //this.db.query(query, [`%${notes}%`], (error, results) => {
                if (error) {
                    return reject(error);
                }
                resolve(results[0]); // Return the first matching record
            });
        });
    }
	
	
	
	
}

module.exports = Raga;
