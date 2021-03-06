//@charset UTF-8
Ext.define( 'iSterilization.view.flowprocessing.protocol.Call_SATOR_MOVIMENTO_IN', {
    extend: 'Ext.window.Window',

    xtype: 'call_SATOR_MOVIMENTO_IN',

    requires: [
        'Ext.form.Panel',
        'Smart.plugins.*',
        'Ext.window.Window',
        'Ext.grid.column.*',
        'Ext.grid.plugin.CellEditing',
        'iSterilization.view.flowprocessing.FlowProcessingController'
    ],

    width: 810,
    modal: true,
    header: false,
    resizable: false,
    showAnimate: true,
    layout: 'fit',
    controller: 'flowprocessing',
    cls: 'panel-frame',
    iconCls: "fa fa-file-archive-o",

    title: 'Movimento',

    editable: false,

    doCallBack: Ext.emptyFn,

    listeners: {
        queryreader: 'onArmoryInQuery',
        beforedestroy: function (view , eOpts) {
            var hold =  Ext.getCmp('flowprocessinghold');
            if(hold) {
                hold.updateType();
                hold.down('textfield[name=search]').focus(false,200);
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

        Ext.create('iSterilization.store.armory.ArmoryMovementItem');

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
                                flex: 4,
                                text: 'Movimento/Retorno'
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
                                flex: 1,
                                name: 'areasname'
                            }, {
                                xtype: 'splitter'
                            }, {
                                flex: 1,
                                name: 'movementtypedescription'
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
                                name: 'releasestypedescription'
                            }
                        ]
                    }, {
                        hidden: !me.editable,
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
                                margin: '10 0 0 0',
                                useUpperCase: true,
                                fieldLabel: 'Processos',
                                inputType: 'password',
                                name: 'search',
                                listeners: {
                                    specialkey: function (field, e, eOpts) {
                                        if ([e.TAB,e.ENTER].indexOf(e.getKey()) != -1) {
                                            var view = this.up('window');
                                            view.fireEvent('queryreader', field, e, eOpts);
                                        }
                                    }
                                }
                            }
                        ]
                    }, {
                        height: 350,
                        margin: '10 0 0 0',
                        xtype: 'gridpanel',
                        cls: 'update-grid',
                        store: 'armorymovementitem',

                        selType: 'cellmodel',

                        plugins: {
                            ptype: 'cellediting',
                            clicksToEdit: 1
                        },

                        listeners: {
                            beforeedit: 'onBeforeEditMOVIMENTO_OF',
                            rowkeydown: function ( viewTable , record , tr , rowIndex , e , eOpts) {
                                if ([e.ESC].indexOf(e.getKey()) != -1) {
                                    viewTable.up('window').close();
                                }
                            }
                        },

                        columns: [
                            {
                                flex: 1,
                                dataIndex: 'materialname'
                            }, {
                                dataIndex: 'barcode',
                                width: 160
                            }, {
                                width: 180,
                                dataIndex: 'armorylocaldescription'
                            }, {
                                width: 180,
                                dataIndex: 'regresstypedescription',
                                editor: {
                                    xtype: 'comboenum',
                                    name: 'regresstypedescription',
                                    fieldCls: 'smart-field-style-action',
                                    listeners: {
                                        select: 'onEditMOVIMENTO_IN'
                                    }
                                }
                            }, {
                                hidden: !me.editable,
                                width: 40,
                                align: 'center',
                                xtype: 'actioncolumn',
                                items: [
                                    {
                                        handler: 'delReleasesItem',
                                        iconCls: "fa fa-minus-circle action-delete-color-font",
                                        tooltip: 'Descartar lançamento!'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    }

});