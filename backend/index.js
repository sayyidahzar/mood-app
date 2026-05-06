require('dotenv').config();

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

// =======================
// MIDDLEWARE
// =======================
app.use(cors());
app.use(express.json());

// =======================
// DATABASE (POOL - STABLE)
// =======================
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
        rejectUnauthorized: false
    }
});

// TEST CONNECTION
db.getConnection((err, connection) => {
    if (err) {
        console.log('❌ DB gagal connect:', err);
    } else {
        console.log('✅ DB connected!');
        connection.release();
    }
});

// =======================
// ROOT
// =======================
app.get('/', (req, res) => {
    res.send('API jalan 🚀');
});

// =======================
// USERS
// =======================
app.get('/users', (req, res) => {
    db.query('SELECT * FROM users', (err, result) => {
        if (err) return res.status(500).json({ message: 'Gagal ambil data ❌' });
        res.json(result);
    });
});

// =======================
// REGISTER
// =======================
app.post('/register', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.json({ message: 'Isi semua data 😭' });
    }

    db.query(
        'SELECT * FROM users WHERE username=?',
        [username],
        (err, result) => {
            if (err) return res.status(500).json({ message: 'Server error ❌' });

            if (result.length > 0) {
                return res.json({ message: 'Username sudah dipakai 😢' });
            }

            db.query(
                'INSERT INTO users (username, password) VALUES (?, ?)',
                [username, password],
                (err) => {
                    if (err) return res.status(500).json({ message: 'Register gagal ❌' });
                    res.json({ message: 'Register berhasil 💖' });
                }
            );
        }
    );
});

// =======================
// LOGIN
// =======================
app.post('/login', (req, res) => {
    const username = req.body.username?.trim();
    const password = req.body.password?.trim();

    if (!username || !password) {
        return res.json({ message: 'Isi dulu 😭' });
    }

    db.query(
        'SELECT * FROM users WHERE username=? AND password=?',
        [username, password],
        (err, result) => {
            if (err) return res.status(500).json({ message: 'Error server ❌' });

            if (result.length > 0) {
                res.json({
                    message: 'Login berhasil 🔥',
                    success: true,
                    user: result[0]
                });
            } else {
                res.json({
                    message: 'Login gagal 😢',
                    success: false
                });
            }
        }
    );
});

// =======================
// UPDATE USER
// =======================
app.put('/update-user/:id', (req, res) => {
    const { username, password } = req.body;
    const id = req.params.id;

    db.query(
        'UPDATE users SET username=?, password=? WHERE id=?',
        [username, password, id],
        (err) => {
            if (err) return res.status(500).json({ message: 'Update gagal ❌' });
            res.json({ message: 'Update user berhasil 🔥' });
        }
    );
});

// =======================
// MOODS
// =======================
app.get('/moods', (req, res) => {
    db.query('SELECT * FROM moods', (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    });
});

// =======================
// CREATE ENTRY
// =======================
app.post('/entry', (req, res) => {
    const { username, mood_id, story } = req.body;

    if (!username || !mood_id) {
        return res.json({ message: 'Data tidak lengkap 😭' });
    }

    db.query(
        'INSERT INTO entries (username, mood_id, story) VALUES (?, ?, ?)',
        [username, mood_id, story],
        (err) => {
            if (err) return res.status(500).send(err);
            res.json({ message: 'Berhasil disimpan 💾' });
        }
    );
});

// =======================
// GET HISTORY
// =======================
app.get('/history/:username', (req, res) => {
    const username = req.params.username;

    db.query(
        'SELECT * FROM entries WHERE username=? ORDER BY created_at DESC',
        [username],
        (err, result) => {
            if (err) return res.json([]);
            res.json(result);
        }
    );
});

// =======================
// UPDATE ENTRY
// =======================
app.put('/update/:id', (req, res) => {
    const id = req.params.id;
    const { story } = req.body;

    db.query(
        'UPDATE entries SET story=? WHERE id=?',
        [story, id],
        (err) => {
            if (err) return res.json({ message: 'Update gagal ❌' });
            res.json({ message: 'Update berhasil ✏️' });
        }
    );
});

// =======================
// DELETE ENTRY
// =======================
app.delete('/delete/:id', (req, res) => {
    const id = req.params.id;

    db.query(
        'DELETE FROM entries WHERE id=?',
        [id],
        (err) => {
            if (err) return res.json({ message: 'Hapus gagal ❌' });
            res.json({ message: 'Berhasil dihapus 🗑️' });
        }
    );
});

// =======================
// QUOTES
// =======================
app.get('/quotes/:mood_id', (req, res) => {
    const mood_id = req.params.mood_id;

    db.query(
        'SELECT * FROM quotes WHERE mood_id=? ORDER BY RAND() LIMIT 1',
        [mood_id],
        (err, result) => {
            if (err) return res.status(500).send(err);
            res.json(result);
        }
    );
});

// =======================
// RUN SERVER
// =======================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server jalan di port ${PORT}`);
});