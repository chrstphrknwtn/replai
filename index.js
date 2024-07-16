import 'dotenv/config'

import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'
import * as readline from 'node:readline/promises'

const terminal = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const messages = []

async function main() {
  while (true) {
    const userInput = await terminal.question('\n> ')

    messages.push({ role: 'user', content: userInput })

    const result = await streamText({
      model: openai('gpt-4o'),
      system:
        'You are a helpful and knowledgable code assistant. If responsing with code, do not explain the code and respond with the plain text without markdown syntax or any code blocks. Never show the backtick code blocks, even when your response mixes plain text and code samples. Break your text reponses on the 80 character line length.',
      messages
    })

    let response = ''
    process.stdout.write('\n')
    for await (const delta of result.textStream) {
      response += delta
      process.stdout.write(delta)
    }
    process.stdout.write('\n')

    messages.push({ role: 'assistant', content: response })
  }
}

main().catch(console.error)
