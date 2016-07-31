//@charset UTF-8
Ext.define( 'iSterilization.view.flowprocessing.FlowProcessingController', {
    extend: 'Smart.app.ViewControllerBase',

    alias: 'controller.flowprocessing',

    routes: {
        'flowprocessingview/:id': {
            action: 'getFlowProcessingId'
        },
        'flowprocessingview': {
            action: 'getFlowProcessingNew'
        }
    },

    url: '../iSterilization/business/Calls/flowprocessing.php',

    fetchField: function (search, button) {
        Ext.getStore('flowprocessing').setParams({
            query: search.getValue()
        }).load();
    },

    //routes ===================================>>
    getFlowProcessingId: function (id) {
        var me = this,
            app = Smart.app.getController('App');

        Ext.getStore('flowprocessing').setParams({
            method: 'selectCode',
            query: id,
            rows: Ext.encode({ id: id })
        }).load({
            scope: me,
            callback: function(records, operation, success) {
                var record = records[0];
                app.onMainPageView({xtype: 'flowprocessingview', xdata: record});
            }
        });

    },

    // getFlowProcessingNew: function () {
    //     var app = Smart.app.getController('App');
    //     app.onMainPageView({xtype: 'flowprocessingview', xdata: null});
    // }
    //routes ===================================>>

    onKeyDownDash: function (view, e, eOpts) {
        var me = this,
            view = me.getView();

        if (e.getKey() === e.ENTER) {
            console.info(e.getKey());
        }
    },

    /**
     * Controles para Rastreabilidade
     */

    onAfterRenderDash: function () {
        var me = this,
            view = me.getView(),
            datepicker = view.down('datepicker'),
            traceability = view.down('combobox[name=traceability]');

        datepicker.focus();
        traceability.setValue(0);
        me.selectDatePicker(datepicker,datepicker.getValue());

        view.keyMap = new Ext.util.KeyMap({
            target: view.getEl(),
            binding: [
                {
                    key: [
                        Ext.event.Event.HOME,
                        Ext.event.Event.PAGE_UP
                    ],
                    fn: function(){
                        me.flowProcessingOpen();
                    }
                }
            ],
            scope: me
        });

    },

    flowProcessingOpen: function () {
        if(!Smart.workstation) {
            Smart.Msg.showToast('Estação de Trabalho Não Configurada, Operação Não pode ser Realizada!','error');
            return false;
        }

        Ext.widget('flowprocessinguser').show(null,function () {
            this.down('form').reset();
            this.flowtype = 'flowopen';
            this.down('textfield[name=usercode]').focus(false,200);
        });
    },

    onSelectUserCode: function (win,field,eOpts) {
        var me = this,
            view = me.getView(),
            form = view.down('form');

        if(!field.isValid()) {
            return false;
        }

        Ext.Ajax.request({
            scope: me,
            url: me.url,
            params: {
                action: 'select',
                method: 'selectUserCode',
                query: field.getValue()
            },
            callback: function (options, success, response) {
                var result = Ext.decode(response.responseText);

                if(!success || !result.success) {
                    return false;
                }

                form.down('hiddenfield[name=id]').setValue(result.rows[0].id);
                form.down('textfield[name=fullname]').setValue(result.rows[0].fullname);
                form.down('hiddenfield[name=username]').setValue(result.rows[0].username);
            }
        });
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

    onComeInSendSuccess: function (form, action) {
        var me = this,
            result = Ext.decode(action.response.responseText),
            view = me.getView(),
            rows = result.rows[0];

        view.setLoading(false);

        if(result.success) {
            view.close();
            // var dash = Ext.WindowMgr.get('flowprocessingdash');

            if(!Smart.workstation) {
                Smart.Msg.showToast('Estação de Trabalho Não Configurada, Operação Não pode ser Realizada!','error');
                return false;
            }

            switch(view.flowtype) {
                case 'flowopen': // Abrir Novo Processamento/Leitura
                    me.onFireTypeOpenFlow(rows,{});
                    break;
            }
        }
    },

    onFireTypeOpenFlow: function (userRows,eOpts) {
        Ext.widget('flowprocessingopen').show(null,function () {
            this.down('searchmaterial').focus(false,200);
            this.down('textfield[name=username]').setValue(userRows.username);
            this.down('hiddenfield[name=areasid]').setValue(Smart.workstation.areasid);
            this.down('textfield[name=areasname]').setValue(Smart.workstation.areasname);
        });
    },

    onFormSubmitFailure: function (form, action) {
        var me = this,
            view = me.getView();

        view.setLoading(false);
        Smart.Msg.showToast(action.result.text,'info');
        view.down('textfield[name=password]').focus(false,200);
    },

    selectDatePicker: function (datePicker, date, eOpts) {
        var me = this,
            view = me.getView(),
            labelperiod = view.down('label[name=labelperiod]');

        labelperiod.setText(me.getDateFormated(date));

        Ext.getStore('flowprocessing').setParams({
            method: 'selectFlow',
            dateof: Ext.util.Format.date(date,'Y-m-d')
        }).load({
            scope: me,
            callback: function(records, operation, success) {
            }
        });

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
            flow = view.down('searchsterilizationtype');

        flow.setReadColor(false);
        flow.setValue(record.get('sterilizationtypeid'));
        flow.setRawValue(record.get('sterilizationpriority'));

        view.down('hiddenfield[name=prioritylevel]').setValue(record.get('prioritylevel'));
        view.down('hiddenfield[name=materialboxid]').setValue(record.get('materialboxid'));
        view.down('hiddenfield[name=sterilizationtypeid]').setValue(record.get('sterilizationtypeid'));
    },

    showClearMaterial: function (field, eOpts) {
        var me = this,
            view = me.getView(),
            flow = view.down('searchsterilizationtype');

        flow.reset();
        flow.setReadColor(true);
        view.down('clientsearch').reset();
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
            placesearch = view.down('placesearch'),
            localization = view.down('fieldcontainer[name=localization]');

        localization.hide();
        localization.setDisabled(true);

        placesearch.reset();
        placesearch.setReadColor(clienttype != '004');

        placesearch.allowBlank = true;

        if(clienttype == '004') {
            localization.show();
            placesearch.allowBlank = false;
            localization.setDisabled(false);
        }

        placesearch.validate();
        view.down('hiddenfield[name=clienttype]').setValue(clienttype);

    },

    showClearClient: function (field, eOpts) {
        var me = this,
            view = me.getView(),
            placesearch = view.down('placesearch'),
            localization = view.down('fieldcontainer[name=localization]');

        placesearch.allowBlank = true;
        localization.setDisabled(true);
        placesearch.setReadColor(true);

        localization.hide();
        placesearch.reset();
        placesearch.validate();
    },

    onSelectPatient: function (combo,record,eOpts) {
        var me = this,
            view = me.getView();

        view.down('hiddenfield[name=healthinsurance]').setValue(record.get('health_insurance'));
    },

    insertFlow: function () {
        var me = this,
            view = me.getView(),
            form = view.down('form'),
            data = form.getValues();

        if(!form.isValid()) {
            return false;
        }

        var patient = form.down('searchpatient').foundRecord();

        data.patientname = patient.get('name');

        view.setLoading('Gerando estrutura de leitura de materiais...');

        Ext.Ajax.request({
            scope: me,
            url: me.url,
            params: {
                action: 'select',
                method: 'insertOpenFlowView',
                query: Ext.encode(data)
            },
            callback: function (options, success, response) {
                view.setLoading(false);

                var result = Ext.decode(response.responseText);

                if(!success || !result.success) {
                    return false;
                }

                view.close();

                if(parseInt(data.startflow) == 1) {
                    me.redirectTo( 'flowprocessingview/' + result.rows.id);
                }
            }
        });
    },

    /**
     * Controles para Processamento e Leitura
     */

    onAfterRenderView: function () {
        var me = this,
            view = me.getView(),
            search = view.down('textfield[name=search]');

        search = view.down('textfield[name=search]');

        search.focus();
    },

    onSelectDataView: function (view,record,eOpts) {
        var me = this,
            view = me.getView();

        Ext.getStore('flowprocessingstep').setParams({
            method: 'selectCode',
            query: record.get('id')
        }).load();
    },

    onDeSelectDataView: function (view,record,eOpts) {
        Ext.getStore('flowprocessingstep').removeAll();
    }

});