const jwt = require('jsonwebtoken');

const JwtSecretKey = process.env.JWT_SECRET_KEY

function decodeToken(token) {
    try {
        // Decode the JWT token without verification
        const decodedToken = jwt.verify(token, JwtSecretKey, { complete: true });
        return decodedToken;
    } catch (error) {
        throw error;
    }
}

module.exports = decodeToken