//@charset UTF-8
Ext.define( 'Ext.overrides.panel.Table', {
    override: 'Ext.panel.Table',

    rowLines: false,
    hideHeaders: true,
    insertRecord: false,
    recordsRenderer: false,

    getEmptyTextElement: function () {
        var me = this,
            empty = [
                '<h4 style="text-align: center; line-height: 40px;" class="insert-record">Nenhum dado disponível...</h4>',
                '<div style="justify-content: center;"><h3 class="insert-record smart-btn-insert-record">Novo Registro</h3></div>'
            ];

        return me.insertRecord ? empty[1] : empty[0];
    },

    initComponent: function () {
        var me = this;

        me.viewConfig = {
            deferEmptyText: false,
            loadMask: { msg: 'Carregando dados...!' },
            emptyText: me.getEmptyTextElement()
        };

        me.callParent();

        me.onAfter( 'afterrender', me.fnAfterRender, me);
        me.onBefore( 'beforerender', me.fnBeforeRender, me);
    },

    fnAfterRender: function () {
        var me = this;
        if(me.insertRecord) {
            me.el.on('click', function (event, target) {
                me.fireEvent('insertrecord', me, me.store, event, target);
            }, null, {
                delegate: 'h3.insert-record'
            });
        }
    },

    fnBeforeRender: function (view, eOpts) {
        var me = this;

        if(me.columnsRenderer) {
            Ext.each(me.columns,function(column) {
                if(column.renderer === false) {
                    column.renderer = me.columnsRenderer;
                };
            });
        }
    },

    addColumn: function (column, colIndex, typeField) {
        var me = this,
            model = me.getStore().model.prototype,
            prototypeFields = model.fields,
            fields = prototypeFields.getRange(),
            typeField = typeField || 'string';

        colIndex = colIndex || -1;

        if (typeof column == 'string') {
            column = {header: column, dataIndex: column};
        }

        if (Ext.isEmpty(prototypeFields.getByKey(column.dataIndex))) {

            prototypeFields.add(
                new Ext.data.Field({name: column.dataIndex, type: typeField})
            );
        }

        me.headerCt.add(colIndex, column);
        me.getView().refresh();
    }

});