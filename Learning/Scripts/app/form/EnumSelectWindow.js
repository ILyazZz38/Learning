Ext.define('B4.form.EnumSelectWindow', {
    extend: 'B4.form.SelectWindow',

    alias: 'widget.b4enumselectwindow',

    requires: [
        'B4.ux.button.Save',
        'B4.ux.button.Close',
        'B4.ux.button.Update',
        'B4.ux.grid.Panel',
        'B4.ux.grid.toolbar.Paging',
        'B4.ux.grid.column.Delete',
        'B4.ux.grid.plugin.HeaderFilters'
    ],

    enumName: undefined,
    selectWindowCallback: undefined,

    width: 400,
    height: undefined,
    maxHeight: 400,

    initComponent: function () {
        var me = this;

        Ext.apply(me, {
            store: Ext.ClassManager.get(me.enumName).getStore(),
            columns: [
                {
                    dataIndex: 'Display',
                    flex: 1,
                    text: 'Наименование'
                }
            ],
            showPaging: false
        });

        this.callParent(arguments);
    }
});