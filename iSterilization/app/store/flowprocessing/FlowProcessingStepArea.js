//@charset UTF-8
Ext.define( 'iSterilization.store.flowprocessing.FlowProcessingStepArea', {
    extend: 'Smart.data.StoreBase',

    alias: 'store.FlowProcessingStepArea',

    storeId: 'flowprocessingsteparea',

    pageSize: 25,

    url: '../iSterilization/business/Calls/Heart/HeartFlowProcessing.php',

    fields: [
        {
            name: 'id',
            type: 'int'
        }, {
            name: 'flowprocessingstepid',
            type: 'int'
        }, {
            name: 'flowprocessingid',
            type: 'int'
        }, {
            name: 'flowstepaction',
            type: 'auto'
        }, {
            name: 'isactive',
            type: 'int'
        }, {
            name: 'username',
            type: 'auto'
        }, {
            name: 'barcode',
            type: 'auto'
        }, {
            name: 'patientname',
            type: 'auto'
        }, {
            name: 'dateof',
            type: 'auto'
        }, {
            name: 'dateto',
            type: 'auto'
        }, {
            name: 'timeof',
            type: 'auto'
        }, {
            name: 'clientname',
            type: 'auto'
        }, {
            name: 'originplace',
            type: 'auto'
        }, {
            name: 'targetplace',
            type: 'auto'
        }, {
            name: 'authorizedby',
            type: 'auto'
        }, {
            name: 'sterilizationtypename',
            type: 'auto'
        }, {
            name: 'version',
            type: 'int'
        }, {
            name: 'steptype',
            type: 'auto'
        }, {
            name: 'donetype',
            type: 'auto'
        }, {
            name: 'items',
            type: 'int'
        }, {
            name: 'materialname',
            type: 'auto'
        }
    ],

    config: {
        extraParams: {
            action: 'select',
            method: 'selectArea'
        }
    }

});