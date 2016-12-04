//@charset UTF-8
Ext.define( 'Smart.ux.login.LoginController', {
    extend: 'Ext.app.ViewController',

    requires: [
        'Smart.util.Message'
    ],

    onComeInSend: function() {
        var me = this,
            view = me.getView(),
            form = view.down('logincomein');

        if(!form.isValid()) {
            return false;
        }

        view.setLoading('Autenticando usuário...');

        form.submit({
            scope: me,
            url: me.url,
            clientValidation: true,
            params: {
                action: 'select',
                method: 'selectComein',
                module: Ext.manifest.name,
                fields: Ext.encode(['id','username','fullname','password','filedata','fileinfo','isactive'])
            },
            success: me.onComeInSendSuccess,
            failure: me.onFormSubmitFailure
        });

    },

    onForgotSend: function() {
        var me = this,
            view = me.getView(),
            form = view.down('loginforgot');

        if(!form.isValid()) {
            return false;
        }

        view.setLoading('Gerando senha convite...');

        form.submit({
            scope: me,
            url: me.url,
            clientValidation: true,
            params: {
                action: 'select',
                method: 'selectUserForgot',
                rows: Ext.encode(form.getValues())
            },
            success: function() {
                me.onInviteGoView();
                view.setLoading(false);
                form.reset();
            },
            failure: me.onFormSubmitFailure
        });

    },

    onInviteSend: function() {
        var me = this,
            view = me.getView(),
            form = view.down('logininvite');

        if(!form.isValid()) {
            return false;
        }

        view.setLoading('Validando senha convite...');

        form.submit({
            scope: me,
            url: me.url,
            clientValidation: true,
            params: {
                action: 'select',
                method: 'selectUserInvite',
                rows: Ext.encode(form.getValues())
            },
            success: function() {
                me.onComeInGoView();
                view.setLoading(false);
                form.reset();
            },
            failure: me.onFormSubmitFailure
        });
    },

    onInviteGoView: function () {
        var me = this,
            layout = me.getView().down('container[name=userlogin]').getLayout();
        layout.setActiveItem(2);
    },

    onForgotGoView: function () {
        var me = this,
            layout = me.getView().down('container[name=userlogin]').getLayout();
        layout.setActiveItem(1);
    },

    onComeInGoView: function () {
        var me = this,
            layout = me.getView().down('container[name=userlogin]').getLayout();
        layout.setActiveItem(0);
    },

    onFormSubmitFailure: function (form, action) {
        var me = this,
            view = me.getView();

        view.setLoading(false);

        Smart.Msg.submitFailure(form, action);
    },

    onComeInSendSuccess: function (form, action) {
        var me = this,
            view = me.getView(),
            workstation = localStorage.getItem('workstation'),
            result = Ext.decode(action.response.responseText),
            rows = result.rows[0];

        view.setLoading(false);

        Smart.workstation = workstation ? Ext.decode(workstation) : null;

        if(result.modulebuild != Ext.manifest.version) {
            Smart.Msg.showToast('Você está executando uma versão diferente da atualmente homolagada!','warning');
            window.location.reload();
        }

        localStorage.setItem(Ext.manifest.name + 'In', true);

        view.destroy();

        if(result.success) {
            var link = document.createElement('link'),
                main = Ext.create({xtype:'app-main'}),
                imageInfo = Ext.decode(rows.logoinfo),
                photoInfo = Ext.decode(rows.fileinfo),
                imageLogo = imageInfo ? Ext.String.format("data:{0};base64,{1}", imageInfo.fileType, rows.logodata) : null,
                photoData = photoInfo ? Ext.String.format("data:{0};base64,{1}", photoInfo.fileType, rows.filedata) : null;

            main.down('image[name=filedata]').setSrc(photoData);
            main.down('image[name=filelogo]').setSrc(imageLogo);
            main.down('mainmodulesearch').setRawValue(rows.legalname);
            main.down('tbtext[name=username]').update(Ext.String.format('<a>{0}</a>',rows.fullname));

            link.href = imageLogo;
            link.type = 'image/x-icon';
            link.rel = 'shortcut icon';

            Ext.getBody().onBefore('unload', 'onUnLoad', this);

            document.getElementsByTagName('head')[0].appendChild(link);

            if(result.isTest == true) {
                Ext.getBody().getById('marquee').show();
            }
        }
    },

    onUnLoad: function (e, t, eOpts) {
        Ext.Ajax.request({
            scope: this,
            url: this.url,
            method: 'post',
            params: {
                action: 'select',
                method: 'selectLogout'
            },
            callback: function (options, success, response) {
                if(success) {
                    localStorage.removeItem(Ext.manifest.name + 'In');
                }
            }
        });
    }

});