//@charset UTF-8
Ext.define( 'Smart.ux.app.Application', {
    extend: 'Ext.app.Application',

    requires: [
        'Ext.util.Cookies',
        'Smart.util.Message',
        'Ext.app.Application'
    ],

    url: '',

    init: function() {
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
        var me = this,
            workstation = localStorage.getItem('workstation'),
            loggedIn = localStorage.getItem(Ext.manifest.name + 'In');

        //<debug>
            Smart.appType = 'dev';
            document.cookie = 'XDEBUG_SESSION=PHPSTORM;path=/;';
        //</debug>

        me.redirectTo(Ext.manifest.name.toLowerCase());

        Ext.Ajax.request({
            scope: me,
            method: 'post',
            url: me.url,
            params: {
                action: 'select',
                method: 'selectOpened'
            },
            callback: function (options, success, response) {
                var workstation = localStorage.getItem('workstation'),
                    result = Ext.decode(response.responseText),
                    rows = result.rows[0];
                
                Smart.workstation = workstation ? Ext.decode(workstation) : null;

                if((result.success)&&(result.modulebuild != Ext.manifest.version)) {
                    success = false;
                    Smart.Msg.showToast('Você está executando uma versão diferente da atualmente homolagada!','warning');
                }

                if(loggedIn && success && result.success && (result.modulebuild == Ext.manifest.version)) {
                    var link = document.createElement('link'),
                        main = Ext.create({xtype:'app-main'}),
						imageInfo = Ext.decode(rows.logoinfo),
						photoInfo = Ext.decode(rows.fileinfo),
                        imageLogo = imageInfo ? Ext.String.format("data:{0};base64,{1}",imageInfo.fileType,rows.logodata) : null,
						photoData = photoInfo ? Ext.String.format("data:{0};base64,{1}",photoInfo.fileType,rows.filedata) : null;

                    main.down('image[name=filedata]').setSrc(photoData);
                    main.down('image[name=filelogo]').setSrc(imageLogo);
                    main.down('mainmodulesearch').setRawValue(rows.legalname);
                    main.down('tbtext[name=username]').update(Ext.String.format('<a>{0}</a>',rows.fullname));

                    link.href = imageLogo;
                    link.type = 'image/x-icon';
                    link.rel = 'shortcut icon';

                    document.getElementsByTagName('head')[0].appendChild(link);

                    if(result.isTest == true) {
                        Ext.getBody().getById('marquee').show();
                    }

                } else {
                    Ext.create({xtype:'login'});
                    if(Smart.workstation.session) {
                        Smart.Msg.showToast(Smart.workstation.session,'info');
                        Smart.workstation.session = null;
                        localStorage.setItem('workstation', Ext.encode(Smart.workstation));
                    }
                }
            }
        });

        Smart.workstation = workstation ? Ext.decode(workstation) : null;

        Ext.getBody().getById('preloader').hide();
        Ext.getBody().getById('buildapp').update('v'+Ext.manifest.version);

        // window.onbeforeunload = function () {
        //     Ext.Ajax.request({
        //         url: me.url,
        //         params: {
        //             action: 'select',
        //             method: 'selectLogout'
        //         }
        //     });
        // };
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