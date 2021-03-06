//@charset UTF-8
Ext.define( 'iAdmin.view.enums.EnumTypeListEdit', {
    extend: 'Ext.window.Window',

    xtype: 'enumtypelistedit',

    requires: [
        'Ext.form.Panel',
        'Ext.window.Window'
    ],

    width: 350,
    modal: true,
    resizable: false,
    showAnimate: true,
    layout: 'fit',
    controller: 'enumtype',
    cls: 'panel-frame',
    iconCls: "fa fa-pencil",

    title: 'Editar item enumerador',

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
                    anchor: '100%'
                },
                items: [
                    {
                        xtype: 'fieldcontainer',
                        layout: 'anchor',
                        labelCls: 'sub-title-label',
                        fieldLabel: 'Item',
                        defaultType: 'textfield',
                        defaults: {
                            anchor: '100%',
                            allowBlank: false,
                            useLabelBold: true
                        },
                        items: [
                            {
                                name: 'id',
                                xtype: 'hiddenfield'
                            }, {
                                name: 'enumtypeid',
                                xtype: 'hiddenfield'
                            }, {
                                anchor: '50%',
                                maxLength: 5,
                                fieldLabel: 'Código',
                                name: 'code'
                            }, {
                                fieldLabel: 'Descrição',
                                name: 'description'
                            }, {
                                xtype: 'container',
                                layout: 'hbox',
                                items: [
                                    {
                                        flex: 2,
                                        xtype: 'textfield',
                                        fieldLabel: 'Tipo de filtro',
                                        name: 'filtertype'
                                    }, {
                                        xtype: 'splitter'
                                    }, {
                                        flex: 1,
                                        minValue: 0,
                                        allowBlank: false,
                                        fieldLabel: 'Ordenar',
                                        xtype: 'numberfield',
                                        name: 'orderby'
                                    }
                                ]
                            }, {
                                height: 130,
                                xtype: 'textareafield',
                                fieldLabel: 'Observação',
                                name: 'observation'
                            }, {
                                name: 'isactive',
                                xtype: 'checkboxfield',
                                fieldLabel: 'Status',
                                boxLabel: 'Ativo'
                            }
                        ]
                    }
                ]
            }
        ]
    },

    buttonAlign: 'center',

    buttons: [
        {
            iconCls: "fa fa-file-o",
            text: 'Novo',
            showSmartTheme: 'red',
            handler: 'insertEnumItem'
        }, {
            iconCls: "fa fa-upload",
            text: 'Salvar',
            showSmartTheme: 'red',
            handler: 'updateEnumItem'
        }, {
            text: 'Fechar',
            showSmartTheme: 'red',
            handler: function (btn) {
                btn.up('window').close();
            }
        }
    ]

});