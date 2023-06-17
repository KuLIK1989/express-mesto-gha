const Card = require('../models/card');

const {
  ERROR_CODE,
  ERROR_NO_USER,
  ERROR_SERVER,
} = require('../utils/errors/constants');

const getCard = (req, res) => Card.find({})
// .populate(['owner', 'likes'])
  .then((card) => res.send({ data: card }))
  .catch((error) => res.status(ERROR_SERVER).send(`Ошибка сервера: ${error}`));

const createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((card) => res.send({ data: card }))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        res
          .status(ERROR_CODE)
          .send({
            message: 'Переданы некорректные данные при создании карточки',
          });
      } else {
        res.status(ERROR_SERVER).send('Ошибка сервера');
      }
    });
};

const deleteCard = (req, res) => Card.findByIdAndRemove(req.params.cardId)
  .then((card) => {
    if (card) {
      res.send({ data: card });
    } else {
      res
        .status(ERROR_NO_USER)
        .send({ message: 'Карточка по указанному _id не найдена' });
    }
  })
  .catch((error) => {
    if (error.name === 'CastError') {
      res
        .status(ERROR_CODE)
        .send({ message: 'Переданы некорректные данные карточки' });
    } else {
      res.status(ERROR_SERVER).send('На сервере произошла ошибка');
    }
  });

const likeCard = (req, res) => Card.findByIdAndUpdate(
  req.params.cardId,
  { $addToSet: { likes: req.user._id } },
  { new: true },
)
  .then((card) => {
    if (card) {
      res.send({ data: card });
    } else {
      res
        .status(ERROR_NO_USER)
        .send({ message: 'Карточка по указанному _id не найдена' });
    }
  })
  .catch((error) => {
    if (error.name === 'CastError') {
      res
        .status(ERROR_CODE)
        .send({
          message: 'Переданы некорректные данные для постановки лайка',
        });
    } else {
      res.status(ERROR_SERVER).send('На сервере произошла ошибка');
    }
  });

const deleteLike = (req, res) => Card.findByIdAndUpdate(
  req.params.cardId,
  { $pull: { likes: req.user._id } },
  { new: true },
)
  .then((card) => {
    if (card) {
      res.send({ data: card });
    } else {
      res
        .status(ERROR_NO_USER)
        .send({ message: 'Карточка по указанному _id не найдена' });
    }
  })
  .catch((error) => {
    if (error.name === 'CastError') {
      res
        .status(ERROR_CODE)
        .send({ message: 'Переданы некорректные данные для снятии лайка' });
    } else {
      res.status(ERROR_SERVER).send('На сервере произошла ошибка');
    }
  });

module.exports = {
  getCard,
  createCard,
  deleteCard,
  likeCard,
  deleteLike,
};
