//@charset UTF-8
Ext.define( 'iAdmin.view.helper.areas.CMEAreasEdit', {
    extend: 'Ext.window.Window',

    xtype: 'cmeareasedit',

    requires: [
        'Ext.form.Panel',
        'Ext.window.Window',
        'Ext.button.Segmented',
        'Smart.form.field.ComboEnum',
        'iAdmin.model.areas.CMEAreas',
        'iAdmin.view.helper.areas.CMEAreasSearch',
        'iAdmin.view.helper.areas.CMEAreasController'
    ],

    constrain: true,

    width: 450,
    resizable: false,
    showAnimate: true,
    layout: 'fit',
    controller: 'cmeareas',
    cls: 'panel-frame',
    iconCls: "fa fa-pencil",

    title: 'Editar Área de CME',
	
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
                        text: 'Área CME'
                    }, {
                        xtype: 'textfield',
                        name: 'name',
                        fieldLabel: 'Nome'
                    }, {
                        fieldLabel: 'Descrição',
                        xtype: 'textfield',
                        name: 'description'
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
						defaultType: 'checkboxfield',
						defaults: {
							flex: 1,
							allowBlank: false
						},
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
                    xtype: 'cmeareassearch',
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