//@charset UTF-8
Ext.define( 'iSterilization.view.flowprocessing.protocol.Call_SATOR_LOTE_CICLO_FINAL', {
    extend: 'Ext.window.Window',

    xtype: 'call_SATOR_LOTE_CICLO_FINAL',

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
                                text: 'Ciclo de Equipamento/Final'
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
                        xtype: 'container',
                        layout: 'hbox',
                        defaultType: 'textfield',
                        defaults: {
                            anchor: '100%',
                            useReadColor: true,
                            fieldCls: 'smart-field-style-action'
                        },
                        items: [
                            {
                                flex: 1,
                                fieldLabel: 'Consulta',
                                showClear: true,
                                useUpperCase: true,
                                inputType: 'password',
                                useReadColor: me.editable,
                                name: 'materialboxname',
                                listeners: {
                                    specialkey: 'onReaderMaterialBoxFinal'
                                }
                            }, {
                                xtype: 'splitter'
                            }, {
                                width: 160,
                                fieldLabel: 'Leituras',
                                name: 'countitems',
                                listeners: {
                                    afterrender: function (field) {
                                        field.inputEl.setStyle('text-align', 'right');
                                    }
                                }
                            }
                        ]
                    }, {
                        height: 550,
                        xtype: 'gridpanel',
                        cls: 'update-grid',
                        hideHeaders: false,
                        headerBorders: false,
                        store: 'flowprocessingchargeitem',

                        columns: [
                            {
                                width: 40,
                                sortable: false,
                                renderer: function (value,metaData,record) {
                                    var chargestatus = record.get('chargestatus'),
                                        flag = '<div class="unconformities chargestatus{0}"></div>';

                                    return Ext.String.format(flag,chargestatus);
                                }
                            }, {
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