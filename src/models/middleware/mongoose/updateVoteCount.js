/* --------------------------------- Helpers -------------------------------- */
const calculateVoteCount = require('../../../helpers/calculateVoteCount')
/* -------------------------------------------------------------------------- */

function updateVoteCount(next) {
	// Ensure the current document (this) is in the correct context
	if (!this.isModified('votes') && !this.isNew) {
		// Skip updating likeCount if votes haven't been modified
		return next();
	}

	// Format the date as MM-DD-YYYY
	const dateString = new Intl.DateTimeFormat('en-US', {
		month: '2-digit',
		day: '2-digit',
		year: 'numeric',
		})
		.format(this.date)
		.replace(/\//g, '-');

	// Update the documents voteCount
	this.voteCount = calculateVoteCount(this.votes)

	if (!this.title) {
		this.title ?? dateString + '-Untitled'
	}

	next()
}

module.exports = updateVoteCount