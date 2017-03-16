//@charset UTF-8
Ext.define( 'iAdmin.view.quick.panels.MonthlyProduction', {
    extend: 'Ext.container.Container',

    xtype: 'monthlyproduction',

    requires: [
        'Ext.container.Container'
    ],

    layout: 'anchor',

    defaults: {
        anchor: '100%',
        allowBlank: false,
        hideTrigger: true
    },

    padding: 20,

    initComponent: function () {
        var me = this;
        me.buildItems();
        me.callParent();
    },

    buildItems: function () {
        var me = this,
            year = new Date().getFullYear(),
            month = new Date().getMonth()+1;

        me.items = [
            {
                padding: '0 0 10px 0',
                xtype: 'container',
                html: '<span style="font-size: 18px; color: darkblue;">Parâmetros</span>'
            }, {
                xtype: 'numberfield',
                name: 'year',
                fieldLabel: 'Ano',
                value: year,
                maxValue: year,
                minValue: 2016
            }, {
                xtype: 'numberfield',
                name: 'month',
                fieldLabel: 'Mês',
                value: month,
                maxValue: 12,
                minValue: 1
            }
        ]
    }

});