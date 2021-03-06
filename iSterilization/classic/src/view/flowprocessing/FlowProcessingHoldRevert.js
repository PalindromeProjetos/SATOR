//@charset UTF-8
Ext.define( 'iSterilization.view.flowprocessing.FlowProcessingHoldRevert', {
    extend: 'Ext.window.Window',

    xtype: 'flowprocessingholdrevert',

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

    width: 950,
    modal: true,
    header: false,
    resizable: false,
    showAnimate: true,
    layout: 'fit',
    controller: 'flowprocessing',
    cls: 'panel-frame',
    iconCls: "fa fa-file-archive-o",

    editable: false,

    doCallBack: Ext.emptyFn,

    initComponent: function () {
        var me = this;
        me.buildItems();
        me.callParent();
    },

    onSelectClient: function (combo,record,eOpts) {
        var me = combo.up('window'),
            clienttype = record.get('clienttype'),
            surgicalroom = me.down('textfield[name=surgicalroom]');

        me.showSurgical(false);

        me.down('fieldcontainer[name=group_01]').hide();
        me.down('fieldcontainer[name=group_02]').hide();
        me.down('fieldcontainer[name=group_03]').hide();

        if (clienttype == '004') {
            me.showSurgical(true);
            me.down('fieldcontainer[name=group_01]').show();
            me.down('fieldcontainer[name=group_02]').show();
            me.down('fieldcontainer[name=group_04]').show();
        }

        me.updPosition();
    },

    showSurgical: function (value) {
        var me = this,
            dateof = me.down('datefield'),
            timeof = me.down('timefield'),
            searchpatient = me.down('searchpatient'),
            flowing = me.down('textfield[name=flowing]'),
            surgical = me.down('textfield[name=surgical]'),
            surgicalroom = me.down('textfield[name=surgicalroom]'),
            instrumentator = me.down('textfield[name=instrumentator]'),
            surgicalstatus = me.down('hiddenfield[name=surgicalstatus]'),
            surgicaltype = me.down('hiddenfield[name=surgicaltype]');

        surgicaltype.reset();
        surgicalstatus.reset();

        dateof.reset();
        timeof.reset();

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


        field.reset();
        dateof.reset();
        timeof.reset();
        surgical.reset();
        patientname.reset();
        surgicaltype.reset();
        surgicalroom.reset();
        surgicalstatus.reset();
        instrumentator.reset();

        me.down('fieldcontainer[name=group_01]').hide();
        me.down('fieldcontainer[name=group_02]').hide();
        me.down('fieldcontainer[name=group_04]').hide();

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

        Ext.create('iSterilization.store.armory.ArmoryMovementItem');

        me.items = [
            {
                xtype: 'form',
                bodyPadding: 10,
                margin: '10 0 0 0',
                layout: 'anchor',
                plugins:'formenter',
                defaults: {
                    anchor: '100%',
                    allowBlank: false,
                    fieldCls: 'smart-field-style-action',
                    labelCls: 'smart-field-style-action'
                },
                items: [
                    {
                        xtype: 'label',
                        cls: 'title-label',
                        text: 'Estorno'
                    }, {
                        xtype: 'container',
                        layout: {
                            type: 'hbox',
                            align: 'stretch'
                        },
                        defaults: {
                            fieldCls: 'smart-field-style-action',
                            labelCls: 'smart-field-style-action'
                        },
                        items: [
                            {
                                margin: '10 10 0 0',
                                flex: 3,
                                xtype: 'container',
                                layout: 'anchor',
                                defaults: {
                                    anchor: '100%',
                                    allowBlank: false,
                                    fieldCls: 'smart-field-style-action',
                                    labelCls: 'smart-field-style-action'
                                },
                                items: [
                                    {
                                        margin: '10 0 10 0',
                                        xtype: 'fieldcontainer',
                                        layout: 'anchor',
                                        fieldLabel: 'Lançamentos',
                                        defaultType: 'hiddenfield',
                                        defaults: {
                                            anchor: '100%',
                                            useReadColor: true
                                            // fieldCls: 'smart-field-style-action'
                                        },
                                        items: [
                                            {
                                                name: 'id'
                                            }, {
                                                name: 'movementtype',
                                                value: '004'
                                            }, {
                                                name: 'releasestype',
                                                value: 'E'
                                            }, {
                                                name: 'areasid',
                                                value: Smart.workstation.areasid
                                            }, {
                                                name: 'surgicalstatus'
                                            }, {
                                                name: 'surgicaltype'
                                            }, {
                                                name: 'patientname'
                                            }, {
                                                columns: 2,
                                                vertical: false,
                                                xtype: 'radiogroup',
                                                items: [
                                                    { boxLabel: 'Simples', name: 'reverttype', inputValue: 'S', checked: true },
                                                    { boxLabel: 'Direcionado', name: 'reverttype', inputValue: 'D' }
                                                ],
                                                listeners: {
                                                    change: function ( field , newValue, oldValue, eOpts) {
                                                        var me = field.up('flowprocessingholdrevert');

                                                        me.showClearClient(me.down('clientsearch'));
                                                        me.down('fieldcontainer[name=group_00]').hide();
                                                        me.down('fieldcontainer[name=group_01]').hide();
                                                        me.down('fieldcontainer[name=group_02]').hide();
                                                        me.down('fieldcontainer[name=group_03]').hide();
                                                        me.down('fieldcontainer[name=group_04]').hide();

                                                        if(newValue.reverttype == 'D') {
                                                            me.down('fieldcontainer[name=group_00]').show();
                                                            me.down('clientsearch').focus(false,200);
                                                        }

                                                        me.updPosition();
                                                    }
                                                }
                                            }, {
                                                hidden: true,
                                                name: 'group_00',
                                                xtype: 'fieldcontainer',
                                                layout: 'hbox',
                                                // fieldLabel: 'Destino',
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
                                                        fieldLabel: 'Cliente',
                                                        xtype: 'clientsearch',
                                                        name: 'clientname',
                                                        hiddenNameId: 'clientid',
                                                        listeners: {
                                                            select: me.onSelectClient,
                                                            showclear: me.showClearClient,
                                                            beforedeselect: 'showClearClient'
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
                                                    fieldCls: 'smart-field-style-action'
                                                },
                                                items: [
                                                    {
                                                        pageSize: 0,
                                                        useReadColor: true,
                                                        fieldLabel: 'Aviso Cirurgico',
                                                        name: 'surgicalwarningpatient',
                                                        xtype: 'searchpatient',
                                                        hiddenNameId: 'surgicalwarning',
                                                        listeners: {
                                                            showclear: me.showClearPatiente,
                                                            select: function (combo,record) {
                                                                var win = combo.up('flowprocessingholdrevert');
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
                                                    flex: 1,
                                                    fieldCls: 'smart-field-style-action'
                                                },
                                                items: [
                                                    {
                                                        useReadColor: true,
                                                        fieldLabel: 'Procedimento',
                                                        name: 'surgical'
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
                                                hidden: true,
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
                                                        name: 'dateof'
                                                    }, {
                                                        flex: 1,
                                                        margin: '0 5 0 5',
                                                        xtype: 'timefield',
                                                        fieldLabel: 'Hora',
                                                        plugins: 'textmask',
                                                        name: 'timeof'
                                                    }, {
                                                        flex: 1,
                                                        margin: '0 0 0 5',
                                                        fieldLabel: 'Sala',
                                                        name: 'surgicalroom'
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }, {
                                margin: '10 0 0 10',
                                flex: 2,
                                xtype: 'container',
                                layout: 'anchor',
                                defaults: {
                                    anchor: '100%',
                                    allowBlank: false,
                                    fieldCls: 'smart-field-style-action',
                                    labelCls: 'smart-field-style-action'
                                },
                                items: [
                                    {
                                        margin: '0 0 10 0',
                                        xtype: 'fieldcontainer',
                                        name: 'groupdocument',
                                        tpl: [
                                            '<div class="movement">',
                                                '<div class="movement-title" style="padding-bottom: 10px;">{movementtypedescription} {movementdate}</div>',
                                                '<div class="movement-title">{clientname}</div>',
                                                '<div><b>{releasestypedescription}</b></div>',
                                                '<div class="movement-title">Procedimento</div>',
                                                '<div><b>{surgical}</b></div>',
                                                '<div><b>{surgicalwarning} {patientname}</b></div>',
                                                '<div>{dateof} {timeof} {surgicalroom}</div>',
                                            '</div>'
                                        ]
                                    }
                                ]
                            }
                        ]
                    }, {
                        hidden: true,
                        height: 350,
                        xtype: 'gridpanel',
                        cls: 'update-grid',
                        hideHeaders: false,
                        headerBorders: false,
                        store: 'armorymovementitem',

                        columns: [
                            {
                                xtype: 'rownumberer'
                            }, {
                                flex: 1,
                                sortable: false,
                                dataIndex: 'materialname',
                                text: 'Material / kit'
                            }, {
                                width: 150,
                                text: 'Schema',
                                sortable: false,
                                dataIndex: 'colorpallet'
                            }, {
                                width: 180,
                                sortable: false,
                                text: 'Saída',
                                dataIndex: 'outputtypedescription'
                            }
                        ]
                    }
                ]
            }
        ];
    },

    buttonAlign: 'center',

    buttons: [
        {
            scale: 'medium',
            name: 'confirm',
            text: 'Confirmar',
            showSmartTheme: 'green',
            listeners: {
                click: 'setMovementRevert'
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