//@charset UTF-8
Ext.define( 'iSterilization.model.flowprocessing.FlowProcessingScreeningBox', {
    extend: 'Ext.data.Model',

    requires: [
        'Smart.data.identifier.Auto',
        'Smart.data.field.ColorPallet'
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
            name: 'materialname',
            type: 'auto'
        }, {
            name: 'colorschema',
            type: 'auto'
        }, {
            name: 'colorpallet',
            type: 'colorpallet'
        }, {
            name: 'items',
            type: 'int'
        }, {
            name: 'loads',
            type: 'int'
        }, {
            name: 'score',
            type: 'auto',
            convert: function (value,record) {
                var items = record.get('items'),
                    loads = record.get('loads');

                return Ext.String.format('{0}/{1}',loads,items);
            }
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
        }, {
            name: 'clientid',
            type: 'int',
            persist: true,
            critical: true
        }, {
            name: 'clientname',
            type: 'auto'
        }
    ]

});