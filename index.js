const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
// const admin = require("firebase-admin");

const port = process.env.PORT || 5000;

// const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
// const { messaging } = require('firebase-admin');

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });


app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.w2rjm.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// async function verifyToken(req, res, next) {
//   if(req.headers?.authorization?.startsWith('Bearer ')) {
//     const token = req.headers.authorization.split(' ')[1];
//     try {
//       const decodedUser = await admin.auth().verifyIdToken(token);
//       req.decodedEmail = decodedUser.email;
//     } catch {

//     }
//   }
//   next();
// }

async function run() {
    try {
        await client.connect();
        const database = client.db('niche_website');
        const productsCollection = database.collection('products');
        const reviewsCollection = database.collection('reviews');
        const usersCollection = database.collection('users');
        const ordersCollection = database.collection('orders');

        // Get Products API
        app.get('/products', async(req, res) => {
          const cursor = productsCollection.find({});
          const products = await cursor.toArray();
          res.send(products);
        });

        // Get Reviews API
        app.get('/reviews', async(req, res) => {
          const cursor = reviewsCollection.find({});
          const reviews = await cursor.toArray();
          res.send(reviews);
        });

        // Get Single Product API
        app.get('/products/:id', async(req, res) => {
          const id = req.params.id;
          const query = { _id: ObjectId(id) };
          const singleProduct = await productsCollection.findOne(query);
          res.json(singleProduct);
        });

        // Get My Orders API
        app.get('/orders', async(req, res) => {
          const query = req.query;
          const cursor = ordersCollection.find(query);
          const orders = await cursor.toArray();
          res.send(orders);
        });

        // Get An User API
        app.get('/users/:email', async(req, res) => {
          const email = req.params.email;
          const query = { email: email };
          const user = await usersCollection.findOne(query);
          let isAdmin = false;
          if(user?.role === 'admin') {
            isAdmin = true;
          }
          res.json({ admin: isAdmin });
        });

        // Insert A User API
        app.post('/users', async(req, res) => {
          const user = req.body;
          const result = await usersCollection.insertOne(user);
          console.log(result);
          res.json(result);
        });

        // Insert An Order API
        app.post('/orders', async(req, res) => {
          const newOrder = req.body;
          const result = await ordersCollection.insertOne(newOrder);
          res.json(result);
        });

        // Insert A Review API
        app.post('/reviews', async(req, res) => {
          const newReview = req.body;
          const result = await reviewsCollection.insertOne(newReview);
          res.json(result);
        });

        // Insert A Product API
        app.post('/products', async(req, res) => {
          const newProduct = req.body;
          const result = await productsCollection.insertOne(newProduct);
          res.json(result);
        });

        // Delete An Order API (from My Orders)
        app.delete('/orders/:id', async (req, res) => {
          const id = req.params.id;
          const query = { _id: ObjectId(id) };
          const result = await ordersCollection.deleteOne(query);
          res.json(result);
        });

        // Make An Admin API
        app.put('/users/admin', async (req, res) => {
          const user = req.body;
          const filter = { email: user.email };
          const updateDoc = { $set: { role: 'admin' } };
          const result = await usersCollection.updateOne(filter, updateDoc); 
          res.json(result);
        });

        

        // app.post('/appointments', async(req, res) => {
        //     const appointment = req.body;
        //     const result = await productsCollection.insertOne(appointment);
        //     res.json(result);
        // });
        
        
        // app.post('/users', async(req, res) => {
        //   const user = req.body;
        //   const result = await usersCollection.insertOne(user);
        //   console.log(result);
        //   res.json(result);
        // });

        // app.put('/users', async(req, res) => {
        //   const user = req.body;
        //   const filter = { email: user.email };
        //   const options = { upsert: true };
        //   const updateDoc = { $set: user };
        //   const result = await usersCollection.updateOne(filter, updateDoc, options);
        //   res.json(result); 
        // });

        // app.put('/users/admin', verifyToken, async(req, res) => {
        //   const user = req.body;
        //   console.log('put', req.decodedEmail);

        //   const requester = req.decodedEmail;
        //   if(requester) {
        //     const requesterAccount = await usersCollection.findOne({ email: requester });
        //     if(requesterAccount.role === 'admin') {
        //       const filter = { email: user.email };
        //       const updateDoc = { $set: { role: 'admin' } };
        //       const result = await usersCollection.updateOne(filter, updateDoc);   
        //       res.json(result);
        //     }
        //   }
        //   else {
        //     res.status(403).json({ message: 'You Do Not Have Access To Make Admin' });
        //   }
        // });

        // app.get('/appointments', verifyToken, async(req, res) => {
        //   const email = req.query.email;
        //   const date = req.query.date;
        //   const query = { email: email, date: date };
        //   const cursor = productsCollection.find(query);
        //   const appointments = await cursor.toArray();
        //   res.json(appointments);
        // });

        // app.get('/users/:email', async(req, res) => {
        //   const email = req.params.email;
        //   const query = { email: email };
        //   const user = await usersCollection.findOne(query);
        //   let isAdmin = false;
        //   if(user?.role === 'admin') {
        //     isAdmin = true;
        //   }
        //   res.json({ admin: isAdmin });
        // });
    } finally {
        // await client.close(); 
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`listening at ${port}`);
});