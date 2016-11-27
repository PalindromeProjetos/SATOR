//@charset UTF-8
Ext.define( 'iSterilization.view.flowprocessing.FlowProcessingHold', {
    extend: 'Ext.form.Panel',

    xtype: 'flowprocessinghold',

    requires: [
        'Smart.util.IonSound',
        'iSterilization.store.flowprocessing.*',
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
        title: 'Movimentar Arsenal',
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

    updateType: function () {
        var me = this,
            holdview = me.down('flowprocessingholdview'),
            storeHold = me.down('gridpanel[name=releasesHold]').getStore();

        if(!Smart.workstation || !Smart.workstation.areasid) {
            Smart.Msg.showToast('Estação de Trabalho Não Configurada!','error');
            return false;
        }

        Ext.Ajax.request({
            scope: me,
            url: storeHold.getUrl(),
            params: storeHold.getExtraParams(),
            callback: function (options, success, response) {
                var result = Ext.decode(response.responseText);

                if(!success || !result.success) {
                    return false;
                }

                storeHold.removeAll();

                if(result.rows) {
                    storeHold.loadData(result.rows);
                }
            }
        });

        Ext.Ajax.request({
            scope: me,
            url: holdview.getUrl(),
            params: holdview.getParams(),
            callback: function (options, success, response) {
                var result = Ext.decode(response.responseText);

                if(!success || !result.success) {
                    return false;
                }


                Ext.each(result.rows,function (item) {
                    var record = holdview.store.findRecord('id',item.id);

                    if(!record) {
                        holdview.store.add(item);
                    }

                });

                holdview.store.each(function (record) {
                    var obj = Ext.Array.findBy(result.rows, function(item) {
                        if (item.id == record.get('id')) {
                            return true;
                        }
                    });

                    if(!obj) {
                        holdview.store.remove(record);
                    }
                });
            }
        });
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

        Ext.create('iSterilization.store.flowprocessing.FlowProcessingStepAction');

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
                        xtype: 'panel',
                        showSmartTransparent: true,
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
                                        var me = field.up('flowprocessinghold').down('flowprocessingholdview');

                                        me.store.clearFilter();

                                        if(['001','002','003','004'].indexOf(newValue.movementtype) != -1) {
                                            me.store.filter('movementtype', newValue.movementtype);
                                        }
                                    }
                                }
                            }
                        ]
                    }, {
                        xtype: 'splitter'
                    }, {
                        width: 385,
                        xtype: 'container',
                        layout: {
                            type: 'vbox',
                            align: 'stretch'
                        },
                        items: [
                            {
                                xtype: 'label',
                                cls: 'processing-field-font',
                                text: 'Processos',
                                name: 'labelitem'
                            }, {
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
                                        var view = field.up('flowprocessinghold');
                                        if ([e.ENTER].indexOf(e.getKey()) != -1) {
                                            view.fireEvent('queryreader', field, e, eOpts);
                                        }
                                    }
                                }
                            }, {
                                flex: 1,
                                // rowLines: true,
                                margin: '10 0 0 0',
                                xtype: 'gridpanel',
                                name: 'releasesHold',
                                cls: 'flowprocessinghold',
                                bodyStyle: 'background:transparent;',

                                url: '../iSterilization/business/Calls/Heart/HeartFlowProcessing.php',

                                params: {
                                    action: 'select',
                                    method: 'selectHold',
                                    areasid: Smart.workstation.areasid
                                },

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
                                        name: 'clientname',
                                        type: 'auto'
                                    }
                                ],

                                columns: [
                                    {
                                        flex: 1,
                                        renderer: function (value,metaData,record) {
                                            var barcode = record.get('barcode'),
                                                clientname = record.get('clientname'),
                                                materialname = record.get('materialname'),
                                                strRow =    '<div style="font-weight: 700; font-size: 16px; line-height: 24px;">' +
                                                                '<div>{0}</div><div>{1}</div><div>{2}</div>' +
                                                            '</div>';
                                            return Ext.String.format(strRow,clientname,materialname,barcode);
                                        }
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