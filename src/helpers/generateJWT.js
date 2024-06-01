const jwt = require("jsonwebtoken")
const dotenv = require("dotenv")
dotenv.config()

const JwtSecretKey = process.env.JWT_SECRET_KEY

function generateJWT(payload, duration='7d') {
  const options = {
    expiresIn: duration, // Token expiration time,  change to 24 hours when production
  };
  return jwt.sign(payload, JwtSecretKey, options)
}

module.exports = generateJWT