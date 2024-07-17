import 'dotenv/config'

import c from 'chalk'
import OpenAI from 'openai'
import * as readline from 'node:readline/promises'

const config = {
  model: 'gpt-4o',
  systemPrompt: `
  You're a general assistant in a unix-like shell environment.
  You will use double paragraph breaks often to aid reading.
  If you are asked about code avoid showing dependency installation steps,
  and do not explain basic coding concepts.
  Do not use markdown syntax in your responses.`,
  columns: 72
}

const terminal = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const openai = new OpenAI()
const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
  { role: 'system', content: config.systemPrompt }
]

async function main() {
  console.log(c.grey(`\n${config.model}`))

  while (true) {
    const input = await terminal.question('❯ ')
    messages.push({ role: 'user', content: input })

    const stream = openai.beta.chat.completions.stream({
      model: config.model,
      messages,
      stream: true
    })

    let response = ''
    process.stdout.write('\n')
    let currLineLength = 0
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content

      if (content) {
        if (
          currLineLength + content.length > config.columns &&
          process.stdout.columns > config.columns &&
          content.length > 2
        ) {
          process.stdout.write('\n')
          currLineLength = 0
          // Trim space character after inserting newline
          process.stdout.write(content[0] === ' ' ? content.slice(1) : content)
        } else {
          process.stdout.write(content)
        }
        // Reset line length on paragraph breaks
        if (content.endsWith('\n')) {
          currLineLength = 0
        }
        currLineLength += content.length

        // Update chat history
        response += content
        messages.push({ role: 'assistant', content: response })
      }
    }
    process.stdout.write('\n\n')
  }
}

main().catch(console.error)
