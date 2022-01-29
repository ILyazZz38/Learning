Ext.define('B4.form.dict.UnloadTemplateList', {
    extend: 'B4.form.Window',
    alias: 'widget.unloadTemplateList',

    width: 600,
    height: 400,
    layout: 'anchor',
    title: 'Список шаблонов',

    modal: true,
    selectionCallBack: undefined,
    hideTaskId: true,

    requires: [
        'B4.ux.button.Close',
        'B4.form.MonthPicker',
        'B4.ux.button.Save',
        'B4.ux.button.Update',
        'B4.form.ComboBox',
        'B4.ux.grid.column.Enum',
        'B4.form.ComboBox',
        'Ext.selection.CheckboxModel',
        'B4.enums.UnloadTypes',
        'B4.ux.grid.toolbar.Paging'
    ],

    listeners: {
        afterrender: function (view) {
            var grid = view.down('gridpanel');

            grid.getStore().load();
        }
    },

    initComponent: function () {
        var me = this,
            store = Ext.create('B4.store.dict.UnloadTemplate');

        Ext.applyIf(me, {
            items: [
                {
                    xtype: 'gridpanel',
                    store: store,
                    selModel: Ext.create('Ext.selection.CheckboxModel', {
                        mode: 'SINGLE'
                    }),
                    layout: 'fit',
                    anchor: '0 0',
                    columns: [
                        {
                            xtype: 'gridcolumn',
                            dataIndex: 'Name',
                            flex: 1,
                            text: 'Наименование',
                            filter: {
                                xtype: 'textfield'
                            }
                        },
                        {
                            xtype: 'b4enumcolumn',
                            width: 200,
                            text: 'Тип выгрузки',
                            dataIndex: 'TaskId',
                            enumName: 'B4.enums.UnloadTypes',
                            filter: true,
                            hidden: me.hideTaskId
                        },
                        {
                            xtype: 'gridcolumn',
                            dataIndex: 'CreatedByName',
                            flex: 1,
                            text: 'Кем создан',
                            filter: {
                                xtype: 'textfield'
                            }
                        }
                    ],
                    plugins: [
                        Ext.create('B4.ux.grid.plugin.HeaderFilters', { pluginId: 'filter' })
                    ],
                    viewConfig: {
                        loadMask: true
                    },
                    listeners: {
                        itemdblclick: function (dv, record, item, index, e) {
                            var view = dv.up('window');

                            if (view.selectionCallBack) {
                                view.selectionCallBack(record);
                            }

                            view.close();
                        }
                    }
                }
            ],
            dockedItems: [
                {
                    xtype: 'b4pagingtoolbar',
                    displayInfo: true,
                    store: store,
                    dock: 'bottom'
                },
                {
                    xtype: 'toolbar',
                    dock: 'top',
                    items: [
                        {
                            xtype: 'buttongroup',
                            items: [
                                {
                                    xtype: 'button',
                                    text: 'Выбрать',
                                    iconCls: 'icon-accept',
                                    listeners: {
                                        click: function (btn) {
                                            var view = btn.up('window'),
                                                grid = view.down('gridpanel'),
                                                selection = grid.getSelectionModel().getSelection()[0];

                                            if (!selection) {
                                                B4.QuickMsg.msg('Внимание', 'Выберите значение', 'warning');
                                                return;
                                            }

                                            if (view.selectionCallBack) {
                                                view.selectionCallBack(selection);
                                            }

                                            view.close();
                                        }
                                    }
                                }
                            ]
                        },
                        {
                            xtype: 'container',
                            flex: 1
                        },
                        {
                            xtype: 'buttongroup',
                            items: [
                                {
                                    xtype: 'b4closebutton',
                                    listeners: {
                                        click: function (btn) {
                                            btn.up('window').close();
                                        }
                                    }
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