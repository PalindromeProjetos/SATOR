//@charset UTF-8
Ext.define( 'iSterilization.store.flowprocessing.FlowProcessingHoldArea', {
    extend: 'Smart.data.StoreBase',

    alias: 'store.FlowProcessingHoldArea',

    storeId: 'flowprocessingholdarea',

    pageSize: 25,

    url: '../iSterilization/business/Calls/Heart/HeartFlowProcessing.php',

    controller: 'flowprocessing',

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

    config: {
        extraParams: {
            action: 'select',
            method: 'selectHoldArea'
        }
    }

});