/*
    Выбор расчетного месяца  
*/
Ext.define('B4.form.CalcMonthPeriodPicker', {
	extend: 'Ext.container.Container',
    alias: 'widget.b4calcmonthperiodpicker',
    
    requires: [
        'B4.form.CalcMonthPicker'
    ],
 
    editable: false,
	
    constructor: function (params) {
        var me = this;
	    me.callParent(arguments);
    },
    
    getValue: function () {
	    var monthFrom = this.down('b4calcmonthpicker[name=ChargeDateFrom]'),
	    	monthTo = this.down('b4calcmonthpicker[name=ChargeDateTo]');
	    var array = { 'MonthFrom': monthFrom.getValue(), 'MonthTo': monthTo.getValue()};
	  
	    return array;
    },

    initComponent: function () {
	var me = this;

	Ext.applyIf(me, {
		layout: {
			type: 'hbox'
		},
		items: [
			{
				xtype: 'b4calcmonthpicker',
				name: 'ChargeDateFrom',
				labelWidth: 120,
				//minwidth: 220,
				allowBlank: false,
				fieldLabel: 'Расчетный месяц c ',
				validator: function (field) {
					var form = this.up('b4calcmonthperiodpicker');
					var field1 = form.down('[name=ChargeDateTo]');
					if (!field1.getValue()) return true;
					if (this.getValue() > field1.getValue()) {
						return 'Месяц начала периода не может быть больше месяца окончания периода';
					}
					return true;
				}
			},
			{
				xtype: 'b4calcmonthpicker',
				name: 'ChargeDateTo',
				labelWidth: 30,
				//minwidth: 220,
				allowBlank: false,
				fieldLabel: ' по ',
				validator: function (field) {
					var form = this.up('b4calcmonthperiodpicker');
					var field1 = form.down('[name=ChargeDateFrom]');
					if (!field1.getValue()) return true;
					if (this.getValue() < field1.getValue()) {
						return 'Месяц начала периода не может быть больше месяца окончания периода';
					}
					return true;
				}
			}
		]
	});
	me.callParent(arguments);
}
}); 