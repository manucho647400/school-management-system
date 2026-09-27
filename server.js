const express = require('express');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'school.db');
const authTokens = new Map();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function openDb() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const db = new sqlite3.Database(DB_PATH);

  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT DEFAULT 'admin'
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        phone TEXT,
        date_of_birth TEXT,
        enrollment_date TEXT,
        status TEXT,
        guardian_name TEXT,
        address TEXT
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS teachers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        phone TEXT,
        subject TEXT,
        hire_date TEXT,
        status TEXT
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_name TEXT,
        code TEXT,
        credits INTEGER,
        teacher_id INTEGER,
        room_number TEXT,
        schedule TEXT,
        FOREIGN KEY (teacher_id) REFERENCES teachers(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS enrollments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER,
        course_id INTEGER,
        semester TEXT,
        FOREIGN KEY (student_id) REFERENCES students(id),
        FOREIGN KEY (course_id) REFERENCES courses(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS grades (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER,
        course_id INTEGER,
        exam TEXT,
        score REAL,
        remarks TEXT,
        recorded_at TEXT,
        FOREIGN KEY (student_id) REFERENCES students(id),
        FOREIGN KEY (course_id) REFERENCES courses(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER,
        course_id INTEGER,
        date TEXT,
        present INTEGER,
        FOREIGN KEY (student_id) REFERENCES students(id),
        FOREIGN KEY (course_id) REFERENCES courses(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS fees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER,
        amount REAL,
        due_date TEXT,
        status TEXT,
        notes TEXT,
        FOREIGN KEY (student_id) REFERENCES students(id)
      )
    `);

    db.get('SELECT COUNT(*) AS count FROM users WHERE username = ?', ['admin'], (err, row) => {
      if (err) {
        console.error('Error checking admin user:', err.message);
        return;
      }

      if (row.count === 0) {
        db.run(
          'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
          ['admin', 'admin123', 'admin'],
          (insertErr) => {
            if (insertErr) {
              console.error('Failed to seed admin user:', insertErr.message);
            }
          }
        );
      }
    });

    db.get('SELECT COUNT(*) AS count FROM teachers', (err, row) => {
      if (err) return;
      if (row.count > 0) return;

      db.run(`INSERT INTO teachers (name, email, phone, subject, hire_date, status) VALUES
        ('Grace Njeri', 'grace.njeri@school.edu', '+254700111001', 'Mathematics', '2021-01-10', 'active'),
        ('Daniel Otieno', 'daniel.otieno@school.edu', '+254700111002', 'Science', '2020-08-18', 'active'),
        ('Aisha Yusuf', 'aisha.yusuf@school.edu', '+254700111003', 'English', '2019-04-21', 'active')`);
    });

    db.get('SELECT COUNT(*) AS count FROM students', (err, row) => {
      if (err) return;
      if (row.count > 0) return;

      db.run(`INSERT INTO students (name, email, phone, date_of_birth, enrollment_date, status, guardian_name, address) VALUES
        ('Anne Wanjiku', 'anne.wanjiku@student.edu', '+254712000001', '2009-05-14', '2024-01-15', 'active', 'Jane Wanjiku', 'Nairobi, Kenya'),
        ('Brian Kibet', 'brian.kibet@student.edu', '+254712000002', '2010-02-02', '2024-01-15', 'active', 'Peter Kibet', 'Kisumu, Kenya'),
        ('Cynthia Achieng', 'cynthia.achieng@student.edu', '+254712000003', '2009-11-19', '2024-01-15', 'active', 'Mary Achieng', 'Mombasa, Kenya'),
        ('David Mutua', 'david.mutua@student.edu', '+254712000004', '2011-04-26', '2024-01-15', 'active', 'Robert Mutua', 'Nakuru, Kenya')`);
    });

    db.get('SELECT COUNT(*) AS count FROM courses', (err, row) => {
      if (err) return;
      if (row.count > 0) return;

      db.run(`INSERT INTO courses (course_name, code, credits, teacher_id, room_number, schedule) VALUES
        ('Algebra I', 'MATH101', 4, 1, 'Room A1', 'Mon/Wed/Fri 08:00-09:00'),
        ('Biology Basics', 'BIO201', 4, 2, 'Lab 2', 'Tue/Thu 10:00-11:30'),
        ('English Literature', 'ENG110', 3, 3, 'Room B5', 'Mon/Wed 11:00-12:00')`);
    });

    db.get('SELECT COUNT(*) AS count FROM enrollments', (err, row) => {
      if (err) return;
      if (row.count > 0) return;

      db.run(`INSERT INTO enrollments (student_id, course_id, semester) VALUES
        (1, 1, '2024/2025 Term 1'),
        (1, 2, '2024/2025 Term 1'),
        (2, 1, '2024/2025 Term 1'),
        (3, 3, '2024/2025 Term 1'),
        (4, 2, '2024/2025 Term 1')`);
    });

    db.get('SELECT COUNT(*) AS count FROM grades', (err, row) => {
      if (err) return;
      if (row.count > 0) return;

      db.run(`INSERT INTO grades (student_id, course_id, exam, score, remarks, recorded_at) VALUES
        (1, 1, 'CAT 1', 88, 'Excellent progress', '2024-03-08'),
        (1, 2, 'CAT 1', 91, 'Strong scientific reasoning', '2024-03-08'),
        (2, 1, 'CAT 1', 76, 'Good work', '2024-03-08'),
        (3, 3, 'CAT 1', 83, 'Consistent performance', '2024-03-08'),
        (4, 2, 'CAT 1', 70, 'Needs more revision', '2024-03-08')`);
    });

    db.get('SELECT COUNT(*) AS count FROM attendance', (err, row) => {
      if (err) return;
      if (row.count > 0) return;

      db.run(`INSERT INTO attendance (student_id, course_id, date, present) VALUES
        (1, 1, '2024-03-04', 1),
        (2, 1, '2024-03-04', 1),
        (3, 3, '2024-03-04', 0),
        (4, 2, '2024-03-04', 1),
        (1, 2, '2024-03-06', 1),
        (2, 1, '2024-03-06', 0)`);
    });

    db.get('SELECT COUNT(*) AS count FROM fees', (err, row) => {
      if (err) return;
      if (row.count > 0) return;

      db.run(`INSERT INTO fees (student_id, amount, due_date, status, notes) VALUES
        (1, 25000, '2024-03-15', 'paid', 'School fees paid in full'),
        (2, 25000, '2024-03-15', 'pending', 'Payment due soon'),
        (3, 25000, '2024-03-15', 'paid', 'Tuition settled'),
        (4, 25000, '2024-03-15', 'pending', 'Awaiting payment')`);
    });
  });

  return db;
}

const db = openDb();

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null;

  if (!token || !authTokens.has(token)) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' });
  }

  req.user = authTokens.get(token);
  next();
}

app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', message: 'School system is running' });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error.' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    authTokens.set(token, { id: user.id, username: user.username, role: user.role });

    res.json({
      token,
      user: { id: user.id, username: user.username, role: user.role }
    });
  });
});

app.post('/api/logout', requireAuth, (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null;

  if (token) {
    authTokens.delete(token);
  }

  res.json({ success: true, message: 'Logged out successfully.' });
});

app.get('/api/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

app.get('/api/overview', requireAuth, (_, res) => {
  const queries = [
    'SELECT COUNT(*) AS totalStudents FROM students',
    'SELECT COUNT(*) AS totalTeachers FROM teachers',
    'SELECT COUNT(*) AS totalCourses FROM courses',
    'SELECT ROUND(COALESCE(AVG(score), 0), 2) AS averageScore FROM grades',
    "SELECT COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) AS collectedFees FROM fees",
    "SELECT COALESCE(SUM(CASE WHEN present = 1 THEN 1 ELSE 0 END), 0) AS presentCount, COUNT(*) AS attendanceCount FROM attendance"
  ];

  let results = {};

  const after = (index) => {
    return (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Unable to load dashboard overview.' });
      }
      results[`q${index}`] = row;
      if (Object.keys(results).length === queries.length) {
        const totalStudents = Number(results.q0.totalStudents || 0);
        const totalTeachers = Number(results.q1.totalTeachers || 0);
        const totalCourses = Number(results.q2.totalCourses || 0);
        const averageScore = Number(results.q3.averageScore || 0);
        const collectedFees = Number(results.q4.collectedFees || 0);
        const attendanceCount = Number(results.q5.attendanceCount || 0);
        const presentCount = Number(results.q5.presentCount || 0);
        const attendanceRate = attendanceCount ? ((presentCount / attendanceCount) * 100).toFixed(1) : 0;

        res.json({
          totalStudents,
          totalTeachers,
          totalCourses,
          averageScore,
          collectedFees,
          attendanceRate
        });
      }
    };
  };

  queries.forEach((query, index) => {
    db.get(query, after(index));
  });
});

app.get('/api/students', requireAuth, (_, res) => {
  const sql = 'SELECT * FROM students ORDER BY id DESC';
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Unable to fetch students.' });
    res.json(rows);
  });
});

app.post('/api/students', requireAuth, (req, res) => {
  const { name, email, phone, date_of_birth, enrollment_date, status, guardian_name, address } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }

  const sql = `INSERT INTO students (name, email, phone, date_of_birth, enrollment_date, status, guardian_name, address)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  db.run(sql, [name, email, phone || '', date_of_birth || '', enrollment_date || new Date().toISOString().slice(0,10), status || 'active', guardian_name || '', address || ''], function(err) {
    if (err) return res.status(500).json({ error: 'Unable to create student.' });
    res.status(201).json({ id: this.lastID, message: 'Student created successfully.' });
  });
});

app.put('/api/students/:id', requireAuth, (req, res) => {
  const { name, email, phone, date_of_birth, enrollment_date, status, guardian_name, address } = req.body;
  const sql = `UPDATE students SET name = ?, email = ?, phone = ?, date_of_birth = ?, enrollment_date = ?, status = ?, guardian_name = ?, address = ? WHERE id = ?`;

  db.run(sql, [name, email, phone || '', date_of_birth || '', enrollment_date || '', status || 'active', guardian_name || '', address || '', req.params.id], function(err) {
    if (err) return res.status(500).json({ error: 'Unable to update student.' });
    res.json({ message: 'Student updated successfully.' });
  });
});

app.delete('/api/students/:id', requireAuth, (req, res) => {
  db.run('DELETE FROM students WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: 'Unable to delete student.' });
    res.json({ message: 'Student deleted.' });
  });
});

app.get('/api/teachers', requireAuth, (_, res) => {
  db.all('SELECT * FROM teachers ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Unable to fetch teachers.' });
    res.json(rows);
  });
});

