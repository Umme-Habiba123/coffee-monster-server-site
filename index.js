const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const jwt= require('jsonwebtoken')
const cookieParser=require('cookie-parser')
const port = 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");


app.use(cors({
  origin:['http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser())

console.log(process.env.DB_USER);
console.log(process.env.DB_PASS);

// ---------------------
// user: coffee_monster
//password: 6WHfTfByFGuofDeo

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jbcozto.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version

app.get("/", (req, res) => {
  res.send("Coffee server is getting hotter");
});

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const coffesCollection = client.db("coffeesDB").collection("coffees");

    const userCollection = client.db("coffeesDB").collection("users");

    // jwt token related API------
 app.post('/jwt', async(req,res)=>{
   const userData=req.body
   const token=jwt.sign(userData, process.env.JWT_ACCESS_SECRET, {expiresIn: '1d'})
  
  //  set token in the cookies-------
   res.cookie('token', token,{
    httpOnly: true,
    secure:false
   })

   res.send({success: true})
 })



//  Coffee API--------
    app.get("/coffees", async (req, res) => {
      const result = await coffesCollection.find().toArray();
      res.send(result);
    });

    app.get("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffesCollection.findOne(query);
      res.send(result);
    });

    app.put("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedCoffee = req.body;
      const updatedDoc = {
        $set: updatedCoffee,
      };
      const result = await coffesCollection.updateOne(
        filter,
        updatedDoc,
        options
      );

      res.send(result);
    });

    app.post("/coffees", async (req, res) => {
      const newCoffee = req.body;
      console.log(newCoffee);

      const result = await coffesCollection.insertOne(newCoffee);
      res.send(result);
    });

    app.get("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffesCollection.deleteOne(query);
      res.send(result);
    });

    app.delete("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffesCollection.deleteOne(query);
      res.send(result);
    });

    // user related API---
    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    app.patch("/users", async (req, res) => {
      const { email } = req.body;
      const filter = { email: email };
      const updatedDoc = {
        $set: {
          lastSignInTime: lastSignInTime,
        },
      };
      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    // users related API----------

    app.post("/users", async (req, res) => {
      const userProfile = req.body;
      console.log(userProfile);
      const result = await userCollection.insertOne(userProfile);
      res.send(result);
    });

    // Send a ping to confirm a successful connection--

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Coffee server is running port${port}`);
});
