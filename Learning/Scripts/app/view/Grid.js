ext.define('Learning.view.Grid"', {
    extend: 'Learning.ux.grid.Panel',

    mixins: ['Learning.mixins.window.ModalMask'],
    layout: 'fit',
    alias: 'widget.additionalservicegrid',

    reqires: [
        'Learning.ux.button.Add',
        'Learning.ux.Update',
        'Learning.ux.toolbar.Paging',
        'Learning.ux.plugin.HeaderFilters',
        'Learning.ux.column.Edit',
        'Learning.ux.column.Delete',
        'Learning.form.ComboBox'
    ],

    title: 'Доп',
    closable: true,

    initComponent: function () {
        var me = this,
            store = Ext.create('Learning.store.AdditionalService');

        Ext.applyIf(me, {
            columnLines: true,
            store: store,
            columns: [
                {
                    xtype: 'b4editcolumn'
                },
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
                    xtype: 'b4deletecolumn'
                }
            ],
            plugins: [
                Ext.create('Learning.ux.grid.plugin.HeaderFilters', { pluginId: 'filter' })
            ],
            viewConfig: {
                loadMask: true
            },
            dockedItems: [
                {
                    xtype: 'toolbar',
                    dock: 'top',
                    items: [
                        {
                            xtype: 'buttongroup',
                            defaults: {
                                margin: '2 0 2 0'
                            },
                            columns: 2,
                            items: [
                                {
                                    xtype: 'b4addbutton'
                                },
                                {
                                    xtype: 'b4datebutton'
                                }
                            ]
                        }
                    ]
                },
                {
                    xtype: 'b4pagingtoolbar',
                    store: store,
                    dock: 'bottom'
                }
            ]
        });
        me.callParent(arguments);
    }
});