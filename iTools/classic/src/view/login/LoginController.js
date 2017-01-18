//@charset UTF-8
Ext.define( 'iTools.view.login.LoginController', {
    extend: 'Smart.ux.login.LoginController',

    alias: 'controller.login',

    requires: [
        'Smart.ux.login.LoginController'
    ],

    url: '../iAdmin/business/Calls/users.php'

});