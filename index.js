const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();

const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
dotenv.config();
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');

app.use(cors(
    {
        origin: [
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:5175',
            'https://assignment-11-c95a9.web.app'

        ],
        credentials: true,
    }
));
app.use(cookieParser());
app.use(express.json());

// custom middleware
const verifyToken = (req, res, next) => {
    const token = req.cookies?.token;
    console.log(token);

    if (!token) {
        return res.status(401).send({ message: 'Unauthorized access' })
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: 'Token verification failed: ' + err.message })
        }
        // if there is no error,
        req.user = decoded;
        next();
    })
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lzwyzdb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


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
        // Connect the client to the server (optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        app.post('/jwt', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '5h' })

            res.cookie('token', token, {
                httpOnly: true,
                // secure: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            })
                .send({ success: true })
        })

        app.post('/logout', async (req, res) => {
            res.clearCookie('token', {
                httpOnly: true,
                // secure: 'false',
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            })
                .send({ success: true })
        })


        // Other APIs

        app.get('/allFoods', async (req, res) => {

            const page = parseInt(req.query.page); // Parse the page number
            const size = parseInt(req.query.size); // Parse the size of items per page

            try {
                const result = await foodsCollection.find()
                    .skip(page * size)
                    .limit(size)
                    .toArray();
                res.send(result);
            } catch (error) {
                res.status(500).send({ error: 'An error occurred while fetching products.' });
            }

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

        app.get('/orders', verifyToken, async (req, res) => {
            try {
                // Optionally, filter orders by the user's email if needed
                const query = { BuyerEmail: req.user.email }; // Assuming orders are linked to a BuyerEmail
                const cursor = ordersCollection.find(query);
                const result = await cursor.toArray();
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: 'Failed to fetch orders', error });
            }
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

        app.get('/orders/:email', verifyToken, async (req, res) => {

            console.log(req.params.email);

            if (req.user.email !== req.params.email) {
                return res.status(403).send({ message: 'forbidden access' })
            }
            const email = req.params.email;
            const query = { BuyerEmail: `${email}` }
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

        app.post('/allFoods', async (req, res) => {
            const newFood = req.body;
            const result = await foodsCollection.insertOne(newFood);
            res.send(result);
        });

        app.get('/allFoods/byEmail/:email', verifyToken, async (req, res) => {

            console.log(req.params.email);

            if (req.user.email !== req.params.email) {
                return res.status(403).send({ message: 'forbidden access' })
            }

            const email = req.params.email;
            const query = { addedByEmail: `${email}` }
            const cursor = foodsCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });


        // app.patch('/allFoods/update/:id', verifyToken, async (req, res) => {


        //     const id = req.params.id;
        //     const filter = { _id: new ObjectId(id) };
        //     const options = { upsert: true };
        //     const updatedFood = req.body;

        //     const food = {
        //         $set: {
        //             FoodName: updatedFood.FoodName,
        //             Price: updatedFood.Price,
        //             Quantity: updatedFood.Quantity,
        //             Description: updatedFood.Description,
        //             Image: updatedFood.Image,
        //             foodCategory: updatedFood.foodCategory
        //         }
        //     };

        //     try {
        //         const result = await foodsCollection.updateOne(filter, food, options);
        //         res.status(200).send(result);
        //     } catch (error) {
        //         console.error('Error updating food:', error);
        //         res.status(500).send({ message: 'Failed to update food', error });
        //     }
        // });

        app.get('/foodCount', async (req, res) => {
            const count = await foodsCollection.estimatedDocumentCount();
            res.send({ count });
        })

        // Add these two routes to your backend index.js file

// DELETE a food item by ID
app.delete('/allFoods/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await foodsCollection.deleteOne(query);
        res.send(result);
    } catch (error) {
        console.error('Error deleting food:', error);
        res.status(500).send({ message: 'Failed to delete food', error });
    }
});

// UPDATE a food item by ID
app.patch('/allFoods/update/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updatedFoodData = req.body; // The new data from the frontend

        const food = {
            $set: {
                FoodName: updatedFoodData.FoodName,
                Price: updatedFoodData.Price,
                Quantity: updatedFoodData.Quantity,
                Description: updatedFoodData.Description,
                Image: updatedFoodData.Image,
                foodCategory: updatedFoodData.foodCategory
            }
        };

        const result = await foodsCollection.updateOne(filter, food);
        res.send(result);
    } catch (error) {
        console.error('Error updating food:', error);
        res.status(500).send({ message: 'Failed to update food', error });
    }
});

    } finally {
        // Ensures that the client will close when you finish/error
        // 	await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Backend connected')
})

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
})