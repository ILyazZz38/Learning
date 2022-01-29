/*
   Финансы - окно показаний приборов учета для ЛС по месяцам
*/
Ext.define('B4.form.finance.CounterValuesDetalization', {
    extend: 'B4.form.Window',
    alias: 'widget.financecountervalues',

    mixins: ['B4.mixins.window.ModalMask'],
    width: 900,
    height: 400,
    layout: 'fit',
    title: 'Регистрация показаний приборов учета для лицевого счета',
    modal: true,

    requires: [
        'B4.ux.button.Close',
        'B4.form.SelectFieldAddress',
        'B4.form.MonthPicker',
        'B4.ux.button.Save',
        'B4.form.CalcMonthPicker',
        'B4.form.ComboBox',
        'B4.store.finance.PersonalAccountFin',
        'B4.enums.TypePersonalAccountState',
        'B4.enums.TypeCounterSource',
        'B4.enums.PayStatus',
        'B4.enums.TypePay',
        'B4.form.MonthPicker'
    ],

    //Идентификатор ПУ
    counterId: undefined,
    //Номер ПУ
    counterNumber: 'не определено',
    capacity: undefined,
    multiplier: undefined,
    serviceName: 'не определено',
    //Лицевой счет
    personalAccountId: undefined,
    //Идентификатор банка данных
    dataBankId: undefined,

    listeners: {
        afterrender: function (view) {
            var grid = view.down('gridpanel[name=CounterValues]'),
                monthField = view.down('b4calcmonthpicker[name=ChargeDate]'),
                archiveField = view.down('checkbox[name=ShowArchive]');

            view.setTitle('Показания прибора учета №' + view.counterNumber + ' по услуге ' + view.serviceName);

            grid.on({
                rowaction: {
                    fn: function (grid, action, record) {
                        if (this.fireEvent('beforerowaction', this, grid, action, record) !== false) {
                            switch (action.toLowerCase()) {
                                case 'delete':
                                    view.deleteCounterValue(grid, record);
                                    break;
                            }
                        }
                    }
                }
            });
            grid.getStore().on({
                beforeload: function (store, operation) {
                    var me = this,
                        counterId = view.counterId,
                        dataBankId = view.dataBankId,
                        personalAccountId = view.personalAccountId,
                        valueMonth = monthField.getValue(),
                        showArchive = archiveField.getValue();

                    operation.params.counterKind = 3;
                    operation.params.counterId = counterId;
                    operation.params.personalAccountId = personalAccountId;
                    operation.params.dataBankId = dataBankId;
                    operation.params.valueMonth = valueMonth;
                    operation.params.showArchive = showArchive;
                    operation.params.showClosed = false;
                }
            });

            grid.getStore().load();
        }
    },

    //Добавление нового показания
    addCounterValue: function (button) {
        var valueGrid = button.up('gridpanel'),
            valueStore = valueGrid.getStore(),
            view = button.up('window'),
            valueMonth = view.down('b4calcmonthpicker[name=ChargeDate]').getValue();

        for (var i in valueStore.getRange()) {
            if (valueStore.getRange()[i].raw.isNewValue) {
                B4.QuickMsg.msg(
                    'Внимание',
                    'Сохраните добавленное значение',
                    'warning'
                );
                return;
            }
        }

        var yy = valueMonth.getFullYear();
        var mm = valueMonth.getMonth() + 1;
        if (mm > 11) {
            yy = yy + 1;
            mm = 0;
        }
        valueStore.insert(0, {
            CounterId: view.counterId,
            Capacity: view.capacity,
            Multiplier: view.multiplier,
            isNewValue: true,
            ValueDate: new Date(yy, mm, 1),
            CanEdit: true
        });
        valueStore.commitChanges();
    },

    //сохранение грида с показаниями
    saveCounterValue: function (btn) {
        var view = btn.up('window'),
            dataBankId = view.dataBankId,
            counterValueStrore = view.down('gridpanel').getStore(),
            editedRecords = counterValueStrore.getUpdatedRecords(),
            deletedRecords = counterValueStrore.getRemovedRecords(),
            maxValue = view.down('b4calcmonthpicker[name=ChargeDate]').maxValue,
            record;

        if (editedRecords.length == 0 && deletedRecords.length == 0) {
            B4.QuickMsg.msg(
                'Внимание',
                'Введите значения для сохранения',
                'warning'
            );
            return;
        }

        if (maxValue) {
            var yy = maxValue.getFullYear();
            var mm = maxValue.getMonth() + 1;
            if (mm > 11) {
                yy = yy + 1;
                mm = 0;
            }
            maxValue = new Date(yy, mm, 1);
        }

        for (var k in editedRecords) {
            record = editedRecords[k];

            if (record.get('ValueDate') == null || record.get('Value') == null) {
                B4.QuickMsg.msg(
                    'Внимание',
                    'Укажите у новых значений дату и показание',
                    'warning'
                );

                return;
            }
            if (record.get('ValueDate') < Ext.Date.parse(record.get('PreviousValueDate'), 'c')) {
                B4.QuickMsg.msg(
                    'Внимание',
                    'Дата нового показания должна быть позже даты предыдущего показания',
                    'warning'
                );

                return;
            }
            if (maxValue && record.get('ValueDate') > maxValue) {
                B4.QuickMsg.msg(
                    'Внимание',
                    'Дата нового показания должна не позднее текущего расчетного месяца',
                    'warning'
                );

                return;
            }
        }
        //найдем предыдущее значение по отсортированному массиву значений
        var sorted = counterValueStrore.data.items.sort(
            function (a, b) {

                var d1 = a.get('ValueDate') != null ? new Date(a.get('ValueDate')) : new Date();
                var d2 = b.get('ValueDate') != null ? new Date(b.get('ValueDate')) : new Date();
                if (d1 < d2)
                    return -1;
                if (d1 > d2)
                    return 1;

                return 0;
            }
        );
        var bigVal = false;
        for (var j = 0; j < sorted.length; j++) {

            if (j < sorted.length - 1) {
                var curVal = (sorted[j + 1].get('Value') - sorted[j].get('Value')) * sorted[j].get('Multiplier');

                if (curVal < 0) {
                    //переход через 0
                    var addv = Math.pow(10, sorted[j].get('Capacity'));
                    curVal = curVal + addv;
                }

                if (curVal > 1000) {
                    bigVal = true; //большой расход
                }
            }
        }
        if (bigVal) {
            Ext.Msg.confirm('Внимание!', 'В данных обнаружен большой расход, вы действительно хотите сохранить эти показания?', function (result) {
                if (result == 'yes') {

                    view.saveData(view, editedRecords, deletedRecords, counterValueStrore, dataBankId);

                }
            }, this);
        } else {
            view.saveData(view, editedRecords, deletedRecords, counterValueStrore, dataBankId);
        }
    },

    saveData: function (view, editedRecords, deletedRecords, counterValueStrore, dataBankId) {
        var record,
            valuesList = [],
            deletedList = [],
            id, i;

        //заполняем список с измененными значениями
        for (i in editedRecords) {
            record = editedRecords[i];

            id = record.get('Id');

            valuesList.push({
                Id: id ? id + '' : '0',
                DataBank: dataBankId + '',
                CounterKind: 3 + '',
                CounterId: record.get('CounterId') + '',
                Value: record.get('Value'),
                ValueDate: record.get('ValueDate'),
                SourceId: record.get('SourceId')
            });
        }
        //заполняем список с удаленными значениями
        for (i in deletedRecords) {
            record = deletedRecords[i];

            id = record.get('Id');

            deletedList.push({
                Id: id ? id + '' : '0',
                DataBank: dataBankId + '',
                CounterKind: 3 + '',
                CounterId: record.get('CounterId') + '',
                Value: record.get('Value'),
                ValueDate: record.get('ValueDate'),
                SourceId: record.get('SourceId')
            });
        }

        view.getEl().mask('Сохранение...');
        B4.Ajax.request({
            url: B4.Url.action('/CounterValue/SaveCounterValue'),
            params: {
                dataBankId: dataBankId,
                valuesList: Ext.encode([valuesList]),
                deletedList: Ext.encode([deletedList])
            }
        }).next(function (resp) {
            view.getEl().unmask();
            var response = Ext.decode(resp.responseText).data;
            if (response.success) {
                B4.QuickMsg.msg('Выполнено', 'Данные успешно сохранены', 'success');
            } else {
                B4.QuickMsg.msg('Внимание', response.message, 'warning');
            }
            counterValueStrore.load();
            view.fireEvent('saved');
        }).error(function (resp) {
            view.getEl().unmask();
        });
    },

    deleteCounterValue: function (grid, record) {
        var view = grid.up('window'),
            store = grid.getStore();

        if (record.get('CanEdit') === true) {
            Ext.Msg.confirm('Удаление показания!', 'Вы действительно хотите удалить запись?', function (result) {
                if (result == 'yes') {
                    store.remove(record);

                    B4.QuickMsg.msg(
                        'Внимание',
                        'Запись удалена. Для фиксации изменении в базе данных необходимо в списке показаний нажать кнопку "Сохранить"',
                        'warning'
                    );

                }
            });
        }
    },

    initComponent: function () {
        var me = this,
            counterValueStore = Ext.create('B4.store.register.personalaccount.counter.CounterValue');

        Ext.applyIf(me, {
            items: [
                {
                    xtype: 'gridpanel',
                    name: 'CounterValues',
                    store: counterValueStore,
                    flex: 1,
                    title: '',
                    border: false,
                    columns: [
                        {
                            xtype: 'gridcolumn',
                            dataIndex: '',
                            flex: 1,
                            text: 'Дата снятия',
                            columns: [
                                {
                                    xtype: 'datecolumn',
                                    dataIndex: 'ValueDate',
                                    width: 100,
                                    text: 'Текущая',
                                    format: 'd.m.Y',
                                    getEditor: function (record) {
                                        return me.getDateEditor(record);
                                    },
                                    renderer: function (value, meta, record) {
                                        if (record.get('Id') > 0 && !record.get('CanEdit')) return Ext.Date.format(new Date(value), 'd.m.Y');

                                        if (record.raw.isNewValue && !value) {
                                            return '<font color="blue">Введите дату снятия</font>';
                                        } else {
                                            return '<font color="blue">' + Ext.Date.format(new Date(value), 'd.m.Y') + '</font>';
                                        }
                                    },
                                    sortable: false
                                },
                                {
                                    xtype: 'datecolumn',
                                    dataIndex: 'PreviousValueDate',
                                    width: 100,
                                    text: 'Предыдущая',
                                    format: 'd.m.Y',
                                    sortable: false
                                }
                            ],
                            sortable: false
                        },
                        {
                            dataIndex: '',
                            flex: 1,
                            text: 'Показание',
                            columns: [
                                {
                                    xtype: 'numbercolumn',
                                    dataIndex: 'Value',
                                    width: 100,
                                    text: 'Текущее',
                                    getEditor: function (record) {
                                        return me.getValueEditor(record);
                                    },
                                    renderer: function (value, meta, record) {
                                        if (record.get('Id') > 0 && !record.get('CanEdit')) return value;
                                        if (record.raw.isNewValue && !value) {
                                            return '<font color="blue">Введите новое показание</font>';
                                        } else {
                                            return '<font color="blue">' + me.numberRenderer(value) + '</font>';
                                        }
                                    },
                                    sortable: false
                                },
                                {
                                    xtype: 'numbercolumn',
                                    dataIndex: 'PreviousValue',
                                    width: 100,
                                    renderer: me.numberRenderer,
                                    text: 'Предыдущее',
                                    sortable: false
                                }
                            ],
                            sortable: false
                        },
                        {
                            xtype: 'numbercolumn',
                            text: 'Источник',
                            dataIndex: 'SourceId',
                            width: 130,
                            getEditor: function (record) {
                                return me.getEnumEditor(record);
                            },
                            renderer: function (value, meta, record) {
                                if (record.get('Id') > 0 && !record.get('CanEdit')) return me.enumRenderer(value, record);


                                if (record.raw.isNewValue && !value) {
                                    return '<font color="blue">Введите источник</font>';
                                } else {
                                    return '<font color="blue">' + me.enumRenderer(value, record) + '</font>';
                                }
                            },
                            sortable: false
                        },
                        {
                            xtype: 'numbercolumn',
                            dataIndex: 'Consumption',
                            text: 'Расход',
                            renderer: me.numberRenderer,
                            flex: 1,
                            sortable: false
                        },
                        {
                            xtype: 'gridcolumn',
                            dataIndex: 'UserName',
                            text: 'Кто изменил',
                            widh: 140,
                            sortable: false
                        },
                        {
                            xtype: 'b4deletecolumn',
                            renderer: function (value, meta, record) {
                                var column = this;
                                column.icon = (record.get('CanEdit') != true || record.get('IsArchive')) ? '' : B4.Url.content('content/img/icons/delete.png');
                                column.tooltip = (record.get('CanEdit') != true || record.get('IsArchive')) ? '' : 'Удалить';
                                return value;
                            },
                            sortable: false
                        }
                    ],
                    plugins: [
                        Ext.create('Ext.grid.plugin.CellEditing', {
                            clicksToEdit: 1,
                            pluginId: 'CellEditing'
                        })
                    ],
                    viewConfig: {
                        loadMask: true,
                        getRowClass: function (record, rowIndex, rowParams, store) {
                            if (record.get('IsArchive'))
                                return 'font-tomato-noimportant';
                        }
                    },
                    features: [
                        {
                            ftype: 'summary'
                        }
                    ],
                    dockedItems: [
                        {
                            xtype: 'toolbar',
                            dock: 'top',
                            items: [
                                {
                                    xtype: 'buttongroup',
                                    margin: '0 0 0 5',
                                    columns: 3,
                                    defaults: {
                                        labelWidth: 120,
                                        labelAlign: 'right'
                                    },
                                    items: [
                                        {
                                            xtype: 'button',
                                            name: 'SaveCounterValue',
                                            text: 'Сохранить',
                                            tooltip: 'Сохранить',
                                            iconCls: 'icon-accept',
                                            listeners: {
                                                click: me.saveCounterValue
                                            }
                                        },
                                        {
                                            xtype: 'button',
                                            name: 'RefreshCounterValue',
                                            text: 'Обновить',
                                            tooltip: 'Обновить',
                                            iconCls: 'icon-arrow-refresh',
                                            listeners: {
                                                click: function () {
                                                    this.up('gridpanel').getStore().load();
                                                }
                                            }
                                        },
                                        {
                                            xtype: 'button',
                                            name: 'AddCounterValue',
                                            text: 'Добавить',
                                            tooltip: 'Добавить',
                                            iconCls: 'icon-add',
                                            listeners: {
                                                click: me.addCounterValue
                                            }
                                        }
                                    ]
                                },
                                {
                                    xtype: 'buttongroup',
                                    margin: '0 0 0 5',
                                    columns: 3,
                                    defaults: {
                                        labelWidth: 120,
                                        labelAlign: 'right'
                                    },
                                    items: [
                                        {
                                            xtype: 'b4calcmonthpicker',
                                            name: 'ChargeDate',
                                            labelWidth: 95,
                                            labelAlign: 'right',
                                            fieldLabel: 'Расчетный месяц'
                                        },
                                        {
                                            xtype: 'checkbox',
                                            name: 'ShowArchive',
                                            fieldLabel: 'Показать архивные',
                                            listeners: {
                                                change: function (cmp) {
                                                    cmp.up('gridpanel').getStore().load();
                                                }
                                            }
                                        }
                                    ]
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
                                                click: function () {
                                                    this.up('window').close();
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

    //Получить editor для показания
    getValueEditor: function (record) {
        if (record.get('Id') > 0 && !record.get('CanEdit')) return null;

        return Ext.create('Ext.grid.CellEditor', {
            field: Ext.create('Ext.form.field.Number', {
                hideTrigger: true,
                maxValue: 9999999,
                decimalPrecision: 7,
                validator: function (value) {
                    if (value < 0) {
                        return 'Значение должно быть положительным';
                    }
                    return true;
                }
            })
        });
    },

    //Получить editor для источника
    getEnumEditor: function (record) {
        if (record.get('Id') > 0 && !record.get('CanEdit')) return null;

        return Ext.create('Ext.grid.CellEditor', {
            field: Ext.create('B4.form.ComboBox', {
                storeAutoLoad: true,
                editable: false,
                store: B4.enums.TypeCounterSource.getStore(),
                displayField: 'Display',
                valueField: 'Value',
                allowBlank: false
            })
        });
    },

    enumRenderer: function (value, record) {
        var val = B4.enums.TypeCounterSource.displayRenderer(value);
        if (val > 0)
            val = record.get('SourceName');

        return val;
    },

    //Получить editor для даты снятия
    getDateEditor: function (record) {
        if (record.get('Id') > 0 && !record.get('CanEdit')) return null;

        return Ext.create('Ext.grid.CellEditor', {
            field: Ext.create('Ext.form.field.Date')
        });
    },

    numberRenderer: function (value, metaData, record) {
        return Ext.util.Format.number(parseFloat(value), '0,000.0000000').replace(',', '.');
    }
});