//@charset UTF-8
Ext.define( 'iSterilization.store.armory.ArmoryMovementItem', {
    extend: 'Smart.data.StoreBase',

    alias: 'store.ArmoryMovementItem',

    storeId: 'armorymovementitem',

    pageSize: 0,

    requires: [
        'iSterilization.model.armory.ArmoryMovementItem'
    ],

    url: '../iSterilization/business/Calls/armorymovementitem.php',

    model: 'iSterilization.model.armory.ArmoryMovementItem',

    config: {
        extraParams: {
            method: 'selectItem'
        }
    }

});