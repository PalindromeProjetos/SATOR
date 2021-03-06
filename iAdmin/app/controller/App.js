//@charset UTF-8
Ext.define( 'iAdmin.controller.App', {
    extend: 'Smart.ux.app.ApplicationController',

    requires: [
        'Smart.ux.app.ApplicationController'
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
        'equipmentlist': {
            action: 'setEquipmentList'
        },
        'cmeareasstocklist': {
            action: 'setCMEAreasStockList'
        },
        'sterilizationtypelist': {
            action: 'setSterilizationTypeList'
        },
        'materialboxlist': {
            action: 'setMaterialBoxList'
        },
        'inputlist': {
            action: 'setInputList'
        },
        'movimentlist': {
            action: 'setMovimentList'
        }
    },

    //routes ========================>

    setUsersList: function () {
        var me = this,
            rc = me.getMainTree().getSelection();

        me.onMainPageView({ xtype: 'userslist', iconCls: rc.get("iconCls") });
    },

    setEnumTypeList: function () {
        var me = this,
            rc = me.getMainTree().getSelection();

        me.onMainPageView({ xtype: 'enumtypelist', iconCls: rc.get("iconCls") });
    },

    setProfileList: function () {
        var me = this,
            rc = me.getMainTree().getSelection();

        me.onMainPageView({ xtype: 'profilelist', iconCls: rc.get("iconCls") });
    },

    setMaterialList: function () {
        var me = this,
            rc = me.getMainTree().getSelection();

        me.onMainPageView({ xtype: 'materiallist', iconCls: rc.get("iconCls") });
    },

    setEquipmentList: function () {
        var me = this,
            rc = me.getMainTree().getSelection();

        me.onMainPageView({ xtype: 'equipmentlist', iconCls: rc.get("iconCls") });
    },

    setCMEAreasStockList: function () {
        var me = this,
            rc = me.getMainTree().getSelection();

        me.onMainPageView({ xtype: 'cmeareasstocklist', iconCls: rc.get("iconCls") });
    },

    setSterilizationTypeList: function () {
        var me = this,
            rc = me.getMainTree().getSelection();

        me.onMainPageView({ xtype: 'sterilizationtypelist', iconCls: rc.get("iconCls") });
    },

    setMaterialBoxList: function () {
        var me = this,
            rc = me.getMainTree().getSelection();

        me.onMainPageView({ xtype: 'materialboxlist', iconCls: rc.get("iconCls") });
    },

    setInputList: function () {
        var me = this,
            rc = me.getMainTree().getSelection();

        me.onMainPageView({ xtype: 'inputlist', iconCls: rc.get("iconCls") });
    },

    setMovimentList: function () {
        var me = this,
            rc = me.getMainTree().getSelection();

        me.onMainPageView({ xtype: 'movimentlist', iconCls: rc.get("iconCls") });
    }

    //routes ========================>

});