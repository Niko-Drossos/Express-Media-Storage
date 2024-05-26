import ollama from 'ollama'

// TODO: Let this be an input param from the function 
/* const modelFile = `
FROM llama2
SYSTEM "You are mario from super mario bros."
` */

const message = { role: 'user', content: 'Why is the sky blue?' }
const response = await ollama.chat({ 
  model: 'llama3', 
  messages: [message], 
  stream: true 
})

for await (const part of response) {
  console.log(part.message.content)
}

// export async function () 