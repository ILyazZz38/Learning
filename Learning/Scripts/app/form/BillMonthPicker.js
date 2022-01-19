Ext.define('B4.form.BillMonthPicker', {
    extend: 'B4.form.MonthPicker',
    alias: 'widget.b4billmonthpicker',
    
    lastDayInMonth: false, //Брать последний день месяца

    constructor: function(params) {
        var me = this;

        params.format = params.format || 'F, Y';
        params.labelWidth = params.labelWidth || 100;
        params.labelAlign = params.labelAlign || 'right';
        
        me.callParent(arguments);
    },
    
    getValue: function() {
        if (this.value && this.lastDayInMonth) {
            return new Date(this.value.getFullYear(), this.value.getMonth() + 1, 0);
        } else {
            return this.value;
        }
    }
}); 