class FavRaga {
    constructor(db) {
        this.db = db; // Database connection instance
    }

// Function to get favorite ragas for a specific user
async getFavoriteRagasByUser(userId) {
    if (!userId) {
        throw new Error('User ID is undefined'); // Validate userId
    }

    return new Promise((resolve, reject) => {
        this.db.query('SELECT r.* FROM favorites f JOIN ragas r ON f.raga_id = r.id WHERE f.user_id = ?', [userId], (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
}



    // Function to add a favorite raga for a user
    async addFavorite(userId, ragaId) {
        if (!userId || !ragaId) {
            throw new Error('User ID or Raga ID is undefined'); // Validate inputs
        }

        const query = 'INSERT INTO favorites (user_id, raga_id) VALUES (?, ?)';
        try {
            await this.db.execute(query, [userId, ragaId]); // Execute the insert query
            console.log(`Added favorite: User ${userId} -> Raga ${ragaId}`); // Log the operation
        } catch (error) {
            console.error('Error adding favorite:', error);
            throw error; // Rethrow the error for further handling
        }
    }

    // Function to remove a favorite raga for a user
    async removeFavorite(userId, ragaId) {
        if (!userId || !ragaId) {
            throw new Error('User ID or Raga ID is undefined'); // Validate inputs
        }

        const query = 'DELETE FROM favorites WHERE user_id = ? AND raga_id = ?';
        try {
            await this.db.execute(query, [userId, ragaId]); // Execute the delete query
            console.log(`Removed favorite: User ${userId} -> Raga ${ragaId}`); // Log the operation
        } catch (error) {
            console.error('Error removing favorite:', error);
            throw error; // Rethrow the error for further handling
        }
    }
}

module.exports = FavRaga;
