//@charset UTF-8
Ext.define( 'iSterilization.view.flowprocessing.SearchCycle', {
    extend: 'Smart.form.field.ComboSearch',

    xtype: 'searchcycle',

    requires: [
        'Smart.util.Resource',
        'Smart.form.field.ComboSearch'
    ],

    displayField: 'name',

    pageSize: 0,
    showClear: true,

    url: '../iSterilization/business/Calls/flowprocessing.php',

    params: {
        action: 'select',
        method: 'selectCycle'
    },

    fields: [
        {
            name: 'id',
            type: 'int'
        }, {
            name: 'name',
            type: 'auto'
        }, {
            name: 'duration',
            type: 'int'
        }, {
            name: 'temperature',
            type: 'auto'
        }, {
            name: 'timetoopen',
            type: 'auto'
        }
    ]


});
