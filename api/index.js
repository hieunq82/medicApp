module.exports = function(app,db,SMSCheck,uuidV1){
app.use('/api/app', function(req, res) {
        if(!handleAuth(req, res, datastore.auth)) return;

        var storedReq;

        if(req.method === 'GET' || req.method === 'POST') {
          datastore.requests.unshift(storedReq = {
            useragent: req.headers['user-agent'],
            method: req.method,
            time: new Date().toString(),
          });
        }

        switch(req.method) {
          case 'GET':
            return res.json({ 'medic-gateway': true });
            case 'POST':
            // enforce expected headers
        var _dataDB = req.body.messages;
        var _responseMSG = [];

        console.log('_SMS_GATEWAY_POST_');
        console.log(_dataDB);
        _dataDB.forEach(function(eachDB){
            //update View
            eachDB.type = "sms_in";
            eachDB.content = eachDB.content.replace(/\s+/g, ' ');
            if(SMSCheck.validSmsSyntax(eachDB.content) == true){
                var _smsSyntax = eachDB.content.split(' '),
                    _transCode = uuidV1(),
                    _msgTasks = {},
                    _task_register = [],
                    drugRegID = '';

                //   var   _syntaxCheck = _smsSyntax[0].toUpperCase();
                // if (_syntaxCheck == 'R' ){
                //     //Not found
                //     _msgTasks ={
                //         "id": _transCode,
                //         "to": eachDB.from,
                //         "type": "reject",
                //         "content": "Your SMS Syntax is Wrong ! SMS syntax like be R "+_smsSyntax[1].toUpperCase()
                //     };
                //     _task_register.push(create_task("Your SMS Syntax is Wrong ! SMS syntax like be _R_ DRUG_CODE("+_smsSyntax[1].toUpperCase()+") _QTY_ ("+_smsSyntax[2],eachDB.from,'sms_out', 'PENDING',drugRegID));
                // }else {
                    //register syntax sms
                    var _xdata = {
                        "from" : eachDB.from,
                        "form" : "R",
                        "state": "PENDING",
                        "reported_date" : new Date().toString(),
                        "sms_message" : {
                            "form" : "R",
                            "type" : "sms_message",
                            "gateway_ref" : "e6f0bb62-de84-4d67-b282-1dd670a487ac",
                            "from" : eachDB.from,
                            "message" : eachDB.content
                        },
                        updatedAt: new Date(),
                        createdAt: new Date()
                    }
                // }

                db.collection('drugregisters').insert(_xdata).then(function(data_reg){
                            drugRegID = data_reg.insertedIds[0].toString();

                //find drug registed in DB with person mobile of Health Post
                db.collection('hfdrugs').find({"drug_code": _smsSyntax[1].toUpperCase(),"hf_detail.person_mobile": eachDB.from}).toArray(function(error, data){
                    if(error == null){
                        if(data.length > 0){
                            //_task_register.push(create_task("Register Succeed! DRUG CODE: "+_smsSyntax[1]+", QTY: "+_smsSyntax[2],eachDB.from,'sms_default','PENDING',drugRegID));
                            //Found it
                            var _request_qty = parseInt(_smsSyntax[2]),
                                _druginfo = data[0];

                            //Step 0: Select HF drug
                            db.collection('hfdrugs').update(
                                {"_id": _druginfo._id},
                                {$set: { "drug_abs": _request_qty }},
                                {upsert: false}, function(update_err,update_data){
                    if(update_err){
                        var _hf_stock_mobile_error = _druginfo.hf_detail.person_mobile;
                        //Can't update
                        _task_register.push(create_task("Register Fail ! DRUG CODE: "+_smsSyntax[1].toUpperCase()+", QTY: "+_smsSyntax[2], _hf_stock_mobile_error, 'sms_out', 'PENDING', drugRegID));
                    }else{
                        //Insert Drug was registed to Database
                        var _drug_histories = _druginfo;
                        _drug_histories._id = undefined;
                        _drug_histories.drug_abs_old = _druginfo.drug_abs;
                        _drug_histories.drug_abs = _request_qty;
                        _drug_histories.update_type = "sms_register";
                        _drug_histories.user_update = {
                            username:eachDB.from
                        };
                        _drug_histories.createdAt = new Date();
                        _drug_histories.updatedAt = new Date();

                        db.collection('drug_histories').insert(_drug_histories).then(function(history){
                            if(history.result.ok == 1){
                                //success
                            }
                            console.log(history);
                        })

                       //After update ABS
                        var _hf_stock_mobile = _druginfo.hf_detail.person_mobile;
                        // var _top_stock_mobile = _druginfo.hf_detail.reporting_center.person_mobile;
                       //  sonlt add Checking person_mobile of Health Post with person_mobile registed in Reporting Center
                        db.collection('healthfacilities').find({"person_mobile": _hf_stock_mobile}).toArray(function(error, data){
                            if (error == null) {
                                var _top_stock_mobile = data[0].reporting_center.person_mobile;
                                if (data.length > 0) {
                                    //Check Quanity Drug
                                    //Check ABS =< EOP
                                    if (_request_qty <= parseInt(_druginfo.drug_eop)) {
                                        //General task: Send sms to Reporting Center is " Health Post has low stock of Drug"
                                        _task_register.push(create_task(_druginfo.hf_detail.name + ' has low stock of ' + _druginfo.drug_code, _top_stock_mobile, 'sms_out', 'PENDING', drugRegID));
                                        //General task: Send sms to Health Post is " Register Succeed! DRUG CODE: _DRUG_ _QTY_. Your balance stock is less than EOP (EOP quanity) level."
                                        _task_register.push(create_task('Register Succeed! DRUG CODE: ' + _smsSyntax[1].toUpperCase() + ', QTY: ' + _smsSyntax[2] + '. Your balance stock is less than EOP (' + _druginfo.drug_eop + ') level.', _hf_stock_mobile, 'sms_out', 'PENDING', drugRegID));
                                        //Check ASL > ABS > EOP:
                                    } else if (parseInt(_druginfo.drug_asl) > _request_qty && _request_qty > parseInt(_druginfo.drug_eop)) {
                                        //General task: Send sms to Health Post is "Register Succeed! DRUG CODE: _DRUG_ _QTY_ .Please request drug in quarterly request."
                                        _task_register.push(create_task('Register Succeed! DRUG CODE: ' + _smsSyntax[1].toUpperCase() + ', QTY: ' + _smsSyntax[2] + '. Please request drug in quarterly request.', _hf_stock_mobile, 'sms_out', 'PENDING', drugRegID));
                                        // Check ABS >= ASL
                                    } else if (_request_qty >= parseInt(_druginfo.drug_asl)) {
                                        //General task: Sent sms to Health Post is " Register Succeed! DRUG CODE: _DRUG_ _QTY_ You have sufficient stock."
                                        _task_register.push(create_task('Register Succeed! DRUG CODE: ' + _smsSyntax[1].toUpperCase() + ', QTY: ' + _smsSyntax[2] + '. You have sufficient stock.', _hf_stock_mobile, 'sms_out', 'PENDING', drugRegID));
                                        //check Reporting Center person_mobile
                                        // _task_register.push(create_task('Register DRUG Succeed! DRUG CODE: ' + _smsSyntax[1].toUpperCase() + ', QTY: ' + _smsSyntax[2] + ' RC ' +_top_stock_mobile, _hf_stock_mobile, 'sms_out', 'PENDING', drugRegID));
                                    }
                                } else {
                                    //General task: Sent sms to Health Post if can't find person_mobile of Reposting_Center
                                    _task_register.push(create_task('Register Fail! DRUG CODE: ' + _smsSyntax[1].toUpperCase() + ', QTY: ' + _smsSyntax[2] + '. Your Reporting Center is WRONG or NOT EXIST.', _hf_stock_mobile, 'sms_out', 'PENDING', drugRegID));
                                }
                            }else {
                                //Drug Failed
                                _task_register.push(create_task("Registration Drug Failed ! Please check your SMS syntax and SMS-Gateway connecting internet: "+_smsSyntax[1].toUpperCase()+", QTY: "+_smsSyntax[2], _hf_stock_mobile, 'sms_out', 'PENDING', drugRegID));
                            }
                        });
                        // sonlt add Succeed notification
                        // _task_register.push(create_task("Register DRUG Succeed! DRUG CODE: "+_smsSyntax[1].toUpperCase()+", QTY: "+_smsSyntax[2],eachDB.from,'sms_out','PENDING',drugRegID));
                    }
                                }
                            )
                        }else{
                            //Not found
                            _msgTasks ={
                                "id": _transCode,
                                "to": eachDB.from,
                                "type": "reject",
                                "content": "Drug not found! Please check your DRUG CODE: "+_smsSyntax[1].toUpperCase()
                            };
                            _task_register.push(create_task("Drug not found! Please check your DRUG CODE: "+_smsSyntax[1].toUpperCase()+", QTY: "+_smsSyntax[2],eachDB.from,'sms_out', 'PENDING',drugRegID));
                        }
                        _responseMSG.push(_msgTasks);
                    }else {
                        //Registration Drug Failed
                        _msgTasks ={
                            "id": _transCode,
                            "to": eachDB.from,
                            "type": "reject",
                            "content": "Registration Drug Failed: "+_smsSyntax[1].toUpperCase()
                        };
                        _task_register.push(create_task("Registration Drug Failed "+_smsSyntax[1].toUpperCase()+", QTY: "+_smsSyntax[2],eachDB.from,'sms_out','PENDING',drugRegID));
                    }
                    _responseMSG.push(_msgTasks);
                });

            });
            }else{
                var response_msg = {
                    "id": uuidV1(),
                    "to": eachDB.from,
                    "type": "sms_out",
                    "content": "The registration format is incorrect, ensure the message starts with R followed by space and DrugCode, space and DrugQuantity (Ex: R OXI 33)"
                };
                _responseMSG.push(response_msg); //Push to schedule task

                db.collection('messages').insert(eachDB).then(function(rs){
                    console.log('Inserted to messages collection!');
                });
            }
        })

              //Check status
                var _statusGateway = req.body.updates;
                //Check and update status
                if(_statusGateway){
                    _statusGateway.forEach(function(each_rs){
                        console.log('loop status',each_rs);
                        updateSMSStatus(each_rs)
                    })
                }

                setTimeout(()=>{
                    db.collection('messages_outs').find({"state": "PENDING"}).toArray(function(error, data) {
                        if (error == null) {
                            var _pendingMSG = [];
                            data.forEach(function(each_msg){
                                if(each_msg.state == 'pending' || each_msg.state == 'PENDING'){
                                    _pendingMSG.push({
                                        "id": each_msg.id,
                                        "to": each_msg.to,
                                        "content": each_msg.content
                                    });
                                }
                            })
                            res.json({messages: _pendingMSG});
                        }else{
                            res.json({messages: []});
                        }
                    })
                },500);
        }
});

resetDatastore();


function resetDatastore() {
  datastore = {
    requests: [],
    webapp_terminating: [],
    webapp_originating: {
      waiting: [],
      passed_to_gateway: [],
    },
    status_updates: [],
    errors: [],
  };
}
//
function updateSMSStatus(result){
    db.collection("messages_outs").update(
        {"id": result.id},
        {$push: {"history": {"state": result.status, "reason": result.reason, "timestamp": new Date()}}}
    )
    db.collection("messages_outs").update(
        {"id": result.id},
        {$set: {"state": result.status}}
    )

}

function checkInResults(arr,id){
    return arr.filter(function(echeck){ return echeck.id == id});
}
function create_task(content,send_to,type,state,register_id){
    var sms_out = {
        "id": uuidV1(),
        "to": send_to,
        "register_id": register_id,
        "type": type,
        "state": state,
        "content": content,
        "history": []
    }

    db.collection('messages_outs').insert(sms_out).then(function(err, data){
        if(err == null) return true;
    });
}

function handleAuth(req, res, options) {
  var error, header;

  if(!options) return true;

  try {
    header = req.headers.authorization;
    header = header.split(' ').pop();
    header = new Buffer(header, 'base64').toString().split(':');

    if(header[0] === options.username &&
        header[1] === options.password) {
      return true;
    }
    error = 'username or password did not match';
  } catch(e) {
    error = e;
  }
  console.log('Auth failed:', error);
  console.log('headers:', req.headers);
  res.writeHead(401);
  res.end(JSON.stringify({ err:'Unauthorized' }, null, 2));
  return false;
}


}