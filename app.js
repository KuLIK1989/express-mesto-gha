const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { celebrate, Joi } = require('celebrate');
const { errors } = require('celebrate');
// eslint-disable-next-line import/no-extraneous-dependencies
const rateLimit = require('express-rate-limit');
const usersRouter = require('./routes/users');
const cardsRouter = require('./routes/cards');
const { createUsers, login } = require('./controllers/users');
const auth = require('./midlewares/auth');
// const NotFoundError = require('./utils/errors/NotFoundError');
// eslint-disable-next-line no-unused-vars

const { PORT = 3000 } = process.env;
const { ERROR_SERVER } = require('./utils/errors/constants');
// const NotUsersFound = require('./utils/errors/NotUsersFound');
const NotFoundError = require('./utils/errors/NotFoundError');
// eslint-disable-next-line no-console
const app = express();
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);
app.use(express.json());
app.use(bodyParser.json());

app.post(
  '/signup',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30),
      about: Joi.string().min(2).max(30),
      avatar: Joi.string().pattern(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w.-]*)*\/?$/),
      email: Joi.string().email()
        .required(),
      password: Joi.string()
        .required(),
    }),
  }),
  createUsers,
);

app.post(
  '/signin',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().email()
        .required(),
      password: Joi.string()
        .required(),
    }),
  }),

  login,
);

mongoose.connect('mongodb://127.0.0.1:27017/mestodb');

app.use('/users', auth, usersRouter);
app.use('/cards', auth, cardsRouter);

app.use('*', auth, (req, res, next) => {
  next(new NotFoundError('Запрашиваемая страница не найдена'));
});

app.use(errors());

app.use((err, req, res, next) => {
  // если у ошибки нет статуса, выставляем 500
  const { statusCode = err.status || ERROR_SERVER, message } = err;

  res
    .status(statusCode)
    .send({
      message: statusCode === ERROR_SERVER
        ? 'На сервере произошла ошибка'
        : message,
    });
  return next();
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Слушаю порт ${PORT}`);
});
