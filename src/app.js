const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const globalErrorHandler = require('./core/middleware/errorMiddleware');
const AppError = require('./core/utils/appError');

const app = express();

app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Server is healthy!' });
});

app.all(/(.*)/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;