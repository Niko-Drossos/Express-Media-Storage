/* --------------------------------- Schemas -------------------------------- */
const User = require("../models/schemas/User")
const Post = require("../models/schemas/Post")
const Comment = require("../models/schemas/Comment")
const Video = require("../models/schemas/Video")
const Image = require("../models/schemas/Image")
const Audio = require("../models/schemas/Audio")
/* -------------------------------------------------------------------------- */

exports.voteOnPost = async (req, res) => {
  try {
    // Update the post with the new vote
    const { postId } = req.params
    /* const postedVote = await Post.findByIdAndUpdate(req.params.postId, {
      // ! TODO: Make this a set
      $push: {
        votes: {
          user: {
            userId: req.userId,
            username: req.username
          },
          vote: req.body.vote
        }
      }
    }, {
      new: true
    }) */

    const newVote = {
      user: {
        userId: req.userId,
        username: req.username
      },
      vote: req.body.vote
    }

    console.log(newVote)

    let postedVote = await Post.findById(postId)

    if (postedVote.votes) {
      console.log("SET")
      await Post.updateOne({
        _id: postId
      }, {
        $set: { '$.votes': newVote }
      })
    } else {
      console.log("PUSH")
      postedVote = await Post.updateOne({
        _id: postId
      }, {
        $push: { 
          votes: newVote
        }
      })
    }

    res.status(200).json({
      success: true,
      message: "voted on post",
      data: {
        vote: req.body.vote,
        post: postedVote
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to vote on post",
      errorMessage: error.message,
      error
    })
  }
}

/* --------------------------- Vote on comment --------------------------- */

exports.voteOnComment = async (req, res) => {
  try {
    // Update the comment with the new vote
    const votedComment = await Comment.findByIdAndUpdate(req.params.commentId, {
      // ! TODO: Make this a set
      $push: {
        votes: {
          user: {
            userId: req.userId,
            username: req.username
          },
          vote: req.body.vote
        }
      }
    }, {
      new: true
    })

    res.status(200).json({
      success: true,
      message: "Voted on comment",
      data: {
        vote: req.body.vote,
        comment: votedComment
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to vote on comment",
      errorMessage: error.message,
      error
    })
  }
}

/* ----------------------------- Vote on user ---------------------------- */

exports.voteOnUser = async (req, res) => {
  try {
    // Update the user with the new comment
    const votedUser = await User.findByIdAndUpdate(req.params.userId, {
      // ! TODO: Make this a set
      $push: {
        votes: {
          user: {
            userId: req.userId,
            username: req.username
          },
          vote: req.body.vote
        }
      }
    }, {
      new: true
    })

    res.status(200).json({
      success: true,
      message: "Commented on user",
      data: {
        vote: req.body.vote,
        user: votedUser
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to comment on user",
      errorMessage: error.message,
      error
    })
  }
}

/* ---------------------------- Vote on video ---------------------------- */

exports.voteOnVideo = async (req, res) => {
  try {
    // Update the video with the new vote
    const votedVideo = await Video.findByIdAndUpdate(req.params.videoId, {
      // ! TODO: Make this a set
      $push: {
        votes: {
          user: {
            userId: req.userId,
            username: req.username
          },
          vote: req.body.vote
        }
      }
    }, {
      new: true
    })

    res.status(200).json({
      success: true,
      message: "voted on video",
      data: {
        vote: req.body.vote,
        video: votedVideo
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to vote on video",
      errorMessage: error.message,
      error
    })
  }
}

/* ---------------------------- Vote on image ---------------------------- */

exports.voteOnImage = async (req, res) => {
  try {
    // Update the user with the new comment
    const votedImage = await Image.findByIdAndUpdate(req.params.imageId, {
      // ! TODO: Make this a set
      $push: {
        votes: {
          user: {
            userId: req.userId,
            username: req.username
          },
          vote: req.body.vote
        }
      }
    }, {
      new: true
    })

    res.status(200).json({
      success: true,
      message: "Voted on image",
      data: {
        vote: req.body.vote,
        image: votedImage
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to vote on image",
      errorMessage: error.message,
      error
    })
  }
}

/* ---------------------------- Vote on audio ---------------------------- */

exports.voteOnAudio = async (req, res) => {
  try {
    // Update the user with the new comment
    const votedAudio = await Audio.findByIdAndUpdate(req.params.audioId, {
      // ! TODO: Make this a set
      $push: {
        votes: {
          user: {
            userId: req.userId,
            username: req.username
          },
          vote: req.body.vote
        }
      }
    }, {
      new: true
    })

    res.status(200).json({
      success: true,
      message: "Voted on audio",
      data: {
        vote: req.body.vote,
        audio: votedAudio
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to vote on audio",
      errorMessage: error.message,
      error
    })
  }
}