const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');
// const fs = require('fs-extra');

const MongoClient = require('mongodb').MongoClient;
// const ObjectId = require('mongodb').ObjectId;

const cors = require('cors');
require('dotenv').config();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static('doctorsFile'));
app.use(fileUpload());

app.get('/', (req, res) => {
    res.send('Hello World !')
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ghclx.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    console.log('error', err);
    const appoinmentsCollection = client.db("doctor").collection("appoinments");
    const doctorCollection = client.db("doctor").collection("newDoctor");

    app.post('/addAppoinments', (req, res) => {
        const appoinmentDetails = req.body;
        console.log(appoinmentDetails);
        appoinmentsCollection.insertOne(appoinmentDetails)
            .then(result => {
                console.log(result.insertedCount);
                res.send(result.insertedCount > 0)
            })
    })

    
    app.get('/appointments', (req, res) => {
        appoinmentsCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })
    

    app.post('/appointmentsByDate', (req, res) => {
        const date = req.body;
        console.log(date.date)
        const email = req.body.email;
        doctorCollection.find({ email: email })
            .toArray((err, doctorsList) => {
                const filter = { date: date.date }
                if (doctorsList.length === 0) {
                    filter.email = email;
                }
                appoinmentsCollection.find(filter)
                    .toArray((err, documents) => {
                        res.send(documents);
                    })
            })

    })

    //
    // app.post('/addADoctor', (req, res) => {
    //     const file = req.files.file;
    //     const name = req.body.name;
    //     const email = req.body.email;
    //     const phone = req.body.phone;
    //     console.log(name, email, phone, file);
    //     file.mv(`${__dirname}/doctorsFile/${file.name}`, err => {
    //         if (err) {
    //             console.log(err);
    //             return res.status(500).send({ msg: 'file cannot uploaded' })
    //         }
    //         return res.send({ name: file.name, path: `/${file.name}` })
    //     })
    //     doctorCollection.insertOne({ name, email, phone, img: file.name })
    //         .then(result => {
    //             res.send(result.insertedCount > 0);
    //         })
    // })
    //

    app.post('/addADoctor', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const email = req.body.email;
        const phone = req.body.phone;
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        doctorCollection.insertOne({ name, email, phone, image })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    app.get('/doctorsFile', (req, res) => {
        doctorCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });



    app.post('/isDoctor', (req, res) => {
        const email = req.body.email;
        doctorCollection.find({ email: email })
            .toArray((err, doctorsList) => {
                res.send(doctorsList.length > 0);
            })
    })



})



app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})