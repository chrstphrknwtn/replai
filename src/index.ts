import 'dotenv/config'

import OpenAI from 'openai'
import * as readline from 'node:readline/promises'

import Writer from 'src/lib/Writer'

const config = {
  model: 'gpt-4',
  systemPrompt: `
  You're a general assistant in a unix-like shell environment.
  You will use double paragraph breaks often to aid reading.
  If you are asked about code avoid showing dependency installation steps,
  and do not explain basic coding concepts.`
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
  console.log(`\n${config.model}`)
  const writer = new Writer()

  while (true) {
    const prompt = await terminal.question('❯ ')
    // TODO - Add forward slash commands, /model to change model etc
    messages.push({ role: 'user', content: prompt })

    const stream = openai.beta.chat.completions.stream({
      model: config.model,
      messages,
      stream: true
    })

    const { text } = await writer.writeStream(stream)
    messages.push({ role: 'assistant', content: text })
  }
}

main().catch(console.error)
