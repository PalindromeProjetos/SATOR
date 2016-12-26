//@charset UTF-8
Ext.define( 'iSterilization.view.dashboard.DashBoardTemplate01', {
    extend: 'Ext.form.Panel',

    xtype: 'dashboardtemplate01',

    requires: [
        'Smart.util.IonSound',
        // 'iSterilization.store.dashboard.*',
        'iSterilization.view.dashboard.DashBoardController'
    ],

    layout: 'anchor',

    defaults: {
        anchor: '100%'
    },

    scrollable: 'y',

    controller: 'dashboard',
    bodyCls: 'dashboard c-dash',

    showSmartAnimate: true,

    header: false,

    initComponent: function () {
        var me = this;

        me.buildItems();
        me.callParent();
    },

    buildItems: function () {
        var me = this;

        me.items = [
            {
                xtype: 'container',
                layout: 'hbox',
                defaults: {
                    flex: 1
                },
                items: [
                    {
                        xtype: 'component',
                        html: [
                            '<div class="card-summary">',
                                '<div><i class="fa fa-share-alt"></i>  Total de Cargas</div>',
                                '<div class="total-value">2500</div>',
                            '</div>'
                        ]
                    }, {
                        xtype: 'component',
                        html: [
                            '<div class="card-summary">',
                                '<div class="b-left"></div>',
                                '<div class="b-right">',
                                    '<div>Total de Kits</div>',
                                    '<div class="total-value g-color">2,500</div>',
                                    '<div>Na ultima semana</div>',
                                '</div>',
                            '</div>'
                        ]
                    }, {
                        xtype: 'component',
                        html: [
                            '<div class="card-summary">',
                                '<div class="b-left"></div>',
                                '<div class="b-right">',
                                    '<div>Total de Itens</div>',
                                    '<div class="total-value">4,567</div>',
                                    '<div>Na ultima semana</div>',
                                '</div>',
                            '</div>'
                        ]
                    }, {
                        xtype: 'component',
                        html: [
                            '<div class="card-summary">',
                                '<div class="b-left"></div>',
                                '<div class="b-right">',
                                    '<div>Média por Carga</div>',
                                    '<div class="total-value">123.50</div>',
                                    '<div>Na ultima semana</div>',
                                '</div>',
                            '</div>'
                        ]
                    }, {
                        xtype: 'component',
                        html: [
                            '<div class="card-summary">',
                                '<div class="b-left"></div>',
                                '<div class="b-right">',
                                    '<div>Clientes Solicitantes</div>',
                                    '<div class="total-value">2,315</div>',
                                    '<div>Na ultima semana</div>',
                                '</div>',
                            '</div>'
                        ]
                    }, {
                        xtype: 'component',
                        html: [
                            '<div class="card-summary">',
                                '<div class="b-left"></div>',
                                '<div class="b-right">',
                                    '<div>Retornos confirmados</div>',
                                    '<div class="total-value">7,320</div>',
                                    '<div>Na ultima semana</div>',
                                '</div>',
                            '</div>'
                        ]
                    }
                ]
            }, {
                xtype: 'container',
                height: 20
            }, {
                border: true,
                xtype: 'panel',
                height: 340,
                layout: 'vbox',
                bodyCls: 'dashboard c-panel',
                items: [
                    {
                        xtype: 'container',
                        layout: 'hbox',
                        defaultType: 'label',
                        defaults: {
                            cls: 'title-label t-bold'
                        },
                        items: [
                            {
                                flex: 1,
                                style : 'padding: 8px 0 0 15px',
                                text: 'Cargas processadas'
                            }
                        ]
                    }
                ]
            }, {
                xtype: 'container',
                height: 20
            }, {
                xtype: 'container',
                layout: 'hbox',
                defaultType: 'panel',
                defaults: {
                    height: 340,
                    border: true,
                    bodyCls: 'dashboard c-panel'
                },
                items: [
                    {
                        flex: 1,
                        layout: 'vbox',
                        items: [
                            {
                                xtype: 'container',
                                layout: 'hbox',
                                defaultType: 'label',
                                defaults: {
                                    cls: 'title-label t-bold'
                                },
                                items: [
                                    {
                                        flex: 1,
                                        style : 'padding: 8px 0 0 15px',
                                        text: 'Cargas processadas'
                                    }
                                ]
                            }
                        ]
                    }, {
                        width: 20,
                        xtype: 'splitter'
                    }, {
                        flex: 2,
                        xtype: 'container',
                        layout: 'hbox',
                        defaultType: 'panel',
                        defaults: {
                            height: 340,
                            border: true,
                            bodyCls: 'dashboard c-panel'
                        },
                        items: [
                            {
                                flex: 1,
                                layout: 'vbox',
                                items: [
                                    {
                                        xtype: 'container',
                                        layout: 'hbox',
                                        defaultType: 'label',
                                        defaults: {
                                            cls: 'title-label t-bold'
                                        },
                                        items: [
                                            {
                                                flex: 1,
                                                style : 'padding: 8px 0 0 15px',
                                                text: 'Cargas processadas'
                                            }
                                        ]
                                    }
                                ]
                            }, {
                                width: 20,
                                xtype: 'splitter'
                            }, {
                                flex: 1,
                                layout: 'vbox',
                                items: [
                                    {
                                        xtype: 'container',
                                        layout: 'hbox',
                                        defaultType: 'label',
                                        defaults: {
                                            cls: 'title-label t-bold'
                                        },
                                        items: [
                                            {
                                                flex: 1,
                                                style : 'padding: 8px 0 0 15px',
                                                text: 'Cargas processadas'
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }, {
                xtype: 'container',
                height: 20
            }, {
                xtype: 'container',
                layout: 'hbox',
                defaultType: 'panel',
                defaults: {
                    height: 340,
                    border: true,
                    bodyCls: 'dashboard c-panel'
                },
                items: [
                    {
                        flex: 1,
                        layout: 'vbox',
                        items: [
                            {
                                xtype: 'container',
                                layout: 'hbox',
                                defaultType: 'label',
                                defaults: {
                                    cls: 'title-label t-bold'
                                },
                                items: [
                                    {
                                        flex: 1,
                                        style : 'padding: 8px 0 0 15px',
                                        text: 'Cargas processadas'
                                    }
                                ]
                            }
                        ]
                    }, {
                        width: 20,
                        xtype: 'splitter'
                    }, {
                        flex: 2,
                        layout: 'vbox',
                        items: [
                            {
                                xtype: 'container',
                                layout: 'hbox',
                                defaultType: 'label',
                                defaults: {
                                    cls: 'title-label t-bold'
                                },
                                items: [
                                    {
                                        flex: 1,
                                        style : 'padding: 8px 0 0 15px',
                                        text: 'Cargas processadas'
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