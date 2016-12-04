//@charset UTF-8
Ext.define( 'iSterilization.model.flowprocessing.FlowProcessingCharge', {
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
            name: 'equipmentcycleid',
            type: 'int'
        }, {
            name: 'barcode',
            type: 'auto'
        }, {
            name: 'chargeuser',
            type: 'auto'
        }, {
            name: 'chargedate',
            type: 'auto'
        }, {
            name: 'chargeflag',
            type: 'auto'
        }, {
            name: 'cyclestart',
            type: 'auto'
        }, {
            name: 'cyclefinal',
            type: 'auto'
        }, {
            name: 'cyclestartuser',
            type: 'auto'
        }, {
            name: 'cyclefinaluser',
            type: 'auto'
        }, {
            name: 'duration',
            type: 'auto'
        }, {
            name: 'temperature',
            type: 'auto'
        }, {
            name: 'timetoopen',
            type: 'auto'
        }
    ]

});