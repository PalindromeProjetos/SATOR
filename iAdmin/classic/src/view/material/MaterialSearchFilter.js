//@charset UTF-8
Ext.define( 'iAdmin.view.material.MaterialSearchFilter', {
    extend: 'Ext.form.field.Picker',

    xtype: 'materialsearchfilter',

    requires: [
        'Ext.form.Panel',
        'Ext.form.field.Picker',
        'iAdmin.view.material.MaterialController'
    ],

    editable: false,

    controller: 'material',

    triggerCls: Ext.baseCSSPrefix + 'form-search-trigger',

    listeners: {
        expand: function (field) {
            field.picker.down('textfield[name=search]').focus(false,200);
        }
    },

    createPicker: function() {
        var me = this,
            picker = new Ext.form.Panel({
                hidden: true,
                floating: true,
                pickerField: me,
                bodyPadding: 10,
                layout: 'anchor',
                ownerCt: me.ownerCt,
                defaults: {
                    anchor: '100%'
                },
                items: [
                    {
                        xtype: 'radiogroup',
                        columns: 2,
                        vertical: false,
                        fieldLabel: 'Filtrar',
                        labelCls: 'sub-title-label',
                        items: [
                            {
                                inputValue: 1,
                                boxLabel: 'Kit',
                                name: 'filtertype'
                            }, {
                                inputValue: 2,
                                boxLabel: 'Proprietário',
                                name: 'filtertype',
                                checked: true
                            }
                        ],
                        listeners: {
                            change: function (radio) {
                                var form = radio.up('form'),
                                    grid = form.down('gridpanel');
                                grid.getStore().removeAll();
                                form.down('textfield[name=search]').focus(false,200);
                            }
                        }
                    }, {
                        name: 'search',
                        xtype: 'textfield',
                        fieldCls: 'smart-field-style-action',
                        listeners: {
                            specialkey: function (field, e, eOpts) {
                                if ([e.ENTER].indexOf(e.getKey()) != -1) {
                                    var grid = field.up('form').down('gridpanel'),
                                        radiogroup = field.up('form').down('radiogroup');

                                    grid.getStore().setParams({
                                        query: field.getValue(),
                                        limit: 10,
                                        filtertype: radiogroup.getValue().filtertype
                                    }).load();
                                }
                            }
                        }
                    }, {
                        height: 265,
                        xtype: 'gridpanel',
                        cls: 'update-grid',

                        rowLines: true,

                        url: '../iAdmin/business/Calls/material.php',

                        fields: [
                            {
                                name: 'id',
                                type: 'int'
                            }, {
                                name: 'name',
                                type: 'auto'
                            }, {
                                name: 'filtertype',
                                type: 'int'
                            }
                        ],

                        params: {
                            action: 'select',
                            method: 'selectType'
                        },

                        columns: [
                            {
                                flex: 1,
                                sortable: false,
                                dataIndex: 'name'
                            }, {
                                width: 50,
                                sortable: false,
                                align: 'center',
                                xtype: 'actioncolumn',
                                handler: 'setSelectFilterType',
                                getClass: function(v, meta, rec) {
                                    return "fa fa-check-circle action-checked-color-font";
                                }
                            }
                        ]
                    }
                ]
            });

        return picker;
    }

});