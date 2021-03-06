//@charset UTF-8
Ext.define( 'iAdmin.view.material.MaterialController', {
    extend: 'iAdmin.view.itembase.ItemBaseController',

    alias: 'controller.material',

    requires: [
        'iAdmin.view.itembase.ItemBaseController'
    ],

    url: '../iAdmin/business/Calls/material.php',

    config: {
        control: {
            'materialview portrait filefield': {
                loadend: 'onLoadEnd'
            }
        }
    },

    routes: {
        'materialview/:id': {
            action: 'getMaterialId'
        },
        'materialnew': {
            action: 'getMaterialNew'
        }
    },

    listen: {
        store: {
            '#material': {
                load: 'onLoadMaterial',
                beforeload: 'onBeforeLoadMaterial'
            }
        }
    },

    onLoadMaterial: function ( store , records , successful , operation , eOpts ) {
        var me = this,
            view = me.getView();

        if(view.getXType() != 'materiallist') {
            view = view.up('materiallist');
        }

        var totalresults = view.down('numberfield[name=totalresults]');

        var nrf = store.pageSize * store.currentPage;
        var nri = store.currentPage > 1 ? nrf - store.pageSize + 1 : 1;
        if (nrf > store.totalCount) nrf = store.totalCount;
        totalresults.setFieldLabel(Ext.String.format("{0} - {1} de ", nri, nrf));
        totalresults.setValue(store.totalCount || 10);
    },

    onBeforeLoadMaterial: function (store , operation , eOpts) {
        var me = this,
            view = me.getView();

        if(view.getXType() != 'materiallist') {
            view = view.up('materiallist');
        }

        var totalresults = view.down('numberfield[name=totalresults]');

        if(totalresults) {
            store.setParams({totalresults: totalresults.getValue()});
        }
    },

    totalResultsSearch: function (field, e, eOpts) {
        var value = field.getValue();

        if(!value || value.length == 0 ) {
            return false;
        }

        if ([e.ENTER].indexOf(e.getKey()) != -1) {
            Ext.getStore('material').load();
        }
    },

    //routes ========================>

    setSelectFilterType: function(grid, rowIndex, colIndex) {
        var me = this,
            view = me.getView(),
            record = grid.getStore().getAt(rowIndex),
            search = view.down('textfield[name=search]');

        view.down('materialsearchfilter').setValue(record.get('name'));
        view.down('hiddenfield[name=filterid]').setValue(record.get('id'));
        view.down('hiddenfield[name=filtertype]').setValue(record.get('filtertype'));

        view.down('materialsearchfilter').collapse();

        me.fetchField(search);
    },

    showClear: function (field, eOpts) {
        var me = this,
            view = me.getView(),
            search = view.down('textfield[name=search]');

        view.down('hiddenfield[name=filterid]').reset();
        view.down('hiddenfield[name=filtertype]').reset();

        me.fetchField(search);
    },

    fetchField: function (search, button) {
        var me = this,
            view = me.getView(),
            store = Ext.getStore('material'),
            params = {
                action: 'select',
                method: 'selectLike',
                query: search.getValue()
            },
            filterid = view.down('hiddenfield[name=filterid]'),
            filtertype = view.down('hiddenfield[name=filtertype]');

        if(filtertype.getValue()) {
            params.filterid = filterid.getValue();
            params.method = (filtertype.getValue() == 1) ? 'selectBox' : 'selectProprietary';
        }

        store.setParams(params).load();
    },

    getMaterialId: function (id) {
        var app = Smart.app.getController('App'),
            record = Ext.getStore('material').findRecord('id',id);

        app.onMainPageView({xtype: 'materialview', xdata: record});
    },

    getMaterialNew: function() {
        var app = Smart.app.getController('App');

        app.onMainPageView({xtype: 'materialview', xdata: null});
    },

    //routes ========================>

    onCycleChange: function (checkcolumn, rowIndex, checked, eOpts) {
        var store = Ext.getStore('materialcycle'),
            record = store.getAt(rowIndex);

        if(!checked) {
            store.remove(record);
        }

        store.sync({
            success: function (batch, options) {
                var opr = batch.getOperations()[0],
                    rec = opr.getRecords()[0];

                if(options.operations.create) {
                    record.set('id',rec.get('id'));
                }

                if(options.operations.destroy) {
                    store.load();
                }

            }
        });
    },

    onChangeExtensionType: function ( field, newValue, oldValue, eOpts) {
        var me = this,
            view = me.getView();
        view.down('container[name=containercard]').getLayout().setActiveItem(newValue.extensiontype);
    },

    onAfterRenderView: function (view) {
        var me = this,
            xdata = view.xdata,
            portrait = view.down('portrait'),
            grid = view.down('itembaselayout'),
            id = view.down('hiddenfield[name=id]').getValue();

        if(!xdata) return false;

        view.loadRecord(xdata);
        grid.setDisabled(false);
        portrait.setUrl(me.url);
        portrait.beFileData(xdata.get('filetype'));

        var materialboxname = xdata.get('materialboxname') ? xdata.get('materialboxname') : '';

        // view.down('packingsearch').setReadColor(materialboxname.length != 0);

        Ext.getStore('materialtypeflow').setParams({
            query: xdata.get('id')
        }).load();

        grid.getStore().setParams({
            method: 'selectData',
            query: xdata.get('id')
        }).load();

        Ext.getStore('materialcycle').setParams({
            query: xdata.get('id')
        }).load();

        Ext.getStore('itembaseservicetype').setParams({
            query: xdata.get('id')
        }).load();

        view.down('panel[tabIndex=3]').setDisabled(false);
    },

    onEditTypeFlow: function (editor, context, eOpts) {
        var gd = context.grid,
            store = gd.getStore(),
            record = context.record;

        record.set('sterilizationtypeid',context.value);

        store.sync({
            success: function () {
                record.commit();
                store.load({
                    callback: function () {
                        gd.getSelectionModel().select(context.rowIdx);
                    }
                });
            }
        });
    },

    onViewEdit: function(grid, rowIndex, colIndex) {
        var me = this,
            record = grid.getStore().getAt(rowIndex);

        Ext.getStore('material').setParams({
            method: 'selectCode',
            query: record.get('id'),
            rows: Ext.encode({ id: record.get('id') })
        }).load({
            scope: me,
            callback: function(records, operation, success) {
                var record = records[0];
                me.redirectTo( 'materialview/' + record.get('id'));
            }
        });
    },

    insertViewNew: function (btn) {
        var me = this;
        me.redirectTo('materialnew');
    },

    onLoadEnd: function (field,file) {
        var me = this,
            view = me.getView(),
            portrait = view.down('portrait');
        field.doFileData(portrait);
    },

    updateView: function () {
        var me = this,
            view = me.getView(),
            grid = view.down('itembaselayout');

        me.setModuleForm(view);
        me.setModuleData('material');

        me._success = function (form, action) {
            grid.setDisabled(false);
            view.down('panel[tabIndex=3]').setDisabled(false);
            if(action.result.crud == 'insert') {
                view.down('hiddenfield[name=id]').setValue(action.result.rows[0].id);

                Ext.getStore('materialtypeflow').setParams({
                    query: action.result.rows[0].id
                }).load();

                grid.getStore().setParams({
                    method: 'selectData',
                    query: action.result.rows[0].id
                }).load();

                Ext.getStore('materialcycle').setParams({
                    query: action.result.rows[0].id
                }).load();

                Ext.getStore('itembaseservicetype').setParams({
                    query: action.result.rows[0].id
                }).load();
            }
        }

        me.updateModule();
    },

    insertView: function () {
        var me = this,
            view = me.getView(),
            portrait = view.down('portrait'),
            grid = view.down('itembaselayout');

        view.reset();
        view.down('panel[tabIndex=3]').setDisabled(true);
        grid.setDisabled(true);
        grid.getStore().removeAll();
        view.down('tabpanel').setActiveTab(0);
        view.down('textfield[name=name]').setReadColor(false);
        portrait.beFileData();

        Ext.getStore('materialtypeflow').removeAll();
    },

    insertCopy: function () {
        var me = this,
            view = me.getView(),
            form = view.down('form'),
            params = form.getValues();

        Ext.Msg.confirm('Duplicar registro', 'Confirma a duplicação do registro selecionado?',
            function (choice) {
                if (choice === 'yes') {

                    params.action = 'select';
                    params.method = 'insertCopy';

                    Ext.Ajax.request({
                        scope: me,
                        url: me.url,
                        params: params,
                        callback: function (options, success, response) {
                            var result = Ext.decode(response.responseText);

                            if(!success || !result.success) {
                                Ext.Msg.alert('Failure', result.text);
                                return false;
                            }

                            view.xdata.set(result.rows[0]);
                            me.onAfterRenderView(view);
                        }
                    });
                }
            }
        );

    }

});