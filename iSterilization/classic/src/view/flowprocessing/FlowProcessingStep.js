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
        afterrender: 'onAfterRenderStep'
        // updatestepaction: 'onStepUpdateAction'
    },

    bodyStyle: 'padding: 10px',

    timeoutInterval: (6000 * 10),

    setCycleStart: function (store) {
        var clock = Ext.dom.Query.select('div.steptype-clock');
        var clear = Ext.dom.Query.select('div.steptype-clear');

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
                Ext.each(clear,function (node) {
                    var el = Ext.get(node);
                    if(el.id == ('clear-' + id)) {
                        el.removeCls('step-hide');
                    }
                });
            }
        });
    },

    selectStep: function() {
        var me = this;

        me.timeoutID = window.setInterval(function () {
            me.fireEvent('updatestepaction',me);
            me.updateStep();
        }, me.timeoutInterval);

        Ext.create('Ext.util.KeyNav', Ext.getDoc(), {
            scope: me,
            esc: function () {
                if(me.isVisible()) {
                    me.searchToogle();
                }
            }
        });
    },

    searchToogle: function () {
        var me = this,
            search = me.down('textfield[name=search]');

        if(!search.isVisible()) {
            search.show(false,function () {
                search.focus(false,200);
                me.down('label[name=labelitem]').setText('Consultar');
            });
        } else {
            if(search.getValue().length != 0) {
                search.reset();
            } else  {
                search.hide();
                me.down('label[name=labelitem]').setText('Detalhes');
            }
        }
    },

    deselectStep: function () {
        var me = this;
        window.clearInterval(me.timeoutID);
    },

    updateStep : function () {
        var me = this,
            store = Ext.getStore('flowprocessingstepaction'),
            dataview = me.down('dataview[name=flowprocessingsteptask]');

        if(!Smart.workstation) {
            return false;
        }

        Ext.Ajax.request({
            scope: me,
            url: store.getUrl(),
            params: {
                action: 'select',
                method: 'selectArea',
                query: Smart.workstation.areasid
            },
            callback: function (options, success, response) {
                var result = Ext.decode(response.responseText);

                if(!success || !result.success) {
                    return false;
                }

                store.removeAll();

                if(result.rows) {
                    store.loadData(result.rows);
                    me.setCycleStart(store);
                }
            }
        });

        Ext.Ajax.request({
            scope: me,
            url: dataview.store.getUrl(),
            params: {
                action: 'select',
                method: 'actionTask'
            },
            callback: function (options, success, response) {
                var result = Ext.decode(response.responseText);

                if(!success || !result.success) {
                    return false;
                }

                if(!dataview.store) {
                    return false;
                }

                dataview.store.removeAll();

                if(result.rows) {
                    dataview.store.loadData(result.rows);
                }
            }
        });
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

        me.items = [
            {
                flex: 1,
                margin: '10 0 0 0',
                xtype: 'container',
                layout: {
                    type: 'hbox',
                    align: 'stretch'
                },
                items: [
                    {
                        flex: 1,
                        xtype: 'container',
                        layout: {
                            type: 'vbox',
                            align: 'stretch'
                        },
                        items: [
                            {
                                xtype: 'label',
                                cls: 'processing-field-font',
                                text: 'Estação de Trabalho Não Configurada',
                                name: 'labelareas'
                            }, {
                                flex: 1,
                                xtype: 'flowprocessingdataview',
                                listeners: {
                                    select: 'onFlowStepSelect',
                                    deselect: 'onFlowStepDeSelect',
                                    itemdblclick: 'onFlowStepAction',
                                    removerecord: 'onFlowStepRemove'
                                }
                            }
                        ]
                    }, {
                        width: 350,
                        xtype: 'container',
                        layout: {
                            type: 'vbox',
                            align: 'stretch'
                        },
                        items: [
                            {
                                xtype: 'label',
                                cls: 'processing-field-font',
                                text: 'Consultar',
                                name: 'labelitem'
                            }, {
                                hidden: true,
                                name: 'search',
                                showClear: true,
                                xtype: 'textfield',
                                useUpperCase: true,
                                useReadColor: false,
                                inputType: 'password',
                                cls: 'processing-field',
                                labelCls: 'processing-field-font',
                                listeners: {
                                    specialkey: function (field, e, eOpts) {
                                        var view = field.up('flowprocessingstep');
                                        if ([e.ENTER].indexOf(e.getKey()) != -1) {
                                            view.fireEvent('queryreader', field, e, eOpts);
                                        }
                                    }
                                }
                            }, {
                                source: {},
                                autoHeight: true,
                                columnLines: false,
                                xtype: 'propertygrid',
                                defaults: { readOnly: true },
                                disableSelection: true,
                                cls: 'flowprocessingstep',
                                frame: false,
                                border: false,
                                bodyStyle: 'background:transparent;',
                                listeners: {
                                    beforeedit: function (e) { return false; },
                                    itemkeydown: function ( tableView, td, cellIndex, record, e, eOpts ) {
                                        if(e.keyCode == 27) {
                                            tableView.up('flowprocessingstep').searchToogle();
                                        }
                                    }
                                }
                            }
                        ]
                    }
                ]
            }, {
                height: 150,
                xtype: 'dataview',
                trackOver: true,
                autoScroll: true,
                multiSelect: false,
                name: 'flowprocessingsteptask',
                
                url: '../iSterilization/business/Calls/flowprocessingstepaction.php',

                params: {
                    action: 'select',
                    method: 'actionTask'
                },

                fields: [ 'taskcode', 'taskname', 'taskrows' ],

                itemSelector: 'div.thumb-wrap',
                tpl: [
                    '<tpl for=".">',
                        '<div style="margin-bottom: 10px;" class="thumb-wrap">',
                            '<div class="thumb-task-{taskcode}">',
                                '<a class="authorize">{taskrows}</a>',
                            '</div>',
                            '<span><a style="font-size: 14px;">{taskname}</a></span>',
                        '</div>',
                    '</tpl>'
                ],
                listeners: {
                    render: function () {
                        this.getStore().load();
                    },
                    itemdblclick: 'onFlowTaskAction'
                }
            }
        ];
    }

});