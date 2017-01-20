//@charset UTF-8
Ext.define( 'Smart.ux.main.Main', {
    extend: 'Ext.panel.Panel',

    id: 'app-main',

    requires: [
        'Ext.list.Tree',
        'Ext.plugin.Viewport',
        'Smart.ux.main.MainModuleSearch'
    ],

    plugins: 'viewport',

    layout: 'border',

    plain: true,

    module: {},

    initComponent: function () {
        var me = this;
        me.makeDocked();
        me.buildItems();
        me.callParent();
    },

    makeDocked: function () {
        var me = this;

        me.dockedItems = [
            {
                xtype: 'toolbar',
                cls: 'panel-shadow main-treelist-height main-toolbar-color',
                defaults: {
                    scale: 'large',
                    showSmartTheme: 'noborder'
                },
                items: [
                    {
                        margin: '0 0 0 4',
                        width: 42,
                        height: 42,
                        xtype: 'image',
                        name: 'filelogo'
                    }, {
                        width: 300,
                        xtype: 'mainmodulesearch'
                    }, {
                        xtype: 'tbfill'
                    }, {
                        xtype: 'tbtext',
                        name: 'username'
                    }, {
                        xtype: 'splitter'
                    }, {
                        width: 42,
                        height: 42,
                        xtype: 'image',
                        name: 'filedata',
                        style: {
                            'border-radius': '50%;'
                        }
                    }, {
                        iconCls: 'fa fa-indent',
                        enableToggle: true,
                        reference: 'navBtn',
                        toggleHandler: 'onToggleNav'
                    }, {
                        iconCls: 'fa fa-bars',
                        enableToggle: true,
                        toggleHandler: 'onToggleMicro'
                    }, {
                        iconCls: 'fa fa-times',
                        showSmartTheme: 'darkred',
                        handler: 'onComeLogOut'
                    }, {
                        iconCls: "fa fa-desktop",
                        showSmartTheme: 'darkred',
                        handler: 'onToggleScreen'
                    }, {
                        iconCls: "fa fa-cogs",
                        showSmartTheme: 'darkred',
                        handler: 'onDockToggle'
                    }
                ]
            }
        ];
    },

    buildItems: function () {
        var me = this;

        me.items = [
            {
                region: 'west',
                xtype: 'panel',
                name: 'westpage',
                width: 250,
                border: false,
                layout: 'fit',
                items: [
                    {
                        ui: 'nav',
                        xtype: 'treelist',
                        store: 'modulemenutree'
                    }
                ]
            }, {
                region: 'center',
                xtype: 'panel',
				layout: 'fit',
				items: [
					{
						xtype: 'container',
						layout: 'border',
                        name: 'centerarea',
						items: [
							{
								name: 'centerpage',
                                region: 'center',
								xtype: 'panel',
								cls: 'smart-background',
								layout: 'fit',
								defaults: {
									bodyPadding: 10
								},
								bodyStyle: 'padding: 20px'
							}
						]
					}
				]
            }
        ]
    },

    listeners: {
        render: 'onMainRender'
    }

});