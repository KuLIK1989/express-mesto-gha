const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const usersRouter = require('./routes/users');
const cardsRouter = require('./routes/cards');

const { PORT = 3000 } = process.env;
// eslint-disable-next-line no-console
const app = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  req.user = {
    _id: '648b04a27b19dc8e668d6f86',
  };

  next();
});

mongoose.connect('mongodb://127.0.0.1:27017/mestodb');

app.use('/users', usersRouter);
app.use('/cards', cardsRouter);

app.use('*', (req, res) => {
  res.status(404).send({ message: 'Запрашиваемая страница не найдена' });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Слушаю порт ${PORT}`);
});
