angular.module('drugmonApp').controller('HFCtrl', function($rootScope,$scope,$http,toaster,ConfirmBox,ModalControl,$timeout ) {

  $scope.list_hf = [];
  $scope.msg = {};
  $scope.list_drug = [];
  $scope.hf_drugs = [];
  $scope.newdrug = {};
  $scope.drug_histories = {};


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
  }, function(){
      console.log('Error!');
  })
    // //Todo: Get drugs
    $http.post('/drugs/list', {}).then(function(rs){
        $scope.list_drug = [];
        $scope.list_drug = rs.data.docs;
    }, function(){
        console.log('Error!');
    })

}

     //Todo: Get HF Type
    $http.post('/healthfacilities_type/list', {}).then(function(rs){
        $scope.hf_type = rs.data.docs;
    }, function(){
        console.log('Error!');
    })
//Todo: Preload
$scope.get_hfdetail();

    $scope.get_drug_history = function(drug_id,hf_id){
        var x_req = {
            "params": {"$eq": {
                drug_id: drug_id,
                hf_id: hf_id
            },
                "$sort": [
                    "-createdAt"
                ],}
        }
        $http.post('/drug_histories/list', x_req).then(function(rs){
            if(rs.data.responseCode == 0){
                //okay
                if(rs.data.docs.length>0){
                    $scope.drug_histories[drug_id] = [];
                    $scope.drug_histories[drug_id] = rs.data.docs;
                }else{
                    toaster.pop('info', "Infomation! ", "No data return!", 5000);

                }
            }
        })
    }

    $scope.test = function (rp) {
        $scope.testRP = rp;
        console.log(rp)
    }

    //Todo: Selected HF detail
    $scope.hf_selected = undefined;
    $scope.choose_hf = function (hf) {
    console.log('HF');
    console.log(hf);
    $scope.hf_selected = hf;
    console.log('HF SELECT');
    console.log($scope.hf_selected);
    $scope.get_hfdrugs(hf._id);
    };
    $scope.selected_hf = function (hf_select) {
        console.log('hf_select');
        console.log(hf_select);
        var _xdata = {
            "params": {
                "$eq":{
                    "_id":hf_select
                }
            }
        };
        $http.post('/healthfacility/list', _xdata).then(function(rs){
            $scope.hf_selected = rs.data.docs[0];
            console.log('HF SELECT');
            console.log($scope.hf_selected);
            $scope.get_hfdrugs($scope.hf_selected._id);
        })
    }


    $scope.set_active_place = function(type){
        $scope.hf.place_type = type;
        // $scope.hf.reporting_center_list = $scope.findHFbyFilter(type);

        $timeout(function(){
            var promise = $scope.findHFbyFilter(type);

            promise.then( function(result) {
                $scope.hf.reporting_center_list = result.data.docs;
            }).catch ( function(result) {
                $scope.hf.reporting_center_list = []
            });
        },100)



        console.log($scope.hf);
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
        }
    hf.is_edit = undefined;

    var _xdata = {
        "data": {
            "updatedAt" : new Date(),
            "createdAt" :  new Date() ,
            "place_type" : hf.place_type,
            "name" : hf.name,
            "type" : hf_type.selected.hf_type_name,
            "phone" : hf.phone,
            "vdc" : hf.vdc,
            "address" : hf.address,
            "notes" : hf.notes,
            "person_mobile" : hf.person_mobile,
            "person" : hf.person,
            "reporting_center" :  hf.reporting_center,
        }
    };
    $http.post('/healthfacility', _xdata).then(function(rs){
        if(rs.data.responseCode == 0){
            toaster.pop('success', "Success ", hf.name+" have successfully registered", 5000);
            $scope.get_hfdetail();
            ModalControl.closeModal('HFcreate');
        }
    })
}

