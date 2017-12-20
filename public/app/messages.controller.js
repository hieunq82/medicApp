angular.module('drugmonApp').controller('MessagesCtrl', function ($scope, $http) {
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
    var x_req = {
        "params": {
            "$sort": [
                "-createdAt"
            ]
        }
    }
    $scope.get_messages = function () {
        $http.post('/messages/list', x_req).then(function (rs) {
            console.log("All Messages");
            $scope.list_mesages = rs.data.docs;
            console.log($scope.list_mesages);
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
        }, function () {
            console.log('Error!');
        })
    }


    $scope.detail_messages = $scope.list_mesages[0];
    $scope.set_active_index = function (pindex) {
        $scope.detail_messages = $scope.list_mesages[pindex];
        $scope.detail_messages.index = pindex;
        console.log($scope.detail_messages);
    }

    $scope.detail_contact = [];
    $scope.get_hfdetail = function(){
        $http.post('/healthfacility/list', {}).then(function(rs){
            $scope.detail_contact = rs.data.docs;
            $scope.detail_contact.selected = rs.data.docs;
            console.log('---Health Facility---')
            console.log($scope.detail_contact)

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

    $scope.open_newHF = function(detail_messages){
        $('#HFupdate').modal('show');
        $scope.hf_drug = {};
        $scope.hf_drug.is_edit = false;
    }
});