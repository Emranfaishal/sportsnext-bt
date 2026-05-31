const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { createRemoteJWKSet, jwtVerify } = require('jose-cjs');
dotenv.config();
const uri = process.env.MONGODB_URL;

const app = express();
const PORT = process.env.PORT || 8000;
// const PORT = 8000;
app.use(cors());
app.use(express.json());

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
const JWKS = createRemoteJWKSet(
    new URL(`${process.env.CLIENT_URL}/api/auth/jwks`)
)

const verifyToken = async (req, res, next) => {
    const authHeader = req?.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ massage: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ massage: 'Unauthorized' });
    }
    try {
        const { payload } = await jwtVerify(token, JWKS);
        console.log(payload);
        next();
    }
    catch (error) {
        return res.status(403).json({ massage: 'Forbidden' });
    }



}
async function run() {
    try {
        // await client.connect();
        const db = client.db('sportsnests');
        const sportsCollection = db.collection('sports');
        const bookingCollection = db.collection('bookings');
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
        app.get('/spots/:id', verifyToken, async (req, res) => {
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
        // 6
        app.post('/bookings', verifyToken, async (req, res) => {
            const bookingData = req.body;
            const result = await bookingCollection.insertOne(bookingData);
            res.json(result);
        });
        // 7
        app.get('/bookings/:userId', async (req, res) => {
            const { userId } = req.params;
            const result = await bookingCollection.find({ userId: userId }).toArray();
            res.json(result);
        });
        // 8
        app.delete('/bookings/:bookingId', async (req, res) => {
            const { bookingId } = req.params;
            const result = await bookingCollection.deleteOne({ _id: new ObjectId(bookingId) });
            res.json(result);
        });
        // 9
        app.get('/sportsPage', async (req, res) => {
            const result = await sportsCollection.find().limit(3).toArray();
            res.json(result);
        });
        // 10
        app.get('/ManageMyFacilities', verifyToken,  async (req, res) => {
            const result = await sportsCollection.find().toArray();
            res.json(result);
        })

        // await client.db("admin").command({ ping: 1 });
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