const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors');
const app = express()
require('dotenv').config()

app.use(bodyParser.json())
app.use(cors())

console.log(process.env.DB_NAME);


const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9wp98.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const productCollection = client.db("emajohndb").collection("goods");
  const ordersCollection = client.db("emajohndb").collection("orders");
  app.post('/addProduct', (req, res) => {
    const products = req.body;
    productCollection.insertOne(products)
      .then(result => {
        res.send(result.insertedCount)
      })
  })

  app.post('/addOrder', (req, res) => {
    const orderInfo = req.body;
    ordersCollection.insertOne(orderInfo)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })

  app.get('/products', (req, res) => {
    const search = req.query.search;
    productCollection.find({name: {$regex: search}})
      .toArray((error, document) => {
        res.send(document);
      })
  })

  app.get('/product/:key', (req, res) => {
    productCollection.find({ key: req.params.key })
      .toArray((error, document) => {
        res.send(document[0]);
      })
  })

  app.post('/productsByKeys', (req, res) => {
    const productKeys = req.body;
    productCollection.find({key: {$in: productKeys } })
      .toArray((err, documents) => {
        res.send(documents);
      })
  })
});


app.get('/', (req, res) => {
  res.send('Hello MongoDB!')
})

app.listen(4000)