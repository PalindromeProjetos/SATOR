//@charset UTF-8
Ext.define( 'iSterilization.view.flowprocessing.protocol.Call_SATOR_MOVIMENTO_TO', {
    extend: 'Ext.window.Window',

    xtype: 'call_SATOR_MOVIMENTO_TO',

    requires: [
        'Ext.form.Panel',
        'Smart.plugins.*',
        'Ext.window.Window',
        'Ext.grid.column.*',
        'Smart.plugins.TextMask',
        'Smart.form.field.ComboEnum',
        'Ext.grid.plugin.CellEditing',
        'iAdmin.view.person.client.ClientSearch',
        'iSterilization.view.flowprocessing.SearchPatient',
        'iSterilization.view.flowprocessing.FlowProcessingController'
    ],

    width: 650,
    modal: true,
    header: false,
    resizable: false,
    showAnimate: true,
    layout: 'fit',
    controller: 'flowprocessing',
    cls: 'panel-frame',
    iconCls: "fa fa-file-archive-o",

    title: 'Movimento',

    editable: true,

    doCallBack: Ext.emptyFn,

    listeners: {
        queryreader: 'onArmoryOfQuery'
    },

    initComponent: function () {
        var me = this;
        me.buildItems();
        me.callParent();
    },

    onSelectClient: function (combo,record,eOpts) {
        var me = combo.up('window'),
            dateof = me.down('datefield'),
            timeof = me.down('timefield'),
            clienttype = record.get('clienttype'),
            searchpatient = me.down('searchpatient');

        dateof.reset();
        timeof.reset();

        me.showSurgical(false);

        me.down('fieldcontainer[name=group_01]').hide();
        me.down('fieldcontainer[name=group_02]').hide();
        me.down('fieldcontainer[name=group_03]').hide();

        if (clienttype == '004') {
            me.down('fieldcontainer[name=group_01]').show();
            me.down('fieldcontainer[name=group_02]').show();
            me.showSurgical(true);
            searchpatient.focus(false,200);
        }

        if (clienttype != '004') {
            dateof.focus(false,200);
        }

        me.updPosition();
    },

    showSurgical: function (value) {
        var me = this,
            searchpatient = me.down('searchpatient'),
            flowing = me.down('textfield[name=flowing]'),
            surgical = me.down('textfield[name=surgical]'),
            surgicalroom = me.down('textfield[name=surgicalroom]'),
            instrumentator = me.down('textfield[name=instrumentator]'),
            surgicalstatus = me.down('hiddenfield[name=surgicalstatus]'),
            surgicaltype = me.down('hiddenfield[name=surgicaltype]');

        surgicaltype.reset();
        surgicalstatus.reset();

        flowing.reset();
        flowing.setReadColor(!value);

        surgical.reset();
        surgical.setReadColor(!value);

        surgicalroom.reset();
        surgicalroom.setDisabled(!value);
        surgicalroom.setReadColor(!value);

        searchpatient.reset();
        searchpatient.setReadColor(!value);

        instrumentator.reset();
        instrumentator.setReadColor(!value);
    },

    showClearClient: function (field, eOpts) {
        var me = field.up('window'),
            dateof = me.down('datefield'),
            timeof = me.down('timefield'),
            surgical = me.down('textfield[name=surgical]'),
            patientname = me.down('hiddenfield[name=patientname]'),
            surgicalroom = me.down('textfield[name=surgicalroom]'),
            instrumentator = me.down('textfield[name=instrumentator]'),
            surgicalstatus = me.down('hiddenfield[name=surgicalstatus]'),
            surgicaltype = me.down('hiddenfield[name=surgicaltype]');

        dateof.reset();
        timeof.reset();
        surgical.reset();
        patientname.reset();
        surgicaltype.reset();
        surgicalroom.reset();
        surgicalstatus.reset();
        instrumentator.reset();

        me.showSurgical(false);

        me.down('fieldcontainer[name=group_01]').hide();
        me.down('fieldcontainer[name=group_02]').hide();

        me.updPosition();
    },

    showClearPatiente: function (field, eOpts) {
        var me = field.up('window'),
            dateof = me.down('datefield'),
            timeof = me.down('timefield'),
            surgical = me.down('textfield[name=surgical]'),
            surgicalroom = me.down('textfield[name=surgicalroom]'),
            instrumentator = me.down('textfield[name=instrumentator]'),
            surgicalstatus = me.down('hiddenfield[name=surgicalstatus]'),
            surgicaltype = me.down('hiddenfield[name=surgicaltype]');

        dateof.reset();
        timeof.reset();
        surgical.reset();
        surgicaltype.reset();
        surgicalroom.reset();
        surgicalstatus.reset();
        instrumentator.reset();
    },

    buildItems: function () {
        var me = this;

        Ext.create('iSterilization.store.armory.ArmoryMovementOutput');
        
        me.items = [
            {
                xtype: 'form',
                bodyPadding: 10,
                margin: '10 0 0 0',
                layout: 'anchor',
                // plugins:'formenter',
                defaults: {
                    anchor: '100%',
                    allowBlank: false,
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
                                text: 'Movimento'
                            }, {
                                flex: 2,
                                name: 'countitems',
                                style : { 'text-align': 'right', 'color': 'rgb(173, 20, 87)' }
                            }
                        ]
                    }, {
                        margin: '10 0 10 0',
                        xtype: 'fieldcontainer',
                        layout: 'hbox',
                        fieldLabel: 'Documento',
                        defaultType: 'textfield',
                        defaults: {
                            useReadColor: true,
                            fieldCls: 'smart-field-style-action'
                        },
                        items: [
                            {
                                xtype: 'hiddenfield',
                                name: 'id'
                            }, {
                                xtype: 'hiddenfield',
                                name: 'surgicalstatus'
                            }, {
                                xtype: 'hiddenfield',
                                name: 'surgicaltype'
                            }, {
                                xtype: 'hiddenfield',
                                name: 'areasid'
                            }, {
                                xtype: 'hiddenfield',
                                name: 'patientname'
                            }, {
                                flex: 1,
                                name: 'areasname'
                            }, {
                                xtype: 'splitter'
                            }, {
                                flex: 1,
                                xtype: 'comboenum',
                                name: 'movementtypedescription',
                                hiddenNameId: 'movementtype'
                            }
                        ]
                    }, {
                        xtype: 'container',
                        layout: 'hbox',
                        defaultType: 'textfield',
                        defaults: {
                            useReadColor: true,
                            fieldCls: 'smart-field-style-action'
                        },
                        items: [
                            {
                                flex: 1,
                                name: 'movementuser'
                            }, {
                                xtype: 'splitter'
                            }, {
                                flex: 1,
                                xtype: 'comboenum',
                                name: 'releasestypedescription',
                                hiddenNameId: 'releasestype'
                            }
                        ]
                    }, {
                        margin: '10 0 10 0',
                        xtype: 'fieldcontainer',
                        layout: 'hbox',
                        fieldLabel: 'Destino',
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
                                focusable: true,
                                fieldLabel: 'Cliente',
                                xtype: 'clientsearch',
                                name: 'clientname',
                                hiddenNameId: 'clientid',
                                listeners: {
                                    select: me.onSelectClient,
                                    showclear: me.showClearClient
                                }
                            }
                        ]
                    }, {
                        hidden: true,
                        name: 'group_01',
                        xtype: 'fieldcontainer',
                        layout: 'hbox',
                        defaultType: 'textfield',
                        defaults: {
                            flex: 1,
                            hideTrigger: true,
                            useReadColor: true,
                            fieldCls: 'smart-field-style-action'
                        },
                        items: [
                            {
                                pageSize: 0,
                                fieldLabel: 'Aviso Cirurgia',
                                name: 'surgicalwarningpatient',
                                xtype: 'searchpatient',
                                hiddenNameId: 'surgicalwarning',
                                listeners: {
                                    showclear: me.showClearPatiente,
                                    select: function (combo,record) {
                                        var win = combo.up('call_SATOR_MOVIMENTO_TO');
                                        win.down('hiddenfield[name=patientname]').setValue(record.get('name'));
                                        win.down('hiddenfield[name=surgicaltype]').setValue(record.get('surgical_type'));
                                        win.down('hiddenfield[name=surgicalstatus]').setValue(record.get('surgical_status'));
                                        win.down('textfield[name=surgicalroom]').setValue(record.get('surgical_room'));
                                        win.down('textfield[name=surgical]').setValue(record.get('surgical_procedure'));
                                        win.down('datefield').setValue(record.get('dateof'));
                                        win.down('timefield').setValue(record.get('timeof'));
                                    }
                                }
                            }
                        ]
                    }, {
                        hidden: true,
                        name: 'group_02',
                        xtype: 'fieldcontainer',
                        layout: 'hbox',
                        defaultType: 'textfield',
                        defaults: {
                            useReadColor: true,
                            fieldCls: 'smart-field-style-action'
                        },
                        items: [
                            {
                                flex: 1,
                                margin: '0 5 0 0',
                                fieldLabel: 'Procedimento',
                                name: 'surgical'
                            }, {
                                width: 201,
                                margin: '0 0 0 5',
                                fieldLabel: 'Sala',
                                name: 'surgicalroom'
                            }
                        ]
                    }, {
                        hidden: true,
                        name: 'group_03',
                        xtype: 'fieldcontainer',
                        layout: 'hbox',
                        defaultType: 'textfield',
                        defaults: {
                            useReadColor: true,
                            fieldCls: 'smart-field-style-action'
                        },
                        items: [
                            {
                                flex: 1,
                                fieldLabel: 'Circulante',
                                name: 'flowing'
                            }, {
                                xtype: 'splitter'
                            }, {
                                flex: 1,
                                fieldLabel: 'Instrumentador',
                                name: 'instrumentator'
                            }
                        ]
                    }, {
                        name: 'group_04',
                        xtype: 'fieldcontainer',
                        layout: 'hbox',
                        defaultType: 'textfield',
                        defaults: {
                            allowBlank: false,
                            fieldCls: 'smart-field-style-action'
                        },
                        items: [
                            {
                                flex: 1,
                                margin: '0 5 0 0',
                                xtype: 'datefield',
                                fieldLabel: 'Data',
                                plugins: 'textmask',
                                name: 'dateof',
                                value: new Date()
                            }, {
                                flex: 1,
                                allowBlank: true,
                                margin: '0 5 0 5',
                                xtype: 'timefield',
                                fieldLabel: 'Hora',
                                plugins: 'textmask',
                                name: 'timeof'
                            }, {
                                width: 201,
                                margin: '0 0 0 5',
                                xtype: 'container'
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
                click: 'setMovementOutput'
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