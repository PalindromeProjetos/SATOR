//@charset UTF-8
Ext.define( 'Ext.overrides.data.Store', {
    override: 'Ext.data.Store',

    autoLoad: false,

    config: {
        url: null,
        urlRoute: null,
        extraParams: {
            query: '',
            rows: '{"id":""}',
            fields: Ext.encode([]),
            params: Ext.encode(['description']),
            action: 'select',
            method: 'selectLike'
        }
    },

    // http://stackoverflow.com/questions/11022616/store-do-something-after-sync-with-autosync-enabled
    restartSession: function (operation) {
        var me = this,
            response = operation.getResponse(),
            result = Ext.decode(response.responseText),
            workstation = localStorage.getItem('workstation');

        workstation = workstation ? Ext.decode(workstation) : null;

        if((response.status == 200) && (result.restart == true)) {
            if(workstation) {
                workstation.session = 'A sua sessão expirou, a aplicação deverá ser autenticada novamente!';
                localStorage.setItem('workstation', Ext.encode(workstation));
            }
            window.location.reload();
        }

        me.rejectChanges();
    },

    onCreateRecords: function(records, operation, success) {
        this.restartSession(operation);
    },

    onUpdateRecords: function(records, operation, success) {
        this.restartSession(operation);
    },

    onDestroyRecords: function(records, operation, success) {
        this.restartSession(operation);
    },

    getUrl: function() {
        var me = this;
        return me.urlRoute ? (me.urlRoute + me.url) : me.url;
    },

    setUrl: function( value ) {
        var me = this;

        me.url = value;
        me.getProxy().setUrl(value);
        me.getProxy().setApiUrl();

        return me;
    },

    setParams: function (params) {
        var me = this,
            extraParams = me.getExtraParams();

        //me.currentPage = 1;
        me.setExtraParams(Ext.Object.merge(extraParams,params));

        return me;
    }

});