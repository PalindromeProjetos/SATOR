//@charset UTF-8
Ext.define( 'iAdmin.model.areas.Areas', {
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
            name: 'barcode',
            type: 'auto'
        }, {
            name: 'workstation',
            type: 'auto'
        }, {
            name: 'startreader',
            type: 'int',
            persist: true,
            critical: true
        }, {
            name: 'areastype',
            type: 'auto'
        }, {
            name: 'sterilizationflow',
            type: 'int'
        }, {
            name: 'sterilizationname',
            type: 'auto'
        }, {
            name: 'orderby',
            type: 'int',
            persist: true,
            critical: true
        }, {
            name: 'isactive',
            type: 'int',
            persist: true,
            critical: true
        }, {
            name: 'hasstock',
            type: 'int',
            persist: true,
            critical: true
        }
    ]

});