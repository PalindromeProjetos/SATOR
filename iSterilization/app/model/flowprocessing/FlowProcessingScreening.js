//@charset UTF-8
Ext.define( 'iSterilization.model.flowprocessing.FlowProcessingScreening', {
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
            name: 'areasid',
            type: 'int'
        }, {
            name: 'screeninguser',
            type: 'auto'
        }, {
            name: 'screeningdate',
            type: 'auto',
            serializeType: 'date',
            convert: function (value, record) {
                return ( !value || value.length == 0) ? null : Ext.util.Format.date(value,'d/m/Y');
            }
        }, {
            name: 'closedby',
            type: 'auto'
        }, {
            name: 'closeddate',
            type: 'auto'
        }, {
            name: 'screeningflag',
            type: 'auto'
        }
    ]

});