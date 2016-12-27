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
            name: 'materialid',
            type: 'int'
        }, {
            name: 'materialboxid',
            type: 'int'
        }, {
            name: 'clientid',
            type: 'int'
        }
    ]

});