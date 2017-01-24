//@charset UTF-8
Ext.define( 'iTools.view.main.Main', {
    extend: 'Ext.form.Panel',

    id: 'app-main',

    xtype: 'app-main',

    requires: [
        'Smart.util.Message',
        'Smart.util.IonSound',

        'Ext.form.Panel',
        'Ext.plugin.Viewport',
        'Smart.ux.main.MainModuleSearch',
        'iTools.view.main.MainController',
        'iAdmin.view.helper.areas.CMESubAreasSearch',
        'iAdmin.view.helper.printserver.PrintServerSearch'
    ],

    plugins: 'viewport',

    plain: true,

    controller: 'main',

    headerPosition: 'bottom',

    layout: {
        type: 'vbox',
        align: 'center'
    },

    listeners: {
        afterrender: 'onAfterRenderWorkstation'
    },

    initComponent: function () {
        var me = this;

        me.header = {
            title: Ext.manifest.name,
            items: [
                {
                    xtype: 'label',
                    text: Ext.manifest.version,
                    style: {
                        color: 'white;'
                    }
                }
            ]
        };

        me.buildItems();
        me.callParent();
    },

    buildItems: function () {
        var me = this;

        me.items = [
            {
                flex: 1,
                xtype: 'container'
            }, {
                xtype: 'container',
                name: 'areasname',
                width: 400,
                layout: 'fit',

                defaults: {
                    anchor: '100%'
                },

                items: [
                    {
                        xtype: 'label',
                        text: 'Workstation ...',
                        style: {
                            fontSize: '46px;',
                            display: 'table-cell;',
                            textAlign: 'center;',
                            lineHeight: '50px;'
                        }
                    }, {
                        height: 20,
                        xtype: 'container'
                    }, {
                        xtype: 'fieldcontainer',
                        layout: 'anchor',
                        defaultType: 'textfield',
                        defaults: {
                            anchor: '100%',
                            showClear: true,
                            allowBlank: true,
                            fieldCls: 'smart-field-style-login'
                        },
                        items: [
                            {
                                pageSize: 5,
                                editable: false,
                                allowBlank: false,
                                name: 'areasname',
                                cls: 'workstation',
                                fieldLabel: 'Área',
                                xtype: 'cmesubareassearch',
                                hiddenNameId: 'areasid',
                                listeners: {
                                    beforequery: function ( queryPlan , eOpts ) {
                                        queryPlan.combo.store.setPageSize(5);
                                    }
                                },
                                tpl: [
                                    '<tpl for=".">',
                                        '<div class="x-boundlist-item">',
                                            '<div style="font-size: 22px; line-height: 38px;">{name}</div>',
                                        '</div>',
                                    '</tpl>'
                                ]
                            }, {
                                pageSize: 0,
                                editable: false,
                                allowBlank: true,
                                name: 'printlocate',
                                cls: 'workstation',
                                fieldLabel: 'Impressora',
                                xtype: 'printserversearch',
                                hiddenNameId: 'printlocateid',
                                tpl: [
                                    '<tpl for=".">',
                                        '<div class="x-boundlist-item">',
                                            '<div style="font-size: 22px; line-height: 38px;">{printlocate}</div>',
                                        '</div>',
                                    '</tpl>'
                                ]
                            }, {
                                cls: 'workstation',
                                fieldLabel: 'Retornar',
                                matchFieldWidth: true,
                                xtype: 'mainmodulesearch'
                            }, {
                                height: 20,
                                xtype: 'container'
                            }, {
                                xtype: 'container',
                                layout: 'hbox',
                                defaultType: 'button',
                                defaults: {
                                    scale: 'large'
                                },
                                items: [
                                    {
                                        flex: 1,
                                        text: 'Salvar',
                                        formBind: true,
                                        listeners: {
                                            click: 'onUpdateWorkstation'
                                        }
                                    }, {
                                        xtype: 'splitter'
                                    }, {
                                        flex: 1,
                                        text: 'Encerrar',
                                        listeners: {
                                            click: 'onClosedWorkstation'
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }, {
                flex: 1,
                xtype: 'container'
            }
        ];
    }

});