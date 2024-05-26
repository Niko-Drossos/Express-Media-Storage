const ChatStream = require("../helpers/ChatStream")

exports.ask = async (req, res) => {

  const content = req.body.content
  const chatStream = new ChatStream(content)

  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Transfer-Encoding', 'chunked');

  chatStream.pipe(res)
}