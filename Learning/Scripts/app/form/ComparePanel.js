/*
    Панель сравнения данных
*/
Ext.define('B4.form.ComparePanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.b4comparepanel',
    alternateClassName: ['B4.ComparePanel'],

    requires: [
        'B4.ux.grid.toolbar.Paging',
        'Ext.grid.Panel',
        'B4.ux.grid.plugin.HeaderFilters',
        'B4.ux.button.Update'
    ],

    flex: 1,
    border: false,
    title: '',
    layout: {
        type: 'hbox',
        align: 'stretch'
    },

    name: null,

    initComponent: function() {
        var me = this;
        var store = Ext.create('B4.store.administration.loadfromfile.FilesUpload', {
            proxy: {
                type: 'b4proxy',
                controllerName: 'Loader',
                listAction: 'GetUploadData'
            }
        });
        var storeSearch = Ext.create('B4.store.administration.loadfromfile.FilesUpload', {
            proxy: {
                type: 'b4proxy',
                controllerName: 'Loader',
                listAction: 'GetSearchData'
            }
        });

        Ext.applyIf(me, {
            items: [
                {
                    xtype: 'gridpanel',
                    flex: 1,
                    border: false,
                    name: 'leftGrid',
                    store: store,
                    tableName: null,

                    selModel: Ext.create('Ext.selection.CheckboxModel', {
                        checkOnly: true,
                        mode: 'SINGLE'
                    }),

                    columns: [
                        {
                            xtype: 'gridcolumn',
                            dataIndex: 'Name',
                            flex: 1,
                            text: 'Наименование из файла'
                        }
                    ],

                    plugins: [Ext.create('B4.ux.grid.plugin.HeaderFilters')],

                    dockedItems: [
                        {
                            xtype: 'b4pagingtoolbar',
                            store: store,
                            displayInfo: true,
                            dock: 'bottom'
                        },
                        {
                            xtype: 'toolbar',
                            dock: 'top',
                            items: [
                                {
                                    xtype: 'buttongroup',
                                    defaults: {
                                        margin: '2 0 2 0'
                                    },
                                    items: [
                                        {
                                            xtype: 'b4updatebutton'
                                        },
                                        {
                                            xtype: 'button',
                                            name: 'buttonLink',
                                            text: 'Сопоставить',
                                            iconCls: 'icon-page-copy',
                                            tooltip: 'Сопоставить значение из файла с данными системы'
                                        },
                                        {
                                            xtype: 'splitbutton',
                                            name: 'buttonLinkAuto',
                                            hidden: true,
                                            
                                            iconCls: 'icon-page-copy',
                                            text: 'Дополнить',
                                            tooltip: 'Сопоставить значение из файла с данными системы',
                                            handler: function() {
                                                this.showMenu();
                                            },
                                            menu: {
                                                xtype: 'menu',
                                                width: 310,
                                                collapseFirst: false,
                                                items: [
                                                    //{
                                                    //    xtype: 'menuitem',
                                                    //    text: 'Сопоставить значение из файла с данными системы',
                                                    //    name: 'autoLink1'
                                                    //},
                                                    {
                                                        xtype: 'menuitem',
                                                        text: 'Сопоставить данные без добавления',
                                                        name: 'autoLink2'
                                                    },
                                                    {
                                                        xtype: 'menuitem',
                                                        text: 'Сопоставить данные автоматически',
                                                        name: 'autoLink3'
                                                    },
                                                    {
                                                        xtype: 'menuitem',
                                                        text: 'Автоматически добавить улицы с названием "-"',
                                                        name: 'autoLink4'
                                                    },
                                                    {
                                                        xtype: 'menuitem',
                                                        text: 'Сделать наименования уникальными',
                                                        name: 'makeUnique'
                                                    },
                                                    {
                                                        xtype: 'menuitem',
                                                        text: 'Вернуть исходные наименования',
                                                        name: 'makeNonUnique'
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            xtype: 'button',
                                            name: 'buttonAdd',
                                            iconCls: 'icon-add',
                                            text: 'Добавить в систему',
                                            tooltip: 'Добавить в систему'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    xtype: 'splitter'
                },
                {
                    xtype: 'gridpanel',
                    flex: 1,
                    border: false,
                    name: 'rightGrid',
                    store: storeSearch,
                    tableName: null,

                    selModel: Ext.create('Ext.selection.CheckboxModel', {
                        checkOnly: true,
                        mode: 'SINGLE'
                    }),

                    columns: [
                        {
                            xtype: 'gridcolumn',
                            dataIndex: 'Name',
                            flex: 4,
                            text: 'Наименование в системе'
                        },
                        {
                            xtype: 'gridcolumn',
                            dataIndex: 'Code2',
                            flex: 1,
                            text: 'Примечание'
                        }
                    ],

                    dockedItems: [
                        {
                            xtype: 'b4pagingtoolbar',
                            store: storeSearch,
                            displayInfo: true,
                            dock: 'bottom'
                        },
                        {
                            xtype: 'toolbar',
                            dock: 'top',
                            items: [
                                {
                                    xtype: 'buttongroup',
                                    defaults: {
                                        margin: '2 0 2 0'
                                    },
                                    items: [
                                        {
                                            xtype: 'button',
                                            name: 'buttonSearch',
                                            text: 'Найти',
                                            iconCls: 'icon-magnifier',
                                            tooltip: 'Найти существующие значение в системе'
                                        },
                                        {
                                            xtype: 'textfield',
                                            name: 'rightFilterField',
                                            width: 250
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        me.callParent(arguments);
    }
});

