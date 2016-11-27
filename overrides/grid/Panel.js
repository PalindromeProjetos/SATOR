//@charset UTF-8
Ext.define( 'Ext.overrides.grid.Panel', {
    override: 'Ext.grid.Panel',

    rowLines: false,

    config: {
        url: null,
        fields: null,
        params: {
            query: '%',
            action: 'select',
            method: 'selectLike',
            field: 'description'
        }
    },
	
	initComponent: function () {
        var me = this;

        me.initConfig();
        me.buildStore();
        me.callParent();
    },

    buildStore: function () {
        var me = this;

        if(me.getFields()) {
            me.store = Ext.create(
                Ext.define( me.getXType() + 'Store', {
                    extend: 'Smart.data.StoreBase',
                    url: me.getUrl(),
                    storeId: me.getXType(),
                    fields: me.getFields()
                })
            ).setParams(me.params);
        }
    },

    buildTools: function () {
        
    }

});