export { SSEMessage, SSEMessageOpt }

interface SSEMessageOpt {
  id?: string
  event?: string
  retry?: number
}

interface SSEMessage<O extends {}> extends SSEMessageOpt {
  data: O
}
