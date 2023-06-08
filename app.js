const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const usersRouter = require('./routes/users');
const cardsRouter = require('./routes/cards');

const { PORT = 300 } = process.env;
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect('mongodb://127.0.0.1:27017/mestodb');

app.use('/users', usersRouter);
app.use('/cards', cardsRouter);

app.use('*', (req, res) => {
  res.status(404).send({ message: 'Запрашиваемая страница не найдена' });
});

app.listen(PORT, () => {
  // Если всё работает, консоль покажет, какой порт приложение слушает
  console.log(`Слушаю порт ${PORT}`);
});
