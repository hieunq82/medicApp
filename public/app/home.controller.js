/**
 * Created by Linhnv on 12-Jun-17.
 */

angular.module('drugmonApp').controller('homeCtrl', function($scope,$rootScope,$http,$stateParams,$location,$cookies,$state,ConfirmBox,ModalControl,toaster,store ) {

    $scope.toogle_xmenu = function(){
        $('#toggle_mobile_menu').click();
    }
        $rootScope.user_logged = (store.get('currentUser') ? store.get('currentUser') : undefined );

    $scope.logoutAction = function(){
        ConfirmBox.confirm('Confirm', 'Are you sure you want to logout?').then(function() {
            store.remove('currentUser');
            $rootScope.user_logged = undefined;
            $state.go('login');
        })
    }
});

angular.module('drugmonApp').controller('SettingCtrl', function($scope,$rootScope,$http,$stateParams,$location,ConfirmBox,ModalControl,toaster,sha1) {

    $scope.list_settings = [];
    $scope.list_accounts = [];
    $scope.list_hf = [];
    $scope.newacc = {};
    $scope.get_list_settings = function(filter){
        var x_filter = {};
        $http.post('/settings/list',x_filter).then(function(rs){
            if(rs.data.responseCode == 0){
                $scope.list_settings = rs.data.docs;
            }
        })
    }
    $scope.save_setting = function(setting){
        var x_data = {
            data: setting
        }
        $http.put('/settings/'+setting._id, x_data).then(function(rs){
            if(rs.data.responseCode == 0){
                toaster.pop('success', "Success ", "Settings saved!", 5000);
            }else{
                toaster.pop('error', "Error", "Update failed!", 5000);

            }
        })
    }

    $scope.add_variable_code = function(code,st){
        st.setting_value = st.setting_value + ' <'+code+'>';
    }
    $scope.get_list_account = function(){
        $http.post('/accounts', {}).then(function (rs) {
            if(rs.data.status === true){
                $scope.list_accounts = rs.data.results;
            }else{
                $scope.list_accounts = [];
                //err
            }
        })

        //Get list HF
        $http.post('/healthfacility/list', {}).then(function(rs){
            $scope.list_hf = rs.data.docs;
        }, function(){
            console.log('Error!');
        })
    }

    $scope.account_exist = false;
    $scope.check_exist_account = function(user_name){
        $scope.account_exist = false;
        var data_find = {
            find_type: "check_exist",
            username: user_name
        }
        $http.post('/accounts', data_find).then(function (rs) {
            if(rs.data.status === true){
                $scope.account_exist = (rs.data.results.length > 0 ? true : false);
            }else{
                $scope.account_exist = false;
                //err
            }
        })
    }


    $scope.open_editAccount = function(account_selected){
        $('#newAccount').modal('show');
        $scope.newacc = angular.copy(account_selected);
        $scope.newacc.is_edit = true;
        $scope.newacc.password = '';
        $scope.newacc.reporting_center = {
            selected : $scope.newacc.hf
        };
    }



    $scope.open_newacc_pop = function () {
        $('#newAccount').modal('show');

    }
    $scope.btnNewAccount = function (newacc) {
        var data_post = {
            username: newacc.username,
            password: newacc.password,
            hf: (newacc.reporting_center && newacc.reporting_center.selected ? newacc.reporting_center.selected : undefined),
            first_name: newacc.first_name,
            last_name: newacc.last_name,
            email: newacc.email,
            phone_number: newacc.phone_number,
            is_admin: newacc.is_admin
        }

        $http.post('/add_account', data_post).then(function (rs) {
            if(rs.data.status === true){
                toaster.pop('success', "Success ", "Account added!", 5000);
                ModalControl.closeModal('newAccount');
                //success
            }else{
                toaster.pop('error', "Error ", rs.data.message, 5000);
                //err
            }
        })
    }

    $scope.saveEditAccount = function(newacc){
        console.log(newacc);
        var data_post = {
            "data": {
            hf: (newacc.reporting_center && newacc.reporting_center.selected ? newacc.reporting_center.selected : undefined),
            first_name: newacc.first_name,
            last_name: newacc.last_name,
            email: newacc.email,
            phone_number: newacc.phone_number,
            is_admin: newacc.is_admin
        }
    }

        if(newacc.password.length > 0){data_post.data.password = sha1.hash(newacc.password)}
        $http.put('/accounts/'+newacc._id, data_post).then(function (rs) {
            if(rs.data.responseCode == 0){
                toaster.pop('success', "Success ", "Account updated!", 5000);
                ModalControl.closeModal('newAccount');
                $scope.get_list_account();
                //success
            }else{
                toaster.pop('error', "Error ", rs.data.responseMessage, 5000);
                //err
            }
        })
    }


    $scope.removeAccount = function(user_info){
        ConfirmBox.confirm('Are you sure?', 'Account '+user_info.username+' will be permanently removed! This action cannot be undo!').then(function() {
            $http.delete('/db_delete/accounts/' + user_info._id).then(function (rs) {
                if (rs.data.status == true) {
                    toaster.pop('success', "Success ", user_info.username+" has been removed!", 5000);
                    $scope.get_list_account();
                }
                else{
                    toaster.pop('error', "Error ", "Error, please try again!", 5000);
                    //err
                }
            })
        })

    }


});

