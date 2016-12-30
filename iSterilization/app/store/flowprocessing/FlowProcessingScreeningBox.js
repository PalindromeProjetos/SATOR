//@charset UTF-8
Ext.define( 'iSterilization.store.flowprocessing.FlowProcessingScreeningBox', {
    extend: 'Smart.data.StoreBase',

    alias: 'store.FlowProcessingScreeningBox',

    storeId: 'flowprocessingscreeningbox',

    requires: [
        'iSterilization.model.flowprocessing.FlowProcessingScreeningBox'
    ],

    url: '../iSterilization/business/Calls/flowprocessingscreeningbox.php',

    model: 'iSterilization.model.flowprocessing.FlowProcessingScreeningBox',

    config: {
        extraParams: {
            action: 'select',
            method: 'selectItem'
        }
    }

});