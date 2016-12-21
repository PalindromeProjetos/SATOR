//@charset UTF-8
Ext.define( 'iSterilization.store.flowprocessing.FlowProcessingChargeItem', {
    extend: 'Smart.data.StoreBase',

    alias: 'store.FlowProcessingChargeItem',

    storeId: 'flowprocessingchargeitem',

    pageSize: 0,

    requires: [
        'iSterilization.model.flowprocessing.FlowProcessingChargeItem'
    ],

    url: '../iSterilization/business/Calls/flowprocessingchargeitem.php',

    model: 'iSterilization.model.flowprocessing.FlowProcessingChargeItem',

    config: {
        extraParams: {
            action: 'select',
            method: 'selectItem'
        }
    }

});