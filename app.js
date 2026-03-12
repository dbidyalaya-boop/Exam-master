const express = require('express');
const cors = require('cors');
const { Client } = require('pg');

const app = express();
app.use(cors());
app.use(express.json()); // ଗୁରୁତ୍ୱପୂର୍ଣ୍ଣ: ଫର୍ମ ରୁ ଆସୁଥିବା ନୂଆ ଡାଟା ପଢ଼ିବା ପାଇଁ ଏହା ଆବଶ୍ୟକ!
app.use(express.static('public'));
const client = new Client({
  host: 'pg-1522e620-dbidyalaya-b6a8.f.aivencloud.com',
  port: 26768,
  user: 'avnadmin',
  password: 'AVNS_TSZkJ4FBLbluzwjGbnB',
  database: 'defaultdb',
  ssl: { rejectUnauthorized: false }
});

client.connect();

// ୧. ପ୍ରିନ୍ସିପାଲ୍ ଡ୍ୟାସବୋର୍ଡ API
app.get('/api/reports', async (req, res) => {
  const reportQuery = `
    SELECT t.name AS teacher_name, s.subject_name AS subject, AVG((m.marks_obtained * 100.0) / m.total_marks) AS average_percentage
    FROM Teachers t JOIN Teacher_Subject_Mapping tsm ON t.teacher_id = tsm.teacher_id
    JOIN Subjects s ON tsm.subject_id = s.subject_id JOIN Marks m ON s.subject_id = m.subject_id
    GROUP BY t.teacher_id, t.name, s.subject_name;
  `;
  try { const db_res = await client.query(reportQuery); res.json(db_res.rows); } catch (err) { res.status(500).send("Error"); }
});

// ୨. ଡ୍ରପ୍-ଡାଉନ୍ ପାଇଁ ପିଲାଙ୍କ ଲିଷ୍ଟ୍ API
app.get('/api/students', async (req, res) => {
  try { const db_res = await client.query('SELECT student_id, name FROM Students ORDER BY student_id ASC'); res.json(db_res.rows); } catch (err) { res.status(500).send("Error"); }
});

// ୩. ଗ୍ରାଫ୍ ପାଇଁ ଗୋଟିଏ ପିଲାର ମାର୍କ API
app.get('/api/student/:id', async (req, res) => {
  const studentId = req.params.id;
  const studentQuery = `SELECT s.subject_name, m.marks_obtained FROM Marks m JOIN Subjects s ON m.subject_id = s.subject_id WHERE m.student_id = $1;`;
  try { const db_res = await client.query(studentQuery, [studentId]); res.json(db_res.rows); } catch (err) { res.status(500).send("Error"); }
});

// ୪. ନୂଆ ପିଲା ଏବଂ ମାର୍କ ଯୋଡ଼ିବା ପାଇଁ ନୂଆ POST API
app.post('/api/add-student', async (req, res) => {
  const { name, roll_no, class_name, math_marks, science_marks } = req.body;

  try {
    // ପ୍ରଥମେ Students ଟେବୁଲ୍‌ରେ ପିଲାର ନାମ ସେଭ୍ କରିବା ଏବଂ ତାର ନୂଆ ID ଆଣିବା
    const studentResult = await client.query(
      'INSERT INTO Students (name, roll_no, class_name) VALUES ($1, $2, $3) RETURNING student_id',
      [name, roll_no, class_name]
    );
    const newStudentId = studentResult.rows[0].student_id;

    // ସେହି ନୂଆ ID ବ୍ୟବହାର କରି ଗଣିତ (subject_id=1) ଏବଂ ବିଜ୍ଞାନ (subject_id=2) ର ମାର୍କ ସେଭ୍ କରିବା
    await client.query(
      'INSERT INTO Marks (student_id, exam_id, subject_id, marks_obtained, total_marks) VALUES ($1, 1, 1, $2, 100), ($1, 1, 2, $3, 100)',
      [newStudentId, math_marks, science_marks]
    );

    res.json({ message: "Success" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { 
  console.log('✅ ସର୍ଭର ଲାଇଭ୍ ହେବାକୁ ପ୍ରସ୍ତୁତ ଅଛି ଏବଂ ପୋର୍ଟ: ' + PORT + ' ରେ ଚାଲୁଅଛି!'); 
});