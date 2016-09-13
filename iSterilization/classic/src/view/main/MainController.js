//@charset UTF-8
Ext.define( 'iSterilization.view.main.MainController', {
    extend: 'Smart.ux.main.MainController',

    alias: 'controller.main',

    requires: [
        'Smart.ux.main.MainController',
        'iAdmin.view.person.client.ClientEdit'
    ],

    url: '../iAdmin/business/Calls/users.php',

    onRenderMainForm: function (view) {
        var me = this,
            ctrll = Smart.app.getController('App'),
            button = view.down('button[toggleHandler=onToggleMicro]'),
            first = ctrll.onMainPageView({ xtype: 'flowprocessingstep' });

        me.onToggleMicro(button,true);

        first.searchToogle();

        Ext.defer(function () {
            first.down('textfield[name=search]').focus(false,200);
        },1000);
    }

});