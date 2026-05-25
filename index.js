const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
dotenv.config();
const uri = process.env.MONGODB_URL;

const app = express();
// const PORT = process.env.PORT || 8000;
const PORT = 8000;
app.use(cors());
app.use(express.json());

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
async function run() {
    try {
        await client.connect();
        const db = client.db('sportsnests');
        const sportsCollection = db.collection('sports');
        app.post('/spots', async (req, res) => {
            const sportData = req.body;
            const result = await sportsCollection.insertOne(sportData);
            res.json(result);
        });



        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('server is running find');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});