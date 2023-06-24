// eslint-disable-next-line import/no-extraneous-dependencies
const bcrypt = require('bcrypt');
// eslint-disable-next-line import/no-extraneous-dependencies
const jsonwebtoken = require('jsonwebtoken');
const User = require('../models/user');
// const ErrorCode = require('../utils/errors/ErrorCode');
// const ConflictRequest = require('../utils/errors/ConflictRequest');
const NotFoundError = require('../utils/errors/NotFoundError');
const NotUsersFound = require('../utils/errors/NotUsersFound');
const ConflictRequest = require('../utils/errors/ConflictRequest');
const BadRequestError = require('../utils/errors/BadRequestError');
const { SUCCESS, BASE_ERROR, CREATED } = require('../utils/errors/constants');

const login = (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email }).select('+password')
    .orFail(() => new NotUsersFound('Пользователь не найден'))
    .then((user) => bcrypt.compare(password, user.password).then((matched) => {
      if (matched) {
        return user;
      }
      throw new NotFoundError('Неправильная почта или пароль');
    }))
    .then((user) => {
      const jwt = jsonwebtoken.sign({ _id: user._id }, 'some-secret-key', { expiresIn: '7d' });
      res.send({ jwt });
    })
    .catch(next);
};
const getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => res.status(SUCCESS).send({ data: user }))
    .catch(next);
};

const getUsers = (req, res, next) => User.find({})
  .then((users) => res.status(SUCCESS).send({ data: users }))
  .catch(next);

const getUsersId = (req, res, next) => User.findById(req.params.userId)
  .then((user) => {
    if (user) {
      res.send({ data: user });
    } else {
      next(new NotFoundError('Пользователь по указанному _id не найден'));
    }
  })
  .catch((error) => {
    if (error.name === 'CastError') {
      next(new BadRequestError('Некорректный _id пользователя'));
    } else {
      next(error);
    }
  });

const createUsers = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  // return User.create({ name, about, avatar })
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then((user) => res.status(CREATED).send({
      email: user.email,
      name: user.name,
      about: user.about,
      avatar: user.avatar,
    }))
    // .then((user) => res.send({ data: user }))
    .catch((error) => {
      if (error.name === 'ValidationError' || error.name === 'CastError') {
        next(new BadRequestError('Переданы некорректные данные при создании пользователя'));
      } else if (error.code === BASE_ERROR) {
        next(new ConflictRequest('Пользователь с указанной почтой уже есть в системе'));
        // res.status(ERROR_SERVER).send('Ошибка сервера');
      } else {
        next(error);
      }
    });
};

const changeUserInfo = (req, res, next) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    {
      new: true,
      runValidators: true,
    },
  )
    .then((userInfo) => res.send({ data: userInfo }))
    .catch((error) => {
      if (error.name === 'ValidationError' || error.name === 'CastError') {
        next(new BadRequestError('Переданы некорректные данные при обновлении профиля'));
      } else {
        next(error);
      }
    });
};

const changeAvatar = (req, res, next) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    {
      new: true,
      runValidators: true,
    },
  )
    .then((userAvatar) => res.send({ data: userAvatar }))
    .catch((error) => {
      if (error.name === 'ValidationError' || error.name === 'CastError') {
        next(new BadRequestError('Переданы некорректные данные при обновлении аватара'));
      } else {
        next(error);
      }
    });
};

module.exports = {
  login,
  getCurrentUser,
  getUsers,
  getUsersId,
  createUsers,
  changeUserInfo,
  changeAvatar,
};
