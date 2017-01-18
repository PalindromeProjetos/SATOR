//@charset UTF-8
Ext.Loader.setConfig({
    enabled: true,
    paths: {
        'Smart.ux': '../library/ux',
        'Smart.app': '../library/app',
        'Smart.util': '../library/util',
        'Smart.data': '../library/data',
        'Smart.form': '../library/form',
        'Smart.plugins': '../library/plugins',
        'Smart.data.field': '../library/data/field',
        'Smart.form.field': '../library/form/field',
        'Smart.ux.app': '../library/ux/app',
        'Smart.ux.main': '../library/ux/main',
        'Smart.ux.login': '../library/ux/login',

        'iAdmin.store.helper': '../iAdmin/app/store/helper',
        'iAdmin.model.helper': '../iAdmin/app/model/helper',

        'iAdmin.view.helper.cmeareas': '../iAdmin/classic/src/view/helper/areas'
    }
});

Ext.application({
    name: 'iTools',

    extend: 'iTools.Application'

});
