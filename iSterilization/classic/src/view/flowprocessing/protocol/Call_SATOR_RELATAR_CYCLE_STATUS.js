//@charset UTF-8
Ext.define( 'iSterilization.view.flowprocessing.protocol.Call_SATOR_RELATAR_CYCLE_STATUS', {
    extend: 'Ext.window.Window',

    xtype: 'call_SATOR_RELATAR_CYCLE_STATUS',

    requires: [
        'Ext.form.Panel',
        'Smart.plugins.*',
        'Ext.window.Window',
        'iSterilization.view.flowprocessing.FlowProcessingController'
    ],

    width: 550,
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
                defaults: {
                    anchor: '100%',
                    allowBlank: false,
                    fieldCls: 'smart-field-style-action',
                    labelCls: 'smart-field-style-action'
                },
                items: [
                    {
                        xtype: 'hiddenfield',
                        name: 'cyclestatus'
                    }, {
                        xtype: 'label',
                        cls: 'title-label',
                        text: 'Relatar Status do Ciclo'
                    }, {
                        margin: '20 0 0 0',
                        fieldLabel: 'Status do Ciclo',
                        xtype: 'textfield',
                        name: 'cyclestatus',
                        listeners: {
                            specialkey: function (field, e, eOpts) {
                                if ([e.TAB,e.ENTER].indexOf(e.getKey()) != -1) {
                                    var me = this,
                                        button = me.up('window').down('button[name=confirm]');
                                    button.fireEvent('click', button);
                                }
                            }
                        }
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
                click: 'relatarCycleStatus'
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