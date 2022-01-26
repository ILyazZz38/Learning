Ext.define('Learning.view.Add', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.addPanel',
    type: 'vbox',
    align: 'stretch',
    title: 'Добавление',

    initComponent: function () {
        this.items = [
            {
                xtype: 'container',
                name: 'fioFilters',
                layout: {
                    type: 'vbox',
                },
                items: [
                    {
                        margin: '5 5 5 5',
                        xtype: 'textfield',
                        width: '15%',
                        name: 'surnamefilter',
                        fieldLabel: 'Фамилия',
                        allowBlank: false
                    },
                    {
                        margin: '5 5 5 5',
                        xtype: 'textfield',
                        width: '15%',
                        name: 'namefilter',
                        fieldLabel: 'Имя',
                        allowBlank: false
                    },
                    {
                        margin: '5 5 5 5',
                        xtype: 'textfield',
                        width: '15%',
                        name: 'fathernamefilter',
                        fieldLabel: 'Отчество',
                        allowBlank: false
                    }
                ]
            },
            {
                xtype: 'container',
                name: 'dateFilters',
                layout: {
                    type: 'hbox',
                },
                items: [
                    {
                        margin: '5 5 5 5',
                        xtype: 'datefield',
                        anchor: '100%',
                        fieldLabel: 'Дата рождения с',
                        name: 'firstdatefilter',
                        width: '15%',
                        format: 'd m Y',
                        value: '2 4 1978'
                    },
                    {
                        margin: '5 5 5 5',
                        xtype: 'datefield',
                        anchor: '100%',
                        fieldLabel: 'Дата рождения по',
                        name: 'lastdatefilter',
                        width: '15%',
                        format: 'd m Y',
                        value: '2 4 1978'
                    }
                ]
            }
        ]
        this.callParent(arguments);
    }
});