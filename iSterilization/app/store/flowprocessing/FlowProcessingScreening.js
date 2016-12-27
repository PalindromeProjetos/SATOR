//@charset UTF-8
Ext.define( 'iSterilization.store.flowprocessing.FlowProcessingScreening', {
    extend: 'Smart.data.StoreBase',

    alias: 'store.FlowProcessingScreening',

    storeId: 'flowprocessingscreening',

    requires: [
        'iSterilization.model.flowprocessing.FlowProcessingScreening'
    ],

    url: '../iSterilization/business/Calls/flowprocessingscreening.php',

    model: 'iSterilization.model.flowprocessing.FlowProcessingScreening'

});