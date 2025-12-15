const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { pool, testConnection } = require('./db');
const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Database Tables
async function initDB() {
    try {
        await testConnection();



        // 1. Users Table (Updated Schema with is_suspended)
        const createUsersTableQuery = `
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'client',
                company_name VARCHAR(255),
                contact_name VARCHAR(255),
                is_suspended BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        await pool.query(createUsersTableQuery);

        // 2. Sites Table
        const createSitesTableQuery = `
            CREATE TABLE IF NOT EXISTS sites (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                site_id VARCHAR(50) NOT NULL UNIQUE,
                domain VARCHAR(255) NOT NULL,
                last_active_at TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `;
        await pool.query(createSitesTableQuery);

        // 3. Ziyaretler Table
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS ziyaretler (
                id INT AUTO_INCREMENT PRIMARY KEY,
                site_id VARCHAR(50) NOT NULL,
                url VARCHAR(255),
                referrer VARCHAR(255),
                device VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        await pool.query(createTableQuery);

        console.log('✅ Tables are ready (Schema Updated with is_suspended).');
        await checkAndSeedAdmin();
    } catch (error) {
        console.error('❌ Database Initialization Failed:', error);
    }
}

async function checkAndSeedAdmin() {
    const adminEmail = 'seyitturgut@gmail.com';
    const adminPassword = 'Beyincik**94';

    try {
        const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [adminEmail]);

        if (rows.length === 0) {
            console.log('👤 Admin user not found. Seeding...');
            const hash = await bcrypt.hash(adminPassword, 10);
            await pool.execute(
                'INSERT INTO users (email, password_hash, role, contact_name, is_suspended) VALUES (?, ?, ?, ?, ?)',
                [adminEmail, hash, 'admin', 'Sistem Yöneticisi', false]
            );
            console.log('✨ Admin user created successfully.');
        } else {
            console.log('✅ Admin user already exists.');
        }
    } catch (error) {
        console.error('❌ Admin Seeding Failed:', error);
    }
}

function generateSiteID() {
    const randomNum = Math.floor(1000 + Math.random() * 9000); // 4 digits
    const randomChar = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // A-Z
    return `TR-${randomNum}-${randomChar}`;
}

initDB();

// --- API ROUTES ---

// 1. POST /api/track
app.post('/api/track', async (req, res) => {
    const { site_id, url, referrer, device } = req.body;

    if (!site_id) {
        return res.status(400).json({ error: 'Missing site_id' });
    }

    try {
        const query = 'INSERT INTO ziyaretler (site_id, url, referrer, device) VALUES (?, ?, ?, ?)';
        await pool.execute(query, [site_id, url || '', referrer || '', device || 'Desktop']);

        const updateSiteQuery = 'UPDATE sites SET last_active_at = NOW() WHERE site_id = ?';
        await pool.execute(updateSiteQuery, [site_id]);

        res.status(201).json({ message: 'Visit tracked successfully' });
    } catch (error) {
        console.error('Track Error:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// 2. POST /api/login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Missing email or password' });
    }

    try {
        const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);

        if (rows.length === 0) {
            console.log(`❌ Login Failed: User not found for email '${email}'`);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = rows[0];

        // Check Account Status
        if (user.is_suspended) {
            return res.status(403).json({ error: 'Hesabınız askıya alınmıştır. Yöneticiyle iletişime geçin.' });
        }

        const match = await bcrypt.compare(password, user.password_hash);

        if (!match) {
            console.log(`❌ Login Failed: Password mismatch for '${email}'`);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        let site_id = null;
        if (user.role === 'client') {
            const [siteRows] = await pool.execute('SELECT site_id FROM sites WHERE user_id = ? LIMIT 1', [user.id]);
            if (siteRows.length > 0) {
                site_id = siteRows[0].site_id;
            }
        }

        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                company_name: user.company_name,
                contact_name: user.contact_name,
                site_id: site_id,
                is_suspended: user.is_suspended
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// 3. GET /api/stats
app.get('/api/stats', async (req, res) => {
    const { site_id } = req.query;

    if (!site_id) {
        return res.status(400).json({ error: 'Missing site_id query parameter' });
    }

    try {
        const [totalRows] = await pool.execute('SELECT COUNT(*) as count FROM ziyaretler WHERE site_id = ?', [site_id]);
        const [liveRows] = await pool.execute('SELECT COUNT(*) as count FROM ziyaretler WHERE site_id = ? AND created_at >= NOW() - INTERVAL 5 MINUTE', [site_id]);
        const [deviceRows] = await pool.execute('SELECT device, COUNT(*) as count FROM ziyaretler WHERE site_id = ? GROUP BY device', [site_id]);
        const [feedRows] = await pool.execute('SELECT * FROM ziyaretler WHERE site_id = ? ORDER BY created_at DESC LIMIT 20', [site_id]);

        res.json({
            total_visits: totalRows[0].count,
            live_users: liveRows[0].count,
            devices: deviceRows,
            recent_feed: feedRows
        });

    } catch (error) {
        console.error('Stats Error:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// 4. CUSTOMER MANAGEMENT APIs (Admin Only)

// GET /api/customers
app.get('/api/customers', async (req, res) => {
    try {
        const query = `
            SELECT 
                u.id, u.email, u.company_name, u.contact_name, u.created_at, u.is_suspended,
                s.site_id, s.domain, s.last_active_at
            FROM users u
            LEFT JOIN sites s ON u.id = s.user_id
            WHERE u.role = 'client'
            ORDER BY u.created_at DESC
        `;
        const [rows] = await pool.execute(query);
        res.json(rows);
    } catch (error) {
        console.error('Get Customers Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/customers
app.post('/api/customers', async (req, res) => {
    const { company_name, contact_name, email, password, domain } = req.body;

    if (!company_name || !email || !password || !domain) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [exists] = await connection.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (exists.length > 0) {
            throw new Error('This email is already registered');
        }

        const hash = await bcrypt.hash(password, 10);
        const [userResult] = await connection.execute(
            'INSERT INTO users (email, password_hash, role, company_name, contact_name) VALUES (?, ?, ?, ?, ?)',
            [email, hash, 'client', company_name, contact_name]
        );
        const userId = userResult.insertId;

        const site_id = generateSiteID();
        await connection.execute(
            'INSERT INTO sites (user_id, site_id, domain) VALUES (?, ?, ?)',
            [userId, site_id, domain]
        );

        await connection.commit();
        res.status(201).json({ message: 'Customer created successfully', site_id });

    } catch (error) {
        await connection.rollback();
        console.error('Create Customer Error:', error);
        res.status(400).json({ error: error.message || 'Creation failed' });
    } finally {
        connection.release();
    }
});

// DELETE /api/customers/:id
app.delete('/api/customers/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.execute('DELETE FROM users WHERE id = ?', [id]);
        res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
        console.error('Delete Error:', error);
        res.status(500).json({ error: 'Failed to delete customer' });
    }
});

// POST /api/customers/:id/verify
app.post('/api/customers/:id/verify', async (req, res) => {
    const { id } = req.params;
    try {
        const query = 'SELECT site_id, domain FROM sites WHERE user_id = ?';
        const [rows] = await pool.execute(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Site not found for this customer' });
        }

        const { site_id, domain } = rows[0];
        let targetUrl = domain;
        if (!targetUrl.startsWith('http')) {
            targetUrl = 'https://' + targetUrl;
        }

        console.log(`🔍 Verifying ${site_id} at ${targetUrl}...`);

        // Timeout handling for fetch
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await fetch(targetUrl, { signal: controller.signal });
        clearTimeout(timeout);

        if (!response.ok) {
            throw new Error(`Example site returned ${response.status}`);
        }

        const html = await response.text();

        if (html.includes(site_id)) {
            // Update last_active_at to verify it
            await pool.execute('UPDATE sites SET last_active_at = NOW() WHERE site_id = ?', [site_id]);
            res.json({ message: 'Doğrulama Başarılı! Site aktif.', success: true });
        } else {
            res.status(400).json({ error: `Site ID (${site_id}) ${domain} üzerinde bulunamadı.`, success: false });
        }

    } catch (error) {
        console.error('Verification Error:', error);
        res.status(500).json({ error: 'Doğrulama başarısız: Siteye erişilemedi veya zaman aşımı.' });
    }
});

// PATCH /api/customers/:id/suspend
app.patch('/api/customers/:id/suspend', async (req, res) => {
    const { id } = req.params;
    const { is_suspended } = req.body; // Expect boolean

    try {
        await pool.execute('UPDATE users SET is_suspended = ? WHERE id = ?', [is_suspended, id]);
        res.json({ message: 'Status updated successfully' });
    } catch (error) {
        console.error('Suspend Error:', error);
        res.status(500).json({ error: 'Failed to update status' });
    }
});

// PUT /api/customers/:id
app.put('/api/customers/:id', async (req, res) => {
    const { id } = req.params;
    const { company_name, contact_name, email, domain, password } = req.body;

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Update User Info
        let userQuery = 'UPDATE users SET company_name = ?, contact_name = ?, email = ?';
        const userParams = [company_name, contact_name, email];

        if (password) {
            const hash = await bcrypt.hash(password, 10);
            userQuery += ', password_hash = ?';
            userParams.push(hash);
        }

        userQuery += ' WHERE id = ?';
        userParams.push(id);

        await connection.execute(userQuery, userParams);

        // Update Site Info (Domain)
        await connection.execute('UPDATE sites SET domain = ? WHERE user_id = ?', [domain, id]);

        await connection.commit();
        res.json({ message: 'Customer updated successfully' });

    } catch (error) {
        await connection.rollback();
        console.error('Update Error:', error);
        res.status(500).json({ error: 'Failed to update customer' });
    } finally {
        connection.release();
    }
    // 5. SERVE REACT FRONTEND (Production)
    const path = require('path');
    app.use(express.static(path.join(__dirname, '../dist')));

    // Handle React Routing (SPA)
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../dist/index.html'));
    });

    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
