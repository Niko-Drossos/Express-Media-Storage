// doc is the document being updated, you need to select the votes with ".select('votes')"
// This is not how mongoose would normally have you update elements in an array but this works better and is easier to read
const castVote = async (doc, newVote) => {
  try {
    
    // Update the doc with the new vote
    const existingVoteIndex = doc.votes.findIndex(vote => vote.user.userId.toString() === newVote.user.userId);
    
    // Check if the vote already exists
    if (existingVoteIndex == -1) {
      // Push a new vote if no existing vote was found
      doc.votes.push(newVote);
    } else {
      // Check if the existing vote has the same value as the new vote
      if (doc.votes[existingVoteIndex].vote === newVote.vote) {
        // Remove the existing vote
        doc.votes.splice(existingVoteIndex, 1);
      } else {
        // Update the existing vote with the new one
       doc.votes[existingVoteIndex] = newVote;
      }
    }
     
    const updated = await doc.save();

    return updated
  } catch (error) {
    console.log(error)
    return error
  }
}

module.exports = castVote