//@charset UTF-8
Ext.define( 'iAdmin.view.main.MainController', {
    extend: 'Smart.ux.main.MainController',

    alias: 'controller.main',

    requires: [
        'Smart.ux.main.MainController',
        'iAdmin.view.quick.QuickReport',
        'iAdmin.view.module.ModuleEdit',
        'iAdmin.view.person.entity.EntityEdit',
        'iAdmin.view.person.client.ClientEdit',
        'iAdmin.view.person.proprietary.ProprietaryEdit',
        'iAdmin.view.person.collaborator.CollaboratorEdit',
        'iAdmin.view.helper.cycle.CycleEdit',
        'iAdmin.view.helper.place.PlaceEdit',
        'iAdmin.view.helper.flowing.FlowingEdit',
        'iAdmin.view.helper.packing.PackingEdit',
        'iAdmin.view.helper.provider.ProviderEdit',
        'iAdmin.view.helper.areas.CMEAreasEdit',
        'iAdmin.view.helper.targe.TargeColorEdit',
        'iAdmin.view.helper.areas.CMESubAreasEdit',
        'iAdmin.view.helper.classcouncil.ClassCouncilEdit',
        'iAdmin.view.helper.manufacturer.ManufacturerEdit',
        'iAdmin.view.helper.instrumentator.InstrumentatorEdit',
        'iAdmin.view.helper.unitmeasurement.UnitMeasurementEdit'
    ],

    url: '../iAdmin/business/Calls/users.php'

});