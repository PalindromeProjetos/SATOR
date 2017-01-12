//@charset UTF-8
Ext.define( 'iSterilization.view.flowprocessing.FlowProcessingPick', {
    extend: 'Ext.form.Panel',

    xtype: 'flowprocessingpick',

    requires: [
        'Smart.util.Message',
        'Smart.util.IonSound',
        'iSterilization.store.flowprocessing.*',
        'iSterilization.view.flowprocessing.protocol.*',
        'iSterilization.view.flowprocessing.FlowProcessingController'
    ],

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    // defaults: {
    //     width: '100%'
    // },

    controller: 'flowprocessing',
    bodyCls: 'load-processing',

    bodyStyle: 'padding: 10px',

    margin: '10 0 0 0',

    defaults: {
        anchor: '100%',
        fieldCls: 'smart-field-style-action',
        labelCls: 'smart-field-style-action'
    },

    listeners: {
        afterrender: 'onAfterRenderPick'
        // startreader: 'onStartReaderView'
    },

    initComponent: function () {
        var me = this;

        me.buildItems();
        me.callParent();
    },

    buildItems: function () {
        var me = this,
            isDisabledBox = function (view, rowIdx, colIdx, item, rec) {
                var hasexception = rec.data.hasexception;

                return !(hasexception && hasexception.length != 0);
            },
            isDisabledMat = function (view, rowIdx, colIdx, item, rec) {
                var hasexception = rec.data.hasexception,
                    materialboxid = rec.data.materialboxid;

                return !(( hasexception && hasexception.length != 0 )&&( materialboxid == null ));
            };

        Ext.create('iSterilization.store.flowprocessing.FlowProcessingScreening');
        Ext.create('iSterilization.store.flowprocessing.FlowProcessingScreeningBox');
        Ext.create('iSterilization.store.flowprocessing.FlowProcessingScreeningItem');

        me.items = [
            {
                xtype: 'container',
                layout: 'hbox',
                defaultType: 'label',
                defaults: {
                    cls: 'title-label',
                    style : { 'text-align': 'right', 'font-weight': '700', 'color': 'rgb(173, 20, 87)' }
                },
                items: [
                    {
                        flex: 4,
                        text: 'Triagem de Materiais',
                        style : { 'text-align': 'left', 'font-weight': '700' }
                    }, {
                        flex: 2,
                        name: 'countitems'
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
                                c.getEl().on({ click: function () { history.back(); } });
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
                flex: 1,
                xtype: 'container',
                layout: {
                    type: 'hbox',
                    align: 'stretch'
                },
                items: [
                    {
                        flex: 1,
                        xtype: 'gridpanel',
                        cls: 'search-grid pick',
                        name: 'screeningbox',
                        hideHeaders: false,
                        headerBorders: false,
                        store: 'flowprocessingscreeningbox',
                        columns: [
                            {
                                flex: 1,
                                sortable: false,
                                dataIndex: 'materialname',
                                text: 'Kit',
                                renderer: function (value,metaData,record) {
                                    var sterilizationtypename = record.get('sterilizationtypename'),
                                        materialname = record.get('materialname'),
                                        tpl =   '<div style="float: left; line-height: 17px;">' +
                                                    '<div>{0}</div>' +
                                                    '<div>{1}</div>' +
                                                '</div>';

                                    return Ext.String.format(tpl,materialname,sterilizationtypename);
                                }
                            }, {
                                text: 'Score',
                                align: 'right',
                                sortable: false,
                                dataIndex: 'score',
                                width: 80
                            }, {
                                width: 220,
                                sortable: false,
                                text: 'Schema',
                                dataIndex: 'colorpallet'
                            }, {
                                width: 140,
                                text: 'Ações',
                                align: 'center',
                                xtype: 'actioncolumn',
                                items: [
                                    {
                                    //    handler: 'getSelectScreening',
                                    //    getTip: function(v, meta, rec) {
                                    //        return 'Editar origem do material!';
                                    //    },
                                    //    getClass: function(v, meta, rec) {
                                    //        return "fa fa-gratipay action-refresh-color-font";
                                    //    }
                                    //}, {
                                    //    xtype: 'splitter'
                                    //}, {
                                        handler: 'getSelectScreening',
                                        getTip: function(v, meta, rec) {
                                            return rec.data.materialboxid != null ? 'Editar exceções do fluxo!' : '';
                                        },
                                        getClass: function(v, meta, rec) {
                                            return rec.data.materialboxid != null ? "fa fa-info-circle action-select-color-font" : '';
                                        },
                                        isDisabled: isDisabledBox
                                    }, {
                                        xtype: 'splitter'
                                    }, {
                                        handler: 'setUpdateScreening',
                                        tooltip: 'Listar itens do Kit!',
                                        getClass: function(v, meta, rec) {
                                            var items = rec.data.items,
                                                loads = rec.data.loads;

                                            return (items == loads) ? "fa fa-check-circle action-insert-color-font" : "fa fa-circle action-checked-color-font";
                                        }
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
                                margin: '0 0 10 0',
                                cls: 'processing-field',
                                labelCls: 'processing-field-font',
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
                        cls: 'search-grid pick',

                        hideHeaders: false,
                        headerBorders: false,
                        store: 'flowprocessingscreeningitem',

                        columns: [
                            {
                                flex: 1,
                                sortable: false,
                                dataIndex: 'materialname',
                                text: 'Material',
                                renderer: function (value,metaData,record) {
                                    var barcode = record.get('barcode'),
                                        sterilizationtypename = record.get('sterilizationtypename'),
                                        materialname = record.get('materialname'),
                                        tpl =   '<div style="float: left; line-height: 17px;">' +
                                                    '<div>{0}</div>' +
                                                    '<div>{1}</div>' +
                                                '</div>';

                                    return Ext.String.format(tpl,materialname,sterilizationtypename||barcode);
                                }
                            }, {
                                width: 220,
                                text: 'Schema',
                                sortable: false,
                                dataIndex: 'colorpallet'
                            }, {
                                width: 140,
                                text: 'Ações',
                                align: 'center',
                                xtype: 'actioncolumn',
                                items: [
                                    {
                                    //    getTip: function(v, meta, rec) {
                                    //        return rec.data.materialboxid == null ? 'Editar origem do material!' : '';
                                    //    },
                                    //    getClass: function(v, meta, rec) {
                                    //        return rec.data.materialboxid == null ? "fa fa-gratipay action-refresh-color-font" : '';
                                    //    },
                                    //    isDisabled: isDisabledMat
                                    //}, {
                                    //    xtype: 'splitter'
                                    //}, {
                                        handler: 'getSelectScreening',
                                        getTip: function(v, meta, rec) {
                                            return rec.data.materialboxid == null ? 'Editar exceções do fluxo!' : '';
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

});