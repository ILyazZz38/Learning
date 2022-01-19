/*
    Панель сопоставленных данных
*/
Ext.define('B4.form.LinkedPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.b4linkedpanel',
    alternateClassName: ['B4.LinkedPanel'],

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
    
    initComponent: function () {
        var me = this;
        var store = Ext.create('B4.store.administration.loadfromfile.FilesUpload', {
            proxy: {
                type: 'b4proxy',
                controllerName: 'Loader',
                listAction: 'GetLinkedData'
            }
        });
        
        Ext.applyIf(me, {
            items: [
                {
                    xtype: 'gridpanel',
                    flex: 1,
                    border: false,
                    
                    store: store,
                    tableName: null,
                    
                    columns: [
                        {
                            xtype: 'gridcolumn',
                            dataIndex: 'Name',
                            flex: 3,
                            filter: {
                                xtype: 'textfield'
                            },
                            text: 'Наименование из файла'
                        },
                        {
                            xtype: 'gridcolumn',
                            dataIndex: 'Code',
                            flex: 3,
                            filter: {
                                xtype: 'textfield'
                            },
                            text: 'Наименование в системе'
                        },
                        {
                            xtype: 'gridcolumn',
                            dataIndex: 'Code2',
                            flex: 1,
                            text: 'Примечание'
                        },
                        {
                            xtype: 'b4deletecolumn'
                        }
                    ],
                    
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
                                        }
                                    ]
                                }
                            ]
                        }
                    ],

                    plugins: [Ext.create('B4.ux.grid.plugin.HeaderFilters')]
                }
            ]
        });

        me.callParent(arguments);
    }
});

