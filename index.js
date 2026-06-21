const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { ObjectId } = require("mongodb");
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
    const OpportunitiesCollection = db.collection("opportunities Collection");
    const ApplicationsCollection = db.collection("applications Collection");
    const usersCollection = db.collection("user");
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    app.get('/user', async(req, res)=>{
      const result = await usersCollection.find().toArray();
      res.send(result)
    });
app.put('/startups/query/:id', async (req, res) => {
  const { id } = req.params;

  const result = await StartupsCollection.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: req.body,
    }
  );

  res.send(result);
});
    app.get("/user/:id", async (req, res) => {
  const { id } = req.params;
  const result = await usersCollection.findOne(
    { _id: new ObjectId(id) });
    res.send(result);
});

app.put('/user/:id', async (req, res) => {
  const { id } = req.params;
  const updateData = Object.fromEntries(
    Object.entries(req.body).filter(
      ([_, value]) => value !== undefined && value !== ""
    )
  );

  const result = await usersCollection.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: updateData,
    }
  );

  res.send(result);
});
    app.get('/application', async(req, res)=> {
      const result = await ApplicationsCollection.find().toArray();
      res.send(result)
    });
    app.post('/application', async (req, res) => {
    const newApplication = req.body;
    const result = await ApplicationsCollection.insertOne(newApplication);
     res.send(result);
    });
    app.get('/application/:opportunity_id', async (req, res) => {
    const { opportunity_id } = req.params;
     const result = await ApplicationsCollection.find({opportunity_id: opportunity_id }).toArray();
     res.send(result);
   });
   app.get('/application/applicant/:applicant_id', async (req, res) => {
  const { applicant_id } = req.params;

  const result = await ApplicationsCollection.find({
    applicant_id: applicant_id
  }).toArray();

  res.send(result);
});
app.get('/application/query/:id', async (req, res) => {
  const { id } = req.params;
  const result = await ApplicationsCollection.findOne({
    _id: new ObjectId(id)
  });

  res.send(result);
});
app.put('/application/query/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  console.log(status , 'hdfjdf')
  const result = await ApplicationsCollection.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        status: status
      }
    }
  );

  res.send(result);
});
    app.get('/opportunities', async(req, res)=> {
      const result = await OpportunitiesCollection.find().toArray();
      res.send(result)
    });
    app.post('/opportunities', async (req, res) => {
    const opportunity = req.body;
    const result = await OpportunitiesCollection.insertOne(opportunity);
    res.send(result);
    });
    app.get('/opportunities/:id', async (req, res) => {
    const id = req.params.id;
    const result = await OpportunitiesCollection.findOne({_id: new ObjectId(id),});
    res.send(result);
    });
    app.get('/opportunities/mange/:startupId', async (req, res) => {
     const startupId = req.params.startupId;
     const result = await OpportunitiesCollection.find({startup_id: startupId}).toArray();
     res.send(result);
   });
   app.put('/opportunities/:id', async (req, res) => {
  const id = req.params.id;
  const updatedData = req.body;

  const result = await OpportunitiesCollection.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        role_title: updatedData.role_title,
        required_skills: updatedData.required_skills,
        work_type: updatedData.work_type,
        commitment_level: updatedData.commitment_level,
        date: updatedData.date,
      },
    }
  );

  res.send(result);
});
app.delete('/opportunities/:id', async (req, res) => {
  const id = req.params.id;

  const result = await OpportunitiesCollection.deleteOne({
    _id: new ObjectId(id),
  });

  res.send(result);
});
    app.get('/startups', async(req, res)=> {
      const result = await StartupsCollection.find().toArray();
      res.send(result)
    });
    app.get('/startups/query/:id', async (req, res) => {
    const { id } = req.params;

    const result = await StartupsCollection.findOne({
      _id: new ObjectId(id),
    });
    res.send(result);
});
app.put('/startups/query/:id', async (req, res) => {
  const { id } = req.params;
  const { stats } = req.body;
 console.log(stats, id, 'test')
  const result = await StartupsCollection.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        stats: stats
      }
    }
  );

  res.send(result);
});
    app.delete('/startups/:email', async (req, res) => {
  const email = req.params.email;

  const result = await StartupsCollection.deleteOne({
    founder_email: email,
  });

  res.send(result);
});
    app.post('/startups', async(req, res)=> {
      const query = req.body;
      const result = await StartupsCollection.insertOne(query);
      res.send(result)
    });
    app.get('/startups/:email', async (req, res) => {
      const email = req.params.email;

      const result = await StartupsCollection.findOne({ founder_email: email,});

      res.send(result);
    });
   app.put('/startups/:email', async (req, res) => {
  const email = req.params.email;
  const updatedData = req.body;

  const result = await StartupsCollection.updateOne(
    { founder_email: email },
    {
      $set: {
        startup_name: updatedData.startup_name,
        industry: updatedData.industry,
        funding_stage: updatedData.funding_stage,
        description: updatedData.description,
        logo: updatedData.logo,
      },
    }
  );

  res.send(result);
});

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