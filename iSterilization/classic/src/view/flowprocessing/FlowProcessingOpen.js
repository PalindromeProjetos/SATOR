//@charset UTF-8
Ext.define( 'iSterilization.view.flowprocessing.FlowProcessingOpen', {
    extend: 'Ext.window.Window',

    xtype: 'flowprocessingopen',

    requires: [
        'Ext.form.Panel',
        'Smart.plugins.*',
        'Ext.window.Window',
        'Ext.form.field.Checkbox',
        'iAdmin.view.helper.place.PlaceSearch',
        'iAdmin.view.person.client.ClientSearch',
        'iAdmin.view.helper.flowing.FlowingSearch',
        'iSterilization.view.flowprocessing.SearchPatient',
        'iSterilization.view.flowprocessing.SearchMaterial',
        'iAdmin.view.helper.instrumentator.InstrumentatorSearch',
        'iSterilization.view.flowprocessing.SearchSterilizationType'
    ],

    width: 850,
    modal: true,
    header: false,
    resizable: false,
    showAnimate: true,
    layout: 'fit',
    controller: 'flowprocessing',
    cls: 'panel-frame',
    iconCls: "fa fa-file-archive-o",

    title: 'Iniciar Nova Leitura',

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
                bodyPadding: 10,
                margin: '10 0 0 0',
                layout: 'anchor',
                plugins:'formenter',
                defaultType: 'textfield',
                defaults: {
                    anchor: '100%',
                    hideTrigger: true,
                    allowBlank: false,
                    fieldCls: 'smart-field-style-action'
                },
                items: [
                    {
                        xtype: 'hiddenfield',
                        name: 'areasid'
                    }, {
                        xtype: 'hiddenfield',
                        name: 'clienttype'
                    }, {
                        xtype: 'hiddenfield',
                        name: 'prioritylevel'
                    }, {
                        xtype: 'hiddenfield',
                        name: 'materialboxid'
                    }, {
                        allowBlank: true,
                        xtype: 'hiddenfield',
                        name: 'healthinsurance'
                    }, {
                        xtype: 'hiddenfield',
                        name: 'version'
                    }, {
                        xtype: 'label',
                        cls: 'title-label',
                        text: 'Iniciar Nova Leitura'
                    }, {
                        margin: '10 0 10 0',
                        xtype: 'fieldcontainer',
                        layout: 'anchor',
                        labelCls: 'sub-title-label',
                        fieldLabel: 'Identificação',
                        items: [
                            {
                                xtype: 'container',
                                layout: 'hbox',
                                defaultType: 'textfield',
                                defaults: {
                                    flex: 1,
                                    hideTrigger: true,
                                    allowBlank: false,
                                    fieldCls: 'smart-field-style-action'
                                },
                                items: [
                                    {
                                        margin: '0 5 0 0',
                                        name: 'areasname',
                                        useReadColor: true,
                                        fieldLabel: 'Estação (área CME)'
                                    }, {
                                        margin: '0 0 0 5',
                                        name: 'username',
                                        useReadColor: true,
                                        fieldLabel: 'Usuário (operador)'
                                    }
                                ]
                            }
                        ]
                    }, {
                        xtype: 'fieldcontainer',
                        layout: 'hbox',
                        labelCls: 'sub-title-label',
                        fieldLabel: 'Leitura',
                        defaultType: 'textfield',
                        defaults: {
                            flex: 1,
                            allowBlank: false,
                            hideTrigger: true,
                            fieldCls: 'smart-field-style-action'
                        },
                        items: [
                            {
                                margin: '0 5 0 0',
                                fieldLabel: 'Material',
                                xtype: 'searchmaterial',
                                hiddenNameId: 'materialid',
                                name: 'materialname',
                                readerBarCode: true,
                                listeners: {
                                    select: 'onSelectMaterial',
                                    nextfield: 'nextFieldMaterial',
                                    showclear: 'showClearMaterial',
                                    beforedeselect: 'showClearMaterial'
                                }
                            }, {
                                margin: '0 0 0 5',
                                useReadColor: true,
                                fieldLabel: 'Fluxo e prioridade',
                                hiddenNameId: 'sterilizationtypeid',
                                xtype: 'searchsterilizationtype',
                                name: 'sterilizationtypename',
                                listeners: {
                                    select: 'onSelectSterilization',
                                    beforequery: 'onBeforeQuerySterilization'
                                }
                            }
                        ]
                    }, {
                        xtype: 'fieldcontainer',
                        layout: 'hbox',
                        defaultType: 'textfield',
                        defaults: {
                            flex: 1,
                            hideTrigger: true,
                            allowBlank: false,
                            fieldCls: 'smart-field-style-action'
                        },
                        items: [
                            {
                                pageSize: 0,
                                margin: '0 5 0 0',
                                fieldLabel: 'Origem (cliente)',
                                xtype: 'clientsearch',
                                name: 'clientname',
                                hiddenNameId: 'clientid',
                                listeners: {
                                    select: 'onSelectClient',
                                    showclear: 'showClearClient',
                                    beforedeselect: 'showClearClient'
                                }
                            }, {
                                pageSize: 10,
                                allowBlank: true,
                                hideTrigger: true,
                                useReadColor: true,
                                fieldLabel: 'Aviso Cirurgia',
                                name: 'patientname',
                                xtype: 'searchpatient',
                                hiddenNameId: 'surgicalwarning',
                                listeners: {
                                    select: 'onSelectPatient'
                                }
                                // allowBlank: true,
                                // useReadColor: true,
                                // margin: '0 0 0 5',
                                // fieldLabel: 'Local (sala)',
                                // xtype: 'placesearch',
                                // name: 'placename',
                                // hiddenNameId: 'placeid'
                            }
                        ]
                    // }, {
                    //     hidden: true,
                    //     disabled: true,
                    //     name: 'localization',
                    //     xtype: 'fieldcontainer',
                    //     layout: 'anchor',
                    //     labelCls: 'sub-title-label',
                    //     fieldLabel: 'Cirurgia',
                    //     defaultType: 'textfield',
                    //     defaults: {
                    //         anchor: '100%',
                    //         allowBlank: false,
                    //         fieldCls: 'smart-field-style-action'
                    //     },
                    //     items: [
                    //         {
                    //             xtype: 'container',
                    //             layout: 'hbox',
                    //             defaultType: 'textfield',
                    //             defaults: {
                    //                 flex: 1,
                    //                 hideTrigger: true,
                    //                 allowBlank: false,
                    //                 fieldCls: 'smart-field-style-action'
                    //             },
                    //             items: [
                    //                 {
                    //                     margin: '0 5 0 0',
                    //                     fieldLabel: 'Circulante',
                    //                     xtype: 'flowingsearch',
                    //                     name: 'flowingname',
                    //                     hiddenNameId: 'flowingid'
                    //                 }, {
                    //                     margin: '0 0 0 5',
                    //                     fieldLabel: 'Instrumentador',
                    //                     xtype: 'instrumentatorsearch',
                    //                     name: 'instrumentatorname',
                    //                     hiddenNameId: 'instrumentatorid'
                    //                 }
                    //             ]
                    //         }, {
                    //             pageSize: 10,
                    //             hideTrigger: true,
                    //             fieldLabel: 'Paciente',
                    //             name: 'patientname',
                    //             xtype: 'searchpatient',
                    //             hiddenNameId: 'surgicalwarning',
                    //             listeners: {
                    //                 select: 'onSelectPatient'
                    //             }
                    //         }
                    //     ]
                    }
                ]
            }
        ]
    },

    buttonAlign: 'center',

    buttons: [
        {
            scale: 'medium',
            text: 'Confirmar',
            showSmartTheme: 'blue',
            listeners: {
                click: 'insertFlow'
            }
        }, {
            scale: 'medium',
            text: 'Fechar',
            showSmartTheme: 'red',
            handler: function (btn) {
                btn.windowClose();
            }
        }
    ]

});