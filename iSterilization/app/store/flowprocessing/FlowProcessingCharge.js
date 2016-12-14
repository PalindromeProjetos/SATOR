//@charset UTF-8
Ext.define( 'iSterilization.store.flowprocessing.FlowProcessingCharge', {
    extend: 'Smart.data.StoreBase',

    alias: 'store.FlowProcessingCharge',

    storeId: 'flowprocessingcharge',

    requires: [
        'iSterilization.model.flowprocessing.FlowProcessingCharge'
    ],

    url: '../iSterilization/business/Calls/flowprocessingcharge.php',

    model: 'iSterilization.model.flowprocessing.FlowProcessingCharge',

    config: {
        extraParams: {
            action: 'select',
            method: 'selectCode'
        }
    }

});