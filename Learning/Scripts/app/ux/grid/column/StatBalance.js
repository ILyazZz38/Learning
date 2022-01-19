/*
    Кнопка "Статистика по начислениям"
*/
Ext.define('B4.ux.grid.column.StatBalance', {
    extend: 'Ext.grid.column.Action',
    alias: ['widget.b4statbalancecolumn'],
    alternateClassName: 'B4.grid.StatBalanceColumn',

    hideable: false,

    tooltip: "Статистика по начислениям",

    constructor: function (config) {
        config.width = 20;

        this.callParent([config]);
    },

    /**
    * @cfg {String} iconCls
    * A CSS class to apply to the icon image. To determine the class dynamically, configure the Column with
    * a `{@link #getClass}` function.
    */
    icon: B4.Url.content('content/img/icons/shape_align_bottom.png'),  //shape_align_bottom.png, map.png

    /**
    * @cfg {Function} handler
    * A function called when the icon is clicked.
    * @cfg {Ext.view.Table} handler.view The owning TableView.
    * @cfg {Number} handler.rowIndex The row index clicked on.
    * @cfg {Number} handler.colIndex The column index clicked on.
    * @cfg {Object} handler.item The clicked item (or this Column if multiple {@link #cfg-items} were not configured).
    * @cfg {Event} handler.e The click event.
    */
    handler: function (gridView, rowIndex, colIndex, el, e, rec) {
        var scope = this.origScope;

        // Если scope не задан в конфиге, то берем грид которому принадлежит наша колонка
        if (!scope)
            scope = this.up('grid');

        scope.fireEvent('rowaction', scope, 'statbalance', rec);
    }
});