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

router.get('/review/:student_id', async (req, res) => {
    
    if (!req.session.isLoggedIn || req.session.role !== 'classification_officer') {
        return res.redirect('/');
    }

    try {
        const studentId = req.params.student_id;
        const studentSql = `
            SELECT s.*, p.name as programme_name, p.y2_weighting, p.y3_weighting 
            FROM students s
            JOIN programmes p ON s.programme_id = p.programme_id
            WHERE s.student_id = ?
        `;
        const [studentData] = await connection.promise().query(studentSql, [studentId]);
        
        if (studentData.length === 0) return res.status(404).send("Student not found");
        const student = studentData[0];

        const marksSql = 'SELECT * FROM module_results WHERE student_id = ?';
        const [marks] = await connection.promise().query(marksSql, [studentId]);

        let y2TotalMarks = 0, y2TotalCredits = 0;
        let y3TotalMarks = 0, y3TotalCredits = 0;

        marks.forEach(module => {let finalMark = module.is_resit ? Math.min(module.mark, 40) : module.mark;

            if (module.academic_year === 2) {
                y2TotalMarks += (finalMark * module.credits);
                y2TotalCredits += module.credits;
            } else if (module.academic_year === 3) {
                y3TotalMarks += (finalMark * module.credits);
                y3TotalCredits += module.credits;
            }
        });

        let y2Avg = y2TotalCredits > 0 ? (y2TotalMarks / y2TotalCredits) : 0;
        let y3Avg = y3TotalCredits > 0 ? (y3TotalMarks / y3TotalCredits) : 0;

        let finalScore = (y2Avg * parseFloat(student.y2_weighting)) + (y3Avg * parseFloat(student.y3_weighting));

let proposedClass = "Fail";
        if (finalScore >= 70) proposedClass = "First Class Honours (1st)";
        else if (finalScore >= 60) proposedClass = "Upper Second Class (2:1)";
        else if (finalScore >= 50) proposedClass = "Lower Second Class (2:2)";
        else if (finalScore >= 40) proposedClass = "Third Class Honours";

        if (marks.length === 0) proposedClass = "Pending";

        res.render('review', {
            username: req.session.username,
            student: student,
            marks: marks,
            y2Avg: y2Avg.toFixed(2),
            y3Avg: y3Avg.toFixed(2),
            finalScore: finalScore.toFixed(2),
            proposedClass: proposedClass
        });

        } catch (error) {
        console.error(error);
        res.status(500).send("Error");
    }
});

router.post('/override/:student_id', async (req, res) => {
    if (!req.session.isLoggedIn || req.session.role !== 'classification_officer') {
        return res.redirect('/');
    }
    try {
        const studentId = req.params.student_id;
        const newClassification = req.body.override_classification;
        const rationale = req.body.rationale;

        const updateSql = `
            UPDATE students 
            SET manual_override_classification = ?, decision_rationale = ? 
            WHERE student_id = ?
        `;

        await connection.promise().query(updateSql, [newClassification, rationale, studentId]);

        res.redirect('/officer/review/' + studentId);

    } catch (error) {
        console.error("Error saving override:", error);
        res.status(500).send("Error");
    }
});




export default router;