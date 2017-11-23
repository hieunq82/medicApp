var request = require('request')
var express = require('express');
var db = require('./db')
var app = express();

app.use('/', (req,res)=>{
    var data = {
        _id: (new Date().toJSON()) + ':' + 1,
        message: 'Hoola',
    }
    db.save('comment', data, (err, doc)=>{
        console.log('insert!');
    })

})


app.listen(8888, ()=>{
    console.log('Server port 8888');
})  