$scope.add_hfdrug = function(drug){
    var _params = {
        "params": {
            "$eq": {
                "drug_code": (drug.drug_push && drug.drug_push.selected ? drug.drug_push.selected.drug_code : ''),
                "hf_id": $scope.hf_selected._id
            }
        }
    }

    $http.post('/hfdrugs/list',_params).then(function(rs){
        if(rs.data.responseCode == 0 && rs.data.docs.length > 0){
            toaster.pop('error', "Error ", "Drug was existed on this HF, please choose another one!", 5000);
        }else{
            var tmp_hfdrug = {
                "data" : {
                    "hf_name": $scope.hf_selected.name,
                    "hf_id": $scope.hf_selected._id,
                    "drug_name": drug.drug_push.selected.drug_name,
                    "drug_code": drug.drug_push.selected.drug_code,
                    "drug_description": drug.drug_push.selected.drug_description,
                    "drug_id": drug.drug_push.selected._id,
                    "drug_asl": parseInt(drug.drug_asl),
                    "drug_eop": parseInt(drug.drug_eop),
                    "drug_abs": parseInt(drug.drug_abs),
                    "hf_detail": {
                        "address":  $scope.hf_selected.address,
                        "name": $scope.hf_selected.name,
                        "notes": $scope.hf_selected.notes,
                        "person": $scope.hf_selected.person,
                        "person_mobile": $scope.hf_selected.person_mobile,
                        "phone": $scope.hf_selected.phone,
                        "type": $scope.hf_selected.type,
                        "vdc": $scope.hf_selected.vdc,
                        "reporting_center": $scope.hf_selected.reporting_center,
                    }
                }
            }
            console.log('tmp_hfdrug');
            console.log(tmp_hfdrug);
            $http.post('/hfdrugs', tmp_hfdrug).then(function(rs){
                $scope.newdrug = {};
                $scope.hf_drugs.push(tmp_hfdrug.data);
                toaster.pop('success', "Success ", "Drug was added to "+$scope.hf_selected.name, 5000);
            })
        }
    })
}
$scope.edit_drug = function (drug) {
    var _params = {
        "params": {
            "$eq": {
                "drug_code": (drug.drug_push && drug.drug_push.selected ? drug.drug_push.selected.drug_code : ''),
                "hf_id": $scope.hf_selected._id
            }
        }
    }
    var _hf_id = {
        "params": {
            "$eq": {
                "hf_id": $scope.hf_selected._id
            }
        }
    }
    if ((drug.drug_push && drug.drug_push.selected ? drug.drug_push.selected.drug_code : '') == '') {
        toaster.pop('error', "Error ", "You do not choose drug ! Please choose drug !", 5000);
    }else {
        $http.post('/hfdrugs/list',_hf_id).then(function(rs){
            $scope.hf_drugsdetail = rs.data.docs;
            $scope.hf_drugsdetail.forEach(function (hf_detail) {
                if (hf_detail.drug_code == drug.drug_push.selected.drug_code ){
                    ConfirmBox.confirm('WARNING !', 'Drug is existed on this HF ! Do you want to update '+drug.drug_push.selected.drug_code+' ?').then(function(){
                        $http.post('/hfdrugs/list',_params).then(function(rs){
                            console.log('Drug Update');
                            console.log(rs.data.docs[0]);
                            $scope.drug_update_info = rs.data.docs[0];
                            if(rs.data.responseCode == 0 && rs.data.docs.length > 0){
                                $scope.hf_drugs_detail = rs.data.docs[0];
                                $scope.hf_drugs_id = $scope.hf_drugs_detail._id;
                                var tmp_hfdrug = {
                                    data : {
                                        drug_asl: parseInt(drug.drug_asl),
                                        drug_eop: parseInt(drug.drug_eop),
                                        drug_abs: parseInt(drug.drug_abs),
                                    }
                                }
                                //Todo: update to hfdrugs table
                                $http.put('/hfdrugs/' + $scope.hf_drugs_id, tmp_hfdrug).then(function(rs){
                                    if(rs.data.responseCode == 0){
                                        $scope.newdrug = {};
                                        $scope.hf_drugs.push(tmp_hfdrug.data);
                                        $scope.get_hfdrugs($scope.hf_selected._id);
                                        toaster.pop('success', "Success ", "Drug was updated to "+$scope.hf_selected.name, 5000);
                                    }

                                    var _drug_histories = {
                                        "data" : {
                                            "updatedAt" : new Date(),
                                            "createdAt" : new Date(),
                                            "hf_name" : $scope.drug_update_info.hf_name,
                                            "hf_id" : $scope.drug_update_info.hf_id,
                                            "drug_name" : $scope.drug_update_info.drug_name,
                                            "drug_code" : $scope.drug_update_info.drug_code,
                                            "drug_description" :  $scope.drug_update_info.drug_description,
                                            "drug_id" : $scope.drug_update_info.drug_id,
                                            "drug_asl" : parseInt(drug.drug_asl),
                                            "drug_eop" : parseInt(drug.drug_eop),
                                            "drug_abs" : parseInt(drug.drug_abs),
                                            "hf_detail" : $scope.drug_update_info.hf_detail,
                                            "__v" : 0,
                                            "drug_abs_old" : parseInt($scope.drug_update_info.drug_abs),
                                            "update_type" : "web_update",
                                            "user_update" : {
                                                "username" : "admin"
                                            }
                                        }
                                    }
                                    console.log('Drug History');
                                    console.log(_drug_histories);
                                    //Todo: update to drug_histories table
                                    $http.post('/drug_histories', _drug_histories).then(function(rs){
                                        if(rs.data.responseCode == 0){
                                            //success
                                            console.log('Success');
                                        }
                                    })
                                })
                            }
                        })
                    })
                }else {
                    toaster.pop('error', "Error ", "Drug is not exist!", 5000);
                }
            })
        })

    }

}

