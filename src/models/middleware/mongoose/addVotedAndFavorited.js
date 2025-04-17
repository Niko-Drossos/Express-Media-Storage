// This middleware adds 2 fields, voted, and favorited.
// This runs every time a document is searched for.
function addVotedAndFavorited(doc, favorited, userId) {
  // Add a property to see if the document is in the users favorites array
  doc.favorited = favorited.includes(doc._id.toString());

  // Set a default case for voted if the user didn't vote at all
  doc.voted = 0
  if (!doc.votes) return doc
  for (let i = 0; i < doc.votes.length; i++) {
    const vote = doc.votes[i]
    if (vote.user == userId) {
      doc.voted = vote.vote ? 1 : -1
      break
    }
  }

  // Remove the votes from the document to keep voting anonymous
  delete doc.votes

  return doc
} 

module.exports = addVotedAndFavorited