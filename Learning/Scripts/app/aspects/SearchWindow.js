Ext.define('B4.aspects.SearchWindow', {
    extend: 'B4.base.Aspect',

    alias: 'widget.searchwindow',

    buttonSelector: undefined, // селектор кнопки на форме
    extraParamName: undefined, // название дополнительных параметров для b4selectfield
    selectorsForProxy: undefined, // селекторы b4selectfield
    widget: undefined, // alias окна поиска
    complexFilterName: undefined, // название фильтра данного поиска
    otherFilterNames: [], // список остальных фильтров
    findEventName: 'find', // событие, которое вызывается при поиске
    filterOperand: CondExpr.operands.and, //оператор объединения фильтров
    gridSelector: undefined, // селектор грида, в котором отображаются данные поиска
    onlyOneBank: false, // не искать, если не выбрано более одного банка данных
    dataBankIdProperty: 'dataBankId', // наименование контекстного значения, хранящего 

    init: function (controller) {
        var me = this,
            actions = {};

        me.callParent(arguments);

        actions[me.buttonSelector] = {
            'click': {
                fn: me.onSearchClick,
                scope: me
            }
        };

        actions[me.widget] = {
            'find': {
                fn: me.find,
                scope: me
            }
        };

        controller.control(actions);
    },

    onSearchClick: function () {
        var me = this,
            extraParams,
            panel = B4.getBody().getActiveTab(),
            dataBankId = me.controller.getContextValue(panel, me.dataBankIdProperty);

        if (!dataBankId || (Ext.isIterable(dataBankId) && dataBankId.length === 0)) {
            Ext.Msg.alert('Поиск', 'Выберите хотя бы один банк данных для поиска!');
            return;
        }

        if ((Ext.isIterable(dataBankId) && dataBankId.length > 1) && me.onlyOneBank) {
            Ext.Msg.alert('Поиск', 'Для данного поиска необходимо выбрать только один банк данных!');
            return;
        }

        if (!me.widget) return;
        var win = me.componentQuery(me.gridSelector + ' ' + me.widget) || Ext.widget(me.widget);
        extraParams = me.controller.getContextValue(panel, me.extraParamName);

        Ext.iterate(me.selectorsForProxy, function (selector) {
            win.down(selector).getStore().getProxy().setExtraParam(me.extraParamName, extraParams);
        });

        panel.add(win);
        win.show();
        win.center();
    },

    find: function (win, findInFinded) {
        var me = this,
            view = me.controller.getMainView(),
            grid = Ext.ComponentQuery.query(me.gridSelector)[0],
            filters = [],
            oldFilters;

        me.getFilters(win, filters);

        if (findInFinded) {
            oldFilters = me.controller.getContextValue(view, me.complexFilterName);
            if (oldFilters) {
                filters = filters.concat(oldFilters);
            }
        } else {
            Ext.iterate(me.otherFilterNames, function (filterName) {
                me.controller.setContextValue(view, filterName, undefined);
            });
        }
        me.controller.setContextValue(me.complexFilterName, filters);
        grid.fireEvent(me.findEventName, win, me.complexFilterName, { Group: me.filterOperand, Filters: filters }, findInFinded, null, null);

        win.close();
    },

    getFilters: function (item, filters) {
        var me = this;
        Ext.iterate(item.items.items, function (subitem) {
            if (subitem.items && Ext.isIterable(subitem.items.items)) {
                me.getFilters(subitem, filters);
            } else {
                if (!subitem.dataIndex) return;
                var value = subitem.hasCustomValue ? subitem.customValue : subitem.getValue();
                if ((value || typeof (value) == 'number' || (subitem.hasCustomValue && value === false)) && (!Ext.isIterable(value) || value.length > 0)) {
                    var targetValue = undefined;
                    if (subitem.targetField) {
                        targetValue = subitem.up('window').down(subitem.targetField).getValue();
                    }
                    if (targetValue && (!Ext.isIterable(targetValue) || targetValue.length > 0)) {
                        // если есть ограничение сверху на значение
                        if (Ext.isIterable(value)) {
                            var filterGroup = [];
                            Ext.iterate(value, function (valueItem) {
                                filterGroup.push({ DataIndex: subitem.dataIndex, Operand: subitem.altOp, Value: valueItem });
                            });
                            filters.push({ Group: CondExpr.operands.or, Filters: filterGroup });
                        } else {
                            filters.push({ DataIndex: subitem.dataIndex, Operand: subitem.altOp, Value: value });
                        }
                    } else {
                        if (Ext.isIterable(value)) {
                            var filterGroup = [];
                            Ext.iterate(value, function (valueItem) {
                                filterGroup.push({ DataIndex: subitem.dataIndex, Operand: subitem.op, Value: valueItem });
                            });
                            filters.push({ Group: CondExpr.operands.or, Filters: filterGroup });
                        } else {
                            filters.push({ DataIndex: subitem.dataIndex, Operand: subitem.op, Value: value });
                        }
                    }
                }
            }
        });
    }
});