//@charset UTF-8
Ext.define( 'iSterilization.view.flowprocessing.FlowProcessingController', {
    extend: 'Smart.app.ViewControllerBase',

    alias: 'controller.flowprocessing',

    routes: {
        'flowprocessingview/:id': {
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
    getFlowProcessingId: function (id) {
        var me = this,
            app = Smart.app.getController('App');

        Ext.getStore('flowprocessingstep').setParams({
            method: 'selectStep',
            query: id
        }).load({
            scope: me,
            callback: function(records, operation, success) {

                if(!success || records.length == 0) {
                    return false;
                }

                app.onMainPageView({xtype: 'flowprocessingview', xdata: records[0]});
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

    onSelectAction : function () {
        var me = this,
            view = me.getView(),
            store = Ext.getStore('flowprocessingstepaction'),
            dataview = view.down('dataview[name=flowprocessingsteptask]');

        if(!Smart.workstation) {
            return false;
        }

        // if (dataview) {
        //     dataview.store.load();
        // }

        Ext.Ajax.request({
            scope: me,
            url: store.getUrl(),
            params: {
                action: 'select',
                method: 'selectArea',
                query: Smart.workstation.areasid
            },
            callback: function (options, success, response) {
                var result = Ext.decode(response.responseText);

                if(!success || !result.success) {
                    return false;
                }

                store.removeAll();

                if(result.rows) {
                    store.loadData(result.rows);
                }
            }
        });

        Ext.Ajax.request({
            scope: me,
            url: dataview.store.getUrl(),
            params: {
                action: 'select',
                method: 'actionTask'
            },
            callback: function (options, success, response) {
                var result = Ext.decode(response.responseText);

                if(!success || !result.success) {
                    return false;
                }

                dataview.store.removeAll();

                if(result.rows) {
                    dataview.store.loadData(result.rows);
                }
            }
        });

    },

    onAfterRenderStep: function () {
        var me = this,
            view = me.getView(),
            dataview = view.down('dataview[name=flowprocessingsteptask]');

        if(!Smart.workstation) {
            return false;
        }

        view.down('label[name=labelareas]').setText(Smart.workstation.areasname);

        Ext.Ajax.request({
            scope: me,
            url: me.url,
            params: {
                action: 'select',
                method: 'selectAreaStep',
                query: Smart.workstation.areasid
            },
            callback: function (options, success, response) {
                var result = Ext.decode(response.responseText);

                if(!success || !result.success) {
                    return false;
                }

            }
        });

        Ext.getStore('flowprocessingstepaction').setParams({
            method: 'selectArea',
            query: Smart.workstation.areasid
        }).load();
    },

    onQueryReaderView: function (field, e, eOpts) {
        var me = this,
            value = field.getValue();

        field.reset();

        if(value && value.length != 0) {
            if(value.indexOf('SATOR') != -1) {
                me.areaProtocol(value);
                return false;
            }
        }
    },

    areaProtocol: function (value) {
        var me = this;

        switch(value) {
            case 'SATOR_PROCESSAR_ITENS':
                me.callSATOR_PROCESSAR_ITENS();
                break;
            case 'SATOR_VALIDA_CARGA':
                me.callSATOR_VALIDA_CARGA();
                break;
            case 'SATOR_RELATAR_CYCLE_START':
                me.callSATOR_RELATAR_CYCLE_START('START');
                break;
            case 'SATOR_RELATAR_CYCLE_FINAL':
                me.callSATOR_RELATAR_CYCLE_FINAL();
                break;
            default:
                Smart.Msg.showToast('Protocolo Inválido para esta área');
        }
    },
    // Abrir Novo Processamento/Leitura
    callSATOR_PROCESSAR_ITENS: function () {
        var me = this,
            doCallBack = function (rows) {
                Ext.widget('flowprocessingopen').show(null,function () {
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

    callSATOR_VALIDA_CARGA: function () {
        var me = this,
            view = me.getView();

        Ext.widget('call_SATOR_VALIDA_CARGA').show(null,function () {
            this.master = view;
        });
    },

    callSATOR_RELATAR_CYCLE_START: function (status) {
        var me = this,
            view = me.getView();

        console.info(view.xdata.data);

        // Ext.widget('call_SATOR_RELATAR_CYCLE_STATUS').show(null,function () {
        //     this.master = view;
        //     this.down('textfield[name=cyclestatus]').focus(false,200);
        //     this.down('hiddenfield[name=cyclestatus]').setValue(status);
        //     switch(status) {
        //         case 'START':
        //             this.down('textfield[name=cyclestatus]').setFieldLabel('Registrar Inicio de Ciclo de Equipamento');
        //             break;
        //         case 'FINAL':
        //             this.down('textfield[name=cyclestatus]').setFieldLabel('Registrar Final de Ciclo de Equipamento');
        //             break;
        //     }
        // });
    },

    callSATOR_RELATAR_CYCLE_FINAL: function () {
        Smart.Msg.showToast('SATOR_RELATAR_CYCLE_FINAL');
    },

    // callSATOR_RELATAR_CYCLE_STATUS: function (status) {
    //     var me = this,
    //         view = me.getView();
    //
    //     Ext.widget('call_SATOR_RELATAR_CYCLE_STATUS').show(null,function () {
    //         this.master = view;
    //         this.down('textfield[name=cyclestatus]').focus(false,200);
    //         this.down('hiddenfield[name=cyclestatus]').setValue(status);
    //         switch(status) {
    //             case 'START':
    //                 this.down('textfield[name=cyclestatus]').setFieldLabel('Registrar Inicio de Ciclo de Equipamento');
    //                 break;
    //             case 'FINAL':
    //                 this.down('textfield[name=cyclestatus]').setFieldLabel('Registrar Final de Ciclo de Equipamento');
    //                 break;
    //         }
    //     });
    // },

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

        // view.keyMap = new Ext.util.KeyMap({
        //     target: view.getEl(),
        //     binding: [
        //         {
        //             key: [
        //                 Ext.event.Event.HOME,
        //                 Ext.event.Event.PAGE_UP
        //             ],
        //             fn: function(){
        //                 me.flowProcessingRead();
        //             }
        //         }
        //     ],
        //     scope: me
        // });
    },

    onAfterRenderView: function () {
        var me = this,
            list = '',
            view = me.getView(),
            data = view.xdata,
            text = 'Material ({0})',
            colorschema = data.get('colorschema').split(","),
            schema = "<div style='width: 20px; background: {0}; height: 26px; float: right; border: 1px solid #111214; margin-left: 5px;'></div>";

        Ext.getStore('flowprocessingstepinputtree').setParams({
            flowprocessingid: data.get('flowprocessingid'),
            method: 'selectTree'
        }).load();

        Ext.getStore('flowprocessingstepmaterial').setParams({
            method: 'selectCode',
            query: data.get('id')
        }).load();

        Ext.getStore('flowprocessingstepmessage').setParams({
            method: 'selectCode',
            query: data.get('id')
        }).load();

        if(colorschema) {
            Ext.each(colorschema,function(item) {
                list += Ext.String.format(schema,item);
            });
        }

        view.down('hiddenfield[name=id]').setValue(data.get('id'));
        view.down('hiddenfield[name=materialboxid]').setValue(data.get('materialboxid'));

        view.down('textfield[name=search]').focus(false,200);
        view.down('container[name=colorschema]').update(list);
        view.down('textfield[name=username]').setValue(data.get('username'));
        view.down('textfield[name=areasname]').setValue(data.get('areasname'));
        view.down('textfield[name=clientname]').setValue(data.get('clientname'));
        view.down('textfield[name=originplace]').setValue(data.get('originplace'));
        view.down('textfield[name=sterilizationtypename]').setValue(data.get('sterilizationtypeversion'));
        view.down('textfield[name=priorityleveldescription]').setValue(data.get('priorityleveldescription'));
        view.down('label[name=materialboxname]').setText(Ext.String.format(text,data.get('materialboxname')));
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

    selectUserFlow: function (btn) {
        var me = this,
            view = btn.up('window'),
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
        view.down('textfield[name=password]').focus(false,200);
    },

    selectDatePicker: function (datePicker, date, eOpts) {
        var me = this,
            view = me.getView(),
            labelperiod = view.down('label[name=labelperiod]');

        labelperiod.setText(me.getDateFormated(date));

        Ext.getStore('flowprocessing').setParams({
            method: 'selectDashFlow',
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

        view.down('hiddenfield[name=version]').setValue(record.get('version'));
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

    nextFieldMaterial: function (field,eOpts) {
        var me = this,
            view = me.getView(),
            type = view.down('searchsterilizationtype');

        type.focus(false,200);
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
            date = new Date(),
            view = me.getView(),
            form = view.down('form'),
            data = form.getValues();

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
                view.setLoading(false);
                var result = Ext.decode(response.responseText);

                if(!success || !result.success) {
                    Smart.Msg.showToast(result.text,'error');
                    return false;
                }

                view.close();

                Ext.getStore('flowprocessingstepaction').setParams({
                    method: 'selectArea',
                    query: Smart.workstation.areasid
                }).load();
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

        field.reset();

        /**
         * 017 - Registrar Final de Ciclo de Equipamento
         */
        // if(stepflaglist.indexOf('017') != -1) {
        //     if(record.get('cyclefinal') == null) {
        //         me.callSATOR_RELATAR_CYCLE_STATUS('FINAL');
        //         return false;
        //     }
        // }

        if(value && value.length != 0) {
            // Sim é protocolo .. seguir workProtocol
            if(value.indexOf('SATOR') != -1) {
                me.workProtocol(value);
				return false;
            }

			// Não é protocolo .. seguir workReadArea
			me.workReadArea(value);
        }
    },


    //SATOR_VALIDA_CARGA
    onBeforeQueryEquipment: function (queryPlan, eOpts) {
        var combo = queryPlan.combo;

        delete combo.lastQuery;
        combo.store.removeAll();
        queryPlan.query = Smart.workstation.areasid;
    },

    onShowClearEquipment: function (field,eOpts) {
        var me = this,
            view = me.getView();

        view.down('searchcycle').reset();
        view.down('searchcycle').store.removeAll();
        view.down('searchcycle').setReadColor(true);
        view.down('gridpanel').getStore().removeAll();
    },

    onSelectEquipment: function (combo,record,eOpts) {
        var me = this,
            view = me.getView();

        me.onShowClearEquipment();
        view.down('searchcycle').setReadColor(false);
    },

    onBeforeQueryCycle: function (queryPlan, eOpts) {
        var me = this,
            view = me.getView(),
            combo = queryPlan.combo,
            equipmentid = view.down('hiddenfield[name=equipmentid]');

        delete combo.lastQuery;
        combo.store.removeAll();
        queryPlan.query = equipmentid.getValue();
    },

    onSelectCycle: function (combo,record,eOpts) {
        var me = this,
            view = me.getView();

        view.down('gridpanel').getStore().removeAll();
        // view.down('gridpanel').getStore().load();
    },

    onShowClearCycle: function (field,eOpts) {
        var me = this,
            view = me.getView();

        view.down('gridpanel').getStore().removeAll();
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
                    md = sm.getSelection()[0];

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
                        callback: function() {
                            view.close();
                            me.setView(master);
                            history.back();
                        }
                    });

                    return false;
                }
                return false;
            }

            me.setMessageText('MSG_PROTOCOL_ERROR');
        }
    },

	workProtocol: function (value) {
	    var me = this;

        switch(value) {
            case 'SATOR_PROCESSAR_ITENS':
                me.callSATOR_PROCESSAR_ITENS();
                break;
            case 'SATOR_RELATAR_USA_EPI':
                me.callSATOR_RELATAR_USA_EPI();
                break;
            case 'SATOR_INICIAR_LEITURA':
                me.callSATOR_INICIAR_LEITURA();
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

	callSATOR_RELATAR_USA_EPI: function () {
        var me = this,
            view = me.getView();
        Ext.widget('call_SATOR_RELATAR_USA_EPI').show(null,function () {
            this.master = view;
            this.down('textfield[name=userprotected]').focus(false,200);
        });
    },

    relatarUsaEPI: function () {
        var me = this,
            view = me.getView(),
            master = view.master,
            useppe = ['SATOR_SIM','SATOR_NAO'],
            store = Ext.getStore('flowprocessingstep'),
            model = store.getAt(0),
            value = view.down('textfield[name=userprotected]').getValue();

        if(!value || value.length == 0 || useppe.indexOf(value) == -1) {
            return false;
        }

        view.close();
        me.setView(master);
        model.set('useppe',(value.indexOf('SATOR_SIM') != -1 ? 1 : 0));
        store.sync({async: false});
        model.commit();
        me.setMessageText('MSG_PROTOCOL','SATOR_RELATAR_USA_EPI');
    },

    callSATOR_INICIAR_LEITURA: function () {
        var me = this;
        me.setMessageText('MSG_PROTOCOL','SATOR_INICIAR_LEITURA');
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
    callSATOR_ENCERRAR_LEITURA: function () {
        var me = this,
            view = me.getView(),
            record = view.xdata,
            exceptionby = record.get('exceptionby'),
            stepflaglist = record.get('stepflaglist');

        /**
         * Fazer checagens de encerramento
         */

        /**
         * 011 - Exige uso de EPI na Leitura de Entrada
         */
        if(stepflaglist.indexOf('011') != -1) {
            if(record.get('useppe') == null) {
                me.callSATOR_RELATAR_USA_EPI();
                return false;
            }
        }

        /**
         * 016 - Registrar Inicio de Ciclo de Equipamento
         */
        // if(stepflaglist.indexOf('016') != -1) {
        //     if(record.get('cyclestart') == null) {
        //         me.callSATOR_RELATAR_CYCLE_STATUS('START');
        //         return false;
        //     }
        // }

        if (me.checkUnconformities()) {
            me.callSATOR_UNCONFORMITIES();
            return false;
        }

        /**
         * 004 - Libera Kit Incompleto
         */
        // if (stepflaglist.indexOf('004') != -1) {
        //     //return false;
        // }

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
                console.info(response);
                if (success) {
                    history.back();
                }
            }
        });
    },

    callSATOR_UNCONFORMITIES: function () {
        var me = this,
            view = me.getView();

        Ext.widget('call_SATOR_UNCONFORMITIES').show(null, function () {
            var list = [],
                grid = this.down('flowprocessingmaterial'),
                sm = grid.getSelectionModel();

            grid.store.each(function(data) {
                if(data.get('unconformities') == '001') {
                    list.push(data);
                }
            });

            if(list.length != 0) {
                var item = list[0];
                sm.select(item);
                grid.plugins[0].startEditByPosition({row: grid.store.indexOf(item), column: 1});
            }

            this.master = view;
        });
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
                    // SATOR_ENCERRAR_LEITURA
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
            elementname = view.down('combobox[name=elementname]'),
            record = view.down('gridpanel').getSelectionModel().getSelection()[0];

        elementname.reset();
        elementname.setReadColor(true);
        elementname.getStore().removeAll();

        radiogroup.reset();
        radiogroup.setValue({
            flowexception: parseInt(record.get('flowexception'))
        });
    },
    // SATOR_ENCERRAR_LEITURA
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
                            elementname: item.elementname
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
                            elementname: item.elementname
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
            elementname: record.get('elementname')
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
                    elementcode: item.elementcode
                })
            }
        });

        // SATOR_ENCERRAR_LEITURA SATOR_PROCESSAR_ITENS
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
                if(success) {
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

    checkUnconformities: function () {
        var me = this,
            count = 0,
            store = Ext.getStore('flowprocessingstepmaterial');

        store.each(function (item) {
            count += item.get('unconformities') == '001' ? 1 : 0;
        });

        return (count != 0);
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
                success: function(response, opts) {
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
        
    callSATOR_IMPRIMIR_ETIQUETA: function () {
        var me = this;
        console.info(me);
    },

    callSATOR_CANCELAR_LEITURAS: function () {
        var me = this,
            data = [],
            store = Ext.getStore('flowprocessingstepmaterial');

        store.each(function (item) {
            if(item.get('unconformities') != '001'){
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
        console.info(this);
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
            materialboxid = view.down('hiddenfield[name=materialboxid]').getValue(),
			isMaterialBox = ( materialboxid && materialboxid.length != 0 );

		/**
          * - Verificar é Kit ?
          *      Não é Kit,
          *          Já foi lançado ?
          *              Sim -> Mensagem de duplicidade
          *              Não -> Pesquisa e Insert (Depende do Status do Material)
          */
		if(!isMaterialBox) {
            me.setIsntMaterialBox();
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

		// Não foi encontrado no Kit ?
		if(!data) {
			me.setMessageText('MSG_UNKNOWN');
			return false;
		}

		// Já foi lançado ?
		// Sim -> Mensagem de duplicidade
		if(data.get('unconformities') != '001') {
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
            me.setMessageText('MSG_PROTOCOL','Leitura única realizada!');
            return false;
        }

        // Já foi lançado ?
        // Não -> Update Status do Item na Lista
        data.set('unconformities','010');
        store.sync({
            callback: function () {
                data.commit();
                model.select(data);
            }
        });
    },

    setIsntMaterialBox: function (value) {
        var me = this,
            view = me.getView(),
            store = Ext.getStore('flowprocessingstepmaterial'),
            model = view.down('flowprocessingmaterial').getSelectionModel();

        var data = store.findRecord('barcode',value);

        // Já foi lançado ?
        // Sim -> Mensagem de duplicidade
        if(data) {
            me.setMessageText('MSG_DUPLICATED');
            model.select(data);
            return false;
        }

        // Já foi lançado ?
        // Não -> Pesquisa e Insert (Depende do Status do Material)
        Ext.Ajax.request({
            scope: me,
            url: store.getUrl(),
            params: {
                action: 'select',
                method: 'insertItem',
                barcode: value,
                flowprocessingstepid: view.xdata.get('flowprocessingstepid')
            },
            callback: function (options, success, response) {
                var result = Ext.decode(response.responseText);

                if(!success || !result.success) {
                    me.setMessageText('MSG_UNKNOWN');
                    return false;
                }

                store.load();
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
            score = '{0}/{1}';

        store.each(function (item) {
            count += item.get('unconformities') == '010' ? 1 : 0;
        });

        me.getView().down('label[name=materialaccount]').setText(Ext.String.format(score,count,store.getCount()));
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
    },

    onFlowStepDeSelect: function () {
        var me = this,
            view = me.getView(),
            store = Ext.getStore('flowprocessing'),
            propertygrid = view.down('propertygrid');

        store.removeAll();
        propertygrid.setSource({});
    },

    onFlowStepAction: function ( viewView, record, item, index, e, eOpts ) {
        var me = this,
            userid = record.get('username'),
            action = record.get('flowstepaction'),
            stepid = record.get('flowprocessingstepid'),
            stepflaglist = record.get('stepflaglist'),
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
                        me.redirectTo( 'flowprocessingview/' + stepid );
                    }
                });

                return true;
            };

        if(!Smart.workstation) {
            Smart.Msg.showToast('Estação de Trabalho Não Configurada, Operação Não pode ser Realizada!','error');
            return false;
        }

        switch(action) {
            case '001':

                    if(stepflaglist.indexOf("016") != -1) {
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
                        me.redirectTo( 'flowprocessingview/' + stepid);
                    }
                break;
            case '002':
                Smart.Msg.showToast('Este processo requer autorização antes de prosseguir!');
                return false;
                break;
        }
    },

    onBeforeEditMaterialFlowStepAction: function ( editor, context, eOpts ) {
        var list = ['010'],
            grid = context.grid,
            data = context.record,
            unconformities = data.get('unconformities');

        grid.getSelectionModel().select(data);

        return (context.grid.editable) && (list.indexOf(unconformities) == -1);
    },

    onSelectMaterialFlowStepAction: function ( rowModel, record, index, eOpts) {
        var me = this,
            view = me.getView(),
            portrait = view.down('portrait');

        if(portrait) {
            portrait.beFileData(record.get('filetype'));
            portrait.update(Ext.String.format('<div class="portrait-label">{0}</div>',record.get('materialname')));
        }
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
                    item.set('isactive', 'AUTHORIZE');
                    item.set('authorizedby', rows.username);
                    kont += item.store.sync({async: false}) ? 1 : 0;
                });
                if(kont == list.length) {
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

        if(list.length == 0) {
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
    }

});