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
  and do not explain basic coding concepts. When showing code examples never
  use markdown syntax.`,
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

    process.stdout.write('\n')
    let currLineLength = 0
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content

      if (content) {
        if (
          currLineLength + content.length > config.columns &&
          process.stdout.columns > config.columns
        ) {
          process.stdout.write('\n')
          currLineLength = 0
          // Trim space character after inserting newline
          process.stdout.write(content.slice(1))
        } else {
          process.stdout.write(content)
        }
        // Reset line length on paragraph breaks
        if (content.endsWith('\n')) {
          currLineLength = 0
        }
        currLineLength += content.length
      }
    }
    process.stdout.write('\n\n')
  }
}

main().catch(console.error)
