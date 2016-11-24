//@charset UTF-8
Ext.define( 'iSterilization.view.flowprocessing.FlowProcessingController', {
    extend: 'Smart.app.ViewControllerBase',

    alias: 'controller.flowprocessing',

    routes: {
        'flowprocessingview/:id': {
            action: 'getFlowProcessingId'
        },
        'flowprocessingview/:id/:barcode': {
            action: 'getFlowProcessingId'
        }
    },

    listen: {
        store: {
            '#flowprocessingstepmaterial': {
                datachanged: 'onChangedMaterial'
            }
        }
    },

    url: '../iSterilization/business/Calls/Heart/HeartFlowProcessing.php',

    fetchField: function (search, button) {
        Ext.getStore('flowprocessing').setParams({
            query: search.getValue()
        }).load();
    },

    //routes ===================================>>
    getFlowProcessingId: function (id, barcode) {
        var me = this,
            app = Smart.app.getController('App'),
            store = Ext.getStore('flowprocessingstep');

        store.setParams({
            query: id,
            method: 'selectStep'
        }).load({
            scope: me,
            callback: function(records, operation, success) {

                if(!success || store.getCount() == 0) {
                    return false;
                }

                app.onMainPageView({xtype: 'flowprocessingview', xdata: store.getAt(0), barcode: barcode});
            }
        });
    },

    //routes ===================================>>

    onKeyDownDash: function (view, e, eOpts) {
        var me = this,
            view = me.getView();

        if ([e.ENTER].indexOf(e.getKey()) != -1) {
            console.info(e.getKey());
        }
    },

    onAfterRenderType: function () {
        var me = this,
            view = me.getView();

        if(!Smart.workstation) {
            return false;
        }

        view.down('textfield[name=search]').focus(false,200);
        view.down('label[name=labelareas]').setText(Smart.workstation.areasname);
        view.updateType();
    },

    onStepDoQuery: function (field, e, eOpts) {
        var me = this,
            value = field.getValue(),
            itemC = new RegExp(/(C\d{6})\w+/g),
            itemP = new RegExp(/(P\d{6})\w+/g);

        field.reset();

        if(value && value.length != 0) {
            if(value.indexOf('SATOR') != -1) {
                me.stepProtocol(value);
                return false;
            }

            if(itemC.test(value) || itemP.test(value)) {
                me.stepMaterial(value);
                return false;
            }
        }
    },

    onHoldDoQuery: function (field, e, eOpts) {
        var me = this,
            value = field.getValue(),
            itemC = new RegExp(/(C\d{6})\w+/g),
            itemP = new RegExp(/(P\d{6})\w+/g);

        field.reset();

        if(value && value.length != 0) {
            if( value.search(/SATOR/i) != -1 || value.search(/MOV/i) != -1) {
                me.holdProtocol(value);
                return false;
            }

            if(itemC.test(value) || itemP.test(value)) {
                me.holdMaterial(value);
                return false;
            }
        }

        Smart.Msg.showToast('Protocolo inválido para esta área');
    },

    holdProtocol: function (value) {
        var me = this,
            callHold = value.indexOf('MOV-') != -1 ? 'MOV' : value;

        switch(callHold) {
            case 'SATOR_MOVIMENTO_OF':
                me.callSATOR_MOVIMENTO_OF();
                break;
            case 'SATOR_MOVIMENTO_TO':
                me.callSATOR_MOVIMENTO_TO();
                break;
            case 'SATOR_MOVIMENTO_IN':
                me.callSATOR_MOVIMENTO_IN();
                break;
            case 'SATOR_CONSULTAR_MATERIAL':
                me.callSATOR_CONSULTAR_MATERIAL();
                break;
            case 'SATOR_CONSULTAR_MOVIMENTO':
                me.callSATOR_CONSULTAR_MOVIMENTO();
                break;
            case 'MOV':
                me.callSATOR_MOVIMENTO_ID(value);
                break;
            default:
                Smart.Msg.showToast('Protocolo inválido para esta área');
        }
    },

    holdMaterial: function (value) {
        var me = this,
            view = me.getView(),
            store = Ext.getStore('flowprocessingstepaction');

        view.setLoading('Consultando materiais...');

        Ext.Ajax.request({
            scope: me,
            url: store.getUrl(),
            params: {
                action: 'select',
                method: 'selectTaskArea',
                barcode: value,
                areasid: Smart.workstation.areasid
            },
            callback: function (options, success, response) {
                view.setLoading(false);
                var result = Ext.decode(response.responseText);

                if(!success || !result.success) {
                    Smart.Msg.showToast(result.text,'error');
                    return false;
                }

                var record = Ext.create('iSterilization.model.flowprocessing.FlowProcessingStepAction', result.rows[0]);
                me.onFlowStepAction(null,record);
            }
        });
    },

    callSATOR_CONSULTAR_MOVIMENTO: function () {
        var me = this,
            view = me.getView();

        Ext.widget('flowprocessingholdsearch').show(null, function () {
            this.master = view;
            this.down('textfield[name=search]').focus(false, 200);
        });
    },

    onHoldArmory: function (value) {
        var me = this;

        switch(value) {
            case 'SATOR_ENCERRAR_LEITURA':
                me.setSATOR_ENCERRAR_LEITURA();
                break;
            case 'SATOR_CANCELAR_LEITURAS':
                me.setSATOR_CANCELAR_LEITURAS();
                break;
            case 'SATOR_CANCELAR_ULTIMA_LEITURA':
                me.setSATOR_CANCELAR_ULTIMA_LEITURA();
                break;
            case 'SATOR_CONSULTAR_MATERIAL':
                me.callSATOR_CONSULTAR_MATERIAL();
                break;
            default:
                Smart.Msg.showToast('Protocolo inválido para este local');
        }
    },

    setSATOR_ENCERRAR_LEITURA: function () {
        var me = this,
            view = me.getView(),
            form = view.down('form'),
            data = form.getRecord(),
            doCallBack = function (rows) {

                if(['001','003'].indexOf(data.get('movementtype')) != -1) {
                    data.set('releasestype', 'E');
                    data.set('closedby', rows.username);
                    data.store.sync({
                        async: false,
                        callback: function (batch, options) {
                            var resultSet = batch.getOperations().length != 0 ? batch.operations[0].getResultSet() : null;

                            if ((resultSet == null) || (!resultSet.success)) {
                                Smart.Msg.showToast(resultSet.getMessage(), 'error');
                                return false;
                            }

                            // if( data.get('movementtype') == '001' ) {
                            //     var url = 'business/Calls/Quick/DispensingReport.php?id={0}';
                            //     window.open(Ext.String.format(url,data.get('id')));
                            // }
                        }
                    });

                    this.close();
                    view.master.updateType();
                    view.close();
                    return false;
                }

                this.close();

                Ext.widget('call_SATOR_ENCERRAR_MOVIMENTO', {
                    scope: me,
                    doCallBack: function () {
                        var value = this.down('form').getValues(),
                            store = Ext.create('iSterilization.store.armory.ArmoryMovement');

                        store.removeAll();

                        store.load({
                            scope: this,
                            params: {
                                method: 'selectCode',
                                rows: Ext.encode({id: data.get('id')})
                            },
                            callback: function(records, operation, success) {

                                if(!success || records.length == 0) {
                                    view.close();
                                    return false;
                                }

                                var record = records[0];
                                record.set('boxsealone', value.boxsealone);
                                record.set('boxsealtwo', value.boxsealtwo);
                                record.set('transportedby', value.transportedby);
                                record.set('releasestype', 'E');
                                record.set('closedby', rows.username);
                                store.sync({
                                    scope: this,
                                    callback: function (batch, options) {
                                        var resultSet = batch.getOperations().length != 0 ? batch.operations[0].getResultSet() : null;

                                        if ((resultSet == null) || (!resultSet.success)) {
                                            Smart.Msg.showToast(resultSet.getMessage(), 'error');
                                            return false;
                                        }

                                        var url = 'business/Calls/Quick/DispensingReport.php?id={0}';
                                        window.open(Ext.String.format(url,data.get('id')));

                                        this.close();
                                        view.master.updateType();
                                        view.close();
                                    }
                                });
                            }
                        });
                    }
                }).show(null, function () {
                    this.down('textfield[name=transportedby]').focus(false, 200);
                    this.down('textfield[name=closedby]').setValue(rows.username);
                    this.down('fieldcontainer[name=boxseal]').setVisible(data.get('movementtype') == '002');
                });
            };

        Ext.widget('flowprocessinguser', {
            scope: me,
            doCallBack: doCallBack
        }).show(null,function () {
            this.down('form').reset();
            this.down('textfield[name=usercode]').focus(false,200);
        });
    },

    setSATOR_CANCELAR_LEITURAS: function () {
        var me = this,
            view = me.getView(),
            record = view.down('form').getRecord();

        Ext.Msg.confirm('Cancelar movimento', 'Confirma o cancelamento do movimento selecionado?',
            function (choice) {
                if (choice === 'yes') {
                    var store = Ext.getStore('armorymovement') || Ext.create('iSterilization.store.armory.ArmoryMovement');
                    store.setParams({
                        method: 'selectCode',
                        rows: Ext.encode({ id: record.get('id') })
                    }).load({
                        scope: me,
                        callback: function () {
                            var model = store.getAt(0);

                            model.set('releasestype', 'C');
                            store.sync();
                            view.master.down('flowprocessingholdview').getStore().remove(record);
                            view.close();
                        }
                    });
                }
            }
        );
    },

    setSATOR_CANCELAR_ULTIMA_LEITURA: function () {
        var store = Ext.getStore('armorymovementitem'),
            record = store.getAt(store.getCount()-1);

        if(store.getCount() == 0) {
            Smart.Msg.showToast("Não existem lançamentos para serem excluidos!",'info');
            return false;
        }

        Ext.Msg.confirm('Excluir item', 'Confirma a exclusão do ultimo item lançado no movimento?',
            function (choice) {
                if (choice === 'yes') {
                    store.remove(record);
                    store.sync({async: false});
                }
            }
        );
    },

    onArmoryOfQuery: function (field, e, eOpts) {
        var me = this,
            value = field.getValue(),
            itemP = new RegExp(/(P\d{6})\w+/g);

        field.reset();

        if(value && value.length != 0) {
            if(value.indexOf('SATOR') != -1) {
                me.onHoldArmory(value);
                return false;
            }

            if(itemP.test(value)) {
                me.setMaterialMOVIMENTO_OF(value);
                return false;
            }
        }
    },

    onArmoryInQuery: function (field, e, eOpts) {
        var me = this,
            value = field.getValue(),
            itemP = new RegExp(/(P\d{6})\w+/g);

        field.reset();

        if(value && value.length != 0) {
            if(value.indexOf('SATOR') != -1) {
                me.onHoldArmory(value);
                return false;
            }

            if(itemP.test(value)) {
                me.setMaterialMOVIMENTO_IN(value);
                return false;
            }
        }
    },

    onEditMOVIMENTO_OF: function ( combo, record, eOpts ) {
        var me = this,
            view = me.getView(),
            grid = view.down('gridpanel'),
            sm = grid.getSelectionModel(),
            rc = sm.getSelection()[0];

        rc.set('armorylocal',record.get('armorylocal'));
        rc.set('armorylocaldescription',record.get('armorylocaldescription'));
        rc.store.sync();
        rc.commit();
    },

    onEditMOVIMENTO_IN: function ( combo, record, eOpts ) {
        var me = this,
            view = me.getView(),
            grid = view.down('gridpanel'),
            sm = grid.getSelectionModel(),
            rc = sm.getSelection()[0];

        rc.set('regresstype',record.get('regresstype'));
        rc.set('regresstypedescription',record.get('regresstypedescription'));
        rc.store.sync();
        rc.commit();
    },

    onEditMOVIMENTO_TO: function ( combo, record, eOpts ) {
        var me = this,
            view = me.getView(),
            grid = view.down('gridpanel'),
            sm = grid.getSelectionModel(),
            rc = sm.getSelection()[0];

        rc.set('outputtype',record.get('outputtype'));
        rc.set('outputtypedescription',record.get('outputtypedescription'));
        rc.store.sync();
        rc.commit();
    },

    onBeforeEditMOVIMENTO_OF: function ( editor, context, eOpts ) {
        return context.grid.up('window').editable;
    },

    setMaterialMOVIMENTO_OF: function (value) {
        var me = this,
            view = me.getView(),
            store = Ext.getStore('armorymovementitem');

        view.setLoading('Consultando processos...');

        Ext.Ajax.request({
            scope: me,
            url: me.url,
            params: {
                action: 'select',
                method: 'armoryOfQuery',
                barcode: value,
                areasid: Smart.workstation.areasid
            },
            callback: function (options, success, response) {
                var result = Ext.decode(response.responseText);

                view.setLoading(false);

                if(!success || !result.success) {
                    Smart.Msg.showToast(result.text,'error');
                    return false;
                }

                var data = result.rows[0],
                    armorymovementid = view.down('hiddenfield[name=id]').getValue();

                store.add({
                    barcode: data.barcode,
                    armorylocal: data.armorylocal,
                    materialname: data.materialname,
                    armorymovementid: armorymovementid,
                    flowprocessingstepid: data.flowprocessingstepid,
                    armorylocaldescription: data.armorylocaldescription
                });

                store.sync();
            }
        });
    },

    setMaterialMOVIMENTO_IN: function (value) {
        var me = this,
            view = me.getView(),
            store = Ext.getStore('armorymovementitem');

        view.setLoading('Consultando processos...');

        Ext.Ajax.request({
            scope: me,
            url: me.url,
            params: {
                action: 'select',
                method: 'armoryInQuery',
                barcode: value
            },
            callback: function (options, success, response) {
                var result = Ext.decode(response.responseText);

                view.setLoading(false);

                if(!success || !result.success) {
                    Smart.Msg.showToast(result.text,'error');
                    return false;
                }

                var data = result.rows[0],
                    armorymovementid = view.down('hiddenfield[name=id]').getValue();

                store.add({
                    barcode: data.barcode,
                    armorylocal: data.armorylocal,
                    regresstype: data.regresstype,
                    materialname: data.materialname,
                    armorymovementid: armorymovementid,
                    flowprocessingstepid: data.flowprocessingstepid,
                    regresstypedescription: data.regresstypedescription,
                    armorylocaldescription: data.armorylocaldescription
                });

                store.sync();
            }
        });
    },

    onFlowHoldDelete: function (viewView,store) {
        var me = this,
            record = viewView.getSelectionModel().getSelection()[0];

        Ext.Msg.confirm('Cancelar movimento', 'Confirma o cancelamento do movimento selecionado?',
            function (choice) {
                if (choice === 'yes') {
                    var store = Ext.getStore('armorymovement') || Ext.create('iSterilization.store.armory.ArmoryMovement');
                    store.setParams({
                        method: 'selectCode',
                        rows: Ext.encode({ id: record.get('id') })
                    }).load({
                        scope: me,
                        callback: function () {
                            var model = store.getAt(0);

                            model.set('releasestype','C');
                            store.sync();
                            viewView.getStore().remove(record);
                        }
                    });
                }
            }
        );
    },

    onFlowHoldRevert: function(grid, rowIndex, colIndex) {
        var me = this,
            model = grid.getStore().getAt(rowIndex),
            value = model.get('id');

        me.showMovementType004(value);
    },

    onFlowHoldSelect: function (viewView,store) {
        var me = this,
            record = viewView.getSelectionModel().getSelection()[0];

        me.getMovementType(record);
    },

    onFlowHoldSearch: function(grid, rowIndex, colIndex) {
        var me = this,
            model = grid.getStore().getAt(rowIndex);

        me.getMovementType(model);
    },

    onSearchMoviment: function (field, e, eOpts) {
        var me = this,
            view = me.getView(),
            grid = view.down('gridpanel'),
            value = field.getValue(),
            radiogroup = view.down('radiogroup').getValue();

        field.reset();

        grid.getStore().setParams({
            search: value,
            movementtype: radiogroup.movementtype
        }).load();
    },

    onSelectHoldItem: function (field, e, eOpts) {
        var me = this,
            view = me.getView(),
            value = field.getValue(),
            store = Ext.getStore('armorymovementitem');

        field.reset();

        if(value.indexOf('SATOR') != -1) {
            me.onHoldArmory(value);
            return false;
        }

        if(store.findRecord('barcode',value)) {
            Smart.Msg.showToast("O item lido já foi lançado neste movimento!",'info');
            return false;
        }

        view.setLoading('Consultando materiais...');

        Ext.Ajax.request({
            scope: me,
            url: me.url,
            params: {
                action: 'select',
                method: 'selectHoldItem',
                barcode: value
            },
            callback: function (options, success, response) {
                var result = Ext.decode(response.responseText);

                view.setLoading(false);

                if(!success || !result.success || result.records == 0) {
                    Smart.Msg.showToast(result.text,'error');
                    return false;
                }

                if(result.rows[0].available == 0) {
                    Smart.Msg.showToast("O item lido já foi lançado em outro movimento!",'error');
                    return false;
                }

                store.add({
                    outputtype: 'P',
                    barcode: result.rows[0].barcode,
                    colorschema: result.rows[0].colorschema,
                    materialname: result.rows[0].materialname,
                    armorymovementid: view.down('hiddenfield[name=id]').getValue(),
                    flowprocessingstepid: result.rows[0].flowprocessingstepid
                });

                store.sync();
            }
        });
    },

    getMovementType: function (record) {
        var me = this;

        switch (record.get('movementtype')) {
            case '001':
                var value = record.get('id');
                me.showMovementType001(value);
                break
            case '002':
                var value = record.get('id');
                me.showMovementType002(value);
                break
            case '003':
                var value = record.get('id');
                me.showMovementType003(value);
                break
            case '004':
                var value = record.get('id');
                me.showMovementType004(value);
                break
        }
    },

    showMovementType001: function (value) {
        var me = this,
            view = me.getView(),
            store = Ext.getStore('armorymovement') || Ext.create('iSterilization.store.armory.ArmoryMovement');

        store.setParams({
            method: 'selectCode',
            rows: Ext.encode({ id: value })
        }).load({
            scope: me,
            callback: function (records) {
                var rec = records[0];
                Ext.widget('call_SATOR_MOVIMENTO_OF', {
                    editable: rec.get('releasestype') == "A"
                }).show(null,function () {
                    this.master = view;
                    this.down('form').loadRecord(rec);
                    this.down('textfield[name=search]').setReadColor(rec.get('releasestype') != "A");
                    this.down('textfield[name=search]').focus(false,200);
                    Ext.getStore('armorymovementitem').setParams({query: value}).load();
                });
            }
        });
    },

    showMovementType002: function (value) {
        var me = this,
            view = me.getView(),
            store = Ext.getStore('armorymovementoutput') || Ext.create('iSterilization.store.armory.ArmoryMovementOutput');

        store.setParams({
            method: 'selectCode',
            query: value
        }).load({
            scope: me,
            callback: function(records, operation, success) {
                var rec = records[0];
                Ext.widget('flowprocessingholdoutput', {
                    editable: rec.get('releasestype') == "A"
                }).show(null,function () {
                    this.master = view;
                    this.down('form').loadRecord(rec);
                    this.down('textfield[name=search]').setReadColor(rec.get('releasestype') != "A");
                    this.down('textfield[name=search]').focus(false,200);
                    var groupdocument = this.down('fieldcontainer[name=groupdocument]');

                    groupdocument.update(rec.data);

                    Ext.getStore('armorymovementitem').setParams({query: value}).load();
                });
            }
        });

    },

    showMovementType003: function (value) {
        var me = this,
            view = me.getView(),
            store = Ext.getStore('armorymovement') || Ext.create('iSterilization.store.armory.ArmoryMovement');

        store.setParams({
            method: 'selectCode',
            rows: Ext.encode({ id: value })
        }).load({
            scope: me,
            callback: function (records) {
                var rec = records[0];
                Ext.widget('call_SATOR_MOVIMENTO_IN', {
                    editable: rec.get('releasestype') == "A"
                }).show(null,function () {
                    this.master = view;
                    this.down('form').loadRecord(rec);
                    this.down('textfield[name=search]').setReadColor(rec.get('releasestype') != "A");
                    this.down('textfield[name=search]').focus(false,200);
                    Ext.getStore('armorymovementitem').setParams({query: value}).load();
                });
            }
        });
    },

    showMovementType004: function (value) {
        var me = this,
            view = me.getView(),
            store = Ext.getStore('armorymovementoutput') || Ext.create('iSterilization.store.armory.ArmoryMovementOutput');

        store.setParams({
            method: 'selectCode',
            query: value
        }).load({
            scope: me,
            callback: function(records, operation, success) {
                var rec = records[0];
                Ext.widget('flowprocessingholdrevert', {
                    editable: rec.get('releasestype') == "A"
                }).show(null,function () {
                    this.master = view.master;
                    this.down('form').loadRecord(rec);
                    // this.down('textfield[name=search]').setReadColor(rec.get('releasestype') != "A");
                    // this.down('textfield[name=search]').focus(false,200);
                    var groupdocument = this.down('fieldcontainer[name=groupdocument]');


                    view.close();
                    groupdocument.update(rec.data);

                    Ext.getStore('armorymovementitem').setParams({query: value}).load();
                });
            }
        });
    },
    
    delReleasesItem: function(grid, rowIndex, colIndex) {
        var store = grid.getStore(),
            model = store.getAt(rowIndex);

        Ext.Msg.confirm('Excluir lançamento', 'Confirma a exclusão do item selecionado?',
            function (choice) {
                if (choice === 'yes') {
                    store.remove(model);
                    store.sync();
                }
            }
        );
    },

    callSATOR_MOVIMENTO_ID: function (value) {
        var me = this,
            store = Ext.getStore('armorymovement') || Ext.create('iSterilization.store.armory.ArmoryMovement');

        Ext.Ajax.request({
            scope: me,
            url: store.getUrl(),
            params: {
                action: 'select',
                method: 'selectCode',
                rows: Ext.encode({ id: value.replace("MOV-", "") })
            },
            callback: function (options, success, response) {
                var result = Ext.decode(response.responseText);

                if(!success || !result.success) {
                    Smart.Msg.showToast(result.text,'error');
                    return false;
                }

                var movementtype = result.rows[0].movementtype;

                switch (movementtype) {
                    case '001':
                        me.showMovementType001(result.rows[0].id);
                        break
                    case '002':
                        me.showMovementType002(result.rows[0].id);
                        break
                }
            }
        });
    },

    callSATOR_MOVIMENTO_OF: function () {
        var me = this,
            doCallBack = function (rows) {
                var store = Ext.create('iSterilization.store.armory.ArmoryMovement');

                store.add({
                    areasid: Smart.workstation.areasid,
                    movementuser: rows.username,
                    movementtype: '001',
                    releasestype: 'A'
                });

                store.sync({
                    async: false,
                    success: function (batch, options) {
                        var resultSet = batch.getOperations().length != 0 ? batch.operations[0].getResultSet() : null;

                        if((resultSet == null) || (!resultSet.success)) {
                            return false;
                        }

                        var opr = batch.getOperations()[0],
                            rec = opr.getRecords()[0];

                        Ext.widget('call_SATOR_MOVIMENTO_OF', {
                            editable: true
                        }).show(null,function () {
                            this.master = me.getView();
                            this.down('form').loadRecord(rec);
                            this.down('textfield[name=search]').setReadColor(false);
                            this.down('textfield[name=search]').focus(false,200);
                        });
                    },
                    failure: function (batch, options) {
                        var resultSet = batch.getOperations().length != 0 ? batch.operations[0].getResultSet() : null;

                        if(resultSet) {
                            Smart.Msg.showToast(resultSet.getMessage(),'error');
                        }
                    }
                });

                return true;
            };

        Ext.widget('flowprocessinguser', {
            scope: me,
            doCallBack: doCallBack
        }).show(null,function () {
            this.down('form').reset();
            this.down('textfield[name=usercode]').focus(false,200);
        });
    },

    callSATOR_MOVIMENTO_IN: function () {
        var me = this,
            doCallBack = function (rows) {
                var store = Ext.create('iSterilization.store.armory.ArmoryMovement');

                store.add({
                    areasid: Smart.workstation.areasid,
                    movementuser: rows.username,
                    movementtype: '003',
                    releasestype: 'A'
                });

                store.sync({
                    async: false,
                    success: function (batch, options) {
                        var resultSet = batch.getOperations().length != 0 ? batch.operations[0].getResultSet() : null;

                        if((resultSet == null) || (!resultSet.success)) {
                            return false;
                        }

                        var opr = batch.getOperations()[0],
                            rec = opr.getRecords()[0];

                        Ext.widget('call_SATOR_MOVIMENTO_IN', {
                            editable: true
                        }).show(null,function () {
                            this.master = me.getView();
                            this.down('form').loadRecord(rec);
                            this.down('textfield[name=search]').setReadColor(false);
                            this.down('textfield[name=search]').focus(false,200);
                        });
                    },
                    failure: function (batch, options) {
                        var resultSet = batch.getOperations().length != 0 ? batch.operations[0].getResultSet() : null;

                        if(resultSet) {
                            Smart.Msg.showToast(resultSet.getMessage(),'error');
                        }
                    }
                });

                return true;
            };

        Ext.widget('flowprocessinguser', {
            scope: me,
            doCallBack: doCallBack
        }).show(null,function () {
            this.down('form').reset();
            this.down('textfield[name=usercode]').focus(false,200);
        });
    },

    callSATOR_MOVIMENTO_TO: function () {
        var me = this,
            doCallBack = function (rows) {
                Ext.widget('call_SATOR_MOVIMENTO_TO').show(null,function () {
                    var movementtype = this.down('comboenum[name=movementtypedescription]');
                    var releasestype = this.down('comboenum[name=releasestypedescription]');
                    this.master = me.getView();
                    this.down('clientsearch').focus(false,200);
                    this.down('textfield[name=movementuser]').setValue(rows.username);
                    this.down('hiddenfield[name=areasid]').setValue(Smart.workstation.areasid);
                    this.down('textfield[name=areasname]').setValue(Smart.workstation.areasname);
                    this.down('hiddenfield[name=movementtype]').setValue('002');
                    this.down('hiddenfield[name=releasestype]').setValue('A');

                    movementtype.setEnumItem();
                    releasestype.setEnumItem();
                });

                return true;
            };

        Ext.widget('flowprocessinguser', {
            scope: me,
            doCallBack: doCallBack
        }).show(null,function () {
            this.down('form').reset();
            this.down('textfield[name=usercode]').focus(false,200);
        });
    },

    setMovementRevert: function () {
        var me = this,
            view = me.getView();

        view.down('hiddenfield[name=areasid]').reset();
        view.down('hiddenfield[name=movementtype]').reset();
        view.down('hiddenfield[name=releasestype]').reset();

        console.info(view.down('form').getValues());

        // me.setModuleData('armorymovementoutput');
        // me.setModuleForm(view.down('form'));
        //
        // me._success = function (frm, action) {
        //     view.master.updateType();
        //     view.close();
        // }
        //
        // me.updateRecord();
    },

    setMovementOutput: function () {
        var me = this,
            view = me.getView();

        me.setModuleData('armorymovementoutput');
        me.setModuleForm(view.down('form'));

        me._success = function (batch, options) {
            var opr = batch.getOperations()[0],
                rec = opr.getRecords()[0];
            view.master.updateType();
            view.close();
            me.showMovementType002(rec.get('id'));
        }

        me.updateRecord();
    },

    stepProtocol: function (value) {
        var me = this;

        switch(value) {
            case 'SATOR_PREPARA_LEITURA':
                me.callSATOR_PREPARA_LEITURA();
                break;
            case 'SATOR_PROCESSAR_ITENS':
                me.callSATOR_PROCESSAR_ITENS();
                break;
            case 'SATOR_REVERTE_FASE':
                me.callSATOR_REVERTE_FASE();
                break;
            case 'SATOR_VALIDA_CARGA':
                me.callSATOR_VALIDA_CARGA();
                break;
            case 'SATOR_PREPARA_LOTE_AVULSO':
                me.callSATOR_PREPARA_LOTE_AVULSO();
                break;
            case 'SATOR_CONSULTAR_MATERIAL':
                me.callSATOR_CONSULTAR_MATERIAL();
                break;
            default:
                Smart.Msg.showToast('Protocolo inválido para esta área');
        }
    },

    stepMaterial: function (value) {
        var me = this,
            view = me.getView(),
            store = Ext.getStore('flowprocessingstepaction');

        view.setLoading('Consultando materiais...');

        Ext.Ajax.request({
            scope: me,
            url: store.getUrl(),
            params: {
                action: 'select',
                method: 'selectTaskArea',
                barcode: value,
                areasid: Smart.workstation.areasid
            },
            callback: function (options, success, response) {
                view.setLoading(false);
                var result = Ext.decode(response.responseText);

                if(!success || !result.success) {
                    Smart.Msg.showToast(result.text,'error');
                    return false;
                }

                var record = Ext.create('iSterilization.model.flowprocessing.FlowProcessingStepAction', result.rows[0]);
                me.onFlowStepAction(null,record);
            }
        });
    },

    onLoadDoQuery: function (field, e, eOpts) {
        var me = this,
            value = field.getValue(),
            itemC = new RegExp(/(C\d{6})\w+/g),
            itemP = new RegExp(/(P\d{6})\w+/g);

        field.reset();

        if(value && value.length != 0) {
            if( value.indexOf('SATOR') != -1 || value.indexOf('MOV') != -1) {
                me.loadProtocol(value);
                return false;
            }

            if(itemC.test(value) || itemP.test(value)) {
                me.loadMaterial(value);
                return false;
            }
        }

        Smart.Msg.showToast('Protocolo inválido para esta área');
    },

    loadProtocol: function (value) {
        var me = this;

        switch(value) {
            case 'SATOR_ENCERRAR_LEITURA':
                me.preSATOR_ENCERRAR_LEITURA();
                break;
            case 'SATOR_CANCELAR_LEITURAS':
                me.preSATOR_CANCELAR_LEITURAS();
                break;
            case 'SATOR_CANCELAR_ULTIMA_LEITURA':
                me.preSATOR_CANCELAR_ULTIMA_LEITURA();
                break;
            case 'SATOR_CONSULTAR_MATERIAL':
                me.callSATOR_CONSULTAR_MATERIAL();
                break;
            default:
                Smart.Msg.showToast('Protocolo inválido para este local');
        }
    },

    loadMaterial: function (value) {
        var me = this,
            view = me.getView(),
            form = view.down('form'),
            data = form.getValues(),
            grid = view.down('gridpanel');

        data.barcode = value;
        data.action = 'select';
        data.method = 'selectPreLoad';

        Ext.Ajax.request({
            scope: me,
            url: me.url,
            params: data,
            callback: function (options, success, response) {
                var result = Ext.decode(response.responseText);

                if(!success || !result.success) {
                    Smart.Msg.showToast(result.text,'error');
                    return false;
                }

                var rows = result.rows[0];

                if(grid.getStore().findRecord('barcode',rows.barcode)) {
                    Smart.Msg.showToast("O item lido <b>já está aguardando processamento!</b>",'info');
                    return false;
                }

                if(rows.clientid != data.clientid) {
                    Smart.Msg.showToast("O item lido não pode ser confirmado pois é <b>de origem diferente!</b>",'error');
                    return false;
                }

                if(rows.areavailable == 0) {
                    Smart.Msg.showToast("O item lido <b>não está disponível</b> para este processamento!",'info');
                    return false;
                }

                rows.id = grid.getStore().getCount()+1;
                grid.getStore().add(rows);
            }
        });
    },

    preSATOR_ENCERRAR_LEITURA: function () {
        var me = this,
            view = me.getView(),
            grid = view.down('gridpanel'),
            doCallBack = function (rows) {
                var data = [];

                grid.getStore().each(function (record) {
                    data.push(record.data);
                });

                view.setLoading('Gerando estrutura de leitura de materiais...');

                Ext.each(data, function(item) {
                    item.areasid = Smart.workstation.areasid;
                    item.username = rows.username;
                    delete item.id;
                    delete item.barcode;

                    Ext.Ajax.request({
                        scope: me,
                        url: me.url,
                        async: false,
                        params: {
                            action: 'select',
                            method: 'newFlowView',
                            query: Ext.encode(item)
                        },
                        callback: function (options, success, response) {
                            var result = Ext.decode(response.responseText);

                            if(!success || !result.success) {
                                var rec = grid.getStore().findRecord('id',item.id);
                                Smart.Msg.showToast(result.text, 'error');
                                if(rec) {
                                    grid.getStore().remove(rec);
                                }
                                return false;
                            }
                        }
                    });
                });

                view.setLoading(false);
                view.master.updateType();
                view.close();

                return false;
            };

        if(grid.getStore().getCount() == 0) {
            Smart.Msg.showToast('Não existem lançamentos para completar a operação!');
            return false;
        }

        Ext.widget('flowprocessinguser', {
            doCallBack: doCallBack
        }).show(null,function () {
            this.down('form').reset();
            this.down('textfield[name=usercode]').focus(false,200);
        });
    },

    preSATOR_CANCELAR_LEITURAS: function () {
        var me = this,
            view = me.getView();

        Ext.Msg.confirm('Cancelar movimento', 'Confirma o cancelamento do movimento selecionado?',
            function (choice) {
                if (choice === 'yes') {
                    view.down('gridpanel').getStore().removeAll();
                }
            }
        );
    },

    preSATOR_CANCELAR_ULTIMA_LEITURA: function () {
        var me = this,
            view = me.getView(),
            grid = view.down('gridpanel'),
            record = grid.getStore().getAt(grid.getStore().getCount()-1);

        if(grid.getStore().getCount() == 0) {
            Smart.Msg.showToast("Não existem lançamentos para serem excluidos!",'info');
            return false;
        }

        Ext.Msg.confirm('Excluir item', 'Confirma a exclusão do ultimo item lançado no movimento?',
            function (choice) {
                if (choice === 'yes') {
                    grid.getStore().remove(record);
                }
            }
        );
    },

    callSATOR_PREPARA_LOTE_AVULSO: function () {
        var me = this;
        Ext.widget('call_SATOR_PREPARA_LOTE_AVULSO').show(null,function () {
            this.master = me.getView();
            this.down('textfield[name=materialboxname]').focus(false,200);
        });
    },

    callSATOR_PREPARA_LEITURA: function () {
        var me = this,
            view = me.getView(),
            fnCallBack = function (rows) {
                Ext.widget('flowprocessingsteppreload').show(null,function () {
                    this.master = view;
                    this.down('textfield[name=searchmaterial]').focus(false, 200);
                    this.down('hiddenfield[name=clientid]').setValue(rows.clientid);
                    this.down('displayfield[name=clientname]').setValue(rows.clientname);
                });
                
                this.close();
            };

        me.callFlowprocessingClient(fnCallBack);
    },

    callFlowprocessingClient: function (fnCallBack) {
        Ext.widget('flowprocessingclient', {
            doCallBack: fnCallBack
        }).show(null,function () {
            this.down('form').reset();
            this.down('textfield[name=clientid]').focus(false, 200);
        });
    },

    callSATOR_PROCESSAR_ITENS: function () {
        var me = this,
            view = me.getView(),
            doCallBack = function (rows) {
                Ext.widget('flowprocessingopen').show(null,function () {
                    this.master = view;
                    this.down('searchmaterial').focus(false,200);
                    this.down('textfield[name=username]').setValue(rows.username);
                    this.down('hiddenfield[name=areasid]').setValue(Smart.workstation.areasid);
                    this.down('textfield[name=areasname]').setValue(Smart.workstation.areasname);
                });

                return true;
            };

        Ext.widget('flowprocessinguser', {
            scope: me,
            doCallBack: doCallBack
        }).show(null,function () {
            this.down('form').reset();
            this.down('textfield[name=usercode]').focus(false,200);
        });
    },

    callSATOR_REVERTE_FASE: function () {
        var me = this,
            view = me.getView();

        Ext.widget('call_SATOR_REVERTE_FASE').show(null,function () {
            this.master = view;
            this.down('textfield[name=materialboxname]').focus(false,200);
        });
    },

    callSATOR_VALIDA_CARGA: function () {
        var me = this,
            view = me.getView();

        Ext.widget('call_SATOR_VALIDA_CARGA').show(null,function () {
            this.master = view;
            this.down('textfield[name=equipmentname]').focus(false,200);
        });
    },

    onAfterRenderDash: function () {
        var me = this,
            date = new Date(),
            view = me.getView(),
            datepicker = view.down('datepicker'),
            traceability = view.down('combobox[name=traceability]');

        datepicker.focus();
        traceability.setValue(0);
        datepicker.setValue(date);
        me.selectDatePicker(datepicker,datepicker.getValue());
    },

    onAfterRenderView: function () {
        var me = this,
            list = '',
            view = me.getView(),
            data = view.xdata,
            barcode = view.barcode,
            text = 'Material ({0})';
            // colorschema = data.get('colorschema') ? data.get('colorschema').split(",") : null,
            // schema = "<div style='width: 20px; background: {0}; height: 26px; float: right; border: 1px solid #111214; margin-left: 5px;'></div>";

        Ext.getStore('flowprocessingstepinputtree').setParams({
            flowprocessingid: data.get('flowprocessingid'),
            method: 'selectTree'
        }).load();

        Ext.getStore('flowprocessingstepmessage').setParams({
            method: 'selectCode',
            query: data.get('id')
        }).load();

        // if(colorschema) {
        //     Ext.each(colorschema,function(item) {
        //         list += Ext.String.format(schema,item);
        //     });
        // }

        view.down('hiddenfield[name=id]').setValue(data.get('id'));
        view.down('hiddenfield[name=materialboxid]').setValue(data.get('materialboxid'));

        view.down('textfield[name=search]').focus(false,200);
        view.down('container[name=colorschema]').update(data.get('colorpallet'));
        view.down('textfield[name=username]').setValue(data.get('username'));
        view.down('textfield[name=areasname]').setValue(data.get('areasname'));
        view.down('textfield[name=clientname]').setValue(data.get('clientname'));
        view.down('textfield[name=originplace]').setValue(data.get('originplace'));
        view.down('textfield[name=sterilizationtypename]').setValue(data.get('sterilizationtypeversion'));
        view.down('textfield[name=priorityleveldescription]').setValue(data.get('priorityleveldescription'));
        view.down('label[name=materialboxname]').setText(Ext.String.format(text,data.get('materialboxname')));

        Ext.getStore('flowprocessingstepmaterial').setParams({
            method: 'selectCode',
            query: data.get('id')
        }).load({
            scope: me,
            callback: function(records, operation, success) {

                if( !success || records.length == 0 || !barcode ) {
                    if(data.get('stepflaglist').indexOf('011') != -1) {
                        if(data.get('useppe') == null) {
                            me.callSATOR_ALLOW_DENY('EPI');
                        }
                    }

                    return false;
                }

                if(barcode.indexOf('P') != -1) {
                    me.workReadArea(barcode);
                }

                if(barcode.indexOf('C') != -1) {
                    me.workReadArea(barcode);
                }

                if(data.get('stepflaglist').indexOf('011') != -1) {
                    if(data.get('useppe') == null) {
                        me.callSATOR_ALLOW_DENY('EPI');
                    }
                }
            }
        });
    },

    onSelectUserCode: function (win,field,eOpts) {
        var me = this,
            view = me.getView(),
            form = view.down('form');

        if(!field.isValid()) {
            return false;
        }

        me.selectUserFlow();
    },

    selectUserFlow: function () {
        var me = this,
            view = me.getView(),
            form = view.down('form');

        if(!form.isValid()) {
            return false;
        }

        view.setLoading('Autenticando usuário...');

        form.submit({
            scope: me,
            url: me.url,
            clientValidation: true,
            params: {
                action: 'select',
                method: 'selectUserFlow'
            },
            success: me.onComeInSendSuccess,
            failure: me.onFormSubmitFailure
        });
    },
    
    getSelectClient: function () {
        var me = this,
            view = me.getView(),
            form = view.down('form');

        // if (!form.isValid()) {
        //     return false;
        // }

        // view.setLoading('Registrando cliente...');
        //
        // form.submit({
        //     scope: me,
        //     url: me.url,
        //     clientValidation: true,
        //     params: {
        //         action: 'select',
        //         method: 'selectClientId'
        //     },
        //     success: me.onComeInSendSuccess,
        //     failure: me.onFormSubmitFailure
        // });
    },

    onComeInSendSuccess: function (form, action) {
        var me = this,
            result = Ext.decode(action.response.responseText),
            view = me.getView(),
            rows = result.rows[0];

        view.setLoading(false);

        if(!result.success) {
            Smart.Msg.showToast(result.text);
        }

        if(result.success) {

            if(!Smart.workstation) {
                view.close();
                Smart.Msg.showToast('Estação de Trabalho Não Configurada, Operação Não pode ser Realizada!','error');
                return false;
            }

            if( view.doCallBack(rows) ) {
                view.close();
            }
        }
    },

    onFormSubmitFailure: function (form, action) {
        var me = this,
            view = me.getView();

        view.setLoading(false);
        Smart.Msg.showToast(action.result.text,'info');
        // view.down('textfield[name=password]').focus(false,200);
    },

    selectDatePicker: function (datePicker, date, eOpts) {
        var me = this,
            view = me.getView(),
            labelperiod = view.down('label[name=labelperiod]');

        labelperiod.setText(me.getDateFormated(date));

        Ext.getStore('flowprocessing').setParams({
            method: 'selectDashFlow',
            dateof: Ext.util.Format.date(date,'Y-m-d')
        }).load();

        Ext.getStore('flowprocessingstep').removeAll();
    },

    selectTraceability: function (combo,record,eOpts) {
        var me = this,
            view = me.getView(),
            traceability = view.down('container[name=traceability]');

        traceability.getLayout().setActiveItem(record.get('traceability_type'));
    },

    onSelectMaterial: function (combo,record,eOpts) {
        var me = this,
            view = me.getView(),
            clientsearch = view.down('clientsearch'),
            flow = view.down('searchsterilizationtype');

        if(record.get('areavailable') == 0) {
            combo.reset();
            combo.focus(false,200);
            Smart.Msg.showToast("O item lido <b>não está disponível</b> para este processamento!",'info');
            return false;
        }

        flow.setReadColor(false);
        flow.setValue(record.get('sterilizationtypeid'));
        flow.setRawValue(record.get('sterilizationpriority'));

        view.down('hiddenfield[name=materialid]').setValue(record.get('id'));
        view.down('hiddenfield[name=version]').setValue(record.get('version'));
        view.down('hiddenfield[name=prioritylevel]').setValue(record.get('prioritylevel'));
        view.down('hiddenfield[name=materialboxid]').setValue(record.get('materialboxid'));
        view.down('hiddenfield[name=sterilizationtypeid]').setValue(record.get('sterilizationtypeid'));
    },

    showClearMaterial: function (field, eOpts) {
        var me = this,
            view = me.getView(),
            searchpatient = view.down('searchpatient'),
            flow = view.down('searchsterilizationtype');

        flow.reset();
        flow.setReadColor(true);
        view.down('clientsearch').reset();
        searchpatient.reset();
        searchpatient.setReadColor(true);
    },

    nextFieldMaterial: function (field,eOpts) {
        var me = this,
            view = me.getView(),
            type = view.down('clientsearch');

        Ext.getStore('client').load({
            scope: me,
            params: {
                method: 'selectCode',
                rows: Ext.encode({id: 1})
            },
            callback: function (records, operation, success) {
                var record = records[0];
                type.setValue(record.get('id'));
                type.setRawValue(record.get('name'));
                view.down('hiddenfield[name=clientid]').setValue(record.get('id'));
                me.onSelectClient(type, record, eOpts);
            }
        });
    },

    onSelectSterilization: function (combo,record,eOpts) {
        var me = this,
            view = me.getView();

        view.down('hiddenfield[name=prioritylevel]').setValue(record.get('prioritylevel'));
    },

    onBeforeQuerySterilization: function (queryPlan , eOpts) {
        var me = this,
            view = me.getView(),
            combo = queryPlan.combo,
            rec = view.down('searchmaterial').foundRecord();

        delete combo.lastQuery;
        combo.store.removeAll();

        combo.store.setParams({ materialid: rec.get('id') });
    },

    onSelectClient: function (combo,record,eOpts) {
        var me = this,
            view = me.getView(),
            clienttype = record.get('clienttype'),
            searchpatient = view.down('searchpatient');

        if(clienttype != '004') {
            me.insertFlow();
            return false;
        }

        searchpatient.reset();
        searchpatient.setReadColor(false);

        if (clienttype == '004') {
            view.down('searchpatient').focus(false, 200);
        }

        view.down('hiddenfield[name=clienttype]').setValue(clienttype);
    },

    showClearClient: function (field, eOpts) {
        var me = this,
            view = me.getView(),
            searchpatient = view.down('searchpatient');

        searchpatient.reset();
        searchpatient.setReadColor(true);
    },

    onSelectPatient: function (combo,record,eOpts) {
        var me = this,
            view = me.getView();

        view.down('hiddenfield[name=healthinsurance]').setValue(record.get('health_insurance'));

        me.insertFlow();
    },

    insertFlow: function () {
        var me = this,
            date = new Date(),
            view = me.getView(),
            form = view.down('form'),
            data = form.getValues(),
            store = Ext.getStore('flowprocessingstepaction');

        if(!form.isValid()) {
            return false;
        }

        var patient = form.down('searchpatient').foundRecord();

        data.patientname = patient ? patient.get('name') : null;

        view.setLoading('Gerando estrutura de leitura de materiais...');

        Ext.Ajax.request({
            scope: me,
            url: me.url,
            params: {
                action: 'select',
                method: 'newFlowView',
                query: Ext.encode(data)
            },
            callback: function (options, success, response) {
                var result = Ext.decode(response.responseText);

                view.setLoading(false);

                if(!success || !result.success) {
                    Smart.Msg.showToast(result.text,'error');
                    return false;
                }

                view.master.updateType();
                view.close();

                Ext.Ajax.request({
                    scope: me,
                    url: store.getUrl(),
                    params: {
                        action: 'select',
                        method: 'selectTask',
                        query: result.rows.id
                    },
                    callback: function (options, success, response) {
                        var result = Ext.decode(response.responseText);

                        if(!success || !result.success) {
                            Smart.Msg.showToast(result.text,'error');
                            return false;
                        }
                        var record = Ext.create('iSterilization.model.flowprocessing.FlowProcessingStepAction',result.rows[0]);
                        me.onFlowStepAction(null,record);
                    }
                });
            }
        });
    },

    onSelectFlowStatus: function (combo,record,eOpts) {
        var store = Ext.getStore('flowprocessing');

        store.clearFilter();
        store.filter('flowstatus', combo.getValue());
    },

    showClearFlowStatus: function (field, eOpts) {
        var store = Ext.getStore('flowprocessing');

        store.removeFilter('flowstatus');
        store.clearFilter();
    },

    onSelectFlowStepStatus: function (combo,record,eOpts) {
        var store = Ext.getStore('flowprocessingstep');

        store.clearFilter();
        store.filter('flowstepstatus', combo.getValue());
    },

    showClearFlowStepStatus: function (field, eOpts) {
        var store = Ext.getStore('flowprocessingstep');

        store.removeFilter('flowstepstatus');
        store.clearFilter();
    },

    setMessageText: function (msgType,protocol) {
        var me = this,
            view = me.getView(),
            master = view.master ? view.master : view,
            store = Ext.getStore('flowprocessingstepmessage'),
            msgText = {
                MSG_DUPLICATED: {
                    readercode: '001',
                    readershow: 'warning',
                    readertext: 'O Material selecionado já foi atualizado!'
                },
                MSG_UNKNOWN: {
                    readercode: '002',
                    readershow: 'info',
                    readertext: 'O Material não faz parte do Kit selecionado!'
                },
                MSG_PROTOCOL: {
                    readercode: '003',
                    readershow: 'info',
                    readertext: protocol
                },
                MSG_PROTOCOL_ERROR: {
                    readercode: '004',
                    readershow: 'error',
                    readertext: 'MSG_PROTOCOL_ERROR - O protocolo solicitado não foi reconhecido pelo sistema!'
                },
                MSG_NOT_AVAILABLE: {
                    readercode: '005',
                    readershow: 'error',
                    readertext: 'MSG_NOT_AVAILABLE - Não há lançamentos a serem Cancelados!'
                }
            },
            msgItem = msgText[msgType];

        Smart.Msg.showToast(msgItem.readertext,msgItem.readershow);

        store.add({
            readercode: msgItem.readercode,
            readershow: msgItem.readershow,
            readertext: msgItem.readertext,
            flowprocessingstepid: master.xdata.get('id')
        });

        store.sync({
            callback: function () {
                store.sort([{property : 'id', direction: 'DESC'}]);
            }
        });
    },

    /**
     * Controles para Processamento e Leitura
     *
     * - Verificar Mensagem [value]
     *      É protocolo .. seguir protocolo
     *      Não é protocolo, seguir [Verificar é Kit ?]
     *
     *
     * - Verificar é Kit ?
     *      Sim é Kit, [isMaterialBox]
     *          Já foi lançado ?
     *              Sim -> Mensagem de duplicidade
     *              Não -> Update Status do Item na Lista
	 *
     *      Não é Kit,
     *          Já foi lançado ?
     *              Sim -> Mensagem de duplicidade
     *              Não -> Pesquisa e Insert (Depende do Status do Material)
     */
    onStartReaderView: function (field, e, eOpts) {
        var me = this,
            view = me.getView(),
            record = view.xdata,
            value = field.getValue(),
            stepflaglist = record.get('stepflaglist');

        view.down('radiogroup').setValue({unconformities: '000'});

        field.reset();

        if(value && value.length != 0) {
            if(value.indexOf('SATOR') != -1) {
                me.workProtocol(value);
				return false;
            }

			// Não é protocolo .. seguir workReadArea
			me.workReadArea(value);
        }
    },

    onReaderEquipment: function (field, e, eOpts) {
        var me = this,
            view = me.getView(),
            value = field.getValue();

        if ([e.ENTER].indexOf(e.getKey()) != -1) {
            e.stopEvent();

            if(!value || value.length == 0) {
                return false;
            }

            Ext.Ajax.request({
                url: me.url,
                params: {
                    action: 'select',
                    method: 'selectEquipment',
                    barcode: field.getValue(),
                    areasid: Smart.workstation.areasid
                },
                callback: function (options, success, response) {
                    var result = Ext.decode(response.responseText);

                    if (success && result.success) {
                        field.setValue(result.rows.equipmentname);
                        view.down('gridpanel').getStore().removeAll();
                        view.down('textfield[name=cyclename]').reset();
                        view.down('textfield[name=cyclename]').setReadColor(false);
                        view.down('textfield[name=materialboxname]').reset();
                        view.down('textfield[name=materialboxname]').setReadColor(true);
                        view.down('hiddenfield[name=equipmentid]').setValue(result.rows.id);
                        view.down('textfield[name=cyclename]').focus(false,200);
                    }

                }
            });
        }
    },

    onShowClearEquipment: function (field,eOpts) {
        var me = this,
            view = me.getView();

        view.down('hiddenfield[name=equipmentid]').reset();
        view.down('textfield[name=equipmentname]').reset();

        view.down('gridpanel').getStore().removeAll();
        view.down('textfield[name=cyclename]').reset();
        view.down('hiddenfield[name=equipmentcycleid]').reset();
        view.down('textfield[name=cyclename]').setReadColor(true);
        view.down('textfield[name=materialboxname]').reset();
        view.down('textfield[name=materialboxname]').setReadColor(true);
    },

    onReaderCycle: function (field, e, eOpts) {
        var me = this,
            view = me.getView(),
            value = field.getValue(),
            equipmentid = view.down('hiddenfield[name=equipmentid]');

        if ([e.ENTER].indexOf(e.getKey()) != -1) {
            e.stopEvent();

            if(!value || value.length == 0) {
                return false;
            }

            Ext.Ajax.request({
                url: me.url,
                params: {
                    action: 'select',
                    method: 'selectCycleList',
                    barcode: field.getValue(),
                    equipmentid: equipmentid.getValue()
                },
                callback: function (options, success, response) {
                    var result = Ext.decode(response.responseText);

                    if (success && result.success) {
                        field.setValue(result.rows.cyclename);
                        view.down('gridpanel').getStore().removeAll();
                        view.down('textfield[name=materialboxname]').setReadColor(false);
                        view.down('hiddenfield[name=equipmentcycleid]').setValue(result.rows.id);

                        view.down('hiddenfield[name=duration]').setValue(result.rows.duration);
                        view.down('hiddenfield[name=timetoopen]').setValue(result.rows.timetoopen);
                        view.down('hiddenfield[name=temperature]').setValue(result.rows.temperature);

                        view.down('textfield[name=materialboxname]').focus(false,200);
                    }

                }
            });
        }
    },

    onShowClearCycle: function (field,eOpts) {
        var me = this,
            view = me.getView();

        view.down('gridpanel').getStore().removeAll();
        view.down('hiddenfield[name=duration]').reset();
        view.down('hiddenfield[name=timetoopen]').reset();
        view.down('hiddenfield[name=temperature]').reset();
        view.down('textfield[name=materialboxname]').reset();
        view.down('textfield[name=materialboxname]').setReadColor(true);
    },

    onReaderMaterialBoxLote: function (field, e, eOpts) {
        var me = this,
            view = me.getView(),
            form = view.down('form'),
            value = field.getValue(),
            store = view.down('gridpanel').getStore();

        if(!form.isValid()){
            return false;
        }

        if ([e.ENTER].indexOf(e.getKey()) != -1) {
            e.stopEvent();

            field.reset();

            if (!value || value.length == 0) {
                return false;
            }

            Ext.Ajax.request({
                url: me.url,
                params: {
                    action: 'select',
                    method: 'selectCycleLote',
                    barcode: value,
                    areasid: Smart.workstation.areasid
                },
                callback: function (options, success, response) {
                    var result = Ext.decode(response.responseText);

                    if (success && result.success) {
                        var find = store.findRecord('barcode',result.rows.barcode);

                        if(find) {
                            Smart.ion.sound.play("computer_error");
                            Smart.Msg.showToast('O material/kit <b>já encontra-se lançado</b> no lote atual!');
                            return false;
                        }

                        store.add(result.rows);
                        Smart.ion.sound.play("button_tiny");
                        return false;
                    }

                    Smart.ion.sound.play("computer_error");
                    Smart.Msg.showToast('O material/kit <b>não foi encontrado</b> entre os processos atuais!');
                }
            });
        }
    },

    onReaderMaterialBoxName: function (field, e, eOpts) {
        var me = this,
            view = me.getView(),
            form = view.down('form'),
            value = field.getValue(),
            store = view.down('gridpanel').getStore(),
            equipmentid = view.down('hiddenfield[name=equipmentid]'),
            equipmentcycleid = view.down('hiddenfield[name=equipmentcycleid]');

        if(!form.isValid()){
            return false;
        }
        
        if ([e.ENTER].indexOf(e.getKey()) != -1) {
            e.stopEvent();

            field.reset();

            if (!value || value.length == 0) {
                return false;
            }

            Ext.Ajax.request({
                url: me.url,
                params: {
                    action: 'select',
                    method: 'selectCycleItem',
                    barcode: value,
                    areasid: Smart.workstation.areasid,
                    equipmentid: equipmentid.getValue(),
                    equipmentcycleid: equipmentcycleid.getValue()
                },
                callback: function (options, success, response) {
                    var result = Ext.decode(response.responseText);

                    if (success && result.success) {
                        var find = store.findRecord('barcode',result.rows.barcode);

                        if(find) {
                            Smart.ion.sound.play("computer_error");
                            Smart.Msg.showToast('O material/kit <b>já encontra-se lançado</b> no lote atual!');
                            return false;
                        }

                        store.add(result.rows);
                        Smart.ion.sound.play("button_tiny");
                        return false;
                    }

                    Smart.ion.sound.play("computer_error");
                    Smart.Msg.showToast('O material/kit <b>não foi encontrado</b> entre os processos atuais!');
                }
            });
        }
    },

	workProtocol: function (value) {
	    var me = this;

        switch(value) {
            case 'SATOR_RELATAR_USA_EPI':
                me.callSATOR_ALLOW_DENY('EPI');
                break;
            case 'SATOR_ENCERRAR_LEITURA':
                me.callSATOR_ENCERRAR_LEITURA();
                break;
            case 'SATOR_INFORMAR_INSUMOS':
                me.callSATOR_INFORMAR_INSUMOS();
                break;
            case 'SATOR_IMPRIMIR_ETIQUETA':
                me.callSATOR_IMPRIMIR_ETIQUETA();
                break;
            case 'SATOR_CANCELAR_LEITURAS':
                me.callSATOR_CANCELAR_LEITURAS();
                break;
            case 'SATOR_LANCAMENTO_MANUAL':
                me.callSATOR_LANCAMENTO_MANUAL();
                break;
            case 'SATOR_CONSULTAR_MATERIAL':
                me.callSATOR_CONSULTAR_MATERIAL();
                break;
            case 'SATOR_CANCELAR_ULTIMA_LEITURA':
                me.callSATOR_CANCELAR_ULTIMA_LEITURA();
                break;
            default:
                me.setMessageText('MSG_PROTOCOL_ERROR');
        }

	},

    /**
     * Encerrar Leitura
     * Todos os Lançamentos Ok?
     *      - Sim
     *          Exceções
     *          - Quebra
     *          - Altera
     *
     *          Flags Diversos ...
     *          - ...
     *          - ...
     *          - ...
     *          - ...
     *
     *      - Não
     *          - Registrar Inconformidades por Item
     *
     *           #002	Item Danificado
     *           #004	Extraviado
     *           #007	Ausente no Kit
     *              Bloqueia Kit
     *              Bloqueia Material (processos)
     *              Encerra Fluxo
     *
     *           003	Material Úmido
     *           005	Embalagem não íntegra
     *           006	Embalagem Violada
     *           008	Não Utilizado
     *           009	Vencido
     *              Registrar NC
     *              Fluxo Segue
     */
    callSATOR_ENCERRAR_LEITURA: function (jump) {
        var me = this,
            view = me.getView(),
            record = view.xdata,
            exceptionby = record.get('exceptionby'),
            stepflaglist = record.get('stepflaglist'),
            stepsettings = record.get('stepsettings');

        stepsettings = stepsettings ? Ext.decode(stepsettings) : null;

        /**
         * Solicita impressão de Etiqueta
         */
        if((stepsettings && stepsettings.tagprinter.indexOf('001') != -1 ) && (jump == undefined)) {
            me.callSATOR_ALLOW_DENY('IMPRIMIR_ETIQUETA');
            return false;
        }

        /**
        * 011 - Exige uso de EPI na Leitura de Entrada
        */
        if(stepflaglist.indexOf('011') != -1) {
            if(record.get('useppe') == null) {
                me.callSATOR_ALLOW_DENY('EPI_ENCERRAR');
                return false;
            }
        }

        if (me.checkUnconformities('001')) {
            me.callSATOR_UNCONFORMITIES();
            return false;
        }

        if (me.checkUnconformities('010')) {
            me.callSATOR_ALLOW_DENY('UNCONFORMITIES');
            return false;
        }

        /**
         * Registrar exceções
         */
        if(exceptionby != null) {
            me.callSATOR_RELATAR_EXCEPTION(Ext.decode(exceptionby));
            return false;
        }

        /**
         * Encerrar Leitura
         *
         * Flags Diversos ...
         *  Action
         *      muda Status
         *
         *  Step
         *      Muda Status
         *
         *  Material
         *      Lança itens para Próxima Etapa
         *
         * Fluxo Segue
         */
        me.encerrarEtapa();
    },

    callSATOR_ALLOW_DENY: function (dialogType) {
        var me = this,
            view = me.getView(),
            typeQuestion = {
                'EPI': 'Relatar uso de  EPI',
                'UNCONFORMITIES': 'Registrar inconformidades',
                'IMPRIMIR_ETIQUETA': 'Imprimir etiqueta'
            },
            doCallBack = function (dialog,field,scope) {
                var me = scope,
                    value = field.getValue(),
                    dialogType = dialog.dialogType.replace('_ENCERRAR','');

                me.setView(dialog.master);

                switch (dialogType) {
                    case 'EPI':
                        var store = Ext.getStore('flowprocessingstep'),
                            model = store.getAt(0),
                            jump = true;

                        model.set('useppe',(value.indexOf('SATOR_SIM') != -1 ? 1 : 0));
                        store.sync({async: false});
                        model.commit();
                        Smart.ion.sound.play("button_tiny");
                        me.setMessageText('MSG_PROTOCOL','SATOR_RELATAR_USA_EPI');
                        if(dialog.dialogType === 'EPI_ENCERRAR') {
                            me.callSATOR_ENCERRAR_LEITURA(jump);
                        }
                        break;
                    case 'UNCONFORMITIES':
                        if(value === 'SATOR_NAO') {
                            var exceptionby = dialog.master.xdata.get('exceptionby');
                            /**
                             * Registrar exceções
                             */
                            if(exceptionby != null) {
                                me.callSATOR_RELATAR_EXCEPTION(Ext.decode(exceptionby));
                                dialog.close();
                                return false;
                            }
                            /**
                             * Encerrar Leitura
                             *
                             * Flags Diversos ...
                             *  Action
                             *      muda Status
                             *
                             *  Step
                             *      Muda Status
                             *
                             *  Material
                             *      Lança itens para Próxima Etapa
                             *
                             * Fluxo Segue
                             */
                            me.encerrarEtapa();
                            dialog.close();
                            return false;
                        }
                        me.callSATOR_UNCONFORMITIES();
                        break;
                    case 'IMPRIMIR_ETIQUETA':
                        var jump = true;
                        if(value === 'SATOR_SIM') {
                            me.callSATOR_IMPRIMIR_ETIQUETA();
                        }
                        me.callSATOR_ENCERRAR_LEITURA(jump);
                        // me.encerrarEtapa();
                        dialog.close();
                        return false;
                        break;
                }

                dialog.close();
            };

        Ext.widget('call_SATOR_ALLOW_DENY', {
            scope: me,
            master: view,
            dialogType: dialogType,
            doCallBack: doCallBack
        }).show(null, function () {
            this.down('label').setText(typeQuestion[dialogType.replace('_ENCERRAR','')]);
            this.down('textfield[name=satorprotocol]').focus(false, 200);
        });
    },

    setOptionDialog: function (dialog,field,eOpts) {
        var me = this;
        dialog.doCallBack(dialog,field,me);
    },

    encerrarEtapa: function () {
        var me = this,
            view = me.getView();

        Ext.Ajax.request({
            scope: me,
            url: me.url,
            params: {
                action: 'select',
                method: 'setEncerrarLeitura',
                flowprocessingid: view.xdata.get('flowprocessingid'),
                flowprocessingstepid: view.xdata.get('id'),
                flowprocessingstepactionid: view.xdata.get('flowprocessingstepactionid')
            },
            callback: function (options, success, response) {
                if (success) {
                    Smart.ion.sound.play("button_tiny");
                    history.back();
                }
            }
        });
    },

    callSATOR_UNCONFORMITIES: function () {
        var me = this,
            view = me.getView();

        Ext.widget('call_SATOR_UNCONFORMITIES', {
            master: view
        }).show(null, function () {
            var list = [],
                grid = this.down('flowprocessingmaterial'),
                sm = grid.getSelectionModel();

            grid.store.each(function(data) {
                if(['001','010'].indexOf(data.get('unconformities')) != -1) {
                    list.push(data);
                }
            });

            if(list.length != 0) {
                var item = list[0];
                sm.select(item);
                grid.plugins[0].startEditByPosition({row: grid.store.indexOf(item), column: 1});
            }
        });
    },

    onStartReaderUnconformities: function (field, e, eOpts) {
        var me = this,
            view = me.getView(),
            master = view.master,
            value = field.getValue();

        field.reset();

        if(value && value.length != 0) {
            if(value.indexOf('SATOR-U') != -1) {
                var list = [],
                    data = [],
                    grid = view.down('flowprocessingmaterial'),
                    sm = grid.getSelectionModel(),
                    md = sm.getSelection()[0],
                    id = md.store.indexOf(md) +1;

                value = value.replace('SATOR-U','');
                md.set('unconformities',value);
                md.store.sync({async: false});
                md.commit();
                sm.select(md);

                md.store.each(function (item) {
                    data.push(item.get('unconformities'));
                    if(['002','004','007'].indexOf(item.get('unconformities')) != -1) {
                        list.push(item.get('materialid'));
                    }
                });

                /**
                 * Encerra leitura com bloqueio
                 * se não houver mais amarelos '001' ...
                 */
                if( data.indexOf('001') == -1 && (
                    data.indexOf('002') != -1 ||
                    data.indexOf('004') != -1 ||
                    data.indexOf('007') != -1 ) ) {

                    /**
                     * SATOR-U00, SATOR_ENCERRAR_LEITURA
                     *
                     *  Cadastros
                     *     Material
                     *          - Bloqueado     - Inviabiliza Leituras
                     *     Kit
                     *          - Bloqueado     - Inviabiliza Leituras
                     *
                     *     Fluxo Atual
                     *          - Fecha e não pode avançar para próxima Área
                     */
                    Ext.Ajax.request({
                        url: me.url,
                        async: false,
                        params: {
                            action: 'select',
                            method: 'setUnconformities',
                            update: Ext.encode(list),
                            params: Ext.encode(master.xdata.data)
                        },
                        callback: function () {
                            //PlaySound
                            view.close();
                            me.setView(master);
                            history.back();
                        }
                    });

                    return false;
                }

                if(md.store.getCount() === id) {
                    view.close();
                    me.setView(master);
                    me.callSATOR_ENCERRAR_LEITURA();
                    e.stopEvent();
                }

                return true;
            }

            me.setMessageText('MSG_PROTOCOL_ERROR');
        }
    },

    callSATOR_RELATAR_EXCEPTION: function (exceptionby) {
        var me = this,
            list = [],
            typeid = [],
            steplevel = [],
            view = me.getView(),
            record = view.xdata;

        Ext.each(exceptionby, function (item) {
            typeid.push(item.typeid);
            steplevel.push(item.steplevel);
        });

        Ext.Ajax.request({
            scope: me,
            url: me.url,
            params: {
                action: 'select',
                method: 'getExceptionDo',
                typeid: Ext.encode(typeid),
                steplevel: Ext.encode(steplevel),
                flowprocessingid: record.get('flowprocessingid')
            },
            callback: function (options, success, response) {
                if (success) {
                    var rows = Ext.decode(response.responseText).rows;
                    Ext.widget('call_SATOR_RELATAR_EXCEPTION').show(null, function () {
                        this.master = view;
                        Ext.each(rows, function (item) {
                            item.element = '';
                            item.flowexception = 0;
                            list.push(item);
                        });
                        this.down('gridpanel').getStore().add(list);
                        this.down('gridpanel').getSelectionModel().select(0);
                    });
                }
            }
        });
    },

    onSelectExceptionArea: function ( rowModel, record, index, eOpts) {
        var me = this,
            view = me.getView(),
            radiogroup = view.down('radiogroup'),
            exceptiondo = Ext.decode(record.get('exceptiondo')),
            elementname = view.down('combobox[name=elementname]');
            // record = view.down('gridpanel').getSelectionModel().getSelection()[0];

        elementname.reset();
        elementname.setReadColor(true);
        elementname.getStore().removeAll();

        radiogroup.reset();
        radiogroup.setValue({
            flowexception: parseInt(record.get('flowexception'))
        });
    },

    onChangeTypeException: function (field,newValue,OldValue,eOpts) {
        var me = this,
            area = [],
            view = me.getView(),
            flowexception = newValue.flowexception,
            elementname = view.down('combobox[name=elementname]'),
            record = view.down('gridpanel').getSelectionModel().getSelection()[0],
            exceptiondo = Ext.decode(record.get('exceptiondo'));

        if((flowexception)&&(flowexception != record.get('flowexception'))) {
            record.set('element','');
            record.set('flowexception',flowexception);
            record.commit();
        }

        elementname.reset();
        elementname.setReadColor(true);
        elementname.getStore().removeAll();

        Ext.each(exceptiondo,function (item) {
            switch(flowexception) {
                case 1:
                    if(item.typelesscode == 'A') {
                        area.push({
                            id: item.id,
                            steplevel: item.steplevel,
                            elementtype: item.elementtype,
                            elementcode: item.elementcode,
                            elementname: item.elementname,
                            levelsource: record.get('stepsource')
                        })
                    }
                    break;
                case 2:
                    if(item.typelesscode == 'Q') {
                        area.push({
                            id: item.id,
                            steplevel: item.steplevel,
                            elementtype: item.elementtype,
                            elementcode: item.elementcode,
                            elementname: item.elementname,
                            levelsource: record.get('stepsource')
                        })
                    }
                    break;
            }
        });

        if(area.length == 0) {
            return false;
        }

        elementname.setReadColor(false);
        elementname.setStore(
            Ext.create('Ext.data.Store', {
                fields: [ 'id', 'steplevel', 'elementcode', 'elementname' ],
                data: area
            })
        );

        if(record.get('element').length) {
            var element = Ext.decode(record.get('element'));
            elementname.setValue(element.elementcode);
            elementname.setRawValue(element.elementname);
        }
    },

    onSelectElementName: function (combo,record,eOpts) {
        var me = this,
            view = me.getView(),
            flowexception = view.down('radiogroup').getValue().flowexception,
            data = view.down('gridpanel').getSelectionModel().getSelection()[0];

        data.set('element',Ext.encode({
            stepchoice: flowexception,
            steplevel: record.get('steplevel'),
            elementtype: record.get('elementtype'),
            elementcode: record.get('elementcode'),
            elementname: record.get('elementname'),
            levelsource: record.get('levelsource')
        }));

        data.commit();
    },

    relatarExceptionDo: function () {
        var me = this,
            list = [],
            view = me.getView(),
            master = view.master,
            store = view.down('gridpanel').getStore();

        store.each(function(record) {
            var element = record.get('element');
            if(element.length) {
                var item = Ext.decode(element);

                list.push({
                    steplevel: item.steplevel,
                    stepchoice: item.stepchoice,
                    elementtype: item.elementtype,
                    elementcode: item.elementcode,
                    levelsource: item.levelsource
                })
            }
        });

        if(list.length != store.getCount()) {
            Smart.Msg.showToast('Favor configurar todas a exceções antes de prosseguir!');
            return false;
        }

        Ext.Ajax.request({
            scope: me,
            url: me.url,
            params: {
                action: 'select',
                method: 'setExceptionDo',
                params: Ext.encode(list),
                flowprocessingid: master.xdata.get('flowprocessingid'),
                flowprocessingstepid: master.xdata.get('id'),
                flowprocessingstepactionid: master.xdata.get('flowprocessingstepactionid')
            },
            callback: function (options, success, response) {
                if (success) {
                    Smart.ion.sound.play("button_tiny");
                    view.close();
                    me.setView(master);
                    history.back();
                }
            }
        });
    },

    relatarCycleStatus: function () {
        var me = this,
            view = me.getView(),
            master = view.master,
            cyclestatus = ['SATOR_SIM','SATOR_NAO'],
            store = Ext.getStore('flowprocessingstep'),
            model = store.getAt(0),
            value = view.down('textfield[name=cyclestatus]').getValue();

        if(!value || value.length == 0 || cyclestatus.indexOf(value) == -1) {
            return false;
        }

        if(value.indexOf('SATOR_SIM') != -1) {
            model.set('cyclestart','START');
            store.sync({async: false});
            model.commit();
            me.setMessageText('MSG_PROTOCOL','SATOR_RELATAR_CYCLE_STATUS');
        }

        view.close();
        me.setView(master);
    },

    checkUnconformities: function (value) {
        var me = this,
            count = 0,
            store = Ext.getStore('flowprocessingstepmaterial');

        store.each(function (item) {
            count += item.get('unconformities') == value ? 1 : 0;
        });

        switch (value) {
            case '001':
                return (count != 0);
                break;
            case '010':
                return (count == store.getCount());
                break;
        }

        return false;
    },

    onSelectUnconformities: function (combo,record,eOpts) {
        var me = this,
            view = me.getView(),
            model = view.down('flowprocessingmaterial').getSelectionModel(),
            selection = model.getSelection()[0];

        selection.set('unconformities',combo.getValue());
    },

    setUnconformities: function () {
        var me = this,
            data = [],
            list = [],
            view = me.getView(),
            master = view.master,
            store = Ext.getStore('flowprocessingstepmaterial');

        store.each(function (item) {
            if(['001'].indexOf(item.get('unconformities')) != -1) {
                data.push(item);
            }
        },me);

        if(data.length != 0) {
            store.load();
            me.setMessageText('MSG_PROTOCOL','Inconformidades pendentes no encerramento!');
            return false;
        }

        data = [];

        store.each(function (item) {
            if(item.dirty) {
                list.push(item.get('unconformities'));
                data.push(item);
                item.commit();
            }
        },me);

        if(data.length == 0) {
            me.setMessageText('MSG_NOT_AVAILABLE');
            return false;
        }

        Ext.each(data,function(item) {
            item.set('isdirty',true);
            item.store.sync({async: false});
            item.commit();
        });

        if( list.indexOf('002') != -1 ||
            list.indexOf('004') != -1 ||
            list.indexOf('007') != -1 ) {

            Ext.Ajax.request({
                scope: me,
                url: me.url,
                params: {
                    action: 'select',
                    method: 'setUnconformities',
                    params: Ext.encode(master.xdata.data)
                },
                success: function (response, opts) {
                    Smart.ion.sound.play("button_tiny");
                    view.close();
                    me.setView(master);
                    history.back();
                }
            });
        }
    },

    callSATOR_INFORMAR_INSUMOS: function () {
        var me = this;
        Ext.widget('call_SATOR_INFORMAR_INSUMOS').show(null,function () {
            var tree = this.down('treepanel');
            tree.getStore().remove(tree.getStore().getAt(0));
            this.master = me.getView();
            this.down('searchelement').focus(false,200);
        });
    },

    onBeforeSearchElement: function (queryPlan , eOpts) {
        var data = Ext.getStore('flowprocessingstep').getAt(0);

        queryPlan.combo.getStore().pageSize = 7;
        queryPlan.combo.getStore().setParams({
            flowprocessingid: data.get('flowprocessingid')
        });
    },

    onBeforeSearchInput: function ( queryPlan, eOpts ) {
        var me = this,
            view = me.getView(),
            combo = queryPlan.combo,
            equipmentid = view.down('searchelement').foundRecord().get('equipmentid');

        combo.store.setParams({ equipmentid: equipmentid });
    },

    informarInsumo: function () {
        var me = this,
            view = me.getView(),
            form = view.down('form'),
            store = Ext.getStore('flowprocessingstepinput');

        if(!form.isValid()) {
            return false;
        }

        store.add(form.getValues());
        store.sync({
            callback: function() {
                Ext.getStore('flowprocessingstepinputtree').load();
                me.onShowClearSearchElement();
            }
        });
    },

    onActionDeleteTree: function(grid, rowIndex, colIndex) {
        var me = this,
            store = grid.getStore(),
            record = store.getAt(rowIndex);

        Ext.Msg.confirm('Excluir registro', 'Confirma a exclusão do registro selecionado?',
            function (choice) {
                if (choice === 'yes') {
                    Ext.Ajax.request({
                        scope: me,
                        url: store.getUrl(),
                        params: {
                            action: 'delete',
                            rows: Ext.encode({id: record.get('id')})
                        },
                        success: function(response, opts) {
                            store.remove(record);
                        }
                    });
                }
            }
        );
    },

    onShowClearSearchElement: function () {
        var me = this,
            view = me.getView(),
            form = view.down('form'),
            searchinput = form.down('searchinput'),
            searchelement = form.down('searchelement'),
            quantity = form.down('numberfield[name=quantity]');

        form.reset();
        quantity.setMinValue(0);
        quantity.setReadColor(true);
        searchinput.getStore().removeAll();
        searchelement.focus(false,200);
    },

    onSelectSearchElement: function () {
        var me = this,
            view = me.getView(),
            form = view.down('form'),
            searchinput = form.down('searchinput'),
            lotpart = form.down('textfield[name=lotpart]'),
            quantity = form.down('numberfield[name=quantity]'),
            datevalidity = form.down('datefield[name=datevalidity]'),
            presentation = form.down('hiddenfield[name=presentation]'),
            presentationdescription = form.down('textfield[name=presentationdescription]');

        lotpart.reset();
        searchinput.reset();
        datevalidity.reset();
        presentation.reset();
        presentationdescription.reset();

        quantity.reset();
        quantity.setMinValue(0);
        quantity.setReadColor(true);
        searchinput.getStore().removeAll();
    },

    onSelectSearchInput: function (combo,record,eOpts) {
        var me = this,
            view = me.getView(),
            hasbatch = record.get('hasbatch'),
            hasstock = record.get('hasstock'),
            button = view.down('button[name=confirm]'),
            lotpart = view.down('textfield[name=lotpart]'),
            quantity = view.down('numberfield[name=quantity]'),
            datevalidity = view.down('datefield[name=datevalidity]'),
            presentation = view.down('hiddenfield[name=presentation]'),
            presentationdescription = view.down('textfield[name=presentationdescription]');

        lotpart.setValue(record.get('lotpart'));
        datevalidity.setValue(record.get('datevalidity'));
        presentation.setValue(record.get('presentation'));
        presentationdescription.setValue(record.get('presentationdescription'));

        quantity.setReadColor(hasstock != 1);
        quantity.setMinValue(hasstock == 1 ? 1 : 0);
        quantity.setMaxValue(hasstock == 1 ? record.get('lotamount') : 0);

        if(hasstock != 1) {
            me.informarInsumo();
        }
    },

    printerTagItem: function(grid, rowIndex, colIndex) {
        var me = this,
            tagprinter = {},
            store = grid.getStore(),
            record = store.getAt(rowIndex);

        switch (colIndex) {
            case 3:
                tagprinter = { tagprinter: '001' };
                break;
            case 4:
                tagprinter = { tagprinter: '002' };
                break;
        }

        console.info(Ext.encode({ stepsettings: tagprinter }));

        Ext.Ajax.request({
            scope: me,
            url: me.url,
            params: {
                action: 'select',
                method: 'imprimeEtiqueta',
                id: record.get('id'),
                printlocate: Smart.workstation.printlocate,
                stepsettings: Ext.encode({ stepsettings: tagprinter })
            },
            callback: function (options, success, response) {
                var result = Ext.decode(response.responseText);

                if(!success || !result.success) {
                    Smart.ion.sound.play("computer_error");
                    Smart.Msg.showToast('Não foi possivel completar a sua solicitação!');
                    return false;
                }
            }
        });
    },

    /**
     * Imprmir etiqueta
     *
     * Chamar: callSATOR_ENCERRAR_LEITURA
     */
    callSATOR_IMPRIMIR_ETIQUETA: function () {
        var me = this,
            view = me.getView(),
            record = view.xdata,
            stepsettings = record.get('stepsettings');

        stepsettings = stepsettings ? Ext.decode(stepsettings) : null;

        if(!stepsettings && (record.get('steptype') == 'T') && (record.get('cyclestatus') == 'FINAL')) {
            stepsettings = {
                tagprinter: '002'
            }
        }

        if(stepsettings && ['001','002'].indexOf(stepsettings.tagprinter) != -1) {
            Ext.Ajax.request({
                scope: me,
                url: me.url,
                params: {
                    action: 'select',
                    method: 'imprimeEtiqueta',
                    id: view.xdata.get('id'),
                    printlocate: Smart.workstation.printlocate,
                    stepsettings: Ext.encode(stepsettings)
                },
                callback: function (options, success, response) {
                    var result = Ext.decode(response.responseText);

                    if(!success || !result.success) {
                        Smart.ion.sound.play("computer_error");
                        Smart.Msg.showToast('Não foi possivel completar a sua solicitação!');
                        return false;
                    }

                    if(stepsettings.tagprinter == '002') {
                        me.encerrarEtapa();
                    }
                }
            });
        }
    },

    callSATOR_CANCELAR_LEITURAS: function () {
        var me = this,
            data = [],
            store = Ext.getStore('flowprocessingstepmaterial');

        store.each(function (item) {
            if(item.get('unconformities') != '001') {
                data.push(item);
            }
        },me);

        if(data.length == 0) {
            me.setMessageText('MSG_NOT_AVAILABLE');
            return false;
        }

        Ext.each(data,function(item) {
            item.set('unconformities','001');
            item.store.sync({async: false});
            item.commit();
        });
    },

    callSATOR_LANCAMENTO_MANUAL: function () {
        var me = this;
        Ext.widget('call_SATOR_LANCAMENTO_MANUAL').show(null,function () {
            this.master = me.getView();
            this.down('searchmaterial').focus(false,200);
        });
    },

    lancamentoManual: function () {
        var me = this,
            view = me.getView(),
            master = view.master,
            record = view.down('searchmaterial').foundRecord();

        view.close();
        me.setView(master);
        me.workReadArea(record.get('barcode'));
    },
	
    callSATOR_CONSULTAR_MATERIAL: function () {
        var me = this;
        Ext.widget('call_SATOR_CONSULTAR_MATERIAL').show(null,function () {
            this.master = me.getView();
            this.down('searchmaterial').focus(false,200);
        });
    },

    callSATOR_CANCELAR_ULTIMA_LEITURA: function () {
        var me = this,
            data = null,
            store = Ext.getStore('flowprocessingstepmaterial');

        store.each(function (item) {
            if(item.get('unconformities') != '001'){
                data = item;
            }
        },me);

        if(!data) {
            me.setMessageText('MSG_NOT_AVAILABLE');
            return false;
        }

        data.set('unconformities','001');
        data.store.sync({async: false});
        data.commit();
    },

	workReadArea: function (value) {
        var me = this,
			view = me.getView(),
            record = view.xdata,
            stepflaglist = record.get('stepflaglist'),
            store = view.down('flowprocessingmaterial').getStore(),
            model = view.down('flowprocessingmaterial').getSelectionModel(),
            materialboxid = view.down('hiddenfield[name=materialboxid]').getValue();

		/**
          * - Verificar é Kit ?
          *      Não é Kit,
          *          Já foi lançado ?
          *              Sim -> Mensagem de duplicidade
          *              Não -> Pesquisa e Insert (Depende do Status do Material)
          */
		if(!materialboxid) {
            me.setIsntMaterialBox(value);
            return false;
		}

		/**
          * - Verificar é Kit ?
          *      Sim é Kit, [isMaterialBox]
          *			Não foi encontrado no Kit ?
          *          Já foi lançado ?
          *              Sim -> Mensagem de duplicidade
          *              Não -> Update Status do Item na Lista
          */
        var data = store.findRecord('barcode',value);

        /**
         * Não foi encontrado no Kit || Não é  ?
         */
		if(data && !data && value.indexOf('P') == -1) {
			me.setMessageText('MSG_UNKNOWN');
			return false;
		}

        /**
         * Já foi lançado ?
         * Sim -> Mensagem de duplicidade
         */
        if (data && data.get('unconformities') != '001') {
            Smart.ion.sound.play("computer_error");
			me.setMessageText('MSG_DUPLICATED');
            model.select(data);
			return false;
		}

        /**
         * 019 - Leitura única, valida os itens do Kit
         */
        if(stepflaglist.indexOf('019') != -1) {
            store.getAt(0);
            store.each(function (data) {
                data.set('unconformities','010');
                data.store.sync({async: false});
                data.commit();
            });

            Smart.ion.sound.play("button_tiny");
            me.setMessageText('MSG_PROTOCOL','Leitura única realizada!');
            return false;
        }

        /**
         * Já foi lançado ?
         * Não -> Update Status do Item na Lista
         */
        if(data) {
            data.set('unconformities','010');
            store.sync({
                callback: function () {
                    data.commit();
                    model.select(data);
                    Smart.ion.sound.play("button_tiny");
                }
            });
        }
    },

    setIsntMaterialBox: function (value) {
        var me = this,
            view = me.getView(),
            record = view.xdata,
            stepflaglist = record.get('stepflaglist'),
            store = Ext.getStore('flowprocessingstepmaterial'),
            model = view.down('flowprocessingmaterial').getSelectionModel();

        var data = store.findRecord('barcode',value);

        /**
         * Já foi lançado ?
         * Sim -> Mensagem de duplicidade
         */
        if (data && data.get('unconformities') == '010') {
            Smart.ion.sound.play("computer_error");
            me.setMessageText('MSG_DUPLICATED');
            model.select(data);
            return false;
        }

        /**
         * 019 - Leitura única, valida os itens do Kit
         */
        if(stepflaglist.indexOf('019') != -1) {
            store.getAt(0);
            store.each(function (data) {
                data.set('unconformities','010');
                data.store.sync({async: false});
                data.commit();
            });

            Smart.ion.sound.play("button_tiny");
            me.setMessageText('MSG_PROTOCOL','Leitura única realizada!');
            return false;
        }

        /**
         * Já foi lançado ?
         * Não -> Pesquisa e Insert (Depende do Status do Material)
         */
        Ext.Ajax.request({
            scope: me,
            url: store.getUrl(),
            params: {
                action: 'select',
                method: 'insertItem',
                barcode: value,
                flowprocessingstepid: view.xdata.get('id')
            },
            callback: function (options, success, response) {
                var result = Ext.decode(response.responseText);

                if(!success || !result.success) {
                    Smart.ion.sound.play("computer_error");
                    me.setMessageText('MSG_UNKNOWN');
                    return false;
                }

                if(data) {
                    data.set('unconformities','010');
                    store.sync({
                        callback: function () {
                            data.commit();
                            model.select(data);
                            Smart.ion.sound.play("button_tiny");
                        }
                    });
                }
            }
        });
    },

    /**
     * Leitura de Materias
     *  - Kit
     *      Material Status 'A'
     *      Material no Kit
     *      Material no Status '001'
     *
     *  - Avulso
     *      Material IsActive = 1
     *      Material no Status '001'
     *      Material fora de Kit
     *
     *  - Outras Leituras
     *      Protocolos
     *          -   Processar Itens                         SATOR_PROCESSAR_ITENS
     *          -   Iniciar Leitura                         SATOR_INICIAR_LEITURA
     *          -   Encerrar Leitura                        SATOR_ENCERRAR_LEITURA
     *          -   Ler Insumos                             SATOR_INFORMAR_INSUMOS
     *          -   Cancelar Leituras Relizadas             SATOR_CANCELAR_LEITURAS
     *          -   Imprimir Etiquetas                      SATOR_IMPRIMIR_ETIQUETA
     *          -   Consultar Material                      SATOR_CONSULTAR_MATERIAL
     *          -   Preparar Lote de cubas                  SATOR_PREPARAR_LOTE_CUBA
     *          -   Cancelar Ultima Leitura                 SATOR_CANCELAR_ULTIMA_LEITURA
     *          -   Relatar uso de EPI				        SATOR_RELATAR_USA_EPI
     *              -   SATOR_SIM
     *              -   SATOR_NAO
     *          -
     */

    /**
     * Controles para Processamento e Leitura
     */
    onChangedMaterial: function (store, eOpts) {
        var me = this,
            count = 0,
            score = '{0}/{1}',
            materialaccount = me.getView().down('label[name=materialaccount]');

        store.each(function (item) {
            count += item.get('unconformities') != '001' ? 1 : 0;
        });

        if(materialaccount) materialaccount.setText(Ext.String.format(score,count,store.getCount()));
    },

    onSelectDataView: function (view,record,eOpts) {
        Ext.getStore('flowprocessingstep').setParams({
            method: 'selectCode',
            query: record.get('id')
        }).load();
    },

    onDeSelectDataView: function (view,record,eOpts) {
        Ext.getStore('flowprocessingstep').removeAll();
        Ext.getStore('flowprocessingstepaction').removeAll();
    },

    onSelectFlowProcessingStep: function (rowModel, record, index, eOpts) {
        var me = this,
            view = me.getView(),
            label = view.down('label[name=processlabel]');

        label.setText(record.get('elementname'));

        Ext.getStore('flowprocessingstepaction').setParams({
            method: 'selectCode',
            query: record.get('id')
        }).load();
    },

    onDeSelectFlowProcessingStep: function ( rowModel, record, index, eOpts ) {
        Ext.getStore('flowprocessingstepaction').removeAll();
    },

    onFlowStepSelect: function (view,record,eOpts) {
        var me = this,
            view = me.getView(),
            store = Ext.getStore('flowprocessing'),
            propertygrid = view.down('propertygrid');

        if(record.get('steptype') == 'P') {
            store.setParams({
                method: 'selectDashStep',
                query: record.get('flowprocessingid')
            }).load({
                scope: me,
                callback: function(records, operation, success) {
                    var source = {},
                        record = records[0],
                        fields = [
                            'patientname',
                            'materialboxname',
                            'surgicalwarning',
                            'healthinsurance',
                            'sterilizationtypename'
                        ];

                    Ext.each(fields,function(item) {
                        source[item] = record.get(item);
                    });

                    propertygrid.setSource(source);
                    propertygrid.getColumns()[0].hide();
                }
            });
        }
    },

    onFlowStepDeSelect: function () {
        var me = this,
            view = me.getView(),
            store = Ext.getStore('flowprocessing'),
            propertygrid = view.down('propertygrid');

        store.removeAll();
        propertygrid.setSource({});
    },

    onFlowStepRemove: function (viewView,store) {
        var me = this,
            record = viewView.getSelectionModel().getSelection()[0];

        Ext.Msg.confirm('Excluir carga', 'Confirma a exclusão da carga selecionada?',
            function (choice) {
                if (choice === 'yes') {
                    Ext.Ajax.request({
                        scope: me,
                        url: me.url,
                        params: {
                            id: record.get('id'),
                            action: 'select',
                            method: 'setRemoveCargaLista'
                        },
                        success: function() {
                            viewView.updateType();
                        }
                    });
                }
            }
        );
    },

    onFlowStepAction: function ( viewView, record, item, index, e, eOpts ) {
        var me = this,
            userid = record.get('username'),
            barcode = record.get('barcode'),
            donetype = record.get('donetype'),
            action = record.get('flowstepaction'),
            stepflaglist = record.get('stepflaglist'),
            stepid = record.get('flowprocessingstepid'),
            doCallBack = function (rows) {
                Ext.Ajax.request({
                    scope: me,
                    url: me.url,
                    params: {
                        action: 'select',
                        method: 'updateUserStep',
                        username: rows.username,
                        flowprocessingstepid: stepid
                    },
                    callback: function (options, success, response) {
                        var result = Ext.decode(response.responseText);

                        if(!success || !result.success) {
                            return false;
                        }

                        //http://stackoverflow.com/questions/34527993/extjs-routers-pass-multiple-parameters
                        me.redirectTo( 'flowprocessingview/' + stepid + (donetype == 'B' ? '/' + barcode : ''));
                    }
                });

                return true;
            };

        if(!Smart.workstation) {
            Smart.ion.sound.play("computer_error");
            Smart.Msg.showToast('Estação de Trabalho Não Configurada, Operação Não pode ser Realizada!','error');
            return false;
        }

        /**
         * Carga Validada aguardando Iniciar Ciclo
         */
        if(['C','T'].indexOf(record.get('steptype')) != -1) {
            switch(action) {
                case '001':
                    me.callSATOR_RELATAR_CYCLE_STATUS('START',record);
                    break;
                case '002':
                    me.callSATOR_RELATAR_CYCLE_STATUS('FINAL',record);
                    break;
                case '005':
                    me.callSATOR_RELATAR_CYCLE_STATUS('PRINT',record);
                    break;
            }
            return false;
        }

        switch(action) {
            case '001':
                    if(stepflaglist.indexOf("016") != -1) {
                        Smart.ion.sound.play("computer_error");
                        Smart.Msg.showToast('Este processo requer Validação de Carga!');
                        return false;
                    }

                    if(!userid) {
                        Ext.widget('flowprocessinguser', {
                            scope: me,
                            doCallBack: doCallBack
                        }).show(null,function () {
                            this.down('form').reset();
                            this.down('textfield[name=usercode]').focus(false,200);
                        });
                    } else {
                        me.redirectTo( 'flowprocessingview/' + stepid + (donetype == 'B' ? '/' + barcode : ''));
                    }
                break;
            case '002':
                Smart.ion.sound.play("computer_error");
                Smart.Msg.showToast('Este processo requer autorização antes de prosseguir!');
                return false;
                break;
        }
    },

    callSATOR_RELATAR_CYCLE_STATUS: function (status,record) {
        var me = this,
            view = me.getView();

        Ext.widget('call_SATOR_RELATAR_CYCLE_STATUS').show(null,function () {
            this.master = view;
            this.xdata = record;
            this.down('hiddenfield[name=cyclestatus]').setValue(status);
            switch(status) {
                case 'START':
                    this.down('label').setText('Relatar inicio de ciclo');
                    break;
                case 'FINAL':
                    this.down('label').setText('Relatar final de ciclo');
                    break;
                case 'PRINT':
                    this.down('label').setText('Imprimir lote avulso');
                    break;
            }
        });
    },

    onItemKeyDownMaterial: function (grid, record, item, index, e, eOpts) {
        var me = this,
            view = me.getView();

        if (e.ctrlKey == true) {

            if ([e.DELETE,e.INSERT].indexOf(e.getKey()) != -1) {
                var params = record.data;

                params.action = 'select';
                params.method = ( e.getKey() == e.DELETE ) ? 'deleteItem' : 'insertItem';

                Ext.Msg.confirm('Atualizar processo', 'Confirma a atualização do processo atual?',
                    function (choice) {
                        if (choice === 'yes') {
                            Ext.Ajax.request({
                                scope: me,
                                url: me.url,
                                params: params,
                                callback: function (options, success, response) {
                                    var result = Ext.decode(response.responseText);

                                    if (!success || !result.success) {
                                        Smart.Msg.showToast('O processo não foi executado com sucesso!','error');
                                        return false;
                                    }
                                    Smart.Msg.showToast(result.rows[0].err_text,'info');
                                    view.down('textfield[name=search]').focus(false,200);
                                    if(result.rows[0].err_code == 0) record.store.load();
                                }
                            });
                        }
                    }
                );
            }
        }
    },

    onBeforeEditMaterialFlowStepAction: function ( editor, context, eOpts ) {
        var grid = context.grid,
            data = context.record,
            unconformities = data.get('unconformities');

        if(data) {
            grid.getSelectionModel().select(data);
        }

        return (context.grid.editable) && (['001','010'].indexOf(unconformities) != -1);
    },

    onSelectMaterialFlowStepAction: function ( rowModel, record, index, eOpts) {
        var me = this,
            view = me.getView(),
            portrait = view.down('portrait');

        if(portrait) {
            Ext.Ajax.request({
                scope: me,
                url: record.store.getUrl(),
                params: {
                    action: 'select',
                    method: 'selectFile',
                    materialid: record.get('materialid')
                },
                callback: function (options, success, response) {
                    var result = Ext.decode(response.responseText);

                    if (!success || !result.success) {
                        Smart.Msg.showToast('O processo não foi executado com sucesso!','info');
                        return false;
                    }

                    var filedata = result.rows[0].filedata;
                    var fileinfo = result.rows[0].fileinfo;

                    var info = fileinfo,
                        type = (info && info.length !== 0) ? Ext.decode(info) : null;
                    var filetype = (type) ? Ext.String.format('data:{0};base64,{1}',type.fileType,filedata) : filedata;

                    portrait.beFileData(filetype);
                }
            });

            // portrait.beFileData(record.get('filetype'));
            portrait.update(Ext.String.format('<div class="portrait-label">{0}</div>',record.get('materialname')));
        }
    },

    onItemDblClickMaterial: function ( viewView, record, item, index, e, eOpts ) {
        var me = this,
            doCallBack = function (rows) {
                me.setMessageText('MSG_PROTOCOL',Ext.String.format('Código do material consultado {0}', record.get('barcode')));
                return true;
            };

        Ext.widget('flowprocessinguser', {
            scope: me,
            doCallBack: doCallBack
        }).show(null,function () {
            this.down('form').reset();
            this.down('textfield[name=usercode]').focus(false,200);
        });

    },

    onFlowTaskAction: function ( viewView, record, item, index, e, eOpts ) {
        var me = this,
            taskcode = record.get('taskcode');

        switch(taskcode) {
            case '001':
                Ext.widget('call_SATOR_AUTHORIZE').show(null, function () {
                    this.master = me.getView();
                    this.down('gridpanel').getStore().load();
                });
                break;
            case '002':
                window.open('business/Calls/Quick/FlowProtocol.php?id=1');
                break;
        }
    },

    setDeleteChargeItem: function(grid, rowIndex, colIndex) {
        var me = this,
            store = grid.getStore(),
            record = store.getAt(rowIndex),
            view = me.getView();

        Ext.Msg.confirm('Excluir registro', 'Confirma a exclusão do registro selecionado?',
            function (choice) {
                if (choice === 'yes') {
                    store.remove(record);
                    view.down('textfield[name=materialboxname]').focus(false,200);
                }
            }
        );
    },

    setAuthorize: function(grid, rowIndex, colIndex) {
        var record = grid.getStore().getAt(rowIndex);

        record.set('haspending',!record.get('haspending'));
        record.commit();
    },

    // Autorizar Quebra de Fluxo
    setAuthorizeList: function () {
        var me = this,
            list = [],
            view = me.getView(),
            store = view.down('gridpanel').getStore(),
            doCallBack = function (rows) {
                var kont = 0;
                Ext.each(list,function (item) {
                    var flowstepaction = item.get('flowstepaction');
                    item.set('authorizedby', rows.username);
                    item.set('isactive', (flowstepaction == '002' ? 'AUTHORIZE' : 'TOREVERSE'));
                    kont += item.store.sync({async: false}) ? 1 : 0;
                });
                if (kont == list.length) {
                    Smart.ion.sound.play("button_tiny");
                    Ext.getStore('flowprocessingstepaction').load();
                    view.master.down('dataview[name=flowprocessingsteptask]').store.load();
                    view.close();
                }
                return (kont == list.length);
            };

        store.each(function(record) {
            if(record.get('haspending')) {
                list.push(record);
            }
        });

        if (list.length == 0 || (store.getCount() != list.length)) {
            Smart.ion.sound.play("computer_error");
            Smart.Msg.showToast('Este processo requer selecionar antes de prosseguir!','info');
            return false;
        }

        Ext.widget('flowprocessinguser', {
            scope: me,
            doCallBack: doCallBack
        }).show(null,function () {
            this.down('form').reset();
            this.down('textfield[name=usercode]').focus(false,200);
        });
    },

    setReverteEtapaItem: function () {
        var me = this,
            list = [],
            view = me.getView(),
            store = view.down('gridpanel').getStore(),
            doCallBack = function (rows) {
                var back = true,
                    data = view.down('form').getValues();

                data.action = 'select';
                data.list = Ext.encode(list);
                data.username = rows.username;
                data.method = 'setReverteEtapaArea';
                data.areasid = Smart.workstation.areasid;

                Ext.Ajax.request({
                    scope: me,
                    url: me.url,
                    params: data,
                    async: false,
                    callback: function (options, success, response) {
                        var result = Ext.decode(response.responseText);

                        if (!success || !result.success) {
                            Smart.ion.sound.play("computer_error");
                            back = false;
                            Smart.Msg.showToast('O processo não foi executado com sucesso!','info');
                        }
                    }
                });

                if (back) {
                    view.master.updateType();
                    Smart.ion.sound.play("button_tiny");
                    view.close();
                }

                return back;
            };

        store.each(function(record) {
            list.push(record.data);
        });

        if (store.getCount() == 0) {
            Smart.ion.sound.play("computer_error");
            Smart.Msg.showToast('O processo requer selecionar antes de prosseguir!','info');
            return false;
        }

        Ext.widget('flowprocessinguser', {
            scope: me,
            doCallBack: doCallBack
        }).show(null,function () {
            this.down('form').reset();
            this.down('textfield[name=usercode]').focus(false,200);
        });
    },

    setValidaCargaAreas: function () {
        var me = this,
            list = [],
            view = me.getView(),
            store = view.down('gridpanel').getStore(),
            doCallBack = function (rows) {
                var back = true,
                    data = view.down('form').getValues();

                data.action = 'select';
                data.list = Ext.encode(list);
                data.username = rows.username;
                data.method = 'setValidaCargaAreas';
                data.areasid = Smart.workstation.areasid;

                Ext.Ajax.request({
                    scope: me,
                    url: me.url,
                    params: data,
                    async: false,
                    callback: function (options, success, response) {
                        var result = Ext.decode(response.responseText);

                        if (!success || !result.success) {
                            Smart.ion.sound.play("computer_error");
                            back = false;
                            Smart.Msg.showToast('O processo não foi executado com sucesso!','info');
                        }
                    }
                });

                if (back) {
                    view.master.updateType();
                    Smart.ion.sound.play("button_tiny");
                    view.close();
                }

                return back;
            };

        store.each(function(record) {
            list.push(record.data);
        });

        if (store.getCount() == 0) {
            Smart.ion.sound.play("computer_error");
            Smart.Msg.showToast('O processo requer selecionar antes de prosseguir!','info');
            return false;
        }

        Ext.widget('flowprocessinguser', {
            scope: me,
            doCallBack: doCallBack
        }).show(null,function () {
            this.down('form').reset();
            this.down('textfield[name=usercode]').focus(false,200);
        });
    },
    
    setValidaCargaLista: function () {
        var me = this,
            list = [],
            view = me.getView(),
            store = view.down('gridpanel').getStore(),
            doCallBack = function (rows) {
                var back = true,
                    data = view.down('form').getValues();

                data.action = 'select';
                data.list = Ext.encode(list);
                data.username = rows.username;
                data.method = 'setValidaCargaLista';
                data.areasid = Smart.workstation.areasid;

                Ext.Ajax.request({
                    scope: me,
                    url: me.url,
                    params: data,
                    async: false,
                    callback: function (options, success, response) {
                        var result = Ext.decode(response.responseText);

                        if (!success || !result.success) {
                            Smart.ion.sound.play("computer_error");
                            back = false;
                            Smart.Msg.showToast('O processo não foi executado com sucesso!','info');
                        }
                    }
                });

                if (back) {
                    view.master.updateType();
                    Smart.ion.sound.play("button_tiny");
                    view.close();
                }

                return back;
            };

        store.each(function(record) {
            list.push(record.data);
        });

        if (store.getCount() == 0) {
            Smart.ion.sound.play("computer_error");
            Smart.Msg.showToast('O processo requer selecionar antes de prosseguir!','info');
            return false;
        }

        Ext.widget('flowprocessinguser', {
            scope: me,
            doCallBack: doCallBack
        }).show(null,function () {
            this.down('form').reset();
            this.down('textfield[name=usercode]').focus(false,200);
        });
    },

    relatarStatusCiclo: function () {
        var me = this,
            view = me.getView(),
            doCallBack = function (rows) {
                var back = true,
                    data = view.xdata.data,
                    cyclestatus = view.down('form').getValues().cyclestatus;

                data.action = 'select';
                data.username = rows.username;
                data.method = 'setStatusCiclo';
                data.cyclestatus = cyclestatus;
                data.areasid = Smart.workstation.areasid;
                data.printlocate = Smart.workstation.printlocate;

                Ext.Ajax.request({
                    scope: me,
                    url: me.url,
                    params: data,
                    async: false,
                    callback: function (options, success, response) {
                        var result = Ext.decode(response.responseText);

                        if (!success || !result.success) {
                            Smart.ion.sound.play("computer_error");
                            back = false;
                            Smart.Msg.showToast('Este processo não foi executado com sucesso!','info');
                        }
                    }
                });

                if (back) {
                    view.master.updateType();
                    Smart.ion.sound.play("button_tiny");
                    view.close();
                }

                return back;
            };

        Ext.widget('flowprocessinguser', {
            scope: me,
            doCallBack: doCallBack
        }).show(null,function () {
            this.down('form').reset();
            this.down('textfield[name=usercode]').focus(false,200);
        });
    }

});