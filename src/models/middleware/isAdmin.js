/* --------------------------------- Schemas -------------------------------- */
const Role = require('../schemas/Role')
/* -------------------------------------------------------------------------- */

async function isAdmin(req, res, next) {
  const adminRole = await Role.findOne({ name: 'Admin' })

  // Only continue if the user has the admin role
  if (req.roles.includes(adminRole._id.toString()) && req.userId) {
    next()
  } else {
    res.status(403).json({
      success: false,
      message: "You must be an Admin to access this route",
      errorMessage: "You don't have permission to access this route",
      error: `You need to be an Admin to access this route, you only have the role of ${req.roles.join(', ')}`
    })
  }
}

module.exports = isAdmin