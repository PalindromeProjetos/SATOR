//@charset UTF-8
Ext.define( 'iAdmin.model.users.Users', {
    extend: 'Ext.data.Model',

    requires: [
        'Smart.util.Resource',
        'Smart.data.identifier.Auto'
    ],

    identifier: 'auto',

    fields: [
        {
            name: 'id',
            type: 'int',
            serializeType: 'auto'
        }, {
            name: 'username',
            type: 'auto'
        }, {
            name: 'password',
            type: 'auto'
        }, {
            name: 'isactive',
            type: 'int'
        }, {
            name: 'fullname',
            type: 'auto'
        }, {
            name: 'mainmail',
            type: 'auto'
        }, {
            name: 'birthdate',
            type: 'auto'
        }, {
            name: 'notifyuser',
            type: 'int'
        }, {
            name: 'filedata',
            type: 'auto',
            convert: function (value,record) {
                return (value) ? value : Smart.Rss.getFileImage('users');
            }
        }, {
            name: 'fileinfo',
            type: 'auto'
        }, {
            name: 'filetype',
            type: 'auto',
            convert: function (value,record) {
                var info = record.get('fileinfo'),
                    type = (info && info.length !== 0) ? Ext.decode(info) : null;
                return (type) ? Ext.String.format('data:{0};base64,{1}',type.fileType,record.get('filedata')) : record.get('filedata');
            }
        }, {
            name: 'lastactivity',
            type: 'auto'
        }
    ]

});