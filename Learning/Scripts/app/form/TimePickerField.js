Ext.define('B4.form.TimePickerField', {
    override: 'Ext.ux.form.TimePickerField',

    showSeconds: undefined,

    fieldLabel: 'Время',

    initComponent: function () {
        var me = this;

        me.value = me.value || Ext.Date.format(new Date(), 'H:i:s');

        me.callParent();// called setValue

        me.spinners = [];
        var cfg = Ext.apply({}, me.spinnerCfg, {
            readOnly: me.readOnly,
            disabled: me.disabled,
            style: 'float: left',
            listeners: {
                change: {
                    fn: me.onSpinnerChange,
                    scope: me
                }
            }
        });

        me.hoursSpinner = Ext.create('Ext.form.field.Number', Ext.apply({}, cfg, {
            minValue: 0,
            maxValue: 23
        }));
        me.minutesSpinner = Ext.create('Ext.form.field.Number', Ext.apply({}, cfg, {
            minValue: 0,
            maxValue: 59
        }));
        me.secondsSpinner = Ext.create('Ext.form.field.Number', Ext.apply({}, cfg, {
            minValue: 0,
            maxValue: 59
        }));

        me.spinners.push(me.hoursSpinner, me.minutesSpinner);

        if (me.showSeconds) {
            me.spinners.push(me.secondsSpinner);
        }

        me.callSuper(arguments);
    }
});