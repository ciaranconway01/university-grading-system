import express from 'express';
import connection from '../db.js'

const router = express.Router();

router.get('/', (req, res) => {

    res.render('login')
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

            res.send(`
    <h1> Welcome, ${user.username} </h1>
<p> Your role is: ${user.role} </p>
    ` );

        } else {

            res.render('login', { error: "Invalid username or password." })
        };

    }

    catch (error) {
        console.error("Error", error);
        res.status(500).send("Error during login")
    }
});


export default router;