import express from "express";
import connection from "./db.js";

const app = express();
const PORT = 3000;

app.set("view engine", "ejs");
app.set('views', 'src/web/views');

app.get('/', async (req, res) => {
    try {
        const sql = `SELECT * FROM users`;

        const [rowsData] = await connection.promise().query(sql);

        // Will come back and fix the UI and UX later
        res.send(`<h1> HeDClass Connection Test </h1>
<p> Database connection works. Found ${rowsData.length} users. </p>
    `);
    } catch (error) {

        console.error("Database Error:", error);
        res.status(500).send("Error: check the terminal");
    }
});

app.listen(PORT, () => { console.log('Server is running') });