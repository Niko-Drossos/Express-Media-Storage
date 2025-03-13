const bcrypt = require('bcrypt');
/* ------------------------------- Middleware ------------------------------- */
const logError = require("../models/middleware/logging/logError")
/* -------------------------------------------------------------------------- */

async function hash(input) {
  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(10);

    // Hash the input with the generated salt
    const hashedOutput = await bcrypt.hash(input, salt);

    return hashedOutput;
  } catch (error) {
    await logError(req, error)
    throw error;
  }
}

module.exports = hash