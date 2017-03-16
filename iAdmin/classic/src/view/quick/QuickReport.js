//@charset UTF-8
Ext.define( 'iAdmin.view.quick.QuickReport', {
    extend: 'Ext.window.Window',

    xtype: 'quickreport',

    requires: [
        'Ext.list.Tree',
        'Ext.tree.Panel',
        'Ext.window.Window',
        'Ext.button.Segmented',
        'iAdmin.view.quick.panels.*',
        'iAdmin.view.quick.QuickReportController'
    ],

    constrain: true,

    width: 500,
    resizable: false,
    showAnimate: true,
    layout: 'fit',
    cls: 'panel-frame',
    controller: 'quickreport',
    iconCls: "fa fa-pencil",

    title: 'Listagens',

    listeners: {
        show: 'onViewShow'
    },

    initComponent: function () {
        var me = this;
        me.buildItems();
        me.callParent();
    },

    buildItems: function () {
        var me = this;

        me.items = [
            {
                height: 500,
                xtype: 'container',
                padding: 10,
                layout: {
                    type: 'hbox',
                    align: 'stretch'
                },
                items: [
                    {
                        flex: 1,
                        xtype: 'treelist',
                        store: {
                            root: {
                                expanded: true,
                                children: [
                                    {
                                        text: 'Mensal',
                                        expanded: true,
                                        iconCls: 'x-fa fa-book',
                                        children: [
                                            {
                                                leaf: true,
                                                text: 'Produção Mensal',
                                                iconCls: 'x-fa fa-usd',
                                                panels: 'monthlyproduction'
                                            }
                                        ]
                                    }
                                ]
                            }
                        },
                        listeners: {
                            selectionchange: 'onSelectionChange'
                        }
                    }, {
                        xtype: 'splitter'
                    }, {
                        flex: 1,
                        name: 'panels',
                        xtype: 'form',
                        layout: 'fit'
                    }
                ]
            }
        ]
    },

    buttons: [
        {
            text: 'Imprimir',
            handler: 'printerPanel'
        }, {
            text: 'Fechar',
            listeners: {
                click: function () {
                    this.windowClose();
                }
            }
        }
    ]


});