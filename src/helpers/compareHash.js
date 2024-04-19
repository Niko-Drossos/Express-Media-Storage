const bcrypt = require('bcrypt');

async function compareHash(input, hashedPassword) {
  try {
    // Compare the input with the hashed password
    const isMatch = await bcrypt.compare(input, hashedPassword);
    return isMatch;
  } catch (error) {
    throw error;
  }
}


module.exports = compareHash