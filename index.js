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
// async function run() {
//   try {
const clientPromise = client.connect();
app.use(async (req, res, next) => {
  try {
    await clientPromise;
    next();
  } catch (error) {
    console.error("Database connection failed:", error);
    res.status(500).json({ error: "Database connection failed" });
  }
});
    const db = client.db("Start-Forges");
    const startupsCollection = db.collection("startups Collection");
    const OpportunitiesCollection = db.collection("opportunities Collection");
    const ApplicationsCollection = db.collection("applications Collection");
    const paymentsCollection = db.collection("payments Collection");
    const usersCollection = db.collection("user");
    const webSession = db.collection('session')
    await client.connect();
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    const verifyStatus = (req, res, next)=> {
      console.log(req.user)
      if(req.user.status == "Block"){
         return res.status(403).send({ message: "The sit block You" });
      }
       next()
    }
    const verifyAdmin = (req, res, next)=> {
      if (req.user?.role !== "admin") {
        return res.status(403).send({ message: "You are not Admin" });
      };
      next()
    }
    const verifyFounder = (req, res, next)=> {
       if (req.user?.role !== "Founder") {
        return res.status(403).send({ message: "Your are not Founder" });
      };
      next()
    }
    const verifyCollaborator = (req, res, next)=> {
       if (req.user?.role !== "Collaborator") {
        return res.status(403).send({ message: "Your are not Collaborator" });
      };
      next()
    }
    
    const verifyToken = async(req, res, next) => {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).send({ message: "Unauthorized Access" });
      };
      const token = authHeader.split(" ")[1];
      if (!token) {
        return res.status(401).send({ message: "No Token Available" });
      }
      const query = {token: token}
      const session = await webSession.findOne(query)
      if (!session) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
      const userId = session.userId;
      const userQuery = {_id: userId}
      const user = await usersCollection.findOne(userQuery);
      req.user = user;
      next()
    };
    app.get('/payment', verifyToken,verifyAdmin,verifyStatus, async (req, res) => {
      const result = await paymentsCollection.find().toArray();
      res.send(result)
    })
    app.post('/payment', async (req, res) => {
      const newPayment = req.body;
      const result = await paymentsCollection.insertOne(newPayment);
      res.send(result)
    })
    app.get('/user', verifyToken,verifyAdmin,verifyStatus, async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result)
    });
    app.get("/user/:id",verifyToken,verifyCollaborator,verifyStatus, async (req, res) => {
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
    app.get('/application', async (req, res) => {
      const result = await ApplicationsCollection.find().toArray();
      res.send(result)
    });
    app.post('/application', async (req, res) => {
      const result = req.body;
      const query = await ApplicationsCollection.insertOne(result);
      res.send(result)
    });
    app.get('/application/:opportunity_id',  async (req, res) => {
      const { opportunity_id } = req.params;
      const result = await ApplicationsCollection.find({ opportunity_id: opportunity_id }).toArray();
      res.send(result);
    });
    app.get('/application/applicant/:applicant_id', verifyToken,verifyCollaborator, async (req, res) => {
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
    app.get('/opportunities', async (req, res) => {
      try {
        const page = parseInt(req.query.page) || 1;
        const limit = 6;

        const skip = (page - 1) * limit;

        const total = await OpportunitiesCollection.countDocuments();

        const opportunities = await OpportunitiesCollection.find()
          .skip(skip)
          .limit(limit)
          .toArray();

        res.send({
          opportunities,
          total,
          currentPage: page,
          totalPages: Math.ceil(total / limit),
        });
      } catch (error) {
        res.status(500).send({
          message: error.message,
        });
      }
    });
    app.post('/opportunities', async (req, res) => {
      const opportunity = req.body;
      const result = await OpportunitiesCollection.insertOne(opportunity);
      res.send(result);
    });
    app.get('/opportunities/:id', async (req, res) => {
      const id = req.params.id;
      const result = await OpportunitiesCollection.findOne({ _id: new ObjectId(id), });
      res.send(result);
    });
    app.get('/opportunities/mange/:startupId',verifyToken,verifyFounder, async (req, res) => {
      const startupId = req.params.startupId;
      const result = await OpportunitiesCollection.find({ startup_id: startupId }).toArray();
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
    app.get('/startups', async (req, res) => {
      const result = await startupsCollection.find().toArray();
      res.send(result)
    });
    app.get("/startups/new/:id", async (req, res) => {
  const id = req.params.id;

  const query = {
    _id: new ObjectId(id),
  };

  const result = await startupsCollection.findOne(query);

  res.send(result);
});
    app.get('/startups/query/:id', async (req, res) => {
      const { id } = req.params;

      const result = await startupsCollection.findOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });
    app.put('/startups/query/:id', async (req, res) => {
      const { id } = req.params;
      const { stats } = req.body;
      console.log(stats, id, 'test')
      const chak = await startupsCollection.findOne({ _id: new ObjectId(id) })
      console.log(chak)
      const result = await startupsCollection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            stats: stats
          }
        }
      );
    console.log(result)
      res.send(result);
    });
    app.delete('/startups/:email', async (req, res) => {
      const email = req.params.email;
      const result = await startupsCollection.deleteOne({
        founder_email: email,
      });

      res.send(result);
    });
    app.post('/startups', async (req, res) => {
      const query = req.body;
      const result = await startupsCollection.insertOne(query);
      res.send(result)
    });
    app.get('/startups/:email', async (req, res) => {
      const email = req.params.email;

      const result = await startupsCollection.findOne({ founder_email: email, });

      res.send(result || []);
    });
    app.delete("/startups/query/:id", async (req, res) => {
      const result = await startupsCollection.deleteOne({
        _id: new ObjectId(req.params.id),
      });
      res.send(result);
    });
    app.put('/startups/:email', async (req, res) => {
      const email = req.params.email;
      const updatedData = req.body;

      const result = await startupsCollection.updateOne(
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

//   } finally {

//     // await client.close();
//   }
// }
// run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
module.exports=app 