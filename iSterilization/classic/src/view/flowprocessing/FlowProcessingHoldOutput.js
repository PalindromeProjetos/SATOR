//@charset UTF-8
Ext.define( 'iSterilization.view.flowprocessing.FlowProcessingHoldOutput', {
    extend: 'Ext.window.Window',

    xtype: 'flowprocessingholdoutput',

    requires: [
        'Ext.form.Panel',
        'Smart.plugins.*',
        'Ext.window.Window',
        'Ext.grid.column.*',
        'Ext.grid.plugin.CellEditing',
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

    listeners: {
        queryreader: 'onSelectHoldItem',
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
                plugins:'formenter',
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
                                text: 'Movimento/Saída'
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
                                        defaultType: 'textfield',
                                        defaults: {
                                            anchor: '100%',
                                            useReadColor: true,
                                            fieldCls: 'smart-field-style-action'
                                        },
                                        items: [
                                            {
                                                xtype: 'hiddenfield',
                                                name: 'id'
                                            }, {
                                                useUpperCase: true,
                                                inputType: 'password',
                                                name: 'search',
                                                listeners: {
                                                    specialkey: function (field, e, eOpts) {
                                                        if ([e.ENTER].indexOf(e.getKey()) != -1) {
                                                            var view = this.up('window');
                                                            view.fireEvent('queryreader', field, e, eOpts);
                                                        }
                                                    }
                                                }
                                            }, {
                                                xtype: 'container',
                                                layout: 'hbox',
                                                defaultType: 'displayfield',
                                                defaults: {
                                                    fieldCls: 'smart-field-style-action'
                                                },
                                                items: [
                                                    {
                                                        flex: 2,
                                                        fieldLabel: 'Transportado por',
                                                        name: 'transportedby',
                                                        value: '...'
                                                    }, {
                                                        xtype: 'splitter'
                                                    }, {
                                                        flex: 3,
                                                        xtype: 'displayfield',
                                                        fieldLabel: 'Encerrado em',
                                                        name: 'closeddate',
                                                        value: '...'
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }, {
                                margin: '10 0 0 10',
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
                                        margin: '0 0 10 0',
                                        xtype: 'fieldcontainer',
                                        name: 'groupdocument',
                                        tpl: [
                                            '<div class="movement">',
                                                '<div class="movement-title" style="padding-bottom: 10px;">{movementtypedescription} {movementdate}</div>',
                                                '<div class="movement-title">{clientname}</div>',
                                                '<div><b>{releasestypedescription}</b></div>',
                                                '<div class="movement-title">Procedimento</div>',
                                                '<div class="movement"><b>{surgical}</b></div>',
                                                '<div class="movement"><b>{surgicalwarning} {patientname}</b></div>',
                                                '<div>{dateof} {timeof} {surgicalroom}</div>',
                                            '</div>'
                                        ]
                                    }
                                ]
                            }
                        ]
                    }, {
                        height: 476,
                        xtype: 'gridpanel',
                        cls: 'update-grid',
                        hideHeaders: false,
                        headerBorders: false,
                        store: 'armorymovementitem',

                        selType: 'cellmodel',

                        plugins: {
                            ptype: 'cellediting',
                            clicksToEdit: 1
                        },

                        listeners: {
                            rowkeydown: function ( viewTable , record , tr , rowIndex , e , eOpts) {
                                if ([e.ESC].indexOf(e.getKey()) != -1) {
                                    viewTable.up('window').close();
                                }
                            }
                        },

                        columns: [
                            {
                                flex: 1,
                                sortable: false,
                                dataIndex: 'materialname',
                                text: 'Material / kit'
                            }, {
                                dataIndex: 'barcode',
                                width: 160
                            }, {
                                width: 150,
                                text: 'Schema',
                                sortable: false,
                                dataIndex: 'colorpallet'
                            }, {
                                width: 180,
                                sortable: false,
                                text: 'Saída',
                                dataIndex: 'outputtypedescription',
                                editor: {
                                    xtype: 'comboenum',
                                    name: 'outputtypedescription',
                                    fieldCls: 'smart-field-style-action',
                                    listeners: {
                                       select: 'onEditMOVIMENTO_TO'
                                    }
                                }
                            }, {
                                sortable: false,
                                text: 'Ações',
                                hidden: !me.editable,
                                width: 80,
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
        ];
    }

});