$scope.remove_drug = function (drug) {
    ConfirmBox.confirm('Are you sure?', 'The drug '+drug.drug_name+' will be removed from '+drug.hf_detail.name).then(function() {
        $http.delete('/db_delete/hfdrugs/' + drug._id).then(function (rs) {
            if (rs.data.status == true) {
                $scope.get_hfdrugs(drug.hf_id);
                toaster.pop('success', "Success ", "Drug "+drug.drug_name+" has been removed!", 5000);
            }
        })
    })
}

$scope.edit_hf = function (hf_selected, hf_type) {
    if(hf_selected.reporting_center_list && hf_selected.reporting_center_list.selected){
        $scope.reporting_center = hf_selected.reporting_center_list.selected;
    }
    hf_selected.is_edit = undefined;
    if (hf_type.selected == undefined ){
        $scope.type = hf_selected.type;
    }else {
        $scope.type =  hf_type.selected.hf_type_name;
    }
    var _xdata = {
        "data": {
            "updatedAt" : new Date(),
            "createdAt" :  hf_selected.createdAt ,
            "place_type" : hf_selected.place_type,
            "name" : hf_selected.name,
            "type" :  $scope.type,
            "phone" : hf_selected.phone,
            "vdc" : hf_selected.vdc,
            "address" : hf_selected.address,
            "notes" : hf_selected.notes,
            "person_mobile" : hf_selected.person_mobile,
            "person" : hf_selected.person,
            "reporting_center" : $scope.reporting_center,
        }
    };
    $http.put('/healthfacility/'+hf_selected._id, _xdata).then(function(rs){
        if(rs.data.responseCode == 0){
            toaster.pop('success', "Success ", hf_selected.name+" have successfully updated!", 5000);
            $scope.get_hfdetail();
            ModalControl.closeModal('HFcreate');
        }
    })
    console.log('HF SELECTED DETAIL');
    console.log(hf_selected);
    //After updating Reporting Center then update RC info to Health Post
    $http.post('/healthfacility/list', {}).then(function(rs){
          $scope.hf_detail_list = rs.data.docs;
          $scope.hf_detail_list.forEach(function (hf_detail){
                if (hf_detail.reporting_center) {
                    hf_detail.reporting_center.forEach(function (hf, index) {
                        if(hf._id == hf_selected._id){
                            $scope.reporting_center = hf_detail.reporting_center;
                            $scope.reporting_center[index] = hf;
                            $scope.reporting_center[index].name = hf_selected.name;
                            $scope.reporting_center[index].person = hf_selected.person;
                            $scope.reporting_center[index].person_mobile = hf_selected.person_mobile;
                            var _data = {
                                "data": {
                                    "reporting_center": $scope.reporting_center
                                }
                            }
                            $http.put('/healthfacility/'+hf_detail._id, _data).then(function(rs){
                                if(rs.data.responseCode == 0){
                                    console.log('Updated HF successful!');
                                }
                            })

                            console.log('reporting_center');
                            console.log($scope.reporting_center);
                            var _param = {
                                "params": {
                                    "$eq": {
                                        "hf_id": hf_detail._id
                                    }
                                }
                            }
                            $http.post('/hfdrugs/list', _param).then(function(rs){
                                $scope.hf_drugs_detail = rs.data.docs;
                                var tmp_hfdrugs = {
                                    "data" : {
                                        "hf_detail" :{
                                            "name" : hf_selected.name,
                                            "type" : hf_selected.type,
                                            "phone" : hf_selected.phone,
                                            "vdc" : hf_selected.vdc,
                                            "address" : hf_selected.address,
                                            "notes" : hf_selected.notes,
                                            "person_mobile" : hf_selected.person_mobile,
                                            "person" : hf_selected.person,
                                            "reporting_center": $scope.reporting_center
                                        }
                                    }
                                }
                                if ($scope.hf_drugs_detail.length >0) {
                                    $scope.hf_drugs_detail.forEach(function (hf_drug_detail) {
                                        console.log(hf_drug_detail)
                                        $http.put('/hfdrugs/'+hf_drug_detail._id, tmp_hfdrugs).then(function(rs){
                                            if(rs.data.responseCode == 0){
                                                // toaster.pop('success', "Success ", "Drug information of" +hf_drug_detail.hf_detail.name+" have successfully updated!", 5000);
                                                console.log('Drug information have successfully updated!');
                                            }
                                        })
                                    })
                                }
                            })
                        }
                    })
                }
          })
    })
    var _param = {
        "params": {
            "$eq": {
                "hf_id": hf_selected._id
            }
        }
    }
    $http.post('/hfdrugs/list', _param).then(function(rs){
        $scope.hf_drugs_detail = rs.data.docs;
        var tmp_hfdrugs = {
            "data" : {
                "hf_detail" :{
                    "name" : hf_selected.name,
                    "type" : hf_selected.type,
                    "phone" : hf_selected.phone,
                    "vdc" : hf_selected.vdc,
                    "address" : hf_selected.address,
                    "notes" : hf_selected.notes,
                    "person_mobile" : hf_selected.person_mobile,
                    "person" : hf_selected.person,
                    "reporting_center": $scope.reporting_center
                }
            }
        }
        if ($scope.hf_drugs_detail.length >0) {
            $scope.hf_drugs_detail.forEach(function (hf_drug_detail) {
                console.log(hf_drug_detail)
                $http.put('/hfdrugs/'+hf_drug_detail._id, tmp_hfdrugs).then(function(rs){
                    if(rs.data.responseCode == 0){
                        // toaster.pop('success', "Success ", "Drug information of" +hf_drug_detail.hf_detail.name+" have successfully updated!", 5000);
                        console.log('Drug information have successfully updated!');
                    }
                })
            })
        }
    })

}

