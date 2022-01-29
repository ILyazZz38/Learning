/*
   Окно групповых операций с тарифами
*/
Ext.define('B4.form.register.personalaccount.groupoperation.Tariff', {
    extend: 'B4.form.Window',
    alias: 'widget.tariffgroupoperation',

    mixins: ['B4.mixins.window.ModalMask'],
    layout: 'anchor',
    title: 'Групповые операции с тарифами',
    constrain: true,

    parentView: undefined,
    dataBankId: undefined,
    selectedPersonalAccountList: undefined,

    requires: [
        'B4.ux.button.Close',
        'B4.form.MonthPicker',
        'B4.ux.button.Save',
        'B4.ux.button.Update',
        'B4.form.ComboBox',
        'B4.form.CalcMonthPicker',
        'B4.ux.grid.column.Delete',
        'B4.form.MonthPicker',
        'B4.enums.TypeTarif',
        'B4.enums.Region'
    ],

    listeners: {
        afterrender: function (view) {
            var me = this, tabs = me.down('tabpanel'),
                tabSupplier = me.down('gridpanel[name=Supplier]');
            tabs.setActiveTab(tabSupplier);
            B4.Ajax.request({
                url: B4.Url.action('/CalculationMonth/GetCalculationMonth')
            }).next(function (resp) {
                var response = Ext.decode(resp.responseText);

                //Устанавливаем в окончание периода текущий расчетный месяц
                view.down('b4monthpicker[name=DateFrom]').setValue(response.data.CalculationMonth);
                view.down('b4monthpicker[name=DateTo]').setValue(new Date(3000, 0, 1));
                view.loadData(true);
            });
        },
        windowcreated: function (field, window) {
            var width = Ext.getBody().getViewSize().width * 0.7;
            var height = Ext.getBody().getViewSize().height * 0.7;
            window.setWidth(width);
            window.setHeight(height);
            window.center();
        }
    },
    globalFilter: {},
    loadData: function (cachePersonalAccounts, func) {
        if (func) this.globalFilter = func;
        var view = this,
            me = this,
            personalAccountGrid = view.down('gridpanel[name=PersonalAccount]'),
            personalAccountServiceField = personalAccountGrid.down('combobox[name=Service]'),

            houseGrid = view.down('gridpanel[name=House]'),
            houseServiceField = houseGrid.down('combobox[name=Service]'),

            supplierGrid = view.down('gridpanel[name=Supplier]'),
            supplierServiceField = supplierGrid.down('combobox[name=Service]'),

            dataBankGrid = view.down('gridpanel[name=DataBank]'),
            dataBankServiceField = dataBankGrid.down('combobox[name=Service]');

        if (!view.getForm().isValid()) {
            B4.QuickMsg.msg('Внимание', 'Не все поля корректно заполнены', 'warning');
            return;
        }

        if (view.down('b4monthpicker[name=DateFrom]').getValue() > view.down('b4monthpicker[name=DateTo]').getValue()) {
            B4.QuickMsg.msg('Внимание', 'Начало периода не может быть позже окончания', 'warning');
            return;
        }
        view.getEl().mask('Загрузка...');

        //Тарифы на договоры ЖКУ и тарифы на банк по умолчанию
        var tabs = new Array(B4.enums.TypeTarif.Supplier, B4.enums.TypeTarif.DataBase);
        //остальные опционно
        if (view.down('[name=ShowHouse]').checked) {
            tabs.push(B4.enums.TypeTarif.House);
        }
        if (view.down('[name=ShowPersonalAccount]').checked) {
            tabs.push(B4.enums.TypeTarif.Ls);
        }

        B4.Ajax.request({
            url: B4.Url.action('/Tariff/GetGroupOperationData'),
            timeout: 9999999,
            params: {
                personalAccountList: Ext.encode(view.selectedPersonalAccountList),
                isHouses: me.isHouses,

                cachePersonalAccounts: cachePersonalAccounts,
                showAll: view.down('checkbox[name=ShowAll]').checked,
                dateFrom: view.down('b4monthpicker[name=DateFrom]').getValue(),
                dateTo: view.down('b4monthpicker[name=DateTo]').getValue(),

                personalAccountServiceId: personalAccountServiceField.getValue(),
                houseServiceId: houseServiceField.getValue(),
                supplierServiceId: supplierServiceField.getValue(),
                dataBankServiceId: dataBankServiceField.getValue(),
                tabsForShow: Ext.encode(tabs)
            }
        }).next(function (resp) {
            view.getEl().unmask();
            var response = Ext.decode(resp.responseText);

            if (!response.success) {
                B4.QuickMsg.msg('Внимание', response.message, 'warning');
                return;
            }

            //Настраиваем вкладку Тарифы на ЛС
            if (response.data.PersonalAccount) {
                if (personalAccountServiceField.getStore().data.length == 0) {
                    personalAccountServiceField.getStore().loadData(response.data.PersonalAccount.ServiceList);
                    personalAccountServiceField.getStore().insert(0, {
                        Id: 0,
                        Name: 'Все услуги'
                    });
                }
                personalAccountGrid.getStore().loadData(response.data.PersonalAccount.TariffList);
            }

            //Тарифы на дом
            if (response.data.House) {
                if (houseServiceField.getStore().data.length == 0) {
                    houseServiceField.getStore().loadData(response.data.House.ServiceList);
                    houseServiceField.getStore().insert(0, {
                        Id: 0,
                        Name: 'Все услуги'
                    });
                }
                houseGrid.getStore().loadData(response.data.House.TariffList);
            }

            //Тарифы на ЖКУ
            if (response.data.Supplier) {
                if (supplierServiceField.getStore().data.length == 0) {
                    supplierServiceField.getStore().loadData(response.data.Supplier.ServiceList);
                    supplierServiceField.getStore().insert(0, {
                        Id: 0,
                        Name: 'Все услуги'
                    });
                }
                supplierGrid.getStore().loadData(response.data.Supplier.TariffList);
            }

            //Тарифы на банк
            if (response.data.DataBank) {
                if (dataBankServiceField.getStore().data.length == 0) {
                    dataBankServiceField.getStore().loadData(response.data.DataBank.ServiceList);
                    dataBankServiceField.getStore().insert(0, {
                        Id: 0,
                        Name: 'Все услуги'
                    });
                }

                dataBankGrid.getStore().loadData(response.data.DataBank.TariffList);

                //Для Сахи скрываем колонку Новый тариф
                B4.Ajax.request({
                    url: B4.Url.action('/TempDepart/GetRegionCode')
                }).next(function (resp) {
                    var response = Ext.decode(resp.responseText);
                    if (response.code == B4.enums.Region.Sakha) {
                        dataBankGrid.down('numbercolumn[dataIndex=NewTariff]').setVisible(false);
                    }
                }).error(function (resp) {
                    console.log(resp);
                    B4.QuickMsg.warning('При определении региона произошла ошибка');
                });
            }

            if (me.globalFilter) for (var key in me.globalFilter) {
                me.globalFilter[key].call();
            }

        }).error(function (resp) {
            view.getEl().unmask();
        });
    },

    saveData: function (btn) {
        var view = this,
            personalAccountGrid = view.down('gridpanel[name=PersonalAccount]'),
            houseGrid = view.down('gridpanel[name=House]'),
            supplierGrid = view.down('gridpanel[name=Supplier]'),
            dataBankGrid = view.down('gridpanel[name=DataBank]'),
            dateFromField = view.down('b4monthpicker[name=DateFrom]'),
            dateToField = view.down('b4monthpicker[name=DateTo]');

        if (view.down('b4monthpicker[name=DateFrom]').getValue() > view.down('b4monthpicker[name=DateTo]').getValue()) {
            B4.QuickMsg.msg('Внимание', 'Начало периода не может быть позже окончания', 'warning');
            return;
        }

        view.getEl().mask('Сохранение...');


        Ext.defer(function () {
            B4.Ajax.request({
                url: B4.Url.action('/Tariff/SaveGroupList'),
                timeout: 9999999,
                params: {
                    personalAccountTariffs: Ext.encode(Ext.pluck(view.getRealModifiedRecords(personalAccountGrid.getStore().getModifiedRecords()), 'data')),
                    houseTariffs: Ext.encode(Ext.pluck(view.getRealModifiedRecords(houseGrid.getStore().getModifiedRecords()), 'data')),
                    supplierTariffs: Ext.encode(Ext.pluck(view.getRealModifiedRecords(supplierGrid.getStore().getModifiedRecords()), 'data')),
                    dataBankTariffs: Ext.encode(Ext.pluck(view.getRealModifiedRecords(dataBankGrid.getStore().getModifiedRecords()), 'data')),

                    showAll: view.down('checkbox[name=ShowAll]').checked,
                    dateFrom: dateFromField.getValue(),
                    dateTo: dateToField.getValue()
                }
            }).next(function (resp) {
                view.getEl().unmask();
                var response = Ext.decode(resp.responseText);

                if (response.success) {
                    B4.QuickMsg.msg('Выполнено', 'Данные успешно сохранены', 'success');
                } else {
                    B4.QuickMsg.msg('Внимание', response.message, 'warning');
                }

                view.loadData();
            }).error(function () {
                view.getEl().unmask();
                B4.QuickMsg.msg('Внимание', 'Во время операции произошла ошибка', 'warning');
            });
        }, 1000);
    },

    //костыльчик для получения реально измененных записей
    getRealModifiedRecords: function (arr) {
        return arr.filter(function (item) { return item.dirty; });
    },

    initComponent: function () {
        var me = this,
            globalFilters = {},
            keyPressFilter = function (field, event) {
                var grid = field.column.up('gridpanel');
                var value = "";
                if (event.getKey() != event.ENTER) {
                    value = field.getValue() + String.fromCharCode(event.keyCode);
                } else value = field.getValue();
                grid.store.filters.removeAtKey(field.itemId);
                if (value.toString().trim().length != 0)
                    grid.store.filters.add(field.itemId, new Ext.util.Filter({
                        property: field.itemId,
                        value: value
                    }));

                if (event.getKey() == event.ENTER) {
                    var fc = function () {
                        var data = grid.store.getRange();
                        grid.store.removeAll();

                        var filters = grid.store.filters;
                        var filter = data;
                        filters.items.forEach(function (f) {
                            filter = filter.filter(function (item) {
                                return item.get(f.property).toString().toUpperCase().indexOf(f.value.toString().toUpperCase()) > -1;
                            });
                        });
                        grid.store.add(filter);
                    };
                    if (!me.globalFilters) me.globalFilters = {};
                    delete me.globalFilters[grid.name];
                    me.globalFilters[grid.name] = fc;
                    me.loadData(true, me.globalFilters);
                }
            },
            changeField = function (field, value) {
                var grid = field.column.up('gridpanel');
                grid.store.filters.removeAtKey(field.itemId);
                if (value.toString().trim().length != 0)
                    grid.store.filters.add(field.itemId, new Ext.util.Filter({
                        property: field.itemId,
                        value: value
                    }));
            },
            columns = [
                {
                    xtype: 'b4editcolumn',
                    handler: function (gridView, rowIndex, colIndex, el, e, rec) {
                        var view = gridView.up('window'),
                            activeTab = view.down('tabpanel').getActiveTab(),
                            personalAccountGrid = view.down('gridpanel[name=PersonalAccount]'),
                            personalAccountServiceField = personalAccountGrid.store.getRange()[rowIndex] != null ? personalAccountGrid.store.getRange()[rowIndex].get('ServiceId') : null,

                            houseGrid = view.down('gridpanel[name=House]'),
                            houseServiceField = houseGrid.store.getRange()[rowIndex] != null ? houseGrid.store.getRange()[rowIndex].get('ServiceId') : null,

                            supplierGrid = view.down('gridpanel[name=Supplier]'),
                            supplierServiceField = supplierGrid.store.getRange()[rowIndex] != null ? supplierGrid.store.getRange()[rowIndex].get('ServiceId') : null,

                            dataBankGrid = view.down('gridpanel[name=DataBank]'),
                            dataBankServiceField = dataBankGrid.store.getRange()[rowIndex] != null ? dataBankGrid.store.getRange()[rowIndex].get('ServiceId') : null;

                        if (view.down('b4monthpicker[name=DateFrom]').getValue() > view.down('b4monthpicker[name=DateTo]').getValue()) {
                            B4.QuickMsg.msg('Внимание', 'Начало периода не может быть позже окончания', 'warning');
                            return;
                        }

                        var typeTariffTab;
                        switch (activeTab.name) {
                            case 'DataBank':
                                typeTariffTab = B4.enums.TypeTarif.DataBase;
                                break;
                            case 'Supplier':
                                typeTariffTab = B4.enums.TypeTarif.Supplier;
                                break;
                            case 'House':
                                typeTariffTab = B4.enums.TypeTarif.House;
                                break;
                            case 'PersonalAccount':
                                typeTariffTab = B4.enums.TypeTarif.Ls;
                                break;
                        }

                        var win = Ext.create('B4.form.register.personalaccount.PersonalAccountList', {
                            renderTo: view.parentView.getEl(),
                            filterRecord: rec.getData(),
                            finder: {
                                showAll: view.down('checkbox[name=ShowAll]').checked,
                                dateFrom: view.down('b4monthpicker[name=DateFrom]').getValue(),
                                dateTo: view.down('b4monthpicker[name=DateTo]').getValue(),

                                personalAccountServiceId: personalAccountServiceField,
                                houseServiceId: houseServiceField,
                                supplierServiceId: supplierServiceField,
                                dataBankServiceId: dataBankServiceField,
                                tabType: typeTariffTab
                            },

                            filterType: 'Tariff'
                        });
                        win.show();
                    }
                },
                {
                    text: 'Наименование услуги',
                    sortable: false,
                    dataIndex: 'ServiceName',
                    flex: 1,
                    filter: {
                        xtype: 'textfield',
                        enableKeyEvents: true,
                        listeners: {
                            'keypress': keyPressFilter,
                            'change': changeField
                        }
                    }

                },
                {
                    text: 'Договор ЖКУ',
                    sortable: false,
                    dataIndex: 'SupplierName',
                    flex: 1,
                    filter: {
                        xtype: 'textfield',
                        enableKeyEvents: true,
                        listeners: {
                            'keypress': keyPressFilter,
                            'change': changeField
                        }
                    }
                },
                {
                    text: 'Формула расчета',
                    sortable: false,
                    dataIndex: 'FormulaName',
                    flex: 1,
                    filter: {
                        xtype: 'textfield',
                        enableKeyEvents: true,
                        listeners: {
                            'keypress': keyPressFilter,
                            'change': changeField
                        }
                    }
                },
                {
                    text: 'Наименование параметра-тарифа',
                    sortable: false,
                    dataIndex: 'ParameterName',
                    flex: 1,
                    filter: {
                        xtype: 'textfield',
                        enableKeyEvents: true,
                        listeners: {
                            'keypress': keyPressFilter,
                            'change': changeField
                        }
                    }
                },
                {
                    text: 'Количество ЛС',
                    sortable: false,
                    dataIndex: 'PersonalAccountCount',
                    flex: 1,
                    filter: {
                        xtype: 'textfield',
                        enableKeyEvents: true,
                        listeners: {
                            'keypress': keyPressFilter,
                            'change': changeField
                        }
                    }
                },
                {
                    text: 'Количество домов',
                    sortable: false,
                    dataIndex: 'HouseCount',
                    flex: 1,
                    filter: {
                        xtype: 'textfield',
                        enableKeyEvents: true,
                        listeners: {
                            'keypress': keyPressFilter,
                            'change': changeField
                        }
                    }
                },
                {
                    text: 'Дата начала',
                    xtype: 'datecolumn',
                    sortable: false,
                    dataIndex: 'DateBegin',
                    width: 100,
                    format: 'd.m.Y',
                    filter: {
                        xtype: 'textfield',
                        enableKeyEvents: true,
                        listeners: {
                            'keypress': keyPressFilter,
                            'change': changeField
                        }
                    }
                },
                {
                    text: 'Дата окончания',
                    sortable: false,
                    xtype: 'datecolumn',
                    dataIndex: 'DateEnd',
                    width: 100,
                    format: 'd.m.Y',
                    filter: {
                        xtype: 'textfield',
                        enableKeyEvents: true,
                        listeners: {
                            'keypress': keyPressFilter,
                            'change': changeField
                        }
                    }
                },
                {
                    xtype: 'numbercolumn',
                    text: 'Установленный тариф',
                    sortable: false,
                    dataIndex: 'Tariff',
                    renderer: function (value, metaData, record) {
                        return B4.utils.KP6Utils.renderParameterValue(value, record);
                    },
                    flex: 1,
                    filter: {
                        xtype: 'textfield',
                        enableKeyEvents: true,
                        listeners: {
                            'keypress': keyPressFilter,
                            'change': changeField
                        }
                    }
                },
                {
                    xtype: 'numbercolumn',
                    sortable: false,
                    dataIndex: 'NewTariff',
                    flex: 1,
                    text: 'Новый тариф',
                    renderer: function (value, metaData, record) {
                        return B4.utils.KP6Utils.renderParameterValue(value, record);
                    },
                    getEditor: function (record, column) {
                        return Ext.create('Ext.grid.CellEditor', {
                            field: Ext.create('Ext.form.field.Number', {
                                hideTrigger: true,
                                decimalPrecision: 10,
                                customFormat: '0,000.0000'
                            })
                        });
                    },
                    filter: {
                        xtype: 'textfield',
                        enableKeyEvents: true,
                        listeners: {
                            'keypress': keyPressFilter,
                            'change': changeField
                        }
                    }
                },
                {
                    xtype: 'b4deletecolumn',
                    handler: function (gridView, rowIndex, colIndex, el, e, rec) {
                        Ext.Msg.confirm('Внимание', 'Вы действительно хотите удалить тариф?', function (answer) {
                            if (answer == 'yes') {
                                rec.set('NewTariff', null);
                                rec.setDirty();
                                gridView.refresh();
                                B4.QuickMsg.msg('Внимание', 'Для фиксации изменений нажмите кнопку Сохранить', 'info');
                            }
                        });
                    }
                }
            ];

        Ext.applyIf(me, {
            items: [
                {
                    xtype: 'tabpanel',
                    anchor: '0 0',
                    layout: 'anchor',
                    title: 'Информация о результатах поиска',
                    items: [
                        {
                            xtype: 'gridpanel',
                            name: 'PersonalAccount',
                            title: 'Тарифы на ЛС',
                            hidden: true,
                            store: Ext.create('B4.store.register.personalaccount.tariff.GroupTariffData'),
                            layout: 'fit',
                            anchor: '0 0',
                            columns: columns,
                            dockedItems: [
                                {
                                    xtype: 'toolbar',
                                    dock: 'top',
                                    items: [
                                        {
                                            xtype: 'combobox',
                                            width: 500,
                                            labelWidth: 60,
                                            margin: 5,
                                            name: 'Service',
                                            displayField: 'Name',
                                            valueField: 'Id',
                                            queryMode: 'local',
                                            mode: 'local',
                                            labelAlign: 'right',
                                            hidden: true,
                                            editable: false,
                                            fieldLabel: 'Услуга',
                                            store: new Ext.data.JsonStore({
                                                fields: [
                                                    { name: 'Id' },
                                                    { name: 'Name' }
                                                ]
                                            })
                                        }
                                    ]
                                }
                            ],
                            plugins: [
                                Ext.create('Ext.grid.plugin.CellEditing', {
                                    clicksToEdit: 1,
                                    pluginId: 'CellEditing'
                                }),
                                Ext.create('B4.ux.grid.plugin.HeaderFilters')
                            ],
                            viewConfig: {
                                loadMask: true
                            }
                        },
                        {
                            xtype: 'gridpanel',
                            name: 'House',
                            title: 'Тарифы на дом',
                            hidden: true,
                            store: Ext.create('B4.store.register.personalaccount.tariff.GroupTariffData'),
                            layout: 'fit',
                            anchor: '0 0',
                            columns: columns,
                            dockedItems: [
                                {
                                    xtype: 'toolbar',
                                    dock: 'top',
                                    items: [
                                        {
                                            xtype: 'combobox',
                                            width: 500,
                                            labelWidth: 60,
                                            margin: 5,
                                            name: 'Service',
                                            displayField: 'Name',
                                            valueField: 'Id',
                                            queryMode: 'local',
                                            mode: 'local',
                                            labelAlign: 'right',
                                            editable: false,
                                            hidden: true,
                                            fieldLabel: 'Услуга',
                                            store: new Ext.data.JsonStore({
                                                fields: [
                                                    { name: 'Id' },
                                                    { name: 'Name' }
                                                ]
                                            })
                                        }
                                    ]
                                }
                            ],
                            plugins: [
                                Ext.create('Ext.grid.plugin.CellEditing', {
                                    clicksToEdit: 1,
                                    pluginId: 'CellEditing'
                                }),
                                Ext.create('B4.ux.grid.plugin.HeaderFilters')
                            ],
                            viewConfig: {
                                loadMask: true
                            }
                        },
                        {
                            xtype: 'gridpanel',
                            name: 'Supplier',
                            title: 'Тарифы на договор ЖКУ',
                            store: Ext.create('B4.store.register.personalaccount.tariff.GroupTariffData'),
                            layout: 'fit',
                            anchor: '0 0',
                            columns: columns,
                            dockedItems: [
                                {
                                    xtype: 'toolbar',
                                    dock: 'top',
                                    items: [
                                        {
                                            xtype: 'combobox',
                                            width: 500,
                                            labelWidth: 60,
                                            margin: 5,
                                            name: 'Service',
                                            displayField: 'Name',
                                            valueField: 'Id',
                                            queryMode: 'local',
                                            mode: 'local',
                                            labelAlign: 'right',
                                            editable: false,
                                            hidden: true,
                                            fieldLabel: 'Услуга',
                                            store: new Ext.data.JsonStore({
                                                fields: [
                                                    { name: 'Id' },
                                                    { name: 'Name' }
                                                ]
                                            })
                                        }
                                    ]
                                }
                            ],
                            plugins: [
                                Ext.create('Ext.grid.plugin.CellEditing', {
                                    clicksToEdit: 1,
                                    pluginId: 'CellEditing'
                                }),
                                Ext.create('B4.ux.grid.plugin.HeaderFilters')
                            ],
                            viewConfig: {
                                loadMask: true
                            }
                        },
                        {
                            xtype: 'gridpanel',
                            name: 'DataBank',
                            title: 'Тарифы на банк',
                            store: Ext.create('B4.store.register.personalaccount.tariff.GroupTariffData'),
                            layout: 'fit',
                            anchor: '0 0',
                            columns: columns,
                            dockedItems: [
                                {
                                    xtype: 'toolbar',
                                    dock: 'top',
                                    items: [
                                        {
                                            xtype: 'combobox',
                                            width: 500,
                                            labelWidth: 60,
                                            margin: 5,
                                            name: 'Service',
                                            displayField: 'Name',
                                            valueField: 'Id',
                                            queryMode: 'local',
                                            mode: 'local',
                                            labelAlign: 'right',
                                            editable: false,
                                            fieldLabel: 'Услуга',
                                            hidden: true,
                                            store: new Ext.data.JsonStore({
                                                fields: [
                                                    { name: 'Id' },
                                                    { name: 'Name' }
                                                ]
                                            })
                                        }
                                    ]
                                }
                            ],
                            plugins: [
                                Ext.create('Ext.grid.plugin.CellEditing', {
                                    clicksToEdit: 1,
                                    pluginId: 'CellEditing'
                                }),
                                Ext.create('B4.ux.grid.plugin.HeaderFilters')
                            ],
                            viewConfig: {
                                loadMask: true
                            }
                        }
                    ]
                }
            ],
            dockedItems: [
                {
                    xtype: 'toolbar',
                    dock: 'top',
                    flex: 1,
                    layout: 'anchor',
                    items: [
                        {
                            xtype: 'container',
                            layout: 'hbox',
                            items: [
                                {
                                    xtype: 'buttongroup',
                                    items: [
                                        {
                                            xtype: 'b4savebutton',
                                            listeners: {
                                                click: function (btn) {
                                                    btn.up('window').saveData(btn);
                                                }
                                            }
                                        },
                                        {
                                            xtype: 'b4updatebutton',
                                            listeners: {
                                                click: function (btn) {
                                                    var Func = function (grid) {
                                                        return function () {
                                                            var data = grid.store.getRange();
                                                            grid.store.removeAll();

                                                            var filters = grid.store.filters;
                                                            var filter = data;
                                                            filters.items.forEach(function (f) {
                                                                filter = filter.filter(function (item) {
                                                                    return item.get(f.property).toString().toUpperCase().indexOf(f.value.toString().toUpperCase()) > -1;
                                                                });
                                                            });
                                                            grid.store.add(filter);
                                                        }
                                                    };
                                                    var gridpanels = [
                                                        btn.up('tariffgroupoperation').down('gridpanel[name=PersonalAccount]'),
                                                        btn.up('tariffgroupoperation').down('gridpanel[name=House]'),
                                                        btn.up('tariffgroupoperation').down('gridpanel[name=Supplier]'),
                                                        btn.up('tariffgroupoperation').down('gridpanel[name=DataBank]')
                                                    ];
                                                    me.globalFilters = {};
                                                    gridpanels.forEach(function (item) {
                                                        delete me.globalFilters[item.name];
                                                        me.globalFilters[item.name] = Func(item);
                                                    });
                                                    me.loadData(undefined, me.globalFilters);
                                                    //btn.up('window').loadData();
                                                }
                                            }
                                        }
                                    ]
                                },
                                {
                                    xtype: 'b4monthpicker',
                                    name: 'DateFrom',
                                    fieldLabel: 'Начало периода',
                                    labelWidth: 100,
                                    editable: false,
                                    allowBlankl: false,
                                    labelAlign: 'right',
                                    width: 220
                                },
                                {
                                    xtype: 'b4monthpicker',
                                    name: 'DateTo',
                                    fieldLabel: 'Окончание периода',
                                    labelWidth: 120,
                                    editable: false,
                                    allowBlankl: false,
                                    labelAlign: 'right',
                                    width: 240
                                },
                                {
                                    xtype: 'container',
                                    flex: 1
                                },
                                {
                                    xtype: 'buttongroup',
                                    items: [
                                        {
                                            xtype: 'b4closebutton',
                                            listeners: {
                                                click: function (btn) {
                                                    btn.up('window').close();
                                                }
                                            }
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            xtype: 'fieldset',
                            layout: 'hbox',
                            padding: 3,
                            items: [
                                {
                                    xtype: 'container',
                                    layout: 'hbox',
                                    margin: '0 0 0 -15',
                                    items: [
                                        {
                                            xtype: 'checkbox',
                                            name: 'ShowAll',
                                            margin: '0 0 0 20',
                                            style: "font-size:11px;padding:10px 0px 0 15px",
                                            boxLabel: 'Показать действующие и не действующие тарифы',
                                            listeners: {
                                                'change': function (field) {
                                                    me.loadData();
                                                }
                                            }
                                        },
                                        {
                                            xtype: 'checkbox',
                                            name: 'ShowPersonalAccount',
                                            margin: '0 0 0 20',
                                            style: "font-size:11px;padding:10px 0px 0 15px",
                                            boxLabel: 'Показать действующие тарифы на л.с.',
                                            listeners: {
                                                'change': function (field) {
                                                    var tabs = me.down('tabpanel'),
                                                        tab = me.down('gridpanel[name=PersonalAccount]'),
                                                        tabSupplier = me.down('gridpanel[name=Supplier]');
                                                    if (field.getValue()) {
                                                        tab.tab.show();
                                                        tabs.setActiveTab(tab);
                                                        tab.store.reload();
                                                        me.loadData(false);
                                                    } else {
                                                        tab.tab.hide();
                                                        tabs.setActiveTab(tabSupplier);
                                                        me.loadData(false);
                                                    }
                                                }
                                            }
                                        },
                                        {
                                            xtype: 'checkbox',
                                            name: 'ShowHouse',
                                            margin: '0 0 0 20',
                                            style: "font-size:11px;padding:10px 0px 0 15px",
                                            boxLabel: 'Показать действующие тарифы на дом',
                                            listeners: {
                                                'change': function (field) {
                                                    var tabs = me.down('tabpanel'),
                                                        tab = me.down('gridpanel[name=House]'),
                                                        tabSupplier = me.down('gridpanel[name=Supplier]');
                                                    if (field.getValue()) {
                                                        tab.tab.show();
                                                        tabs.setActiveTab(tab);
                                                        me.loadData(false);
                                                    } else {
                                                        tab.tab.hide();
                                                        tabs.setActiveTab(tabSupplier);
                                                        me.loadData(false);
                                                    }
                                                }
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        me.callParent(arguments);
    },

    numberRenderer: function (value, metaData, record) {
        return Ext.util.Format.number(parseFloat(value), '0,000.00').replace(',', '.');
    }
});
