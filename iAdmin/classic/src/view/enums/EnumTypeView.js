//@charset UTF-8
Ext.define( 'iAdmin.view.enums.EnumTypeView', {
    extend: 'Ext.panel.Panel',

    xtype: 'enumtypeview',

    requires: [
        'Ext.tab.*',
        'Ext.panel.Panel',
        'Smart.plugins.SmartRegion',
        'Ext.grid.plugin.RowEditing',
        'iAdmin.store.enums.*'
    ],

    layout: 'border',

    controller: 'enumtype',
    cls: 'panel-frame panel-frame-tpTree',
    iconCls: "fa fa-users",
    showSmartAnimate: true,

    header: {
        title: 'Manutenção do cadastro',
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
        afterrender: 'onAfterRenderView'
    },

    initComponent: function () {
        var me = this;
        me.buildItems();
        me.callParent();
    },

    buildItems: function () {
        var me = this,
            isDisabled = function (view, rowIdx, colIdx, item, record) {
                return parseInt(record.data.reserved);
            };

        Ext.create('iAdmin.store.enums.EnumTypeList');

        me.items = [
            {
                flex: 1,
                split: true,
                xtype: 'form',
                name: 'enumtype',
                region: 'west',
                scrollable: 'y',
                cls: "smart-background-transparent",
                plugins: [
                    'smartregion'
                ],
                responsiveConfig: {
                    'width >= 200': {
                        region: 'west',
                        flex: 1
                    }
                },
                smartregionConfig: {
                    source: 'west',
                    target: 'north',
                    width: 200,
                    flex: 3
                },
                layout: 'anchor',
                defaultType: 'textfield',
                defaults: {
                    anchor: '100%',
                    useLabelBold: true
                },
                items: [
                    {
                        xtype: 'label',
                        cls: 'title-label',
                        text: 'Cadastro do Enumerador'
                    }, {
                        xtype: 'hiddenfield',
                        name: 'id'
                    }, {
                        xtype: 'displayfield',
                        fieldLabel: 'Descrição',
                        name: 'description',
                        fieldStyle: {
                            color: '#C02942;',
                            fontSize: '18px;'
                        }
                    }, {
                        xtype: 'displayfield',
                        fieldLabel: 'Enumerador',
                        name: 'name',
                        fieldStyle: {
                            color: '#C02942;',
                            fontSize: '18px;'
                        }
                    }, {
                        xtype: 'textareafield',
                        fieldLabel: 'Observações',
                        name: 'observation',
                        fieldStyle: {
                            'color': '#C02942;',
                            'fontSize': '14px;'
                        }
                    }
                ],
                dockedItems: [
                    {
                        dock: 'bottom',
                        margin: '10 0 0 0',
                        xtype: 'container',
                        layout: 'hbox',
                        defaultType: 'button',
                        defaults: {
                            scale: 'large',
                            showSmartTheme: 'red'
                        },
                        items: [
                            {
                                flex: 1,
                                iconCls: "fa fa-upload",
                                text: 'Salvar',
                                handler: 'updateView'
                            }, {
                                xtype: 'splitter'
                            }, {
                                flex: 1,
                                iconCls: "fa fa-file-o",
                                text: 'Novo',
                                handler: 'insertView'
                            }
                        ]
                    }
                ]
            },{
                flex: 3,
                region: 'center',
                cls: 'update-grid',
                hideHeaders: false,
                headerBorders: false,
                xtype: 'gridpanel',
                store: 'enumtypelist',
                columns: [
                    {
                        width: 90,
                        text: 'Código',
                        dataIndex: 'code',
                        align: 'center'
                    }, {
                        sortable: false,
                        flex: 1,
                        text: 'Descrição',
                        dataIndex: 'description'
                    }, {
                        sortable: false,
                        width: 200,
                        text: 'Tipo de filtro',
                        dataIndex: 'filtertype'
                    }, {
                        width: 40,
                        align: 'center',
                        xtype: 'actioncolumn',
                        items: [
                            {
                                getClass: function(value, metaData, record, rowIndex, colIndex, store) {
                                    return parseInt(record.get('isactive')) == 1 ? "fa fa-check-circle action-checked-color-font" : '';
                                }
                            }
                        ]
                    }, {
                        sortable: false,
                        text: 'Ações',
                        width: 90,
                        xtype: 'actioncolumn',
                        align: 'center',
                        items: [
                            {
                                handler: 'onActionUpdate',
                                isDisabled: isDisabled,
                                iconCls: "fa fa-info-circle action-select-color-font",
                                tooltip: 'Editar cadastro!'
                            }, {
                                disabled: true,
                                xtype: 'splitter'
                            }, {
                                handler: 'onActionDelete',
                                isDisabled: isDisabled,
                                iconCls: "fa fa-minus-circle action-delete-color-font",
                                tooltip: 'Remover cadastro!'
                            }
                        ]
                    }
                ],
                dockedItems: [
                    {
                        xtype: 'pagingtoolbar',
                        store: 'enumtypelist',
                        dock: 'bottom',
                        displayInfo: true
                    }
                ]
            }
        ];

    }

});