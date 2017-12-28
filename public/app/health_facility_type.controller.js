angular.module('drugmonApp').controller('HFTypeCtrl', function($scope,$http,toaster,ModalControl,ConfirmBox) {
    $scope.list_hf_type = [];
    $scope.msg = {};
    $scope.hftype = {
        status: 1
    };
    $scope.list_hf_type_categories = [];
    $scope.newhftype = {};
    $scope.hf_type_category_name = '';

    $scope.get_hf_type_detail = function(){
        //Todo: Get category
        $http.post('/hftypecat/list', {}).then(function(rs){
            $scope.list_hf_type_categories = [];
            $scope.list_hf_type_categories = rs.data.docs;
        }, function(){
            console.log('Error!');
        });

        //Todo: Get HF Type
        $http.post('/healthfacilities_type/list', {}).then(function(rs){
            $scope.list_hf_type = [];
            $scope.list_hf_type = rs.data.docs;
        }, function(){
            console.log('Error!');
        })
    }

    $scope.add_hftypecat = function(hf_type_category_name){
        console.log('HF Type Cat');
        $http.post('/hftypecat', {
            data: {
                cat_name: hf_type_category_name
            }
        }).then(function(rs){
            $scope.get_hf_type_detail();//Success or not!!!
            $scope.hf_type_category_name = '';
            toaster.pop('success', "Success ", "The HF Type cat have successfully registered", 5000);

        })
    }

    $scope.get_hf_type_detail();


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


    $scope.createNewHFType = function(hftype){
        var _params = {
            "params": {
                "$eq": {
                    "hf_type_code": (hftype && hftype.hf_type_code ? hftype.hf_type_code.toUpperCase() : '')
                }
            }
        }
        $http.post('/healthfacilities_type/list',_params).then(function(rs) {
            if (rs.data.responseCode == 0 && rs.data.docs.length == 0) {
                var tmp_hftype = {
                    "hf_type_name": hftype.hf_type_name,
                    "hf_type_code": hftype.hf_type_code.toUpperCase(),
                    "hf_type_category_id": (hftype.hf_type_category && hftype.hf_type_category.selected && hftype.hf_type_category.selected._id ? hftype.hf_type_category.selected._id : ''),
                    "hf_type_category_name": (hftype.hf_type_category && hftype.hf_type_category.selected && hftype.hf_type_category.selected.cat_name ? hftype.hf_type_category.selected.cat_name : ''),
                    "hf_type_description": hftype.hf_type_description,
                    "hf_type_status": hftype.hf_type_status
                }
                var _xdata = {
                    "data": tmp_hftype
                }
                $http.post('/healthfacilities_type', _xdata).then(function(rs){
                    $scope.get_hf_type_detail();
                    ModalControl.closeModal('createHFType');
                    toaster.pop('success', "Success ", "The HF Type have successfully registered", 5000);

                })
            }else{
                toaster.pop('error', "Error: CODE_EXISTED", "The HF Type CODE: "+hftype.hf_type_code.toUpperCase()+" is registered, please choose another one!", 5000);

            }
        })

    }
    $scope.deleteHFTypeCat = function (hftype) {
        ConfirmBox.confirm('Are you sure?', 'The HF type cat '+hftype.name+' will be deleted?').then(function(){
            var del_data = {
                data: {"hardDelete": true}
            }
            console.log('HF type');
            console.log(hftype);
            $http.delete('/db_delete/hftypecats/'+hftype._id, del_data).then(function(rs){
                if(rs.data.status == true){
                    $scope.get_hf_type_detail();
                    toaster.pop('success', "Success ", "The HF Type cat have successfully deleted", 5000);

                }else{
                    toaster.pop('error', "Error", "Can not remove this HF Type cat, please try again!", 5000);
                }
            })
        })

    }
    $scope.deleteHFType = function(hftype){
        ConfirmBox.confirm('Are you sure?', 'The '+hftype.hf_type_name+' (code: '+hftype.hf_type_code+') will be DELETED in all The Health Facility?').then(function(){
            var del_data = {
                data: {"hardDelete": true}
            }
            console.log('HF type');
            console.log(hftype);
            $http.delete('/db_delete/healthfacilities_types/'+hftype._id, del_data).then(function(rs){
                if(rs.data.status == true){
                    $scope.get_hf_type_detail();
                    toaster.pop('success', "Success ", "The HF Type have successfully deleted", 5000);
                }else{
                    toaster.pop('error', "Error", "Can not remove this HF type, please try again!", 5000);

                }
            })

        })
    }


    $scope.open_newHFType = function(){
        $('#createHFType').modal('show');
        $scope.tmp_HFType = { hf_type_status : 1};
        $scope.tmp_HFType.is_edit = false;
    }


    $scope.open_edit_hf_type = function(hftype){
        $('#createHFType').modal('show');
        $scope.tmp_HFType = hftype;
        $scope.tmp_HFType.hf_type_category = {
            selected : {
                "_id": hftype.hf_type_category_id,
                "cat_name": hftype.hf_type_category_name
            }
        };
        $scope.tmp_HFType.is_edit = true;
    }

    $scope.save_hf_type_edit =function (new_hf_type) {
        var _xdata = {
            "data": {
                "hf_type_name": new_hf_type.hf_type_name,
                "hf_type_category_id": (new_hf_type.hf_type_category && new_hf_type.hf_type_category.selected && new_hf_type.hf_type_category.selected._id ? new_hf_type.hf_type_category.selected._id : ''),
                "hf_type_category_name": (new_hf_type.hf_type_category && new_hf_type.hf_type_category.selected && new_hf_type.hf_type_category.selected.cat_name ? new_hf_type.hf_type_category.selected.cat_name : ''),
                "hf_type_description": new_hf_type.hf_type_description,
                "hf_type_status": new_hf_type.hf_type_status
            }
        }
        $http.put('/healthfacilities_type/'+new_hf_type._id,_xdata).then(function(rs){
            if(rs.data.responseCode == 0){
                toaster.pop('success', "Success ", "The HF Type have successfully updated!", 5000);
                $scope.get_hf_type_detail();
                ModalControl.closeModal('createHFType');
            }
        })
    }


    $scope.find_hf_type = function(hf_type_code){
        if(hf_type_code){

            var _params = {
                "params": {
                    "$eq": {
                        "hf_type_code": hf_type_code.toUpperCase()
                    }
                }
            }
            $http.post('/healthfacilities_type/list',_params).then(function(rs){
                if(rs.data.responseCode == 0 && rs.data.docs.length > 0){
                    toaster.pop('error', "Error: CODE_EXISTED ", "The HF Type CODE: "+hf_type_code.toUpperCase()+" is registered, please choose another one!", 5000);
                }else{
                    toaster.clear();
                }
            })
        }
    }
    function checkHFTypeIsExisted(hf_type_code){
        var _params = {
            "params": {
                "$eq": {
                    "hf_type_code": hf_type_code
                }
            }
        }
        $http.post('/healthfacilities_type/list',_params).then(function(rs){
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