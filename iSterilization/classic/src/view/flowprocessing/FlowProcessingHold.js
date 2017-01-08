//@charset UTF-8
Ext.define( 'iSterilization.view.flowprocessing.FlowProcessingHold', {
    extend: 'Ext.form.Panel',

    xtype: 'flowprocessinghold',

    requires: [
        'Smart.util.Message',
        'Smart.util.IonSound',
        'iSterilization.store.flowprocessing.*',
        'iSterilization.view.flowprocessing.protocol.*',
        'iSterilization.view.flowprocessing.FlowProcessingController'
    ],

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    defaults: {
        width: '100%'
    },

    controller: 'flowprocessing',
    bodyCls: 'hold-processing',
    // cls: 'panel-frame panel-frame-tpTree',

    showSmartAnimate: true,

    header: false,

    listeners: {
        queryreader: 'onHoldDoQuery',
        afterrender: 'onAfterRenderType'
    },

    bodyStyle: 'padding: 10px',

    timeoutInterval: (1000 * 10),

    selectHold: function() {
        var me = this;

        me.timeoutID = window.setInterval(function () {
            me.updateType();
        }, me.timeoutInterval);
    },

    deselectHold: function () {
        var me = this;
        window.clearInterval(me.timeoutID);
    },

    updateType : function () {
        var store = Ext.getStore('flowprocessingholdarea');

        if(!Smart.workstation || !Smart.workstation.areasid) {
            Smart.Msg.showToast('Estação de Trabalho Não Configurada!','error');
            return false;
        }

        store.load();
    },

    initComponent: function () {
        var me = this;

        me.buildItems();
        me.callParent();

        me.onAfter('destroy', me.deselectHold, me);
        me.onAfter('afterrender', me.selectHold, me);
    },

    buildItems: function () {
        var me = this;

        Ext.create('iSterilization.store.flowprocessing.FlowProcessingHoldArea');

        me.items = [
            {
                flex: 1,
                margin: '10 0 0 0',
                xtype: 'container',
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                },
                items: [
                    {
                        flex: 1,
                        xtype: 'panel',
                        showSmartTransparent: true,
                        layout: {
                            type: 'vbox',
                            align: 'stretch'
                        },
                        items: [
                            {
                                xtype: 'container',
                                layout: 'hbox',
                                defaultType: 'label',
                                defaults: {
                                    height: 37,
                                    cls: 'processing-field-font'
                                },
                                items: [
                                    {
                                        flex: 1,
                                        text: 'Estação de Trabalho Não Configurada',
                                        name: 'labelareas'
                                    }
                                ]
                            }, {
                                flex: 1,
                                xtype: 'flowprocessingholdview',
                                listeners: {
                                    selectrecord: 'onFlowHoldSelect',
                                    deleterecord: 'onFlowHoldDelete'
                                }
                            }, {
                                columns: 5,
                                vertical: false,
                                xtype: 'radiogroup',
                                cls: 'flowprocessinghold',
                                labelCls: 'processing-field-font',
                                items: [
                                    { boxLabel: 'Todos', name: 'movementtype', inputValue: '000', checked: true },
                                    { boxLabel: 'Entradas', name: 'movementtype', inputValue: '001' },
                                    { boxLabel: 'Saídas', name: 'movementtype', inputValue: '002' },
                                    { boxLabel: 'Retornos', name: 'movementtype', inputValue: '003' },
                                    { boxLabel: 'Estornos', name: 'movementtype', inputValue: '004' }
                                ],
                                listeners: {
                                    change: function ( field , newValue , oldValue , eOpts) {
                                        var view = field.up('flowprocessinghold'),
                                            hold = view.down('flowprocessingholdview');

                                        hold.store.clearFilter();

                                        if(['001','002','003','004'].indexOf(newValue.movementtype) != -1) {
                                            hold.store.filter('movementtype', newValue.movementtype);
                                        }

                                        view.down('textfield[name=search]').focus(false,200);
                                    }
                                }
                            }
                        ]
                    }
                ]
            }
        ];
    },

    dockedItems: [
        {
            xtype: 'pagingtoolbar',
            store: 'flowprocessingholdarea',
            dock: 'bottom',
            items: [
                '-', {
                    width: 90,
                    labelWidth: 40,
                    useReadColor: true,
                    name: 'totalrecords',
                    xtype: 'textfield',
                    labelAlign: 'left',
                    fieldLabel: 'total',
                    value: 0
                }, '->', {
                    labelAlign: 'left',
                    fieldLabel: 'Consulta',
                    width: 400,
                    name: 'search',
                    labelWidth: 70,
                    showClear: true,
                    xtype: 'textfield',
                    useUpperCase: true,
                    useReadColor: false,
                    inputType: 'password',
                    listeners: {
                        specialkey: function (field, e, eOpts) {
                            var view = field.up('flowprocessinghold');
                            if ([e.ESC].indexOf(e.getKey()) != -1) {
                                field.reset();
                            }
                            if ([e.ENTER].indexOf(e.getKey()) != -1) {
                                view.fireEvent('queryreader', field, e, eOpts);
                            }
                        },
                        afterrender: function (field,eOpts) {
                            field.setFieldStyle('background-color: rgba(158, 158, 158, .2);');
                        }
                    }
                }
            ],

            clickNext: 'onSearchFocus',
            clickLast: 'onSearchFocus',
            clickFirst: 'onSearchFocus',
            clickPrior: 'onSearchFocus',
            specialkeyInputItem: 'onSpecialKey',

            onSearchFocus: function () {
                var me = this;

                me.down('textfield[name=search]').focus(false,200);
            },

            onSpecialKey: function (field, e, eOpts) {
                var me = this;
                if ([e.ENTER].indexOf(e.getKey()) != -1) {
                    me.onSearchFocus();
                }
            },

            doRefresh: function(){
                var me = this;
                me.store.load({
                    scope: me,
                    callback: function () {
                        me.onSearchFocus();
                    }
                });
            }
        }
    ]

});