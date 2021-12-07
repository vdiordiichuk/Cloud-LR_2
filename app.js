const express = require('express');
const bodyParser = require('body-parser');
const { Datastore } = require('@google-cloud/datastore');
const crypto = require('crypto');

const app = express();
app.use(bodyParser.json({ extended: false }));

const datastore = new Datastore();

app.get('/', async (req, res) => {
  const query = datastore.createQuery('Calories amount');

  const [results] = await datastore.runQuery(query);

  const formattedEntities = results.map((e) => {
    return {
      description: e.description,
      value: e[datastore.KEY].name,
    };
  });

  console.log(formattedEntities[0].key);

  res.send(`
  <form action="/calories" method="post">
    <input placeholder="Calories Amount" name="calories" type="number" />
    <input placeholder="Description" name="description" type="text" />
    <button type="submit">Submit</button>
  </form>
  <ul>
    ${formattedEntities
      .map((e) => {
        return `<li>${e.description} - ${e.value} calories</li>`;
      })
      .join('')}
  </ul>
  `);
});

app.post('/calories', async (req, res) => {
  const { calories, description } = req.body;

  const task = {
    key: datastore.key(['Calories amount', calories]),
    data: {
      description,
    },
  };

  await datastore.save(task);

  res.redirect('/');
});

app.get('/api/data', async (req, res) => {
  const query = datastore.createQuery('Calories amount');

  const [results] = await datastore.runQuery(query);

  const formattedEntities = results.map(({ description, calories, id }) => {
    return {
      id,
      description,
      calories,
    };
  });

  res.json(formattedEntities);
});

app.post('/api/data', async (req, res) => {
  const { calories, description } = req.body;

  const id = Date.now();

  const record = {
    key: datastore.key(['Calories amount', id]),
    data: {
      description,
      calories,
      id,
    },
  };

  await datastore.save(record);

  res.status(201).json(record.data);
});

app.delete('/api/data/:id', async (req, res) => {
  console.log('here');
  const { id } = req.params;

  const key = datastore.key(['Calories amount', +id]);

  await datastore.delete(key);

  res.sendStatus(204);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});

module.exports = app;
