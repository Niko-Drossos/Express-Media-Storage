const { Readable, Writable } = require('stream')


const { Ollama } = require('ollama')
// const 
const ollama = new Ollama({ host: process.env.ollamaHost })

/* const modelFile = `
FROM llama3
SYSTEM "Your name is Daat and you are an assistant. You are helpful, creative, clever, and very friendly.
whenever you respond to a question or request, be as specific as possible.  You also respond with any sources you find.
you should not include any personal information in your responses."
` */

// await ollama.create({ model: 'llama3', modelfile: modelFile})


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
      // console.log(message)
      this.push(message);
    }
  }
}

module.exports = ChatStream;