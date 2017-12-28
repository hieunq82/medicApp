angular.module('drugmonApp').controller('MessagesCtrl', function ($scope, $http, $timeout,toaster,ConfirmBox,ModalControl) {
    $scope.list_mesages = [];
    $scope.msg = {};
    $scope.momentjs = moment;

    $scope.findHFbyFilter = function(filter){
        if(filter == 'hp') filter = 'hf'
        else if(filter == 'hf') filter = 'dt'
        var f_data = {
            "params": {"$eq": {"place_type": filter}}
        }
        return (
            $http.post('/healthfacility/list', f_data)
        )
    }
    $scope.get_hfdetail = function(){
        $http.post('/healthfacility/list', {}).then(function(rs){
            $scope.list_hf = rs.data.docs;
            $scope.list_hf_choose = rs.data.docs;
        }, function(){
            console.log('Error!');
        })
        //Todo: Get drugs
        $http.post('/drugs/list', {}).then(function(rs){
            $scope.list_drug = [];
            $scope.list_drug = rs.data.docs;
        }, function(){
            console.log('Error!');
        })
        //Todo: Get HF Type
        $http.post('/healthfacilities_type/list', {}).then(function(rs){
            $scope.hf_type = rs.data.docs;
        }, function(){
            console.log('Error!');
        })
    }

    //Todo: Preload
    $scope.get_hfdetail();

    $scope.set_active_place = function(type){
        $scope.hf.place_type = type;
        // $scope.hf.reporting_center_list = $scope.findHFbyFilter(type);

        $timeout(function(){
            var promise = $scope.findHFbyFilter(type);

            promise.then( function(result) {
                $scope.hf.reporting_center_list = result.data.docs;
                $scope.hf.hf_selected_list = result.data.docs;
            }).catch ( function(result) {
                $scope.hf.reporting_center_list = []
            });
        },100)

        console.log($scope.hf);
    }
    //Todo: Selected HF detail
    $scope.hf_selected = undefined;
    $scope.choose_hf = function (hf) {
        $scope.hf_selected = hf;
        $scope.get_hfdrugs(hf._id);
    }
    //Todo: Find drug by HF ID
    $scope.get_hfdrugs = function(hf_id){
        var _xdata = {
            "params": {
                "$eq":{
                    "hf_id":hf_id
                }
            }
        }
        $http.post('/hfdrugs/list', _xdata).then(function(rs){
            $scope.hf_drugs = rs.data.docs;
        }, function(){
            $scope.hf_drugs = [];
        })
    }
    $scope.createNewHF = function(hf, hf_type){
        console.log('---HF DATA FIELD---');
        console.log(hf);
        if(hf.reporting_center_list && hf.reporting_center_list.selected){
            hf.reporting_center = [];
            var _report = hf.reporting_center_list.selected;
            _report.forEach(function (report) {
                hf.reporting_center.push ({
                    "_id": report._id,
                    "name": report.name,
                    "person": report.person,
                    "person_mobile": report.person_mobile
                })
            })
            if (hf_type.selected && hf_type.selected.hf_type_name) {
                $scope.hf_type = hf_type.selected.hf_type_name;
            }else {
                $scope.hf_type = '';
            }
            var _xdata = {
                "data": {
                    "updatedAt" : new Date(),
                    "createdAt" :  new Date() ,
                    "place_type" : hf.place_type,
                    "name" : hf.name,
                    "type" : $scope.hf_type,
                    "phone" : hf.phone,
                    "vdc" : hf.vdc,
                    "address" : hf.address,
                    "notes" : hf.notes,
                    "person_mobile" : hf.person_mobile,
                    "person" : hf.person,
                    "reporting_center" :  hf.reporting_center,
                }
            };
            $scope.hf_id = hf.hf_selected_list._id;
            $http.put('/healthfacility/'+  $scope.hf_id , _xdata).then(function(rs){
                if(rs.data.responseCode == 0){
                    toaster.pop('success', "Success ", hf.name+" have successfully registered", 5000);
                    console.log('Update HF Successful');
                    ModalControl.closeModal('HFcreate');
                }
            })

            var _param = {
                "params": {
                    "$eq": {
                        "hf_id":  $scope.hf_id
                    }
                }
            }
            $http.post('/hfdrugs/list', _param).then(function(rs){
                $scope.hf_drugs_detail = rs.data.docs;
                console.log('HF DRUGS DETAIL');
                console.log($scope.hf_drugs_detail);

                var _idParam = {
                    "params": {
                        "$eq": {
                            "_id":  $scope.hf_id
                        }
                    }
                }
                $http.post('/healthfacility/list', _idParam ).then(function(rslist){
                    $scope.hf_detal = rslist.data.docs[0];
                    console.log('$scope.hf_detals');
                    console.log($scope.hf_detal);
                    if(rs.data.responseCode == 0){
                        console.log('Update HF Successful');
                        var tmp_hfdrugs = {
                            "data" : {
                                "hf_detail" : $scope.hf_detal
                            }
                        }
                        console.log(tmp_hfdrugs);
                        if ($scope.hf_drugs_detail.length >0) {
                            $scope.hf_drugs_detail.forEach(function (hf_drug_detail) {
                                console.log(hf_drug_detail)
                                $http.put('/hfdrugs/'+hf_drug_detail._id, tmp_hfdrugs).then(function(rs){
                                    if(rs.data.responseCode == 0){
                                        toaster.pop('success', "Success ", "Drug information of" +hf_drug_detail.hf_detail.name+" have successfully updated!", 5000);
                                        console.log("Drug information of" +hf_drug_detail.hf_detail.name+" have successfully updated!")
                                    }
                                })
                            })
                        }
                    }
                })
            })
        }
    }

    var x_req = {
        "params": {
            "$sort": [
                "-createdAt"
            ]
        }
    }
    $scope.list_mesages.loader = true;
    $scope.get_messages = function () {
        $http.post('/messages/list', x_req).then(function (rs) {
            console.log("All Messages");
            $scope.list_mesages = rs.data.docs;
            // var _tmp_obj = groupArrBy(rs.data.docs, 'from');
            // console.log(_tmp_obj);
            // for (var o in _tmp_obj) {
            //     $scope.list_mesages.push({
            //         from: o,
            //         messages: _tmp_obj[o]
            //     });
            // }
            // console.log("messages group");
            // console.log(_tmp_obj);
            $scope.list_mesages.loader = false;
        }, function () {
            console.log('Error!');
        })
    }


    $scope.detail_messages = $scope.list_mesages[0];
    $scope.set_active_index = function (pindex) {
        $scope.detail_messages = $scope.list_mesages[pindex];
        $scope.detail_messages.index = pindex;
    }

    $scope.detail_contact = [];
    $scope.get_hfdetail = function(){
        $http.post('/healthfacility/list', {}).then(function(rs){
            $scope.detail_contact = rs.data.docs;
            $scope.detail_contact.selected = rs.data.docs;
        }, function(){
            console.log('Error!');
        })
    }

    $scope.get_messages();
    $scope.get_hfdetail();

    $scope.msgPhone= [];
    $scope.sendMsg = function (msg) {
        console.log(msg.to);
        $scope.msgPhone= msg.to;
        $scope.msgPhone.forEach(function (contact){
            console.log('---Phone number---' );
            console.log(contact);
            var _xdata = {
                "data": {
                    "id": generateUUID(),
                    "to": contact.person_mobile,
                    "content": msg.content,
                    "state": "PENDING",
                    "type": "sms_custom",
                    "history": []
                }
            }
            $http.post('/messages_out', _xdata).then(function (rs) {
                if (rs.data.status === true) alert('Sent!')
            })
            console.log('--Send messeges--');
            console.log(_xdata);
        })
    }

    var groupArrBy = function (xs, key) {
        return xs.reduce(function (rv, x) {
            (rv[x[key]] = rv[x[key]] || []).push(x);
            return rv;
        }, {});
    };

    function generateUUID() { // Public Domain/MIT
        var d = new Date().getTime();
        if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
            d += performance.now(); //use high-precision timer if available
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }

    $scope.open_newhf = function(){
        $('#HFcreate').modal('show');
        $scope.hf = {};
        //$scope.hf.place_type = 'dt';
        $scope.set_active_place('dt');
    }
});