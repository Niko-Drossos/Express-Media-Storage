// doc is the document being updated, you need to select the votes with ".select('votes')"
// This is not how mongoose would normally have you update elements in an array but this works better and is easier to read
export default async function castVote(doc, newVote) {
  try {
    // Update the post with the new vote
    const existingVoteIndex = doc.votes.findIndex(vote => vote.user.userId.toString() === newVote.user.userId);

    // Check if the vote already exists
    if (existingVoteIndex !== -1) {
      // Update the existing vote
      post.votes[existingVoteIndex] = newVote;
    } else {
      // Push a new vote
      post.votes.push(newVote);
    }

    await post.save();
    
    return
  } catch (error) {
    return error
  }
}
