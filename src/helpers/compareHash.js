const bcrypt = require('bcrypt');
/* ------------------------------- Middleware ------------------------------- */
const logError = require("../models/middleware/logging/logError")
/* -------------------------------------------------------------------------- */

async function compareHash(input, hashedPassword) {
  try {
    // Compare the input with the hashed password
    const isMatch = await bcrypt.compare(input, hashedPassword);
    return isMatch;
  } catch (error) {
    await logError(req, error)
    throw error;
  }
}


module.exports = compareHash