//@charset UTF-8
Ext.define( 'iSterilization.view.flowprocessing.FlowProcessingWoof', {
    extend: 'Ext.window.Window',

    xtype: 'flowprocessingwoof',

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

    width: 600,
    modal: true,
    header: false,
    resizable: false,
    showAnimate: true,
    layout: 'fit',
    controller: 'flowprocessing',
    cls: 'panel-frame',
    iconCls: "fa fa-file-archive-o",

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
                        name: 'prioritylevel'
                    }, {
                        xtype: 'hiddenfield',
                        name: 'version'
                    }, {
                        xtype: 'hiddenfield',
                        name: 'dataflowstep'
                    }, {
                        xtype: 'container',
                        layout: 'hbox',
                        defaultType: 'label',
                        defaults: {
                            cls: 'title-label'
                        },
                        items: [
                            {
                                flex: 4,
                                text: 'Iniciar Novo Kit (tecidos)'
                            }, {
                                flex: 1,
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
                        margin: '10 0 10 0',
                        xtype: 'fieldcontainer',
                        layout: 'hbox',
                        labelCls: 'sub-title-label',
                        fieldLabel: 'Identificação',
                        defaultType: 'textfield',
                        defaults: {
                            flex: 1,
                            hideTrigger: true,
                            allowBlank: false,
                            useReadColor: true,
                            fieldCls: 'smart-field-style-action'
                        },
                        items: [
                            {
                                margin: '0 5 0 0',
                                name: 'areasname',
                                fieldLabel: 'Estação (área CME)'
                            }, {
                                margin: '0 0 0 5',
                                name: 'username',
                                fieldLabel: 'Usuário (operador)'
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
                            useReadColor: false,
                            fieldCls: 'smart-field-style-action'
                        },
                        items: [
                            {
                                margin: '0 5 0 0',
                                fieldLabel: 'Fluxo e prioridade',
                                hiddenNameId: 'sterilizationtypeid',
                                xtype: 'searchsterilizationtype',
                                name: 'sterilizationtypename',
                                listeners: {
                                    select: 'onSelectSterilization',
                                    beforequery: 'onBeforeQuerySterilization'
                                }
                            }, {
                                pageSize: 0,
                                margin: '0 0 0 5',
                                fieldLabel: 'Origem (cliente)',
                                xtype: 'clientsearch',
                                name: 'clientname',
                                hiddenNameId: 'clientid',
                                listeners: {
                                    select: 'onSelectClient',
                                    showclear: 'showClearClient',
                                    beforedeselect: 'showClearClient'
                                }
                            }
                        ]
                    }, {
                        margin: '0 0 20 0',
                        xtype: 'fieldcontainer',
                        layout: 'hbox',
                        labelCls: 'sub-title-label',
                        fieldLabel: 'Leitura',
                        defaultType: 'textfield',
                        defaults: {
                            flex: 1,
                            allowBlank: false,
                            hideTrigger: true,
                            useReadColor: false,
                            fieldCls: 'smart-field-style-action'
                        },
                        items: [
                            {
                                margin: '0 5 0 0',
                                fieldLabel: 'Consulta',
                                xtype: 'textfield',
                                useUpperCase: true,
                                name: 'materialboxname',
                                listeners: {
                                    specialkey: 'onReaderMaterialBoxCarga'
                                }
                            }, {
                                pageSize: 0,
                                margin: '0 0 0 5',
                                fieldLabel: 'Kit'
                            }
                        ]
                    }, {
                        xtype: 'gridpanel',
                        height: 300,
                        store: Ext.create('Ext.data.Store', {
                            fields:[ 'name', 'email', 'phone'],
                            data: [
                                { name: 'Lisa', email: 'lisa@simpsons.com', phone: '555-111-1224' },
                                { name: 'Bart', email: 'bart@simpsons.com', phone: '555-222-1234' },
                                { name: 'Homer', email: 'homer@simpsons.com', phone: '555-222-1244' },
                                { name: 'Marge', email: 'marge@simpsons.com', phone: '555-222-1254' }
                            ]
                        }),
                        columns: [
                            { text: 'Name', dataIndex: 'name' },
                            { text: 'Email', dataIndex: 'email', flex: 1 },
                            { text: 'Phone', dataIndex: 'phone' }
                        ]
                    }
                ]
            }
        ]
    }

    // buttonAlign: 'center',
    //
    // buttons: [
    //     {
    //         scale: 'medium',
    //         text: 'Confirmar',
    //         showSmartTheme: 'blue',
    //         listeners: {
    //             click: 'insertFlow'
    //         }
    //     }, {
    //         scale: 'medium',
    //         text: 'Fechar',
    //         showSmartTheme: 'red',
    //         handler: function (btn) {
    //             btn.windowClose();
    //         }
    //     }
    // ]

});