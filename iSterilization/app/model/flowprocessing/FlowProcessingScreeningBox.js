//@charset UTF-8
Ext.define( 'iSterilization.model.flowprocessing.FlowProcessingScreeningBox', {
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
            name: 'materialboxid',
            type: 'int'
        }, {
            name: 'materialboxname',
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
        }
    ]

});