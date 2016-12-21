//@charset UTF-8
Ext.define( 'iSterilization.store.flowprocessing.FlowProcessingStepMaterial', {
    extend: 'Smart.data.StoreBase',

    alias: 'store.FlowProcessingStepMaterial',

    storeId: 'flowprocessingstepmaterial',

    pageSize: 0,

    requires: [
        'iSterilization.model.flowprocessing.FlowProcessingStepMaterial'
    ],

    url: '../iSterilization/business/Calls/flowprocessingstepmaterial.php',

    model: 'iSterilization.model.flowprocessing.FlowProcessingStepMaterial',

    config: {
        extraParams: {
            params: [],
            action: 'select',
            method: 'selectCode'
        }
    }

});