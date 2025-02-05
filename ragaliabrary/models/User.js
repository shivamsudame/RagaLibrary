class User {
    constructor(db) {
        this.db = db;
    }

    // Get user by login ID (modified for sync)
    /* getUserByLoginId(loginId, callback) {
        this.db.query('SELECT * FROM users WHERE login_id = ?', [loginId], (err, results) => {
            if (err) return callback(err, null); // Return error if any
            callback(null, results[0]); // Return user data
        });
    } */
	
	getUserByLoginId(loginId) {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM users WHERE login_id = ?';
            this.db.query(query, [loginId], (err, results) => {
                if (err) {
                    reject(err);  // Reject the promise if there's an error
                } else {
                    resolve(results[0]);  // Resolve with the first result
                }
            });
        });
    }

	/*
	getUserByLoginId(loginId) {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM users WHERE login_id = ?';
            this.db.query(query, [loginId], (err, results) => {
                if (err) {
                    reject(err);  // Reject the promise if there's an error
                } else {
                    resolve(results[0]);  // Resolve with the first result
                }
            });
        });
    } 

    // Get user by email (modified for sync)
    getUserByEmail(email, callback) {
        this.db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
            if (err) return callback(err, null);
            callback(null, results[0]); // Return user data or null if not found
        });
    }
	*/

	
	// Get user by email (promise-based)
	getUserByEmail(email) {
    return new Promise((resolve, reject) => {
        this.db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
            if (err) return reject(err); // Reject if there's an error
            resolve(results[0]); // Resolve with the user data (or null if not found)
        });
    });
	}
	
	// Save password reset token (promise-based)
	savePasswordResetToken(userId, token, expiration) {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE users SET resetToken = ?, resetTokenExpiration = ? WHERE id = ?';
        this.db.query(query, [token, expiration, userId], (err, results) => {
            if (err) return reject(err); // Reject the promise on error
            resolve(results); // Resolve the promise with the query results
        });
    });
	}

	
/*
    // Save password reset token (modified for sync)
    savePasswordResetToken(userId, token, expiration, callback) {
        this.db.query('UPDATE users SET resetToken = ?, resetTokenExpiration = ? WHERE id = ?', [token, expiration, userId], (err, results) => {
            if (err) return callback(err, null);
            callback(null, results); // Return query results or success
        });
    }
*/
    // Get user by reset token (modified for sync)

	getUserByResetToken = (token, callback) => {
		console.log('Querying database for reset token:', token); // Log the token being queried
		this.db.query('SELECT * FROM users WHERE resetToken = ?', [token], (err, results) => {
			if (err) {
				console.error('Error querying database for reset token:', err);
				return callback(err, null); // Return error if any
			}
			console.log('Query result:', results); // Log the result from the database
			if (results.length > 0) {
				return callback(null, results[0]); // Return the first user found
			}
			return callback(null, null); // Return null if no user is found
		});
	};

    // Update user password (modified for sync)
    updatePassword(userId, hashedPassword, callback) {
        this.db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId], (err, results) => {
            if (err) return callback(err, null);
            callback(null, results); // Return query results or success
        });
    }

    // Clear reset token (modified for sync)
    clearResetToken(userId, callback) {
        this.db.query('UPDATE users SET resetToken = NULL, resetTokenExpiration = NULL WHERE id = ?', [userId], (err, results) => {
            if (err) return callback(err, null);
            callback(null, results); // Return query results or success
        });
    }

    // Create user (modified for sync)
    
createUser(firstName, lastName, loginId, password, email) {
    return new Promise((resolve, reject) => {
        this.db.query(
            'INSERT INTO users (first_name, last_name, login_id, password, email) VALUES (?, ?, ?, ?, ?)',
            [firstName, lastName, loginId, password, email],
            (err, results) => {
                if (err) {
                    return reject(err); // Reject on error
                }
                resolve(results); // Resolve on success
            }
        );
    });
}

/*
    // Query to insert the user into the 'users' table
    this.db.query(
        'INSERT INTO users (first_name, last_name, login_id, password, email) VALUES (?, ?, ?, ?, ?)',
        [firstName, lastName, loginId, password, email],
        (err, results) => {
            if (err) {
                // If there is an error, pass the error to the callback
                return callback(err, null);
            }
            // On success, pass null for error and return results
            callback(null, results); 
        }
    );

}
*/
	
	
	
	
}

module.exports = User;
