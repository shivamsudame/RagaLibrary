const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Raga = require('../models/Raga');
const FavRaga = require('../models/favragas');
const Tala = require('../models/Tala');
const router = express.Router();
const crypto = require('crypto');
const mailgunJS = require('mailgun.js'); // Correct import for mailgun.js
const FormData = require('form-data'); // Correct import for form-data
const mailgun = new mailgunJS(FormData); // Initialize Mailgun with FormData

/* deleted from here */

module.exports = (db) => {
    const userModel = new User(db);
    const ragaModel = new Raga(db);
    const favRagaModel = new FavRaga(db); // Correct instance name for consistency
    const talaModel = new Tala(db);
	

    // Home Route redirects to login
    router.get('/', (req, res) => {
        res.redirect('/login');
    });

    // Login Route (GET)
    router.get('/login', (req, res) => {
        res.render('login'); // Ensure your login.ejs file is correctly set up
    });
	
// Login Route (POST)
					router.post('/login', async (req, res) => {
						try {
							const { username, password } = req.body;
							
							// Ensure both username and password are provided
							if (!username || !password) {
								return res.render('login', { errorMessage: 'Username and password are required.' });
							}
							
							// Retrieve the user by the username (or login ID)
							console.log("Checking user:", username);
							const user = await userModel.getUserByLoginId(username);
							console.log("User retrieved:", user);
							
							if (user) {
								// Compare the entered password with the stored hashed password
								const isMatch = await bcrypt.compare(password, user.password);
								
								if (isMatch) {
									// Store user ID in session after successful login
									req.session.userId = user.id;
									res.redirect('/raga');
								} else {
									// Incorrect password
									res.render('login', { errorMessage: 'Invalid username or password.' });
								}
							} else {
								// User not found
								res.render('login', { errorMessage: 'Invalid username or password.' });
							}
						} catch (error) {
							// Log the error and show a general error message
							console.error("Error during login:", error);
							res.status(500).render('login', { errorMessage: 'Server error, please try again later.' });
						}
					});



/* deleted second batch about forgot password route */
	
    // Raga Routes (display all ragas functionality)
    router.get('/raga', async (req, res) => {
        const ragas = await ragaModel.getAllRagas();
        const favorites = req.session.userId ? await favRagaModel.getFavoriteRagasByUser(req.session.userId) : []; // Fetch favorites only if userId exists

        // Create a Set of favorite raga IDs for quick lookup
        const favoriteRagaIds = new Set(favorites.map(fav => fav.id)); // Assuming 'id' is the column in favorites

        // Mark each raga as favorite or not
        const updatedRagas = ragas.map(raga => ({
            ...raga,
            favorite: favoriteRagaIds.has(raga.id) // Set the favorite status
        }));

        res.render('raga', { ragas: updatedRagas }); // Use updated ragas with favorite status
    });

    // Route to get raga details by ID
    router.get('/raga/:id', async (req, res) => {
        try {
            const raga = await ragaModel.getRagaById(req.params.id);
            if (!raga) {
                return res.status(404).json({ error: 'Raga not found' });
            }
            res.json(raga); // Send raga details as JSON response
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error' });
        }
    });

    // Raga Routes (with favorites functionality)
    router.get('/favragas', async (req, res) => {
        if (!req.session.userId) {
            return res.status(403).send('Forbidden: User is not logged in.'); // Handle not logged in
        }
        try {
            const favoriteRagas = await favRagaModel.getFavoriteRagasByUser(req.session.userId); // Use favRagaModel
            res.render('favragas', { ragas: favoriteRagas });
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    });

    // Route to add a favorite raga
    router.post('/raga/favorite/:id', async (req, res) => {
        await favRagaModel.addFavorite(req.session.userId, req.params.id); // Use favRagaModel
        res.redirect('/raga');
    });

    // Route to remove a favorite raga
    router.post('/raga/unfavorite/:id', async (req, res) => {
        await favRagaModel.removeFavorite(req.session.userId, req.params.id); // Use favRagaModel
        res.redirect('/raga');
    });

    // Tala Routes
    router.get('/tala', async (req, res) => {
        const talas = await talaModel.getAllTalas();
        const defaultTala = talas[0]; // Get the first tala as default
        res.render('tala', { talas, defaultTala });
    });

    // Route to get tala details by ID
    router.get('/tala/:id', async (req, res) => {
        try {
            const tala = await talaModel.getTalaById(req.params.id); // Fetch the tala details from the database
            if (tala) {
                res.json(tala); // Return JSON response for the tala details
            } else {
                res.status(404).json({ error: 'Tala not found' }); // Return JSON error if tala not found
            }
        } catch (error) {
            res.status(500).json({ error: 'An error occurred while fetching the tala details' }); // Return JSON error for server issues
        }
    });
	
// Search Route (GET)
router.get('/search', (req, res) => {
    // Render the search page with default values for raga and errorMessage
    res.render('search', { raga: null, errorMessage: null });
});

// Search Route (POST)
router.post('/search', async (req, res) => {
    const { selectedValues } = req.body; // Get the notes from the search form
    try {
        // Search for the raga matching the notes
        const raga = await ragaModel.getRagaByNotes(selectedValues); // Implement this method in the Raga model
		console.log("Received selectedValues:", selectedValues); // Log the received values
        if (raga) {
            res.render('search', { raga, errorMessage: null }); // Render search page with found raga
        } else {
            res.render('search', { raga: null, errorMessage: 'No matching raga found.' }); // Handle no match
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error'); // Handle server error
    }
});


// Register Route Get
    router.get('/register', (req, res) => {
        res.render('register');
    });

// register post
/*
    router.post('/register', async (req, res) => {
        const { firstName, lastName, username, password, email } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        await userModel.createUser(firstName, lastName, username, hashedPassword, email);
        res.redirect('/login');
    });
	*/
	router.post('/register', async (req, res) => {
    const { firstName, lastName, username, password, email } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        await userModel.createUser(firstName, lastName, username, hashedPassword, email);
        res.redirect('/login');
    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).send('Error during registration');
    }
});


/* New block */

// Create the client
const mg = mailgun.client({
  username: 'api',
  key: '7982863ac3ffe4f0adecfd2906c44093-79295dd0-6507de52', // Replace with your Mailgun API key
});

// Define your Mailgun domain
const DOMAIN = 'sandbox17fc03b73bcc43f385816f7f68bb572d.mailgun.org'; // Replace with your Mailgun domain

// Function to send email
const sendEmail = (to, subject, text) => {
  // Create the email data object
  const emailData = {
    from: 'shivamsudame108@gmail.com', // Sender's email address
    to: to, // Recipient's email address
    subject: subject, // Email subject
    text: text, // Email body text
  };

  // Send email via Mailgun
  mg.messages.create(DOMAIN, emailData)
    .then(response => {
      console.log('Email sent successfully:', response);
    })
    .catch(error => {
      console.error('Error sending email:', error);
    });
};

// Forgot Password Route (GET)

	router.get('/forgot-password', (req, res) => {
    res.render('forgot-password', { errorMessage: null, successMessage: null });
});

/*
router.post('/forgot-password', (req, res) => {
    const email = req.body.email;

    // Call getUserByEmail with a callback
    userModel.getUserByEmail(email, (err, user) => {
        let successMessage = null;
        let errorMessage = null;

        if (err) {
            console.error('Database query error:', err);
            return res.render('forgot-password', { errorMessage: 'There was an error processing your request.' });
        }

        if (!user) {
            errorMessage = 'No account found with that email address.';
            return res.render('forgot-password', { errorMessage, successMessage });
        }

        // Generate password reset token and expiration
        const token = crypto.randomBytes(20).toString('hex');
        const expiration = Date.now() + 3600000; // Token valid for 1 hour

        // Save the token and expiration in the database
        userModel.savePasswordResetToken(user.id, token, expiration, (err) => {
            if (err) {
                console.error('Error saving token to database:', err);
                errorMessage = 'There was an error saving your reset token. Please try again later.';
                return res.render('forgot-password', { errorMessage, successMessage });
            }

            // Email setup for Mailgun
            const data = {
                from: 'you@yourdomain.com', // Replace with your Mailgun verified email
                to: email,
                subject: 'Password Reset Request',
                text: `You are receiving this because you (or someone else) have requested a password reset for your account.\n\n` +
                      `Please click on the following link, or paste it into your browser to complete the process:\n\n` +
                      `http://localhost:3000/reset-password/${token}\n\n` +
                      `If you did not request this, please ignore this email and your password will remain unchanged.`
            };

            // Send the email via Mailgun
            mg.messages.create(DOMAIN, data, (err, body) => {
                if (err) {
                    console.error('Error sending email:', err);
                    errorMessage = 'There was an error sending the password reset email. Please try again later.';
                    return res.render('forgot-password', { errorMessage, successMessage });
                }

                successMessage = 'Password reset link sent to your email.';
                return res.render('forgot-password', { successMessage, errorMessage });
            });
        });
    });
});
*/
router.post('/forgot-password', async (req, res) => {
    const email = req.body.email;

    try {
        // Call getUserByEmail with await (assuming it's already promise-based)
        const user = await userModel.getUserByEmail(email);
        
        let successMessage = null;
        let errorMessage = null;

        // Error handling if user not found
        if (!user) {
            errorMessage = 'No account found with that email address.';
            return res.render('forgot-password', { errorMessage, successMessage });
        }

        // Generate password reset token and expiration time
        const token = crypto.randomBytes(20).toString('hex');
        const expiration = Date.now() + 3600000; // Token valid for 1 hour

        // Save the token and expiration in the database (assuming this is now a promise-based method)
        await userModel.savePasswordResetToken(user.id, token, expiration);

        // Email setup for Mailgun
			const data = {
				from: 'shivamsudame108@gmail.com',
				to: email,
				subject: 'Ragaliabrary Project - Password Reset Request',
				html: `
					<p style="color: red;">You are receiving this because you (or someone else) have requested a password reset for your account.</p>
					<p>Please click on the following link, or paste it into your browser to complete the process:</p>
					<p><a href="http://localhost:3000/reset-password/${token}">Reset Password</a></p>
					<p>This token will expire one hour after creation.</p>
					<p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
					<br>
					<p>Ragaliabrary Admin</p>
					<p>Shivam Sudame</p>
				`
			};

        // Send the email via Mailgun (async call)
        await mg.messages.create(DOMAIN, data);

        // If everything goes well, render the success message
        successMessage = 'Password reset link sent to your email.';
        return res.render('forgot-password', { successMessage, errorMessage });
    } catch (err) {
        console.error('Error:', err);
        // If any error occurs, render the error message
        return res.render('forgot-password', { errorMessage: 'There was an error processing your request.' });
    }
});

// Route to send an email
router.post('/send-email', (req, res) => {
  const { to, subject, text } = req.body; // Get email details from the request body

  // Send the email
  sendEmail(to, subject, text);

  res.send('Email sent!');
});

// Reset Password Route (GET)

router.get('/reset-password/:token', (req, res) => {
    const { token } = req.params;
    console.log("In reset-password Token:", token);

    // Use callback-based getUserByResetToken
    userModel.getUserByResetToken(token, (err, user) => {
        if (err) {
            console.error('Error finding user by reset token:', err);
            return res.status(500).render('reset-password', { 
                errorMessage: 'There was an issue verifying your reset token. Please try again later.',
                token: null // Pass token as null
            });
        }

        // Handle case where no user is found
        if (!user) {
            console.log("No user found with the given token.");
            return res.status(400).render('reset-password', { 
                errorMessage: 'Invalid or expired token.',
                token: null // Pass token as null when invalid token
            });
        }

        // Check if the token has expired
        if (user.resetTokenExpiration < Date.now()) {
            console.log("Token is expired.");
            return res.status(400).render('reset-password', { 
                errorMessage: 'The reset token has expired.',
                token: null // Pass token as null if expired
            });
        }

        // If the token is valid, render the reset-password page with the token
        console.log("Rendering reset-password with token:", token);
        res.render('reset-password', { 
            token, 
            errorMessage: null 
        });
    });
});

/*
// Reset Password Route (POST)

router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
	console.log('Extracted Token in router.post functon:', token);
    const { password } = req.body;

    const user = await userModel.getUserByResetToken(token); // Find user by reset token

    if (!user || user.resetTokenExpiration < Date.now()) {
        return res.status(400).render('reset-password', { errorMessage: 'Invalid or expired token.' });
    }

	console.log('before hash password:', token);
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the new password
    await userModel.updatePassword(user.id, hashedPassword); // Update password in the database

    // Clear the reset token after it has been used
    await userModel.clearResetToken(user.id);
	console.log('after clearResetToken :', token);
    res.redirect('/login'); // Redirect to login after password reset
});

*/

// Reset Password Route (POST)
router.post('/reset-password/:token', (req, res) => {
    const { token } = req.params;
    console.log('Extracted Token in router.post function:', token);
    const { password } = req.body;

    // Find user by reset token with a callback
    userModel.getUserByResetToken(token, (err, user) => {
        if (err) {
            console.error('Error retrieving user:', err);
            return res.status(500).render('reset-password', { errorMessage: 'An error occurred. Please try again.' });
        }

        // Check if user exists and token is not expired
        if (!user || user.resetTokenExpiration < Date.now()) {
            return res.status(400).render('reset-password', { errorMessage: 'Invalid or expired token.' });
        }

        console.log('before hash password:', token);

        // Hash the new password and update it in the database
        bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
            if (hashErr) {
                console.error('Error hashing password:', hashErr);
                return res.status(500).render('reset-password', { errorMessage: 'An error occurred. Please try again.' });
            }

            userModel.updatePassword(user.id, hashedPassword, (updateErr) => {
                if (updateErr) {
                    console.error('Error updating password:', updateErr);
                    return res.status(500).render('reset-password', { errorMessage: 'An error occurred. Please try again.' });
                }

                // Clear the reset token after successful password reset
                userModel.clearResetToken(user.id, (clearErr) => {
                    if (clearErr) {
                        console.error('Error clearing reset token:', clearErr);
                        return res.status(500).render('reset-password', { errorMessage: 'An error occurred. Please try again.' });
                    }

                    console.log('after clearResetToken:', token);
                    res.redirect('/login'); // Redirect to login after password reset
                });
            });
        });
    });
});

/* End of New Block */

    // Logout Route
    router.get('/logout', (req, res) => {
        req.session.destroy();
        res.redirect('/login');
    });

    return router;
};
