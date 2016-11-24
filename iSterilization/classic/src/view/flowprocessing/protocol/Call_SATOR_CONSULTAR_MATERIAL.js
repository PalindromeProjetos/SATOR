//@charset UTF-8
Ext.define( 'iSterilization.view.flowprocessing.protocol.Call_SATOR_CONSULTAR_MATERIAL', {
    extend: 'Ext.window.Window',

    xtype: 'call_SATOR_CONSULTAR_MATERIAL',

    requires: [
        'Ext.tab.Panel',
        'Ext.form.Panel',
        'Smart.plugins.*',
        'Ext.window.Window',
        'iSterilization.view.flowprocessing.FlowProcessingController'
    ],

    width: 950,
    modal: true,
    layout: 'fit',
    header: false,
    resizable: false,
    showAnimate: true,

    controller: 'flowprocessing',

    initComponent: function () {
        var me = this;
        me.buildItems();
        me.callParent();
    },

    showData: function (record) {
        var view = this,
            portrait = view.down('portrait'),
            searchmaterial = view.down('searchmaterial'),
            materialdetail = view.down('container[name=materialdetail]'),
            materialmessage = view.down('container[name=materialmessage]');

        view.down('tabpanel').setActiveTab(0);

        if (!record) {
            portrait.beFileData();
            materialdetail.update('');
            materialmessage.update('');
            searchmaterial.getStore().removeAll();
            view.down('gridpanel').getStore().removeAll();
            portrait.update('<div style="position: absolute; padding: 10px 0 0 10px;">...</div>');
            return false;
        }

        materialdetail.update(record.data);
        searchmaterial.getTrigger('clear').show();
        portrait.beFileData(record.get('filetype'));
        portrait.update(Ext.String.format('<div style="position: absolute; padding: 10px 0 0 10px;">{0}</div>', record.get('colorpallet')));

        Ext.Ajax.request({
            scope: view,
            url: record.store.getUrl(),
            params: {
                action: 'select',
                method: 'getAvailableForProcessing',
                query: record.get('barcode')
            },
            callback: function (options, success, response) {
                var result = Ext.decode(response.responseText);

                if(!success || !result.success) {
                    Smart.Msg.showToast(result.text,'error');
                    return false;
                }
                materialmessage.update(result.rows[0]);
            }
        });
    },

    buildItems: function () {
        var me = this;

        me.items = [
            {
                xtype: 'form',
                bodyPadding: 10,
                margin: '10 0 0 0',
                layout: 'anchor',
                defaults: {
                    anchor: '100%',
                    allowBlank: true,
                    fieldCls: 'smart-field-style-action',
                    labelCls: 'smart-field-style-action'
                },
                items: [
                    {
                        xtype: 'label',
                        cls: 'title-label',
                        text: 'Consultar Material'
                    }, {
                        margin: '20 0 0 0',
                        name: 'materialname',
                        xtype: 'searchmaterial',
                        hiddenNameId: 'materialid',
                        configStoreListeners: {
                            load: function (store, records, successful, operation, eOpts) {
                                var searchmaterial = me.down('searchmaterial');
                                if (store.getCount() == 1) {
                                    var record = store.getAt(0);
                                    searchmaterial.setRawValue(record.get('name'));
                                    searchmaterial.fireEvent('select',searchmaterial, record, eOpts);
                                }
                                if (store.getCount() >= 2) {
                                    searchmaterial.expand();
                                }
                                if (store.getCount() == 0) {
                                    me.showData();
                                }
                            }
                        },
                        listeners: {
                            showclear: function (combo) {
                                var view = combo.up('window');
                                combo.reset();
                                view.showData();
                            },
                            select: function (combo,record,eOpts) {
                                var view = combo.up('window');
                                view.showData(record);
                            }
                        }
                    }, {
                        height: 10,
                        xtype: 'container'
                    }, {
                        xtype: 'panel',
                        layout: 'hbox',
                        items: [
                            {
                                flex: 3,
                                height: 400,
                                plain: true,
                                cls: 'consulta',
                                xtype: 'tabpanel',
                                headerPosition: 'left',
                                tabBarHeaderPosition: 2,
                                defaults: {
                                    bodyStyle: 'padding-left: 10px'
                                },
                                listeners: {
                                    tabchange: function ( tabPanel, newCard , oldCard , eOpts) {
                                        var view = tabPanel.up('window'),
                                            searchmaterial = view.down('searchmaterial'),
                                            store = searchmaterial.getStore();

                                        if(newCard.tabIndex == 1 && store.getCount() != 0) {
                                            var record = store.getAt(0),
                                                params = {
                                                    query: record.get('materialboxid'),
                                                    limit: record.get('materialboxitems')
                                                };
                                            newCard.down('gridpanel').getStore().removeAll();
                                            newCard.down('gridpanel').getStore().load({params: params});
                                        }
                                        if(newCard.tabIndex == 2 && store.getCount() != 0) {
                                            var record = store.getAt(0),
                                                params = {
                                                    query: record.get('id')
                                                };
                                            console.info(record.data);
                                            newCard.down('gridpanel').getStore().removeAll();
                                            newCard.down('gridpanel').getStore().load({params: params});
                                        }
                                    }
                                },
                                items: [
                                    {
                                        tabIndex: 0,
                                        title: 'Material',
                                        xtype: 'panel',
                                        layout: {
                                            type: 'vbox',
                                            align: 'stretch'
                                        },
                                        items: [
                                            {
                                                flex: 1,
                                                xtype: 'container',
                                                name: 'materialdetail',
                                                tpl: [
                                                    '<div class="movement consulta">',
                                                    '<div class="movement-title"><b>{name}</b></div>',
                                                    '<div class="movement-title"><b>Kit:</b> {materialboxname} <b>{materialboxitemstext}</b></div>',
                                                    '<div class="movement-title"><b>Status:</b> {materialstatusdescription}</div>',
                                                    '<div><b>Código de Barras: {barcode}</b></div>',
                                                    '<div><b>Grupo:</b> {itemgroupdescription}</div>',
                                                    '<div><b>Embalagem:</b> {packingname}</div>',
                                                    '<div><b style="color: red;">Proprietario:</b> {proprietaryname}</div>',
                                                    '</div>'
                                                ]
                                            }, {
                                                height: 120,
                                                xtype: 'container',
                                                name: 'materialmessage',
                                                tpl: [
                                                    '<div class="movement consulta">',
                                                        '<div class="movement-title"><b>Localização:</b></div>',
                                                        '<div><b style="color: red;">{message}</b></div>',
                                                    '</div>'
                                                ]
                                            }
                                        ]
                                    }, {
                                        tabIndex: 1,
                                        title: 'Kit',
                                        xtype: 'panel',
                                        layout: 'fit',
                                        items: [
                                            {
                                                xtype: 'gridpanel',
                                                cls: 'update-grid',
                                                hideHeaders: false,
                                                headerBorders: false,

                                                params: {
                                                    action: 'select',
                                                    method: 'selectCode'
                                                },

                                                url: '../iAdmin/business/Calls/materialboxitem.php',

                                                fields: [
                                                    {
                                                        name: 'id',
                                                        type: 'int'
                                                    }, {
                                                        name: 'barcode',
                                                        type: 'auto'
                                                    }, {
                                                        name: 'materialname',
                                                        type: 'auto'
                                                    }, {
                                                        name: 'proprietaryname',
                                                        type: 'auto'
                                                    }
                                                ],

                                                columns: [
                                                    {
                                                        xtype: 'rownumberer'
                                                    }, {
                                                        width: 120,
                                                        sortable: false,
                                                        dataIndex: 'barcode',
                                                        text: 'Código'
                                                    }, {
                                                        flex: 1,
                                                        sortable: false,
                                                        dataIndex: 'materialname',
                                                        text: 'Material'
                                                    }
                                                ]
                                            }
                                        ]
                                    }, {
                                        tabIndex: 2,
                                        title: 'Processos',
                                        xtype: 'panel',
                                        layout: 'fit',
                                        items: [
                                            {
                                                xtype: 'gridpanel',
                                                cls: 'update-grid',
                                                hideHeaders: false,
                                                headerBorders: false,

                                                params: {
                                                    action: 'select',
                                                    method: 'selectByMaterial'
                                                },

                                                url: '../iSterilization/business/Calls/flowprocessingstepmaterial.php',

                                                fields: [
                                                    {
                                                        name: 'id',
                                                        type: 'int'
                                                    }, {
                                                        name: 'barcode',
                                                        type: 'auto'
                                                    }, {
                                                        name: 'dateof',
                                                        type: 'auto'
                                                        // serializeType: 'date'
                                                        // convert: function (value, record) {
                                                        //     return ( !value || value.length == 0) ? null : Ext.util.Format.date(Ext.Date.parse(value,'Y-m-d'),'d/m/Y');
                                                        // }
                                                    }
                                                ],

                                                columns: [
                                                    {
                                                        xtype: 'rownumberer'
                                                    }, {
                                                        flex: 1,
                                                        sortable: false,
                                                        dataIndex: 'barcode',
                                                        text: 'Código'
                                                    }, {
                                                        width: 160,
                                                        sortable: false,
                                                        dataIndex: 'dateof',
                                                        text: 'Data'
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }, {
                                xtype: 'splitter'
                            }, {
                                flex: 2,
                                height: 400,
                                hideButtons: true,
                                xtype: 'portrait'
                            }
                        ]
                    }
                ]
            }
        ]
    },

    buttonAlign: 'center',

    buttons: [
        {
            scale: 'medium',
            text: 'Cancelar',
            showSmartTheme: 'red',
            handler: function (btn) {
                btn.windowClose();
            }
        }
    ]

});