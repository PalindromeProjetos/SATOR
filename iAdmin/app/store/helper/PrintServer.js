//@charset UTF-8
Ext.define( 'iAdmin.store.helper.PrintServer', {
    extend: 'Smart.data.StoreBase',

    alias: 'store.PrintServer',

    storeId: 'printserver',

    requires: [
        'iAdmin.model.helper.PrintServer'
    ],

    url: '../iAdmin/business/Calls/printserver.php',

    model: 'iAdmin.model.helper.PrintServer'

});