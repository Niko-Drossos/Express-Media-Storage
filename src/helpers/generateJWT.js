const jwt = require("jsonwebtoken")
const dotenv = require("dotenv")
dotenv.config()

const JwtSecretKey = process.env.JWT_SECRET_KEY

function generateJWT(user) {
  const payload = {
      userId: user.id,
      email: user.email
      // Add any additional data you want to include in the token
  };
  const options = {
      expiresIn: '1h', // Token expiration time
  };
  return jwt.sign(payload, JwtSecretKey, options);
}

module.exports = generateJWT