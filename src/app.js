import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import globalErrorHandler from './core/middleware/errorMiddleware.js';
import AppError from './core/utils/appError.js';
import apiRoutes from './app.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'Server is healthy!' });
});

app.use('/api/v1', apiRoutes);

app.all(/'*'/, (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;