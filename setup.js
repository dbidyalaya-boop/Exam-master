process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const { Pool } = require('pg');

const pool = new Pool({
    user: 'avnadmin',
    host: 'pg-1522e620-dbidyalaya-b6a8.f.aivencloud.com',
    database: 'defaultdb',
    password: 'AVNS_TSZkJ4FBLbluzwjGbnB', // ମୁଁ ଆପଣଙ୍କ ପାସୱାର୍ଡ ଏଠାରେ ସଠିକ୍ ଭାବେ ଦେଇଛି
    port: 26768,
    ssl: { rejectUnauthorized: false }
});

async function runSetup() {
    try {
        console.log("⏳ Exam_Marks Table ତିଆରି ହେଉଛି...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS Exam_Marks (
                mark_id SERIAL PRIMARY KEY,
                student_id INT REFERENCES Students(student_id),
                subject_id INT REFERENCES Subjects(subject_id),
                marks_obtained INT CHECK (marks_obtained <= 100),
                exam_date DATE DEFAULT CURRENT_DATE
            );
        `);
        console.log("✅ ସଫଳତା! Exam_Marks Table ଏବେ ପ୍ରସ୍ତୁତ ହୋଇଗଲା।");
    } catch (err) {
        console.error("❌ ଏରର୍ ଆସିଲା:", err.message);
    } finally {
        await pool.end();
    }
}

runSetup();