/*
   Окно изменения сальдо
*/
Ext.define('B4.form.register.personalaccount.saldo.ServiceSaldoEdit', {
    extend: 'B4.form.Window',
    alias: 'widget.servicesaldoedit',

    mixins: ['B4.mixins.window.ModalMask'],
    width: 900,
    autoHeight: true,
    layout: 'anchor',
    title: 'Изменение сальдо по услугам',
    modal: true,

    dataBankId: undefined,
    personalAccountId: undefined,

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
        'B4.ux.grid.toolbar.Paging',
        'B4.enums.TypeSaldoEditServiceStandart'
    ],

    listeners: {
        afterrender: function (view) {
            var typeField = view.down('b4combobox[name=TypeId]'),
                standartField = view.down('b4combobox[name=Standart]'),
                distribField = view.down('numberfield[name=DistributionSum]'),
                grid = view.down('gridpanel[name=Services]');

            typeField.on({
                //При изменении типа, если выбрали изменение расхода + учет ОДН, показываем поля с тарифом и объемом
                change: function (cmp, value) {
                    view.down('container[name=VolumeTariff]').setVisible(false);
                    view.down('textfield[name=Tariff]').allowBlank = true;
                    view.down('radiogroup').setValue({ rb: 2 });
                    view.down('container[name=standartContainer]').setVisible(true);
                    view.down('numbercolumn[dataIndex=Sum]').show();

                    switch (value) {
                        case 8: //Снятие (обнуление) общего сальдо
                        case 81: //Снятие (обнуление) дебитового сальдо
                        case 82: //Снятие (обнуление) кредитового сальдо
                            {
                                view.down('container[name=standartContainer]').setVisible(false);
                                view.down('b4combobox[name=Standart]').setValue(4);
                                view.down('numbercolumn[dataIndex=Sum]').hide();
                                break;
                            }
                        case 163: //"Изменение расхода + Учет ОДН"
                            {
                                view.down('container[name=VolumeTariff]').setVisible(true);
                                view.down('textfield[name=Tariff]').allowBlank = false;
                                break;
                            }
                    }

                    view.getForm().isValid();

                    grid.getStore().load();
                }
            });
            typeField.getStore().on({
                beforeload: function (curStore, operation) {
                    operation.params = operation.params || {};
                    operation.params.dataBankId = view.dataBankId;
                },
                load: function (curStore) {
                    curStore.removeAt(curStore.findExact('Id',7)); //Удаляем из стора тип Перенос сальдо
                }
            });

            grid.getView().on({
                //Восстанавливаем выделенные записи после изменения значений
                itemupdate: function (record, index, node, eOpts) {
                    grid.getSelectionModel().deselectAll();
                    grid.selectedRows.forEach(function (index) {
                        grid.getSelectionModel().select(index, true);
                    });
                }
            });
            grid.getStore().on({
                beforeload: function (curStore, operation) {
                    operation.params = operation.params || {};
                    operation.params.dataBankId = view.dataBankId;
                    operation.params.personalAccountId = view.personalAccountId;
                    operation.params.standart = standartField.getValue();
                    operation.params.distributionSum = distribField.getValue();
                },
                load: function () {
                    //Выбираем указанных получателей
                    if (grid.selectedRows && grid.selectedRows.length > 0) {
                        grid.selectedRows.forEach(function (index) {
                            grid.getSelectionModel().select(index, true);
                        });
                    } else {
                        //Выбираем всех получателей
                        grid.getSelectionModel().selectAll();
                    }
                }
            });

            standartField.on({
                change: function (cmp, newValue, oldValue) {
                    var columnTitle = cmp.getStore().findRecord('Value', newValue).get('Display');

                    distribField.setValue();
                    grid.selectedRows = null;
                    //Если выбран стандарт, связанный с %, меняем текст поля распределения на %
                    if (newValue == 7 || newValue == 8 || newValue == 81 || newValue == 82 || newValue == 9) {
                        distribField.setFieldLabel('%');
                    } else {
                        distribField.setFieldLabel('Сумма');
                    }

                    //Устанавливаем наименование колонки
                    switch (newValue) {
                        case 7: //'Процент по входящему сальдо'
                            {
                                columnTitle = 'Входящее сальдо';
                                break;
                            }
                        case 8: //Процент равноправно
                        case 81:
                        case 82:
                            {
                                columnTitle = 'Начислено за месяц';
                                break;
                            }
                    }

                    grid.down('gridcolumn[dataIndex=Charge]').setText(columnTitle);
                    grid.getStore().load();
                }
            });

            grid.getStore().load();
            view.getForm().isValid();
        }
    },

    distributeSum: function (btn) {
        var view = btn.up('window'),
            distribField = view.down('numberfield[name=DistributionSum]'),
            grid = view.down('gridpanel[name=Services]'),
            recordsToSave;

        if (grid.getSelectionModel().getSelection().length == 0) {
            B4.QuickMsg.msg('Внимание', 'Выберите записи для распределения', 'warning');
            return;
        }

        //Запоминаем выделенные записи
        grid.selectedRows = grid.getSelectionModel().getSelection().map(function (item) {
            return item.index;
        });

        recordsToSave = grid
            .getSelectionModel()
            .getSelection()
            .map(function (item) {
                return {
                    ServiceId: item.get('ServiceId'),
                    SupplierId: item.get('SupplierId'),
                    Sum: item.get('Sum'),
                    Charge: item.get('Charge')
                };
            });

        grid.getStore().load({
            params: {
                selectedRecords: Ext.encode(recordsToSave)
            }
        });
    },

    save: function (btn) {
        var view = btn.up('window'),
            grid = view.down('gridpanel[name=Services]'),
            type = view.down('b4combobox[name=TypeId]').getValue(),
            tariff = view.down('textfield[name=Tariff]').getValue(),
            volume = view.down('textfield[name=Volume]').getValue(),
            baseDocumentType = view.down('b4combobox[name=BaseDocumentType]').getValue(),
            baseDocumentNumber = view.down('textfield[name=BaseDocumentNumber]').getValue(),
            baseDocumentDate = view.down('datefield[name=BaseDocumentDate]').getValue(),
            baseDocumentReason = view.down('textfield[name=BaseDocumentReason]').getValue(),
            selectedRecords = grid.getSelectionModel().getSelection(),
            returning = false;

        if (!view.getForm().isValid()) {
            B4.QuickMsg.msg('Внимание', 'Не все поля корректно заполнены', 'warning');
            return;
        }

        if (selectedRecords.length == 0) {
            B4.QuickMsg.msg('Внимание', 'Выберите записи для сохранения', 'warning');
            return;
        }

        if (grid.down('numbercolumn[dataIndex=Sum]').isVisible()) {
            Ext.each(selectedRecords, function (item) {
                if (!item.get('Sum')) {
                    returning = true;
                }
            });
            if (returning) {
                B4.QuickMsg.msg('Внимание', 'У выбранных записей укажите сумму', 'warning');
                return;
            }
        }

        view.getEl().mask('Сохранение...');
        B4.Ajax.request({
            url: B4.Url.action('/SaldoEdit/SaveList'),
            params: {
                dataBankId: view.dataBankId,
                personalAccountId: view.personalAccountId,
                typeId: type,
                tariff: tariff,
                volume: volume,
                baseDocumentType: baseDocumentType,
                baseDocumentNumber: baseDocumentNumber,
                baseDocumentDate: baseDocumentDate,
                baseDocumentReason: baseDocumentReason,

                records: Ext.encode(Ext.pluck(selectedRecords, 'data'))
            }
        }).next(function (resp) {
            view.getEl().unmask();
            var response = Ext.decode(resp.responseText);
            if (response.success) {
                B4.QuickMsg.msg('Выполнено', 'Данные успешно сохранены', 'success');
                view.fireEvent('saved');
                view.close();
            } else {
                B4.QuickMsg.msg('Внимание', resp.message, 'warning');
            }
        }).error(function (resp) {
            view.getEl().unmask();
            B4.QuickMsg.msg('Внимание', 'При выполнении операции произошла ошибка', 'warning');
        });
    },

    clearSum: function (btn) {
        var view = btn.up('window'),
            grid = view.down('gridpanel');

        view.down('numberfield[name=DistributionSum]').setValue();
        grid.getStore().load();
    },

    initComponent: function () {
        var me = this,
            servicesStore = Ext.create('B4.store.register.personalaccount.saldo.ServiceSaldoEdit');

        Ext.applyIf(me, {
            defaults: {
                margin: '5 5 0 5'
            },
            items: [
                {
                    xtype: 'container',
                    layout: 'hbox',
                    items: [
                        {
                            xtype: 'b4combobox',
                            flex: 1,
                            name: 'TypeId',
                            displayField: 'Name',
                            valueField: 'Id',
                            queryMode: 'local',
                            labelAlign: 'right',
                            editable: false,
                            url: '/HouseSaldo/ListTypesWithoutPaging',
                            allowBlank: false,
                            fieldLabel: 'Тип перекидки'
                        },
                        {
                            xtype: 'container',
                            flex: 1
                        }
                    ]
                },
                {
                    xtype: 'container',
                    name: 'VolumeTariff',
                    hidden: true,
                    layout: 'hbox',
                    items: [
                        {
                            xtype: 'container',
                            flex: 1,
                            items: [
                                {
                                    xtype: 'radiogroup',
                                    name: 'CalcRadioGroup',
                                    fieldLabel: 'Вычислять',
                                    margin: '5 5 0 5',
                                    labelWidth: 85,
                                    labelAlign: 'right',
                                    columns: 1,
                                    vertical: true,
                                    items: [
                                        {
                                            boxLabel: 'по объему и тарифу',
                                            name: 'rb',
                                            inputValue: '1'
                                        },
                                        {
                                            boxLabel: 'по сумме и тарифу',
                                            name: 'rb',
                                            inputValue: '2'
                                        }
                                    ],
                                    listeners: {
                                        change: function (obj, value) {
                                            var view = obj.up('window'),
                                                volumeField = view.down('textfield[name=Volume]');

                                            if (value.rb == 1) //по объему и тарифу
                                            {
                                                volumeField.enable();
                                                volumeField.allowBlank = false;
                                            } else //по сумме и тарифу
                                            {
                                                volumeField.disable();
                                                volumeField.allowBlank = true;
                                                volumeField.setValue('');
                                            }

                                            view.getForm().isValid();
                                        }
                                    }
                                }
                            ]
                        },
                        {
                            xtype: 'container',
                            flex: 1,
                            layout: 'anchor',
                            items: [
                                {
                                    xtype: 'textfield',
                                    name: 'Tariff',
                                    margin: '5 5 0 5',
                                    anchor: '100%',
                                    labelAlign: 'right',
                                    maskRe: /[0-9.]/,
                                    fieldLabel: 'Тариф'
                                },
                                {
                                    xtype: 'textfield',
                                    name: 'Volume',
                                    margin: '5 5 0 5',
                                    labelAlign: 'right',
                                    anchor: '100%',
                                    maskRe: /[0-9.]/,
                                    disabled: true,
                                    fieldLabel: 'Объем(расход)'
                                }
                            ]
                        }
                    ]
                },
                {
                    xtype: 'fieldset',
                    layout: 'anchor',
                    title: 'Документ-основание',
                    items: [
                        {
                            xtype: 'container',
                            layout: 'hbox',
                            items: [
                                {
                                    xtype: 'b4combobox',
                                    allowBlank: false,
                                    labelWidth: 85,
                                    labelAlign: 'right',
                                    fieldLabel: 'Наименование',
                                    editable: false,
                                    flex: 1,
                                    url: '/Dictionary/GetListTypeDoc',
                                    name: 'BaseDocumentType'
                                },
                                {
                                    xtype: 'container',
                                    flex: 1,
                                    layout: 'hbox',
                                    items: [
                                        {
                                            xtype: 'container',
                                            flex: 1
                                        },
                                        {
                                            xtype: 'textfield',
                                            fieldLabel: 'Номер',
                                            allowBlank: false,
                                            labelAlign: 'right',
                                            maxLength: 20,
                                            name: 'BaseDocumentNumber'
                                        },
                                        {
                                            xtype: 'datefield',
                                            fieldLabel: 'Дата',
                                            labelAlign: 'right',
                                            name: 'BaseDocumentDate',
                                            allowBlank: false,
                                            labelWidth: 50,
                                            width: 150
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            xtype: 'textfield',
                            anchor: '100%',
                            labelWidth: 85,
                            maxLength: 100,
                            labelAlign: 'right',
                            margin: '5 0 0 0',
                            allowBlank: false,
                            fieldLabel: 'Основание',
                            name: 'BaseDocumentReason',
                            validator: function (value) {
                                if (value && value.includes('\\')) {
                                    return 'Основание не должно содержать символ \\ !';
                                }
                                return true;
                            }
                        }
                    ]
                },
                {
                    xtype: 'container',
                    name: 'standartContainer',
                    layout: 'hbox',
                    items: [
                        {
                            xtype: 'b4combobox',
                            flex: 1,
                            labelAlign: 'right',
                            name: 'Standart',
                            displayField: 'Display',
                            valueField: 'Value',
                            queryMode: 'local',
                            editable: false,
                            value: 2,
                            store: B4.enums.TypeSaldoEditServiceStandart.getStore(),
                            allowBlank: false,
                            fieldLabel: 'Эталон'
                        },
                        {
                            xtype: 'container',
                            flex: 1,
                            layout: 'hbox',
                            items: [
                                {
                                    xtype: 'container',
                                    flex: 1
                                },
                                {
                                    xtype: 'numberfield',
                                    fieldLabel: 'Сумма',
                                    labelAlign: 'right',
                                    name: 'DistributionSum',
                                    hideTrigger: true
                                },
                                {
                                    xtype: 'button',
                                    margin: '0 0 0 10',
                                    width: 100,
                                    text: 'Распределить',
                                    name: 'Distribute',
                                    listeners: {
                                        click: me.distributeSum
                                    }
                                }
                            ]
                        }
                    ]
                },
                {
                    xtype: 'gridpanel',
                    name: 'Services',
                    store: servicesStore,
                    height: 300,
                    margin: 5,
                    selType: 'checkboxmodel',
                    selModel: {
                        checkOnly: true,
                        mode: 'MULTI'
                    },
                    flex: 1,
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
                            xtype: 'gridcolumn',
                            dataIndex: 'Charge',
                            flex: 1,
                            summaryType: 'sum',
                            summaryRenderer: function (value, metaData, record) {
                                var standart = me.down('b4combobox[name=Standart]').getValue();

                                if (standart == 5 || standart == 6) {
                                    return '';
                                }

                                return me.numberRenderer(value, metaData, record);
                            },
                            text: 'Начислено за месяц'
                        },
                        {
                            xtype: 'numbercolumn',
                            dataIndex: 'Sum',
                            flex: 1,
                            summaryType: 'sum',
                            summaryRenderer: me.numberRenderer,
                            text: 'Сумма',
                            renderer: me.numberRenderer,
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
                            clicksToEdit: 1,
                            pluginId: 'CellEditing',
                            //Запоминаем выделенные строки и восстанавливаем их после редактирования
                            listeners: {
                                beforeedit: function (editor, context, eOpts) {
                                    context.grid.selectedRows = context.grid.getSelectionModel().getSelection().map(function (item) {
                                        return item.index;
                                    });
                                },
                                validateedit: function (editor, context, eOpts) {
                                    context.grid.selectedRows.forEach(function (index) {
                                        context.grid.getSelectionModel().select(index, true);
                                    });
                                },
                                canceledit: function (editor, context, eOpts) {
                                    context.grid.selectedRows.forEach(function (index) {
                                        context.grid.getSelectionModel().select(index, true);
                                    });
                                }
                            }
                        })
                    ],
                    viewConfig: {
                        loadMask: true
                    },
                    features: [
                        {
                            ftype: 'summary'
                        }
                    ]
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
                                        click: me.save
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
        });

        me.callParent(arguments);
    },

    numberRenderer: function (value, metaData, record) {
        return Ext.util.Format.number(parseFloat(value), '0,000.00').replace(',', '.');
    }
});