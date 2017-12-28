const express = require('express');
const bodyParser= require('body-parser');
const request = require('request');
const mongoose = require('mongoose');
const uuidV1 = require('uuid/v1');
const sha1 = require('sha1');
const app_port = 80;
const instantMongoCrud = require('express-mongo-crud'); // require the module
const jwt        = require("jsonwebtoken");

var MongoClient = require('mongodb').MongoClient
    , assert = require('assert');


const router = express.Router();



var crud_options = { //specify options
    host: 'medic-svr.hongngochospital.vn:'+app_port
}
const SMSCheck = require('./utils.js');


var mongoDB = 'mongodb://127.0.0.1/drugmon';
mongoose.connect(mongoDB);
var Schema = mongoose.Schema;

var User = new Schema ({
    username : String,
    password : String
});

//Get the default connection
var db = mongoose.connection;

const app = express();
app.use(bodyParser.json());

require('./api')(app,db,SMSCheck,uuidV1); //Import API SMS_GATEWAY

app.use(express.static(__dirname + '/public'));

app.get('/*.html', function(req, res){
    res.sendFile(__dirname + '/public/index.html');
});
//
// app.get('/', function(req, res){
//     console.log('GETTTT');
//   res.redirect('/index.html');
// });

//Login func
app.post('/login', function(req,res){
    db.collection('accounts').findOne({"username": req.body.username}, function(err, user){

        if (err) throw err;
        if (!user) {
            res.json({ status: false, message: 'Authentication failed. User not found.' });
        } else if (user) {
            // check if password matches
            if (user.password != sha1(req.body.password)) {
                res.json({ status: false, message: 'Authentication failed. Wrong password.' });
            } else {

                // if user is found and password is right
                // create a token
                var res_user = {
                    username: user.username,
                    is_admin: user.is_admin,
                    user_hf: user.hf,
                    user_id: user._id
                }
                var token = jwt.sign(res_user, 'drugmonHN@2017', {
                    expiresIn: 1440 // expires in 24 hours
                });

                // return the information including token as JSON
                res.json({
                    status: true,
                    message: 'Login successful, redirecting to the dashboard!',
                    token: token,
                    user_info: res_user
                });
            }

        }

    })
})

app.post('/accounts', function(req, res){
    var data_req = req.body;
    var data_find = {};
    if(data_req.find_type && data_req.find_type == 'check_exist'){
        data_find = {
            "username": data_req.username
        }
    }
    else{
        data_find = {};
    }

    db.collection('accounts').find(data_find).toArray(function (err,users) {
        if(err) throw err;
        if(users){
            res.json({
                status: true,
                results: users,
            })
        }
    })
})

app.post('/add_account', function(req,res){
    var data_req = req.body;
    data_req.createdAt = new Date();
    data_req.updatedAt = new Date();
    data_req.password = sha1(data_req.password);

    db.collection('accounts').findOne({'username': data_req.username}, function(err,user){
        if(err) throw err;
        if(!user){
            db.collection('accounts').insert(data_req).then(function(data_reg) {
                if(data_reg.result.ok == 1){
                    res.json({
                        status: true,
                        message: "Account added!"
                    })
                }else{
                    res.json({
                        status: false,
                        message: "Failed to add!"
                    })
                }
            })
        }else{
            res.json({
                status: false,
                message: "Account existed!"
            })
        }
    })

})

app.post('/send_message', function(req,res){
    console.log(req.body);
});
app.get('/messages', function(req,res){
   res.json({});
})

app.delete('/db_delete/:collection/:object_id', (req,res)=>{

    MongoClient.connect(mongoDB, function(err, db) {
        var collection = db.collection(req.params.collection);
        collection.deleteOne({ "_id" : mongoose.Types.ObjectId(req.params.object_id) }, function(err, result) {
            if(err == null){
                res.json({
                    status: true
                })
            }else{
                res.json({
                    status: false
                })
            }
        });

    })

        var deleteDocument = function(db, callback) {
        var collection = db.collection(req.params.collection);
        collection.deleteOne({ "_id" : req.params.object_id }, function(err, result) {
            if(err == null){
                console.log("Removed the document with the field a equal to 3");
            }

            callback(result);
        });
    }


    //     .toArray(function(error, data) {
    //     console.log(req.params.collection);
    //     if (error == null) {
    //         //res.json(data);
    //         console.log(db.collection.toString())
    //
    //         //data.remove();
    //     }else{
    //        // res.json(error);
    //     }
    // })


})
//Get all drugs of Health Post
app.get('/db_getDrugs/:collection/:object_id', (req,res)=>{

    MongoClient.connect(mongoDB, function(err, db) {
        var collection = db.collection(req.params.collection);
        collection.find({ "hf_id" : mongoose.Types.ObjectId(req.params.object_id) }, function(err, result) {
            if(err == null){
                res.json({
                    status: true
                })
            }else{
                res.json({
                    status: false
                })
            }
        });

    })

        var deleteDocument = function(db, callback) {
        var collection = db.collection(req.params.collection);
        collection.find({ "hf_id" : req.params.object_id }, function(err, result) {
            if(err == null){
                console.log("Find all drugs by HF id !");
            }

            callback(result);
        });
    }
})

// app.use('/', (req,res)=>{

//     res.send(SMSCheck.validSmsSyntax('R312 33'));

//     // db.find({
//     // selector: {doc_type: 'messages'},
//     // fields: ['_id', 'from','doc_type'],
//     // sort: ['sms_received']
//     // }).then(function (result) {
//     // // handle result
//     // res.json(result);
//     // }).catch(function (err) {
//     // console.log(err);
//     // res.json(err);

//     // });
// })

app.use(instantMongoCrud(crud_options)); // use as middleware

app.listen(app_port, () =>{
    console.log('Server started at port: '+app_port);
});
