const express = require('express');
const { google } = require('googleapis');

require('dotenv').config();

const app = express();

const PORT = process.env.PORT;

const port = PORT || 5000;

app.use(express.json());
app.set('x-powered-by', false); // for security
app.set('trust proxy', 1); // trust first proxy

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
    const auth = await google.auth.getClient({
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    const sheets = google.sheets({ version: 'v4', auth });
    const range = 'ascents!A1:O385';
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SHEET_ID,
      range,
    });
    const [header, ...ascents] = response.data.values;
    res.send({ header, ascents });
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

module.exports = server;
