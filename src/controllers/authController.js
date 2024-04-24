const path = require("path")

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
      throw new Error("Missing username, password or email")
    }

    // 1 uppercase, 1 lowercase, 1 number, 1 special character and at least 8 characters
    const isStrongPassword = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)

    if (!isStrongPassword) {
      throw new Error("Password is not strong enough")
    }
    
    const newUser = await User.create({
      username,
      password: await hash(password), 
      email
    })

    const { _id, folderId } = newUser

    const payload = {
      userId: _id,
      folderId: folderId,
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

    if (!username || !password) throw new Error("Missing username or password")

    // Find the user in the database and throw an error if none found
    const foundUser = await User.findOne({ username })
    if (!foundUser || foundUser == undefined) throw new Error(`No user with username: ${username} found`)

    // Check if password is a match 
    const passwordMatch = await compareHash(password, foundUser.password)
    if (!passwordMatch) throw new Error(`Incorrect credentials`)

    const { _id, email, folderId } = foundUser

    const payload = {
      userId: _id,
      email: email,
      username: username,
      folderId: folderId
    }

    const loginToken = generateJWT(payload)

    res.status(200).json({
      success: true,
      message: "Successfully logged in",
      data: {
        user: {
          folderId: folderId
        },
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


