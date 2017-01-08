//@charset UTF-8
Ext.define( 'iSterilization.view.flowprocessing.FlowProcessingHoldView', {
    extend: 'Ext.view.View',

    xtype: 'flowprocessingholdview',

    requires: [
        'Ext.view.View',
        'Ext.data.Store',
        'iSterilization.store.flowprocessing.*'
    ],

    trackOver: true,
    autoScroll: true,
    multiSelect: false,
    itemSelector: 'div.hold',

    url: '../iSterilization/business/Calls/Heart/HeartFlowProcessing.php',

    fields: [
        {
            name: 'id',
            type: 'int'
        }, {
            name: 'items',
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
            name: 'movementuser',
            type: 'auto',
            convert: function (value, record) {
                var movementuser = '',
                    username = value.split('.');

                Ext.each(username,function (name) {
                    movementuser += name.charAt(0).toUpperCase() + name.slice(1) + ' ';
                });

                return movementuser;
            }
        }, {
            name: 'movementname',
            type: 'auto',
            convert: function (value, record) {
                var movementname = '',
                    username = record.get('movementuser').split(' ');

                Ext.each(username,function (name) {
                    movementname += name.charAt(0);
                });

                return movementname;
            }
        }
    ],

    tpl: [
        '<tpl for=".">',
            '<div class="hold hold-{movementtype} animated rollIn">',
                '<div class="buble hold-buble-{movementtype}">{movementname}</div>',
                '<div class="lines">',
                    '<div class="line-01">{movementuser}</div>',
                    '<div class="line-02">{movementdate}</div>',
                    '<div class="line-03">Itens: {items}</div>',
                    '<div class="hold-btn">',
                        '<i class="delete fa fa-minus-circle action-delete-color-font"></i>',
                        '<i class="select fa fa-info-circle action-select-color-font"></i>',
                    '</div>',
                '</div>',
            '</div>',
        '</tpl>'
    ],

    emptyText: '<h4 style="text-align: center; line-height: 40px;" class="insert-record">Nenhum movimento aguardando...</h4>',

    initComponent: function () {
        var me = this;

        me.params = {
            action: 'select',
            method: 'selectHoldArea',
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