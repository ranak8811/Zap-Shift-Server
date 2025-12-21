const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --------------------------------------------------------------

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@project-cluster.iulg13z.mongodb.net/?appName=Project-Cluster`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
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

    const db = client.db("parcelDB");
    const parcelCollection = db.collection("parcels");
    const usersCollection = db.collection("users");

    //--------------------API Starts---------------------------

    app.get("/parcels", async (req, res) => {
      try {
        const userEmail = req.query.email;
        const query = userEmail
          ? {
              created_by: userEmail,
            }
          : {};
        const options = {
          sort: { createdAt: -1 },
        };
        const result = await parcelCollection.find(query, options).toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching parcel data:", error);
        res.status(500).json({ message: "Failed to fetch parcel data" });
      }
    });

    app.post("/parcels", async (req, res) => {
      try {
        const newParcel = req.body;
        const result = await parcelCollection.insertOne(newParcel);
        res.send(result);
      } catch (error) {
        console.error("Error inserting parcel data:", error);
        res.status(500).json({ message: "Failed to insert parcel data" });
      }
    });

    app.delete("/parcels/:id", async (req, res) => {
      try {
        const id = req.params.id;

        const result = await parcelCollection.deleteOne({
          _id: new ObjectId(id),
        });

        res.send(result);
      } catch (error) {
        console.error("Error deleting parcel:", error);
        res.status(500).send({ message: "Failed to delete parcel" });
      }
    });

    //--------------------API Ends---------------------------

    // Send a ping to confirm a successful connection
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

// --------------------------------------------------------------

app.get("/", (req, res) => {
  res.send("Percel Server is running");
});

app.listen(port, () => {
  console.log(`Percel Server is running on port ${port}`);
});
