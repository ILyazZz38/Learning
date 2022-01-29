/*
    B4.form.SelectField для выбора справочника для параметра
*/
Ext.define('B4.form.SelectFieldParamDictionary', {
    extend: 'B4.form.SelectField',
    alias: 'widget.b4selectfieldparamdictionary',
    alternateClassName: ['B4.SelectFieldParamDictionary'],

    requires: [
        'B4.view.parameter.ParameterDictionaryList',
        'B4.ux.grid.plugin.HeaderFilters',
        'B4.ux.grid.column.Enum',
        'B4.ux.button.Update',
        'B4.store.parameter.ParamDictionary'
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

    name: 'DictionaryId',

    dataIndex: 'DictionaryId',
    queryMode: 'local',
    storeAutoLoad: true,
    store: 'B4.store.parameter.ParamDictionary',
    idProperty: 'Id',
    textProperty: 'Name',
    editable: false,
    fieldLabel: 'Справочник',

    listView: 'B4.view.parameter.ParameterDictionaryList',

    constructor: function () {
        var me = this;
        me.callParent(arguments);
    },

    initComponent: function () {
        var me = this;
        me.callParent(arguments);
    },

    //окно добавления 
    addRecord: function () {
        var me = this,
            win = Ext.widget('paramdictionarywin', {
                renderTo: B4.getBody().getActiveTab().getEl(),
                title: 'Новый справочник',
                refTrigger: me
            });

        var model = Ext.create('B4.model.parameter.ParamDictionary');
        model.Id = 0;
        win.loadRecord(model);
        win.getForm().isValid();

        win.down('b4savebutton').enable();
        win.down('textfield[name=NameShort]').enable();
        win.down('textfield[name=Name]').enable();

        win.show();
    },

    //окно редактирования
    editRecord: function (gridView, rowIndex, colIndex, el, e, rec) {
        var me = this,
            win = Ext.widget('paramdictionarywin', {
                renderTo: B4.getBody().getActiveTab().getEl(),
                title: 'Редактирование справочника',
                refTrigger: me
            });

        win.loadRecord(rec);
        win.getForm().isValid();

        if (rec.get('IsReadOnly') != 1) {
            win.down('b4savebutton').enable();
            win.down('textfield[name=NameShort]').enable();
            win.down('textfield[name=Name]').enable();
        }

        win.show();
    },

    //удаление 
    deleteRecord: function (gridView, rowIndex, colIndex, el, e, rec) {
        var me = this;

        if (rec.get('IsReadOnly') == 1) {
            B4.QuickMsg.msg('Внимание', 'Данный справочник удалить нельзя!', 'warning');
            return;
        }

        Ext.Msg.confirm('Удаление данных', 'Вы действительно хотите удалить данные?', function (result) {
            if (result == 'yes') {
                me.mask('Удаление', B4.getBody());
                rec.destroy()
                    .next(function () {
                        me.gridView.getStore().reload();
                        me.unmask();
                        B4.QuickMsg.msg('Выполнено', 'Удаление прошло успешно', 'success');
                    }, this)
                     .error(function (result) {
                         Ext.Msg.alert('Ошибка удаления!', Ext.isString(result.responseData) ? result.responseData : result.responseData.message);
                         me.unmask();
                     }, this);
            }
        }, me);
    },

    //сохранение данных
    saveRecord: function (btn) {
        var me = this,
            win = btn.up('window'),
            form = win.getForm();

        if (!form.isValid()) {
            //получаем все поля формы
            var fields = form.getFields(),
                invalidFields = '';

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

        form.updateRecord();
        var rec = form.getRecord();

        rec.save(
        {
            id: rec.getId()
        }).next(function (res) {
            B4.QuickMsg.msg('Выполнено', 'Справочник сохранен', 'success');

            me.gridView.getStore().reload();
            win.close();
        }).error(function (response) {
            Ext.Msg.alert('Ошибка!', 'При выполнении операции произошла ошибка!');
        });
    }
});
