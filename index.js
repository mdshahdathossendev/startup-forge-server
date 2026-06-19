const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const app = express();
dotenv.config();
app.use(express.json());
app.use(cors());
const port = 8080;
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGODB_URI
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    const db = client.db("Start-Forges");
    const StartupsCollection = db.collection("startups Collection");
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    app.get('/startups', async(req, res)=> {
      const result = await StartupsCollection.find().toArray();
      res.send(result)
    });
    app.post('/startups', async(req, res)=> {
      const query = req.body;
      const result = await StartupsCollection.insertOne(query);
      res.send(result)
    })

  } finally {
   
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});