//@charset UTF-8
Ext.define( 'iSterilization.view.flowprocessing.protocol.Call_SATOR_CONSULTAR_MATERIAL', {
    extend: 'Ext.window.Window',

    xtype: 'call_SATOR_CONSULTAR_MATERIAL',

    requires: [
        'Ext.tab.Panel',
        'Ext.form.Panel',
        'Smart.plugins.*',
        'Ext.window.Window',
        'iAdmin.view.material.MaterialSearchFilter',
        'iSterilization.view.flowprocessing.FlowProcessingController'
    ],

    width: 1150,
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
            materialarmory = view.down('container[name=materialarmory]'),
            materialdetail = view.down('container[name=materialdetail]'),
            materialmessage = view.down('panel[name=materialmessage]');

        view.down('tabpanel').setActiveTab(0);

        materialarmory.update('');
        materialdetail.update('');
        materialmessage.update('');

        if (!record) {
            portrait.beFileData();
            searchmaterial.getStore().removeAll();
            view.down('gridpanel[name=materialbox]').getStore().removeAll();
            view.down('gridpanel[name=flowprocessing]').getStore().removeAll();
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
                materialid: record.get('id'),
                query: record.get('barcode')
            },
            callback: function (options, success, response) {
                var result = Ext.decode(response.responseText);

                if(!success || !result.success) {
                    Smart.Msg.showToast(result.text,'error');
                    return false;
                }

                if(result.rows.length != 0 && result.rows[0].areavailable == 1) {
                    materialarmory.update(result.rows[0]);
                }

                materialmessage.update(result.rows[0]);

                searchmaterial.selectText();
                searchmaterial.focus(false,200);
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
                        xtype: 'container',
                        layout: 'hbox',
                        defaultType: 'label',
                        defaults: {
                            cls: 'title-label'
                        },
                        items: [
                            {
                                flex: 1,
                                text: 'Consultar Material'
                            }, {
                                width: 30,
                                height: 30,
                                xtype: 'component',
                                html: '<div class="smart-btn-header" style="padding-left: 7px;"><i class="fa fa-times"></i></div>',
                                style: {
                                    cursor: 'pointer',
                                    fontSize: '20px;',
                                    borderRadius: '50%',
                                    backgroundColor:'rgb(246, 246, 246);'
                                },
                                listeners: {
                                    render: function(c){
                                        c.getEl().on({
                                            click: function() {
                                                me.close();
                                            }
                                        });
                                    }
                                }
                            }
                        ]
                    }, {
                        margin: '20 0 0 0',
                        layout: 'hbox',
                        xtype: 'container',
                        defaults: {
                            fieldCls: 'smart-field-style-action'
                        },
                        items: [
                            {
                                flex: 3,
                                margin: '0 5 0 0',
                                selectOnFocus: true,
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
                                    },
                                    beforeload: function  ( store, operation, eOpts ) {
                                        var params = {method: 'selectOpenMaterial'},
                                            filterid = me.down('hiddenfield[name=filterid]'),
                                            filtertype = me.down('hiddenfield[name=filtertype]');

                                        if(filtertype.getValue()) {
                                            params.filterid = filterid.getValue();
                                            params.method = (filtertype.getValue() == 1) ? 'selectBox' : 'selectProprietary';
                                        }

                                        // params: {
                                        //     param: 'C',
                                        //         action: 'select',
                                        //         method: 'selectOpenMaterial'
                                        // },

                                        store.setParams(params);
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
                                xtype: 'hiddenfield',
                                name: 'filtertype'
                            }, {
                                xtype: 'hiddenfield',
                                name: 'filterid'
                            }, {
                                flex: 2,
                                showClear: true,
                                margin: '0 0 0 5',
                                xtype: 'materialsearchfilter',
                                listeners: {
                                    showclear: 'showClear'
                                }
                            }
                        ]
                    }, {
                        height: 10,
                        xtype: 'container'
                    }, {
                        height: 500,
                        xtype: 'panel',
                        layout: {
                            type: 'hbox',
                            align: 'stretch'
                        },
                        items: [
                            {
                                flex: 3,
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
                                                    query: record.get('id'),
                                                    areasid: Smart.workstation.areasid
                                                };
                                            newCard.down('gridpanel').getStore().removeAll();
                                            newCard.down('gridpanel').getStore().load({params: params});
                                        }
                                        if(newCard.tabIndex == 3 && store.getCount() != 0) {
                                            var record = store.getAt(0),
                                                params = {
                                                    query: record.get('id')
                                                };
                                            newCard.down('gridpanel').getStore().removeAll();
                                            newCard.down('gridpanel').getStore().load({params: params});
                                        }
                                        if(newCard.tabIndex == 4 && store.getCount() != 0) {
                                            var record = store.getAt(0),
                                                params = {
                                                    query: record.get('id')
                                                };
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
                                                height: 250,
                                                xtype: 'container',
                                                name: 'materialarmory',
                                                tpl: [
                                                    '<div class="movement consulta">',
                                                        '<div class="movement-title"><b>Rastreabilidade / Movimentação:</b></div>',
                                                        '<div><b style="color: red;">{clientname}</b></div>',
                                                        '<div><b style="color: red;">{surgicalwarning} {patientname}</b></div>',
                                                        '<div><b>Local: </b>{surgicalroom}</div>',
                                                        '<div><b>Procedimento: </b>{surgical}</div>',
                                                        '<div><b>Operador: </b>{closedby} {closeddate}</div>',
                                                        '<div><b>Code: </b>{barcode}#{id}</div>',
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
                                                name: 'materialbox',
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

                                                listeners: {
                                                    select: 'onSelectMaterialFlowStepAction'
                                                },

                                                columns: [
                                                    {
                                                        xtype: 'rownumberer'
                                                    }, {
                                                        width: 120,
                                                        align: 'left',
                                                        sortable: false,
                                                        dataIndex: 'barcode',
                                                        text: 'Código'
                                                    }, {
                                                        flex: 1,
                                                        align: 'left',
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
                                                name: 'flowprocessing',
                                                params: {
                                                    action: 'select',
                                                    method: 'selectByMaterialProcesso'
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
                                                    }, {
                                                        name: 'flowstatus',
                                                        type: 'auto'
                                                    }, {
                                                        name: 'flowstatusdescription',
                                                        type: 'auto'
                                                    }, {
                                                        name: 'stepsettings',
                                                        type: 'auto'
                                                    }, {
                                                        name: 'flowprocessingstepid',
                                                        type: 'int'
                                                    }, {
                                                        name: 'charge',
                                                        type: 'auto'
                                                    }, {
                                                        name: 'chargeflag',
                                                        type: 'auto'
                                                    }, {
                                                        name: 'chargeflagdescription',
                                                        type: 'auto'
                                                    }
                                                ],

                                                columns: [
                                                    {
                                                        flex: 1,
                                                        align: 'left',
                                                        sortable: false,
                                                        dataIndex: 'barcode',
                                                        text: 'Código'
                                                    }, {
                                                        width: 120,
                                                        align: 'center',
                                                        sortable: false,
                                                        dataIndex: 'dateof',
                                                        text: 'Data',
                                                        renderer: function (value) {
                                                            var readValue = Ext.util.Format.date(Ext.Date.parse(value.substring(0, 10),'Y-m-d'),'d/m/Y');
                                                            return (readValue.length != 0) ? readValue: value;
                                                        }
                                                    }, {
                                                        width: 210,
                                                        sortable: false,
                                                        dataIndex: 'flowstatusdescription',
                                                        text: 'Status'
                                                    }, {
                                                        width: 40,
                                                        align: 'center',
                                                        xtype: 'actioncolumn',
                                                        handler: 'printerTagItem',
                                                        getClass: function(value, metaData, record, rowIndex, colIndex, store) {
                                                            var stepsettings = record.get('stepsettings'),
                                                                tagprinter = (stepsettings) ? Ext.decode(stepsettings).tagprinter : "";

                                                            return ((tagprinter.length != 0)&&((rowIndex == 0))) ? "fa fa-tag action-delete-color-font" : "";
                                                        },
                                                        isDisabled: function (view, rowIdx, colIdx, item, rec) {
                                                            var stepsettings = rec.get('stepsettings'),
                                                                tagprinter = (stepsettings) ? Ext.decode(stepsettings).tagprinter : "";
                                                            return ((tagprinter.length == 0)||(rowIdx != 0));
                                                        },
                                                        getTip: function(v, meta, rec) {
                                                            var stepsettings = rec.get('stepsettings'),
                                                                tagprinterdescription = (stepsettings) ? Ext.decode(stepsettings).tagprinterdescription : "";
                                                            return tagprinterdescription;
                                                        }
                                                    }
                                                ]
                                            }
                                        ]
                                    }, {
                                        tabIndex: 3,
                                        title: 'Lotes',
                                        xtype: 'panel',
                                        layout: 'fit',
                                        items: [
                                            {
                                                xtype: 'gridpanel',
                                                cls: 'update-grid',
                                                hideHeaders: false,
                                                headerBorders: false,
                                                name: 'flowprocessinglote',
                                                params: {
                                                    action: 'select',
                                                    method: 'selectByMaterialLote'
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
                                                        name: 'chargedate',
                                                        type: 'auto'
                                                    }, {
                                                        name: 'flowstatus',
                                                        type: 'auto'
                                                    }, {
                                                        name: 'flowstatusdescription',
                                                        type: 'auto'
                                                    }, {
                                                        name: 'stepsettings',
                                                        type: 'auto'
                                                    }, {
                                                        name: 'flowprocessingstepid',
                                                        type: 'int'
                                                    }, {
                                                        name: 'charge',
                                                        type: 'auto'
                                                    }, {
                                                        name: 'chargeflag',
                                                        type: 'auto'
                                                    }, {
                                                        name: 'chargeflagdescription',
                                                        type: 'auto'
                                                    }
                                                ],

                                                columns: [
                                                    {
                                                        flex: 1,
                                                        align: 'left',
                                                        sortable: false,
                                                        dataIndex: 'barcode',
                                                        text: 'Código'
                                                    }, {
                                                        width: 120,
                                                        align: 'center',
                                                        sortable: false,
                                                        dataIndex: 'chargedate',
                                                        text: 'Data',
                                                        renderer: function (value) {
                                                            var readValue = Ext.util.Format.date(Ext.Date.parse(value.substring(0, 10),'Y-m-d'),'d/m/Y');
                                                            return (readValue.length != 0) ? readValue: value;
                                                        }
                                                    }, {
                                                        width: 210,
                                                        sortable: false,
                                                        dataIndex: 'chargeflagdescription',
                                                        text: 'Status'
                                                    }, {
                                                        width: 40,
                                                        align: 'center',
                                                        xtype: 'actioncolumn',
                                                        handler: 'printerTagItem',
                                                        getClass: function(value, metaData, record, rowIndex, colIndex, store) {
                                                            var stepsettings = record.get('stepsettings'),
                                                                tagprinter = (stepsettings) ? Ext.decode(stepsettings).tagprinter : "";

                                                            return ((tagprinter.length != 0)&&((rowIndex == 0))) ? "fa fa-tag action-delete-color-font" : "";
                                                        },
                                                        isDisabled: function (view, rowIdx, colIdx, item, rec) {
                                                            var stepsettings = rec.get('stepsettings'),
                                                                tagprinter = (stepsettings) ? Ext.decode(stepsettings).tagprinter : "";
                                                            return ((tagprinter.length == 0)||(rowIdx != 0));
                                                        },
                                                        getTip: function(v, meta, rec) {
                                                            var stepsettings = rec.get('stepsettings'),
                                                                tagprinterdescription = (stepsettings) ? Ext.decode(stepsettings).tagprinterdescription : "";
                                                            return tagprinterdescription;
                                                        }
                                                    }
                                                ]
                                            }
                                        ]
                                    }, {
                                        tabIndex: 4,
                                        title: 'Movimentos',
                                        xtype: 'panel',
                                        layout: 'fit',
                                        items: [
                                            {
                                                xtype: 'gridpanel',
                                                cls: 'update-grid',
                                                hideHeaders: false,
                                                headerBorders: false,
                                                name: 'flowprocessingmovement',
                                                params: {
                                                    action: 'select',
                                                    method: 'selectByMaterialMovimento'
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
                                                        name: 'movementdate',
                                                        type: 'auto'
                                                    }, {
                                                        name: 'movementtypedescription',
                                                        type: 'auto'
                                                    }, {
                                                        name: 'releasestypedescription',
                                                        type: 'auto'
                                                    }
                                                ],

                                                columns: [
                                                    {
                                                        flex: 1,
                                                        align: 'left',
                                                        sortable: false,
                                                        dataIndex: 'barcode',
                                                        text: 'Código'
                                                    }, {
                                                        flex: 1,
                                                        align: 'left',
                                                        sortable: false,
                                                        dataIndex: 'movementtypedescription',
                                                        text: 'Movimento'
                                                    }, {
                                                        width: 120,
                                                        align: 'center',
                                                        sortable: false,
                                                        dataIndex: 'movementdate',
                                                        text: 'Data',
                                                        renderer: function (value) {
                                                            var readValue = Ext.util.Format.date(Ext.Date.parse(value.substring(0, 10),'Y-m-d'),'d/m/Y');
                                                            return (readValue.length != 0) ? readValue: value;
                                                        }
                                                    }, {
                                                        width: 210,
                                                        sortable: false,
                                                        dataIndex: 'releasestypedescription',
                                                        text: 'Status'
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
                                hideButtons: true,
                                xtype: 'portrait',
                                dockedItems: [
                                    {
                                        height: 150,
                                        dock: 'bottom',
                                        xtype: 'panel',
                                        cls: 'consulta-location',
                                        name: 'materialmessage',
                                        tpl: [
                                            '<div class="movement consulta">',
                                                '<div class="movement-title"><b>Localização:</b></div>',
                                                '<i><b style="color: red; word-wrap: break-word;">{message}</b></i>',
                                            '</div>'
                                        ]
                                    }, {
                                        height: 10,
                                        dock: 'bottom',
                                        xtype: 'container'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    }

});