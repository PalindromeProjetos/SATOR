//@charset UTF-8
Ext.define( 'iSterilization.view.flowprocessing.FlowProcessingDataView', {
    extend: 'Ext.view.View',

    xtype: 'flowprocessingdataview',

    requires: [
        'Ext.view.View'
    ],

    trackOver: true,
    autoScroll: true,
    multiSelect: false,
    name: 'flowprocessingstepaction',
    store: 'flowprocessingstepaction',
    itemSelector: 'div.step',

    tpl: [
        '<tpl for=".">',
            '<div style="margin-bottom: 10px;" class="step step-{flowstepaction}-{steptype}">',
                '<div class="step-left">',
                    '<div class="steptype-{steptype}"></div>',
                    '<div class="steptype-tools step-hide" id="tools-{id}">',
                        '<div class="steptype-infor fa fa-info-circle" id="infor-{id}"></div>',
                        '<div class="steptype-clear fa fa-times-circle" id="clear-{id}"></div>',
                    '</div>',
                    '<div class="steptype-clock step-hide" id="clock-{id}"></div>',
                '</div>',
                '<div class="step-right" style="font-weight: 700;">',
                    '<div class="steptype-items">{items}</div>',
                    '<div style="font-size: 16px; color: #900000;">{originplace}</div>',
                    '<div class="step-line">{sterilizationtypename} {version}</div>',
                    '<div class="step-line">{materialname}</div>',
                    '<div class="step-line" style="color: #105aeb;">{targetplace}</div>',
                    '<div>',
                        '<div style="text-align: left; float: left; width: 30%;">{timeof}</div>',
                        '<div style="text-align: right; float: right; width: 70%;">{barcode}</div>',
                    '</div>',
                '</div>',
            '</div>',
        '</tpl>'
    ],

    emptyText: '<h4 style="text-align: center; line-height: 40px;" class="insert-record">Nenhum processo na etapa...</h4>',

    initComponent: function () {
        var me = this;

        me.callParent();
        me.onAfter( 'afterrender', me.fnAfterRender, me);
    },

    fnAfterRender: function () {
        var me = this;

        me.el.on('click', function (event, target) {
            var record = me.getSelectionModel().getSelection()[0];
            me.fireEvent('removecharge', me, record, event, target);
        }, null, { delegate: 'div.steptype-clear' });

        me.el.on('click', function (event, target) {
            var record = me.getSelectionModel().getSelection()[0];
            me.fireEvent('selectcharge', me, record, event, target);
        }, null, { delegate: 'div.steptype-infor' });
    }

});