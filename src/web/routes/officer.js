import express from 'express';
import connection from '../db.js'

const router = express.Router();


// Only a classification officer can access this.
router.get('/', async (req, res) => {
    if (!req.session.isLoggedIn || req.session.role !== 'classification_officer') {
        return res.redirect('/');
    }

    try {
// SQL JOIN - Querying a many to many relationship, joining the programmes table with the officer_Assignments junction table to ensure this specific officer only sees what they are 
// explicity assigned to
        const assignmentSql = `
    SELECT p.programme_id, p.name
    FROM programmes p
    JOIN officer_assignments oa ON p.programme_id = oa.programme_id
    WHERE oa.user_id =?
    `;
// Using paramtertised queries (?) to protect against SQL injection
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

// This returns raw JSON data so our frontend JS can update the dashboard dynamically
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
        // Fetches the student and pulls the specific weightings for their programme
        const studentSql = `
            SELECT s.*, p.name as programme_name, p.y2_weighting, p.y3_weighting 
            FROM students s
            JOIN programmes p ON s.programme_id = p.programme_id
            WHERE s.student_id = ?
        `;
        const [studentData] = await connection.promise().query(studentSql, [studentId]);

        if (studentData.length === 0) return res.status(404).send("Student not found");
        const student = studentData[0];
// Fetches all one to many module results linked to this student
        const marksSql = 'SELECT * FROM module_results WHERE student_id = ?';
        const [marks] = await connection.promise().query(marksSql, [studentId]);


        
        let y2TotalMarks = 0, y2TotalCredits = 0;
        let y3TotalMarks = 0, y3TotalCredits = 0;

        // if is_resit is true - math.min forces the mark to be 40
        marks.forEach(module => {
            let finalMark = module.is_resit ? Math.min(module.mark, 40) : module.mark;

            if (module.academic_year === 2) {
                y2TotalMarks += (finalMark * module.credits);
                y2TotalCredits += module.credits;
            } else if (module.academic_year === 3) {
                y3TotalMarks += (finalMark * module.credits);
                y3TotalCredits += module.credits;
            }
        });
// calculates averages
        let y2Avg = y2TotalCredits > 0 ? (y2TotalMarks / y2TotalCredits) : 0;
        let y3Avg = y3TotalCredits > 0 ? (y3TotalMarks / y3TotalCredits) : 0;
// applying dynamic programme weightings to get the final score
  let finalScore = (y2Avg * parseFloat(student.y2_weighting)) + (y3Avg * parseFloat(student.y3_weighting));

  // progression check: ensuring the student has exactly 120 credits per year
        let proposedClass = "Fail";
        if (y2TotalCredits < 120 || y3TotalCredits < 120) {
            proposedClass = "Not Eligible (Missing Credits)";
            finalScore = 0;
        } else {
            // tier boundaries
            if (finalScore >= 70) proposedClass = "First Class Honours (1st)";
            else if (finalScore >= 60) proposedClass = "Upper Second Class (2:1)";
            else if (finalScore >= 50) proposedClass = "Lower Second Class (2:2)";
            else if (finalScore >= 40) proposedClass = "Third Class Honours";

        }

        // For students with zero information
        if (marks.length === 0) {
            proposedClass = "Pending";
            finalScore = 0;
        }

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
// Manual override or UPDATE
router.post('/override/:student_id', async (req, res) => {
    if (!req.session.isLoggedIn || req.session.role !== 'classification_officer') {
        return res.redirect('/');
    }
    try {
        const studentId = req.params.student_id;
        const newClassification = req.body.override_classification;
        const rationale = req.body.rationale;

        // Updates the record 
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
// Enrol students or create
router.post('/add-student', async (req, res) => {

    if (!req.session.isLoggedIn || req.session.role !== 'classification_officer') {
        return res.redirect('/');
    }

    try {
        const progId = req.body.programme_id;
        const studentNum = req.body.student_number;
        const fName = req.body.first_name;
        const lName = req.body.last_name;

        const insertSql = `
            INSERT INTO students (student_number, first_name, last_name, programme_id, calculated_classification) 
            VALUES (?, ?, ?, ?, 'Pending')
        `;

        await connection.promise().query(insertSql, [studentNum, fName, lName, progId]);

        res.redirect('/officer');

    } catch (error) {
        console.error("Error adding student:", error);
        res.status(500).send("Database Error while creating student.");
    }
});
// Deletes student
router.post('/delete-student/:student_id', async (req, res) => {

    if (!req.session.isLoggedIn || req.session.role !== 'classification_officer') {
        return res.redirect('/');
    }

    try {
        const studentId = req.params.student_id;

        // Module marks of child records must be deleted first before the student is deleted
        await connection.promise().query('DELETE FROM module_results WHERE student_id = ?', [studentId]);

        await connection.promise().query('DELETE FROM students WHERE student_id = ?', [studentId]);

        res.redirect('/officer');

    } catch (error) {
        console.error("Error deleting student:", error);
        res.status(500).send("Error");
    }
});
// Add or update the grade
router.post('/add-grade/:student_id', async (req, res) => {
    if (!req.session.isLoggedIn || req.session.role !== 'classification_officer') {
        return res.redirect('/');
    }

    try {
        const studentId = req.params.student_id;
        const year = req.body.academic_year;
        const moduleName = req.body.module_name;
        const credits = req.body.credits;
        const mark = req.body.mark;
        const isResit = req.body.is_resit;
// Check if this module already exists
        const checkSql = `SELECT * FROM module_results WHERE student_id = ? AND module_name = ?`;
        const [existing] = await connection.promise().query(checkSql, [studentId, moduleName]);
// Update if the module exists, insert if it does not
        if (existing.length > 0) {

            const updateSql = `
                UPDATE module_results 
                SET mark = ?, credits = ?, is_resit = ?, academic_year = ?
                WHERE student_id = ? AND module_name = ?
            `;
            await connection.promise().query(updateSql, [mark, credits, isResit, year, studentId, moduleName]);
        } else {

            const insertSql = `
                INSERT INTO module_results (student_id, module_name, academic_year, credits, mark, is_resit) 
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            await connection.promise().query(insertSql, [studentId, moduleName, year, credits, mark, isResit]);
        }

        res.redirect('/officer/review/' + studentId);

    } catch (error) {
        console.error("Error saving or updating grade:", error);
        res.status(500).send("Database Error.");
    }
});



export default router;