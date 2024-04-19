const jwt = require("jsonwebtoken")
const dotenv = require("dotenv")
dotenv.config()

const JwtSecretKey = process.env.JWT_SECRET_KEY

function generateJWT(payload) {
  const options = {
    expiresIn: '5h', // Token expiration time
  };
  return jwt.sign(payload, JwtSecretKey, options);
}

module.exports = generateJWT