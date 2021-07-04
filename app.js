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
    const auth = await google.auth.getClient({
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    const sheets = google.sheets({ version: 'v4', auth });
    const range = 'ascents!A1:O385';
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SHEET_ID,
      range,
    });
    const [headers, ...ascents] = response.data.values;
    res.send({ headers, ascents });
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

app.get('/ascentsBySeason', async (req, res) => {
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
    const [headers, ...rawAscents] = response.data.values;

    const ascents = rawAscents.map(ascent => ({
      name: ascent[0],
      grade: ascent[1],
      date: ascent[12],
    }));

    const seasonSet = new Set(
      ascents.map(({ date }) => {
        const newDate = new Date(date);
        return newDate.getFullYear();
      })
    );

    const seasons = Array.from(seasonSet);

    const ascentsBySeason = ascents.reduce((totalAscents, ascent) => {
      const year = ascent.date.toString().slice(0, 4);
      for (let index = 0; index < seasons.length; index++) {
        const season = seasons[index].toString();
        if (year === season) totalAscents[index] += 1;
      }
      return totalAscents;
    }, Array(seasons.length).fill(0));

    res.send({ seasons, ascentsBySeason });
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

module.exports = server;
