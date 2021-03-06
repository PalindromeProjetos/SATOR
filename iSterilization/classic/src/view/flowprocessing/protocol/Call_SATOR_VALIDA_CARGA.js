//@charset UTF-8
Ext.define( 'iSterilization.view.flowprocessing.protocol.Call_SATOR_VALIDA_CARGA', {
    extend: 'Ext.window.Window',

    xtype: 'call_SATOR_VALIDA_CARGA',

    requires: [
        'Ext.form.Panel',
        'Smart.plugins.*',
        'Ext.window.Window',
        'iSterilization.store.*',
        'iSterilization.view.flowprocessing.SearchCycle',
        'iSterilization.view.flowprocessing.SearchEquipment',
        'iSterilization.view.flowprocessing.FlowProcessingController'
    ],

    width: 450,
    modal: true,
    layout: 'fit',
    header: false,
    resizable: false,
    showAnimate: true,

    editable: true,

    controller: 'flowprocessing',

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
                plugins:'formenter',
                bodyPadding: 10,
                layout: 'anchor',
                margin: '10 0 0 0',
                defaultType: 'textfield',
                defaults: {
                    anchor: '100%',
                    showClear: true,
                    allowBlank: false,
                    fieldCls: 'smart-field-style-action'
                    // labelCls: 'smart-field-style-action'
                },
                items: [
                    {
                        xtype: 'label',
                        cls: 'title-label',
                        text: 'Validar Carga'
                    }, {
                        allowBlank: true,
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
                        fieldLabel: 'Equipamento',
                        useUpperCase: true,
                        useReadColor: me.editable,
                        name: 'equipmentname',
                        listeners: {
                            specialkey: 'onReaderEquipment',
                            showclear: 'onShowClearEquipment'
                        }
                    }, {
                        fieldLabel: 'Ciclo',
                        useUpperCase: true,
                        useReadColor: me.editable,
                        name: 'cyclename',
                        listeners: {
                            specialkey: 'onReaderCycle',
                            showclear: 'onShowClearCycle'
                        }
                    }, {
                        fieldLabel: 'Consulta',
                        allowBlank: true,
                        useUpperCase: true,
                        useReadColor: me.editable,
                        name: 'materialboxname',
                        listeners: {
                            specialkey: 'onReaderMaterialBoxName'
                        }
                    }, {
                        height: 350,
                        xtype: 'gridpanel',
                        cls: 'update-grid',

                        store: 'flowprocessingchargeitem',

                        columns: [
                            {
                                dataIndex: 'materialname',
                                flex: 1
                            }, {
                                width: 60,
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