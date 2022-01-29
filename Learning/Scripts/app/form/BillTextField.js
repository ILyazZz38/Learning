Ext.define('B4.form.BillTextField', {
    override: 'Ext.form.field.Text',

    disabledCls: 'uxFieldDisabled',

    initComponent: function () {
        var me = this;

        me.on({
            'afterrender': function (field) {
                if (field.readOnly) {
                    me.setReadOnly(field.readOnly);
                }
            }
        });

        this.callParent(arguments);
    },

    setReadOnly: function (readOnly) {
        var me = this;

        me.callParent(arguments);
        me[readOnly ? 'addCls' : 'removeCls']('uxFieldDisabled');
        me.updateLayout();
    }
});