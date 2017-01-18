//@charset UTF-8
Ext.define( 'iTools.Application', {
    extend: 'Ext.app.Application',
    
    name: 'iTools',

    controllers: [
        'iTools.controller.App'
    ],

    requires: [
        'iTools.view.login.Login'
    ],

    url: '../iAdmin/business/Calls/users.php',

    init: function () {
        var me = this;
        me.initQuickTips();

        Smart.app = me;
        Smart.appType = 'pro';
        Ext.USE_NATIVE_JSON = true;
        Ext.enableAriaButtons = false;
        Ext.setGlyphFontFamily('fontello');
        me.setDefaultToken(Ext.manifest.name.toLowerCase());
    },

    launch: function () {

        //<debug>
            Smart.appType = 'dev';
            document.cookie = 'XDEBUG_SESSION=PHPSTORM;path=/;';
        //</debug>

        Ext.getBody().getById('preloader').hide();

        Ext.create({ xtype: 'login' });
    },

    onAppUpdate: function () {
        var me = this;
        Ext.Msg.confirm('Atualizar a aplicação', 'Esta aplicação não está atualizada, recarregar?',
            function (choice) {
                if (choice === 'yes') {
                    me.redirectTo(Ext.manifest.name.toLowerCase());
                    window.location.reload();
                }
            }
        );
    }

});