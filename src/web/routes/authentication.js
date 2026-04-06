import express from 'express';
import connection from '../db.js'

const router = express.Router();

router.get('/', (req, res) => {
    if (req.session.isLoggedIn) {
        res.render('dashboard', {
            username: req.session.username,
            role: req.session.role
        });
    } else {
        res.render('login')
    }
});

router.post('/login', async (req, res) => {

    const submittedUsername = req.body.username;
    const submittedPassword = req.body.password;



    try {

        const sql = `SELECT * FROM users WHERE username = ?`;
        const [rows] = await connection.promise().query(sql, [submittedUsername])

        if (rows.length === 0) {
            return res.render('login', { error: "Invalid username or passowrd." })
        }

        const user = rows[0];

        if (submittedPassword === user.password_hash) {
            req.session.isLoggedIn = true;
            req.session.username = user.username;
            req.session.role = user.role;


            res.redirect('/');
        } else {
            res.render('login', { error: "Invalid username or password." })
        };

    }

    catch (error) {
        console.error("Error", error);
        res.status(500).send("Error during login")
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Logout error:", err);
        }
        res.redirect('/');
    });
});


export default router;