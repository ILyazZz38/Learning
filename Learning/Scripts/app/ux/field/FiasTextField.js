Ext.define('B4.ux.field.FiasTextField', {
    extend: 'Ext.form.field.Text',
    alias: ['widget.b4fiastextfield'],
    alternateClassName: 'B4.field.FiasTextField',

    fieldLabel: 'ФИАС',
    regex: /^[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}$/,

    getRawValue: function () {
        var me = this,
            v = me.callParent();
        if (v === me.emptyText && me.valueContainsPlaceholder) {
            v = '';
        }
        return Ext.util.Format.lowercase(v);
    }
});