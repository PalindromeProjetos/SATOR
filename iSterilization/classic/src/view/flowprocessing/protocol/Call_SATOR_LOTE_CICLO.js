//@charset UTF-8
Ext.define( 'iSterilization.view.flowprocessing.protocol.Call_SATOR_LOTE_CICLO', {
    extend: 'Ext.window.Window',

    xtype: 'call_SATOR_LOTE_CICLO',

    requires: [
        'Ext.data.Store',
        'Ext.grid.Panel',
        'Ext.form.Panel',
        'Smart.plugins.*',
        'Ext.window.Window',
        'iSterilization.store.*',
        'iSterilization.store.flowprocessing.FlowProcessingCharge',
        'iSterilization.store.flowprocessing.FlowProcessingChargeItem',
        'iSterilization.view.flowprocessing.SearchCycle',
        'iSterilization.view.flowprocessing.SearchEquipment',
        'iSterilization.view.flowprocessing.FlowProcessingController'
    ],

    width: 650,
    modal: true,
    layout: 'fit',
    header: false,
    resizable: false,
    showAnimate: true,

    editable: true,

    controller: 'flowprocessing',

    listeners: {
        beforedestroy: function (view , eOpts) {
            var step =  Ext.getCmp('flowprocessingstep');
            if(step) {
                step.updateType();
                step.down('textfield[name=search]').focus(false,200);
            }
        }
    },

    initComponent: function () {
        var me = this;
        me.buildItems();
        me.callParent();
    },

    buildItems: function () {
        var me = this;

        Ext.create('iSterilization.store.flowprocessing.FlowProcessingCharge');
        Ext.create('iSterilization.store.flowprocessing.FlowProcessingChargeItem');

        me.items = [
            {
                xtype: 'form',
                bodyPadding: 10,
                layout: 'anchor',
                margin: '10 0 0 0',
                defaultType: 'textfield',
                defaults: {
                    anchor: '100%',
                    allowBlank: false,
                    useUpperCase: true,
                    useReadColor: true,
                    fieldCls: 'smart-field-style-action'
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
                                text: 'Ciclo de Equipamento'
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
                        xtype: 'hiddenfield',
                        name: 'equipmentid'
                    }, {
                        xtype: 'hiddenfield',
                        name: 'temperature'
                    }, {
                        xtype: 'hiddenfield',
                        name: 'duration'
                    }, {
                        xtype: 'hiddenfield',
                        name: 'timetoopen'
                    }, {
                        xtype: 'hiddenfield',
                        name: 'equipmentcycleid'
                    }, {
                        style: 'margin-top: 20px',
                        xtype: 'fieldcontainer',
                        layout: 'hbox',
                        defaults: {
                            flex: 1,
                            fieldCls: 'smart-field-style-action'
                        },
                        items: [
                            {
                                fieldLabel: 'Equipamento',
                                name: 'equipmentname',
                                xtype: 'displayfield'
                            }, {
                                fieldLabel: 'Ciclo',
                                name: 'cyclename',
                                xtype: 'displayfield'
                            }
                        ]
                    }, {
                        fieldLabel: 'Consulta',
                        showClear: true,
                        allowBlank: true,
                        useUpperCase: true,
                        useReadColor: me.editable,
                        name: 'materialboxname',
                        listeners: {
                            specialkey: 'onReaderMaterialBoxCiclo'
                        }
                    }, {
                        height: 350,
                        xtype: 'gridpanel',
                        cls: 'update-grid',
                        hideHeaders: false,
                        headerBorders: false,
                        store: 'flowprocessingchargeitem',

                        columns: [
                            {
                                sortable: false,
                                text: 'Material / kit',
                                dataIndex: 'materialname',
                                flex: 1
                            }, {
                                sortable: false,
                                text: 'Itens',
                                dataIndex: 'countitems',
                                width: 60
                            }, {
                                sortable: false,
                                text: 'Código',
                                dataIndex: 'barcode',
                                width: 160
                            }, {
                                width: 40,
                                align: 'center',
                                sortable: false,
                                dataIndex: 'haspending',
                                xtype: 'actioncolumn',
                                handler: 'setDeleteChargeItem',
                                getTip: function(v, meta, rec) {
                                    return 'Remover processo da lista!';
                                },
                                getClass: function(v, meta, rec) {
                                    return "fa fa-minus-circle action-delete-color-font";
                                }
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