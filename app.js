process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

const pool = new Pool({
    connectionString: "ଆପଣଙ୍କ_Aiven_ConnectionString_ଏଠାରେ_ରଖନ୍ତୁ",
    ssl: { rejectUnauthorized: false }
});

// ୧. ସବୁ ପିଲାଙ୍କ ଲିଷ୍ଟ୍ ପାଇଁ API
app.get('/api/students', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM Students ORDER BY name ASC');
        res.json(result.rows);
    } catch (err) { res.status(500).send(err.message); }
});

// ୨. ସବୁ ବିଷୟର ଲିଷ୍ଟ୍ ପାଇଁ API (ନୂଆ)
app.get('/api/subjects', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM Subjects');
        res.json(result.rows);
    } catch (err) { res.status(500).send(err.message); }
});

// ୩. ପିଲାଙ୍କୁ ବିଷୟ Assign କରିବା ପାଇଁ API (ନୂଆ)
app.post('/api/assign-subject', async (req, res) => {
    const { student_id, subject_id } = req.body;
    try {
        await pool.query('INSERT INTO Student_Subjects (student_id, subject_id) VALUES ($1, $2)', [student_id, subject_id]);
        res.send("✅ ବିଷୟ ସଫଳତାର ସହ ବଣ୍ଟନ କରାଗଲା!");
    } catch (err) { res.status(500).send(err.message); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 ସର୍ଭର http://localhost:${PORT} ରେ ଚାଲୁଅଛି!`);
});// ପିଲାଙ୍କ ଆଡମିଶନ ପାଇଁ API
app.post('/api/add-student', async (req, res) => {
    const { name, gender, phone } = req.body;
    try {
        await pool.query(
            'INSERT INTO Students (name, gender, phone) VALUES ($1, $2, $3)', 
            [name, gender, phone]
        );
        res.send("✅ ପିଲାଙ୍କ ଡାଟା ସଫଳତାର ସହ ସେଭ୍ ହେଲା!");
    } catch (err) { 
        console.error(err);
        res.status(500).send("Error: " + err.message); 
    }
});// ମାର୍କ ଏଣ୍ଟ୍ରି କରିବା ପାଇଁ API
app.post('/api/add-marks', async (req, res) => {
    const { student_id, subject_id, marks } = req.body;
    try {
        await pool.query(
            'INSERT INTO Exam_Marks (student_id, subject_id, marks_obtained) VALUES ($1, $2, $3)',
            [student_id, subject_id, marks]
        );
        res.send("✅ ମାର୍କ ସଫଳତାର ସହ ସେଭ୍ ହେଲା!");
    } catch (err) { res.status(500).send(err.message); }
});

// ଡ୍ୟାସବୋର୍ଡ ପାଇଁ ସବୁ ପିଲାଙ୍କ ମାର୍କ ତଥ୍ୟ ପାଇବା API
app.get('/api/dashboard-stats', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT s.name, sub.subject_name, m.marks_obtained 
            FROM Exam_Marks m
            JOIN Students s ON m.student_id = s.student_id
            JOIN Subjects sub ON m.subject_id = sub.subject_id
        `);
        res.json(result.rows);
    } catch (err) { res.status(500).send(err.message); }
});app.get('/api/dashboard-stats', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT s.name, sub.subject_name, m.marks_obtained 
            FROM Exam_Marks m
            JOIN Students s ON m.student_id = s.student_id
            JOIN Subjects sub ON m.subject_id = sub.subject_id
            ORDER BY m.exam_date DESC LIMIT 10
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});