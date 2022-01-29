/*
    B4.form.SelectField для выбора адреса из центрального банка DATA
*/
Ext.define('B4.form.SelectFieldAddress', {
    extend: 'B4.form.SelectField',
    alias: 'widget.b4selectfieldaddress',
    alternateClassName: ['B4.SelectFieldAddress'],

    requires: [
        'Ext.grid.Panel',
        'B4.ux.grid.plugin.HeaderFilters',
        'B4.ux.grid.column.Enum',
        'B4.store.finance.PersonalAccountFin',
        'B4.enums.TypePersonalAccountState'
    ],

    labelAlign: 'right',
    modalWindow: true,

    layout: {
        type: 'hbox',
        align: 'stretch'
    },
    defaults: {
        labelAlign: 'right'
    },
    name: 'PersonalAccount',

    store: Ext.create('B4.store.finance.PersonalAccountFin', {
        proxy: {
            type: 'b4proxy',
            timeout: 900000,
            controllerName: 'PersonalAccountFin',
            extraParams: {
                SelectFieldAddress: "1"
            }
        }
    }),

    idProperty: 'Id',
    textProperty: 'AddressName',
    editable: false,
    fieldLabel: 'Лицевой счет',
    windowCfg: {
        width: 900
    },

    dataBankId: undefined,

    listeners: {
        change: function (comp, record) {
            if (record && record.DataBankId != 0) {
                this.dataBankId = record.DataBankId;
            }
        }
    },

    getDataBank: function () {
        return this.dataBankId;
    },

    /*
    * Показывать комбобокс "Банк данных"
    */
    showDataBank: false,

    /**
    * Показываем окно со справочником
    */
    onTrigger1Click: function () {
        var me = this,
            mode = me.selectionMode.toUpperCase();

        if (!me.fireEvent('triggerclick')) {
            return;
        }

        // ранее выбранные записи
        me.selectedRecords = Ext.Array.clone(me.choosedRecords);

        // флаг необходимости опустить создание тулбара окна
        var doNotCreateWindowToolbar = false;

        if (Ext.isString(mode)) {
            if (mode != 'SINGLE' && mode != 'MULTI') {
                console.error('Config error:', 'incorrect selection mode');
                return;
            }
        }

        if (mode === 'MULTI' && !me.isRendered && me.showSelectAll) {
            me._toolbarSelectBtnConfig.items.push(me._toolbarSelectAllBtnConfig);
            me.isRendered = true;
        }

        if (me.showDataBank && !me.isRenderedBank) {
            me._toolbarSelectBtnConfig.items.push(me._toolbarsDataBankConfig);
            me.isRenderedBank = true;
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
                    selModel: me._makeSelectionModel(),
                    refTrigger: me
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
                            flex: 1,
                            filter: { xtype: 'textfield' }
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

                me.store.on('beforeload', function () {
                    me.filtersApplying = true;
                    return true;
                }, me);
                me.store.on('load', function () {
                    me.filtersApplying = false;
                }, me);

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

        me.store.load();

        me.gridView.getSelectionModel().deselectAll(true);

        // Создаем окно со справочником, если еще не создано
        if (!me.selectWindow) {
            var wndConfig = {};
            if (Ext.isObject(me.windowCfg))
                Ext.apply(wndConfig, me.windowCfg);

            me.fireEvent('beforewindowcreated', me, wndConfig);

            var renderTo = Ext.getBody();

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
            * Срабатывает после создания компонента-списка
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

            'triggerclick',

            'valueselected'
        );

        // выносим конфигурацию тулбара дабы не дублировать ее
        Ext.apply(me, {
            _toolbarSelectBtnConfig: {
                xtype: 'buttongroup',
                name: 'select',
                columns: 3,
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
            },
            _toolbarsDataBankConfig: {
                xtype: 'b4combobox',
                name: 'DataBank',
                labelWidth: 80,
                labelAlign: 'right',
                width: 380,
                additionalParameter: true,
                fieldLabel: 'Банк данных',
                editable: false,
                scope: me,
                listeners: {
                    change: function () {
                        var store = this.scope.getStore();
                        store.load();
                    }
                },
                url: '/LocalBank/ListWithoutPaging'
            }
        });
    },

    columns: [
        {
            xtype: 'gridcolumn',
            text: 'Л/С',
            dataIndex: 'PersonalAccountNumber',
            width: 70,
            filter: { xtype: 'numberfield', operand: CondExpr.operands.eq }
        },
        {
            xtype: 'gridcolumn',
            text: 'Платежный код',
            dataIndex: 'PaymentCode',
            width: 110,
            filter: { xtype: 'numberfield', operand: CondExpr.operands.eq }
        },
        {
            xtype: 'gridcolumn',
            text: 'Абонент',
            dataIndex: 'Fio',
            flex: 1,
            filter: { xtype: 'textfield' }
        },
        {
            xtype: 'b4enumcolumn',
            width: 100,
            text: 'Состояние',
            dataIndex: 'PersonalAccountState',
            enumName: 'B4.enums.TypePersonalAccountState',
            filter: true
        },
        {
            xtype: 'gridcolumn',
            text: 'Банк данных',
            flex: 1,
            dataIndex: 'PointName',
            filter: { xtype: 'textfield' }
        },
        {
            xtype: 'gridcolumn',
            text: 'УК',
            flex: 1,
            dataIndex: 'ManagementOrganizationName',
            filter: { xtype: 'textfield' }
        },
        {
            xtype: 'gridcolumn',
            text: 'ЖЭУ',
            flex: 1,
            dataIndex: 'HousingDepartmentName',
            filter: { xtype: 'textfield' }
        },
        {
            xtype: 'gridcolumn',
            text: 'Район',
            flex: 1,
            dataIndex: 'DistrictName',
            filter: { xtype: 'textfield' }
        },
        {
            xtype: 'gridcolumn',
            text: 'Улица',
            flex: 1,
            dataIndex: 'StreetName',
            filter: { xtype: 'textfield' }
        },
        {
            xtype: 'gridcolumn',
            text: 'Дом',
            flex: 1,
            dataIndex: 'HouseNumber',
            filter: { xtype: 'textfield' }
        },
        {
            xtype: 'gridcolumn',
            text: 'Корп',
            flex: 1,
            dataIndex: 'HouseBuild',
            filter: { xtype: 'textfield' }
        },
        {
            xtype: 'gridcolumn',
            text: 'Квартира',
            flex: 1,
            dataIndex: 'FlatNumber',
            filter: { xtype: 'textfield' }
        }
    ]
});
