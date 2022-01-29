Ext.define('B4.form.register.personalaccount.SelectFieldRegistrationAuthority', {
    extend: 'B4.form.SelectField',
    alias: 'widget.b4selectfieldregistrationauthority',
    alternateClassName: ['B4.SelectFieldRegistrationAuthority'],

    requires: [
        'Ext.grid.Panel',
        'B4.ux.grid.plugin.HeaderFilters',
        'B4.ux.grid.column.Enum',
        'B4.store.dict.RegistrationAuthority',
        'B4.ux.button.Update'
    ],

    
    modalWindow: true,

    layout: {
        type: 'hbox',
        align: 'stretch'
    },

    dataIndex: 'Id',
    allowBlank: false,
    queryMode: 'local',
    storeAutoLoad: true,
    store: 'B4.store.dict.RegistrationAuthority',
    idProperty: 'Name',
    textProperty: 'Name',
    editable: false,
    fieldLabel: 'Регистрационный орган',
        
    listView: 'B4.view.register.person.RegistrationAuthorityList',
    dataBankId: undefined,

    constructor: function () {

        var me = this;
        me.callParent(arguments);
    },

    initComponent: function () {

        var me = this;
        me.callParent(arguments);
    },


    //окно добавление регистрационного органа
    AddFn: function () {

        var me = this;
        var win = Ext.widget('registrationauthoritylistwindow', {
            title: 'Новый регистрационный орган',
            refTrigger: me
        });
        var model = Ext.create('B4.model.dict.RegistrationAuthority');
        model.Id = 0;
        win.loadRecord(model);
        win.getForm().isValid();
        win.show();
    },

    //окно редактирования регистрационного органа
    EditFn: function (gridView, rowIndex, colIndex, el, e, rec) {

        var me = this;
        var win = Ext.widget('registrationauthoritylistwindow', {
            title: 'Редактирование регистрационного органа',
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
    SaverFn: function (btn) {
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
            B4.QuickMsg.msg('Выполнено', 'Регистрационный орган сохранен', 'success');

            me.gridView.getStore().reload();
            win.close();
        }).error(function (response) {
            Ext.Msg.alert('Ошибка!', 'При выполнении операции произошла ошибка!');
        });
    }
});