app.post('/api/teachers', requireAuth, (req, res) => {
  const { name, email, phone, subject, hire_date, status } = req.body;

  if (!name || !email || !subject) {
    return res.status(400).json({ error: 'Name, email and subject are required.' });
  }

  const sql = `INSERT INTO teachers (name, email, phone, subject, hire_date, status) VALUES (?, ?, ?, ?, ?, ?)`;
  db.run(sql, [name, email, phone || '', subject, hire_date || new Date().toISOString().slice(0,10), status || 'active'], function(err) {
    if (err) return res.status(500).json({ error: 'Unable to create teacher.' });
    res.status(201).json({ id: this.lastID, message: 'Teacher created successfully.' });
  });
});

app.put('/api/teachers/:id', requireAuth, (req, res) => {
  const { name, email, phone, subject, hire_date, status } = req.body;
  const sql = `UPDATE teachers SET name = ?, email = ?, phone = ?, subject = ?, hire_date = ?, status = ? WHERE id = ?`;
  db.run(sql, [name, email, phone || '', subject, hire_date || '', status || 'active', req.params.id], function(err) {
    if (err) return res.status(500).json({ error: 'Unable to update teacher.' });
    res.json({ message: 'Teacher updated successfully.' });
  });
});

app.delete('/api/teachers/:id', requireAuth, (req, res) => {
  db.run('DELETE FROM teachers WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: 'Unable to delete teacher.' });
    res.json({ message: 'Teacher deleted.' });
  });
});

