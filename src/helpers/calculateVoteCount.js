// Middleware for counting votes
function calculateVoteCount(votes) {
  let positiveVotes = 0;
  let negativeVotes = 0;

  // Count positive and negative votes
  votes.forEach(vote => {
    if (vote.vote) {
      positiveVotes++;
    } else {
      negativeVotes++;
    }
  });

  // Return the vote count
  return positiveVotes - negativeVotes
}

module.exports = calculateVoteCount;