//@charset UTF-8
Ext.define( 'iAdmin.view.quick.QuickReportController', {
    extend: 'Smart.app.ViewControllerBase',

    alias: 'controller.quickreport',

    onViewShow: function (panel, eOpts) {
        var me = this,
            view = me.getView();

    },

    onSelectionChange: function (list, record, eOpts) {
        var me = this,
            view = me.getView(),
            panel = view.down('form[name=panels]');

        panel.removeAll();

        view.down('button[name=print]').setDisabled(true);

        if(record.data.panels) {
            panel.add({ xtype: record.data.panels});
            view.down('button[name=print]').setDisabled(false);
        }
    },

    printerPanel: function () {
        var me = this,
            view = me.getView(),
            form = view.down('form[name=panels]'),
            values = form.getValues(),
            url = 'business/Calls/Quick/MonthlyProduction.php?year={0}&month={1}';

        if(!form.isValid()) return false;

        window.open(Ext.String.format(url,values.year,values.month));
    }

});