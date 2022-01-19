/*
    Выбор расчетного месяца  
*/
Ext.define('B4.form.CalcMonthPicker', {
    extend: 'B4.form.MonthPicker',
    alias: 'widget.b4calcmonthpicker',

    previousMonth: false,
    setMaxValueCalcMonth: true, // установить максимальное значение текущим расчетным месяцем?
    lastDayInMonth: false, // последний день 

    editable: false,
    beforerenderCalcMonthPicker: function (field) {
        field.setReadOnly(true);

        B4.services.CalcMonthService.getCurrencCalcMonth(function (date) {
            var format = field.format;

            if (field.previousMonth) {
                date.setMonth(date.getMonth() - 1);
            }
            field.calcMonth = date;
            field.format = 'd.m.Y';
            field.format = format;
            if (!field.value) {
                field.setValue(date);
                field.setRawValue(Ext.Date.format(date, format));
            }
            if (field.setMaxValueCalcMonth) {
                var d = field.getValue();
                var yy = d.getFullYear();
                var mm = d.getMonth() + 1;

                field.setMaxValue(new Date(yy, mm, 0));
            }
            field.setReadOnly(false);

            field.fireEvent('loadsuccess', field);
        });
    },

    initComponent: function () {
        var me = this;
        me.on('beforerender', me.beforerenderCalcMonthPicker);
        me.callParent(arguments);
    },

    constructor: function (params) {
        var me = this;

        params.format = params.format || 'F, Y';
        params.labelWidth = params.labelWidth || 100;
        params.labelAlign = params.labelAlign || 'right';
        params.fieldLabel = params.fieldLabel || 'Расчетный месяц';
     
        me.callParent(arguments);
    },

    checkDate: function () {
        var me = this;
        return me.value && me.calcMonth && me.value.getFullYear() == me.calcMonth.getFullYear() && me.value.getMonth() == me.calcMonth.getMonth();
    },

    getValue: function () {
        if (this.value && this.lastDayInMonth) {
            return new Date(this.value.getFullYear(), this.value.getMonth() + 1, 0);
        } else {
            return this.value;
        }
    }
}); 