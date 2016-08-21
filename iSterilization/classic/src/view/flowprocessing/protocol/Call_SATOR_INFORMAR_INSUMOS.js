//@charset UTF-8
Ext.define( 'iSterilization.view.flowprocessing.protocol.Call_SATOR_INFORMAR_INSUMOS', {
    extend: 'Ext.window.Window',

    xtype: 'call_SATOR_INFORMAR_INSUMOS',

    requires: [
        'Ext.form.Panel',
        'Smart.plugins.*',
        'Ext.window.Window',
        'iSterilization.view.flowprocessing.SearchInput',
        'iSterilization.view.flowprocessing.SearchElement',
        'iSterilization.view.flowprocessing.FlowProcessingInput',
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
                bodyPadding: 10,
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
                        text: 'Lançar Insumos'
                    }, {
                        style: 'margin-top: 20px',
                        pageSize: 0,
                        fieldLabel: 'Equipamento / Sub-Area',
                        xtype: 'searchelement',
                        hiddenNameId: 'flowprocessingstepid',
                        listeners: {
                            showclear: function (field) {
                                var form = field.up('form'),
                                    searchinput = form.down('searchinput'),
                                    quantity = form.down('numberfield[name=quantity]');

                                form.reset();
                                quantity.setMinValue(0);
                                quantity.setReadColor(true);
                                searchinput.getStore().removeAll();
                            },
                            beforequery: 'onBeforeSearchElement',
                            select: function (combo,record,eOpts) {
                                var form = combo.up('form'),
                                    searchinput = form.down('searchinput'),
                                    lotpart = form.down('textfield[name=lotpart]'),
                                    quantity = form.down('numberfield[name=quantity]'),
                                    datevalidity = form.down('datefield[name=datevalidity]'),
                                    presentation = form.down('hiddenfield[name=presentation]'),
                                    presentationdescription = form.down('textfield[name=presentationdescription]');

                                lotpart.reset();
                                searchinput.reset();
                                datevalidity.reset();
                                presentation.reset();
                                presentationdescription.reset();

                                quantity.reset();
                                quantity.setMinValue(0);
                                quantity.setReadColor(true);
                                searchinput.getStore().removeAll();
                            }
                        }
                    }, {
                        pageSize: 0,
                        hideTrigger: true,
                        xtype: 'searchinput',
                        fieldLabel: 'Insumo',
                        hiddenNameId: 'inputpresentationid',
                        listeners: {
                            beforequery: 'onBeforeSearchInput',
                            select: function (combo,record,eOpts) {
                                var me = this,
                                    view = combo.up('window'),
                                    form = view.down('form'),
                                    hasbatch = record.get('hasbatch'),
                                    hasstock = record.get('hasstock'),
                                    button = view.down('button[name=confirm]'),
                                    lotpart = me.up('window').down('textfield[name=lotpart]'),
                                    quantity = me.up('window').down('numberfield[name=quantity]'),
                                    datevalidity = me.up('window').down('datefield[name=datevalidity]'),
                                    presentation = me.up('window').down('hiddenfield[name=presentation]'),
                                    presentationdescription = me.up('window').down('textfield[name=presentationdescription]');

                                lotpart.setValue(record.get('lotpart'));
                                datevalidity.setValue(record.get('datevalidity'));
                                presentation.setValue(record.get('presentation'));
                                presentationdescription.setValue(record.get('presentationdescription'));

                                quantity.setReadColor(hasstock != 1);
                                quantity.setMinValue(hasstock == 1 ? 1 : 0);
                                quantity.setMaxValue(hasstock == 1 ? record.get('lotamount') : 0);

                                if(hasstock != 1) {
                                    button.fireEvent('click', button);
                                    form.reset();
                                    form.down('searchelement').focus(false,200);
                                }
                            }
                        }
                    }, {
                        xtype: 'container',
                        layout: 'hbox',
                        defaults: {
                            useReadColor: true,
                            fieldCls: 'smart-field-style-action',
                            labelCls: 'smart-field-style-action'
                        },
                        items: [
                            {
                                xtype: 'hiddenfield',
                                name: 'presentation'
                            }, {
                                flex: 3,
                                xtype: 'textfield',
                                name: 'presentationdescription',
                                fieldLabel: 'Apresentação'
                            }, {
                                xtype: 'splitter'
                            }, {
                                flex: 2,
                                minValue: 0,
                                hideTrigger: true,
                                xtype: 'numberfield',
                                name: 'quantity',
                                fieldLabel: 'Quantidade',
                                plugins: 'textmask',
                                mask: '0,000',
                                money: true,
                                listeners: {
                                    specialkey: function (field, e, eOpts) {
                                        if ([e.TAB,e.ENTER].indexOf(e.getKey()) != -1) {
                                            var view = field.up('window'),
                                                form = view.down('form'),
                                                button = view.down('button[name=confirm]');

                                            if(!form.isValid()){
                                                e.stopEvent();
                                                return false;
                                            }

                                            button.fireEvent('click', button);
                                            form.reset();
                                            form.down('searchelement').focus(false,200);
                                        }
                                    }
                                }
                            }
                        ]
                    }, {

                    }, {
                        xtype: 'container',
                        layout: 'hbox',
                        margin: '10 0 0 0',
                        defaults: {
                            useReadColor: true,
                            fieldCls: 'smart-field-style-action',
                            labelCls: 'smart-field-style-action'
                        },
                        items: [
                            {
                                flex: 3,
                                xtype: 'textfield',
                                margin: '0 5 0 0',
                                name: 'lotpart',
                                fieldLabel: 'Lote'
                            }, {
                                flex: 2,
                                fieldLabel: 'Validade',
                                margin: '0 0 0 5',
                                name: 'datevalidity',
                                xtype: 'datefield',
                                plugins: 'textmask',
                                listeners: {
                                    specialkey: function (field, e, eOpts) {
                                        if (e.getKey() === e.ENTER) {
                                            var view = field.up('movimentview'),
                                                button = view.down('button[name=update]');

                                            field.blur();
                                            button.fireEvent('click', button);
                                        }
                                    }
                                }
                            }
                        ]
                    }, {
                        height: 300,
                        hasDelete: true,
                        xtype: 'flowprocessinginput'
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
                click: 'informarInsumo'
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