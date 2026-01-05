
const bcrypt = require('bcryptjs');

const password = 'Dhan@881';
const hash = bcrypt.hashSync(password, 10);

console.log('HASH:' + hash);
