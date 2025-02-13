const mongoose = require('mongoose')
const Schema = mongoose.Schema

const transcriptionSchema = new Schema({
  status: {
    type: String,
    enum: ['none', 'queued', 'complete'],
    default: 'none',
  },
  text: {
    type: [{
      from: String,
      to: String,
      text: String
    }],
    default: [],
    required: false
  }
}, {
  timestamps: true,
  collection: 'transcriptions'
})

/* --------------------------------- Indexes -------------------------------- */

// Store the index on the `speech` field for blazing fast search
transcriptionSchema.index({ 'text.speech': 'text' });

// How to search by relevancy
/*
  async function searchTranscriptions(query) {
  const results = await Transcription.find(
    { $text: { $search: query } }, // Full-text search query
    { score: { $meta: "textScore" } } // Include relevance score
  ).sort({ score: { $meta: "textScore" } }); // Sort by relevance

  return results;
}

// Example Usage
searchTranscriptions("kingdom come").then(console.log).catch(console.error);

*/
/* ------------------------------- Middleware ------------------------------- */

/* -------------------------------------------------------------------------- */

const Transcription = mongoose.model('Transcription', transcriptionSchema)

module.exports = Transcription