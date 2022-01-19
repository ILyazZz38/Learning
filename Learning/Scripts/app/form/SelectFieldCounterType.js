/*
    B4.form.SelectField для выбора типа ПУ + control
*/
Ext.define('B4.form.SelectFieldCounterType', {
    extend: 'B4.form.SelectField',
    alias: 'widget.b4selectfieldcountertype',
    alternateClassName: ['B4.SelectFieldCounterType'],

    requires: [
        'B4.view.counter.CounterTypeList',
        'B4.ux.grid.plugin.HeaderFilters',
        'B4.ux.grid.column.Enum',
        'B4.store.dict.CounterType',
        'B4.ux.button.Update'
    ],

    labelAlign: 'right',
    modalWindow: true,

    layout: {
        type: 'hbox',
        align: 'stretch'
    },
    defaults: {
        labelAlign: 'right'
    },
    name: 'TypeId',

    dataIndex: 'TypeId',
    allowBlank: false,
    queryMode: 'local',
    storeAutoLoad: true,
    store: 'B4.store.dict.CounterType',
    idProperty: 'Id',
    textProperty: 'Name',
    editable: false,
    fieldLabel: 'Тип прибора учета',

    listView: 'B4.view.counter.CounterTypeList',
    dataBankId: undefined,

    constructor: function() {

        var me = this;
        me.callParent(arguments);
    },

    initComponent: function() {

        var me = this;
        me.callParent(arguments);
    },


    //окно добавления типа ПУ 
    AddFn: function() {

        var me = this;
        var win = Ext.widget('countertypelistwindow', {
            renderTo: B4.getBody().getActiveTab().getEl(),
            title: 'Новый тип прибора',
            refTrigger: me
        });

        var model = Ext.create('B4.model.dict.CounterType');
        model.Id = 0;
        win.loadRecord(model);
        win.getForm().isValid();
        win.show();
    },

    //окно редактирования типа ПУ 
    EditFn: function(gridView, rowIndex, colIndex, el, e, rec) {

        var me = this;
        var win = Ext.widget('countertypelistwindow', {
            renderTo: B4.getBody().getActiveTab().getEl(),
            title: 'Редактирование типа прибора',
            refTrigger: me
        });

        win.loadRecord(rec);
        win.getForm().isValid();
        win.show();
    },

    //удаление типа ПУ 
    DeleteFn: function (gridView, rowIndex, colIndex, el, e, rec) {

        var me = this;
        Ext.Msg.confirm('Удаление данных', 'Вы действительно хотите удалить данные?', function (result) {
            if (result == 'yes') {

                me.Deleter(gridView, rowIndex, colIndex, el, e, rec);

            }
        }, me);
    },

    //сохранение данных
    SaverFn: function (btn) {
        
        var me = this,
            win = btn.up('window');

        if (!win.getForm().isValid()) {
            //получаем все поля формы
            var fields = win.getForm().getFields();

            var invalidFields = '';

            //проверяем, если поле не валидно, то записиваем fieldLabel в строку инвалидных полей
            Ext.each(fields.items, function (field) {
                if (!field.isValid()) {
                    invalidFields += '<br>' + field.fieldLabel;
                }
            });

            //выводим сообщение
            Ext.Msg.alert('Ошибка сохранения!', 'Не заполнены обязательные поля: ' + invalidFields);
            return;
        }


        Ext.Msg.confirm('Сохранение данных', 'Вы действительно хотите сохранить данные?', function (result) {
            if (result == 'yes') {

                me.Saver(win);

            }
        }, me);

    },
    
    //сохранить в базе
    Saver: function (win) {

        win.getEl().mask('Сохранение данных...');

        var me = this,
            name = win.down('textfield[name=Name]').getValue(),
            multiplier = win.down('numberfield[name=Multiplier]').getValue().toFixed(7),
            capacity = win.down('numberfield[name=Capacity]').getValue(),
            calibrationIntarval = win.down('textfield[name=CalibrationInterval]').getValue(),
            id = win.getForm().getRecord().getId(),
            dataBankId = win.getForm().getRecord().get('DataBank');
    
	    if (calibrationIntarval != null && calibrationIntarval.length > 0) {
		    if (isNaN(parseInt(calibrationIntarval))) {
			    Ext.Msg.alert('Ошибка сохранения!', 'Значение поля \'Межпроверочный интервал\' должно принимать значения от 1 до 20 ');
			    return;
		    }

		    if (!isNaN(parseInt(calibrationIntarval)) && (calibrationIntarval < 1 || calibrationIntarval > 20)) {
			    Ext.Msg.alert('Ошибка сохранения!', 'Значение поля \'Межпроверочный интервал\' должно принимать значения от 1 до 20 ');
			    return;
		    }
	    }

	    B4.Ajax.request({
            url: 'CounterType/Saver',
            method: 'POST',
            params: {
                id: id,
                name: name,
                capacity: capacity,
                multiplier: multiplier,
				calibrationInterval: calibrationIntarval,
                dataBankId: dataBankId
            }
            
        }).next(function(jsonResp) {

            var response = Ext.decode(jsonResp.responseText);

            B4.QuickMsg.msg(
                response.success ? 'Выполнено' : 'Внимание',
                response.message,
                response.success ? 'success' : 'error'
            );

            me.gridView.getStore().reload();
            me.setValue({ Id: id, Name: name }); //обновить окно ПУ
            
            if (response.success) win.close();
            win.getEl().unmask();

        }).error(function (response) {

            win.getEl().unmask();
            Ext.Msg.alert('Ошибка!', !Ext.isString(response.message) ? 'При выполнении операции произошла ошибка!' : response.message);

        });
    },
    
    //удаление типа ПУ
    Deleter: function (gridView, rowIndex, colIndex, el, e, rec) {

        var me = this,
            id = rec.getId(),
            dataBankId = rec.get('DataBank');

        gridView.getEl().mask('Удаление данных...');

        B4.Ajax.request({
            url: 'CounterType/Deleter',
            method: 'POST',
            params: {
                id: id,
                dataBankId: dataBankId
            }

        }).next(function (jsonResp) {

            var response = Ext.decode(jsonResp.responseText);

            B4.QuickMsg.msg(
                response.success ? 'Выполнено' : 'Внимание',
                response.message,
                response.success ? 'success' : 'error'
            );

            me.gridView.getStore().reload();
            gridView.getEl().unmask();

        }).error(function (response) {

            gridView.getEl().unmask();
            Ext.Msg.alert('Ошибка!', !Ext.isString(response.message) ? 'При выполнении операции произошла ошибка!' : response.message);

        });

    }

});
