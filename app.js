const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRouter = require('./routes/auth.route')
const commonRouter = require('./routes/common.route')

// create express app
const app = express();

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.json({ limit: '50mb' }))
    .use(express.urlencoded({ extended: true }));

// Configuring the database
require('dotenv').config()

mongoose.Promise = global.Promise;

// Connecting to the database
mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true
}).then(() => {
    console.log("Successfully connected to the database");
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit();
});

//initialize cors middleware
app.use(cors());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Origin,Content-Type, Content-Length, X-Requested-With");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    //req.con = con
    next();
});

// parse requests of content-type - application/json
app.use(express.json()) //handling the form data
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

const port = 3000;

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/common', commonRouter);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`)
});


