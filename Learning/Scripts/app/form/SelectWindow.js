/*
    Выбор элементов
*/
Ext.define('B4.form.SelectWindow', {
    extend: 'Ext.window.Window',

    alias: 'widget.b4selectwindow',

    requires: [
        'B4.ux.button.Save',
        'B4.ux.button.Close',
        'B4.ux.button.Update',
        'B4.ux.grid.Panel',
        'B4.ux.grid.toolbar.Paging',
        'B4.ux.grid.column.Delete',
        'B4.ux.grid.plugin.HeaderFilters'
    ],

    closeAction: 'destroy',
    height: 500,
    width: 600,
    layout: 'fit',
    mixins: ['B4.mixins.window.ModalMask'],
    trackResetOnLoad: true,
    selectWindowCallback: null,

    //отображать тулбар с пагинацией
    showPaging: true,

    /**
	* @cfg {String} listView
	* Представление, которое используется для отображения данных справочника
	*/
    listView: null,

    /**
	* @cfg {String} editView
	* Представление, которое используется для редактирования данных справочника
	*/
    editView: null,

    /**
	* @cfg {String/Object} store
	* Store
	*/
    store: null,

    /**
	* @cfg {String} model
	* Модель (необходима при редактировании данных справочника)
	*/
    model: null,

    /**
	* @cfg {"SINGLE"/"MULTI"/"SIMPLE"} selectionMode
	* Режим выбора для Ext.selection.CheckboxModel: SINGLE, MULTI, SIMPLE
	* Поведение каждого из режимов описано в доках к Ext.selection.Model.mode
	*/
    selectionMode: 'SINGLE',

    /**
	* @cfg {Boolean} loadDataOnShow
	* Загружать данные хранилища только при открытии окна
	*/
    loadDataOnShow: false,

    /**
	* @cfg {String} title
	* Заголовок для окна выбора
	*/
    title: 'Выбор элемента',

    idProperty: 'Id',

    /**
	* @cfg {Object} columns
	* Столбцы таблицы
	*/
    columns: null,

    /**
	* @cfg {Boolean} rowNumberer
	* Нумеровать ли строки
	*/
    rowNumberer: false,

    /**
	* Метод для получения store
	* @return {B4.base.Store} store  
	*/
    getStore: function () {
        return Ext.isObject(this.store) && this.store.isStore ? this.store : null;
    },

    /**
    * @cfg {Boolean} rowNumberer
    * Спрятать кнопку "Закрыть"
    */
    closeButtonHidden: false,

    _makeSelectionModel: function () {
        var me = this,
            mode = me.selectionMode.toUpperCase(),
            tooltip = Ext.create('Ext.tip.ToolTip', {
                html: 'Выбрать все отображаемые записи'
            });

        var selModel = Ext.create('Ext.selection.CheckboxModel', {
            mode: me.selectionMode,
            checkOnly: true,
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
                if (mode == 'MULTI') {
                    if (Ext.isArray(this.views) && this.views.length > 0) {
                        tooltip.setTarget(this.views[0].headerCt.child('gridcolumn[isCheckerHd]').getEl());
                    }
                }
            }
        });

        return selModel;
    },

    initComponent: function () {

        this.callParent(arguments);

        var me = this,
            mode = me.selectionMode.toUpperCase(),
            store = me.store;

        if (Ext.isString(mode)) {
            if (mode != 'SINGLE' && mode != 'MULTI') {
                console.error('Config error:', 'incorrect selection mode');
                return;
            }
        }
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
            'gridcreated'
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
                hidden: me.closeButtonHidden,
                items: [
                    {
                        xtype: 'button',
                        text: 'Закрыть',
                        iconCls: "icon-decline",
                        handler: me.onSelectWindowClose,
                        scope: me
                    }
                ]
            }
        });

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

        if (!me.store) {
            Ext.Msg.alert('Ошибка', 'Store is undefined!');
            return;

        }

        if (Ext.isFunction(me.store.on)) {
            me.store.on('beforeload', me.onStoreBeforeLoad, me);
        }

        if (me.listView == 'Ext.grid.Panel')
            me.listView = null;

        // флаг необходимости опустить создание тулбара окна
        var doNotCreateWindowToolbar = false;

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
                        me.gridView.store = me.store;
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

                if (me.rowNumberer === true) {
                    me.columns.unshift({
                        xtype: 'rownumberer'
                    });
                }

                var cfg = Ext.apply({}, me.listView || {});
                Ext.applyIf(cfg, {
                    xtype: 'gridpanel',
                    plugins: [Ext.create('B4.ux.grid.plugin.HeaderFilters')],
                    features: me.features || []
                });

                if (me.showPaging) {
                    Ext.applyIf(cfg, {
                        dockedItems: [
                            {
                                xtype: 'pagingtoolbar',
                                displayInfo: true,
                                store: me.store,
                                dock: 'bottom'
                            }
                        ]
                    });
                }

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
                me.onSelectValue.apply(me, arguments);
            }, me);
        }

        me.add(me.gridView);

        if (!doNotCreateWindowToolbar) {
            this.addDocked({
                xtype: 'toolbar',
                dock: 'top',
                items: [
                    me._toolbarSelectBtnConfig,
                    '->',
                    me._toolbarCloseBtnConfig
                ]
            });
        }

        if (me.loadDataOnShow == true) {
            me.on('show', function () {
                me.store.load();
            });
        } else {
            me.store.load();
        }

        me.gridView.getSelectionModel().deselectAll(true);
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

    /**
	 * Выполняет выделение
	 * cb - коллбэк-функция, которая получает результат выделения. Принимает параметры:
	 *   data -- выбранные данные. Равен null, если пользователь ничего не выбрал
	 *           или содержит поля выбранного экземпляра модели (например, { Id: 1, Name: 'foo' })
	 * В случае множественного выбора (selectionModel = SIMPLE или MULTI) вернет массив таких полей
	 */
    performSelection: function (cb) {

        var me = this;

        me.selectWindowCallback = cb;

        me.store.load();

        me.gridView.getSelectionModel().deselectAll(true);

        me.show();
        me.center();
    },

    /**
	* Обработка события закрытия окна выбора
	*/
    onSelectWindowClose: function () {
        this.hide();
        if (typeof this.selectWindowCallback == 'function') {
            this.selectWindowCallback(null);
        }
    },

    /**
	* Обработка события выбора значения
	*/
    onSelectValue: function () {
        var me = this,
            rec = me.gridView.getSelectionModel().getSelection();

        if (rec.length == 0) {
            Ext.Msg.alert('Ошибка', 'Необходимо выбрать запись!');
            return;
        }

        me.hide();

        if (typeof me.selectWindowCallback == 'function') {
            if (me.selectionMode == 'SINGLE') {
                me.selectWindowCallback(rec[0].getData());
            }
            else {
                var data = [];
                Ext.each(rec, function (i) {
                    if (i && Ext.isFunction(i.getData))
                        data.push(i.getData());
                });

                me.selectWindowCallback(data);
            }
        }
    }
});