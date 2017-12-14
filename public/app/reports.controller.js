angular.module('drugmonApp').controller('ReportCtrl', function($scope,$http) {

    $scope.list_register = [];
    $scope.msg = {};

    $scope.momentjs = moment;
    $scope.get_messages = function(){
        $http.post('/drugregisters/list', {}).then(function(rs){
            $scope.list_register = rs.data.docs;
            //$scope.choose_report($scope.list_register[0],0)
            // $scope.list_register.forEach(function(each, idx){
            //     if($stateParams.f === each._id){
            //         $scope.choose_report(each,idx)
            //     }
            // })
            console.log('---List Register---')
            console.log($scope.list_register)
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

});