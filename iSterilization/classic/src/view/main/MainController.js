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

    routes: {
        'flowprocessingload': {
            action: 'getFlowProcessingLoad'
        },
        'flowprocessingstep': {
            action: 'getFlowProcessingStep'
        },
        'flowprocessinghold': {
            action: 'getFlowProcessingHold'
        }
    },

    url: '../iAdmin/business/Calls/users.php',

    getFlowProcessingLoad: function () {
        var app = Smart.app.getController('App');

        app.onMainPageView({ xtype: 'flowprocessingload' });
    },

    getFlowProcessingStep: function () {
        var app = Smart.app.getController('App');

        app.onMainPageView({ xtype: 'flowprocessingstep' });
    },

    getFlowProcessingHold: function () {
        var app = Smart.app.getController('App');

        app.onMainPageView({ xtype: 'flowprocessinghold' });
    },

    onLoadToggle: function (btn) {
        var me = this,
            pressed = btn.pressed,
            report = pressed ? 'flowprocessingload' : 'flowprocessingstep';

        me.redirectTo(report);
    },

    doStart: function (view) {
        var me = this,
            button = view.down('button[toggleHandler=onToggleMicro]');

        if(!Smart.workstation || !Smart.workstation.areasid) {
            Smart.Msg.showToast('Estação de Trabalho Não Configurada!','error');
            return false;
        }

        Ext.Ajax.request({
            scope: me,
            async: false,
            url: '../iAdmin/business/Calls/areas.php',
            params: {
                action: 'select',
                method: 'selectCode',
                rows: Ext.encode({id: Smart.workstation.areasid})
            },
            callback: function (options, success, response) {
                var result = Ext.decode(response.responseText);

                if(!success || !result.success) {
                    return false;
                }

                me.onToggleMicro(button, true);

                var data = result.rows[0];
                var report = (data.hasstock == 1) ? 'flowprocessinghold' : 'flowprocessingstep';

                Smart.workstation.startreader = data.startreader;

                if (Smart.workstation.startreader == 1) {
                    view.down('toolbar').insert(10, {
                        allowDepress: true,
                        enableToggle: true,
                        handler: 'onLoadToggle',
                        iconCls: "fa fa-eye"
                    });
                }

                me.redirectTo(report);
            }
        });

    }

});