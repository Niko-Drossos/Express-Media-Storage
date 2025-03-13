const mongoose = require('mongoose')
const Schema = mongoose.Schema

/* ------------------------------ SubDocuments ------------------------------ */
const SubUser = require('./sub-documents/SubUser')
/* -------------------------------------------------------------------------- */

const errorLogSchema = new Schema({
  level: { 
    type: String,
    enum: ["error", "warn", "debug"],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  service: {
    type: String,
    required: true
  },
  user: SubUser,
  request: {
    method: {
      type: String,
      enum: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    ip: { 
      type: String,
      required: true
    },
    headers: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  error: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
},{ 
  timestamps: true,
  collection: "logs"
})

/* --------------------------------- Indexes -------------------------------- */

// Create an index for faster queries on timestamp and level
errorLogSchema.index({ createdAt: -1, level: 1 });

const ErrorLog = mongoose.model("ErrorLog", errorLogSchema);

module.exports = ErrorLog;