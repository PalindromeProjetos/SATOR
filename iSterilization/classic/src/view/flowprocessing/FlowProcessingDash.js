//@charset UTF-8
Ext.define( 'iSterilization.view.flowprocessing.FlowProcessingDash', {
    extend: 'Ext.form.Panel',

    xtype: 'flowprocessingdash',

    requires: [
        'Ext.grid.Panel',
        'Ext.grid.column.*',
        'Ext.picker.Date',
        'Ext.grid.column.*',
        'Ext.button.Segmented',
        'iSterilization.store.flowprocessing.*',
        'iSterilization.view.flowprocessing.FlowProcessingController'
    ],

    layout: 'border',

    // layout: {
    //     type: 'hbox'
    //     // align: 'stretch'
    // },

    controller: 'flowprocessing',
    cls: 'panel-frame panel-frame-tpTree',
    iconCls: "fa fa-smile-o",
    showSmartAnimate: true,

    header: {
        title: 'Rastrear Leituras',
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
        // keydown: 'onKeyDownDash',
        afterrender: 'onAfterRenderDash'
    },

    initComponent: function () {
        var me = this;
        me.buildItems();
        me.callParent();
    },

    buildItems: function () {
        var me = this;

        Ext.create('iSterilization.store.flowprocessing.FlowProcessing');
        Ext.create('iSterilization.store.flowprocessing.FlowProcessingStep');
        Ext.create('iSterilization.store.flowprocessing.FlowProcessingStepAction');

        me.items = [
            {
                split: true,
                width: 320,
                region: 'west',
                xtype: 'panel',
                scrollable: 'y',
                cls: "smart-background-transparent",
                layout: 'anchor',
                defaults: {
                    anchor: '100%',
                    useLabelBold: true
                },
                items: [
                    {
                        xtype: 'label',
                        cls: 'title-label',
                        text: 'Leituras'
                    }, {
                        margin: '10 0 0 0',
                        startDay: 0,
                        border: false,
                        cls: 'sator',
                        xtype: 'datepicker',
                        listeners: {
                            select: 'selectDatePicker'
                        }
                    }, {
                        xtype: 'fieldcontainer',
                        margin: '10 0 0 0',
                        layout: 'anchor',
                        fieldLabel: 'Filtros',
                        labelCls: 'sub-title-label',
                        defaultType: 'textfield',
                        defaults: {
                            anchor: '100%'
                        }
                    }
                ]
            }, {
                // flex: 1,
                region: 'center',
                xtype: 'container',
                layout: {
                    type: 'vbox'
                },
                defaults: {
                    width: '100%'
                },
                items: [
                    {
                        xtype: 'container',
                        layout: 'hbox',
                        items: [
                            {
                                flex: 1,
                                xtype: 'label',
                                cls: 'title-label title-label-bold',
                                text: '...',
                                name: 'labelperiod'
                            }, {
                                width: 150,
                                pageSize: 0,
                                xtype: 'combobox',
                                editable: false,
                                name: 'traceability',
                                displayField: 'traceability_name',
                                valueField: 'traceability_type',
                                store: {
                                    fields: [ 'traceability_type','traceability_name' ],
                                    data: [
                                        { traceability_type: 0, traceability_name: 'Processos' },
                                        { traceability_type: 1, traceability_name: 'Registros' }
                                    ]
                                },
                                listeners: {
                                    select: 'selectTraceability'
                                }
                            }
                        ]
                    }, {
                        flex: 1,
                        xtype: 'container',
                        margin: '10 0 0 0',
                        layout: 'card',
                        name: 'traceability',
                        items: [
                            {
                                xtype: 'container',
                                layout: {
                                    type: 'hbox',
                                    align: 'stretch'
                                },
                                items: [
                                    {
                                        flex: 1,
                                        xtype: 'panel',
                                        dockedItems: [
                                            {
                                                xtype: 'toolbar',
                                                items: [
                                                    {
                                                        margin: '10 0 0 10',
                                                        xtype: 'label',
                                                        cls: 'sub-title-label',
                                                        text: 'Fluxos'
                                                    }, {
                                                        xtype: 'tbfill'
                                                    }, {
                                                        width: 150,
                                                        pageSize: 0,
                                                        showClear: true,
                                                        xtype: 'comboenum',
                                                        name: 'flowstatusdescription',
                                                        listeners: {
                                                            select: 'onSelectFlowStatus',
                                                            showclear: 'showClearFlowStatus'
                                                        }
                                                    }
                                                ]
                                            }
                                        ],
                                        layout: {
                                            type: 'vbox'
                                        },
                                        defaults: {
                                            width: '100%'
                                        },
                                        items: [
                                            {
                                                height: 240,
                                                xtype: 'dataview',
                                                trackOver: true,
                                                autoScroll: true,
                                                multiSelect: false,
                                                name: 'flowprocessing',
                                                store: 'flowprocessing',
                                                itemSelector: 'div.thumb-wrap',
                                                tpl: [
                                                    '<tpl for=".">',
                                                        '<div style="margin-bottom: 10px;" class="thumb-wrap">',
                                                            '<div class="thumb-flow">',
                                                                '<div class="thumb-flow-status"></div>',
                                                            '</div>',
                                                            '<span><a style="font-size: 14px;">{sterilizationtypename}</a></span>',
                                                        '</div>',
                                                    '</tpl>'
                                                ],
                                                listeners: {
                                                    select: 'onSelectDataView',
                                                    deselect: 'onDeSelectDataView'
                                                    // itemdblclick: 'onFlowStepAction'
                                                },
                                                emptyText: '<h4 style="text-align: center; line-height: 40px;" class="insert-record">Nenhum fluxo no período...</h4>'
                                            }, {
                                                flex: 1,
                                                dockedItems: [
                                                    {
                                                        xtype: 'toolbar',
                                                        items: [
                                                            {
                                                                margin: '10 0 0 10',
                                                                xtype: 'label',
                                                                cls: 'sub-title-label',
                                                                text: 'Etapas'
                                                            }, {
                                                                xtype: 'tbfill'
                                                            }, {
                                                                width: 150,
                                                                pageSize: 0,
                                                                showClear: true,
                                                                xtype: 'comboenum',
                                                                name: 'flowstepstatusdescription',
                                                                listeners: {
                                                                    select: 'onSelectFlowStepStatus',
                                                                    showclear: 'showClearFlowStepStatus'
                                                                }
                                                            }
                                                        ]
                                                    }
                                                ],
                                                xtype: 'gridpanel',
                                                cls: 'processing-panel-header-flow processing-update-grid',
                                                store: 'flowprocessingstep',
                                                columns: [
                                                    {
                                                        width: 50,
                                                        align: 'center',
                                                        dataIndex: 'steplevel',
                                                        renderer: function (value,metaData,record) {
                                                            return Ext.String.leftPad(value, 2, '0');
                                                        }
                                                    }, {
                                                        flex: 1,
                                                        dataIndex: 'elementname',
                                                        renderer: function (value,metaData,record) {
                                                            var result = value,
                                                                elementtype = record.get('elementtype');

                                                            switch (elementtype) {
                                                                case "uml.StartState":
                                                                    result = 'StartState';
                                                                    metaData.style = 'color: green; font-weight: 700;';
                                                                    break
                                                                case "uml.EndState":
                                                                    result = 'EndState';
                                                                    metaData.style = 'color: blue; font-weight: 700;';
                                                                    break
                                                            }

                                                            return result;
                                                        }
                                                    }, {
                                                        width: 100,
                                                        dataIndex: 'flowstepstatusdescription',
                                                        renderer: function (value,metaData,record) {
                                                            var result = value,
                                                                elementtype = record.get('elementtype');

                                                            switch (elementtype) {
                                                                case "uml.StartState":
                                                                    result = '';
                                                                    break
                                                                case "uml.EndState":
                                                                    result = '';
                                                                    break
                                                            }

                                                            return result;
                                                        }
                                                    }
                                                ],
                                                listeners: {
                                                    select: 'onSelectFlowProcessingStep',
                                                    deselect: 'onDeSelectFlowProcessingStep'
                                                }
                                            }
                                        ]
                                    }, {
                                        xtype: 'splitter'
                                    }, {
                                        flex: 1,
                                        xtype: 'panel',
                                        layout: {
                                            type: 'vbox'
                                        },
                                        defaults: {
                                            width: '100%'
                                        },
                                        dockedItems: [
                                            {
                                                xtype: 'toolbar',
                                                items: [
                                                    {
                                                        margin: '10 0 0 10',
                                                        xtype: 'label',
                                                        name: 'processlabel',
                                                        cls: 'sub-title-label',
                                                        text: 'Processos'
                                                    }
                                                ]
                                            }
                                        ],
                                        items: [
                                            {
                                                flex: 1,
                                                xtype: 'dataview',
                                                trackOver: true,
                                                autoScroll: true,
                                                multiSelect: false,
                                                name: 'flowprocessingstepaction',
                                                store: 'flowprocessingstepaction',
                                                itemSelector: 'div.thumb-wrap',
                                                tpl: [
                                                    '<tpl for=".">',
                                                        '<div style="margin-bottom: 10px;" class="thumb-wrap">',
                                                            '<div class="thumb-action-{flowstepaction}"></div>',
                                                            '<span>',
                                                                '<a style="font-size: 14px;">{flowstepactiondescription}</a>',
                                                            '</span>',
                                                        '</div>',
                                                    '</tpl>'
                                                ],
                                                listeners: {
                                                    // select: 'onSelectDataView',
                                                    // deselect: 'onDeSelectDataView',
                                                    itemdblclick: 'onItemDblClickDataView'
                                                },
                                                emptyText: '<h4 style="text-align: center; line-height: 40px;" class="insert-record">Nenhum processo na etapa...</h4>'
                                            }
                                        ]
                                    }
                                ]
                            }, {
                                flex: 1,
                                xtype: 'dataview',
                                trackOver: true,
                                autoScroll: true,
                                multiSelect: false,
                                name: 'flowprocessingstepaction',
                                store: 'flowprocessingstepaction',
                                itemSelector: 'div.thumb-wrap',
                                tpl: [
                                    '<tpl for=".">',
                                    '<div style="margin-bottom: 10px;" class="thumb-wrap">',
                                    '<div class="thumb-flow-{flowstepaction}"></div>',
                                    '<span>',
                                    '<a style="font-size: 14px;">{flowstepactiondescription}</a>',
                                    '</span>',
                                    '</div>',
                                    '</tpl>'
                                ],
                                listeners: {
                                    // select: 'onSelectDataView',
                                    // deselect: 'onDeSelectDataView',
                                    // itemdblclick: 'onFlowStepAction'
                                },
                                emptyText: '<h4 style="text-align: center; line-height: 40px;" class="insert-record">Nenhum processo na etapa...</h4>'
                            }
                        ]
                    }
                ]
            }
        ];

    }

});