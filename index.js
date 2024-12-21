const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
dotenv.config();    
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.k2nj4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

        const database = client.db('Assignment-11');
        const foodsCollection = database.collection('allFoods');
        const ordersCollection = database.collection('orders');


async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");

        app.get('/allFoods', async (req, res) => {
            const cursor = foodsCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        });

        app.get('/allFoods/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await foodsCollection.findOne(query);
            res.send(result);
        })

        app.post('/orders', async (req, res) => {
            const newOrder = req.body;
            const result = await ordersCollection.insertOne(newOrder);
            res.send(result);
        });

        app.get('/orders', async (req, res) => {
            const cursor = ordersCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        });

        app.patch('/allFoods/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedFood = req.body;
        
            
            const food = {
                $set: {
                    Quantity: updatedFood.quan, 
                    SoldCount: updatedFood.newSoldCount, 
                }
            };
        
            try {
                const result = await foodsCollection.updateOne(filter, food, options);
                res.status(200).send(result);
            } catch (error) {
                console.error('Error updating food:', error);
                res.status(500).send({ message: 'Failed to update food', error });
            }
        });

        app.get('/orders/:email', async (req, res) => {
            const email = req.params.email;
            const query = {BuyerEmail: `${email}`}
            const cursor = ordersCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await ordersCollection.deleteOne(query);
            res.send(result);
        })




    } finally {
        // Ensures that the client will close when you finish/error
        //   await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Backend connected')
})

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
})
