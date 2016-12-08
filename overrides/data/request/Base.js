//@charset UTF-8
Ext.define( 'Ext.overrides.data.request.Base', {
    override: 'Ext.data.request.Base',

    headers: {
        'Foo': 'bar',
        'Faa': 'bor'
    }

});