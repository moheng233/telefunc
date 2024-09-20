import express from 'express'
import { telefunc } from 'telefunc'

startServer()

async function startServer() {
  const app = express()
  installTelefunc(app)
  await installFrontend(app)
  start(app)
}

function installTelefunc(app: express.Express) {
  app.use(express.text())
  app.all('/_telefunc', async (req, res) => {
    const { originalUrl: url, method, body } = req
    const httpResponse = await telefunc({ url, method, body })
    if (httpResponse.contentType === 'text/event-stream') {
      res.set({
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      })
      res.status(httpResponse.statusCode).type(httpResponse.contentType)
      res.flushHeaders()

      await httpResponse.body.pipeTo(
        new WritableStream<string>({
          async write(chunk, controller) {
            try {
              if (!res.closed) {
                return await new Promise<void>((done, rej) => {
                  res.write(chunk, (error) => {
                    if (error != undefined) {
                      rej(error)
                    }
                    done()
                  })
                })
              } else {
                controller.error('closed')
                return await new Promise<void>((done, rej) => {
                  console.log('closed')
                  res.end(() => {
                    done()
                  })
                })
              }
            } catch (error) {
              controller.error(error)
            }
          },
          abort(error) {
            console.log(error)
          },
          async close() {
            return await new Promise<void>((done, rej) => {
              console.log('closed')
              res.end(() => {
                done()
              })
            })
          },
        }),
      )
    } else {
      res.status(httpResponse.statusCode).type(httpResponse.contentType).send(httpResponse.body)
    }
  })
}

async function installFrontend(app: express.Express) {
  if (process.env.NODE_ENV === 'production') {
    const root = await getRoot()
    app.use(express.static(`${root}/dist/client`))
  } else {
    const vite = await import('vite')
    const viteDevMiddleware = (
      await vite.createServer({
        server: { middlewareMode: true },
      })
    ).middlewares
    app.use(viteDevMiddleware)
  }
}

function start(app: express.Express) {
  const port = process.env.PORT || 3000
  app.listen(port)
  console.log(`Server running at http://localhost:${port}`)
}

// https://stackoverflow.com/questions/46745014/alternative-for-dirname-in-node-js-when-using-es6-modules
async function getRoot() {
  const { dirname } = await import('node:path')
  const { fileURLToPath } = await import('node:url')
  const __dirname = dirname(fileURLToPath(import.meta.url))
  const root = __dirname
  return root
}
