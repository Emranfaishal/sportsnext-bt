const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        // 1
        app.post('/spots', async (req, res) => {
            const sportData = req.body;
            const result = await sportsCollection.insertOne(sportData);
            res.json(result);
        });
        // 2
        app.get('/spots', async (req, res) => {
            const result = await sportsCollection.find().toArray();
            res.json(result);
        });
        // 3
        app.get('/spots/:id', async (req, res) => {
            const { id } = req.params;
            const result = await sportsCollection.findOne({ _id: new ObjectId(id) });
            res.json(result);
        });
        // 4
        app.patch('/spots/:id', async (req, res) => {
            const { id } = req.params;
            const updatedData = req.body;
            const result = await sportsCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: updatedData });
            res.json(result);
        });
        // 5
        app.delete('/spots/:id', async (req, res) => {
            const { id } = req.params;
            const result = await sportsCollection.deleteOne({ _id: new ObjectId(id) });
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