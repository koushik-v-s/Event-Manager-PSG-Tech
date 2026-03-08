const { pool } = require('./config/db');
const bcrypt = require('bcrypt');

async function debugLogin() {
    const email = '23pt20@psgtech.ac.in';
    const passwordInput = 'kihsuok123';

    try {
        const res = await pool.query('SELECT * FROM Users WHERE email = $1', [email]);
        if (res.rows.length === 0) {
            console.log('User not found in DB');
            process.exit(1);
        }

        const user = res.rows[0];
        console.log('DB User:', user.email);
        console.log('DB Hash:', user.password);
        console.log('Hash length:', user.password.length);

        const isMatch = await bcrypt.compare(passwordInput, user.password);
        console.log('Bcrypt Match Result:', isMatch);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit(0);
    }
}

debugLogin();
