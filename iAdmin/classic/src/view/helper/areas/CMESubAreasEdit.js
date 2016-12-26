//@charset UTF-8
Ext.define( 'iAdmin.view.helper.areas.CMESubAreasEdit', {
    extend: 'Ext.window.Window',

    xtype: 'cmesubareasedit',

    requires: [
        'Ext.form.Panel',
        'Ext.window.Window',
        'Ext.button.Segmented',
        'Smart.form.field.ComboEnum',
        'iAdmin.model.areas.CMESubAreas',
        'iAdmin.view.helper.areas.CMEAreasSearch',
        'iAdmin.view.helper.areas.CMESubAreasSearch',
        'iAdmin.view.helper.areas.CMESubAreasController'
    ],

    constrain: true,

    width: 450,
    resizable: false,
    showAnimate: true,
    layout: 'fit',
    controller: 'cmesubareas',
    cls: 'panel-frame',
    iconCls: "fa fa-pencil",

    title: 'Editar SubArea do CME',
	
	listeners: {
		show: 'onViewShow'
	},

    initComponent: function () {
        var me = this;
        me.buildItems();
        me.callParent();
    },

    buildItems: function () {
        var me = this;

        me.items = [
            {
                xtype: 'form',
                bodyPadding: 10,
                layout: 'anchor',
                defaults: {
                    anchor: '100%',
                    allowBlank: false
                },
                items: [
                    {
                        xtype: 'hiddenfield',
                        name: 'id'
                    }, {
                        xtype: 'label',
                        cls: 'sub-title-label',
                        text: 'SubArea CME'
                    }, {
                        xtype: 'textfield',
                        name: 'name',
                        fieldLabel: 'Nome'
                    }, {
                        fieldLabel: 'Descrição',
                        xtype: 'textfield',
                        name: 'description'
                    }, {
                        fieldLabel: 'CME Areas',
                        xtype: 'cmeareassearch',
                        hiddenNameId: 'cmeareasid',
                        name: 'cmeareasname'
                    }, {
                        xtype: 'fieldcontainer',
                        layout: 'hbox',
                        defaultType: 'textfield',
                        items: [
                            {
                                flex: 3,
                                fieldLabel: 'Descrição no Fluxo',
                                name: 'sterilizationname'
                            }, {
                                xtype: 'splitter'
                            }, {
                                flex: 2,
                                fieldLabel: 'Código de Barra',
                                name: 'barcode'
                            }, {
                                xtype: 'splitter'
                            }, {
                                flex: 2,
                                hideTrigger: true,
                                xtype: 'numberfield',
                                fieldLabel: 'Ordenar por',
                                name: 'orderby'
                            }
                        ]
                    }, {
                        xtype: 'container',
                        layout: 'hbox',
                        items: [
                            {
                                name: 'isactive',
                                fieldLabel: 'Status',
                                boxLabel: 'Ativo'
                            }, {
                                name: 'sterilizationflow',
                                fieldLabel: 'Fluxo',
                                boxLabel: 'Sim'
                            }, {
                                name: 'startreader',
                                fieldLabel: 'Leitura',
                                boxLabel: 'Sim'
                            }, {
                                name: 'doscreening',
                                fieldLabel: 'Triagem',
                                boxLabel: 'Sim'
                            }
                        ]
                    }
                ]
            }
        ]
    },

    dockedItems: [
        {
            xtype: 'panel',
            layout: 'hbox',
            bodyPadding: 10,
            bodyStyle: 'background-color: rgba(208, 208, 208, .5);',
            items: [
                {
                    flex: 1,
                    xtype: 'cmesubareassearch',
                    name: 'search',
                    listeners: {
                        select: 'onSelectRecord'
                    }
                }, {
                    xtype: 'splitter'
                }, {
                    xtype: 'segmentedbutton',
                    allowMultiple: true,
                    items: [
                        {
                            iconCls: "fa fa-upload",
                            handler: 'updateView'
                        }, {
                            iconCls: "fa fa-file",
                            handler: 'insertView'
                        }
                    ]
                }
            ]
        }
    ]

});