Ext.define('B4.aspects.DataPermissionGridMultiSelectWindow', {
    extend: 'B4.aspects.GkhGridMultiSelectWindow',

    alias: 'widget.datapermissiongridmultiselectwindowaspect',

    mainViewSelector: undefined,
    permissionType: undefined,
    selectGridFilter: undefined,
    serviceName: undefined,
    methodName: undefined,
    isWrappedInBaseResult: true,
    showSelectAll: false,
    isAllowedColumn: false,
    beforeLoadParams: {},

    columnsGridSelect: [
        {
            header: 'Наименование',
            xtype: 'gridcolumn',
            dataIndex: 'Name',
            flex: 1,
            filter: {
                xtype: 'textfield'
            }
        }
    ],
    columnsGridSelected: [
        {
            header: 'Наименование',
            xtype: 'gridcolumn',
            dataIndex: 'Name',
            flex: 1
        }
    ],

    init: function (controller) {
        var me = this,
            actions = {};

        me.callParent(arguments);

        actions[me.multiSelectWindowSelector + '[numberWindow=' + me.numberWindow + '] button[name=SelectAll]'] = {
            'click': {
                fn: me.selectAll,
                scope: me
            }
        };
        actions[me.multiSelectWindowSelector + '[numberWindow=' + me.numberWindow + '] button[name=DeselectAll]'] = {
            'click': {
                fn: me.deselectAll,
                scope: me
            }
        };

        me.otherActions(actions);
        controller.control(actions);
    },

    gridAction: function (grid, action) {
        var me = this;

        switch (action.toLowerCase()) {
            case 'add':
                {
                    me.getForm(grid).show();
                    me.updateSelectGrid();
                }
                break;
            case 'update':
                me.updateGrid();
                break;
        }
    },

    selectAll: function (btn) {
        var me = this,
            view = btn.up('window'),
            leftGrid = view.down('gridpanel[name=multiSelectGrid]'),
            leftStore = leftGrid.getStore(),
            params = leftStore.getProxy().extraParams;

        Ext.Msg.confirm('Внимание', 'Вы действительно хотите отметить все записи?', function (ans) {
            if (ans == 'yes') {
                params.serviceName = me.serviceName;
                params.methodName = me.methodName;
                params.type = me.permissionType;
                params.isWrappedInBaseResult = me.isWrappedInBaseResult;
                params.complexFilter = Ext.encode(leftGrid.headerFilterPlugin.getFilters());
                if (leftStore.filters.items.length) {
                    var filter = leftStore.filters.items[0],
                        filterRes = {};
                    filterRes[filter.property] = filter.value;
                    params.filters = Ext.encode(filterRes);
                }

                view.getEl().mask('Загрузка...');
                B4.Ajax.request({
                    url: B4.Url.action('/DataRole/SelectAll'),
                    params: params,
                    timeout: 99999999
                }).next(function () {
                    view.close();
                    view.grid.getStore().load();
                }).error(function () {
                    view.getEl().unmask();
                    B4.QuickMsg.msg('Внимание', 'При выполнении операции произошла ошибка', 'warning');
                });
            }
        });
    },

    deselectAll: function (btn) {
        var me = this,
            view = btn.up('window'),
            leftGrid = view.down('gridpanel[name=multiSelectGrid]'),
            leftStore = leftGrid.getStore(),
            params = leftStore.getProxy().extraParams;

        Ext.Msg.confirm('Внимание', 'Вы действительно хотите снять все отметки?', function (ans) {
            if (ans == 'yes') {
                params.type = me.permissionType;

                view.getEl().mask('Загрузка...');
                B4.Ajax.request({
                    url: B4.Url.action('/DataRole/DeselectAll'),
                    params: params,
                    timeout: 99999999
                }).next(function () {
                    view.close();
                    view.grid.getStore().load();
                }).error(function () {
                    view.getEl().unmask();
                    B4.QuickMsg.msg('Внимание', 'При выполнении операции произошла ошибка', 'warning');
                });
            }
        });
    },

    onRowSelect: function (rowModel, record) {
        var me = this,
            grid = me.getSelectedGrid(),
            storeSelected;

        if (grid) {
            storeSelected = grid.getStore();

            if (storeSelected.find(me.idProperty, record.get(me.idProperty), 0, false, false, true) == -1) {
                record.set('IsAllowed', true);
                record.commit();
                storeSelected.add(record);
                grid.down('[ref=status]').setText(storeSelected.getCount() + ' записи');
            }
        }
    },

    onCloseWindowHandler: function (btn) {
        btn.up('window').close();
    },

    getForm: function (grid) {
        var me = this,
            mainView = grid ? grid.up(me.mainViewSelector) : undefined,
            win = Ext.ComponentQuery.query(me.multiSelectWindowSelector)[0],
            roleId = me.controller.getContextValue(grid, 'roleId'),
            stSelected,
            stSelect;

        if (win && !win.getBox().width) {
            win = win.destroy();
        }

        if (!win) {
            stSelected = me.storeSelected instanceof Ext.data.AbstractStore ? me.storeSelected : Ext.create('B4.store.' + me.storeSelected, { autoLoad: false });
            stSelected.on('beforeload', me.onSelectedBeforeLoad, me);

            stSelect = me.storeSelect instanceof Ext.data.AbstractStore ? me.storeSelect : Ext.create('B4.store.' + me.storeSelect);
            var stSelectProxy = stSelect.getProxy();
            stSelectProxy.setExtraParam('roleId', roleId);
            stSelectProxy.setExtraParam('notAny', true);
            Ext.iterate(me.beforeLoadParams, function (item) {
                stSelectProxy.setExtraParam(item, me.beforeLoadParams[item]);
            });

            if (me.selectGridFilter) {
                stSelect.filters.items.push(me.selectGridFilter);
            }

            win = Ext.create('B4.view.' + me.multiSelectWindow, {
                showSelectAll: me.showSelectAll,
                itemId: me.multiSelectWindowSelector.replace('#', ''),
                numberWindow: me.numberWindow,
                storeSelect: stSelect,
                storeSelected: stSelected,
                columnsGridSelect: me.columnsGridSelect,
                columnsGridSelected: me.columnsGridSelected,
                title: me.titleSelectWindow,
                titleGridSelect: me.titleGridSelect,
                titleGridSelected: me.titleGridSelected,
                selModelMode: me.selModelMode,
                constrain: true,
                modal: false,
                closeAction: 'destroy',
                renderTo: B4.getBody().getActiveTab().getEl(),
                isAllowedColumn: me.isAllowedColumn,
                grid: grid
            });
            stSelect.on('load', me.onLoad, me);

            win.on('afterrender', me.formAfterrender, me);

            if (Ext.isNumber(me.multiSelectWindowWidth) && win.setWidth) {
                win.setWidth(me.multiSelectWindowWidth);
            }

            //Короче Данная форма масоового выбора Может быть одновременно открыта
            //В нескольких вкладках, соответсвенно Если Открыть 1ю форму и отсортировать по колонке
            //Затем открыть следующую форму массового выбора, где такой отсортированной колонки НЕТ,
            //То возникает такая ситуация Что в только что созданный стор Сортировка всеравно попадает
            //И соответтсвенно после первого вызова load у Стора на серверный метод уходит также и сортировка (Которой быть там недолжно)
            //Благодаря такой очистке мы можем Открывать сколько угодно одновременных форм и фильтроват ьи сортировать их независимо друг от друга
            stSelected.sorters.clear();
            stSelect.sorters.clear();

            //Сохраняем идентификатор роли
            if (mainView) {
                me.controller.setContextValue(win, 'roleId', me.controller.getContextValue(mainView, 'roleId'));
            }
        }

        return win;
    },

    onBeforeLoad: function (store, operation, grid) {
        var me = this,
            roleId = me.controller.getContextValue(grid, 'roleId');

        operation.params.roleId = roleId;
        operation.params.notAny = true;
        Ext.applyIf(operation.params, me.beforeLoadParams);
    },

    onSelectRequestHandler: function (btn) {
        var me = this,
            view = btn.up('window'),
            roleId = me.controller.getContextValue(view, 'roleId'),
            grid = me.getSelectedGrid(),
            storeSelected;

        if (grid) {
            storeSelected = grid.getStore();
            view.getEl().mask('Сохранение...');
            B4.Ajax.request({
                url: B4.Url.action('AddRoleCodes', 'DataRole'),
                params: {
                    roleId: roleId,
                    type: me.permissionType,
                    list: Ext.encode(storeSelected.getRange().map(function (item) { return { Id: item.get('Id'), Name: item.get('Name'), IsAllowed: item.get('IsAllowed') } }))
                }
            }).next(function (resp) {
                view.getEl().unmask();
                var response = Ext.decode(resp.responseText);
                if (response.success) {
                    B4.QuickMsg.msg('Выполнено', 'Данные успешно сохранены', 'success');
                } else {
                    B4.QuickMsg.msg('Внимание', 'При выполнении операции произошла ошибка', 'warning');
                }
                me.getForm().close();
                me.reloadUsingViewStores();
            }).error(function () {
                view.getEl().unmask();
                B4.QuickMsg.msg('Внимание', 'При выполнении операции произошла ошибка', 'warning');
            });
        }
    },

    deleteRecord: function (record, grid) {
        var me = this,
            view = grid.up(me.mainViewSelector),
            roleId = me.controller.getContextValue(view, 'roleId');

        Ext.Msg.confirm('Удаление записи!', 'Вы действительно хотите удалить запись?', function (res) {
            if (res == 'yes') {
                grid.getEl().mask('Удаление...');
                B4.Ajax.request({
                    url: B4.Url.action('DeleteCodeByTypeAndRole', 'DataRole'),
                    params: {
                        roleId: roleId,
                        type: me.permissionType,
                        code: record.getId(),
                        name: !record.get('Name') ? record.get('Address') : record.get('Name')
                    }
                }).next(function (resp) {
                    grid.getEl().unmask();
                    var response = Ext.decode(resp.responseText);
                    if (response.success) {
                        B4.QuickMsg.msg('Выполнено', 'Данные успешно удалены', 'success');
                    } else {
                        B4.QuickMsg.msg('Внимание', 'При выполнении операции произошла ошибка', 'warning');
                    }
                    me.reloadUsingViewStores();
                }).error(function () {
                    grid.getEl().unmask();
                    B4.QuickMsg.msg('Внимание', 'При удалении произошла ошибка', 'warning');
                });
            }
        }, me);
    },

    updateGrid: function () { }
});