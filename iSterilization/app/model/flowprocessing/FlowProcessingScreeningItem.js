//@charset UTF-8
Ext.define( 'iSterilization.model.flowprocessing.FlowProcessingScreeningItem', {
    extend: 'Ext.data.Model',

    requires: [
        'Smart.data.identifier.Auto'
    ],

    identifier: 'auto',

    fields: [
        {
            name: 'id',
            type: 'int',
            serializeType: 'auto'
        }, {
            name: 'flowprocessingscreeningid',
            type: 'int'
        }, {
            name: 'barcode',
            type: 'auto'
        }, {
            name: 'materialid',
            type: 'int'
        }, {
            name: 'materialboxid',
            type: 'int'
        }, {
            name: 'materialname',
            type: 'auto'
        }, {
            name: 'colorschema',
            type: 'auto'
        }, {
            name: 'colorpallet',
            type: 'colorpallet'
        }, {
            name: 'armorymovementoutputid',
            type: 'int'
        }, {
            name: 'clientid',
            type: 'int'
        }, {
            name: 'clientname',
            type: 'auto'
        }, {
            name: 'sterilizationtypeid',
            type: 'int'
        }, {
            name: 'sterilizationtypename',
            type: 'auto'
        }, {
            name: 'dataflowstep',
            type: 'auto'
        }, {
            name: 'hasexception',
            type: 'auto'
        }
    ]

});