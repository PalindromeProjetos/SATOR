//@charset UTF-8
Ext.define( 'iSterilization.view.flowprocessing.protocol.Call_SATOR_LOTE_TRIAGEM', {
    extend: 'Ext.window.Window',

    xtype: 'call_SATOR_LOTE_TRIAGEM',

    requires: [
        'Ext.form.Panel',
        'Smart.plugins.*',
        'Ext.window.Window',
        'iSterilization.store.*',
        'iSterilization.view.flowprocessing.FlowProcessingController'
    ],

    width: 1200,
    modal: true,
    layout: 'fit',
    header: false,
    resizable: false,
    showAnimate: true,

    controller: 'flowprocessing',

    listeners: {
        beforedestroy: function (view , eOpts) {
            var load =  Ext.getCmp('flowprocessingload');
            if (load) {
                load.updateType();
                load.down('textfield[name=search]').focus(false, 200);
            }
        }
    },

    initComponent: function () {
        var me = this;
        me.buildItems();
        me.callParent();
    },

    buildItems: function () {
        var me = this,
            isDisabledBox = function (view, rowIdx, colIdx, item, rec) {
                var find = null,
                    dataflowstep = rec.data.dataflowstep;

                if(dataflowstep && dataflowstep.length != 0) {
                    dataflowstep = Ext.decode(dataflowstep);
                    find = Ext.Array.findBy(dataflowstep,function (item) {
                        if(Smart.workstation.areasid == item.areasid) { return item; }
                    });
                }

                return !( find && find.exceptionby );
            },
            isDisabledMat = function (view, rowIdx, colIdx, item, rec) {
                var find = null,
                    dataflowstep = rec.data.dataflowstep;

                if(dataflowstep && dataflowstep.length != 0) {
                    dataflowstep = Ext.decode(dataflowstep);
                    find = Ext.Array.findBy(dataflowstep,function (item) {
                        if(Smart.workstation.areasid == item.areasid) { return item; }
                    });
                }

                return !(( rec.data.materialboxid == null )&&( find && find.exceptionby ));
            };

        Ext.create('iSterilization.store.flowprocessing.FlowProcessingScreening');
        Ext.create('iSterilization.store.flowprocessing.FlowProcessingScreeningBox');
        Ext.create('iSterilization.store.flowprocessing.FlowProcessingScreeningItem');

        me.items = [
            {
                xtype: 'form',
                bodyPadding: 10,
                layout: 'anchor',
                margin: '10 0 0 0',
                defaults: {
                    anchor: '100%',
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
                                flex: 4,
                                text: 'Triagem de Materiais'
                            }, {
                                flex: 2,
                                name: 'countitems',
                                style : { 'text-align': 'right', 'color': 'rgb(173, 20, 87)' }
                            }, {
                                xtype: 'splitter'
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
                        xtype: 'hiddenfield',
                        name: 'id'
                    }, {
                        height: 20,
                        xtype: 'container'
                    }, {
                        height: 564,
                        xtype: 'container',
                        layout: {
                            type: 'hbox',
                            align: 'stretch'
                        },
                        items: [
                            {
                                flex: 1,
                                xtype: 'gridpanel',
                                cls: 'search-grid',
                                name: 'screeningbox',
                                store: 'flowprocessingscreeningbox',
                                columns: [
                                    {
                                        width: 40,
                                        sortable: false,
                                        renderer: function (value,metaData,record) {
                                            var items = record.get('items'),
                                                loads = record.get('loads'),
                                                chargestatus = (items == loads) ? '001' : '002',
                                                flag = '<div class="unconformities chargestatus{0}"></div>';

                                            return Ext.String.format(flag,chargestatus);
                                        }
                                    }, {
                                        flex: 1,
                                        sortable: false,
                                        dataIndex: 'materialname',
                                        text: 'Kits'
                                    }, {
                                        align: 'right',
                                        sortable: false,
                                        dataIndex: 'score',
                                        width: 80
                                    }, {
                                        width: 180,
                                        sortable: false,
                                        dataIndex: 'colorpallet'
                                    }, {
                                        width: 60,
                                        align: 'center',
                                        xtype: 'actioncolumn',
                                        items: [
                                            {
                                                handler: 'setSelectScreening',
                                                getTip: function(v, meta, rec) {
                                                    return rec.data.materialboxid != null ? 'Editar excessões do fluxo!' : '';
                                                },
                                                getClass: function(v, meta, rec) {
                                                    return rec.data.materialboxid != null ? "fa fa-info-circle action-select-color-font" : '';
                                                },
                                                isDisabled: isDisabledBox
                                            }
                                        ]
                                    }
                                ],
                                listeners: {
                                    rowkeydown: function ( viewTable , record , tr , rowIndex , e , eOpts) {
                                        if ([e.ESC].indexOf(e.getKey()) != -1) {
                                            viewTable.up('window').close();
                                        }
                                    }
                                },
                                dockedItems: [
                                    {
                                        fieldCls: 'smart-field-style-action',
                                        labelCls: 'smart-field-style-action',
                                        fieldLabel: 'Consulta',
                                        xtype: 'textfield',
                                        useUpperCase: true,
                                        name: 'materialboxname',
                                        listeners: {
                                            specialkey: 'onReaderMaterialTriagem'
                                        }
                                    }
                                ]
                            }, {
                                xtype: 'splitter'
                            }, {
                                flex: 1,
                                xtype: 'gridpanel',
                                cls: 'search-grid',

                                hideHeaders: false,
                                headerBorders: false,
                                store: 'flowprocessingscreeningitem',

                                columns: [
                                    {
                                        flex: 1,
                                        sortable: false,
                                        dataIndex: 'materialname',
                                        text: 'Material / origem',
                                        renderer: function (value,metaData,record) {
                                            var clientname = record.get('clientname'),
                                                materialname = record.get('materialname'),
                                                tpl =   '<div style="float: left; line-height: 17px;">' +
                                                            '<div>{0}</div>' +
                                                            '<div>{1}</div>' +
                                                        '</div>';

                                            return Ext.String.format(tpl,materialname,clientname);
                                        }
                                    }, {
                                        width: 180,
                                        text: 'Schema',
                                        sortable: false,
                                        dataIndex: 'colorpallet'
                                    }, {
                                        width: 100,
                                        text: 'Ações',
                                        align: 'center',
                                        xtype: 'actioncolumn',
                                        items: [
                                            {
                                                handler: 'setSelectScreening',
                                                getTip: function(v, meta, rec) {
                                                    return rec.data.materialboxid == null ? 'Editar excessões do fluxo!' : '';
                                                },
                                                getClass: function(v, meta, rec) {
                                                    return rec.data.materialboxid == null ? "fa fa-info-circle action-select-color-font" : '';
                                                },
                                                isDisabled: isDisabledMat
                                            }, {
                                                xtype: 'splitter'
                                            }, {
                                                handler: 'setDeleteScreening',
                                                iconCls: "fa fa-minus-circle action-delete-color-font",
                                                tooltip: 'Remover material da triagem!'
                                            }
                                        ]
                                    }
                                ],
                                listeners: {
                                    rowkeydown: function ( viewTable , record , tr , rowIndex , e , eOpts) {
                                        if ([e.ESC].indexOf(e.getKey()) != -1) {
                                            viewTable.up('window').close();
                                        }
                                    }
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    }

});