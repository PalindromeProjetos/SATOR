//@charset UTF-8
Ext.define( 'iSterilization.store.flowprocessing.FlowProcessingScreeningItem', {
    extend: 'Smart.data.StoreBase',

    alias: 'store.FlowProcessingScreeningItem',

    storeId: 'flowprocessingscreeningitem',

    requires: [
        'iSterilization.model.flowprocessing.FlowProcessingScreeningItem'
    ],

    url: '../iSterilization/business/Calls/flowprocessingscreeningitem.php',

    model: 'iSterilization.model.flowprocessing.FlowProcessingScreeningItem',

    config: {
        extraParams: {
            action: 'select',
            method: 'selectItem'
        }
    }

});