Ext.define('B4.form.DateTimePicker', {
    extend: 'Ext.container.Container',
    alias: 'widget.b4datetimepicker',

    /*
        Свойства указываются для для datefield
    */
    dateLabelWidth: 100,
    dateWidth: 200,
    fieldLabel: 'Дата',
    //свойства 'name' для datefield и timefield по порядку
    dateName: 'date',
    allowBlank: true,
    labelAlign: 'right',
    validator: undefined,

    requires: [
        'Ext.form.field.Date',
        'Ext.form.field.Time'
    ],

    refs: [
        {
            ref: 'mainView',
            selector: 'b4datetimepicker'
        }
    ],

    getValue: function () {
        return this.down('datefield').getValue();
    },

    initComponent: function () {
        var me = this;

        Ext.applyIf(me, {
            layout: {
                type: 'hbox'
            },
            items: [
                {
                    xtype: 'datefield',
                    name: me.dateName,
                    fieldLabel: me.fieldLabel,
                    labelWidth: me.dateLabelWidth,
                    allowBlank: me.allowBlank,
                    labelAlign: me.labelAlign,
                    width: me.dateWidth,

                    format: 'd.m.Y H:i', //здесь H обязателен, иначе не присваивается время в timefield !!!!  
                    listeners: {
                        change: function (field, newValue) {
                            var timeField = field.up('b4datetimepicker').down('timefield');
                            var hoursStr =  (newValue.getHours() + '').length > 1 ?
                                    newValue.getHours() + ':00' :
                                    '0' + newValue.getHours() + ':00';
                            var indRec = timeField.getStore().find('disp', hoursStr);
                            timeField.select(timeField.getStore().getAt(indRec));
                        }
                    }

                },
                {
                    xtype: 'timefield',
                    margin: 0,
                    width: 60,
                    increment: 60,
                    format: 'H:i',
                    editable: false,
                    listeners: {
                        change: function (field, newValue, oldValue) {
                            var dateField = field.up('b4datetimepicker').down('datefield');
                            var hours = newValue ? newValue.getHours() : dateField.getValue().getHours();

                            if (dateField.getValue()) {
                                dateField.setValue(new Date(dateField.getValue().setHours(hours)));
                            }
                        }
                    }
                }
            ]
        });
        me.callParent(arguments);
    }
});

Ext.define('Ext.ux.form.DateTimeField', {
    extend: 'Ext.form.field.Date',
    alias: 'widget.datetimefield',
    requires: ['Ext.ux.DateTimePicker'],

    showSeconds: true,

    initComponent: function () {
        var me = this,
            format = me.showSeconds
                ? 'H:i:s'
                : 'H:i';

        this.format = this.format + ' ' + format;
        this.callParent();
    },
    isValid: function () { return true; },
    // overwrite
    createPicker: function () {
        var me = this,
            format = Ext.String.format;

        return Ext.create('Ext.ux.KpDateTimePicker', {
            showSeconds: me.showSeconds,
            ownerCt: me.ownerCt,
            renderTo: document.body,
            floating: true,
            hidden: true,
            focusOnShow: true,
            minDate: me.minValue,
            maxDate: me.maxValue,
            disabledDatesRE: me.disabledDatesRE,
            disabledDatesText: me.disabledDatesText,
            disabledDays: me.disabledDays,
            disabledDaysText: me.disabledDaysText,
            format: me.format,
            showToday: me.showToday,
            startDay: me.startDay,
            minText: format(me.minText, me.formatDate(me.minValue)),
            maxText: format(me.maxText, me.formatDate(me.maxValue)),
            listeners: {
                scope: me,
                select: me.onSelect
            },
            keyNavConfig: {
                esc: function () {
                    me.collapse();
                }
            }
        });
    }
});

Ext.define('Ext.ux.KpDateTimePicker', {
    extend: 'Ext.picker.Date',
    alias: 'widget.kpdatetimepicker',
    requires: ['Ext.ux.form.TimePickerField'],

    showSeconds: undefined,

    initComponent: function () {
        // keep time part for value
        var value = this.value || new Date();

        this.callParent();
        this.value = value;
    },
    isValid: function () { },

    onRender: function (container, position) {
        var me = this,
            format = me.showSeconds
                ? 'H:i:s'
                : 'H:i';

        if (!this.timefield) {
            this.timefield = Ext.create('Ext.ux.form.TimePickerField',
                {
                    labelWidth: 40,
                    value: Ext.Date.format(this.value, format),
                    showSeconds: me.showSeconds
                });
        }
        this.timefield.ownerCt = this;
        this.timefield.on('change', this.timeChange, this);
        this.callParent(arguments);

        var table = Ext.get(Ext.DomQuery.selectNode('table', this.el.dom));
        var tfEl = Ext.core.DomHelper.insertAfter(table, {
            tag: 'div',
            style: 'border:0px;',
            children: [{
                tag: 'div',
                cls: 'x-datepicker-footer ux-timefield'
            }]
        }, true);
        this.timefield.render(this.el.child('div div.ux-timefield'));

        var p = this.getEl().parent('div.x-layer');
        if (p) {
            p.setStyle("height", p.getHeight() + 31);
        }
    },
    timeChange: function (tf, time, rawtime) {
        // if(!this.todayKeyListener) { // before render
        this.value = this.fillDateTime(this.value);
        // } else {
        // this.setValue(this.value);
        // }
    },
    // @private
    fillDateTime: function (value) {
        if (this.timefield) {
            var rawtime = this.timefield.getRawValue();
            value.setHours(rawtime.h);
            value.setMinutes(rawtime.m);
            value.setSeconds(rawtime.s);
        }
        return value;
    },
    // @private
    changeTimeFiledValue: function (value) {
        this.timefield.un('change', this.timeChange, this);
        this.timefield.setValue(this.value);
        this.timefield.on('change', this.timeChange, this);
    },

    // overwrite
    setValue: function (value) {
        this.value = value;
        this.changeTimeFiledValue(value);
        return this.update(this.value);
    },
    // overwrite
    getValue: function () {
        return this.fillDateTime(this.value);
    },

    // overwrite : fill time before setValue
    handleDateClick: function (e, t) {
        var me = this,
            handler = me.handler;

        e.stopEvent();
        if (!me.disabled && t.dateValue && !Ext.fly(t.parentNode).hasCls(me.disabledCellCls)) {
            me.doCancelFocus = me.focusOnSelect === false;
            me.setValue(this.fillDateTime(new Date(t.dateValue))); // overwrite: fill time before setValue
            delete me.doCancelFocus;
            me.fireEvent('select', me, me.value);
            if (handler) {
                handler.call(me.scope || me, me, me.value);
            }
            me.onSelect();
        }
    },

    // overwrite : fill time before setValue
    selectToday: function () {
        var me = this,
            btn = me.todayBtn,
            handler = me.handler;

        if (btn && !btn.disabled) {
            // me.setValue(Ext.Date.clearTime(new Date())); //src
            me.setValue(new Date());// overwrite: fill time before setValue
            me.fireEvent('select', me, me.value);
            if (handler) {
                handler.call(me.scope || me, me, me.value);
            }
            me.onSelect();
        }
        return me;
    }
});