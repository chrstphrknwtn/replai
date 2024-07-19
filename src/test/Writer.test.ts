import { expect, test } from 'bun:test'

import Writer from 'src/lib/Writer'
import { greetingDeltas, inlineBoldDeltas } from './fixtures'
import { createChatCompletionStream } from './utils'

const writer = new Writer()

test('Writer returns verbatim stream as plain text', async () => {
  const stream = createChatCompletionStream(greetingDeltas)
  const { text } = await writer.writeStream(stream)
  expect(text).toBe('Hello! How can I assist you today?')
})

test('Writer pads stream with newlines', async () => {
  const stream = createChatCompletionStream(greetingDeltas)
  const { textANSI } = await writer.writeStream(stream)
  expect(textANSI).toBe('\nHello! How can I assist you today?\n\n')
})

test('Writer formats inline bold text', async () => {
  const stream = createChatCompletionStream(inlineBoldDeltas)
  const { textANSI } = await writer.writeStream(stream)
  expect(textANSI).toBe(
    '\nThis is some \u001B[1mBold Text\u001B[22m in your shell.\n\n'
  )
})
