//@charset UTF-8
Ext.define( 'iAdmin.model.sterilizationtype.SterilizationType', {
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
            name: 'name',
            type: 'auto'
        }, {
            name: 'description',
            type: 'auto'
        }, {
            name: 'graphpaper',
            type: 'auto'
        }, {
            name: 'dataflowrule',
            type: 'auto'
        }, {
            name: 'dataflowstep',
            type: 'auto'
        }, {
            name: 'isactive',
            type: 'int'
        }
    ]

});