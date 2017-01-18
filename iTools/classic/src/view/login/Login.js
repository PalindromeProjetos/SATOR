//@charset UTF-8
Ext.define( 'iTools.view.login.Login', {
    extend: 'Smart.ux.login.Login',

    xtype: 'login',

    controller: 'login',

    requires: [
        'Smart.ux.login.Login',
        'iTools.view.login.LoginController'
    ]

});