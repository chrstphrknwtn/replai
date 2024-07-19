import OpenAI from 'openai'

/**
 * Approximates an OpenAI chat completion response stream.
 */

export async function* createChatCompletionStream(
  deltaStrings: string[]
): AsyncGenerator<OpenAI.ChatCompletionChunk> {
  for (const deltaString of deltaStrings) {
    // Simulate async delay
    await new Promise(resolve => setTimeout(resolve, 10))
    // Our writer is expecting completion chunks
    const chunk: OpenAI.ChatCompletionChunk = {
      id: '1',
      choices: [
        {
          delta: {
            content: deltaString
          },
          finish_reason: null,
          index: 1
        }
      ],
      created: Date.now(),
      model: 'gpt',
      object: 'chat.completion.chunk'
    }
    yield chunk
  }
}
