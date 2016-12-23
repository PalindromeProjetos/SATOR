//@charset UTF-8
Ext.define( 'Smart.ux.login.Login', {
    extend: 'Ext.panel.Panel',

    requires: [
        'Ext.panel.Panel',
        'Ext.plugin.Viewport',
        'Ext.container.Container',
        'Smart.ux.login.LoginComeIn',
        'Smart.ux.login.LoginForgot',
        'Smart.ux.login.LoginInvite'
    ],

    plugins: 'viewport',

    headerPosition: 'bottom',

    layout: {
        type: 'vbox',
        align: 'center'
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
                // flex: 2,
                xtype: 'container',
                name: 'userlogin',
                width: 400,
                layout: 'card',
                items: [
                    {
                        xtype: 'logincomein'
                    }, {
                        xtype: 'loginforgot'
                    }, {
                        xtype: 'logininvite'
                    }
                ]
            }, {
                flex: 1,
                xtype: 'container'
            }
        ];
    }

});