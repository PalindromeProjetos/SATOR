//@charset UTF-8
Ext.define( 'iSterilization.view.login.LoginController', {
    extend: 'Smart.ux.login.LoginController',

    alias: 'controller.login',

    url: '../iAdmin/business/Calls/users.php',

    requires: [
        'Smart.ux.login.LoginController'
    ]

});