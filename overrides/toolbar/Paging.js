//@charset UTF-8
Ext.define( 'Ext.overrides.toolbar.Paging', {
    override: 'Ext.toolbar.Paging',


    initComponent: function () {
        var me = this;

        me.callParent();

        me.onAfter('afterrender', me.fnAfterRender, me);
    },

    fnAfterRender: function () {
        var me = this,
            next = me.down('#next'),
            last = me.down('#last'),
            prev = me.down('#prev'),
            first = me.down('#first'),
            inputItem = me.down('#inputItem');

        if(next){
            next.on("click", me.clickNext, me);
        }

        if(last){
            last.on("click", me.clickLast, me);
        }

        if(first){
            first.on("click", me.clickFirst, me);
        }

        if(prev){
            prev.on("click", me.clickPrior, me);
        }

        if(inputItem) {
            inputItem.on("specialkey", me.specialkeyInputItem, me);
        }
    },

    clickNext: Ext.emptyFn,
    clickLast: Ext.emptyFn,
    clickFirst: Ext.emptyFn,
    clickPrior: Ext.emptyFn,
    clickRefresh: Ext.emptyFn,
    specialkeyInputItem: Ext.emptyFn
    
});