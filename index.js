const express = require('express');
const cors = require('cors');
require('dotenv').config()

const app = express()
const port = process.env.PORT || 5000;

// middlewares
app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.vf4gp.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {

        console.log("db connected")
        const htmlCollection = client.db('ucoders').collection('htmlLessons')

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
        app.post('/htmlLessons', async (req, res) => {
            const htmlLessons = req.body
            const result = await htmlCollection.insertOne(htmlLessons)
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
