Ext.define('Learning.view.Citizen', {
    extend: 'Ext.window.Window',
    alias: 'widget.citizenwindow',

    title: 'Гражданин',
    layout: 'fit',
    autoShow: true,

    initComponent: function () {
        this.items = [{
            xtype: 'form',
            items: [{
                xtype: 'textfield',
                name: 'surname',
                fieldLabel: 'Фамилия'
            }, {
                xtype: 'textfield',
                name: 'firstname',
                fieldLabel: 'Имя'
            }, {
                xtype: 'textfield',
                name: 'fathername',
                fieldLabel: 'Отчество'
            }, {
                xtype: 'numberfield',
                name: 'birthday',
                fieldLabel: 'Дата рождения',
                minValue: 1,
            }]
        }];
        this.dockedItems = [{
            xtype: 'toolbar',
            docked: 'top',
            items: [{
                text: 'Поиск',
                iconCls: 'search-icon',
                action: 'search'
            }, {
                text: 'Добавить',
                iconCls: 'new-icon',
                action: 'new'
            }, {
                text: 'Изменить',
                iconCls: 'change-icon',
                action: 'change'
            }, {
                text: 'Удалить',
                iconCls: 'delete-icon',
                action: 'delete'
            }]
        }];
        this.buttons = [{
            text: 'Очистить',
            scope: this,
            action: 'clear'
        }];

        this.callParent(arguments);
    }
});