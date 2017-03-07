//@charset UTF-8
Ext.define( 'iSterilization.view.flowprocessing.protocol.Call_SATOR_LOTE_TRIAGEM_ITENS', {
    extend: 'Ext.window.Window',

    xtype: 'call_SATOR_LOTE_TRIAGEM_ITENS',

    requires: [
        'Ext.form.Panel',
        'Ext.window.Window',
        'iAdmin.view.person.client.ClientSearch',
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
                margin: '10 0 0 0',
                layout: 'anchor',
                defaults: {
                    anchor: '100%',
                    allowBlank: false,
                    fieldCls: 'smart-field-style-action',
                    labelCls: 'smart-field-style-action'
                },
                items:[
                    {
                        xtype: 'container',
                        layout: 'hbox',
                        defaultType: 'label',
                        defaults: {
                            cls: 'title-label'
                        },
                        items: [
                            {
                                flex: 1,
                                text: 'Cliente/Origem'
                            }, {
                                width: 30,
                                height: 30,
                                xtype: 'component',
                                html: '<div class="smart-btn-header" style="padding-left: 7px;"><i class="fa fa-times"></i></div>',
                                style: {
                                    cursor: 'pointer',
                                    fontSize: '20px;',
                                    borderRadius: '50%',
                                    backgroundColor: 'rgb(246, 246, 246);'
                                },
                                listeners: {
                                    render: function (c) {
                                        c.getEl().on({
                                            click: function () {
                                                me.close();
                                            }
                                        });
                                    }
                                }
                            }
                        ]
                    }, {
                        margin: '10 0 0 0',
                        xtype: 'clientsearch',
                        name: 'clientname',
                        hiddenNameId: 'clientid',
                        fieldCls: 'smart-field-style-login',
                        tpl: [
                            '<tpl for=".">',
                            '<div class="x-boundlist-item">',
                            '<div style="font-size: 22px; line-height: 38px;">{name}</div>',
                            '</div>',
                            '</tpl>'
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
                click: 'setSelectTargetLog'
            }
        }
    ]

});