'use strict';

angular.module('drugmonApp', [
  'ui.router','ngSanitize','ngCookies','angular-storage','ui.select','toaster','ngDialog','googlechart','angular-sha1'
]).config(function ($httpProvider) {
    $httpProvider.defaults.withCredentials = false;
    //rest of route code
}).config(function($stateProvider, $urlRouterProvider,$locationProvider) {


    $stateProvider.state('app', {
        url: '/',
        templateUrl: 'app/app.html',
        controller: 'AppCtrl'
    }).state('messages', {
        url: '/messages.html',
        templateUrl: 'app/messages.html',
        controller: 'MessagesCtrl'
    }).state('login', {
        url: '/login.html',
        templateUrl: 'app/login.html',
        controller: 'AccountCtrl'
    }).state('reports', {
        url: '/reports.html',
        templateUrl: 'app/reports.html',
        controller: 'ReportCtrl'
    }).state('healthfacility', {
        url: '/health-facility.html',
        templateUrl: 'app/health_facility.html',
        controller: 'HFCtrl'
    }).state('setting', {
        url: '/setting.html',
        templateUrl: 'app/setting.html',
        controller: 'SettingCtrl'
    }).state('drugs', {
        url: '/drugs.html',
        templateUrl: 'app/drugs.html',
        controller: 'DrugsCtrl'
    }).state('healthfacilitytype', {
        url: '/health-facility-type.html',
        templateUrl: 'app/health_facility_type.html',
        controller: 'HFTypeCtrl'
    }).state('userregister', {
        url: '/register-drugs.html',
        templateUrl: 'app/register_drugs.html',
        controller: 'RegisterDrugCtrl'
    });
    // $locationProvider.html5Mode(true);

    $urlRouterProvider.otherwise("/");
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });


}).run(function ($rootScope, $http, $location, $cookies,$state, store) {
    // keep user logged in after page refresh
    var user_logged = (store.get('currentUser') ? store.get('currentUser') : {});
    $rootScope.user_logged = user_logged;
    if (user_logged) {
        $http.defaults.headers.common['Authorization'] = 'Bearer ' + user_logged.token;
    }

    // redirect to login page if not logged in and trying to access a restricted page
    $rootScope.$on('$locationChangeStart', function (event, next, current) {
        var publicPages = ['/login.html'];
        var restrictedPage = publicPages.indexOf($location.path()) === -1;
        if (restrictedPage && !store.get('currentUser')) {
            $state.go('login');
            $location.path('/login.html');
            return;
        }
    });

}).factory('ModalControl', function(){
    return {
        closeModal:function(modal_id){
        var $modal = $('#'+modal_id);
        //when hidden
        // $modal.on('hidden.bs.modal', function(e) {
        //     return this.render(); //DOM destroyer
        // });
        $modal.modal('hide'); //start hiding
        }
    }
})

.config(['ngDialogProvider', function (ngDialogProvider) {
    ngDialogProvider.setDefaults({
        className: 'ngdialog-theme-plain',
        plain: true,
        showClose: true,
        closeByDocument: true,
        closeByEscape: true
    });
}])

.service('ConfirmBox', function(ngDialog){
    this.confirm = function (title,content) {
        var confirm_sl =  ngDialog.openConfirm({
            className: 'ngdialog-theme-default',
            template:'<link href="assets/css/ngDialog.css" rel="stylesheet" type="text/css" />\
		   <style>\
            button:focus {\
            outline:0;\
            box-shadow: inset 0 0 0 1px #27496d,0 2px 3px #193047;\
            }\
        </style>\
        <div class="modal-header" style="margin: -10px -10px 0px -10px;height:30px;">\
        <h5 class="modal-title" style="margin-top:-6px">' + title +'</h5></div>\
        <div class="modal-body">\
        <div style="color:red;">' + content +'</div>\
    </div>\
    <div class="ngdialog-buttons">\
        <button type="button" class="ngdialog-button ngdialog-button-primary" ng-click="confirm(1)" ng-enter="confirm(1)">Confirm</button>\
        <button type="button" class="ngdialog-button ngdialog-button-secondary" ng-click="closeThisDialog(0)" ng-enter="closeThisDialog(0)">Cancel</button>\
        </div>',
            plain: true
        });
        return confirm_sl;
    };
});


