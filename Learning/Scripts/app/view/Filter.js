Ext.define('Learning.view.CitizenList', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.filter',

    title: 'Реестр граждан',
    store: 'CitizenStore',

    init: function () {
        this.dockedItems = Ext.create('Ext.panel.Panel', {
            dock: 'left',
            items: [
                {
                    xtype: 'panel',
                    title: 'Внутренняя панель 1',
                    flex: 1,
                }
            ]
        });

        //this.callParent(arguments);
    }
});