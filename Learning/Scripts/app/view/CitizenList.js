Ext.define('Learning.view.CitizenList', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.citizenlist',

    title: 'Реестр граждан',
    store: 'CitizenStore',

    initComponent: function () {
        this.dockedItems = Ext.create('Ext.toolbar.Toolbar', {
            alias: 'widget.toolbarEditUser',
            dock: 'right',
            items: [
                {
                    text: 'Поиск',
                    scale: 'large',
                    action: 'create1',
                    id: 'create1'
                },
                {
                    text: 'Добавить',
                    scale: 'large',
                    action: 'create',
                    id: 'create'
                }]
        });
        this.columns = [
            { header: 'Фамилия', dataIndex: 'surname', flex: 1 },
            { header: 'Имя', dataIndex: 'firstname', flex: 1 },
            { header: 'Отчество', dataIndex: 'fathername', flex: 1 },
            { header: 'Дата рождения', dataIndex: 'birthday', flex: 1 }
        ];

        this.callParent(arguments);
    }
});