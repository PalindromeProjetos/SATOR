//@charset UTF-8
Ext.define( 'Smart.ux.main.MainController', {
    extend: 'Ext.app.ViewController',

    requires: [
        'Ext.Ajax',
        'Ext.app.ViewController'
    ],

    url: '',

    init: function () {
        var me = this;

        if(!Smart.workstation) {
            Smart.Msg.showToast('Estação de Trabalho Não Configurada!','warning','b');
        }

        me.callParent();
    },

    //storeField: function ( field, newValue, oldValue, eOpts ) {
    //    var store = Ext.getStore("modulemenudock");
    //
    //    store.clearFilter();
    //    store.filter('name',newValue);
    //}

    storeField: function ( field, newValue, oldValue, eOpts ) {
        Ext.getStore("modulemenudock").setParams({
            query: newValue,
            module: Ext.manifest.name
        }).load();
    },

    onRedirectModule: function (combo, record, eOpts) {
        var name = record.get('name'),
            origin = window.location.origin,
            pathname = window.location.pathname,
            pattern = new RegExp(Ext.manifest.name, 'gi'),
            href = origin + pathname.replace(pattern, name);

        window.location.replace(href);
    },

    onMainRender: function () {
        var me = this,
            button = me.lookupReference('navBtn');

        button.setPressed();

        me.onToggleNav(button,true);

        Ext.getStore('modulemenutree').load({params: { module: Ext.manifest.name }});
    },

    onDockRender: function () {
        Ext.getStore('modulemenudock').load({params: { module: Ext.manifest.name }});
    },

    onViewEditShow: function(viewView, record, item, index, e, eOpts) {
        var me = this,
            view = me.getView(),
            router = record.get('router'),
            iconCls = record.get('glyph');

        if(!Ext.WindowMgr.get(router)) {
            view.close();
            Ext.widget(router, { id: router, iconCls: iconCls }).show();
        }
    },

	onDockToggle: function (button, pressed) {
        var me = this,
            view = me.getView();

		if(!Ext.WindowMgr.get('maindock')) {
            var height = view.down('container[name=centerarea]').getHeight();
            view.maindock = Ext.widget('maindock', { xview: view, id: 'maindock', height: height });
            view.maindock.show(null,function () {
                this.down('textfield[name=search]').focus(false,200);
            });
        } else {
            view.maindock.hide();
        }
    },
	
    onComeLogOut: function (button, pressed) {
        var me = this;

        Ext.Msg.confirm('Encerrar a aplicação!', 'Esta aplicação será encerrada após a confirmação!',
            function (choice) {
                if (choice === 'yes') {
                    Ext.Ajax.request({
                        scope: me,
                        url: me.url,
                        method: 'post',
                        params: {
                            action: 'select',
                            method: 'selectLogout'
                        },
                        callback: function (options, success, response) {
                            if(success) {
                                localStorage.removeItem(Ext.manifest.name + 'In');
                                me.redirectTo(Ext.manifest.name.toLowerCase());
                                window.location.reload();
                            }
                        }
                    });
                }
            }
        );
    },

    onToggleScreen: function () {
        var me = this;
        me.togglesFullscreen();
    },

    onToggleConfig: function (menuitem) {
        var me = this,
            view = me.getView(),
            treelist = view.down('treelist');

        treelist.setConfig(menuitem.config, menuitem.checked);
    },

    onToggleMicro: function (button, pressed) {
        var me = this,
            view = me.getView(),
            treelist = view.down('treelist'),
            navBtn = this.lookupReference('navBtn'),
            ct = treelist.ownerCt;

        treelist.setMicro(pressed);

        if (pressed) {
            button.setPressed(true);
            navBtn.setPressed(true);
            navBtn.disable();
            // this.oldWidth = ct.width;
            ct.setWidth(44);
        } else {
            button.setPressed(false);
            ct.setWidth(250);
            // ct.setWidth(this.oldWidth);
            navBtn.enable();
        }

        // IE8 has an odd bug with handling font icons in pseudo elements;
        // it will render the icon once and not update it when something
        // like text color is changed via style addition or removal.
        // We have to force icon repaint by adding a style with forced empty
        // pseudo element content, (x-sync-repaint) and removing it back to work
        // around this issue.
        // See this: https://github.com/FortAwesome/Font-Awesome/issues/954
        // and this: https://github.com/twbs/bootstrap/issues/13863
        if (Ext.isIE8) {
            this.repaintList(treelist, pressed);
        }
    },

    onToggleNav: function (button, pressed) {
        var me = this,
            view = me.getView(),
            treelist = view.down('treelist'),
            ct = view.down('panel[name=westpage]');

        treelist.setExpanderFirst(!pressed);
        treelist.setUi(pressed ? 'nav' : null);
        treelist.setHighlightPath(pressed);
        ct[pressed ? 'addCls' : 'removeCls']('treelist-with-nav');

        if (Ext.isIE8) {
            this.repaintList(treelist);
        }
    },

    repaintList: function(treelist, microMode) {
        treelist.getStore().getRoot().cascadeBy(function(node) {
            var item, toolElement;

            item = treelist.getItem(node);

            if (item && item.isTreeListItem) {
                if (microMode) {
                    toolElement = item.getToolElement();

                    if (toolElement && toolElement.isVisible(true)) {
                        toolElement.syncRepaint();
                    }
                }
                else {
                    if (item.element.isVisible(true)) {
                        item.iconElement.syncRepaint();
                        item.expanderElement.syncRepaint();
                    }
                }
            }
        });
    }

});