//@charset UTF-8
Ext.define( 'iSterilization.view.flowprocessing.protocol.Call_SATOR_LOTE_TRIAGEM_EXCEPTION', {
    extend: 'Ext.window.Window',

    xtype: 'call_SATOR_LOTE_TRIAGEM_EXCEPTION',

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
                                text: 'Exceções'
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
                                xtype: 'hiddenfield',
                                name: 'sterilizationtypeid'
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
                        height: 250,
                        cls: 'flowexception-grid',
                        xtype: 'gridpanel',

                        hideHeaders: false,
                        headerBorders: false,

                        store: Ext.create('Ext.data.Store'),

                        columns: [
                            {
                                flex: 1,
                                text: '<span style="color: blue; font-size: 16px">Leituras</span>',
                                sortable: false,
                                dataIndex: "sourcename"
                            }, {
                                width: 310,
                                text: '<span style="color: blue; font-size: 16px">Exceções</span>',
                                sortable: false,
                                dataIndex: "targetname",
                                xtype: 'widgetcolumn',
                                widget: {
                                    xtype: 'combobox',
                                    pageSize: 0,
                                    editable: false,

                                    valueField: 'elementcode',
                                    displayField: 'elementname',

                                    fieldCls: 'flowexception-field-style-action',
                                    store: { data: [] },
                                    listeners: {
                                        beforequery: function ( queryPlan , eOpts ) {
                                            queryPlan.combo.reset();
                                            delete queryPlan.combo.lastQuery;
                                            queryPlan.combo.store.removeAll();
                                        },
                                        collapse: function (field, eOpts) {
                                            var rec = field.getWidgetRecord();

                                            if(!field.getRawValue()) {
                                                rec.set('element','');
                                                rec.set('targetid','');
                                                rec.set('targetname','');
                                                rec.commit();
                                            }
                                        },
                                        expand: function (field, eOpts) {
                                            var rec = field.getWidgetRecord(),
                                                typelesscode = rec.get('flowexception') == 1 ? 'A' : 'Q',
                                                exceptiondo = Ext.decode(rec.get('exceptiondo')),
                                                store = Ext.create('Ext.data.Store', {
                                                    fields: Object.keys(exceptiondo),
                                                    data: exceptiondo
                                                });

                                            store.clearFilter();
                                            store.filter('typelesscode', typelesscode);

                                            field.setStore(store);
                                        },
                                        select: function (combo,record,eOpts) {
                                            var rec = combo.getWidgetRecord();

                                            rec.set('targetid',record.get('id'));
                                            rec.set('targetname',record.get('elementname'));
                                            rec.set('element',Ext.encode({
                                                stepchoice: rec.get('flowexception'),
                                                steplevel: record.get('steplevel'),
                                                elementtype: record.get('elementtype'),
                                                elementcode: record.get('elementcode'),
                                                elementname: record.get('elementname'),
                                                levelsource: 0
                                            }));

                                            rec.commit();
                                        }
                                    }
                                }
                            }, {
                                width: 50,
                                sortable: false,
                                dataIndex: 'flowexception',
                                renderer: function (value,metaData,record) {
                                    var flowexception = value == 1 ? 'A' : 'Q',
                                        flag = '<div class="flowexception flowexception{0}">{1}</div>';

                                    return Ext.String.format(flag,value,flowexception);
                                }
                            }
                        ],
                        listeners: {
                            rowkeydown: function ( viewTable , rec , tr , rowIndex , e , eOpts) {
                                if ([e.ESC].indexOf(e.getKey()) != -1) {
                                    viewTable.up('window').close();
                                }
                            },
                            cellclick: function ( viewTable, td , cellIndex , rec , tr , rowIndex , e , eOpts ) {
                                if(cellIndex == 2) {
                                    var flowexception = rec.get('flowexception'),
                                        typelesscode = (flowexception == 1 ? "Q" : "A"),
                                        exceptiondo = Ext.decode(rec.get('exceptiondo'));

                                    rec.set('element','');
                                    rec.set('targetid','');
                                    rec.set('targetname','');
                                    rec.set('flowexception',(flowexception == 1 ? 2 : 1));
                                    rec.commit();

                                    var find = Ext.Array.findBy(exceptiondo,function (item) {
                                        if(typelesscode == item.typelesscode) { return item; }
                                    });

                                    if(find) {
                                        rec.set('targetid',find.id);
                                        rec.set('targetname',find.elementname);
                                        rec.set('element',Ext.encode({
                                            stepchoice: rec.get('flowexception'),
                                            steplevel: find.steplevel,
                                            elementtype: find.elementtype,
                                            elementcode: find.elementcode,
                                            elementname: find.elementname,
                                            levelsource: 0
                                        }));

                                        rec.commit();
                                    }
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
                click: 'setSelectScreening'
            }
        }
    ]

});