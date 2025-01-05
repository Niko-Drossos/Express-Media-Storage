/* --------------------------------- Schemas -------------------------------- */
const User = require("../models/schemas/User")
/* --------------------------------- Helpers -------------------------------- */
const generateJWT = require("../helpers/generateJWT")
const compareHash = require("../helpers/compareHash")
const hash = require("../helpers/hash")
/* -------------------------------------------------------------------------- */

/* ---------------------- Register user and return JWT ---------------------- */

exports.registerUser = async (req, res) => {
  try {
    const { username, password, email } = req.body

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Not all registration fields were provided",
        errorMessage: "Missing username, password or email fields",
        error: {}
      })
    }

    // 1 uppercase, 1 lowercase, 1 number, 1 special character and at least 8 characters
    const isStrongPassword = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)

    if (!isStrongPassword) {
      return res.status(400).json({
        success: false,
        message: "Password is not strong enough, must contain 1 uppercase, 1 lowercase, 1 number, 1 special character and at least 8 characters",
        errorMessage: "Password is not strong enough, must contain 1 uppercase, 1 lowercase, 1 number, 1 special character and at least 8 characters",
        error: {}
      })
    }
    
    // Create new user in MongoDB
    const newUser = await User.create({
      username,
      password: await hash(password), 
      email
    })

    const payload = {
      userId: newUser._id,
      username,
      email
    }

    const loginToken = generateJWT(payload)

    res.status(201).json({
      success: true,
      message: "Successfully registered user",
      data: {
        user: payload,
        JWT: loginToken
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to register user",
      errorMessage: error.message,
      error
    })
  }
}

/* ------------------------ Login user and return JWT ----------------------- */

exports.loginUser = async (req, res) => {
  try {
    const { username, password } = req.body

    // Make sure username and password are input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Not all login fields were provided",
        errorMessage: "Missing username or password fields",
        error: {}
      }) 
    }

    // Find the user in the database and throw an error if none found
    const foundUser = await User.findOne({ username }, { password: 1 })

    // TODO: Depreciate error message as it decreases security
    /* if (!foundUser || foundUser == undefined) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      })
    }
 */
    // Check if password is a match 
    const passwordMatch = await compareHash(password, foundUser.password)
    if (!passwordMatch) {
      return res.status(403).json({
        success: false,
        message: "Failed to login",
        errorMessage: "Incorrect account credentials",
        error: {}
      })
    }

    const { _id, email } = foundUser

    const payload = {
      userId: _id,
      username,
      email
    }
    
    // Generate the login token for a user
    const loginToken = generateJWT(payload)

    res.cookie("media_authentication", loginToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    })

    res.status(200).json({
      success: true,
      message: "Successfully logged in",
      data: {
        user: payload,
        JWT: loginToken
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to login",
      errorMessage: error.message,
      error
    })
  }
}


