angular.module('drugmonApp').controller('HFTypeCtrl', function($scope,$http,toaster,ModalControl,ConfirmBox) {
    console.log("HFTYPE Controller")
    $scope.list_hf_type = [];
    $scope.msg = {};
    $scope.hfType = {
        status: 1
    };
    $scope.list_hf_categories = [];
    $scope.newHFType = {};
    $scope.hf_category_name = '';

    $scope.get_HFTypedetail = function(){
        //Todo: Get category
        $http.post('/healthfacilities_type/list', {}).then(function(rs){
            $scope.list_hf_categories = [];
            $scope.list_hf_categories = rs.data.docs;
        }, function(){
            console.log('Error!');
        });

        //Todo: Get Health Facilities Type
        $http.post('/healthfacilities_type/list', {}).then(function(rs){
            $scope.list_hf_type = [];
            $scope.list_hf_type = rs.data.docs;
        }, function(){
            console.log('Error!');
        })
    }

    $scope.add_HFcat = function(hf_category_name){
        $http.post('/drugcat', {
            data: {
                cat_name: hf_category_name
            }
        }).then(function(rs){
            $scope.get_HFTypedetail();//Success or not!!!
            $scope.hf_category_name = '';
            toaster.pop('success', "Success ", "Heath facility category have successfully registered", 5000);

        })
    }

    $scope.get_HFTypedetail();


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


    $scope.createNewHFType = function(hf){

        $http.post('/healthfacilities_type/list',{}).then(function(rs) {
            if (rs.data.responseCode == 0 && rs.data.docs.length == 0) {
                var tmp_hfType = {
                    "hf_name": hf.hf_name,
                    "hf_category_id": (hf.hf_category && hf.hf_category.selected && hf.hf_category.selected._id ? hf.hf_category.selected._id : ''),
                    "hf_category_name": (hf.hf_category && hf.hf_category.selected && hf.hf_category.selected.cat_name ? hf.hf_category.selected.cat_name : ''),
                    "hf_description": hf.hf_description,
                    "hf_status": hf.hf_status
                }
                var _xdata = {
                    "data": tmp_hfType
                }
                $http.post('/healthfacilities_type', _xdata).then(function(rs){
                    $scope.get_HFTypedetail();
                    ModalControl.closeModal('createHFType');
                    toaster.pop('success', "Success ", "Health Facilities Type have successfully registered", 5000);

                })
            }else{
                toaster.pop('error', "Error: CODE_EXISTED", "Health Facilities "+hf.hf_name.toUpperCase()+" is registered, please choose another one!", 5000);

            }
        })

    }
    $scope.deleteHFCat = function (hf) {
        ConfirmBox.confirm('Are you sure?', 'The Health Facilities cat '+hf.name+' will be deleted?').then(function(){
            var del_data = {
                data: {"hardDelete": true}
            }
            $http.delete('/db_delete/healthfacilities_type/'+hf._id, del_data).then(function(rs){
                if(rs.data.status == true){
                    $scope.get_HFTypedetail();
                    toaster.pop('success', "Success ", "The Health Facilities cat have successfully deleted", 5000);

                }else{
                    toaster.pop('error', "Error", "Can not remove this The Health Facilities cat, please try again!", 5000);
                }
            })
        })

    }
    $scope.deleteHF = function(hf){
        ConfirmBox.confirm('Are you sure?', 'The '+hf.hf_name+' (code: '+hf.hf_name+') will be deleted?').then(function(){
            var del_data = {
                data: {"hardDelete": true}
            }
            $http.delete('/db_delete/healthfacilities_type/'+hf._id, del_data).then(function(rs){
                if(rs.data.status == true){
                    $scope.get_HFTypedetail();
                    toaster.pop('success', "Success ", "The Health Facilities have successfully deleted", 5000);

                }else{
                    toaster.pop('error', "Error", "Can not remove this The Health Facilities, please try again!", 5000);

                }
            })
        })
    }


    $scope.open_newHF = function(){
        $('#createHFType').modal('show');
        $scope.tmp_hf = { hf_status : 1};
        $scope.tmp_hf.is_edit = false;
    }


    $scope.open_edit = function(hf){
        $('#createHFType').modal('show');
        $scope.tmp_hf = hf;
        $scope.tmp_hf.hf_category = {
            selected : {
                "_id": hf.hf_category_id,
                "cat_name": hf.hf_category_name
            }
        };
        $scope.tmp_hf.is_edit = true;
    }

    $scope.save_hf_edit =function (new_hf) {
        var _xdata = {
            "data": {
                "drug_name": new_hf.hf_name,
                "drug_category_id": (new_hf.hf_category && new_hf.hf_category.selected && new_hf.hf_category.selected._id ? new_hf.hf_category.selected._id : ''),
                "hf_category_name": (new_hf.hf_category && new_hf.hf_category.selected && new_hf.hf_category.selected.cat_name ? new_hf.hf_category.selected.cat_name : ''),
                "drug_description": new_hf.hf_description,
                "drug_status": new_hf.hf_status
            }
        }
        $http.put('/healthfacilities_type/'+new_hf._id,_xdata).then(function(rs){
            if(rs.data.responseCode == 0){
                toaster.pop('success', "Success ", "The Health Facilities have successfully updated!", 5000);
                $scope.get_drugdetail();
                ModalControl.closeModal('createHFType');
            }
        })
    }


    $scope.find_hf = function(hf_code){
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