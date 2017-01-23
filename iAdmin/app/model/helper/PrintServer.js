//@charset UTF-8
Ext.define( 'iAdmin.model.helper.PrintServer', {
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
            name: 'printlocate',
            type: 'auto'
        }, {
            name: 'description',
            type: 'auto'
        }
    ]

});