import { SSEMessageEmit } from 'telefunc'

export { hello }

async function hello() {
  console.log('test')
  const ev = new SSEMessageEmit<string>()
  let count = 0

  const interval = setInterval(async () => {
    try {
      const data = `hello world ${count}`
      await ev.emit(data, { id: count.toString() })
      console.log(data)
      count += 1
      if (count > 20) {
        clearInterval(interval)
        ev.close()
      }
    } catch (error) {
      console.error(error)
      clearInterval(interval)
      ev.close()
    }
  }, 1000)

  return ev.readable
}
