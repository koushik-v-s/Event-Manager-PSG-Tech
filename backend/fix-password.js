const { pool } = require('./config/db');
const bcrypt = require('bcrypt');

async function fixPassword() {
    const email = '23pt20@psgtech.ac.in';
    const passwordInput = 'kihsuok123';

    try {
        const hash = await bcrypt.hash(passwordInput, 10);
        await pool.query('UPDATE Users SET password = $1 WHERE email = $2', [hash, email]);
        console.log('Password updated directly via pg-pool');

        // Verify
        const res = await pool.query('SELECT password FROM Users WHERE email = $1', [email]);
        const storedHash = res.rows[0].password;
        console.log('Hash length:', storedHash.length);
        console.log('Match test:', await bcrypt.compare(passwordInput, storedHash));
    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit(0);
    }
}

fixPassword();
