//@charset UTF-8
Ext.define( 'iSterilization.controller.App', {
    extend: 'Smart.ux.app.ApplicationController',

    requires: [
        'Smart.ux.app.ApplicationController',
        'iSterilization.view.flowprocessing.FlowProcessingLoad',
        'iSterilization.view.flowprocessing.FlowProcessingPick',
        'iSterilization.view.flowprocessing.FlowProcessingStep',
        'iSterilization.view.flowprocessing.FlowProcessingHold'
    ],

    routes: {
        'userslist': {
            action: 'setUsersList'
        },
        'enumtypelist': {
            action: 'setEnumTypeList'
        },
        'profilelist': {
            action: 'setProfileList'
        },
        'materiallist': {
            action: 'setMaterialList'
        },
        'serviceregistrationlist': {
            action: 'setServiceRegistrationList'
        },
        'flowprocessingdash': {
            action: 'setFlowprocessingDash'
        },
        'flowprocessingtype': {
            action: 'setFlowProcessingType'
        }
    },

    //routes ========================>

    setUsersList: function () {
        var me = this,
            rc = me.getMainTree().getSelection();

        return me.onMainPageView({ xtype: 'userslist', iconCls: rc.get("iconCls") });
    },

    setEnumTypeList: function () {
        var me = this,
            rc = me.getMainTree().getSelection();

        return me.onMainPageView({ xtype: 'enumtypelist', iconCls: rc.get("iconCls") });
    },

    setMaterialList: function () {
        var me = this,
            rc = me.getMainTree().getSelection();

        return me.onMainPageView({ xtype: 'materiallist', iconCls: rc.get("iconCls") });
    },

    setProfileList: function () {
        var me = this,
            rc = me.getMainTree().getSelection();

        return me.onMainPageView({ xtype: 'profilelist', iconCls: rc.get("iconCls") });
    },

    setServiceRegistrationList: function () {
        var me = this,
            rc = me.getMainTree().getSelection();

        return me.onMainPageView({ xtype: 'serviceregistrationlist', iconCls: rc.get("iconCls") });
    },

    setFlowprocessingDash: function () {
        var me = this,
            rc = me.getMainTree().getSelection();

        return me.onMainPageView({ xtype: 'flowprocessingdash', iconCls: rc.get("iconCls") });
    },

    setFlowProcessingType: function () {
        var me = this;

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

                var data = result.rows[0];
                var report = (data.hasstock == 1) ? 'flowprocessinghold' : 'flowprocessingstep';

                Smart.workstation.startreader = data.startreader;

                me.onMainPageView({ xtype: report });
                // history.pushState({}, "route", "#flowprocessingtype");
            }
        });

    }

    //routes ========================>

});