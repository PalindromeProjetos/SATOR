//@charset UTF-8
Ext.define( 'iAdmin.view.helper.printserver.PrintServerSearch', {
    extend: 'Smart.form.field.ComboSearch',

    xtype: 'printserversearch',

    requires: [
        'Smart.form.field.ComboSearch',
        'iAdmin.store.helper.PrintServer'
    ],

    displayField: 'printlocate',

    pageSize: 0,
    showClear: true,

    store: 'iAdmin.store.helper.PrintServer'

});
