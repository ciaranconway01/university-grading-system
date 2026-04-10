import express from 'express';
import connection from '../db.js'


const router = express.Router();

// Must be logged in as a registry admin to work

router.get('/', async (req, res) => {
    if (!req.session.isLoggedIn || req.session.role !== 'registry_admin') {
        return res.redirect('/');
    }
    try {
        const [programmes] = await connection.promise().query('SELECT * FROM programmes');
        const [officers] = await connection.promise().query('SELECT user_id, username FROM users WHERE role = "classification_officer"');


        // Order by ascending
        const joinSql = `
            SELECT 
                p.name AS programme_name, 
                p.y2_weighting, 
                p.y3_weighting, 
                u.username AS officer_username
            FROM programmes p
            LEFT JOIN officer_assignments oa ON p.programme_id = oa.programme_id
            LEFT JOIN users u ON oa.user_id = u.user_id
            ORDER BY SUBSTRING(p.name, LOCATE(' ', p.name) + 1) ASC  
        `;

        const [programmeRegister] = await connection.promise().query(joinSql);

        res.render('admin-dashboard', {
            username: req.session.username,
            role: req.session.role,
            programmes: programmes,
            officers: officers,
            programmeRegister: programmeRegister
        });
    } catch (error) {
        console.error("Error loading list:", error);
        res.status(500).send("Database Error");
    }
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

router.post('/assign-officer', async (req, res) => {
    if (!req.session.isLoggedIn || req.session.role !== 'registry_admin') {
        return res.redirect('/');
    }

    const userId = req.body.user_id;
    const programmeId = req.body.programme_id;

    try {
        const sql = `INSERT INTO officer_assignments (user_id, programme_id) VALUES (?, ?)`;
        await connection.promise().query(sql, [userId, programmeId]);

        res.redirect('/admin');

    } catch (error) {
        console.error("Error assigning officer", error);
        res.status(500).send("Database Error: Officer might already be assigned here.");
    }
});


router.post('/add-programme', async (req, res) => {
    if (!req.session.isLoggedIn || req.session.role !== 'registry_admin') {
        return res.redirect('/');
    }

    const programmeName = req.body.programme_name;


    const y2Weighting = parseFloat(req.body.y2_weighting);
    const y3Weighting = parseFloat(req.body.y3_weighting);

    const totalWeight = Math.round((y2Weighting + y3Weighting) * 100) / 100;

    if (totalWeight !== 1.0) {
        return res.status(400).send(
            ` <h2> Programme Error </h2>
<p> Your total weightings add up to ${totalWeight}. They must exactly equal 1.0 </p>
<a href="/admin"> Click here to go back </a>

        `);
    }

    try {
        const sql = `INSERT INTO programmes (name, y2_weighting, y3_weighting) VALUES (?, ?, ?)`;
        await connection.promise().query(sql, [programmeName, y2Weighting, y3Weighting]);
        res.redirect('/admin');

    } catch (error) {
        console.error("Error creating programme", error);
        res.status(500).send("Database Error: Was not able to save the new programme.");
    }
});

router.post('/update-programme', async (req, res) => {
    if (!req.session.isLoggedIn || req.session.role !== 'registry_admin') {
        return res.redirect('/');
    }

    const { programme_id, y2_weighting, y3_weighting } = req.body;
    const y2 = parseFloat(y2_weighting);
    const y3 = parseFloat(y3_weighting);
    const total = Math.round((y2 + y3) * 100) / 100;

    if (total !== 1.0) {
        return res.status(400).send(`Error: New weightings equal ${total}. They must equal 1.0.`);
    }

    try {
        const sql = `UPDATE programmes SET y2_weighting = ?, y3_weighting = ? WHERE programme_id = ?`;
        await connection.promise().query(sql, [y2, y3, programme_id]);

        res.redirect('/admin');
    } catch (error) {
        console.error("Error updating programme:", error);
        res.status(500).send("Database Error: Could not update weighting.");
    }
});




router.post('/delete-programme', async (req, res) => {
    if (!req.session.isLoggedIn || req.session.role !== 'registry_admin') {
        return res.redirect('/');
    }

    const programmeId = req.body.programme_id;

    try {
        const deleteAssignmentsSql = `DELETE FROM officer_assignments WHERE programme_id = ?`;
        await connection.promise().query(deleteAssignmentsSql, [programmeId]);

        const deleteProgrammeSql = `DELETE FROM programmes WHERE programme_id = ?`;
        await connection.promise().query(deleteProgrammeSql, [programmeId]);

        res.redirect('/admin');

    } catch (error) {
        console.error("Error deleting programme:", error);
        res.status(500).send("Database Error: Could not delete the programme.");
    }
});

router.post('/delete-officer', async (req, res) => {
    if (!req.session.isLoggedIn || req.session.role !== 'registry_admin') {
        return res.redirect('/');
    }

    const userId = req.body.user_id;

    try {
        const deleteAssignmentsSql = `DELETE FROM officer_assignments WHERE user_id = ?`;
        await connection.promise().query(deleteAssignmentsSql, [userId]);

        const deleteUserSql = `DELETE FROM users WHERE user_id = ? AND role = 'classification_officer'`;
        await connection.promise().query(deleteUserSql, [userId]);

        res.redirect('/admin');

    } catch (error) {
        console.error("Error deleting officer:", error);
        res.status(500).send("Database Error: Could not delete the officer.");
    }
});



export default router;