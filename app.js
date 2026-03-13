process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// ଡାଟାବେସ୍ କନେକ୍ସନ୍ (ମୁଁ ଆପଣଙ୍କ ପାସୱାର୍ଡ ଠିକ୍ କରିଦେଇଛି)
const pool = new Pool({
    connectionString: "postgres://avnadmin:AVNS_TSZkj4FBLbluzwjGbnBY@pg-1522e620-dbidyalaya-b6a8.f.aivencloud.com:26768/defaultdb?sslmode=require",
    ssl: { rejectUnauthorized: false }
});

// ୧. Dashboard Graph ପାଇଁ API (ଏହା ନଥିଲା)
app.get('/api/dashboard-stats', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT s.name, m.marks_obtained 
            FROM Exam_Marks m
            JOIN Students s ON m.student_id = s.student_id
            ORDER BY m.exam_date DESC LIMIT 10
        `);
        res.json(result.rows);
    } catch (err) { res.status(500).send(err.message); }
});
// Dashboard Graph ପାଇଁ API
app.get('/api/dashboard-stats', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT s.name, m.marks_obtained 
            FROM Exam_Marks m
            JOIN Students s ON m.student_id = s.student_id
            ORDER BY m.exam_date DESC LIMIT 10
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send(err.message);
    }
});
// ୨. ମାର୍କ ସେଭ୍ କରିବା ପାଇଁ API
app.post('/api/save-marks', async (req, res) => {
    const { student_id, subject_id, marks_obtained } = req.body;
    try {
        await pool.query(
            'INSERT INTO Exam_Marks (student_id, subject_id, marks_obtained) VALUES ($1, $2, $3)',
            [student_id, subject_id, marks_obtained]
        );
        res.send("✅ ମାର୍କ ସଫଳତାର ସହ ସେଭ୍ ହେଲା!");
    } catch (err) { res.status(500).send(err.message); }
});

// ୩. ପିଲାଙ୍କ ଲିଷ୍ଟ ପାଇଁ API
app.get('/api/students', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM Students ORDER BY name ASC');
        res.json(result.rows);
    } catch (err) { res.status(500).send(err.message); }
});

// ୪. ବିଷୟ ଲିଷ୍ଟ ପାଇଁ API
app.get('/api/subjects', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM Subjects');
        res.json(result.rows);
    } catch (err) { res.status(500).send(err.message); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 ସର୍ଭର http://localhost:${PORT} ରେ ଚାଲୁଅଛି!`);
});