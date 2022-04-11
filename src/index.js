const express = require('express')
const bodyParser = require('body-parser');
const app = express()
const mongoose = require('mongoose')
const router = require('./router/router')
const aws = require("aws-sdk")
const multer = require('multer')


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.use(multer().any())


mongoose.connect('mongodb+srv://arnabbiswas_14:arnabbiswas@cluster0.b95gv.mongodb.net/group-11-Database?retryWrites=true&w=majority',{useNewUrlParser:true})
.then( () =>console.log("mongoose is contected..."))
.catch( err => console.log(err))

app.use('/', router)


app.listen(process.env.PORT || 3000, function() {
    console.log(" Express App Running on port " +  (process.env.PORT || 3000));
});