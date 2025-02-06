const jwt = require('jsonwebtoken');

const JwtSecretKey = process.env.JWT_SECRET_KEY

module.exports = decryptJWT = (token) => {
	try {
		// Decode the JWT token without verification
		const decodedToken = jwt.verify(token, JwtSecretKey, { complete: true });
		return decodedToken;
	} catch (error) {
		return false
	}
}