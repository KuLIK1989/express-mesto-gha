const Card = require('../models/card');

const getCard = (req, res) => Card.find({})
  // .populate(['owner', 'likes'])
  .then((card) => res.send({ data: card }))
  .catch((error) => res.status(500).send(`Ошибка сервера: ${error}`));

const createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((card) => res.send({ data: card }))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        res.status(400).send({ message: 'Переданы некорректные данные при создании карточки' });
      } else {
        res.status(500).send(`Ошибка сервера: ${error}`);
      }
    });
};

const deleteCard = (req, res) => Card.findByIdAndRemove(req.params.cardId)
  .then((card) => {
    if (card) {
      res.send({ data: card });
    } else {
      res.status(404).send({ message: 'Карточка по указанному _id не найдена' });
    }
  })
  .catch((error) => {
    if (error.name === 'CastError') {
      res.status(400).send({ message: 'Переданы некорректные данные карточки' });
    } else {
      res.status(500).send(`На сервере произошла ошибка: ${error}`);
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
      res.status(404).send({ message: 'Карточка по указанному _id не найдена' });
    }
  })
  .catch((error) => {
    if (error.name === 'CastError') {
      res.status(400).send({ message: 'Переданы некорректные данные для постановки лайка' });
    } else {
      res.status(500).send(`На сервере произошла ошибка: ${error}`);
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
      res.status(404).send({ message: 'Карточка по указанному _id не найдена' });
    }
  })
  .catch((error) => {
    if (error.name === 'CastError') {
      res.status(400).send({ message: 'Переданы некорректные данные для снятии лайка' });
    } else {
      res.status(500).send(`На сервере произошла ошибка: ${error}`);
    }
  });

module.exports = {
  getCard, createCard, deleteCard, likeCard, deleteLike,
};
