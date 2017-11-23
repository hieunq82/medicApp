const express = require('express');
const bodyParser= require('body-parser');
const request = require('request');
const mongoose = require('mongoose');
const uuidV1 = require('uuid/v1');
const sha1 = require('sha1');
const app_port = 80;

const app = express();
app.use(bodyParser.json());

app.use('/', (req,res)=>{
res.json({"status":false,"msg":"some thing went wrong..."});
})

app.listen(app_port, () =>{
    console.log('Server started at port: '+app_port);
});