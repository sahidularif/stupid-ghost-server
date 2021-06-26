const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');
require('dotenv').config();
//
// PORT:
const port = 5000;
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static('service'));
app.use(fileUpload());

// MONGODB CONNECTION
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.or4h7.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect((err) => {
    //================================== ALL COLLECTION ======================================
    const ghostStory = client.db('ghost').collection('ghostStory');
    const ghostAdmin = client.db('ghost').collection('admin');


    //============================== ADD GHOST STORY ======================================

    app.post('/addGhostStory', (req, res) => {
        const file = req.files.file;
        const title = req.body.title;
        const description = req.body.description;
        const author = req.body.author;
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64'),
        };

        ghostStory
            .insertOne({ author, title, description, image })
            .then((result) => {
                res.send(result.insertedCount > 0);
            });
    });

// ================ Read Story =============
app.get('/stories', (req, res) => {
    ghostStory.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });


});

// Root:
app.get('/', (req, res) => {
    res.send('Ghost server is running');
});

// Listener port
app.listen(process.env.PORT || port);