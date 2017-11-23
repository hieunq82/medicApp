angular.module('drugmonApp').controller('DrugsCtrl', function($scope,$http,toaster,ModalControl,ConfirmBox) {
  $scope.list_drug = [];
  $scope.msg = {};
  $scope.drug = {
      status: 1
  };
  $scope.list_drug_categories = [];
  $scope.newdrug = {};
  $scope.drug_category_name = '';

$scope.get_drugdetail = function(){
    //Todo: Get category
  $http.post('/drugcat/list', {}).then(function(rs){
      $scope.list_drug_categories = [];
      $scope.list_drug_categories = rs.data.docs;
  }, function(){
      console.log('Error!');
  });

  //Todo: Get drugs
  $http.post('/drugs/list', {}).then(function(rs){
      $scope.list_drug = [];
      $scope.list_drug = rs.data.docs;
  }, function(){
      console.log('Error!');
  })
}

$scope.add_drugcat = function(drug_category_name){
    $http.post('/drugcat', {
        data: {
            cat_name: drug_category_name
        }
    }).then(function(rs){
        $scope.get_drugdetail();//Success or not!!!
        $scope.drug_category_name = '';
        toaster.pop('success', "Success ", "Drug cat have successfully registered", 5000);

    })
}

$scope.get_drugdetail();


    $scope.hf_selected = undefined;
    $scope.choose_hf = function (hf) {
        $scope.hf_selected = hf;
    }

$scope.createNewHF = function(hf){
    var _xdata = {
        "data": hf
    };
    $http.post('/healthfacility', _xdata).then(function(rs){
        $scope.get_hfdetail();
    })
}


$scope.createNewDrug = function(drug){
    var _params = {
        "params": {
            "$eq": {
                "drug_code": (drug && drug.drug_code ? drug.drug_code.toUpperCase() : '')
            }
        }
    }
    $http.post('/drugs/list',_params).then(function(rs) {
        if (rs.data.responseCode == 0 && rs.data.docs.length == 0) {
            var tmp_drug = {
                "drug_name": drug.drug_name,
                "drug_code": drug.drug_code.toUpperCase(),
                "drug_category_id": (drug.drug_category && drug.drug_category.selected && drug.drug_category.selected._id ? drug.drug_category.selected._id : ''),
                "drug_category_name": (drug.drug_category && drug.drug_category.selected && drug.drug_category.selected.cat_name ? drug.drug_category.selected.cat_name : ''),
                "drug_description": drug.drug_description,
                "drug_status": drug.drug_status
            }
            var _xdata = {
                "data": tmp_drug
            }
            $http.post('/drugs', _xdata).then(function(rs){
                $scope.get_drugdetail();
                ModalControl.closeModal('createDrug');
                toaster.pop('success', "Success ", "Drug have successfully registered", 5000);

            })
        }else{
            toaster.pop('error', "Error: CODE_EXISTED", "Drug CODE: "+drug.drug_code.toUpperCase()+" is registered, please choose another one!", 5000);

        }
    })

}
$scope.deleteDrugCat = function (drug) {
    ConfirmBox.confirm('Are you sure?', 'The dug cat '+drug.name+' will be deleted?').then(function(){
        var del_data = {
            data: {"hardDelete": true}
        }
        $http.delete('/db_delete/drugcats/'+drug._id, del_data).then(function(rs){
            if(rs.data.status == true){
                $scope.get_drugdetail();
                toaster.pop('success', "Success ", "Drug cat have successfully deleted", 5000);

            }else{
                toaster.pop('error', "Error", "Can not remove this drug cat, please try again!", 5000);
            }
        })
    })

}
$scope.deleteDrug = function(drug){
    ConfirmBox.confirm('Are you sure?', 'The dug '+drug.drug_name+' (code: '+drug.drug_code+') will be deleted?').then(function(){
        var del_data = {
            data: {"hardDelete": true}
        }
        $http.delete('/db_delete/drugs/'+drug._id, del_data).then(function(rs){
            if(rs.data.status == true){
                $scope.get_drugdetail();
                toaster.pop('success', "Success ", "Drug have successfully deleted", 5000);

            }else{
                toaster.pop('error', "Error", "Can not remove this drug, please try again!", 5000);

            }
        })
    })
}


    $scope.open_newdrug = function(){
        $('#createDrug').modal('show');
        $scope.tmp_drug = { drug_status : 1};
        $scope.tmp_drug.is_edit = false;
    }
    
    
    $scope.open_edit = function(drug){
        $('#createDrug').modal('show');
        $scope.tmp_drug = drug;
        $scope.tmp_drug.drug_category = {
            selected : {
            "_id": drug.drug_category_id,
            "cat_name": drug.drug_category_name
            }
        };
        $scope.tmp_drug.is_edit = true;
    }

    $scope.save_drug_edit =function (new_drug) {
        var _xdata = {
            "data": {
                "drug_name": new_drug.drug_name,
                "drug_category_id": (new_drug.drug_category && new_drug.drug_category.selected && new_drug.drug_category.selected._id ? new_drug.drug_category.selected._id : ''),
                "drug_category_name": (new_drug.drug_category && new_drug.drug_category.selected && new_drug.drug_category.selected.cat_name ? new_drug.drug_category.selected.cat_name : ''),
                "drug_description": new_drug.drug_description,
                "drug_status": new_drug.drug_status
            }
        }
        $http.put('/drugs/'+new_drug._id,_xdata).then(function(rs){
            if(rs.data.responseCode == 0){
                toaster.pop('success', "Success ", "Drug have successfully updated!", 5000);
                $scope.get_drugdetail();
                ModalControl.closeModal('createDrug');
            }
        })
    }


$scope.find_drug = function(drug_code){
    if(drug_code){

        var _params = {
            "params": {
                "$eq": {
                    "drug_code": drug_code.toUpperCase()
                }
            }
        }
        $http.post('/drugs/list',_params).then(function(rs){
            if(rs.data.responseCode == 0 && rs.data.docs.length > 0){
                toaster.pop('error', "Error: CODE_EXISTED ", "Drug CODE: "+drug_code.toUpperCase()+" is registered, please choose another one!", 5000);
            }else{
                toaster.clear();
            }
        })
    }
}
function checkDrugIsExisted(drug_code){
    var _params = {
        "params": {
            "$eq": {
                "drug_code": drug_code
            }
        }
    }
    $http.post('/drugs/list',_params).then(function(rs){
        if(rs.data.responseCode == 0 && rs.data.docs.length > 0){
            console.log('TRUE');
            return true;
        }else{
            console.log('false');
            return false;
        }
    })

    console.log(_is_exist);
}

});