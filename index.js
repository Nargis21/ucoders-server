const express = require('express');
const cors = require('cors');
require('dotenv').config()
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express()
const port = process.env.PORT || 5000;

// middlewares
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.vf4gp.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' })
        }
        req.decoded = decoded
        next()
    });
}

async function run() {
    try {

        console.log("db connected")
        const htmlCollection = client.db('ucoders').collection('htmlLessons')
        const cssCollection = client.db('ucoders').collection('cssLessons')
        const javascriptCollection = client.db('ucoders').collection('javascriptLessons')
        const reactCollection = client.db('ucoders').collection('reactLessons')
        const nodeCollection = client.db('ucoders').collection('nodeLessons')
        const domCollection = client.db('ucoders').collection('domLessons')
        const userCollection = client.db('ucoders').collection('users')
        const bookmarkCollection = client.db('ucoders').collection('lessons')

        app.put('/user/:email', async (req, res) => {
            const email = req.params.email
            const user = req.body
            const filter = { email: email }
            const options = { upsert: true };
            const updateDoc = {
                $set: user
            }
            const result = await userCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })

            res.send({ result, token })
        })

        const verifyAdmin = async (req, res, next) => {
            const requester = req.decoded.email
            const requesterAccount = await userCollection.findOne({ email: requester })
            if (requesterAccount.role === 'admin') {
                next()
            }
            else {
                res.status(403).send({ message: 'Forbidden' })
            }
        }

        app.get('/user', verifyJWT, async (req, res) => {
            const users = await userCollection.find().toArray()
            res.send(users)
        })

        app.delete('/user/:id', verifyJWT, verifyAdmin, async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await userCollection.deleteOne(query)
            res.send(result)

        })

        app.put('/user/admin/:email', verifyJWT, verifyAdmin, async (req, res) => {
            const email = req.params.email
            const filter = { email: email }
            const updateDoc = {
                $set: { role: 'admin' }
            }
            const result = await userCollection.updateOne(filter, updateDoc);
            res.send(result)
        })
        app.put('/user/admins/:email', verifyJWT, verifyAdmin, async (req, res) => {
            const email = req.params.email
            const filter = { email: email }
            const updateDoc = {
                $set: { role: '' }
            }
            const result = await userCollection.updateOne(filter, updateDoc);
            res.send(result)
        })

        app.get('/admin/:email', verifyJWT, async (req, res) => {
            const email = req.params.email
            const user = await userCollection.findOne({ email: email })
            const isAdmin = user.role === 'admin'
            console.log(isAdmin)
            res.send({ admin: isAdmin })
        })

        app.put('/user/update/:email', verifyJWT, async (req, res) => {
            const email = req.params.email
            const user = req.body
            const filter = { email: email }
            const options = { upsert: true };
            const updateDoc = {
                $set: user
            }
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.send(result)

        })

        app.get('/user/:email', verifyJWT, async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const user = await userCollection.findOne(query)
            res.send(user)
        })

        app.post('/bookmark', verifyJWT, async (req, res) => {
            const bookmark = req.body
            const query = { email: bookmark.email, lesson: bookmark.lesson }
            const exists = await bookmarkCollection.findOne(query)
            if (exists) {
                return res.send({ success: false, booking: exists })
            }
            const result = await bookmarkCollection.insertOne(bookmark)
            res.send(result)
        })

        app.get('/bookmark/:email', verifyJWT, async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const users = await bookmarkCollection.find(query).toArray()
            res.send(users)
        })

        app.delete('/bookmark/:id', verifyJWT, async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await bookmarkCollection.deleteOne(query)
            res.send(result)

        })

        app.get('/htmlLessons', async (req, res) => {
            const result = await htmlCollection.find().toArray()
            res.send(result)
        })

        app.get('/htmlLessons/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await htmlCollection.findOne(query)
            res.send(result)
        })

        app.delete('/htmlLessons/:id', verifyJWT, verifyAdmin, async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await htmlCollection.deleteOne(query)
            res.send(result)

        })

        app.put('/htmlLessons/:id', verifyJWT, verifyAdmin, async (req, res) => {
            const id = req.params.id
            const filter = { _id: ObjectId(id) }
            const lesson = req.body
            const options = { upsert: true };
            const updateDoc = {
                $set: lesson
            }
            const result = await htmlCollection.updateOne(filter, updateDoc, options);
            res.send(result)

        })

        app.post('/htmlLessons', verifyJWT, verifyAdmin, async (req, res) => {
            const lesson = req.body
            const result = await htmlCollection.insertOne(lesson)
            res.send(result)
        })


        app.get('/cssLessons', async (req, res) => {
            const result = await cssCollection.find().toArray()
            res.send(result)
        })

        app.get('/cssLessons/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await cssCollection.findOne(query)
            res.send(result)
        })

        app.delete('/cssLessons/:id', verifyJWT, verifyAdmin, async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await cssCollection.deleteOne(query)
            res.send(result)

        })

        app.put('/cssLessons/:id', verifyJWT, verifyAdmin, async (req, res) => {
            const id = req.params.id
            const filter = { _id: ObjectId(id) }
            const lesson = req.body
            const options = { upsert: true };
            const updateDoc = {
                $set: lesson
            }
            const result = await cssCollection.updateOne(filter, updateDoc, options);
            res.send(result)

        })

        app.post('/cssLessons', verifyJWT, verifyAdmin, async (req, res) => {
            const lesson = req.body
            const result = await cssCollection.insertOne(lesson)
            res.send(result)
        })


        app.get('/javascriptLessons', async (req, res) => {
            const result = await javascriptCollection.find().toArray()
            res.send(result)
        })

        app.get('/javascriptLessons/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await javascriptCollection.findOne(query)
            res.send(result)
        })

        app.delete('/javascriptLessons/:id', verifyJWT, verifyAdmin, async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await javascriptCollection.deleteOne(query)
            res.send(result)

        })

        app.put('/javascriptLessons/:id', verifyJWT, verifyAdmin, async (req, res) => {
            const id = req.params.id
            const filter = { _id: ObjectId(id) }
            const lesson = req.body
            const options = { upsert: true };
            const updateDoc = {
                $set: lesson
            }
            const result = await javascriptCollection.updateOne(filter, updateDoc, options);
            res.send(result)

        })

        app.post('/javascriptLessons', verifyJWT, verifyAdmin, async (req, res) => {
            const lesson = req.body
            const result = await javascriptCollection.insertOne(lesson)
            res.send(result)
        })


        app.get('/reactLessons', async (req, res) => {
            const result = await reactCollection.find().toArray()
            res.send(result)
        })

        app.get('/reactLessons/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await reactCollection.findOne(query)
            res.send(result)
        })

        app.delete('/reactLessons/:id', verifyJWT, verifyAdmin, async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await reactCollection.deleteOne(query)
            res.send(result)

        })

        app.put('/reactLessons/:id', verifyJWT, verifyAdmin, async (req, res) => {
            const id = req.params.id
            const filter = { _id: ObjectId(id) }
            const lesson = req.body
            const options = { upsert: true };
            const updateDoc = {
                $set: lesson
            }
            const result = await reactCollection.updateOne(filter, updateDoc, options);
            res.send(result)

        })

        app.post('/reactLessons', verifyJWT, verifyAdmin, async (req, res) => {
            const lesson = req.body
            const result = await reactCollection.insertOne(lesson)
            res.send(result)
        })


        app.get('/nodeLessons', async (req, res) => {
            const result = await nodeCollection.find().toArray()
            res.send(result)
        })

        app.get('/nodeLessons/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await nodeCollection.findOne(query)
            res.send(result)
        })

        app.delete('/nodeLessons/:id', verifyJWT, verifyAdmin, async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await nodeCollection.deleteOne(query)
            res.send(result)

        })

        app.put('/nodeLessons/:id', verifyJWT, verifyAdmin, async (req, res) => {
            const id = req.params.id
            const filter = { _id: ObjectId(id) }
            const lesson = req.body
            const options = { upsert: true };
            const updateDoc = {
                $set: lesson
            }
            const result = await nodeCollection.updateOne(filter, updateDoc, options);
            res.send(result)

        })

        app.post('/nodeLessons', verifyJWT, verifyAdmin, async (req, res) => {
            const lesson = req.body
            const result = await nodeCollection.insertOne(lesson)
            res.send(result)
        })


        app.get('/domLessons', async (req, res) => {
            const result = await domCollection.find().toArray()
            res.send(result)
        })

        app.get('/domLessons/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await domCollection.findOne(query)
            res.send(result)
        })

        app.delete('/domLessons/:id', verifyJWT, verifyAdmin, async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await domCollection.deleteOne(query)
            res.send(result)

        })

        app.put('/domLessons/:id', verifyJWT, verifyAdmin, async (req, res) => {
            const id = req.params.id
            const filter = { _id: ObjectId(id) }
            const lesson = req.body
            const options = { upsert: true };
            const updateDoc = {
                $set: lesson
            }
            const result = await domCollection.updateOne(filter, updateDoc, options);
            res.send(result)

        })

        app.post('/domLessons', verifyJWT, verifyAdmin, async (req, res) => {
            const lesson = req.body
            const result = await domCollection.insertOne(lesson)
            res.send(result)
        })


    }

    finally {
    }
}
run().catch(console.dir)


app.get('/', (req, res) => {
    res.send('Hello From Ucoders:)')
})

app.listen(port, () => {
    console.log('Ucoders, Listening to port', port)
})
