/**
*   @class B4.form.SelectGrid
*
*   Грид, значения которого выбираются из справочника
* 
*   # Example usage:
*st
*   // Параметр model необходимо определять, если не определен параметр store
*   @example
*   {
*       xtype: 'b4selectfield',
*       listView: 'B4.view.Author.Grid',
*       textProperty: 'Name',
*       name: 'Author',
*       store: 'B4.store.Author',
*       model: 'B4.model.Author'
*   } 
*
*/
Ext.define('B4.form.SelectGrid', {
    extend: 'B4.ux.grid.Panel',
    alias: 'widget.b4selectgrid',
    alternateClassName: ['B4.SelectGrid'],

    requires: ['Ext.grid.Panel', 'B4.ux.grid.plugin.HeaderFilters'],

    /**
    * @cfg {Boolean} allowBlank
    * Флаг: разрешено ли пустое значение поля
    */
    allowBlank: true,

    /**
    * @cfg {String} listView
    * Представление, которое используется для отображения данных справочника
    */
    listView: null,

    /**
    * @cfg {String} listRenderTo
    * Селектор, с помощью которого запрашивается контейнер окна выбора
    */
    windowContainerSelector: null,

    /**
    * @cfg {String} listRenderTo
    * Открывать ли окно выбора модально
    */
    modalWindow: false,

    /**
    * @cfg {Object} windowCfg
    * Параметры конфигурации окна выбора
    */
    windowCfg: null,

    /**
    * @cfg {String} editView
    * Представление, которое используется для редактирования данных справочника
    */
    editView: null,

    /**
    * @cfg {String/Object} store
    * Store
    * Нельзя задавать storeId, если store заранее не был создан
    */
    store: null,

    /**
    * @cfg {"SINGLE"/"MULTI"/"SIMPLE"} selectionMode
    * Режим выбора для Ext.selection.CheckboxModel: SINGLE, MULTI, SIMPLE
    * Поведение каждого из режимов описано в доках к Ext.selection.Model.mode
    */
    selectionMode: 'SINGLE',

    /**
    * @cfg {String} title
    * Заголовок для окна выбора
    */
    title: 'Выбор элемента',

    idProperty: 'Id',

    textProperty: 'Name',

    /**
    * @cfg {Bool} isGetOnlyIdProperty return only idProperty value
    */
    isGetOnlyIdProperty: true,

    /**
    * @cfg {Object} columns
    * Столбцы таблицы
    */
    columns: null,

    trigger1Cls: 'x-form-search-trigger',
    trigger2Cls: 'x-form-clear-trigger',

    /**
    * Метод для получения store
    * @return {B4.base.Store} store  
    */
    getStore: function () {
        return this.store;
    },

    constructor: function () {
        var me = this;

        me.callParent(arguments);

        me.addEvents(
            /**
             * @event beforeload
             * Срабатывает перед загрузкой данных в форму выбора
             * @param {Ext.Component} this
             * @param {Ext.data.Store} store
             * @param {Ext.data.Operation} operation
             */
            'beforeload',
            /**
            * @event gridcreated
            * Срабатывает после создания компоннта-списка
            * @param {Ext.Component} this
            * @param {Ext.Component} grid
            */
            'gridcreated',
            /**
            * @event beforewindowcreated
            * Срабатывает до создания компонента-окна
            * @param {Ext.Component} this            
            */
            'beforewindowcreated',
            /**
            * @event windowcreated
            * Срабатывает после создания компонента-окна
            * @param {Ext.Component} this
            * @param {Ext.window.Window} wnd
            */
            'windowcreated',
            /**
            * @event beforeselect
            * Срабатывает при нажатии на кнопку 'Выбрать' до того как будет создан грид и загружеы данные
            * @param {Ext.Component} this            
            */
            'beforeselect',
            /**
            * @event beforeclear
            * Срабатывает при нажатии на кнопку 'Очистить' до того как будет очищено текущее значение
            * @param {Ext.Component} this            
            */
            'beforeclear'
        );


        // выносим конфигурацию тулбара дабы не дублировать ее
        Ext.apply(me, {
            _toolbarSelectBtnConfig: {
                xtype: 'buttongroup',
                columns: 2,
                items: [
                    {
                        xtype: 'button',
                        text: 'Выбрать',
                        iconCls: 'icon-accept',
                        handler: me.onSelectValue,
                        scope: me
                    }
                ]
            },
            _toolbarCloseBtnConfig: {
                xtype: 'buttongroup',
                columns: 1,
                items: [
                    {
                        xtype: 'button',
                        text: 'Закрыть',
                        iconCls: "icon-decline",
                        handler: me.onSelectWindowClose,
                        scope: me
                    }
                ]
            },
            _toolbarSelectAllBtnConfig: {
                xtype: 'button',
                text: 'Выбрать все',
                iconCls: 'icon-basket-add',
                handler: me.onSelectAll,
                scope: me
            }
        });
    },

    initComponent: function () {
        var me = this,
            store = me.store;

        // подготовка хранилища, если передано како-либо значение
        if (store) {
            // если передана строка
            if (Ext.isString(store)) {
                // сначала пробуем найти хранилище по его имени
                me.store = Ext.StoreMgr.lookup(store);
                if (Ext.isEmpty(me.store)) {
                    // иначе считаем что передано имя класса
                    me.store = Ext.create(store);
                }
            }
        } else if (me.model && Ext.isString(me.model)) {
            me.store = Ext.create('B4.base.Store', {
                model: me.model,
                autoLoad: false,
                groupField: me.storeGroupField || null
            });
        } else {
            me.store = Ext.StoreMgr.lookup('ext-empty-store');
        }

        if (!Ext.isEmpty(me.store) && Ext.isFunction(me.store.on)) {
            me.store.on('beforeload', me.onStoreBeforeLoad, me);
        }

        me.callParent(arguments);
    },

    onStoreBeforeLoad: function (store, operation) {
        var me = this, options = {};
        options.params = operation.params || {};
        me.fireEvent('beforeload', me, options, store);
        Ext.apply(operation, options);
    },

    destroy: function () {
        var me = this;
        if (me.store) {
            me.store.un('beforeload', me.onStoreBeforeLoad);
        }

        if (me.selectWindow) {
            me.selectWindow.destroy();
        }
        me.callParent(arguments);
    },

    _makeSelectionModel: function () {
        var me = this,
            mode = me.selectionMode.toUpperCase(),
            tooltip = Ext.create('Ext.tip.ToolTip', {
                html: 'Выбрать все отображаемые записи'
            });

        var selModel = Ext.create('Ext.selection.CheckboxModel', {
            mode: me.selectionMode,
            checkOnly: me.selectionMode == 'MULTI',
            multipageSelection: {},
            getSelected: function () {
                return this.multipageSelection;
            },
            listeners: {
                selectionchange: function (selectionModel, selectedRecords) {
                    if (selectedRecords.length == 0 && this.store.loading == true && this.store.currentPage != this.page) {
                        return;
                    }

                    if (this.store.loading == true) {
                        this.multipageSelection = {};
                        return;
                    }

                    this.store.data.each(function (i) {
                        Ext.Object.each(this.getSelected(), function (property, value) {
                            if (i.id === value.id) {
                                delete this.multipageSelection[property];
                            }
                        }, this);
                    }, this);

                    if (me.selectionMode.toUpperCase() == 'SINGLE') {
                        Ext.each(selectedRecords, function (i) {
                            this.multipageSelection[0] = i;
                        }, this);
                    } else {
                        Ext.each(selectedRecords, function (i) {
                            if (!Ext.Object.getKey(this.multipageSelection, i))
                                this.multipageSelection[Ext.Object.getSize(this.multipageSelection)] = i;
                        }, this);
                    }
                },
                buffer: 5
            },
            restoreSelection: function () {
                if (!this.store) this.store = me.store;
                this.store.data.each(function (item) {
                    Ext.Object.each(this.getSelected(), function (property, value) {
                        if (item.id === value.id) {
                            this.select(item, true, true);
                        }
                    }, this);
                }, this);
                this.page = this.store.currentPage;
            }
        });

        return selModel;
    },

    /**
    * Показываем окно со справочником
    */
    onTrigger1Click: function () {
        var me = this,
            mode = me.selectionMode.toUpperCase();

        if (me.fireEvent('beforeselect', me) === false) {
            return false;
        }
        // флаг необходимости опустить создание тулбара окна
        var doNotCreateWindowToolbar = false;

        if (Ext.isString(mode)) {
            if (mode != 'SINGLE' && mode != 'MULTI') {
                console.error('Config error:', 'incorrect selection mode');
                return;
            }
        }

        if (mode === 'MULTI' && !me.isRendered) {
            me._toolbarSelectBtnConfig.items.push(me._toolbarSelectAllBtnConfig);
            me.isRendered = true;
        }

        // если предтавление списка отсутствует
        if (Ext.isEmpty(me.gridView)) {
            var gridCreated = false;

            // в случае передачи полного имени класса представления списка
            if (Ext.isString(me.listView)) {
                // создаем необходимый класс,
                // предоставляя модель выбора
                me.gridView = Ext.create(me.listView, {
                    title: null,
                    border: false,
                    closable: false,
                    store: me.store,
                    selModel: me._makeSelectionModel()
                });
                gridCreated = true;
                // если внутри грида перепределяется стор
                if (Ext.isFunction(me.gridView.getStore)) {
                    var gridStore = me.gridView.getStore();
                    if (gridStore) {
                        me.store = gridStore;
                        me.store.un('beforeload', me.onStoreBeforeLoad, me);
                        me.store.on('beforeload', me.onStoreBeforeLoad, me);
                    } else {
                        me.gridView.reconfigure(me.store);
                    }
                }
            }
            else if (Ext.isObject(me.listView) && me.listView.isComponent) {
                // и этот объект является компонентом, то просто его используем
                me.gridView = me.listView;
                // причем необходимо подменить ссылку на хранилище
                me.store = me.listView.store;
            }
            else {
                // иначе считаем что передана конфигурация виджета, либо не передано ничего
                var columns = (Ext.isObject(me.listView) ? me.listView.columns : []) || [];
                // если столбцы не переданы, но переданы отдельно в конфигурации SelectField
                if (Ext.isEmpty(columns)) {
                    if (Ext.isArray(me.columns)) {
                        columns = me.columns;
                    } else if (Ext.isObject(me.columns)) {
                        columns = [me.columns];
                    }
                    // если столбцы не переданы, создаем один столбец
                    // содержащий данные поля textProperty
                    if (Ext.isEmpty(columns)) {
                        columns.push({
                            xtype: 'gridcolumn',
                            dataIndex: me.textProperty,
                            header: 'Наименование',
                            flex: 1
                        });
                    }
                }
                var cfg = Ext.apply({}, me.listView || {});
                Ext.applyIf(cfg, {
                    xtype: 'gridpanel',
                    plugins: [Ext.create('B4.ux.grid.plugin.HeaderFilters')],
                    features: me.features || [],
                    dockedItems: [
                        {
                            xtype: 'pagingtoolbar',
                            displayInfo: true,
                            store: me.store,
                            dock: 'bottom'
                        }
                    ]
                });

                Ext.apply(cfg, {
                    title: null,
                    border: false,
                    store: me.store,
                    columns: columns,
                    selModel: me._makeSelectionModel()
                });
                me.gridView = Ext.widget(cfg);
                gridCreated = true;
            }

            // при создании грида необходимо выполнить дополнительные действия
            if (gridCreated) {
                // если у грида есть собственный тулбар, необходимо модифицировать его
                var gridToolbar = me.gridView.getDockedItems('toolbar[dock="top"]');
                if (gridToolbar && gridToolbar.length) {
                    doNotCreateWindowToolbar = true;
                    gridToolbar = gridToolbar[0];
                    gridToolbar.insert(0, me._toolbarSelectBtnConfig);
                    gridToolbar.add('->');
                    gridToolbar.add(me._toolbarCloseBtnConfig);
                }
                me.fireEvent('gridcreated', me, me.gridView);
            }
        }

        me.store.on('load', me.gridView.getSelectionModel().restoreSelection, me.gridView.getSelectionModel());
        if (mode === 'SINGLE') {
            me.gridView.on('itemdblclick', function (grid, record) {
                grid.getSelectionModel().multipageSelection[0] = record;
                grid.getSelectionModel().select(record, true, true);
                return me.onSelectValue.apply(me, arguments);
            }, me);
        }

        me.store.load();

        me.gridView.getSelectionModel().deselectAll(true);

        // Создаем окно со справочником, если еще не создано
        if (!me.selectWindow) {
            var wndConfig = {};
            if (Ext.isObject(me.windowCfg))
                Ext.apply(wndConfig, me.windowCfg);

            me.fireEvent('beforewindowcreated', me, wndConfig);

            var renderTo = Ext.getBody();
            if (Ext.isString(me.windowContainerSelector)) {
                renderTo = Ext.ComponentQuery.query(me.windowContainerSelector);
                if (Ext.isArray(renderTo))
                    renderTo = renderTo[0];

                if (!renderTo)
                    throw "Не удалось найти контейнер для формы списка по селектору " + me.windowContainerSelector;

                renderTo = Ext.isFunction(renderTo.getEl) ? renderTo.getEl() : (renderTo.dom ? renderTo : null);
            }

            Ext.applyIf(wndConfig, {
                height: 500,
                width: 600,
                constrain: true,
                renderTo: renderTo,
                modal: me.modalWindow == true,
                layout: 'fit',
                title: me.title
            });

            Ext.apply(wndConfig, {
                items: [me.gridView],
                listeners: {
                    close: function () {
                        delete me.gridView;
                        delete me.selectWindow;
                    }
                },
                dockedItems: doNotCreateWindowToolbar ? [] : [
                    {
                        xtype: 'toolbar',
                        dock: 'top',
                        items: [
                            me._toolbarSelectBtnConfig,
                            '->',
                            me._toolbarCloseBtnConfig
                        ]
                    }
                ]
            });

            me.selectWindow = Ext.create('Ext.window.Window', wndConfig);

            me.fireEvent('windowcreated', me, me.selectWindow);
        }

        me.selectWindow.show();
        me.selectWindow.center();
    },

    /**
    * Очищаем поле
    */
    onTrigger2Click: function () {
        var me = this;

        if (me.fireEvent('beforeclear', me) === false) {
            return;
        }

        me.setValue(null);
        me.updateDisplayedText();
    },

    /**
    * Обработка события закрытия окна выбора
    */
    onSelectWindowClose: function () {
        delete this.gridView;
        this.selectWindow.close();
        delete this.selectWindow;
    },

    /**
    * Обработка события выбора значения
    */
    onSelectValue: function () {
        var me = this,
            rec = me.gridView.getSelectionModel().getSelected();

        if (!rec || rec.length == 0) {
            Ext.Msg.alert('Ошибка', 'Необходимо выбрать запись!');
            return;
        }

        if (me.selectionMode.toUpperCase() == 'SINGLE') {
            rec = rec[0];
            if (Ext.isEmpty(rec)) {
                Ext.Msg.alert('Ошибка', 'Необходимо выбрать запись!');
                return;
            }
            me.setValue(rec.getData());
        }
        else {
            var data = [];
            for (var i in rec) {
                data.push(rec[i].getData());
            }
            me.setValue(data);
        }

        me.onSelectWindowClose();
    },

    /**
    * Обработка события при выборе всех
    */
    onSelectAll: function () {
        var me = this;

        me.updateDisplayedText('Выбраны все');
        me.value = 'All';
        me.selectWindow.hide();
    },

    /**
    * Устанавливаем значение поля. 
    * @param {Object} data Новое значение
    * @return {B4.form.SelectField} this
    */
    setValue: function (data) {
        var me = this,
            oldValue = me.getValue(),
            isValid = me.getErrors() != '';

        me.value = data;
        me.updateDisplayedText(data);

        me.fireEvent('validitychange', me, isValid);
        me.fireEvent('change', me, data, oldValue);
        me.validate();
        return me;
    },

    /**
    * Возвращает значение поля. 
    * @return {Object} this.value
    */
    getValue: function () {
        var me = this;
        if (Ext.isObject(me.value)) {
            return me.isGetOnlyIdProperty ? me.value[me.idProperty] : me.value;
        }

        if (Ext.isArray(me.value)) {
            return Ext.Array.map(me.value, function (data) { return me.isGetOnlyIdProperty ? data[me.idProperty] : data; });
        }

        return me.value;
    },

    /**
    * Возвращает текст поля. 
    * @return {Object} this.rawValue
    */
    getText: function () {
        return this.rawValue;
    },

    /**
    * Возвращает значение поля для передачи на сервер. 
    * @return {Object} this.value[this.dataField]
    */
    getSubmitValue: function () {
        var me = this;

        if (!Ext.isEmpty(me.idProperty)) {
            if (Ext.isEmpty(me.value))
                return null;

            if (Ext.isString(me.value))
                return me.value;

            if (Ext.isObject(me.value))
                return me.value[me.idProperty];

            if (Ext.isArray(me.value))
                return Ext.Array.map(me.value, function (data) { return data[me.idProperty]; });
        }

        return me.callParent(arguments);
    },

    /**
    * Обновление отображаемого текста в поле
    * @param {Object} data Объект, из которого берется новое значение
    * @private
    */
    updateDisplayedText: function (data) {
        var me = this,
            text;

        if (Ext.isString(data)) {
            text = data;
        }
        else {
            text = data && data[me.textProperty] ? data[me.textProperty] : '';
            if (Ext.isEmpty(text) && Ext.isArray(data)) {
                text = Ext.Array.map(data, function (record) { return record[me.textProperty]; }).join();
            }
        }

        me.setRawValue.call(me, text);
    }
});