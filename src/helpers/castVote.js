// doc is the document being updated, you need to select the votes with ".select('votes')"
// This is not how mongoose would normally have you update elements in an array but this works better and is easier to read
module.exports = async function castVote(doc, newVote) {
  try {
    // Update the doc with the new vote
    const existingVoteIndex = doc.votes.findIndex(vote => vote.user.userId.toString() === newVote.user.userId);

    // Check if the vote already exists
    if (existingVoteIndex !== -1) {
      // Update the existing vote
      doc.votes[existingVoteIndex] = newVote;
    } else {
      // Push a new vote
      doc.votes.push(newVote);
    }

    const updated = await doc.save();

    return updated
  } catch (error) {
    return error
  }
}
