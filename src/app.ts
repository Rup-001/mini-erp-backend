import express from 'express';
import helmet from 'helmet';
import xss from 'xss-clean';
import mongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import cors from 'cors';
import passport from 'passport';
import httpStatus from 'http-status';
import { config } from './config/env';
import { successHandler, errorHandler as morganErrorHandler } from './config/morgan';
import { jwtStrategy } from './config/passport';
import { authLimiter } from './middlewares/rateLimiter';
import routes from './routes';
import { errorConverter, errorHandler } from './middlewares/error.middleware';
import { ApiError } from './common/ApiError';

const app = express();

if (config.env !== 'test') {
  app.use(successHandler);
  app.use(morganErrorHandler);
}

app.use(express.static('public'));

app.use(helmet());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(xss());
app.use(mongoSanitize());

app.use(compression());

app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  })
);
app.options('*', cors({ origin: config.clientUrl, credentials: true }));

app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

if (config.env === 'production') {
  app.use('/api/v1/auth/login', authLimiter);
}

app.use('/api/v1', routes);

app.use((_req, _res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'This API Not found'));
});

app.use(errorConverter);
app.use(errorHandler);

export default app;
