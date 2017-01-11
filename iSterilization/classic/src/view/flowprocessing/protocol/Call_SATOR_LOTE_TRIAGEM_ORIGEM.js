//@charset UTF-8
Ext.define( 'iSterilization.view.flowprocessing.protocol.Call_SATOR_LOTE_TRIAGEM_ORIGEM', {
    extend: 'Ext.window.Window',

    xtype: 'call_SATOR_LOTE_TRIAGEM_ORIGEM',

    requires: [
        'Ext.data.Store',
        'Ext.grid.Panel',
        'Ext.form.Panel',
        'Smart.plugins.*',
        'Ext.window.Window',
        'iSterilization.view.flowprocessing.FlowProcessingController'
    ],

    width: 750,
    modal: true,
    layout: 'fit',
    header: false,
    resizable: false,
    showAnimate: true,

    controller: 'flowprocessing',

    listeners: {
        beforedestroy: function (view , eOpts) {
            if (view.master) {
                view.master.down('textfield[name=materialboxname]').focus(false, 200);
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
                                flex: 1,
                                text: 'Detalhamento do Kit'
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
                                        c.getEl().on({ click: function() { me.close(); } });
                                    }
                                }
                            }
                        ]
                    }, {
                        style: 'margin-top: 10px',
                        xtype: 'fieldcontainer',
                        layout: 'hbox',
                        defaults: {
                            flex: 1,
                            fieldCls: 'smart-field-style-action'
                        },
                        items: [
                            {
                                xtype: 'hiddenfield',
                                name: 'id'
                            }, {
                                fieldLabel: 'Material / Kit',
                                name: 'materialname',
                                xtype: 'displayfield'
                            }, {
                                fieldLabel: 'Fluxo',
                                name: 'sterilizationtypename',
                                xtype: 'displayfield'
                            }
                        ]

                    }, {
                        height: 414,
                        xtype: 'gridpanel',
                        cls: 'update-grid',
                        hideHeaders: false,
                        headerBorders: false,
                        name: 'materialbox',
                        params: {
                            action: 'select',
                            method: 'selectCode'
                        },

                        url: '../iAdmin/business/Calls/materialboxitem.php',

                        fields: [
                            {
                                name: 'id',
                                type: 'int'
                            }, {
                                name: 'barcode',
                                type: 'auto'
                            }, {
                                name: 'materialname',
                                type: 'auto'
                            }, {
                                name: 'proprietaryname',
                                type: 'auto'
                            }
                        ],

                        columns: [
                            {
                                xtype: 'rownumberer'
                            }, {
                                width: 40,
                                sortable: false,
                                renderer: function (value,metaData,record) {
                                    var items = record.get('items'),
                                        loads = record.get('loads'),
                                        chargestatus = (items == loads) ? '001' : '002',
                                        flag = '<div class="unconformities chargestatus{0}"></div>';

                                    return Ext.String.format(flag,chargestatus);
                                }
                            }, {
                                flex: 1,
                                align: 'left',
                                sortable: false,
                                dataIndex: 'materialname',
                                text: 'Material'
                            }
                        ]
                    }
                ]
            }
        ]
    }

});