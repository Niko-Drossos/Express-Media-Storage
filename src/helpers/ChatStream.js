const { Readable, Writable } = require('stream')


const { Ollama } = require('ollama')
const ollama = new Ollama({ host: process.env.ollamaHost })

class ChatStream extends Readable {
  constructor(content) {
    super({ objectMode: true });
    this.content = content;
    this.messages = [];
    this.isFetching = false;
  }

  async *fetchMessages() {
    if (!this.isFetching) {
      this.isFetching = true;
      const message = { role: 'user', content: this.content };
      const response = await ollama.chat({ model: 'llama3', messages: [message], stream: true });
      for await (const part of response) {
        yield part.message.content;
      }
      this.isFetching = false;
    }
  }

  async _read() {
    for await (const message of this.fetchMessages()) {
      console.log(message)
      this.push(message);
    }
  }
}

module.exports = ChatStream;