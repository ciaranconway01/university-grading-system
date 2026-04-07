import express from 'express';
import connection from '../db.js'


const router = express.Router();

router.get('/', (req, res) => {
    if (!req.session.isLoggedIn || req.session.role !== 'registry_admin') {
        return res.redirect('/');
    }

    res.render('admin-dashboard', {
        username: req.session.username,
        role: req.session.role
    });
});

router.post('/add-officer', async (req, res) => {
    if (!req.session.isLoggedIn || req.session.role !== 'registry_admin') {
        return res.redirect('/');
    }

    const newUsername = req.body.new_username;
    const newPassword = req.body.new_password;
    const programmeId = req.body.programme_id;
    const role = 'classification_officer';

    try {
        const userSql = `INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)`;
        const [result] = await connection.promise().query(userSql, [newUsername, newPassword, role]);

        const newUserId = result.insertId;

        const assignmentSql = `INSERT INTO officer_assignments (user_id, programme_id) VALUES (?, ?)`;
        await connection.promise().query(assignmentSql, [newUserId, programmeId]);

        res.redirect('/admin');

    } catch (error) {
        console.error("Error creating classification officer", error);
        res.status(500).send("Database Error: " + error.message);
    }

});

export default router;