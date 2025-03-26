/* ------------------------------- Middleware ------------------------------- */
const logError = require("../models/middleware/logging/logError")
/* --------------------------------- Schemas -------------------------------- */
const User = require("../models/schemas/User")
const Role = require("../models/schemas/Role")
/* -------------------------------------------------------------------------- */


/* --------------------------- Add roles to a user -------------------------- */

const addRoles = async (req, res) => {
  try {
    const userId = req.params.userId

    const selectedRoles = req.body.roleIds || []

    const userToUpdate = await User.findOne({ _id: userId })
    
    if (!userToUpdate) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        errorMessage: "User not found",
        error: "User not found"
      })
    }
    
    // Add each role to the user like a "set" so there wont be duplicates
    await User.updateOne({ 
      _id: userId 
    }, {
      $addToSet: { 
        roles: { 
          $each: selectedRoles 
        } 
      } 
    })
    
    const updatedUser = await User.findById(userId).select('roles')

    res.status(200).json({
      success: true,
      message: "Added new roles to user",
      data: {
        rolesAdded: selectedRoles,
        usersRoles: updatedUser.roles || []
      }
    })

  } catch (error) {
    await logError(req, error)
    res.status(500).json({
      success: false,
      message: "Failed to add new roles to user",
      errorMessage: error.message,
      error
    })   
  }
}

/* ------------------------ Revoke roles from a user ------------------------ */

const removeRoles = async (req, res) => {
  try {
    const userId = req.params.userId
    const selectedRoles = req.body.roleIds || []

    const userToUpdate = await User.findOne({ _id: userId })

    if (!userToUpdate) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        errorMessage: "User not found",
        error: "User not found"
      })
    }

    // Remove each role from the user if it exists
    await User.updateOne({ 
        _id: userId 
      }, {
        $pull: {
          roles: { $in: selectedRoles }
        }
      }
    )

    const updatedUser = await User.findById(userId).select('roles')

    res.status(200).json({
      success: true,
      message: "Removed roles from user",
      data: {
        rolesRemoved: selectedRoles,
        usersRoles: updatedUser.roles || []
      }
    })

  } catch (error) {
    await logError(req, error)
    res.status(500).json({
      success: false,
      message: "Failed to remove roles from user",
      errorMessage: error.message,
      error
    })
  }
}


/* ------------------------- Fetch roles for a user ------------------------- */

const getUserRoles = async (req, res) => {
  try {
    const userId = req.params.userId

    const user = await User.findById(userId).populate('roles')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        errorMessage: "User not found",
        error: "User not found"
      })
    }

    res.status(200).json({
      success: true,
      message: "Fetched user roles",
      data: {
        userId: user._id,
        roles: user.roles
      }
    })

  } catch (error) {
    await logError(req, error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch user roles",
      errorMessage: error.message,
      error
    })
  }
}

/* ------------------------------ Create a role ----------------------------- */

const createRole = async (req, res) => {
  try {
    const { name, description } = req.body

    const newRole = await Role.create({
      name,
      description
    })

    res.status(201).json({
      success: true,
      message: "Successfully created role",
      data: {
        role: newRole
      }
    })
  } catch (error) {
    await logError(req, error)
    res.status(500).json({
      success: false,
      message: "Failed to create role",
      errorMessage: error.message,
      error
    })   
  }
}

/* -------------------------------------------------------------------------- */

module.exports = { addRoles, removeRoles, getUserRoles, createRole }