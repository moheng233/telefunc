import { SSEMessage, SSEMessageOpt } from "../utils";

export { SSEMessageEmit, formatSSEMessage, formatSSEMessages }

class SSEMessageEmit<O extends {}> {
  private readonly _transformStream: TransformStream<SSEMessage<O>, SSEMessage<O>>;
  private readonly _writer: WritableStreamDefaultWriter<SSEMessage<O>>;

  public get writable() {
    return this._transformStream.writable
  }

  public get readable() {
    return this._transformStream.readable
  }

  constructor() {
    this._transformStream = new TransformStream();

    this._writer = this._transformStream.writable.getWriter();
  }

  async emit(data: O, opt: SSEMessageOpt = {}) {
    return await this._writer.write({
      ...opt,
      data
    })
  }

  async abort(message: string) {
    return await this._writer.abort(message);
  }

  async close() {
    return await this._writer.close()
  }
}

function formatSSEMessage(message: SSEMessage<any>): string {
  let result = ''
  if (message.id) {
    result += `id: ${message.id}\n`
  }
  if (message.event) {
    result += `event: ${message.event}\n`
  }
  if (typeof message.retry === 'number' && Number.isInteger(message.retry)) {
    result += `retry: ${message.retry}\n`
  }
  result += `data: ${message.data}\n\n`
  return result
}

function formatSSEMessages(messages: SSEMessage<any>[]): string {
  let result = ''
  for (const msg of messages) {
    result += formatSSEMessage(msg)
  }
  return result
}
