const express = require('express')
const { google } = require('googleapis')

require('dotenv').config()

const app = express()

const PORT = process.env.PORT

const port = PORT || 5000

app.use(express.json())
app.set('x-powered-by', false) // for security
app.set('trust proxy', 1) // trust first proxy

const server = app.listen(port, () => {
  console.log(`Server is running on port: ${port}`)
})

// process setup : improves error reporting
process.on('unhandledRejection', (error) => {
  console.error('unhandledRejection', JSON.stringify(error), error.stack)
})
process.on('uncaughtException', (error) => {
  console.error('uncaughtException', JSON.stringify(error), error.stack)
})

app.get('/routes', async (req, res) => {
  try {
    res.send('hi')
  } catch (err) {
    console.error(err)
  } finally {

  }
})

module.exports = server
