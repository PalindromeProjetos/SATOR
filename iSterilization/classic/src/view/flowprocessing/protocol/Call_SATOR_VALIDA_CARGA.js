//@charset UTF-8
Ext.define( 'iSterilization.view.flowprocessing.protocol.Call_SATOR_VALIDA_CARGA', {
    extend: 'Ext.window.Window',

    xtype: 'call_SATOR_VALIDA_CARGA',

    requires: [
        'Ext.form.Panel',
        'Smart.plugins.*',
        'Ext.window.Window',
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

    controller: 'flowprocessing',

    initComponent: function () {
        var me = this;
        me.buildItems();
        me.callParent();
    },

    buildItems: function () {
        var me = this;

        me.items = [
            {
                xtype: 'form',
                // plugins:'formenter',
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
                        name: 'equipmentid'
                    }, {
                        xtype: 'hiddenfield',
                        name: 'equipmentcycleid'
                    }, {
                        margin: '20 0 0 0',
                        showClear: true,
                        useUpperCase: true,
                        name: 'equipmentname',
                        fieldLabel: 'Equipamento',
                        //SATOR_VALIDA_CARGA
                        //Equipamento: SATOR-E005 (Termodesinfectora)
                        //Ciclo: SATOR-C006 (Termo instrumental)
                        //Material: C0003669 P201609000001
                        listeners: {
                            specialkey: 'onReaderEquipment',
                            showclear: 'onShowClearEquipment'
                        }
                    }, {
                        showClear: true,
                        useUpperCase: true,
                        useReadColor: true,
                        name: 'cyclename',
                        fieldLabel: 'Ciclo',
                        listeners: {
                            specialkey: 'onReaderCycle',
                            showclear: 'onShowClearCycle'
                        }
                    }, {
                        fieldLabel: 'Consulta',
                        allowBlank: true,
                        useUpperCase: true,
                        useReadColor: true,
                        name: 'materialboxname',
                        listeners: {
                            specialkey: 'onReaderMaterialBoxName'
                        }
                    }, {
                        height: 350,
                        xtype: 'gridpanel',
                        cls: 'update-grid',
                        
                        url: '../iSterilization/business/Calls/Heart/HeartFlowProcessing.php',

                        params: {
                            action: 'select',
                            method: 'selectCycle'
                        },

                        fields: [
                            {
                                name: 'id',
                                type: 'int'
                            }, {
                                name: 'barcode',
                                type: 'auto'
                            }, {
                                name: 'flowprocessingstepid',
                                type: 'int'
                            }, {
                                name: 'materialname',
                                type: 'auto'
                            }
                        ],
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
                                    return 'Remover material da lista!';
                                },
                                getClass: function(v, meta, rec) {
                                    return "fa fa-minus-circle action-delete-color-font";
                                }
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
            name: 'confirm',
            text: 'Confirmar',
            showSmartTheme: 'green',
            listeners: {
                click: 'setValidaCargaLista'
            }
        }, {
            scale: 'medium',
            text: 'Cancelar',
            showSmartTheme: 'red',
            handler: function (btn) {
                btn.windowClose();
            }
        }
    ]

});