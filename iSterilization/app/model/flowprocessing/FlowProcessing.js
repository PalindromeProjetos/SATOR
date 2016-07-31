//@charset UTF-8
Ext.define( 'iSterilization.model.flowprocessing.FlowProcessing', {
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
            name: 'sterilizationtypeid',
            type: 'int'
        }, {
            name: 'sterilizationtypename',
            type: 'auto'
        }, {
            name: 'areasid',
            type: 'int'
        }, {
            name: 'areasname',
            type: 'auto'
        }, {
            name: 'materialid',
            type: 'int'
        }, {
            name: 'username',
            type: 'auto'
        }, {
            name: 'prioritylevel',
            type: 'auto'
        }, {
            name: 'dateof',
            type: 'auto'
        }, {
            name: 'materialboxid',
            type: 'int'
        }, {
            name: 'materialboxname',
            type: 'auto'
        }, {
            name: 'dateto',
            type: 'auto'
        }, {
            name: 'placeid',
            type: 'int'
        }, {
            name: 'clientid',
            type: 'int'
        }, {
            name: 'flowingid',
            type: 'int'
        }, {
            name: 'instrumentatorid',
            type: 'int'
        }, {
            name: 'surgicalwarning',
            type: 'auto'
        }, {
            name: 'patientname',
            type: 'auto'
        }, {
            name: 'flowstatus',
            type: 'auto'
        }, {
            name: 'flowstatusdescription',
            type: 'auto'
        }
    ]

});