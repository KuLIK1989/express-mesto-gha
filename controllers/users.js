const User = require('../models/user');

const getUsers = (req, res) => User.find({})
  .then((users) => res.status(200).send({ data: users }))
  .catch((error) => res.status(500).send(`Ошибка сервера: ${error}`));

const getUsersId = (req, res) => User.findById(req.params.userId)
  .then((user) => res.status(200).send(user))
  .catch((error) => {
    if (error.name === 'CastError') {
      res.status(400).send({ message: 'Нет пользователя с таким ID' });
    } else {
      res.status(500).send(`Ошибка сервера: ${error}`);
    }
  });

const createUsers = (req, res) => {
  const { name, about, avatar } = req.body;
  return User.create({ name, about, avatar })
    .then((user) => res.status(200).send({ data: user }))
    .catch((error) => {
      if (error.name === 'ValidationError' || error.name === 'CastError') {
        res
          .status(400)
          .send({
            message: 'Переданы некорректные данные при создании пользователя',
          });
      } else {
        res.status(500).send(`Ошибка сервера: ${error}`);
      }
    });
};

const changeUserInfo = (req, res) => {
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
        res
          .status(400)
          .send({
            message: 'Переданы некорректные данные при обновлении профиля',
          });
      } else {
        res.status(500).send(`Ошибка сервера: ${error}`);
      }
    });
};

const changeAvatar = (req, res) => {
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
        res
          .status(400)
          .send({
            message: 'Переданы некорректные данные при обновлении аватара',
          });
      } else {
        res.status(500).send(`Ошибка сервера: ${error}`);
      }
    });
};

module.exports = {
  getUsers,
  getUsersId,
  createUsers,
  changeUserInfo,
  changeAvatar,
};
