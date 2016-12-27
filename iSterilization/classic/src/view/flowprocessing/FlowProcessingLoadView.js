//@charset UTF-8
Ext.define( 'iSterilization.view.flowprocessing.FlowProcessingLoadView', {
    extend: 'Ext.view.View',

    xtype: 'flowprocessingloadview',

    requires: [
        'Ext.view.View'
    ],

    trackOver: true,
    autoScroll: true,
    multiSelect: false,
    itemSelector: 'div.load',

    url: '../iSterilization/business/Calls/Heart/HeartFlowProcessing.php',

    fields: [
        {
            name: 'id',
            type: 'int'
        }, {
            name: 'item',
            type: 'int'
        }, {
            name: 'barcode',
            type: 'auto'
        }, {
            name: 'lineone',
            type: 'auto'
        }, {
            name: 'linetwo',
            type: 'auto'
        }, {
            name: 'movementdate',
            type: 'auto'
        }, {
            name: 'movementtype',
            type: 'auto'
        }, {
            name: 'movementtypedescription',
            type: 'auto'
        }, {
            name: 'releasestype',
            type: 'auto'
        }, {
            name: 'releasestypedescription',
            type: 'auto'
        }, {
            name: 'movementuser',
            type: 'auto'
        }, {
            name: 'patientname',
            type: 'auto'
        }, {
            name: 'dateof',
            type: 'auto'
        }, {
            name: 'timeof',
            type: 'auto'
        }
    ],

    tpl: [
        '<tpl for=".">',
        '</tpl>'
    ],

    emptyText: '<h4 style="text-align: center; line-height: 40px;" class="insert-record">Nenhum processo na etapa...</h4>',

    initComponent: function () {
        var me = this;

        me.params = {
            action: 'select',
            method: 'selectLoadArea',
            areasid: Smart.workstation.areasid
        };

        me.callParent();

        me.onAfter( 'afterrender', me.fnAfterRender, me);
    },

    fnAfterRender: function () {
        var me = this;

        me.el.on('click', function (event, target) {
            me.fireEvent('deleterecord', me, me.store, event, target);
        }, null, {
            delegate: 'i.delete'
        });

        me.el.on('click', function (event, target) {
            me.fireEvent('selectrecord', me, me.store, event, target);
        }, null, {
            delegate: 'i.select'
        });
    }

});