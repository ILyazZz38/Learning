Ext.define('Learning.view.CitizenList', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.citizenlist',
    type: 'vbox',
    align: 'stretch',
    title: 'Реестр граждан',

    initComponent: function () {
        
        this.dockedItems = Ext.create('Ext.toolbar.Toolbar', {
            alias: 'widget.toolbarEditUser',
            dock: 'right',
            items: [
                {
                    text: 'Поиск',
                    scale: 'large',
                    action: 'search',
                    id: 'search'
                },
                {
                    text: 'Добавить',
                    scale: 'large',
                    action: 'create',
                    id: 'create'
                },
                {
                    text: 'Изменить',
                    scale: 'large',
                    action: 'edit',
                    id: 'edit'
                },
                {
                    text: 'Удалить',
                    scale: 'large',
                    action: 'delete',
                    id: 'delete'
                },
                {
                    text: 'Печать',
                    scale: 'large',
                    action: 'print',
                    id: 'print'
                }
            ]
        });

        this.items = [
            {
                xtype: 'panel',
                title: 'Фильтры поиска',
                name: 'searchFilters', 
                flex: 1,
                items: [
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
                                name: 'surname',
                                fieldLabel: 'Фамилия',
                                allowBlank: false  // requires a non-empty value
                            },
                            {
                                margin: '5 5 5 5',
                                xtype: 'textfield',
                                width: '15%',
                                name: 'firstname',
                                fieldLabel: 'Имя',
                                allowBlank: false  // requires a non-empty value
                            },
                            {
                                margin: '5 5 5 5',
                                xtype: 'textfield',
                                width: '15%',
                                name: 'fathername',
                                fieldLabel: 'Отчество',
                                allowBlank: false  // requires a non-empty value
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
                                name: 'firstdate',
                                width: '15%',
                                // The value matches the format; will be parsed and displayed using that format.
                                format: 'd.m.Y'
                            },
                            {
                                margin: '5 5 5 5',
                                xtype: 'datefield',
                                anchor: '100%',
                                fieldLabel: 'Дата рождения по',
                                name: 'lastdate',
                                width:'15%',
                                // The value matches the format; will be parsed and displayed using that format.
                                format: 'd.m.Y'
                            }
                        ]
                    }                    
                ]
            },
            {
                xtype: 'gridpanel',
                name: 'table',
                title: 'Таблица',
                store: 'CitizenStore',
                flex: 2,
                width: 1850,
                height: 773,
                columns: [
                    {
                        xtype: 'gridcolumn',
                        draggable: false,
                        flex: 1,
                        align: 'left',
                        hidden: true,
                        dataIndex: 'id_citizen',
                        name: 'id_citizen',
                        text: 'Id'
                    },
                    {
                        xtype: 'gridcolumn',
                        draggable: false,
                        flex: 1,
                        align: 'left',
                        dataIndex: 'surname',
                        name: 'surname',
                        text: 'Фамилия'
                    },
                    {
                        xtype: 'gridcolumn',
                        draggable: false,
                        flex: 1,
                        align: 'left',
                        dataIndex: 'firstname',
                        name: 'firstname',
                        text: 'Имя'
                    },
                    {
                        xtype: 'gridcolumn',
                        draggable: false,
                        flex: 1,
                        align: 'left',
                        dataIndex: 'fathername',
                        name: 'fathername',
                        text: 'Отчество'
                    },
                    {
                        xtype: 'gridcolumn',
                        draggable: false,
                        flex: 1,
                        align: 'left',
                        dataIndex: 'birthday',
                        name: 'birthday',
                        //type: 'date',
                        //format: 'd/m/Y',
                        text: 'Дата рождения'
                    }
                    ]
            }
        ];

        //this.columns = [
        //    { header: 'Фамилия', dataIndex: 'surname', flex: 1 },
        //    { header: 'Имя', dataIndex: 'firstname', flex: 1 },
        //    { header: 'Отчество', dataIndex: 'fathername', flex: 1 },
        //    { header: 'Дата рождения', dataIndex: 'birthday', flex: 1 }
        //];

        //Ext.create('Ext.panel.Panel', {
        //    layout: {
        //        width: 120,
        //        height: 120,
        //        type: 'vbox',
        //        align: 'stretch'
        //    },
        //    items: [{
        //        xtype: 'panel',
        //        title: 'Первая панель',
        //        width: 120,
        //        height: 120,
        //    }],
        //    renderTo: Ext.getBody()
        //})

        this.callParent(arguments);
    }
});