//@charset UTF-8
Ext.define( 'iSterilization.view.flowprocessing.SearchMaterial', {
    extend: 'Smart.form.field.ComboSearch',

    xtype: 'searchmaterial',

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
        method: 'selectOpenMaterial'
    },

    fields: [
        {
            name: 'id',
            type: 'int'
        }, {
            name: 'name',
            type: 'auto'
        }, {
            name: 'description',
            type: 'auto'
        }, {
            name: 'materialboxid',
            type: 'int'
        }, {
            name: 'barcode',
            type: 'auto'
        }, {
            name: 'manufacturername',
            type: 'auto'
        }, {
            name: 'filedata',
            type: 'auto',
            convert: function (value,record) {
                return (value) ? value : Smart.Rss.getFileImage('smart');
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
            name: 'sterilizationtypeid',
            type: 'int'
        }, {
            name: 'sterilizationtypename',
            type: 'auto'
        }, {
            name: 'prioritylevel',
            type: 'auto'
        }, {
            name: 'priorityleveldescription',
            type: 'auto'
        }, {
            name: 'sterilizationpriority',
            type: 'auto'
        }
    ],

    tpl: [
        '<tpl for=".">',
            '<div class="x-boundlist-item" style="height: 80px;" data-qtip="{description}">',
                '<div style="float: left; height: 80px; width: 120px; margin-right: 10px;">',
                    '<img src="{filetype}" style="height: 100%; width: 100%;">',
                '</div>',
                '<div style="font-size: 22px; line-height: 40px; background-color: rgba(231, 242, 225, 1); color: black;">{materialname}</div>',
                '<div style="font-size: 16px; line-height: 20px; background-color: rgba(250, 241, 210, .4);">{manufacturername}</div>',
                '<div style="font-size: 14px; line-height: 20px; background-color: rgba(250, 241, 210, .4);">Código de Barras: <a style="color: red;">{barcode}</a></div>',
            '</div>',
        '</tpl>'
    ]

});