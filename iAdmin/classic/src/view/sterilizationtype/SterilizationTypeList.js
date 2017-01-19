//@charset UTF-8
Ext.define( 'iAdmin.view.sterilizationtype.SterilizationTypeList', {
    extend: 'Ext.form.Panel',

    xtype: 'sterilizationtypelist',

    requires: [
        'Ext.grid.Panel',
        'Ext.form.Panel',
        'Ext.grid.column.*',
        'iAdmin.store.sterilizationtype.*',
        'iAdmin.view.sterilizationtype.SterilizationTypeController'
    ],

    layout: 'fit',

    controller: 'sterilizationtype',
    cls: 'panel-frame panel-frame-tpTree',
    iconCls: "fa fa-users",
    showSmartAnimate: true,

    header: {
        title: 'Listar Tipos de Esterilizações',
        defaultType: 'button',
        defaults: {
            showSmartTheme: 'header'
        },
        items: [
            {
                handler: 'onHistoryBack',
                iconCls: "fa fa-arrow-left"
            }, {
                width: 5,
                xtype: 'splitter'
            }, {
                handler: 'onDestroyView',
                iconCls: "fa fa-times"
            }
        ]
    },

    listeners: {
        afterrender: 'onFocusSearch'
    },

    initComponent: function () {
        var me = this;
        me.buildItems();
        me.callParent();
    },

    buildItems: function () {
        var me = this;

        Ext.create('iAdmin.store.sterilizationtype.SterilizationType');

        me.items = [
            {
                xtype: 'gridpanel',
                store: 'sterilizationtype',
                hideHeaders: false,
                headerBorders: false,
                cls: 'update-grid',
                listeners: {
                    itemdblclick: 'onViewEdit'
                },
                columns: [
                    {
                        flex: 1,
                        text: 'Nome do Material',
                        dataIndex: 'name'
                    }, {
                        flex: 2,
                        text: 'Descrição',
                        dataIndex: 'description'
                    }, {
                        width: 140,
                        text: 'Tipo',
                        dataIndex: 'flowtypedescription'
                    }, {
                        width: 100,
                        text: 'Versão',
                        dataIndex: 'version'
                    }, {
                        width: 100,
                        text: 'Status',
                        align: 'center',
                        xtype: 'actioncolumn',
                        items: [
                            {
                                getClass: function(value, metaData, record, rowIndex, colIndex, store) {
                                    return parseInt(record.get('authenticate')) == 1 ? "fa fa-gavel action-checked-color-font" : '';
                                }
                            }, {
                                xtype: 'splitter'
                            }, {
                                getClass: function(value, metaData, record, rowIndex, colIndex, store) {
                                    return parseInt(record.get('isactive')) == 1 ? "fa fa-check-circle action-checked-color-font" : '';
                                }
                            }
                        ]
                    }, {
                        width: 100,
                        text: 'Ações',
                        align: 'center',
                        xtype: 'actioncolumn',
                        items: [
                            {
                                handler: 'printerFlowItem',
                                iconCls: "fa fa-print action-insert-color-font",
                                tooltip: 'Imprimir exceções!'
                            }, {
                                xtype: 'splitter'
                            }, {
                                handler: 'onViewEdit',
                                iconCls: "fa fa-info-circle action-select-color-font",
                                tooltip: 'Editar cadastro!'
                            }
                        ]
                    }
                ],
                dockedItems: [
                    {
                        xtype:  'panel',
                        layout: 'hbox',
                        bodyStyle: 'padding-bottom: 10px;',
                        items: [
                            {
                                flex: 1,
                                xtype: 'textfield',
                                name: 'search',
                                reference: 'search',
                                showFetch: true
                            }, {
                                xtype: 'splitter'
                            }, {
                                xtype: 'button',
                                iconCls: "fa fa-file-o",
                                handler: 'insertViewNew',
                                tooltip: 'Novo cadastro!'
                            }
                        ]
                    }, {
                        xtype: 'pagingtoolbar',
                        store: 'sterilizationtype',
                        dock: 'bottom',
                        displayInfo: true
                    }
                ]
            }
        ];
    }

});