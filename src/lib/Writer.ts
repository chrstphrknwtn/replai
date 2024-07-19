import OpenAI from 'openai'

type WriterState = {
  isCodeBlock?: boolean
  isCodeSpan?: boolean
  isBold?: boolean
  text: string
  textANSI: string
  cursorLoc: number
}

interface WriterResult {
  text: string
  textANSI: string
}

const config = {
  debug: false,
  columns: 72
}

const ANSI = {
  bold: '\u001B[1m',
  reset: '\u001B[22m'
}

export default class Writer {
  private state: WriterState

  constructor() {
    this.state = {
      text: '',
      textANSI: '',
      cursorLoc: 0
    }
  }

  private writeStdout(str: string) {
    process.stdout.write(str)
    this.state.textANSI += str
  }

  async writeStream(
    stream: AsyncIterable<OpenAI.ChatCompletionChunk>
  ): Promise<WriterResult> {
    this.state = {
      text: '',
      textANSI: '',
      cursorLoc: 0
    }

    this.writeStdout(`\n`)
    const deltas = []

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content

      if (delta) {
        deltas.push(delta)

        // Format inline bold. This is embarrasing, but is passes tests, so.
        if (delta == '**' || delta === ' **') {
          if (delta[0] === ' ') {
            this.writeStdout(' ')
          }
          if (!this.state.isBold) {
            this.state.isBold = true
            this.writeStdout(ANSI.bold)
          } else {
            this.writeStdout(ANSI.reset)
          }
          continue
        }

        if (
          this.state.cursorLoc + delta.length > config.columns &&
          process.stdout.columns > config.columns &&
          delta.length > 2
        ) {
          this.writeStdout('\n')
          this.state.cursorLoc = 0
          // Trim space character after inserting newline
          this.writeStdout(delta[0] === ' ' ? delta.slice(1) : delta)
        } else {
          this.writeStdout(delta)
        }
        // Reset line length on paragraph breaks
        if (delta.endsWith('\n')) {
          this.state.cursorLoc = 0
        }
        this.state.cursorLoc += delta.length
      }
    }

    if (config.debug) {
      console.log(JSON.stringify(deltas))
    }
    this.writeStdout('\n\n')

    return {
      text: deltas.join(''),
      textANSI: this.state.textANSI
    }
  }
}
