angular.module('drugmonApp').controller('MessagesCtrl', function($scope,$http) {
  $scope.list_mesages = [];
  $scope.msg = {};

$scope.get_messages = function(){
  $http.post('/messages/list', {}).then(function(rs){

      var _tmp_obj = groupArrBy(rs.data.docs,'from');

      for (var o in _tmp_obj){
          $scope.list_mesages.push({
              from: o,
              messages:_tmp_obj[o]
          });
      }
      // console.log($scope.list_mesages);
  }, function(){
      console.log('Error!');
  })
}

    $scope.detail_messages = $scope.list_mesages[0];
    $scope.set_active_index = function(pindex){
        $scope.detail_messages = $scope.list_mesages[pindex];
        $scope.detail_messages.index = pindex;
        console.log($scope.detail_messages);
    }

$scope.get_messages();

$scope.sendMsg = function(msg){
    var _xdata = {
        "data": {
        "id": generateUUID(),
        "to": msg.to,
        "content": msg.content,
        "state": "PENDING",
        "type": "sms_custom",
        "history": []
        }
    }
    $http.post('/messages_out', _xdata).then(function(rs){
        if(rs.data.status === true) alert('Sent!')
    })

}

    var groupArrBy = function(xs, key) {
        return xs.reduce(function(rv, x) {
            (rv[x[key]] = rv[x[key]] || []).push(x);
            return rv;
        }, {});
    };
    function generateUUID () { // Public Domain/MIT
        var d = new Date().getTime();
        if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
            d += performance.now(); //use high-precision timer if available
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }

});