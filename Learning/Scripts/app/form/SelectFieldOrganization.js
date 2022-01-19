/*
    B4.form.SelectField для выбора организации (паспортистка)
*/
Ext.define('B4.form.SelectFieldOrganization', {
    extend: 'B4.form.SelectField',
    alias: 'widget.b4selectfieldorganization',
    alternateClassName: ['B4.SelectFieldOrganization'],

    requires: [
        'B4.ux.grid.plugin.HeaderFilters',
        'B4.ux.grid.column.Enum',
        'B4.store.dict.WorkPlace',
        'B4.ux.button.Update'
    ],

    labelAlign: 'left',
    modalWindow: true,

    layout: {
        type: 'hbox',
        align: 'stretch'
    },
    defaults: {
        labelAlign: 'right'
    },
    name: 'WorkPlace',

    dataIndex: 'Id',
    queryMode: 'local',
    storeAutoLoad: true,
    store: 'B4.store.dict.WorkPlace',
    idProperty: 'Id',
    textProperty: 'WorkPlaceName',
    editable: false,
    fieldLabel: 'Организация',
    
    listView: 'B4.view.register.person.WorkPlaceList',
    dataBankId: undefined,

    constructor: function () {

        var me = this;
        me.callParent(arguments);
    },

    initComponent: function () {

        var me = this;
        me.callParent(arguments);
    },


    //окно добавления
    AddFn: function () {

        var me = this;
        var win = Ext.widget('workplacelistwindow', {
            renderTo: B4.getBody().getActiveTab().getEl(),
            title: 'Новая организация',
            refTrigger: me
        });

        var model = Ext.create('B4.model.dict.WorkPlace');
        model.Id = 0;
        win.loadRecord(model);
        win.getForm().isValid();
        win.show();
    },

    //окно редактирования
    EditFn: function (gridView, rowIndex, colIndex, el, e, rec) {

        var me = this;
        var win = Ext.widget('workplacelistwindow', {
            renderTo: B4.getBody().getActiveTab().getEl(),
            title: 'Редактирование организации',
            refTrigger: me
        });

        win.loadRecord(rec);
        win.getForm().isValid();
        win.show();
    },

    //удаление
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

        var me = this,
            name = win.down('textfield[name=WorkPlaceName]').getValue(),
            id = win.getForm().getRecord().getId();
        win.getEl().unmask("Сохранение...");
        B4.Ajax.request({
            url: 'Person/SaveWorkPlace',
            method: 'POST',
            params: {
                id: id,
                name: name
            }

        }).next(function (jsonResp) {
            win.getEl().unmask();
            var response = Ext.decode(jsonResp.responseText);

            B4.QuickMsg.msg(
                response.success ? 'Выполнено' : 'Внимание',
                response.message,
                response.success ? 'success' : 'error'
            );

            me.gridView.getStore().reload();
            me.setValue({ Id: id, Name: name }); //обновить окно

            if (response.success)
                win.close();

        }).error(function (response) {
            win.getEl().unmask();
            Ext.Msg.alert('Ошибка!', !Ext.isString(response.message) ? 'При выполнении операции произошла ошибка!' : response.message);

        });
    },

    //удаление 
    Deleter: function (gridView, rowIndex, colIndex, el, e, rec) {

        var me = this,
            id = rec.getId();


        B4.Ajax.request({
            url: 'Person/DeleteWorkPlace',
            method: 'POST',
            params: {
                id: id,
                dataBankId: me.dataBankId
            }

        }).next(function (jsonResp) {

            var response = Ext.decode(jsonResp.responseText);

            B4.QuickMsg.msg(
                response.success ? 'Выполнено' : 'Внимание',
                response.message,
                response.success ? 'success' : 'error'
            );

            me.gridView.getStore().reload();

        }).error(function (response) {

            Ext.Msg.alert('Ошибка!', !Ext.isString(response.message) ? 'При выполнении операции произошла ошибка!' : response.message);

        });

    }

});
