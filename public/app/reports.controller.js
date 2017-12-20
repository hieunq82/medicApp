angular.module('drugmonApp').controller('ReportCtrl', function($scope,$http,toaster,ConfirmBox,ModalControl) {

    $scope.list_register = [];
    $scope.list_drug = [];
    $scope.msg = {};

    $scope.momentjs = moment;

    $http.post('/drugs/list', {}).then(function(rs){
        $scope.list_drug = [];
        $scope.list_drug = rs.data.docs;
    }, function(){
        console.log('Error!');
    })
    $scope.get_messages = function(){
        $http.post('/drugregisters/list', {}).then(function(rs){
            $scope.list_register = rs.data.docs;
        }, function(){
            console.log('Error!');
        })
    }

    $scope.detail_messages = undefined;

    $scope.choose_report = function(report,index){
        $http.get('/drugregisters/'+report._id).then(function(rs){
            var _xdata = {
                "params": {
                    "$eq":{
                        "register_id":report._id
                    }
                }
            }
            console.log('param');
            console.log(report);
            console.log(index);
            $http.post('/messages_out/list', _xdata).then(function(rslist){
                $scope.detail_messages = rs.data.doc;
                $scope.detail_messages.tasks = rslist.data.docs;
                $scope.detail_messages.index = index;
                $scope.detail_messages.raw_msg = report.sms_message.message.split(" ");
                $scope.detail_messages.auto_message = rslist.data.docs.filter(function(rs){ return rs.type == 'sms_default'});
            }, function(){
                $scope.hf_drugs = [];
            })
        })
    }

    $scope.update_drug = function (hf_drug) {
        var _xdata = {
            "params": {
                "$eq":{
                    "hf_detail.person_mobile":hf_drug.from,
                    "drug_code":hf_drug.raw_msg[1].toUpperCase(),
                }
            }
        }
        $http.post('/hfdrugs/list', _xdata).then(function(rs){
            $scope.hf_drug_detail = rs.data.docs[0];
            $scope.hf_name = $scope.hf_drug_detail.hf_detail.name;
            var tmp_hfdrug = {
                data : {
                    drug_abs: parseInt(hf_drug.raw_msg[2]),
                }
            }
            console.log($scope.hf_drug_detail._id);
            $http.put('/hfdrugs/' + $scope.hf_drug_detail._id, tmp_hfdrug).then(function(rs){
                console.log('--Push to hfdrugs--');
                toaster.pop('success', "Success ", "Drug was added to "+$scope.hf_name, 5000);
                ModalControl.closeModal('HFupdate');
            })
        })
    }

     $scope.createNewHFdrug = function (hf_drug) {
            console.log('Detail Messages update');
            console.log(hf_drug);
         var _params = {
             "params": {
                 "$eq":{
                     "hf_detail.person_mobile":hf_drug.from
                 }
             }
         }
         console.log(_params);
         $http.post('/hfdrugs/list', _params).then(function(rs){
             $scope.hf_drug = rs.data.docs;
             console.log('HF Drugs');
             console.log($scope.hf_drug);
             if( $scope.hf_drug.length <0 ){
                 toaster.pop('error', "Error ", "This phone number "+ hf_drug.from + "was not exist!", 5000);
                 ModalControl.closeModal('HFupdate');
             }else {
                 $scope.hf_drug.forEach(function (hfdrugs) {
                     console.log('---HFdrugs---');
                     console.log(hfdrugs);
                     $scope.hf_detail = hfdrugs.hf_detail;
                     $scope.hf_detail.hf_id = hfdrugs.hf_id;
                     $scope.hf_detail.name = hfdrugs.hf_detail.name;
                 })
                 var _drug = {
                     "params": {
                         "$eq":{
                             "drug_code": hf_drug.drug_code.toUpperCase(),
                         }
                     }
                 }
                 $http.post('/drugs/list', _drug).then(function(rs){
                     if (rs.data.responseCode == 0 && rs.data.docs.length > 0){
                         console.log('----Drug Code Exist----')
                         console.log(rs.data.docs);
                         var _data = {
                             "params": {
                                 "$eq":{
                                     "drug_code": hf_drug.drug_code.toUpperCase(),
                                     "hf_id":$scope.hf_detail.hf_id
                                 }
                             }
                         }
                         $http.post('/hfdrugs/list', _data).then(function(rs){
                             if (rs.data.responseCode == 0 && rs.data.docs.length > 0){
                                 $scope.hfdrugs = rs.data.docs[0];
                                 console.log("DRUGS DATA");
                                 console.log($scope.hfdrugs);
                                 var tmp_hfdrug = {
                                     data : {
                                         drug_asl: parseInt(hf_drug.drug_asl),
                                         drug_eop: parseInt(hf_drug.drug_eop),
                                         drug_abs: parseInt(hf_drug.drug_abs),
                                     }
                                 }
                                 console.log(tmp_hfdrug);
                                 $http.put('/hfdrugs/' + $scope.hfdrugs._id, tmp_hfdrug).then(function(rs){
                                     console.log('--Push to hfdrugs--');
                                     toaster.pop('success', "Success ", "The "+$scope.hfdrugs.drug_code + " was added to "+$scope.hfdrugs.hf_detail.name, 5000);
                                     ModalControl.closeModal('HFupdate');
                                 })
                             }else {
                                 var _params = {
                                     "params": {
                                         "$eq":{
                                             "drug_code":hf_drug.drug_code.toUpperCase()
                                         }
                                     }
                                 }
                                 console.log(_params);
                                 $http.post('/drugs/list', _params).then(function(rs){
                                     $scope.drugs = rs.data.docs[0];
                                     console.log('--Drugs--');
                                     console.log($scope.drugs);
                                     var tmp_hfdrug = {
                                         data : {
                                             hf_id: $scope.hf_detail.hf_id,
                                             drug_name: $scope.drugs.drug_name,
                                             drug_code: hf_drug.drug_code.toUpperCase(),
                                             drug_description: $scope.drugs.drug_description,
                                             drug_id: hf_drug._id,
                                             drug_asl: parseInt(hf_drug.drug_asl),
                                             drug_eop: parseInt(hf_drug.drug_eop),
                                             drug_abs: parseInt(hf_drug.drug_abs),
                                             hf_detail: $scope.hf_detail,
                                         }
                                     }
                                     console.log('--Push Data--');
                                     console.log(tmp_hfdrug);
                                     $http.post('/hfdrugs', tmp_hfdrug).then(function(rs){
                                         toaster.pop('success', "Success ", "Drug was update to "+ $scope.hf_detail.name, 5000);
                                         ModalControl.closeModal('HFupdate');
                                     })
                                 })
                             }
                         })
                     }else {
                         console.log('----Drug NOT Code Exist----')
                         toaster.pop('error', "Error ", "The "+hf_drug.drug_code.toUpperCase() + " was not EXISTED in the drugs category!", 5000);
                         ModalControl.closeModal('HFupdate');
                     }
                 })


             }
         })
     }


    $scope.get_messages();

    $scope.sendMsg = function(msg){
        var _xdata = {
            "id": "3E105262-070C-4913-949B-E7ACA4F42B71",
            "to": msg.to,
            "content": msg.content
        }
        $http.post('/send_message', _xdata).then(function(rs){
            if(rs.data.status === true) alert('Sent!')
        })

    }

    var groupArrBy = function(xs, key) {
        return xs.reduce(function(rv, x) {
            (rv[x[key]] = rv[x[key]] || []).push(x);
            return rv;
        }, {});
    };

    $scope.open_newHF = function(detail_messages){
        $('#HFupdate').modal('show');
        $scope.hf_drug = detail_messages;
        $scope.hf_drug.is_edit = false;
    }

    $scope.open_updateHF = function(detail_messages){
        $('#HFupdate').modal('show');
        $scope.hf_drug = detail_messages;
        $scope.hf_drug.drug_code = detail_messages.raw_msg[1];
        $scope.hf_drug.drug_abs = detail_messages.raw_msg[2];
        $scope.hf_drug.is_edit = true;
    }
});