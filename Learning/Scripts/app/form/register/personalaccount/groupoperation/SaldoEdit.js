/*
   Окно группового изменения сальдо
*/
Ext.define('B4.form.register.personalaccount.groupoperation.SaldoEdit', {
    extend: 'B4.form.Window',
    alias: 'widget.saldoeditgroup',

    mixins: ['B4.mixins.window.ModalMask'],
    width: 900,
    autoHeight: true,
    layout: 'anchor',
    title: 'Групповая операция с изменением сальдо',

    dataBankId: undefined,
    selectedPersonalAccountList: undefined,
    isHouses: false,

    requires: [
        'B4.ux.button.Close',
        'B4.form.MonthPicker',
        'B4.ux.button.Save',
        'B4.form.ComboBox',
        'B4.store.finance.PackLog',
        'B4.ux.grid.toolbar.Paging',
        'B4.enums.TypeSaldoEditServiceStandart',
        'B4.form.register.personalaccount.groupoperation.SaldoEditView'
        
    ],

    listeners: {
        afterrender: function (view) {
            var typeField = view.down('b4combobox[name=TypeId]'),
                standartField = view.down('b4combobox[name=Standart]'),
                radioGroup = view.down('radiogroup'),
                sumField = view.down('numberfield[name=Sum]'),
                volumeField = view.down('numberfield[name=Volume]'),
                tariffField = view.down('numberfield[name=Tariff]'),
                serviceFrom = view.down('b4selectfield[name=TransferServiceFrom]'),
                serviceTo = view.down('b4selectfield[name=TransferServiceTo]'),
                supplierFrom = view.down('b4selectfield[name=TransferSupplierFrom]'),
                supplierTo = view.down('b4selectfield[name=TransferSupplierTo]'),
                transferContainer = view.down('container[name=Transfer]'),
                services = view.down('b4selectfield[name=Service]'),
                suppliers = view.down('b4selectfield[name=Supplier]'),
                saldoeditgroupview = view.down('saldoeditgroupview'),
                saldoEditChargeDate = saldoeditgroupview.down('datefield[name=SaldoEditChargeDate]'),
                buttonUnload = saldoeditgroupview.down('button[name=Unload]');

            serviceFrom.on({
                change: function () {
                    supplierFrom.reset();
                    supplierFrom.getStore().load();
                }
            });
            serviceTo.on({
                change: function () {
                    supplierTo.reset();
                    supplierTo.getStore().load();
                }
            });
            serviceFrom.getStore().load();
            serviceTo.getStore().load();

            supplierFrom.getStore().on({
                beforeload: function (curStore, operation) {
                    operation.params = operation.params || {};
                    operation.params.serviceId = serviceFrom.getValue();
                    operation.params.dataBankId = view.dataBankId;
                    operation.params.personalAccountList = Ext.encode(view.selectedPersonalAccountList);
                    operation.params.isHouses = view.isHouses;
                }
            });
            supplierTo.getStore().on({
                beforeload: function (curStore, operation) {
                    operation.params = operation.params || {};
                    operation.params.serviceId = serviceFrom.getValue();
                    operation.params.dataBankId = view.dataBankId;
                    operation.params.personalAccountList = Ext.encode(view.selectedPersonalAccountList);
                    operation.params.isHouses = view.isHouses;
                }
            });

            services.on({
                change: function () {
                    suppliers.reset();
                    suppliers.getStore().load();
                }
            });

            suppliers.getStore().on({
                beforeload: function (curStore, operation) {
                    operation.params = operation.params || {};
                    operation.params.serviceId = services.getValue();
                    operation.params.dataBankId = view.dataBankId;
                    operation.params.personalAccountList = Ext.encode(view.selectedPersonalAccountList);
                    operation.params.isHouses = view.isHouses;
                }
            });

            radioGroup.setValue({ rb: 2 });

            standartField.on({
                change: function (cmp, newValue, oldValue) {
                    //Если выбран стандарт, связанный с %, меняем текст поля распределения на %
                    if (newValue == 7 || newValue == 8 || newValue == 81 || newValue == 82) {
                        sumField.setFieldLabel('%');
                    } else {
                        sumField.setFieldLabel('Сумма');
                    }
                }
            });
            typeField.on({
                //При изменении типа, если выбрали изменение расхода + учет ОДН, показываем поля
                change: function (cmp, value) {
                    sumField.enable();
                    sumField.setVisible(true);
                    tariffField.setVisible(false);
                    volumeField.setVisible(false);
                    radioGroup.setVisible(false);
                    standartField.setVisible(true);

                    tariffField.allowBlank = true;
                    volumeField.allowBlank = true;
                    sumField.allowBlank = false;

                    transferContainer.hide();

                    serviceFrom.allowBlank = true;
                    serviceTo.allowBlank = true;
                    supplierFrom.allowBlank = true;
                    supplierTo.allowBlank = true;

                    services.show();
                    services.allowBlank = false;
                    suppliers.show();
                    suppliers.allowBlank = true;

                    switch (value) {
                        case 7: //Перенос сальдо
                            {
                                transferContainer.show();

                                serviceFrom.allowBlank = false;
                                serviceTo.allowBlank = false;
                                supplierFrom.allowBlank = false;
                                supplierTo.allowBlank = false;

                                standartField.hide();
                                sumField.hide();
                                sumField.allowBlank = true;

                                services.hide();
                                services.allowBlank = true;
                                suppliers.hide();
                                break;
                            }
                        case 8: //Снятие (обнуление) общего сальдо
                        case 81: //Снятие (обнуление) дебитового сальдо
                        case 82: //Снятие (обнуление) кредитового сальдо
                            {
                                standartField.hide();
                                sumField.hide();
                                sumField.allowBlank = true;
                                break;
                            }
                        case 163: //"Изменение расхода + Учет ОДН" 
                            {
                                tariffField.setVisible(true);
                                volumeField.setVisible(true);
                                radioGroup.setVisible(true);

                                tariffField.allowBlank = false;
                                volumeField.allowBlank = false;
                                break;
                            }
                    }

                    view.getForm().isValid();
                }
            });
            typeField.getStore().on({
                beforeload: function (curStore, operation) {
                    operation.params = operation.params || {};
                    operation.params.dataBankId = view.dataBankId;
                }
            });

            saldoeditgroupview.down('gridpanel[name=unloadGrid]').getStore().on({
                beforeload: function (curStore, operation) {
                    operation.params = operation.params || {};
                    operation.params.saldoEditChargeDate = saldoEditChargeDate.getValue();
                }
            });

            saldoEditChargeDate.on({
                change: function () {
                    saldoeditgroupview.down('gridpanel[name=unloadGrid]').getStore().load();
                }
            });

            B4.Ajax.request({
                url: B4.Url.action('/OperDay/Get')
            }).next(function (resp) {
                var response = Ext.decode(resp.responseText);
                var operDate = new Date(response.data.OperDate);
                saldoEditChargeDate.setValue(operDate);
            }).error(function () {
                B4.QuickMsg.warning('При получении операционного дня произошла ошибка');
            });
            
            buttonUnload.on({
                click: function (button) {
                    var win = button.up('saldoeditgroupview'),
                        grid = win.down('gridpanel[name=unloadGrid]'),
                        view = grid.up('saldoeditgroup'),
                        selectedArr = grid.getSelectionModel().getSelection(),
                        selectedId = [];
                    win.getEl().mask('Выгрузка...');

                    selectedArr.forEach(function (item) {
                        selectedId.push(item.data.id)
                    });

                    if (selectedArr.length == 0) {
                        B4.QuickMsg.warning('Не выбраны значения!');
                        win.getEl().unmask();
                        return;
                    }

                    var record = {
                        OperDate: win.down('datefield[name=SaldoEditChargeDate]').getValue(),
                        DataBank: view.dataBankId,
                        IdList: selectedId,
                        TaskId: 38
                    };

                    B4.Ajax.request({
                        url: B4.Url.action('/Unloader/Create'),
                        params: {
                            records: Ext.encode([record])
                        }
                    }).next(function (resp) {
                        win.getEl().unmask();
                        var response = Ext.decode(resp.responseText);

                        if (!response.success) {
                            B4.QuickMsg.warning(response.message);
                            return;
                        }
                        B4.QuickMsg.success('Данные выгружаются');
                        win.down('gridpanel[name=unloadGrid]').getStore().reload();
                    }).error(function () {
                        win.getEl().unmask();
                        B4.QuickMsg.warning('При выполнении операции произошла ошибка');
                    });
                }
            });

            view.getForm().isValid();
            supplierTo.getStore().load();
            supplierFrom.getStore().load();

        }
    },

    save: function (btn) {
        var view = btn.up('window'),
            typeField = view.down('b4combobox[name=TypeId]'),
            baseDocumentType = view.down('b4combobox[name=BaseDocumentType]').getValue(),
            baseDocumentNumber = view.down('textfield[name=BaseDocumentNumber]').getValue(),
            baseDocumentDate = view.down('datefield[name=BaseDocumentDate]').getValue(),
            baseDocumentReason = view.down('textfield[name=BaseDocumentReason]').getValue(),
            sumField = view.down('numberfield[name=Sum]'),
            sum = sumField.getValue(),
            tariffField = view.down('numberfield[name=Tariff]'),
            tariff = tariffField.getValue(),
            volumeField = view.down('numberfield[name=Volume]'),
            volume = volumeField.getValue(),
            standart = view.down('b4combobox[name=Standart]').getValue(),
            serviceList = view.down('b4selectfield[name=Service]').getValue(),
            supplierList = view.down('b4selectfield[name=Supplier]').getValue(),
            serviceFrom = view.down('b4selectfield[name=TransferServiceFrom]').getValue(),
            serviceTo = view.down('b4selectfield[name=TransferServiceTo]').getValue(),
            supplierFrom = view.down('b4selectfield[name=TransferSupplierFrom]').getValue(),
            supplierTo = view.down('b4selectfield[name=TransferSupplierTo]').getValue();

        if (!view.getForm().isValid()) {
            B4.QuickMsg.warning('Не все поля корректно заполнены');
            return;
        }

        if (!sumField.hidden && !sumField.disabled && !sum) {
            B4.QuickMsg.warning('Укажите сумму');
            return;
        }
        if (!tariffField.hidden && !tariffField.disabled && !tariff) {
            B4.QuickMsg.warning('Укажите тариф');
            return;
        }
        if (!volumeField.hidden && !volumeField.disabled && !volume) {
            B4.QuickMsg.warning('Укажите объем');
            return;
        }

        if (view.down('radiogroup').hidden) {
            tariff = 0;
            volume = 0;
        }

        view.getEl().mask('Сохранение...');
        B4.Ajax.request({
            url: B4.Url.action('/SaldoEdit/SaveGroup'),
            timeout: 9999999,
            params: {
                isHouses: view.isHouses,
                personalAccountList: Ext.encode(view.selectedPersonalAccountList),
                serviceList: Ext.encode(serviceList),
                supplierList: Ext.encode(supplierList),
                typeId: typeField.getValue(),
                baseDocumentType: baseDocumentType,
                baseDocumentNumber: baseDocumentNumber,
                baseDocumentDate: baseDocumentDate,
                baseDocumentReason: baseDocumentReason,
                tariff: tariff,
                volume: volume,
                distributionSum: sum,
                standart: standart,
                serviceFrom: serviceFrom,
                serviceTo: serviceTo,
                supplierFrom: supplierFrom,
                supplierTo: supplierTo
            }
        }).next(function (resp) {
            view.getEl().unmask();
            var response = Ext.decode(resp.responseText);
            if (response.success) {
                B4.QuickMsg.msg('Выполнено', 'Данные успешно сохранены', 'success');
                view.close();
            } else {
                B4.QuickMsg.msg('Внимание', response.message, 'warning');
            }
        }).error(function (resp) {
            view.getEl().unmask();
            B4.QuickMsg.msg('Внимание', 'При выполнении операции произошла ошибка', 'warning');
        });
    },

    initComponent: function () {
        var me = this,
            serviceStore = Ext.create('B4.store.dict.Service'),
            supplierStore = Ext.create('B4.store.dict.supplier.ListTarif');

        Ext.applyIf(me, {
            defaults: {
                labelWidth: 90,
                labelAlign: 'right'
            },
            items: [
                {
                    xtype: 'tabpanel',
                    anchor: '100%',
                    border: false,
                    activeTab: 0,
                    items: [
                        {
                            xtype: 'panel',
                            title: 'Выполнить изменение сальдо',
                            border: false,
                            bodyStyle: B4.getBgStyle(),
                            defaults: {
                                labelAlign: 'right',
                                anchor: '100%',
                                labelWidth: 90,
                                margin: 5
                            },
                            layout: {
                                type: 'vbox',
                                align: 'stretch'
                            },
                            items: [
                                {
                                    xtype: 'label',
                                    text: (me.isHouses ? 'Всего выбрано домов: ' : 'Всего выбрано лицевых счетов: ') + me.selectedPersonalAccountList.length,
                                    name: 'PersonalAccountCount',
                                    cls: 'tomato-text'
                                },
                                {
                                    xtype: 'b4combobox',
                                    anchor: '100%',
                                    name: 'TypeId',
                                    displayField: 'Name',
                                    valueField: 'Id',
                                    queryMode: 'local',
                                    editable: false,
                                    url: '/HouseSaldo/ListTypesWithoutPaging',
                                    allowBlank: false,
                                    fieldLabel: 'Тип перекидки'
                                },
                                {
                                    xtype: 'fieldset',
                                    layout: 'anchor',
                                    title: 'Документ-основание',
                                    items: [
                                        {
                                            xtype: 'b4combobox',
                                            margin: '0 0 5 0',
                                            allowBlank: false,
                                            labelWidth: 85,
                                            anchor: '100%',
                                            labelAlign: 'right',
                                            fieldLabel: 'Наименование',
                                            editable: false,
                                            url: '/Dictionary/GetListTypeDoc',
                                            name: 'BaseDocumentType'
                                        },
                                        {
                                            xtype: 'container',
                                            layout: 'hbox',
                                            items: [
                                                {
                                                    xtype: 'container',
                                                    flex: 1,
                                                    layout: 'hbox',
                                                    items: [
                                                        {
                                                            xtype: 'textfield',
                                                            labelAlign: 'right',
                                                            fieldLabel: 'Номер',
                                                            allowBlank: false,
                                                            labelWidth: 85,
                                                            flex: 1,
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
                                            margin: '5 0 0 0',
                                            allowBlank: false,
                                            labelAlign: 'right',
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
                                    xtype: 'b4selectfield',
                                    name: 'Service',
                                    fieldLabel: 'Услуги',
                                    editable: false,
                                    store: serviceStore,
                                    selectionMode: 'MULTI'
                                },
                                {
                                    xtype: 'b4selectfieldcontracts',
                                    name: 'Supplier',
                                    editable: false,
                                    fieldLabel: 'Договоры ЖКУ',
                                    store: supplierStore,
                                    selectionMode: 'MULTI'
                                },
                                {
                                    xtype: 'b4combobox',
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
                                    xtype: 'radiogroup',
                                    name: 'CalcRadioGroup',
                                    fieldLabel: 'Вычислять',
                                    hidden: true,
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
                                                sumField = view.down('numberfield[name=Sum]'),
                                                volumeField = view.down('numberfield[name=Volume]');

                                            if (value.rb == 1) //по объему и тарифу
                                            {
                                                volumeField.enable();
                                                volumeField.allowBlank = false;

                                                sumField.disable();
                                                sumField.allowBlank = true;
                                                sumField.setValue();
                                            } else //по сумме и тарифу
                                            {
                                                volumeField.disable();
                                                volumeField.allowBlank = true;
                                                volumeField.setValue('');

                                                sumField.enable();
                                                sumField.allowBlank = false;
                                            }

                                            view.getForm().isValid();
                                        }
                                    }
                                },
                                {
                                    xtype: 'numberfield',
                                    name: 'Tariff',
                                    anchor: '100%',
                                    hidden: true,
                                    minValue: 0,
                                    fieldLabel: 'Тариф',
                                    listeners: {
                                        change: function (tariffField, tariff) {
                                            var view = tariffField.up('window'),
                                                volumeField = view.down('numberfield[name=Volume]'),
                                                volume = volumeField.getValue(),
                                                sumField = view.down('numberfield[name=Sum]'),
                                                sum = sumField.getValue();

                                            if (tariff && volume && sumField.disabled) {
                                                sumField.setValue(tariff * volume);
                                            }
                                        }
                                    }
                                },
                                {
                                    xtype: 'numberfield',
                                    name: 'Volume',
                                    anchor: '100%',
                                    hidden: true,
                                    minValue: 0,
                                    disabled: true,
                                    fieldLabel: 'Объем(расход)',
                                    listeners: {
                                        change: function (volumeField, volume) {
                                            var view = volumeField.up('window'),
                                                tariffField = view.down('numberfield[name=Tariff]'),
                                                tariff = tariffField.getValue(),
                                                sumField = view.down('numberfield[name=Sum]');

                                            if (tariff && volume && sumField.disabled) {
                                                sumField.setValue(tariff * volume);
                                            }
                                        }
                                    }
                                },
                                {
                                    xtype: 'numberfield',
                                    fieldLabel: 'Сумма',
                                    allowBlank: false,
                                    anchor: '100%',
                                    name: 'Sum',
                                    hideTrigger: true
                                },
                                {
                                    xtype: 'container',
                                    name: 'Transfer',
                                    hidden: true,
                                    items: [
                                        {
                                            xtype: 'fieldset',
                                            title: 'Откуда переностить',
                                            layout: 'anchor',
                                            items: [
                                                {
                                                    xtype: 'b4selectfield',
                                                    name: 'TransferServiceFrom',
                                                    fieldLabel: 'Услуга',
                                                    labelAlign: 'right',
                                                    editable: false,
                                                    anchor: '100%',
                                                    store: serviceStore,
                                                    allowBlank: false
                                                },
                                                {
                                                    xtype: 'b4selectfieldcontracts',
                                                    name: 'TransferSupplierFrom',
                                                    editable: false,
                                                    fieldLabel: 'Договор',
                                                    anchor: '100%',
                                                    store: supplierStore,
                                                    allowBlank: false
                                                }
                                            ]
                                        },
                                        {
                                            xtype: 'fieldset',
                                            title: 'Куда переностить',
                                            layout: 'anchor',
                                            items: [
                                            {
                                                xtype: 'b4selectfield',
                                                name: 'TransferServiceTo',
                                                fieldLabel: 'Услуга',
                                                labelAlign: 'right',
                                                editable: false,
                                                store: serviceStore,
                                                anchor: '100%',
                                                allowBlank: false
                                            },
                                            {
                                                xtype: 'b4selectfieldcontracts',
                                                name: 'TransferSupplierTo',
                                                editable: false,
                                                fieldLabel: 'Договор',
                                                store: supplierStore,
                                                anchor: '100%',
                                                allowBlank: false
                                            }]
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
                                        { xtype: 'tbfill' },
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
                        },
                        {
                            xtype: 'saldoeditgroupview',
                            title: 'Просмотр реестров изменений',
                            border: false,
                            bodyStyle: B4.getBgStyle(),
                            layout: 'anchor'
                        }
                    ]
                }
            ]
        });

        me.callParent(arguments);
    }
});