//@charset UTF-8
Ext.define( 'iSterilization.store.flowprocessing.FlowProcessingHoldArea', {
    extend: 'Smart.data.StoreBase',

    alias: 'store.FlowProcessingHoldArea',

    storeId: 'flowprocessingholdarea',

    pageSize: 25,

    url: '../iSterilization/business/Calls/Heart/HeartFlowProcessing.php',

    controller: 'flowprocessing',

    fields: [
        {
            name: 'id',
            type: 'int'
        }, {
            name: 'item',
            type: 'int'
        }, {
            name: 'barcode',
            type: 'auto'
        }, {
            name: 'lineone',
            type: 'auto'
        }, {
            name: 'linetwo',
            type: 'auto'
        }, {
            name: 'movementdate',
            type: 'auto'
        }, {
            name: 'movementtype',
            type: 'auto'
        }, {
            name: 'movementtypedescription',
            type: 'auto'
        }, {
            name: 'releasestype',
            type: 'auto'
        }, {
            name: 'releasestypedescription',
            type: 'auto'
        }, {
            name: 'movementuser',
            type: 'auto'
        }, {
            name: 'patientname',
            type: 'auto'
        }, {
            name: 'dateof',
            type: 'auto'
        }, {
            name: 'timeof',
            type: 'auto'
        }
    ],

    config: {
        extraParams: {
            action: 'select',
            method: 'selectHoldArea'
        }
    }

});