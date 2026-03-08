// backend/hashPasswords.js
const bcrypt = require('bcryptjs');

async function hashPasswords() {
  const facultyPassword = 'Faculty@123';
  const adminPassword = 'Admin@123';

  const facultyHash = await bcrypt.hash(facultyPassword, 10);
  const adminHash = await bcrypt.hash(adminPassword, 10);

  console.log('Faculty Password Hash:', facultyHash);
  console.log('Admin Password Hash:', adminHash);
}

hashPasswords();