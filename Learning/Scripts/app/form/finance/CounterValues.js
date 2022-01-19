/*
   Финансы - окно показаний приборов учета для ЛС
*/
Ext.define('B4.form.finance.CounterValues', {
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
        'B4.form.MonthPicker',
        'B4.ux.button.Save',
        'B4.form.ComboBox',
        'B4.store.finance.PersonalAccountFin',
        'B4.enums.TypePersonalAccountState',
        'B4.enums.PayStatus',
        'B4.enums.TypePay',
        'B4.store.finance.PackLog',
        'B4.ux.grid.toolbar.Paging',
        'B4.form.MonthPicker'
    ],

    //Лицевой счет
    personalAccountId: undefined,
    //Идентификатор банка данных
    dataBankId: undefined,

    listeners: {
        afterrender: function (view) {
            var me = this,
                counterValuesGrid = view.down('gridpanel[name=CounterValues]'),
                counterValuesStore = counterValuesGrid.getStore(),
                    cellEditingPlugin = counterValuesGrid.getPlugin('CellEditing');

            view.setTitle('Регистрация показаний приборов учета для лицевого счета: №' + view.personalAccountId + ', адрес ' + view.address);

            counterValuesStore.on({
                beforeload: function (curStore, operation) {
                    operation.params = operation.params || {};
                    operation.params.personalAccountId = view.personalAccountId;
                    operation.params.dataBankId = view.dataBankId;
                },
                load: function (curStore) {
                    //Включаем редактирование первой строки
                    var rec = curStore.getRange()[0];
                    if (rec) {
                        cellEditingPlugin.startEdit(rec, 5);
                    }
                }
            });

            counterValuesStore.load();
        }
    },
    
    saveValues: function (btn) {
        var me = this,
            view = btn.up('window'),
            grid = view.down('gridpanel[name=CounterValues]');

        view.getEl().mask('Сохранение показаний...');

        B4.Ajax.request({
            url: B4.Url.action('SaveCounterValuesList', 'CounterValue'),
            timeout: 9999999,
            method: 'POST',
            params: {
                dataBankId: view.dataBankId,
                valuesList: Ext.encode(Ext.pluck(grid.getStore().getModifiedRecords(), 'data')),
                personalAccountId: view.personalAccountId
            }
        }).next(function (resp) {
            var result = Ext.decode(resp.responseText);

            view.getEl().unmask();
            grid.getStore().load();

            if (result.success) {
                B4.QuickMsg.msg('Выполнено', result.message, 'success', 5000);

                if (result.data.CalculationStarted) {
                    view.getEl().mask('Расчет...');
                }
            } else {
                B4.QuickMsg.msg('Внимание', result.message, 'warning');
            }

        }).error(function () {
            B4.QuickMsg.msg('Внимание', 'Во время выполнения сохранения произошла ошибка', 'warning');
        });
    },

    showReport: function (btn) {
        var view = btn.up('window');
        var position = 100;
        Ext.create('B4.form.Window', {
            title: 'Справка по фактическим объемам коммунальных ресурсов',
            width: 700,
            height: 500,
            plain: true,
            constrain: true,
            x: position,
            y: position,
            html: '<iframe src="' + B4.Url.action('/Counter/CounterValuesReportPdf?personalAccountId=' + view.personalAccountId + '&dataBankId=' + view.dataBankId) +
                '" width="100%" height="100%" />'
        }).show();
    },

    initComponent: function () {
        var me = this,
            counterValuesStore = Ext.create('B4.store.finance.payment.CounterValues', {
                proxy: {
                    type: 'b4proxy',
                    controllerName: 'Counter',
                    listAction: 'CounterFullList'
                }
            });

        Ext.applyIf(me, {
            items: [
                {
                    xtype: 'gridpanel',
                    name: 'CounterValues',
                    store: counterValuesStore,
                    flex: 1,
                    title: '',
                    border: false,
                    columns: [
                        {
                            xtype: 'actioncolumn',
                            width: 30,
                            align: 'center',
                            text: 'П',
                            items: [
                                {
                                    altText: 'Показания прибора учета',
                                    getClass: function (v, meta, record) {
                                        return 'icon-magnifier';
                                    },
                                    handler: function (gridview, row, column, btn, meta, record) {
                                        if (record.get('DateClose')) {
                                            B4.QuickMsg.msg('Внимание', 'Прибор учета закрыт', 'info');
                                            return false;
                                        }

                                        //Открываем окно показаний ПУ по песяцам
                                        var detalizationWindow = Ext.create('B4.form.finance.CounterValuesDetalization', {
                                            counterId: record.getId(),
                                            dataBankId: me.dataBankId,
                                            personalAccountId: me.personalAccountId,
                                            capacity: record.get('Capacity'),
                                            multiplier: record.get('Multiplier'),
                                            counterNumber: record.get('Number'),
                                            serviceName: record.get('ServiceName'),
                                            payerId: record.get('ServiceName')
                                        });

                                        detalizationWindow.on({
                                            saved: function () {
                                                gridview.getStore().load();
                                            }
                                        });

                                        detalizationWindow.show();
                                    },
                                    sortable: false
                                }
                            ],
                            sortable: false
                        },
                        {
                            xtype: 'gridcolumn',
                            dataIndex: 'ServiceName',
                            flex: 1,
                            text: 'Услуга',
                            sortable: false
                        },
                        {
                            xtype: 'gridcolumn',
                            dataIndex: 'Number',
                            flex: 1,
                            text: 'Прибор учета',
                            sortable: false
                        },
                        {
                            xtype: 'datecolumn',
                            dataIndex: 'DateClose',
                            flex: 1,
                            format: 'd.m.Y',
                            text: 'Дата закрытия',
                            sortable: false
                        },
                        {
                            xtype: 'gridcolumn',
                            dataIndex: 'PreviousValue',
                            flex: 1,
                            text: 'Предыдущее показание',
                            sortable: false
                        },
                        {
                            xtype: 'datecolumn',
                            dataIndex: 'PreviousValueDate',
                            format: 'd.m.Y',
                            flex: 1,
                            text: 'Дата снятия пред. показания',
                            sortable: false
                        },
                        {
                            xtype: 'numbercolumn',
                            dataIndex: 'Value',
                            flex: 1,
                            text: 'Текущее показание',
                            renderer: function (value, meta, record) {
                                if (record.raw.isNewValue && !value) {
                                    return '<font color="blue">Введите новое показание</font>';
                                } else {
                                    return '<font color="blue">' + me.numberRenderer(value) + '</font>';
                                }
                            },
                            getEditor: function (record, column) {
                                if (record.get('DateClose')) {
                                    B4.QuickMsg.msg('Внимание', 'Прибор учета закрыт', 'info');
                                    return false;
                                }

                                return Ext.create('Ext.grid.CellEditor', {
                                    field: Ext.create('Ext.form.field.Number', {
                                        hideTrigger: true,
                                        decimalPrecision: 7,
                                        maxValue: 9999999,
                                        customFormat: '0.00',
                                        validator: function (value) {
                                            if (value < 0) {
                                                return 'Значение должно быть положительным';
                                            }
                                            return true;
                                        }
                                    })
                                });
                            },
                            sortable: false
                        },
                        {
                            xtype: 'datecolumn',
                            dataIndex: 'ValueDate',
                            flex: 1,
                            format: 'd.m.Y',
                            text: 'Дата снятия тек. показания',
                            getEditor: function (record, column) {
                                if (record.get('DateClose')) {
                                    B4.QuickMsg.msg('Внимание', 'Прибор учета закрыт', 'info');
                                    return false;
                                }

                                return Ext.create('Ext.grid.CellEditor', {
                                    field: Ext.create('Ext.form.field.Date')
                                });
                            },
                            renderer: function (value, meta, record) {
                                if (record.raw.isNewValue && !value) {
                                    return '<font color="blue">Введите дату снятия</font>';
                                } else {
                                    return '<font color="blue">' + Ext.Date.format(new Date(value), 'd.m.Y') + '</font>';
                                }
                            },
                            sortable: false
                        },
                        {
                            xtype: 'gridcolumn',
                            dataIndex: 'Consumption',
                            flex: 1,
                            text: 'Расход',
                            sortable: false
                        },
                        {
                            xtype: 'gridcolumn',
                            dataIndex: 'ConsumptionWithCoefficient',
                            flex: 1,
                            text: 'Расход с учетом коэф.',
                            sortable: false
                        },
                        {
                            xtype: 'gridcolumn',
                            dataIndex: 'ConsumptionPay',
                            flex: 1,
                            text: 'Расход к оплате по услуге',
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
                        loadMask: true
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
                                    items: [
                                        {
                                            xtype: 'button',
                                            name: 'Save',
                                            text: 'Сохранить',
                                            iconCls: 'icon-accept',
                                            listeners: {
                                                click: {
                                                    fn: me.saveValues,
                                                    scope: me
                                                }
                                            }
                                        },
                                        {
                                            xtype: 'button',
                                            name: 'Report',
                                            text: 'Справка по фактическим объемам коммунальных ресурсов',
                                            iconCls: 'icon-page',
                                            listeners: {
                                                click: me.showReport
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
                                                click: function (btn) {
                                                    btn.up('window').close();
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
        return Ext.util.Format.number(parseFloat(value), '0,000.0000000').replace(',', '.');
    }
});