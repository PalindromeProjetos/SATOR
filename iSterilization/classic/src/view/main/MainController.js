//@charset UTF-8
Ext.define( 'iSterilization.view.main.MainController', {
    extend: 'Smart.ux.main.MainController',

    alias: 'controller.main',

    requires: [
        'Smart.ux.main.MainController',
        'iAdmin.view.person.client.ClientEdit',
        'iSterilization.view.flowprocessing.FlowProcessingLoad',
        'iSterilization.view.flowprocessing.FlowProcessingStep',
        'iSterilization.view.flowprocessing.FlowProcessingHold'
    ],

    url: '../iAdmin/business/Calls/users.php',

    onLoadToggle: function (btn) {
        var pressed = btn.pressed,
            appCtrll = Smart.app.getController('App'),
            report = pressed ? 'flowprocessingload' : 'flowprocessingstep';

        appCtrll.onMainPageView({ xtype: report, iconCls: null });
    },

    doStart: function (view) {
        var me = this,
            appCtrll = Smart.app.getController('App'),
            button = view.down('button[toggleHandler=onToggleMicro]');

        appCtrll.setFlowProcessingType();
        me.onToggleMicro(button, true);

        if (Smart.workstation.startreader == 1) {
            view.down('toolbar').insert(10, {
                allowDepress: true,
                enableToggle: true,
                handler: 'onLoadToggle',
                iconCls: "fa fa-eye"
            });
        }
    }

});