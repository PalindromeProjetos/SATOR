//@charset UTF-8
Ext.define( 'iSterilization.view.flowprocessing.protocol.Call_SATOR_TRIAGEM', {
    extend: 'Ext.window.Window',

    xtype: 'call_SATOR_TRIAGEM',

    requires: [
        'Ext.form.Panel',
        'Smart.plugins.*',
        'Ext.window.Window',
        'iSterilization.store.*',
        'iSterilization.view.flowprocessing.FlowProcessingController'
    ],

    width: 950,
    modal: true,
    layout: 'fit',
    header: false,
    resizable: false,
    showAnimate: true,

    controller: 'flowprocessing',

    listeners: {
        beforedestroy: function (view , eOpts) {
            var step =  Ext.getCmp('flowprocessingstep');
            if(step) {
                step.updateType();
                step.down('textfield[name=search]').focus(false,200);
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

        Ext.create('iSterilization.store.flowprocessing.FlowProcessingScreening');
        Ext.create('iSterilization.store.flowprocessing.FlowProcessingScreeningItem');

        me.items = [
            {
                xtype: 'form',
                bodyPadding: 10,
                layout: 'anchor',
                margin: '10 0 0 0',
                defaults: {
                    anchor: '100%',
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
                                text: 'Prepara Triagem'
                            }, {
                                flex: 2,
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
                        xtype: 'hiddenfield',
                        name: 'id'
                    }, {
                        anchor: '50%',
                        margin: '20 0 0 0',
                        fieldLabel: 'Consulta',
                        xtype: 'textfield',
                        useUpperCase: true,
                        name: 'materialboxname'
                        // listeners: {
                        //     specialkey: 'onReaderMaterialBoxCarga'
                        // }
                    }, {
                        height: 550,
                        xtype: 'gridpanel',
                        cls: 'update-grid',

                        store: 'flowprocessingscreeningitem',

                        columns: [
                            {
                                dataIndex: 'materialname',
                                flex: 1
                            }, {
                                dataIndex: 'countitems',
                                width: 40
                            }, {
                                dataIndex: 'barcode',
                                width: 160
                            }, {
                                width: 40,
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