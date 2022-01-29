/**
 * Аспект реализующий логику взаимодействия грида и окна редактирования/просмотра объектов из этого грида.
 * Фактически это тоже самое что и B4.aspects.GridEditForm, только работает с окном, а не с формой.
 *
 * Пример использования:
 * <pre>
 * requires: [
 *     'B4.aspects.GridEditWindow',
 * ],
 *
 * aspects: [{
 *     xtype: 'grideditwindowaspect',
 *     gridSelector: 'objectksgrid',
 *     editFormSelector: 'objectkswindow',
 *     modelName: 'Objectks',
 *     storeName: 'Objectks',
 *     editWindowView: 'Objectks.EditWindow'
 *  }]
 * </pre>
 */
Ext.define('B4.aspects.GridEditWindow', {
    extend: 'B4.aspects.GridEditForm',
    alias: 'widget.grideditwindowaspect',

    /**
     * @cfg {String} editWindowView
     * Имя класса окна, которое будет создаваться, если по editFormSelector ничего не найдется
     */
    editWindowView: null,

    /**
     * @cfg {String} editWindowContainerSelector
     * Имя класса контейнера в котором будет создаваться окно редактирования/просмотра записи грида.
     * Если не задано, то окно создается в самом гриде.
     * Эта опция конфига необходима, когда панель состоит из нескольких гридов,
     * например наботающих по схеме master-detail.
     */
    editWindowContainerSelector: null,
    uniqueIndex: undefined,

    constructor: function (config) {
        Ext.apply(this, config);
        this.callParent(arguments);

        this.addEvents(
            /**
            * @event beforewindowcreated
            * Срабатывает до создания компонента-окна
            * @param {Ext.Component} this            
            */
            'beforewindowcreated',
            /**
            * @event windowcreated
            * @param {B4.base.Aspect} this
            * @param {Ext.window.Window} wnd
            * @param {Ext.grid.Panel} grid
            * Событие вызывается при создании окна редактирования
            */
            'windowcreated'
        );

        this.on('aftersetformdata', this.onAfterSetFormData, this);

        this.on('savesuccess', this.onSaveSuccess, this);
    },

    /**
     * @method init
     */
    init: function (controller) {
        var actions = {};

        this.callParent(arguments);
        if (this.editFormSelector) {
            actions[this.editFormSelector + ' b4closebutton'] = {
                'click': {
                    fn: this.closeWindowHandler,
                    scope: this
                }
            };
        }

        controller.control(actions);
    },

    /**
     * @method getForm
     * Возвращает окно, найденное по селектору editFormSelector (теперь он должен указывать на окно, а не форму!)
     * Если не нашлось, то создает окно по классу editWindowView.
     * @override
     * @returns {Ext.window.Window}
     */
    getForm: function () {
        var me = this,
            grid = this.getGrid();

        if (me.editFormSelector) {
            var editWindow = this.componentQuery(me.editFormSelector);

            if (!editWindow) {
                me.fireEvent('beforewindowcreated', me);
                var renderTo = B4.getBody().getActiveTab();
                if (Ext.isString(me.editWindowContainerSelector)) {
                    renderTo = me.componentQuery(me.editWindowContainerSelector);
                    if (!renderTo)
                        throw "Не удалось найти контейнер для формы редактирования по селектору " + me.editWindowContainerSelector;
                }

                var editView = me.controller.getView(me.editWindowView);
                if (!editView)
                    throw "Не удалось найти вьюшку контроллера " + me.editWindowView;

                editWindow = editView.create({ constrain: true, renderTo: renderTo.getEl(), uniqueIndex: me.uniqueIndex });

                me.bindToParent(grid, editWindow);

                me.fireEvent('windowcreated', me, editWindow, grid);

                editWindow.show();
                editWindow.center();
            }

            return editWindow;
        }
        return null;
    },

    /**
     * @method bindToParent
     */
    bindToParent: function (grid, win) {
        grid.add(win);
        win.on('beforedestroy', function () {
            if (grid.floatingItems) {
                grid.floatingItems.removeAtKey(win.getId()); //#warning необходимость в этом отпадет с версией 4.2    
            }
        });
    },

    /**
     * @method closeWindowHandler
     */
    closeWindowHandler: function () {
        this.getForm().close();
    },

    /**
     * @method onAfterSetFormData
     */
    onAfterSetFormData: function (aspect, rec, form) {
        form.show();
    },

    /**
     * @method onSaveSuccess
     */
    onSaveSuccess: function () {
        this.closeWindowHandler(this.getForm());
    }
});