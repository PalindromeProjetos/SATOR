//@charset UTF-8
Ext.define( 'Ext.overrides.form.field.Base', {
    override: 'Ext.form.field.Base',

    msgTarget: 'qtip',
    labelAlign: 'top',
    labelSeparator: '',

    enabledENTER: true,
    useLabelBold: true,
    useMondaFont: false,
    useReadColor: false,
    setTextAlign: false,
    useUpperCase: false,

    initComponent: function () {
        var me = this;

        me.callParent();

        me.setLabelBold(me.useLabelBold);

        if (me.getXType() == 'displayfield') {
            return false;
        }

        me.setMondaFont(me.useMondaFont);
        me.setReadColor(me.useReadColor);

        // me.onBefore( 'specialkey', me.fnSecialKey, me);
        me.onAfter( 'afterrender', me.fnAfterRender, me);
    },

    fnSecialKey: function (field, e, eOpts) {
        if (e.getKey() == e.ENTER) {
            e.browserEvent.keyCode = e.TAB;
        }
        // if (events.getKey() == events.ENTER) {
        //     var nextfield = field.nextSibling();
        //     nextfield .focus(false,200);
        // }
    },

    fnAfterRender: function (field, eOpts) {
        var me = this;

        if(me.setTextAlign) {
            me.inputEl.setStyle('text-align', me.setTextAlign);
        }

        if(me.useUpperCase) {
            // field.el.applyStyles({textTransform: "uppercase"});
            field.mon(field.el,'keyup',function() {
                this.setValue(this.getValue().toUpperCase());
            },field);
        }
    },

    /**
     * Muda o Label para Style Bold
     *
     * @param value boolean
     */
    setLabelBold: function ( value ) {
        var me = this,
            labelBold = 'font-weight: bold;';

        if(value) {
            me.labelStyle = me.labelStyle ? (me.labelStyle + labelBold) : labelBold;
        }
    },

    /**
     * Usa Monda Font no componente
     *
     * @param value boolean
     */
    setMondaFont: function ( value ) {
        var me = this;

        if(me.fieldStyle) {
            var fieldStyle = Ext.Object.merge(me.fieldStyle, ( value === true ? { 'font-family' : 'Monda' } : me.fieldStyle ));
            me.setFieldStyle(fieldStyle);
        }
    },

    objectMerge: function (target, source) {
        var me = this;

        if ( typeof target !== 'object' ) {
            target = {};
        }

        for (var property in source) {

            if ( source.hasOwnProperty(property) ) {

                var sourceProperty = source[ property ];

                if ( typeof sourceProperty === 'object' ) {
                    target[ property ] = me.fieldStyleMerge( target[ property ], sourceProperty );
                    continue;
                }

                target[ property ] = sourceProperty;

            }

        }

        for (var a = 2, l = arguments.length; a < l; a++) {
            merge(target, arguments[a]);
        }

        return target;
    },

    /**
     * Atribui ReadOnly e muda a cor de fundo
     *
     * @param value boolean
     */
    setReadColor: function ( value ) {
        var me = this,
            fieldStyle = me.objectMerge(me.fieldStyle,{ 'background-color' : ( value === true ? 'rgb(255, 239, 187)' : '#FFFFFF' ) });

        me.setReadOnly(value);
        me.setFieldStyle(fieldStyle);
    }

});