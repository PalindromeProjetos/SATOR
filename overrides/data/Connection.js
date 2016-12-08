//@charset UTF-8
Ext.define( 'Ext.overrides.data.Connection', {
    override: 'Ext.data.Connection',

    defaultHeaders: { 'Credential-Name': 'samuel.oliveira' },

    constructor: function () {
        var me = this;
        me.callParent();
        me.onBefore( 'beforerequest', me.fnBeforeRequest, me);
        me.onAfter( 'requestcomplete', me.fnRequestComplete, me);

        var defaultHeaders = me.getDefaultHeaders();
        me.setDefaultHeaders(Ext.Object.merge(defaultHeaders,{credential: 'samuel.oliveira'}));
    },

    fnBeforeRequest: function (conn , options , eOpts) {
        var me = this,
            extraParams = me.getExtraParams();

        me.setExtraParams(Ext.Object.merge(extraParams,{Credential: 'samuel.oliveira'}));
    },

    fnRequestComplete: function ( conn , response , options , eOpts ) {
        var result = Ext.decode(response.responseText),
            workstation = localStorage.getItem('workstation');

        workstation = workstation ? Ext.decode(workstation) : null;

        if((response.status == 200) && (result.text == 1)) {
            if(workstation) {
                workstation.session = 'A sua sessão expirou, a aplicação deverá ser autenticada novamente!';
                localStorage.setItem('workstation', Ext.encode(workstation));
            }
            window.location.reload();
        }
    }

});