app.get('/api/courses', requireAuth, (_, res) => {
  const sql = `SELECT c.*, t.name AS teacher_name FROM courses c LEFT JOIN teachers t ON t.id = c.teacher_id ORDER BY c.id DESC`;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Unable to fetch courses.' });
    res.json(rows);
  });
});

app.post('/api/courses', requireAuth, (req, res) => {
  const { course_name, code, credits, teacher_id, room_number, schedule } = req.body;

  if (!course_name || !code) {
    return res.status(400).json({ error: 'Course name and code are required.' });
  }

  const sql = `INSERT INTO courses (course_name, code, credits, teacher_id, room_number, schedule) VALUES (?, ?, ?, ?, ?, ?)`;
  db.run(sql, [course_name, code, Number(credits) || 0, Number(teacher_id) || null, room_number || '', schedule || ''], function(err) {
    if (err) return res.status(500).json({ error: 'Unable to create course.' });
    res.status(201).json({ id: this.lastID, message: 'Course created successfully.' });
  });
});

app.put('/api/courses/:id', requireAuth, (req, res) => {
  const { course_name, code, credits, teacher_id, room_number, schedule } = req.body;
  const sql = `UPDATE courses SET course_name = ?, code = ?, credits = ?, teacher_id = ?, room_number = ?, schedule = ? WHERE id = ?`;
  db.run(sql, [course_name, code, Number(credits) || 0, Number(teacher_id) || null, room_number || '', schedule || '', req.params.id], function(err) {
    if (err) return res.status(500).json({ error: 'Unable to update course.' });
    res.json({ message: 'Course updated successfully.' });
  });
});

