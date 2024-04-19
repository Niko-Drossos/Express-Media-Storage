const express = require("express")
const router = express.Router()

/* --------------------------------- Schemas -------------------------------- */
const User = require("../../models/schemas/User")
/* --------------------------------- Helpers -------------------------------- */
const generateJWT = require("../../helpers/generateJWT")
const decryptJWT = require("../../helpers/decryptJWT")
const compareHash = require("../../helpers/compareHash")
const hash = require("../../helpers/hash")
/* -------------------------------------------------------------------------- */

router.post("/register", async (req, res) => {
  try {
    if (!req.body.username || !req.body.password) {
      throw new Error("Missing username or password")
    }

    const { username, password, email } = req.body

    const newUser = await User.create({
      username,
      password: await hash(password), 
      email
    })

    console.log(newUser)

    const userData = {
      userId: newUser._id,
      username: req.body.username,
      password: req.body.password
    }

    const loginToken = generateJWT(userData)

    res.status(201).json({
      success: true,
      message: "Successfully registered user",
      data: {
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
})

/* -------------------------------------------------------------------------- */

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) throw new Error("Missing username or password")

    // Find the user in the database and throw an error if none found
    const foundUser = await User.findOne({ username })
    if (!foundUser) throw new Error(`No user with username: ${username} found`)

    // Check if password is a match 
    const passwordMatch = await compareHash(password, foundUser.password)
    if (!passwordMatch) throw new Error(`Incorrect credentials`)

    const userData = {
      userId: foundUser._id,
      email: foundUser.email,
      password: foundUser.password,
      username: username
    }

    const loginToken = generateJWT(userData)

    res.status(200).json({
      success: true,
      message: "Successfully logged in",
      data: {
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
})

module.exports = router