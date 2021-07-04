const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');

require('dotenv').config();

const app = express();

const PORT = process.env.PORT;

const port = PORT || 5000;

app.use(express.json());
app.set('x-powered-by', false); // for security
app.set('trust proxy', 1); // trust first proxy

const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS.split(',');
const corsOptions = {
  origin: (origin, callback) => {
    if (origin === undefined || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

const server = app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

// process setup : improves error reporting
process.on('unhandledRejection', error => {
  console.error('unhandledRejection', JSON.stringify(error), error.stack);
});
process.on('uncaughtException', error => {
  console.error('uncaughtException', JSON.stringify(error), error.stack);
});

app.get('/routes', async (req, res) => {
  try {
    res.send('hi');
  } catch (err) {
    console.error(err);
  } finally {
  }
});

module.exports = server;
