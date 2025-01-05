const SubUser = require('./SubUser')

const voteSchema = {
  user: {
    type: SubUser
  },
  vote: {
    type: Boolean,
    required: true,
  }
}

module.exports = voteSchema