angular.module('drugmonApp').controller('RegisterDrugCtrl', function($scope,$rootScope,$http,ConfirmBox,toaster) {
    $scope.hf_drugs = [];
    $scope.drug_histories = {};
    //Todo: Find drug by HF ID
    $scope.get_hfdrugs = function(){
        $scope.hf_drugs = [];
        var _xdata = {
            "params": {
                "$eq":{
                    "hf_id":$rootScope.user_logged.user_info.user_hf._id
                }
            }
        }
        $http.post('/hfdrugs/list', _xdata).then(function(rs){
            $scope.hf_drugs = rs.data.docs;
        }, function(){
            $scope.hf_drugs = [];
        })
    }

    if($rootScope.user_logged.user_info && $rootScope.user_logged.user_info.user_hf){
        $scope.get_hfdrugs();
    }


    $scope.get_drug_history = function(drug_id){
        var x_req = {
            "params": {"$eq": {
                drug_id: drug_id,
                hf_id: $rootScope.user_logged.user_info.user_hf._id
            },
                "$sort": [
                    "-createdAt"
                ],}
        }
        $http.post('/drug_histories/list', x_req).then(function(rs){
            if(rs.data.responseCode == 0){
                //okay
                if(rs.data.docs.length>0){
                    $scope.drug_histories[drug_id] = rs.data.docs;
                }else{
                toaster.pop('info', "Infomation! ", "No data return!", 5000);

                }
            }
        })
    }

    $scope.register_drug = function (drug) {
        if(drug.drug_abs_new){

        ConfirmBox.confirm('Are you sure?', 'Register drug: "'+drug.drug_name+' ('+drug.drug_code+')" with new ABS: '+drug.drug_abs_new+'?').then(function() {
            var _xdata = {
                "data": {
                    "drug_abs": parseInt(drug.drug_abs_new)
                }
            };
            $http.put('/hfdrugs/'+drug._id, _xdata).then(function(rs){
                if(rs.data.responseCode == 0){
                    //Successed, register to history
                    var drug_data = drug;
                        drug_data._id = undefined;
                        drug_data.updatedAt = undefined;
                        drug_data.createdAt = undefined;
                        drug_data.drug_abs_old = parseInt(drug.drug_abs);
                        drug_data.drug_abs = parseInt(drug.drug_abs_new);
                        drug_data.user_update = $rootScope.user_logged.user_info;
                        drug_data.update_type = 'web_register';

                    var _update_data = {
                        "data": drug_data
                    };
                    $http.post('/drug_histories', _update_data).then(function(yupdate){
                        if(yupdate.data.responseCode == 0){
                            toaster.pop('success', "Register successed! ", drug.drug_name+" have successfully updated!", 5000);
                            $scope.get_hfdrugs($rootScope.user_logged.user_info.user_hf._id);
                            $scope.get_drug_history(drug._id);
                        }
                    })
                }
            })
        })

    }else{
        toaster.pop('error', "Error", "Please enter number of new ABS!", 5000);
    }
    }
})
