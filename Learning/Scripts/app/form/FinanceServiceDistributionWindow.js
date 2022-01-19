/*
   Финансы - окно распределения по услугам
*/
Ext.define('B4.form.FinanceServiceDistributionWindow', {
    extend: 'B4.form.Window',
    alias: 'widget.finanseservicedistributionwindow',

    mixins: ['B4.mixins.window.ModalMask'],
    width: 900,
    height: 400,
    layout: 'fit',
    title: 'Уточнение суммы оплаты по услугам для получателя ',
    modal: true,

    //Параметры:
    //месяц оплаты
    payMonth: undefined,
    //статус оплаты
    payStatus: undefined,
    //Идентификатор оплаты
    payId: undefined,
    //год схемы, в которой оплата
    payYear: undefined,
    //Оплачиваемая сумма по услугам
    sumPay: undefined,
    //Оплачиваемая сумма по пени
    sumFines: 0,
    //Идентификатор ЛС
    personalAccountId: undefined,
    //платежный код
    pkod: undefined,
    //тип платежного кода    
    pkodtype: undefined,
    //Дата приема оплаты
    payDate: undefined,
    //Идентификатор банка данных
    dataBankId: undefined,
    //Идентификатор получателя
    receiverId: undefined,
    principalId: undefined,
    //Наименование получателя
    receiverName: '',
    //Признак новой оплаты
    isNewPay: false,
    //Список распределенных сумм
    distributedSum: undefined,

    requires: [
        'B4.ux.button.Close',
        'B4.form.SelectFieldAddress',
        'B4.form.MonthPicker',
        'B4.ux.button.Save',
        'B4.form.ComboBox',
        'B4.store.finance.PersonalAccountFin',
        'B4.enums.TypePersonalAccountState',
        'B4.enums.PayStatus',
        'B4.enums.TypePay',
        'B4.store.finance.PackLog',
        'B4.ux.grid.toolbar.Paging'
    ],

    listeners: {
        afterrender: function (view) {
            var me = this,
                serviceSumGrid = view.down('gridpanel[name=ServiceSum]'),
                enableButtons = (me.payStatus == 0) || (me.payStatus == 2);

            //Распределить: когда не распределена или в корзине
            view.down('button[name=Distribute]').setDisabled(!enableButtons);
            view.down('button[name=Save]').setDisabled(!enableButtons);
            view.down('button[name=ClearAll]').setDisabled(!enableButtons);

            //Меняем заголовок
            view.setTitle('Уточнение суммы оплаты по услугам для получателя ' + me.receiverName);
            view.down('label[name=SumPay]').setText('Сумма оплаты: ' + Ext.util.Format.number(me.sumPay, '0,000.00').replace(',', '.'));

            //Настраиваем загрузку стора грида
            serviceSumGrid.getStore().on({
                beforeload: function (curStore, operation) {
                    //Если есть сохраненные выбранные записи, выделяем их
                    if (serviceSumGrid.selectedRows) {
                        serviceSumGrid.getSelectionModel().deselectAll();
                        serviceSumGrid.selectedRows.forEach(function (index) {
                            serviceSumGrid.getSelectionModel().select(index, true);
                        });
                    }

                    var selectedRecords = serviceSumGrid.getSelectionModel().getSelection(),
                        groupList = [];

                    if (!view.getForm().isValid()) {
                        B4.QuickMsg.msg('Внимание', 'Поля заполнены некорректно', 'warning');
                        return false;
                    }

                    Ext.each(selectedRecords, function (item) {
                        groupList.push(item.raw.Id);
                    });
                    
                    operation.params = operation.params || {};
                    operation.params.id = me.payId;
                    operation.params.pkod = me.pkod;
                    operation.params.typepkod = me.pkodtype;
                    operation.params.packDate = me.payDate;
                    operation.params.selectedMonth = view.down('b4monthpicker[name=SelectedMonth]').getValue();
                    operation.params.standart = view.down('b4combobox[name=Standart]').getValue();
                    operation.params.sum = me.sumPay;
                    operation.params.groupList = Ext.encode(groupList);
                    operation.params.personalAccountId = me.personalAccountId;
                    operation.params.dataBankId = me.dataBankId;
                    operation.params.receiverId = me.receiverId;
                    operation.params.principalId = me.principalId;
                    operation.params.isDelete = me.isDelete;
                    if (me.distributedSum) {
                        operation.params.sumList = Ext.encode(me.distributedSum);
                    }
                }
            });
            serviceSumGrid.getStore().load();
        }
    },

    //Распределить суммы оплаты по услугам
    distributeServiceSum: function (btn) {
        var grid = btn.up('gridpanel[name=ServiceSum]'),
            store = grid.getStore(),
            proxy = store.getProxy();

        grid.selectedRows = grid.getSelectionModel().getSelection().map(function (item) {
            return item.index;
        });

        store.load({
            url: B4.Url.action(proxy.distributedListAction, proxy.controllerName)
        });
    },

    //Сохранить суммы по услугам
    saveServiceSum: function (button, callback) {
        var view = button.up('window'),
            month = view.down('b4monthpicker[name=SelectedMonth]').getValue(),
            grid = button.up('gridpanel[name=ServiceSum]'),
            store = grid.getStore();

        if (!view.getForm().isValid()) {
            B4.QuickMsg.msg('Внимание', 'Поля заполнены некорректно', 'warning');
            return false;
        }
      
        //Если новая оплата - распределение сохраняем не в базу, а передаем на форму оплаты
        if (view.isNewPay) {
            view.fireEvent('distributionSaved', Ext.pluck(store.data.items, 'data'));
            view.close();
        } else {
            //Иначе - сохраняем значения сразу в базу
            view.getEl().mask('Сохранение...');
            B4.Ajax.request({
                url: B4.Url.action('SaveServiceSum', 'PayFin'),
                params: {
                    saveRecords: Ext.encode(Ext.pluck(store.data.items, 'data')),
                    paymentYear: view.payYear,
                    paymentId: view.payId,
                    personalAccountId: view.personalAccountId,
                    directSave: view.directSave,
                    dataBankId: view.dataBankId
                }
            }).next(function (resp) {
                view.getEl().unmask();
                var response = Ext.decode(resp.responseText);
                if (!response.success) {
                    B4.QuickMsg.msg('Внимание', response.message, 'warning');
                }

                view.down('gridpanel[name=ServiceSum]').getStore().load();

                if (Ext.isFunction(callback)) {
                    callback(response);
                } else {
                    B4.QuickMsg.msg('Выполнено', response.message, 'success');
                }
            }).error(function () {
                view.getEl().unmask();
                B4.QuickMsg.msg('Внимание', 'Не удалось сохранить данные', 'warning');
            });
        }
    },

    //Очистить суммы оплаты по услугам
    clearServiceSum: function (button) {
        var view = button.up('window'),
            month = view.down('b4monthpicker[name=SelectedMonth]').getValue(),
            grid = button.up('gridpanel[name=ServiceSum]');

        //Если новая оплата - удаляем уточнения только с формы оплаты
        if (view.isNewPay) {
            view.fireEvent('distributionDeleted');
            view.close();
        } else {
            //Иначе - из базы
            Ext.Msg.confirm('Внимание', 'Удалить уточненные суммы?', function (answer) {
                if (answer == 'yes') {
                    view.getEl().mask('Удаление...');
                    B4.Ajax.request({
                        url: B4.Url.action('DeleteServiceSum', 'PayFin'),
                        params: {
                            paymentYear: view.payYear,
                            paymentId: view.payId
                        }
                    }).next(function (resp) {
                        view.getEl().unmask();
                        var response = Ext.decode(resp.responseText);
                        if (response.success) {
                            B4.QuickMsg.msg('Выполнено', 'Данные успешно удалены', 'success');
                            grid.getStore().load();
                        } else {
                            B4.QuickMsg.msg('Внимание', 'При выполнении операции произошла ошибка', 'warning');
                        }
                    }).error(function (resp) {
                        B4.QuickMsg.msg('Внимание', 'При выполнении операции произошла ошибка', 'warning');
                        view.getEl().unmask();
                    });
                }
            });
        }
    },

    initComponent: function () {
        var me = this,
            serviceSumStore = Ext.create('B4.store.finance.payment.ServiceSum'),
            standartStore = Ext.create('Ext.data.Store', {
                fields: ['Id', 'Name'],
                data: [
                    {
                        "Id": 1,
                        "Name": 'Начислено к оплате'
                    },
                    {
                        "Id": 2,
                        "Name": 'Начислено за месяц'
                    },
                    {
                        "Id": 3,
                        "Name": 'Входящее сальдо'
                    },
                    {
                        "Id": 4,
                        "Name": 'Исходящее сальдо'
                    }
                ]
            });

        Ext.applyIf(me, {
            items: [
                {
                    xtype: 'gridpanel',
                    selModel: Ext.create('Ext.selection.CheckboxModel'),
                    name: 'ServiceSum',
                    store: serviceSumStore,
                    flex: 1,
                    title: '',
                    border: false,
                    columns: [
                        {
                            xtype: 'gridcolumn',
                            dataIndex: 'Service',
                            flex: 1,
                            text: 'Услуга',
                            summaryRenderer: function () {
                                return 'Итого';
                            }
                        },
                        {
                            xtype: 'gridcolumn',
                            dataIndex: 'Supplier',
                            flex: 1,
                            text: 'Договор ЖКУ'
                        },
                        {
                            xtype: 'numbercolumn',
                            dataIndex: 'Payment',
                            flex: 1,
                            text: 'Начислено к оплате',
                            summaryType: 'sum',
                            summaryRenderer: me.numberRenderer,
                            renderer: me.numberRenderer
                        },
                        {
                            xtype: 'numbercolumn',
                            dataIndex: 'Sum',
                            flex: 1,
                            text: 'Сумма',
                            summaryType: 'sum',
                            renderer: me.numberRenderer,
                            summaryRenderer: me.numberRenderer,
                            getEditor: function (record, column) {
                                return Ext.create('Ext.grid.CellEditor', {
                                    field: Ext.create('Ext.form.field.Number', {
                                        hideTrigger: true,
                                        customFormat: '0.00'
                                    })
                                });
                            }
                        }
                    ],
                    plugins: [
                        Ext.create('Ext.grid.plugin.CellEditing', {
                            clicksToEdit: 1
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
                                    xtype: 'container',
                                    flex: 1,
                                    items: [
                                        {
                                            xtype: 'container',
                                            layout: 'hbox',
                                            flex: 1,
                                            items: [
                                                {
                                                    xtype: 'buttongroup',
                                                    items: [
                                                        {
                                                            xtype: 'button',
                                                            name: 'Save',
                                                            disabled: true,
                                                            text: 'Сохранить',
                                                            iconCls: 'icon-accept',
                                                            listeners: {
                                                                click: me.saveServiceSum
                                                            }
                                                        },
                                                        {
                                                            xtype: 'b4updatebutton',
                                                            listeners: {
                                                                click: function (button) {
                                                                    var grid = button.up('gridpanel[name=ServiceSum]');
                                                                    grid.selectedRows = grid.getSelectionModel().getSelection().map(function (item) {
                                                                        return item.index;
                                                                    });
                                                                    button.up('gridpanel').getStore().load();
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
                                            xtype: 'container',
                                            layout: 'hbox',
                                            margin: '5 0 0 0',
                                            items: [
                                                {
                                                    xtype: 'b4monthpicker',
                                                    name: 'SelectedMonth',
                                                    width: 160,
                                                    fieldLabel: 'Месяц',
                                                    editable: false,
                                                    labelWidth: 40,
                                                    value: me.payMonth,
                                                    allowBlank: false,
                                                    listeners: {
                                                        change: function (field) {
                                                            var grid = field.up('gridpanel[name=ServiceSum]');
                                                            grid.selectedRows = grid.getSelectionModel().getSelection().map(function (item) {
                                                                return item.index;
                                                            });
                                                            field.up('gridpanel[name=ServiceSum]').getStore().load();
                                                        }
                                                    }
                                                },
                                                {
                                                    xtype: 'b4combobox',
                                                    name: 'Standart',
                                                    labelWidth: 45,
                                                    displayField: 'Name',
                                                    valueField: 'Id',
                                                    queryMode: 'local',
                                                    editable: false,
                                                    fieldLabel: 'Эталон',
                                                    margin: '0 5 0 5',
                                                    value: 1,
                                                    store: standartStore,
                                                    listeners: {
                                                        change: function (cmp, value, oldValue) {
                                                            var grid = cmp.up('gridpanel[name=ServiceSum]');
                                                            grid.down('gridcolumn[dataIndex=Payment]').setText(cmp.getStore().findRecord('Id', value).get('Name'));
                                                            grid.selectedRows = grid.getSelectionModel().getSelection().map(function (item) {
                                                                return item.index;
                                                            });
                                                            grid.getStore().load();
                                                        }
                                                    }
                                                },
                                                {
                                                    xtype: 'label',
                                                    name: 'SumPay',
                                                    margin: '4 5 0 5',
                                                    text: '0.00'
                                                },
                                                {
                                                    xtype: 'container',
                                                    flex: 1
                                                },
                                                {
                                                    xtype: 'buttongroup',
                                                    items: [
                                                        {
                                                            xtype: 'button',
                                                            name: 'Distribute',
                                                            disabled: true,
                                                            text: 'Распределить',
                                                            iconCls: 'icon-arrow-divide',
                                                            listeners: {
                                                                click: me.distributeServiceSum
                                                            }
                                                        },
                                                        {
                                                            xtype: 'button',
                                                            name: 'ClearAll',
                                                            disabled: true,
                                                            text: 'Очистить',
                                                            iconCls: 'icon-delete',
                                                            listeners: {
                                                                click: me.clearServiceSum
                                                            }
                                                        }
                                                    ]
                                                }
                                            ]
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
