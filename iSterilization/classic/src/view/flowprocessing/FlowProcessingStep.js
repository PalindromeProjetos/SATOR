//@charset UTF-8
Ext.define( 'iSterilization.view.flowprocessing.FlowProcessingStep', {
    extend: 'Ext.form.Panel',

    xtype: 'flowprocessingstep',

    requires: [
        'Smart.util.IonSound',
        'iSterilization.store.flowprocessing.*',
        'iSterilization.view.flowprocessing.FlowProcessingDataView',
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
    bodyCls: 'flow-processing',
    cls: 'panel-frame panel-frame-tpTree',

    iconCls: "fa fa-smile-o",
    showSmartAnimate: true,

    header: {
        title: 'Processos e Ações',
        defaultType: 'button',
        defaults: {
            showSmartTheme: 'header'
        },
        items: [
            {
                handler: 'onHistoryBack',
                iconCls: "fa fa-arrow-left"
            }, {
                width: 5,
                xtype: 'splitter'
            }, {
                handler: 'onDestroyView',
                iconCls: "fa fa-times"
            }
        ]
    },

    listeners: {
        queryreader: 'onStepDoQuery',
        afterrender: 'onAfterRenderType'
    },

    bodyStyle: 'padding: 10px',

    timeoutInterval: (6000 * 10),

    setCycleStart: function (store) {
        var clock = Ext.dom.Query.select('div.steptype-clock');
        var tools = Ext.dom.Query.select('div.steptype-tools');

        store.each(function (item) {
            var id = item.get('id');
            var steptype = item.get('steptype');

            if (steptype == 'T') {
                var date1 = Ext.Date.parse(item.get('dateof').substring(0, 19), "Y-m-d H:i:s");
                Ext.each(clock,function (node) {
                    var el = Ext.get(node);
                    if(el.id == ('clock-' + id)) {
                        el.removeCls('step-hide');
                        el.timeout = window.setInterval(function () {
                            var date2 = new Date();
                            el.update(Ext.Date.dateFormat(new Date(date2-date1), "i:s"));
                        });
                    }
                });
            }

            if (steptype == 'C') {
                Ext.each(tools,function (node) {
                    var el = Ext.get(node);
                    if(el.id == ('tools-' + id)) {
                        el.removeCls('step-hide');
                    }
                });
            }
        });
    },

    selectStep: function() {
        var me = this;

        me.timeoutID = window.setInterval(function () {
            me.updateType();
        }, me.timeoutInterval);
    },

    deselectStep: function () {
        var me = this;
        window.clearInterval(me.timeoutID);
    },

    updateType : function () {
        var store = Ext.getStore('flowprocessingsteparea');

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

        me.onAfter('destroy', me.deselectStep, me);
        me.onAfter('afterrender', me.selectStep, me);
    },

    buildItems: function () {
        var me = this;

        Ext.create('iSterilization.store.flowprocessing.FlowProcessing');
        Ext.create('iSterilization.store.flowprocessing.FlowProcessingStep');
        Ext.create('iSterilization.store.flowprocessing.FlowProcessingStepInput');
        Ext.create('iSterilization.store.flowprocessing.FlowProcessingStepAction');
        Ext.create('iSterilization.store.flowprocessing.FlowProcessingStepMaterial');
        Ext.create('iSterilization.store.flowprocessing.FlowProcessingStepInputTree');

        Ext.create('iSterilization.store.flowprocessing.FlowProcessingStepArea');

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
                                xtype: 'flowprocessingdataview',
                                listeners: {
                                    itemdblclick: 'onFlowStepAction',
                                    removecharge: 'onFlowStepRemoveCharge',
                                    selectcharge: 'onFlowStepSelectCharge'
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
            store: 'flowprocessingsteparea',
            dock: 'bottom',
            items: [
                {
                    value: 25,
                    width: 120,
                    minValue: 10,
                    maxValue: 100,
                    labelWidth: 70,
                    hideTrigger: true,
                    labelAlign: 'left',
                    name: 'limit',
                    xtype: 'numberfield',
                    fieldLabel: 'processos',
                    listeners: {
                        specialkey: 'totalResultsSearch'
                    }
                }, {
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
                            var view = field.up('flowprocessingstep');
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