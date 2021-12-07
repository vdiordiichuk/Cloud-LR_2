const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const connect = async () =>
  await mongoose.connect(
    'mongodb+srv://hlib:123@cluster0.nywmb.mongodb.net/cloud-tech?retryWrites=true&w=majority'
  );

const caloriesSchema = new mongoose.Schema(
  {
    description: String,
    calories: Number,
  },
  { timestamps: true }
);

const caloriesModel = mongoose.model('calories', caloriesSchema);

const app = express();
app.use(bodyParser.json({ extended: false }));

app.get('/api/data', async (req, res) => {
  const data = await caloriesModel.find().select('-v').lean();

  res.json(data);
});

app.post('/api/data', async (req, res) => {
  const { calories, description } = req.body;

  const data = await caloriesModel.create({ description, calories });

  res.status(201).json(data);
});

app.delete('/api/data/:id', async (req, res) => {
  const { id } = req.params;

  await caloriesModel.findByIdAndDelete({ _id: id }).lean();

  res.sendStatus(204);
});

const PORT = 8080;
connect().then(() => {
  console.log('Connected to DB');

  app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
  });
});

module.exports = app;