app.delete('/api/courses/:id', requireAuth, (req, res) => {
  db.run('DELETE FROM courses WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: 'Unable to delete course.' });
    res.json({ message: 'Course deleted.' });
  });
});

app.get('/api/grades', requireAuth, (_, res) => {
  const sql = `SELECT g.*, s.name AS student_name, c.course_name FROM grades g
               JOIN students s ON s.id = g.student_id
               JOIN courses c ON c.id = g.course_id
               ORDER BY g.id DESC`;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Unable to fetch grades.' });
    res.json(rows);
  });
});

app.post('/api/grades', requireAuth, (req, res) => {
  const { student_id, course_id, exam, score, remarks } = req.body;
  if (!student_id || !course_id || !exam) {
    return res.status(400).json({ error: 'Student, course and exam are required.' });
  }

  const sql = `INSERT INTO grades (student_id, course_id, exam, score, remarks, recorded_at) VALUES (?, ?, ?, ?, ?, ?)`;
  db.run(sql, [Number(student_id), Number(course_id), exam, Number(score) || 0, remarks || '', new Date().toISOString().slice(0, 10)], function(err) {
    if (err) return res.status(500).json({ error: 'Unable to save grade.' });
    res.status(201).json({ id: this.lastID, message: 'Grade saved successfully.' });
  });
});

app.get('/api/attendance', requireAuth, (_, res) => {
  const sql = `SELECT a.*, s.name AS student_name, c.course_name FROM attendance a
               JOIN students s ON s.id = a.student_id
               JOIN courses c ON c.id = a.course_id
               ORDER BY a.id DESC`;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Unable to fetch attendance.' });
    res.json(rows);
  });
});

app.post('/api/attendance', requireAuth, (req, res) => {
  const { student_id, course_id, date, present } = req.body;
  if (!student_id || !course_id || !date) {
    return res.status(400).json({ error: 'Student, course and date are required.' });
  }

  const sql = `INSERT INTO attendance (student_id, course_id, date, present) VALUES (?, ?, ?, ?)`;
  db.run(sql, [Number(student_id), Number(course_id), date, present ? 1 : 0], function(err) {
    if (err) return res.status(500).json({ error: 'Unable to save attendance.' });
    res.status(201).json({ id: this.lastID, message: 'Attendance recorded.' });
  });
});

app.get('/api/fees', requireAuth, (_, res) => {
  const sql = `SELECT f.*, s.name AS student_name FROM fees f JOIN students s ON s.id = f.student_id ORDER BY f.id DESC`;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Unable to fetch fee records.' });
    res.json(rows);
  });
});

app.post('/api/fees', requireAuth, (req, res) => {
  const { student_id, amount, due_date, status, notes } = req.body;
  if (!student_id || !amount) {
    return res.status(400).json({ error: 'Student and amount are required.' });
  }

  const sql = `INSERT INTO fees (student_id, amount, due_date, status, notes) VALUES (?, ?, ?, ?, ?)`;
  db.run(sql, [Number(student_id), Number(amount), due_date || new Date().toISOString().slice(0,10), status || 'pending', notes || ''], function(err) {
    if (err) return res.status(500).json({ error: 'Unable to save fee record.' });
    res.status(201).json({ id: this.lastID, message: 'Fee record saved.' });
  });
});

app.put('/api/fees/:id', requireAuth, (req, res) => {
  const { status } = req.body;
  db.run('UPDATE fees SET status = ? WHERE id = ?', [status || 'pending', req.params.id], function(err) {
    if (err) return res.status(500).json({ error: 'Unable to update fee record.' });
    res.json({ message: 'Fee status updated.' });
  });
});

app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`School management system running at http://localhost:${PORT}`);
});
