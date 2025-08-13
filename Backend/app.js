const express = require('express');
require('express-async-errors');
const morgan = require('morgan');
const cors = require('cors');
const csurf = require('csurf');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const routes = require('./routes');


const { environment } = require('./config');
const isProduction = environment === 'production';

const app = express();

// Middleware setup
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(routes);


// Security middleware
if (!isProduction) {
  app.use(cors());
}
app.use(
    helmet.crossOriginEmbedderPolicy({
        policy: "cross-origin"
    })
);

app.use(
    csurf({
        cookie: {
            secure: isProduction,
            sameSite: isProduction ? 'None' : 'Lax',
            httpOnly: true
        }
    })
)







module.exports = app;