//@charset UTF-8
Ext.define( 'iSterilization.view.flowprocessing.FlowProcessingDataView', {
    extend: 'Ext.view.View',

    xtype: 'flowprocessingdataview',

    requires: [
        'Ext.view.View',
        'Ext.data.Store',
        'iSterilization.store.flowprocessing.*'
    ],

    trackOver: true,
    autoScroll: true,
    multiSelect: false,
    itemSelector: 'div.step',

    url: '../iSterilization/business/Calls/Heart/HeartFlowProcessing.php',

    fields: [
        {
            name: 'id',
            type: 'int'
        }, {
            name: 'flowprocessingstepid',
            type: 'int'
        }, {
            name: 'flowprocessingid',
            type: 'int'
        }, {
            name: 'flowstepaction',
            type: 'auto'
        }, {
            name: 'isactive',
            type: 'int'
        }, {
            name: 'username',
            type: 'auto'
        }, {
            name: 'barcode',
            type: 'auto'
        }, {
            name: 'patientname',
            type: 'auto'
        }, {
            name: 'dateof',
            type: 'auto'
        }, {
            name: 'dateto',
            type: 'auto'
        }, {
            name: 'timeof',
            type: 'auto'
        }, {
            name: 'clientname',
            type: 'auto'
        }, {
            name: 'originplace',
            type: 'auto'
        }, {
            name: 'targetplace',
            type: 'auto'
        }, {
            name: 'authorizedby',
            type: 'auto'
        }, {
            name: 'sterilizationtypename',
            type: 'auto'
        }, {
            name: 'version',
            type: 'int'
        }, {
            name: 'steptype',
            type: 'auto'
        }, {
            name: 'donetype',
            type: 'auto'
        }, {
            name: 'items',
            type: 'int'
        }, {
            name: 'materialname',
            type: 'auto'
        }
    ],

    tpl: [
        '<tpl for=".">',
            '<div style="margin-bottom: 10px;" class="step animated rollIn step-{flowstepaction}-{steptype}">',
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
                    '<div class="originplace">{originplace}</div>',
                    '<div class="step-line">{sterilizationtypename} {version}</div>',
                    '<div class="step-line">{materialname}</div>',
                    '<div class="targetplace">{targetplace}</div>',
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

        me.params = {
            action: 'select',
            method: 'selectStepArea',
            query: Smart.workstation.areasid
        };

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