$scope.delete_hf = function (hf_selected) {
    ConfirmBox.confirm('WARNING !', 'Are you sure? All drugs in '+hf_selected.name+' will be permanently removed!').then(function() {
        var _xdata = {
            "params": {
                "$eq":{
                    "hf_id":hf_selected._id
                }
            }
        }
        console.log('--Params--');
        console.log(_xdata);
        $http.delete('/db_delete/healthfacilities/' + hf_selected._id).then(function (rs) {
            if (rs.data.status == true) {
                $http.post('/hfdrugs/list', _xdata).then(function (rs) {
                    console.log('---HF detail---');
                    $scope.hf_detal = rs.data.docs;
                    console.log($scope.hf_detal);
                    if (rs.data.docs.length > 0) {
                        $scope.hf_detal.forEach(function (drugs) {
                            console.log('--- DRUGS----');
                            console.log(drugs);
                            $http.delete('/db_delete/hfdrugs/' + drugs._id).then(function (rs) {
                                $scope.get_hfdrugs(drugs.hf_id);
                                console.log('All drug in HF have successfully deleted');
                            })
                        })
                        $scope.get_hfdetail();
                        $scope.choose_hf($scope.list_hf[0]);
                        toaster.pop('success', "Success ", hf_selected.name+" has been removed!", 5000);
                    } else {
                        console.log('NO DRUG IN HF');
                        $scope.get_hfdetail();
                        $scope.choose_hf($scope.list_hf[0]);
                        toaster.pop('success', "Success ", hf_selected.name+" has been removed!", 5000);
                    }
                })
            }
        })
    })
}

    $scope.open_newhf = function(){
        $('#HFcreate').modal('show');
        $scope.hf = {};
        $scope.hf.is_edit = false;
        //$scope.hf.place_type = 'dt';
        $scope.set_active_place('dt');
    }


    $scope.open_edithf = function(hf_selected){
        $('#HFcreate').modal('show');
        $scope.hf = hf_selected;
        $scope.hf.is_edit = true;
    }


});