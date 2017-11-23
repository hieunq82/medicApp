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

//Todo: Selected HF detail
$scope.hf_selected = undefined;
$scope.choose_hf = function (hf) {
    $scope.hf_selected = hf;
    $scope.get_hfdrugs(hf._id);
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

$scope.createNewHF = function(hf){
        if(hf.reporting_center_list && hf.reporting_center_list.selected){
            hf.reporting_center = {
                "_id": hf.reporting_center_list.selected._id,
                "name": hf.reporting_center_list.selected.name,
                "person": hf.reporting_center_list.selected.person,
                "person_mobile": hf.reporting_center_list.selected.person_mobile
            }
            // hf.reporting_center_list = undefined;
        }
    hf.is_edit = undefined;

    var _xdata = {
        "data": hf
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
            toaster.pop('error', "Error ", "Drug is existed on this HF, please choose another one!", 5000);
        }else{
            var tmp_hfdrug = {
                data : {
                    hf_name: $scope.hf_selected.hf_name,
                    hf_id: $scope.hf_selected._id,
                    drug_name: drug.drug_push.selected.drug_name,
                    drug_code: drug.drug_push.selected.drug_code,
                    drug_description: drug.drug_push.selected.drug_description,
                    drug_id: drug.drug_push.selected._id,
                    drug_asl: parseInt(drug.drug_asl),
                    drug_eop: parseInt(drug.drug_eop),
                    drug_abs: parseInt(drug.drug_abs),
                    hf_detail: $scope.hf_selected
                }
            }
            $http.post('/hfdrugs', tmp_hfdrug).then(function(rs){
                $scope.newdrug = {};
                $scope.hf_drugs.push(tmp_hfdrug.data);
                toaster.pop('success', "Success ", "Drug was added to "+$scope.hf_selected.name, 5000);
            })
        }
    })


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

$scope.edit_hf = function (hf_selected) {
    if(hf_selected.reporting_center_list && hf_selected.reporting_center_list.selected){
        hf_selected.reporting_center = {
            "_id": hf_selected.reporting_center_list.selected._id,
            "name": hf_selected.reporting_center_list.selected.name,
            "person": hf_selected.reporting_center_list.selected.person,
            "person_mobile": hf_selected.reporting_center_list.selected.person_mobile
        }
        // hf_selected.reporting_center_list = undefined;
    }
    hf_selected.is_edit = undefined;
    var _xdata = {
        "data": hf_selected
    };
    $http.put('/healthfacility/'+hf_selected._id, _xdata).then(function(rs){
        if(rs.data.responseCode == 0){
            toaster.pop('success', "Success ", hf_selected.name+" have successfully updated!", 5000);
            $scope.get_hfdetail();
            ModalControl.closeModal('HFcreate');
        }
    })

}

$scope.delete_hf = function (hf_selected) {
    ConfirmBox.confirm('Are you sure?', 'The '+hf_selected.name+' will be permanently removed! This action also delete all associated drugs!!!').then(function() {
        $http.delete('/db_delete/healthfacilities/' + hf_selected._id).then(function (rs) {
            if (rs.data.status == true) {
                $scope.get_hfdetail();
                $scope.choose_hf($scope.list_hf[0]);
                $http.delete('/db_deleteAll/hfdrugs/' + hf_selected._id).then(function (rs) {
                    if (rs.data.status == true) {
                        $scope.get_hfdrugs(drug.hf_id);
                    }
                })
                toaster.pop('success', "Success ", hf_selected.name+" has been removed!", 5000);
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