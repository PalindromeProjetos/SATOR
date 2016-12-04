//@charset UTF-8
Ext.define( 'iAdmin.model.users.UsersMenu', {
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
            name: 'usersid',
            type: 'int',
            critical: true
        }, {
            name: 'menuid',
            type: 'int',
            critical: true
        }, {
            name: 'name',
            type: 'auto',
            persist: false
        }, {
            name: 'isfavorite',
            type: 'int',
            critical: true,
            persist: true
        }
    ]

});