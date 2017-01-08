//@charset UTF-8
Ext.define( 'iSterilization.view.flowprocessing.FlowProcessingView', {
    extend: 'Ext.form.Panel',

    xtype: 'flowprocessingview',

    id: 'flowprocessingview',

    requires: [
        'Ext.grid.Panel',
        'Ext.grid.column.*',
        'Smart.form.Portrait',
        'iSterilization.store.flowprocessing.*',
        'iSterilization.view.flowprocessing.FlowProcessingInput',
        'iSterilization.view.flowprocessing.FlowProcessingMaterial',
        'iSterilization.view.flowprocessing.FlowProcessingController'
    ],

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    controller: 'flowprocessing',
    bodyCls: 'step-processing',
    // cls: 'panel-frame panel-frame-tpTree',

    showSmartAnimate: true,

    header: false,

    html: '<div class="hold-close-btn"><i class="fa fa-arrow-left"></i></div>',

    listeners: {
        afterrender: 'onAfterRenderView',
        startreader: 'onStartReaderView'
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
                showSmartTransparent: true,
                items: [
                    {
                        xtype: 'hiddenfield',
                        name: 'id'
                    }, {
                        xtype: 'hiddenfield',
                        name: 'materialboxid'
                    }, {
                        margin: '10 0 0 0',
                        xtype: 'container',
                        layout: 'hbox',
                        items: [
                            {
                                flex: 1,
                                xtype: 'container',
                                layout: 'hbox',
                                defaultType: 'textfield',
                                defaults: {
                                    anchor: '100%',
                                    useReadColor: true,
                                    cls: 'processing-field',
                                    labelCls: 'processing-field-font'
                                },
                                items: [
                                    {
                                        flex: 1,
                                        fieldLabel: 'Operador',
                                        name: 'username'
                                    }, {
                                        xtype: 'splitter'
                                    }, {
                                        flex: 1,
                                        fieldLabel: 'Cliente',
                                        name: 'clientname'
                                    }
                                ]
                            }, {
                                xtype: 'splitter'
                            }, {
                                flex: 1,
                                xtype: 'container',
                                layout: 'hbox',
                                defaultType: 'textfield',
                                defaults: {
                                    anchor: '100%',
                                    useReadColor: true,
                                    cls: 'processing-field',
                                    labelCls: 'processing-field-font'
                                },
                                items: [
                                    {
                                        flex: 1,
                                        fieldLabel: 'Prioridade',
                                        name: 'priorityleveldescription'
                                    }, {
                                        xtype: 'splitter'
                                    }, {
                                        flex: 1,
                                        fieldLabel: 'Fluxo',
                                        name: 'sterilizationtypename'
                                    }
                                ]
                            }
                        ]
                    }, {
                        margin: '10 0 0 0',
                        xtype: 'container',
                        layout: 'hbox',
                        defaultType: 'textfield',
                        defaults: {
                            useReadColor: true,
                            anchor: '100%',
                            cls: 'processing-field',
                            labelCls: 'processing-field-font'
                        },
                        items: [
                            {
                                flex: 1,
                                xtype: 'container',
                                layout: 'hbox',
                                defaultType: 'textfield',
                                defaults: {
                                    useReadColor: true,
                                    anchor: '100%',
                                    cls: 'processing-field',
                                    labelCls: 'processing-field-font'
                                },
                                items: [
                                    {
                                        flex: 3,
                                        name: 'search',
                                        showClear: true,
                                        useUpperCase: true,
                                        useReadColor: false,
                                        fieldLabel: 'Leitura',
                                        inputType: 'password',
                                        cls: 'processing-field',
                                        labelCls: 'processing-field-font',
                                        listeners: {
                                            specialkey: function (field, e, eOpts) {
                                                if ([e.ESC].indexOf(e.getKey()) != -1) {
                                                    field.reset();
                                                }
                                                if ([e.TAB,e.ENTER].indexOf(e.getKey()) != -1) {
                                                    var view = field.up('flowprocessingview');
                                                    view.fireEvent('startreader', field, e, eOpts);
                                                    e.stopEvent();
                                                }
                                            }
                                        }
                                    }, {
                                        xtype: 'splitter'
                                    }, {
                                        flex: 3,
                                        columns: 4,
                                        vertical: false,
                                        fieldLabel: 'Filtrar',
                                        xtype: 'radiogroup',
                                        cls: 'flowprocessinghold',
                                        labelCls: 'processing-field-font',
                                        items: [
                                            { boxLabel: 'Todos', name: 'unconformities', inputValue: '000', checked: true },
                                            { boxLabel: 'Sim...', name: 'unconformities', inputValue: '001' },
                                            { boxLabel: 'Não...', name: 'unconformities', inputValue: '002' },
                                            { boxLabel: 'Outros', name: 'unconformities', inputValue: '003' }
                                        ],
                                        listeners: {
                                            change: function ( field , newValue , oldValue , eOpts) {
                                                var store = Ext.getStore('flowprocessingstepmaterial');

                                                store.clearFilter();

                                                switch(newValue.unconformities) {
                                                    case '001':
                                                        store.filter('unconformities', '010');
                                                        break;
                                                    case '002':
                                                        store.filter('unconformities', '001');
                                                        break;
                                                    case '003':
                                                        store.filterBy(function(rec) {
                                                            return (['001','010'].indexOf(rec.get('unconformities')) == -1);
                                                        });
                                                        break;
                                                }

                                                field.up('flowprocessingview').down('textfield[name=search]').focus(false,200);
                                            }
                                        }
                                    }
                                ]
                            }, {
                                xtype: 'splitter'
                            }, {
                                flex: 1,
                                xtype: 'container',
                                layout: 'hbox',
                                defaultType: 'textfield',
                                defaults: {
                                    useReadColor: true,
                                    anchor: '100%',
                                    cls: 'processing-field',
                                    labelCls: 'processing-field-font'
                                },
                                items: [
                                    {
                                        flex: 1,
                                        fieldLabel: 'Local',
                                        name: 'areasname'
                                    }, {
                                        xtype: 'splitter'
                                    }, {
                                        flex: 1,
                                        fieldLabel: 'Origem',
                                        name: 'originplace'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }, {
                xtype: 'splitter'
            }, {
                flex: 1,
                xtype: 'container',
                layout: {
                    type: 'hbox',
                    align: 'stretch'
                },
                items: [
                    {
                        flex: 1,
                        xtype: 'flowprocessingmaterial'
                    }, {
                        xtype: 'splitter'
                    }, {
                        flex: 1,
                        xtype: 'container',
                        layout: {
                            type: 'vbox',
                            align: 'stretch'
                        },
                        items: [
                            {
                                flex: 3,
                                xtype: 'container',
                                layout: {
                                    type: 'hbox',
                                    align: 'stretch'
                                },
                                items: [
                                    {
                                        flex: 1,
                                        dockedItems: [
                                            {
                                                xtype: 'container',
                                                layout: 'hbox',
                                                items: [
                                                    {
                                                        flex: 1,
                                                        height: 26,
                                                        xtype: 'container',
                                                        name: 'colorschema'
                                                    }, {
                                                        width: 120,
                                                        margin: '0 0 6 0',
                                                        xtype: 'label',
                                                        cls: 'processing-field-font',
                                                        text: 'Imagem',
                                                        style: {
                                                            'text-align': 'right;'
                                                        }
                                                    }
                                                ]
                                            }
                                        ],
                                        hideButtons: true,
                                        xtype: 'portrait',
                                        cls: 'processing-panel-header-flow'
                                    }, {
                                        xtype: 'splitter'
                                    }, {
                                        flex: 1,
                                        xtype: 'flowprocessinginput'
                                    }
                                ]
                            }, {
                                xtype: 'splitter'
                            }, {
                                flex: 2,
                                xtype: 'flowprocessingmessage'
                            }
                        ]
                    }
                ]
            }
        ];
    }

});