//@charset UTF-8
Ext.define( 'iAdmin.view.sterilizationtype.SterilizationTypeController', {
    extend: 'Smart.app.ViewControllerBase',

    alias: 'controller.sterilizationtype',

    url: '../iAdmin/business/Calls/sterilizationtype.php',

    routes: {
        'sterilizationtypeview/:id': {
            action: 'getSterilizationTypeId'
        },
        'sterilizationtypeview': {
            action: 'getSterilizationTypeNew'
        }
    },

    requires: [
        'Ext.LoadMask',
        'Smart.util.Resource'
    ],

    fetchField: function (search, button) {
        Ext.getStore('sterilizationtype').setParams({
            query: search.getValue()
        }).load();
    },

    getSterilizationTypeId: function (id) {
        var app = Smart.app.getController('App'),
            record = Ext.getStore('sterilizationtype').findRecord('id',id);

        app.onMainPageView({xtype: 'sterilizationtypeview', xdata: record});
    },

    getSterilizationTypeNew: function() {
        var app = Smart.app.getController('App');

        app.onMainPageView({xtype: 'sterilizationtypeview', xdata: null});
    },

    //routes ========================>

    insertLayout: function (view, rowIndex, colIndex, item, e, record, row) {
        var me = this,
            view = me.getView();

        Ext.widget('sterilizationtypeinputsearch').show(null,function() {
            this.data = view.xdata;
        });
    },

    deleteLayout: function(grid, rowIndex, colIndex) {
        var me = this,
            store = grid.getStore(),
            record = store.getAt(rowIndex);

        Ext.Msg.confirm('Excluir registro', 'Confirma a exclusão do registro selecionado?',
            function (choice) {
                if (choice === 'yes') {
                    store.remove(record);
                    store.sync({
                        callback: function () {
                            store.load();
                        }
                    });
                }
            }
        );
    },

    selectInput: function (combo,record,eOpts) {
        var me = this,
            view = me.getView();

        view.down('hiddenfield[name=acronym]').setValue(record.get('acronym'));
        view.down('hiddenfield[name=presentation]').setValue(record.get('presentation'));
    },

    updateInput: function () {
        var me = this,
            view = me.getView();

        view.down('hiddenfield[name=id]').setValue('');
        view.down('hiddenfield[name=sterilizationtypeid]').setValue(view.data.get('id'));

        me.setModuleForm(view.down('form'));
        me.setModuleData('sterilizationtypeinput');

        me._success = function (form, action) {
            Ext.getStore('sterilizationtypeinput').setParams({
                method: 'selectCode',
                query: view.data.get('id')
            }).load({
                callback: function () {
                    view.close();
                }
            });
        }

        me.updateModule();
    },

    onAfterRenderView: function (view) {
        var xdata = view.xdata;

        if(!xdata) return false;

        view.loadRecord(xdata);
    },

    onViewEdit: function(grid, rowIndex, colIndex) {
        var me = this,
            record = grid.getStore().getAt(rowIndex);

        Ext.getStore('sterilizationtype').setParams({
            method: 'selectCode',
            query: record.get('id'),
            rows: Ext.encode({ id: record.get('id') })
        }).load({
            scope: me,
            callback: function(records, operation, success) {
                var record = records[0];
                me.redirectTo( 'sterilizationtypeview/' + record.get('id'));
            }
        });
    },

    insertViewNew: function () {
        Ext.widget('sterilizationtypeedit').show(null,function () {
            this.down('form').reset();
            this.setTitle('Novo Fluxo');
        });
    },

    insertView: function () {
        var me = this,
            view = me.getView(),
            list = me.router.graph.getElements(),
            data = ['uml.StartState','uml.EndState'];

        view.reset();

        Ext.each(list,function(cell) {
            if(data.indexOf(cell.get('type')) == -1) {
                cell.remove();
            }
        });
    },

    onAfterLayout: function () {
        var me = this,
            view = me.getView(),
            data = view.xdata,
            flow = view.down('form[name=sterilizationtypeflow]'),
            span = Ext.getBody().getById('paper-container-span'),
            core = Ext.create('Smart.util.CoreFlow', { url: me.url, scope: me });

        me.router = new core.router();
        me.router.setScope(flow);
        me.router.initializeEditor(flow.getWidth()-350,flow.getHeight(),core.stencil,flow);
        me.router.graph.rules = me.getCoreFlowRule();

        if(view.xdata) {
            var g = view.xdata.get('graphpaper'),
                d = view.xdata.get('dataflowrule');

            me.router.graph.rules = d ? Ext.decode(d) : me.router.graph.rules;
            span.update(Ext.String.format('{0} v.{1}',data.get('name'),data.get('version')));

            if(g) {
                me.router.graph.fromJSON(Ext.decode(g));
            }
        }

        if(me.router.paper.authenticate()) {
            span.addCls('isactive-on');
            span.removeCls('isactive-of');
        } else {
            span.addCls('isactive-of');
            span.removeCls('isactive-on');
        }

    },

    getCoreFlowRule: function () {
        var me = this,
            rules = {};

        Ext.Ajax.request({
            scope: me,
            async: false,
            url: 'resources/CoreFlowRule.json',
            callback: function (options, success, response) {
                if(success) {
                    rules = Ext.decode(response.responseText);
                }
            }
        });

        return rules;
    },

    onGraphChanged: function (graph, scope) {
        var me = this,
            cells = graph.getElements(),
            basic = ['basic.Area','basic.SubArea','basic.Equipment'],
            containerSpan = Ext.getBody().getById('paper-container-span');

        Ext.each(cells,function(cell){
            if(basic.indexOf(cell.get('type')) != -1) {
                cell.isValid(graph);
            }
        });

        if(this.router.paper.authenticate()) {
            containerSpan.addCls('isactive-on');
            containerSpan.removeCls('isactive-of');
        } else {
            containerSpan.addCls('isactive-of');
            containerSpan.removeCls('isactive-on');
        }
    },

    onAnnotateShow: function (router, cellView, evt, x, y, scope) {
        var me = this,
            view = me.getView(),
            attrs = cellView.model.get('attrs'),
            flow = view.down('form[name=sterilizationtypeflow]'),
            win = Ext.widget('coreflownoteview', {cellView: cellView});

        me.router.setScope(flow);

        win.show(null,function () {
            this.down('textareafield[name=content]').setValue(cellView.model.get('content'));
        });
    },

    onLinkDblClick: function (router, cellView, evt, x, y, scope) {
        var me = this,
            view = me.getView(),
            attrs = cellView.model.get('attrs'),
            label = cellView.model.get('labels'),
            targetId = cellView.model.attributes.target,
            target = cellView.paper.model.getCell(targetId),
            flow = view.down('form[name=sterilizationtypeflow]'),
            win = Ext.widget('coreflowlinkview', { cellView: cellView });

        me.router.setScope(flow);

        win.show(null,function () {
            // if(target.get('type') != 'basic.Equipment') {
            //     this.down('numberfield[name=steppriority]').hide();
            // }
            this.down('textfield[name=label]').setValue(label ? label[0].attrs.text.text : '');
            this.down('checkboxfield[name=dashedline]').setValue(attrs['.connection']['stroke-dasharray'] == "5 2");
            this.down('numberfield[name=steppriority]').setValue(label && (label.length > 1) ? label[1].attrs.text.text : '');
        });
    },

    updateNote: function () {
        var me = this,
            view = me.getView(),
            form = view.down('form'),
            values = form.getValues();

        view.cellView.model.set('content',values.content);

        view.close();
    },

    updateLink: function () {
        var me = this,
            view = me.getView(),
            form = view.down('form'),
            values = form.getValues();

        view.cellView.model.attr('.connection/stroke-dasharray', values.dashedline ? '5 2' : '');
        view.cellView.model.set('labels', [
            {
                position: 0.5,
                attrs: {
                    rect: { stroke: '#7C68FC', fill: '#7C68FC', 'stroke-width': 10, rx: 5, ry: 5 },
                    text: { text: values.label, fill: '#FFFFFF', style: 'text-shadow: 0 1px 1px #111111;' }
                }
            }, {
                position: -25,
                attrs: {
                    rect: { stroke: '#8A9B0F', fill: '#8A9B0F', 'stroke-width': 10, rx: 5, ry: 5 },
                    text: { text: values.steppriority, fill: '#FFFFFF', style: 'text-shadow: 0 1px 1px #111111;' }
                }
            }
        ]);

        var target = view.cellView.paper.model.getCell(view.cellView.model.prop('target/id'));

        // if(target.get('type') == 'basic.Equipment') {
        target.set('steppriority',values.steppriority);
        // }

        view.close();
    },

    onBeforeQueryService: function ( queryPlan, eOpts ) {
        var me = this,
            view = me.getView(),
            combo = queryPlan.combo,
            equipmentid = view.down('hiddenfield[name=id]');

        delete combo.lastQuery;
        combo.store.removeAll();
        queryPlan.query = equipmentid.getValue();
    },



    onTargetChange: function (graph, link, scope) {
        var me = this,
            data = [],
            stepflaglist = '',
            view = me.getView(),
            target = graph.getCell(link.prop('target/id')),
            source = graph.getCell(link.prop('source/id')),
            targetType = target.get('type'),
            sourceType = source.get('type'),
            flow = view.down('form[name=sterilizationtypeflow]'),
            breakflow = ((targetType == 'basic.Equipment')&&(sourceType == 'uml.BreakFlow'));

        me.router.setScope(flow);

        if(targetType == 'basic.Equipment') {
            stepflaglist = target.get('stepflaglist');
            breakflow = stepflaglist ? (stepflaglist.indexOf('006') != -1) : null;
        }

        // me.connection(link,breakflow);

        if(breakflow) {
            stepflaglist = stepflaglist.replace('006', '000');
            data = Ext.decode(stepflaglist);
            data.push('006');
            var index = data.indexOf('000');
            if (index > -1) { data.splice(index, 1); }
            stepflaglist = Ext.encode(data);
            target.set('stepflaglist',stepflaglist);
        }

    },

    onDropCellView: function (graph, cell, scope) {
        var me = this,
            view = me.getView(),
            flow = view.down('form[name=sterilizationtypeflow]');

        me.router.setScope(flow);
    },

    onStepDblClick: function (router, cellView, evt, x, y, scope) {
        var me = this,
            view = me.getView(),
            stepflaglist = cellView.model.get('stepflaglist'),
            stepsettings = cellView.model.get('stepsettings'),
            flow = view.down('form[name=sterilizationtypeflow]'),
            win = Ext.widget('coreflowcellview', {
                cellView: cellView,
                outerScope: me
            });

        me.router.setScope(flow);

        win.show(null,function () {
            var filtertype = '';

            switch(cellView.model.get('type')) {
                case "basic.Area":
                    filtertype = "A";
                    break;
                case "basic.SubArea":
                    filtertype = "S";
                    break;
                case "basic.Equipment":
                    filtertype = "E";
                    break;
                default:
                    filtertype = "AS";
            }

            Ext.getStore('sterilizationtypeflag').load({
                params: {
                    filtertype: filtertype
                },
                callback: function(records, operation, success) {

                    if(!stepflaglist) {
                        return false;
                    }

                    Ext.each(Ext.decode(stepflaglist),function (item) {
                        var model = Ext.getStore('sterilizationtypeflag').findRecord('code',item);
                        if(model) {
                            model.set('isactive',true);
                            model.commit();
                        }
                    });
                }
            });

            win.down('textfield[name=name]').setValue(cellView.model.get('name'));
            win.down('hiddenfield[name=id]').setValue(cellView.model.get('typeid'));
            win.down('hiddenfield[name=type]').setValue(cellView.model.get('type'));
            win.down('textfield[name=steplevel]').setValue(cellView.model.get('steplevel'));
            win.down('textareafield[name=description]').setValue(cellView.model.get('description'));

            win.down('inputpresentationsearch[name=inputpresentation]').setDisabled(filtertype != 'E');
            win.down('servicetypesearch[name=serviceequipment]').setDisabled(filtertype != 'E');
            win.down('servicetypesearch[name=serviceareas]').setDisabled(filtertype != 'E');
            win.down('comboenum[name=tagprinterdescription]').setDisabled(filtertype != 'S');

            if(stepsettings) {
                var settings = Ext.decode(stepsettings);
                win.down('servicetypesearch[name=serviceequipment]').setRawValue(settings.serviceequipment);
                win.down('inputpresentationsearch[name=inputpresentation]').setRawValue(settings.inputpresentation);
                win.down('servicetypesearch[name=serviceareas]').setRawValue(settings.serviceareas);
                win.down('comboenum[name=tagprinterdescription]').setRawValue(settings.tagprinterdescription);

                win.down('hiddenfield[name=inputpresentationid]').setValue(settings.inputpresentationid);
                win.down('hiddenfield[name=serviceequipmentid]').setValue(settings.serviceequipmentid);
                win.down('hiddenfield[name=serviceareasid]').setValue(settings.serviceareasid);
                win.down('hiddenfield[name=tagprinter]').setValue(settings.tagprinter);
            }

        },me);
    },

    updateCell: function () {
        var me = this,
            data = [],
            list = {},
            view = me.getView(),
            graph = view.cellView.paper.model,
            settings = view.down('form[name=settings]'),
            store = Ext.getStore('sterilizationtypeflag'),
            links = graph.getConnectedLinks(view.cellView.model, { inbound: true });

        store.each(function(rec) {
            if(rec.get('isactive')) data.push(rec.get('code'));
        });

        list = {
            serviceequipment: view.down('servicetypesearch[name=serviceequipment]').getRawValue(),
            inputpresentation: view.down('inputpresentationsearch[name=inputpresentation]').getRawValue(),
            serviceareas: view.down('servicetypesearch[name=serviceareas]').getRawValue(),
            tagprinterdescription: view.down('comboenum[name=tagprinterdescription]').getRawValue(),

            inputpresentationid: view.down('hiddenfield[name=inputpresentationid]').getValue(),
            serviceequipmentid:  view.down('hiddenfield[name=serviceequipmentid]').getValue(),
            serviceareasid:  view.down('hiddenfield[name=serviceareasid]').getValue(),
            tagprinter:  view.down('hiddenfield[name=tagprinter]').getValue()
        };

        view.cellView.model.set('stepflaglist',Ext.encode(data));
        view.cellView.model.set('stepsettings',Ext.encode(list));

        // me.connection(links);

        if(view.cellView.model.get('stepflaglist').indexOf("006") != -1 ) {
            // me.connection(links,true);
        }

        view.outerScope.updateFlow();

        view.close();

    },

    updateFlowRules: function () {
        var me = this,
            view = me.getView(),
            win = Ext.widget('coreflowcellrule', {
                xdata: view.xdata,
                graph: me.router.graph
            });

        win.show();
    },

    deleteCellFlags: function () {
        var me = this,
            cells = me.router.graph.getElements();

        Ext.Msg.confirm('Excluir Regras', 'Confirma a exclusão das regras dos elementos?',
            function (choice) {
                if (choice === 'yes') {
                    Ext.each(cells, function(cell) {
                        // cell.set("stepsettings",'');
                        cell.set('masterid', false);
                        cell.set('exceptionof', '');
                        cell.set('isactive', false);
                        cell.set('typelesscode','');
                        cell.set('typelessname','');
                        cell.set("steppriority",'');
                        cell.set('flowchoice',false);
                        cell.set('flowbreach',false);
                        cell.set("exceptionby",false);
                        cell.set("exceptiondo",false);
                    });
                    me.updateFlow();
                }
            }
        );

    },

    onSelectBasicStep: function () {
        var me = this,
            data = [],
            view = me.getView(),
            form = view.down('form'),
            value = form.getValues(),
            rules = view.graph.rules[value.basicstep],
            overs = [
                "uml.StartState",
                "uml.EndState",
                "basic.Equipment"
            ],
            basic = {
                "multiLinks": "Multiplos links",
                "uml.StartState": "Iniciar fluxo",
                "basic.Area": "CMEArea",
                "basic.SubArea": "CMESubArea",
                "basic.Equipment": "Equipamento",
                "uml.BreakFlow": "Quebra de fluxo",
                "uml.EndState": "Finalizar fluxo"
            };

        if(value.basicstep.length == 0) {
            return false;
        }

        for (var key in basic) {
            if((value.basicrule == 'source')&&(key == "uml.StartState")) {
                continue;
            }
            if((value.basicrule == 'target')&&(overs.indexOf(key) != -1)&&(value.basicstep == "basic.Equipment")) {
                continue;
            }

            if (basic.hasOwnProperty(key)) {
                data.push({
                    "basicstep": key,
                    "basicstepdescription": basic[key],
                    "basicsteplinks": rules[value.basicrule][key] || 0
                });
            }
        }

        view.down('gridpanel').getStore().loadData(data);
    },

    onRulesEdit: function (editor, context, eOpts) {
        var me = this,
            view = me.getView(),
            record = context.record,
            form = view.down('form'),
            value = form.getValues(),
            basicstep = record.get('basicstep');

        if( (basicstep == 'multiLinks') && ([0,1].indexOf(context.value) == -1) ) {
            context.value = 1;
            context.record.set('basicsteplinks',1);
        }

        view.graph.rules[value.basicstep][value.basicrule][basicstep] = record.get('basicsteplinks');

        me.onUpdateBasicStep(record);
    },

    standardRule: function () {
        var me = this,
            view = me.getView(),
            form = view.down('form'),
            value = form.getValues(),
            rules = me.getCoreFlowRule();

        if(value.basicstep.length == 0) {
            return false;
        }

        view.graph.rules[value.basicstep] = rules[value.basicstep];
        me.onSelectBasicStep();
        me.onUpdateBasicStep();
    },

    onUpdateBasicStep: function (record) {
        var me = this,
            view = me.getView();

        Ext.Ajax.request({
            url: me.url,
            params: {
                action: 'update',
                rows: Ext.encode({ id: view.xdata.get('id'), dataflowrule: Ext.encode(view.graph.rules) })
            },
            success: function(response){
                var result = Ext.decode(response.responseText);
                if(!record) return false;
                if(result.success == true) {
                    record.commit();
                } else {
                    record.reject();
                }
            },
            failure: function(response){
                if(record) record.reject();
            }
        });
    },

    /**
     * ToolBar Actions
     *
     */
    elementToBack: function () {
        var me = this;
        Ext.each(me.router.selection.models,function (model) {
            model.toBack();
        });
    },

    elementToFront: function () {
        var me = this;
        Ext.each(me.router.selection.models,function (model) {
            model.toFront();
        });
    },

    updateView: function () {
        var me = this,
            view = me.getView().down('form'),
            areaid = view.down('hiddenfield[name=areaid]'),
            span = Ext.getBody().getById('paper-container-span');

        me.setModuleForm(view);
        me.setModuleData('sterilizationtype');

        me._success = function (form, action) {
            span.update(view.down('textfield[name=name]').getValue());
            me.getView().outerScope.updateFlow();
            me.getView().close();
            if(action.result.crud == 'insert') {
                Ext.getStore('sterilizationtype').setParams({
                    method: 'selectCode',
                    rows: Ext.encode({ id: action.result.rows.id })
                }).load({
                    scope: me,
                    callback: function(records, operation, success) {
                        var record = records[0];
                        me.redirectTo( 'sterilizationtypeview/' + record.get('id'));
                    }
                });
            }
        }

        me.updateModule();
    },

    selectFlow: function (item) {
        var me = this,
            basic = {},
            graph = me.router.graph,
            areas = ['basic.Area','basic.SubArea'],
            sourceLinks = graph.getConnectedLinks(item, { inbound : true }),
            targetLinks = graph.getConnectedLinks(item, { outbound : true });

        if(targetLinks.length != 0) {
            var target = graph.getCell(targetLinks[0].prop('target/id'));
        }

        if(sourceLinks.length != 0) {
            var source = graph.getCell(sourceLinks[0].prop('source/id'));
        }

        basic = {
            "exceptionby": item.get('exceptionby'),
            "exceptiondo": item.get('exceptiondo'),
            "flowchoice": item.get('flowchoice'),
            "flowbreach": item.get('flowbreach'),
            "steplevel": item.get('steplevel'),
            "elementtype": item.get('type'),
            "elementname": item.get('name'),
            "barcode": item.get('barcode'),
            "stepflaglist": item.get('stepflaglist'),
            "stepsettings": item.get('stepsettings'),
            "steppriority": item.get('steppriority') || 0,
            "source": (source) ? source.get('steplevel'): null,
            "target": (target) ? target.get('steplevel'): null,
            "areasid": ( areas.indexOf(item.get('type')) != -1 ) ? item.get('typeid') : null,
            "equipmentid": ( item.get('type') == 'basic.Equipment' ) ? item.get('typeid') : null
        };

        return basic;
    },

    updateFlow: function () {
        var me = this,
            dataflowstep = [],
            view = me.getView(),
            cells = me.router.graph.getElements(),
            span = Ext.getBody().getById('paper-container-span');

        view.setLoading('Salvando alterações...');

        Ext.each(cells,function(item){
            var flow = me.selectFlow(item);
            dataflowstep.push(flow);
        });

        dataflowstep = Smart.Rss.sortArrayBy(dataflowstep, "steplevel");

        Ext.Ajax.request({
            url: me.url,
            params: {
                action: 'update',
                rows: Ext.encode({
                    id: view.xdata.get('id'),
                    version: view.xdata.get('version'),
                    dataflowstep: Ext.encode(dataflowstep),
                    authenticate: me.router.paper.authenticate(),
                    graphpaper: Ext.encode(me.router.graph.toJSON())
                })
            },
            callback: function (options, success, response) {
                view.setLoading(false);
                if(success) {
                    var data = Ext.decode(response.responseText);
                    view.xdata.set('version',data.rows[0].version);
                    span.update(Ext.String.format('{0} v.{1}',data.rows[0].name,data.rows[0].version));
                }
            }
        });
    },

    updateEdit: function () {
        var me = this,
            view = me.getView(),
            graph = me.router.graph;

        Ext.widget('sterilizationtypeedit', {
            graph: graph,
            outerScope: me
        }).show(null,function () {
            this.down('form').loadRecord(view.xdata);
            this.down('form[name=stepflaglist]').reset();
        });
    },

    printerFlow: function () {
        var me = this,
            view = me.getView(),
            url = 'business/Calls/Quick/ExceptionByFlow.php?id={0}';

        window.open(Ext.String.format(url,view.xdata.get('id')));
    },

    printerFlowItem: function(grid, rowIndex, colIndex) {
        var me = this,
            store = grid.getStore(),
            record = store.getAt(rowIndex),
            url = 'business/Calls/Quick/ExceptionByFlow.php?id={0}';

        window.open(Ext.String.format(url,record.get('id')));
    },

    onExpandReadArea: function (field,eOpts) {
        var me = this,
            read = [],
            view = me.getView(),
            form = field.getPicker(),
            graph = view.graph,
            cells = graph.getElements(),
            areas = ['basic.Area','basic.SubArea'],
            readarea = form.down('combobox[name=readarea]');

        Ext.each(cells,function(item){
            var flags = item.get('stepflaglist');

            if(flags && (areas.indexOf(item.get('type')) != -1)) {
                if((flags.indexOf('001') != -1) || (flags.indexOf('019') != -1)) {
                    read.push({
                        id: item.get('id'),
                        name: item.get('name'),
                        typeid: item.get('typeid'),
                        steplevel: item.get('steplevel'),
                        steppriority: item.get('steppriority'),
                        typelesscode: item.get('typelesscode'),
                        typelessname: item.get('typelessname')
                    });
                }
            }
        });

        form.reset();
        form.down('gridpanel').getStore().removeAll();

        readarea.reset();
        readarea.getStore().removeAll();
        readarea.setStore(
            Ext.create('Ext.data.Store', {
                fields: [ 'id', 'typeid', 'name', 'steplevel' ],
                data: Smart.Rss.sortArrayBy(read, "steplevel")
            })
        );
    },

    setClearReadArea: function (field, eOpts) {
        var me = this,
            list = [],
            view = me.getView(),
            graph = view.graph,
            form = field.up('form'),
            store = form.down('gridpanel').getStore(),
            checkboxgroup = view.down('checkboxgroup'),
            readarea = form.down('combobox[name=readarea]'),
            elementname = view.down('combobox[name=elementname]');

        store.each(function (record) {
            if(record.get('isactive')) {
                list.push(record.data);
            }
        });

        if(list.length == 0) {
            Smart.Msg.showToast('Não existem planejamentos selecionados para esta área!!','info');
            return false;
        }

        Smart.Msg.showToast('Excluindo o planejamento das configurações para esta área!','warning');

        Ext.each(list, function (item) {
            var cell = graph.getCell(item.id);
            cell.set('masterid',false);
            cell.set('isactive',false);
            cell.set('typelesscode','');
            cell.set('typelessname','');
            cell.set("steppriority",'');
            cell.set('flowchoice',false);
            cell.set('flowbreach',false);
            cell.set("exceptionby",false);
            cell.set("exceptiondo",false);
        });

        graph.getCell(readarea.getValue()).set('exceptionby', false);

        elementname.reset();
        elementname.setReadColor(true);
        elementname.getStore().removeAll();
        view.down('sterilizationtypearea').reset();
        view.down('gridpanel').getStore().removeAll();
        view.down('hiddenfield[name=readarea]').reset();

        store.removeAll();
        checkboxgroup.reset();
    },

    onElementNameIsActiveChange: function (checkcolumn, rowIndex, checked, eOpts) {
        var me = this,
            view = me.getView(),
            graph = view.graph,
            grid = checkcolumn.ownerCt.grid,
            record = grid.getStore().getAt(rowIndex),
            readarea = grid.up('form').down('combobox[name=readarea]'),
            cell = graph.getCell(record.get('id'));

        record.commit();
        cell.set('isactive', checked);
        cell.set('masterid', (checked ? readarea.getValue() : false));
    },

    onSelectReadArea: function (combo, record, eOpts) {
        var me = this,
            area = [],
            view = me.getView(),
            graph = view.graph,
            form = combo.up('form'),
            cells = graph.getElements(),
            areas = ['basic.Area', 'basic.SubArea'],
            store = form.down('gridpanel').getStore(),
            steplevel = parseInt(record.get('steplevel'));

        store.removeAll();

        Ext.each(cells, function(item) {
            var targetLinks = graph.getConnectedLinks(item, { outbound : true });
            // var exceptiondo = item.get('exceptiondo');
            var exceptiondo = (targetLinks.length >= 2) ? 1 : 0;
            var isAreas = areas.indexOf(item.get('type')) != -1;
            var isBigger = steplevel <= parseInt(item.get('steplevel'));
            var isNumber = (Ext.isNumber(exceptiondo) && (parseInt(exceptiondo) == 1));
            var isMaster = (item.get('masterid') == record.get('id') || !item.get('isactive'));

            if (isAreas && isBigger && isNumber && isMaster) {
                area.push({
                    id: item.get('id'),
                    typeid: item.get('typeid'),
                    elementname: item.get('name'),
                    isactive: item.get('isactive'),
                    steplevel: item.get('steplevel')
                });
            }

        },this);

        store.add(Smart.Rss.sortArrayBy(area, "steplevel"));
    },

    updateArea: function (btn) {
        var me = this,
            area = [],
            view = me.getView(),
            form = btn.up('form'),
            store = form.down('gridpanel[name=areas]').getStore(),
            readarea = form.down('combobox[name=readarea]'),
            elementname = view.down('combobox[name=elementname]'),
            checkboxgroup = view.down('checkboxgroup');

        if(!form.isValid()) {
            Smart.Msg.showToast('Favor selecionar uma área de leitura!','info');
            return false;
        }

        store.each(function (record) {
            if(record.get('isactive')) {
                area.push(record.data);
            }
        });

        if(area.length == 0) {
            Smart.Msg.showToast('Favor selecionar uma área de exceção!','error');
            return false;
        }

        store.removeAll();
        checkboxgroup.reset();

        view.down('gridpanel[name=exceptions]').getStore().removeAll();
        view.down('hiddenfield[name=readarea]').setValue(readarea.getValue());
        view.down('sterilizationtypearea').setRawValue(readarea.getRawValue());

        elementname.reset();
        elementname.setReadColor(false);
        elementname.getStore().removeAll();
        elementname.setStore(
            Ext.create('Ext.data.Store', {
                fields: [ 'id', 'typeid', 'elementname', 'steplevel' ],
                data: area
            })
        );

        elementname.setValue(area[0].id);
        elementname.setRawValue(area[0].elementname);
        me.onSelectElementName(elementname,elementname.foundRecord());

        form.hide();
    },

    onSelectElementName: function (combo, record, eOpts) {
        var me = this,
            list = [],
            view = me.getView(),
            graph = view.graph,
            cell = graph.getCell(record.get('id')),
            store = view.down('gridpanel[name=exceptions]').getStore(),
            checkboxgroup = view.down('checkboxgroup'),
            links = graph.getConnectedLinks(cell, { outbound : true });

        store.removeAll();

        Ext.each(links, function(link) {
            var item = graph.getCell(link.prop('target/id'));

            list.push({
                id: item.get('id'),
                areasid: item.get('typeid'),
                steplevel: item.get('steplevel'),
                elementcode: item.get('typeid'),
                elementtype: item.get('type'),
                elementname: item.get('name'),
                steppriority: item.get('steppriority'),
                typelesscode: item.get('typelesscode'),
                typelessname: item.get('typelessname')
            });
        });

        store.add(list);

        checkboxgroup.setValue({
            flowchoice: cell.get('flowchoice'),
            flowbreach: cell.get('flowbreach')
        });
    },

    onEditGridReadArea: function (editor, context, eOpts) {
        var me = this,
            item = [],
            list = [],
            view = me.getView(),
            graph = view.graph,
            grid = context.grid,
            record = context.record,
            cell = graph.getCell(record.get('id')),
            checkboxgroup = view.down('checkboxgroup'),
            readarea = view.down('hiddenfield[name=readarea]'),
            elementname = view.down('combobox[name=elementname]');

        if(cell && context.value) {

            switch (context.colIdx) {
                case 1:
                    cell.set('steppriority',context.value);
                    break;
                case 2:
                    var select = view.typeless.findRecord('typelesscode',context.value);
                    cell.set('typelesscode',select.get('typelesscode'));
                    cell.set('typelessname',select.get('typelessname'));

                    record.set('typelesscode',select.get('typelesscode'));
                    record.set('typelessname',select.get('typelessname'));
                    break;
            }

            var read = graph.getCell(readarea.getValue());
            var area = graph.getCell(elementname.getValue());

            record.commit();

            grid.getStore().each(function (result) {
                item.push(result.data);
            });
            area.set('exceptiondo',Ext.encode(item));
            area.set('flowchoice',checkboxgroup.getValue().flowchoice);
            area.set('flowbreach',checkboxgroup.getValue().flowbreach);

            elementname.getStore().each(function (result) {
                list.push(result.data);
            });
            read.set('exceptionby',Ext.encode(list));
        }
    },

    onCheckBoxGroupChange: function (field,newValue,OldValue,eOpts) {
        var me = this,
            // area = [],
            view = me.getView(),
            // graph = view.graph,
            // store = view.down('gridpanel[name=exceptions]').getStore(),
            checkboxgroup = view.down('checkboxgroup'),
            record = view.down('combobox[name=elementname]').foundRecord();

        if( !record ) {
            // checkboxgroup.reset();
            // var cell = graph.getCell(record.get('id'));
            // cell.set('flowchoice',newValue.flowchoice);
            // cell.set('flowbreach',newValue.flowbreach);
            //
            // store.each(function (item) {
            //     area.push(item.data);
            // });
            //
            // cell.set('exceptiondo',Ext.encode(area));

            // return false;
        }

        // checkboxgroup.reset();
    },

    commandManagerUndo: function () {
        var me = this;
        me.router.commandManager.undo();
    },

    commandManagerRedo: function () {
        var me = this;
        me.router.commandManager.redo();
    },

    paperScrollerZoomIn: function () {
        var me = this;
        me.router.paperScroller.zoom(0.2, { max: 5, grid: 0.2 });
    },

    paperScrollerZoomOut: function () {
        var me = this;
        me.router.paperScroller.zoom(-0.2, { min: 0.2, grid: 0.2 });
    },

    paperScrollerZoomFit: function () {
        var me = this;
        me.router.paperScroller.zoomToFit({ padding: 20, scaleGrid: 0.2, minScale: 0.2, maxScale: 5 });
    }

});