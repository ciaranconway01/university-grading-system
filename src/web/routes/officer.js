import express from 'express';
import connection from '../db.js'

const router = express.Router();

router.get('/', async (req, res) => {
    if (!req.session.isLoggedIn || req.session.role !== 'classification_officer') {
        return res.redirect('/');
    }

    try {

        const assignmentSql = `
    SELECT p.programme_id, p.name
    FROM programmes p
    JOIN officer_assignments oa ON p.programme_id = oa.programme_id
    WHERE oa.user_id =?
    `;

        const [assignedProgrammes] = await connection.promise().query(assignmentSql, [req.session.user_id]);

        res.render('officer-dashboard', {
            username: req.session.username,
            programmes: assignedProgrammes
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Error");
    }
});


router.get('/api/students/:programme_id', async (req, res) => {
    if (!req.session.isLoggedIn || req.session.role !== 'classification_officer') {
        return res.json({ error: "Unauthorised user" });
    }

    try {
        const progId = req.params.programme_id;

        const sql = 'SELECT * FROM students WHERE programme_id = ?';
        const [students] = await connection.promise().query(sql, [progId]);


        res.json(students);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error" });
    }

});

export default router;