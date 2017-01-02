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
            name: 'items',
            type: 'int'
        }, {
            name: 'screeningdate',
            type: 'auto',
            serializeType: 'date',
            convert: function (value, record) {
                return ( !value || value.length == 0) ? null : Ext.util.Format.date(value,'d/m/Y H:i');
            }
        }, {
            name: 'screeningflag',
            type: 'auto'
        }, {
            name: 'screeningflagdescription',
            type: 'auto'
        }, {
            name: 'screeninguser',
            type: 'auto',
            convert: function (value, record) {
                var screeninguser = '',
                    username = value.split('.');

                Ext.each(username,function (name) {
                    screeninguser += name.charAt(0).toUpperCase() + name.slice(1) + ' ';
                });

                return screeninguser;
            }
        }, {
            name: 'screeningname',
            type: 'auto',
            convert: function (value, record) {
                var screeningname = '',
                    username = record.get('screeninguser').split(' ');

                Ext.each(username,function (name) {
                    screeningname += name.charAt(0);
                });

                return screeningname;
            }
        }
    ],

    tpl: [
        '<tpl for=".">',
            '<div class="load animated rollIn">',
                '<div class="buble">{screeningname}</div>',
                '<div class="lines">',
                    '<div class="line-01">{screeninguser}</div>',
                    '<div class="line-02">{screeningdate}</div>',
                    '<div class="line-03">Itens: {items}</div>',
                    '<div class="load-btn">',
                        '<i class="delete fa fa-minus-circle action-delete-color-font"></i>',
                        '<i class="select fa fa-info-circle action-select-color-font"></i>',
                    '</div>',
                '</div>',
            '</div>',
        '</tpl>'
    ],

    emptyText: '<h4 style="text-align: center; line-height: 40px;" class="insert-record">Nenhuma triagem aguardando...</h4>',

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