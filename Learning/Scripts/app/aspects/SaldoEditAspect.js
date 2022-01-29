/*
    Аспект работы с изменением сальдо в режиме ЕПД жильцов
*/
Ext.define('B4.aspects.SaldoEditAspect',
{
    extend: 'B4.base.Aspect',

    alias: 'widget.saldoeditaspect',

    requires: [
        'B4.QuickMsg',
        'B4.utils.KP6Utils',
        'B4.model.finance.OperDay',
        'B4.aspects.GridEditWindow',
        'B4.view.register.personalaccount.saldoedit.Window',
        'B4.aspects.permission.Kp60PermissionAspect'
    ],

    mixins: {
        mask: 'B4.mixins.MaskBody'
    },

    editFormSelector: 'tfsaldotransfereditwindow',
    gridSelector: undefined,

    editWindowView: 'register.personalaccount.tenantpersaccforfactura.TfSaldoTransferEditWindow',
    modelName: 'register.personalaccount.transfer.Transfer',
    storeName: 'register.personalaccount.transfer.Transfer',

    /**
     * По какому полю брать номер лс из контекста
     */
    personalAccountContextField: 'PersonalAccountId',

    constructor: function(config) {
        Ext.apply(this, config);
        this.callParent(arguments);
    },

    init: function(controller) {
        var me = this;
        var actions = {};

        if (!controller.models.includes('register.personalaccount.transfer.Transfer')) {
            controller.models.push('register.personalaccount.transfer.Transfer');
        }
        if (!controller.views.includes('register.personalaccount.tenantpersaccforfactura.TfSaldoTransferEditWindow')) {
            controller.views.push('register.personalaccount.tenantpersaccforfactura.TfSaldoTransferEditWindow');
        }
        
        var saldoEditAspect = Ext.create('B4.aspects.GridEditWindow',
        {
            name: 'saldoEditGridWindowAspect',
            gridSelector: me.gridSelector,
            storeName: me.storeName,
            modelName: me.modelName,
            editWindowView: me.editWindowView,
            editFormSelector: me.editFormSelector,
            listeners: {
                windowcreated: function(asp, editWin, mainView) {
                    asp.initializeEditWin(asp, editWin, mainView);
                },
                deletesuccess: function(asp) {
                    asp.getGrid().getStore().load();
                },
                savesuccess: function(asp) {
                    asp.getGrid().getStore().load();
                },
                beforerowaction: function(asp, view, action, record) {
                    if (action == 'edit')
                        if (record.data.IsAuto == 1) {
                            B4.QuickMsg.warning('Данная перекидка загружена автоматически. Редактировать запрещено! ');
                            return false;
                        }
                    return asp.beforeRowAction(asp, view, action, record);
                },
                beforesave: function(asp, record) {
                    return asp.beforeSave(asp, record);
                },
                beforesaverequest: function(asp) {
                    return asp.beforeSaveRequest(asp);
                },
                beforesetformdata: function(asp, record, form) {
                    var dataBankId = asp.controller.getContextValue(form, 'dataBankId'),
                        transferTypeStore = form.down('b4combobox[name=TypeId]').getStore();

                    asp.controller.setContextValue(form, 'recordId', record.getId());

                    transferTypeStore.on({
                        beforeload: function(curStore, operation) {
                            operation.params = operation.params || {};
                            operation.params.dataBankId = dataBankId;
                        },
                        load: function(curStore) {
                            if (!record.getId()) {
                                curStore.removeAt(curStore
                                    .findExact('Id', 8)); //Удаляем из стора тип Снятие (обнуление) общего сальдо, если добавление записи
                                curStore.removeAt(curStore
                                    .findExact('Id', 81)); //Удаляем из стора тип Снятие (обнуление) дебитового сальдо, если добавление записи
                                curStore.removeAt(curStore
                                    .findExact('Id', 82)); //Удаляем из стора тип Снятие (обнуление) кредитового сальдо, если добавление записи
                            }
                        }
                    });

                    transferTypeStore.load();
                }
            },

            rowDblClick: function(view, record) {
                var asp = this;
                if (record.get('IsAuto') == 1) {
                    B4.QuickMsg.msg(
                        'Внимание',
                        'Данная перекидка загружена автоматически. Редактировать запрещено! ',
                        'warning');
                    return false;
                }
                if (record.get('IsArchive')) return;
                asp.editRecord(record);
            },

            beforeLoadComboStore: function(store, operation, dataBankId, personalAccountId, serviceId) {
                operation.params = operation.params || {};
                operation.params.dataBankId = dataBankId;
                operation.params.personalAccountId = personalAccountId;
                if (serviceId) {
                    operation.params.serviceId = serviceId;
                }
            },

            //Загрузка окна редактирования
            initializeEditWin: function(asp, editView, mainView) {
                var dataBankId = asp.controller.getContextValue(mainView, 'dataBankId'),
                    personalAccountId = asp.controller.getContextValue(editView, me.personalAccountContextField),
                    mainPersonalAccountId = asp.controller.getContextValue(mainView, 'personalAccountId'),
                    servCombo = editView.down('[name="ServiceId"]'),
                    supplierStore = editView.down('b4combobox[name=SupplierId]').getStore(),
                    serviceStore = editView.down('b4combobox[name=ServiceId]').getStore(),
                    transferToServiceField = editView.down('b4combobox[name=TransferServiceTo]'),
                    transferToSupplierField = editView.down('b4combobox[name=TransferSupplierTo]');

                transferToServiceField.getStore().on({
                    beforeload: function(curStore, operation) {
                        return asp.beforeLoadComboStore(curStore, operation, dataBankId, mainPersonalAccountId);
                    }
                });

                transferToServiceField.on({
                    change: function() {
                        transferToSupplierField.reset();
                        if (transferToServiceField.getValue() > 0) transferToSupplierField.getStore().load();
                    }
                });

                transferToSupplierField.getStore().on({
                    beforeload: function(curStore, operation) {
                        return asp.beforeLoadComboStore(curStore,
                            operation,
                            dataBankId,
                            mainPersonalAccountId,
                            transferToServiceField.getValue());
                    }
                });

                serviceStore.on({
                    beforeload: function(curStore, operation) {
                        return asp.beforeLoadComboStore(curStore, operation, dataBankId, mainPersonalAccountId);
                    }
                });

                supplierStore.on({
                    beforeload: function(curStore, operation) {
                        return asp.beforeLoadComboStore(curStore,
                            operation,
                            dataBankId,
                            mainPersonalAccountId,
                            servCombo.getValue());
                    }
                });

                servCombo.on(
                    'focus',
                    function(combobox) {
                        combobox.flagChange = true;
                    },
                    asp.controller);
                servCombo.on(
                    'change',
                    function(combobox, newi, oldi) {
                        var view = combobox.up('window'),
                            suppCombo = view.down('[name="SupplierId"]'),
                            serviceId = servCombo.getValue();

                        if (combobox.flagChange) {
                            view.getEl().mask('Загрузка...');
                            B4.Ajax.request({
                                url: B4.Url.action('GetActiveSupplier', 'PersonalAccount'),
                                params: {
                                    dataBankId: asp.controller.getContextValue(mainView, 'dataBankId'),
                                    personalAccountId: asp.controller.getContextValue(mainView, 'personalAccountId'),
                                    serviceId: combobox.getValue()
                                }
                            }).next(function(resp) {
                                var result = Ext.decode(resp.responseText);
                                if (result.success) {
                                    suppCombo.setValue(result.data != 0 ? result.data : null);
                                } else {
                                    B4.QuickMsg.warning('Не удалось определить договор');
                                }
                                view.getEl().unmask();
                            });
                        }

                        if (serviceId) {
                            supplierStore.load();
                        }
                    },
                    asp.controller);

                if (asp.controller.getContextValue(mainView, 'isBlocked')) {
                    asp.disableFields(editView);
                    editView.down('b4savebutton').disable();
                }
            },

            deleteRecord: function(record, view) {
                var me = this,
                    dataBankId = me.controller.getContextValue(view, 'dataBankId'),
                    personalAccountId = me.controller.getContextValue(view, 'personalAccountId'),
                    calcMonth = me.controller.getContextValue(view, 'CalculationMonth');

                Ext.Msg.confirm('Удаление записи!',
                    'Вы действительно хотите удалить запись?',
                    function(result) {
                        if (result == 'yes') {
                            var model = this.getModel(record);

                            var rec = new model({ Id: record.getId() });
                            me.mask('Удаление', B4.getBody());
                            rec.destroy({
                                    params: {
                                        dataBankId: dataBankId,
                                        personalAccountId: personalAccountId,
                                        year: calcMonth.getFullYear()
                                    }
                                })
                                .next(function() {
                                        me.unmask();
                                        this.fireEvent('deletesuccess', this);
                                        me.updateGrid();
                                    },
                                    this)
                                .error(function(result) {
                                        me.unmask();
                                        Ext.Msg.alert('Ошибка удаления!',
                                            Ext.isString(result.responseData)
                                            ? result.responseData
                                            : result.responseData.message);
                                    },
                                    this);
                        }
                    },
                    me);
            },

            disableFields: function(component) {
                var me = this;
                Ext.iterate(component.items.items,
                    function(subitem) {
                        if (subitem.items && Ext.isIterable(subitem.items.items)) {
                            me.disableFields(subitem);
                        } else if (subitem.isValid) {
                            subitem.setDisabled(true);
                        }
                    });
            },

            beforeRowAction: function(asp, view, action, record) {
                var store = view.getStore(),
                    calcMonth = asp.controller.getContextValue(view, 'CalculationMonth');

                switch (action) {
                case 'delete':
                    if (asp.controller.getContextValue(view, 'isBlocked')) {
                        B4.QuickMsg.msg(
                            'Внимание',
                            'Лицевой счет закрыт в текущем расчетном месяце. Редактирование сальдо запрещено',
                            'warning'
                        );
                        return false;
                    }

                    if (record.get('Month') != (calcMonth.getMonth() + 1) ||
                        record.get('Year') != calcMonth.getFullYear()) {
                        B4.QuickMsg.msg(
                            'Внимание',
                            'Месяц перекидки отличается от текущего расчетного месяца',
                            'warning'
                        );
                        return false;
                    }

                    store.getProxy().setExtraParam('year', record.get('Year'));
                    break;
                case 'edit':
                case 'doubleclick':
                    store.getProxy().setExtraParam('year', record.get('Year'));
                    break;
                case 'add':
                    store.getProxy().setExtraParam('year', '');
                    break;
                }
                return record;
            },

            beforeSave: function(asp, record) {
                var view = asp.getForm(),
                    sum = +record.get('Sum'),
                    calcRadioGroup = view.down('radiogroup[name=CalcRadioGroup]');

                //Если запись - новая, то чистим сумму
                if (!record.id) {
                    switch (record.get('TypeId')) {
                    case 7:
                    case 8:
                    case 81:
                    case 82:
                    {
                        delete record.modified.Sum;
                        break;
                    }
                    }
                }

                record.set('Volume', view.down('[name=Volume]').getValue());

                return record;
            },

            beforeSaveRequest: function(asp) {
                var form = asp.getForm(),
                    sum = form.down('numberfield[name="Sum"]').getValue(),
                    calcRadioGroup = form.down('radiogroup[name=CalcRadioGroup]');

                if (!form.down('numberfield[name="Sum"]')
                    .allowBlank &&
                    sum == 0 &&
                    calcRadioGroup.getValue().rb != '1') {
                    Ext.Msg.alert('Сохранение', 'Сумма должна быть отлична от нуля');
                    return false;
                }

                return true;
            },
            updateGrid: function() {
                //непонятное поведение
            },

            getEditParams: function (record) {
                if (record)
                    return {
                        dataBankId: record.get('DataBank'),
                        selectedMonth: new Date(record.get('Year'), record.get('Month') - 1, 1)
                    };
                else return {};
            },

            getSaveParams: function (record, view) {
                var asp = this,
                    dataBankId = asp.controller.getContextValue(view, 'dataBankId'),
                    personalAccountEpdId = asp.controller.getContextValue(view, me.personalAccountContextField),
                    personalAccountId = asp.controller.getContextValue(view, 'personalAccountId'),
                    calcMonth = asp.controller.getContextValue(view, 'CalculationMonth');
                return {
                    dataBankId: dataBankId,
                    personalAccountId: personalAccountId,
                    year: calcMonth.getFullYear(),
                    personalAccountEpdId: personalAccountEpdId
                };
            }
        });

        saldoEditAspect.init(controller);
        controller.aspects.push(saldoEditAspect);


        if (this.editFormSelector) {
            actions[this.editFormSelector + ' b4calcmonthpicker[name=ChargeDate]'] = {
                'change': {
                    fn: me.onChangeSelectedMonth,
                    scope: this
                }
            };
            actions[this.editFormSelector + ' [name=ServiceSaldoEdit]'] = {
                'click': {
                    fn: me.serviceSaldoEdit,
                    scope: this
                }
            };
            actions[this.editFormSelector + ' b4combobox[name=TypeId]'] = {
                'change': {
                    fn: me.onChangeTransferType,
                    scope: this
                }
            };
            actions[this.editFormSelector + ' radiogroup[name=CalcRadioGroup]'] = {
                'change': {
                    fn: me.onChangeCalcRadioGroup,
                    scope: this
                }
            };
        }
        controller.control(actions);
        me.callParent(arguments);
    },

    onChangeSelectedMonth: function(picker) {
        var view = picker.up('personalaccountsaldoeditgrid'),
            store = view.getStore(),
            selectedMonth = view.down('b4calcmonthpicker[name="ChargeDate"]').getValue();

        store.getProxy().setExtraParam('selectedMonth', selectedMonth);
        store.load();
    },

    //При смене типа перекидки
    onChangeTransferType: function(combobox, value) {
        var me = this,
            view = combobox.up('window'),
            calcRadioGroup = view.down('radiogroup[name=CalcRadioGroup]'),
            volumeField = view.down('numberfield[name=Volume]'),
            sumField = view.down('numberfield[name=Sum]'),
            tariffField = view.down('numberfield[name=Tariff]'),
            serviceField = view.down('b4combobox[name=ServiceId]'),
            supplierField = view.down('b4combobox[name=SupplierId]'),
            transferContainer = view.down('container[name=Transfer]'),
            transferToServiceField = view.down('b4combobox[name=TransferServiceTo]'),
            transferToSupplierField = view.down('b4combobox[name=TransferSupplierTo]');
        //редактирования не будет, только добавление и удаление
        //recordId = me.getContextValue(view, 'recordId');

        sumField.show();
        sumField.enable();
        sumField.allowBlank = false;

        calcRadioGroup.allowBlank = true;
        calcRadioGroup.validate();
        calcRadioGroup.reset();

        calcRadioGroup.hide();
        volumeField.hide();

        supplierField.allowBlank = false;
        supplierField.show();
        serviceField.allowBlank = false;
        serviceField.show();

        transferContainer.hide();

        me.disableComponent(tariffField, true);
        me.enableComponent(sumField, false);

        transferToServiceField.allowBlank = true;
        transferToSupplierField.allowBlank = true;
        if (value && value != '')
            B4.Ajax.request({
                url: 'HouseSaldo/ListTypesWithoutPaging',
                params: {
                    TypeId: value
                }
            }).next(function(jsonResp) {
                var data = Ext.decode(jsonResp.responseText).data;
                if (!data) {
                    return;
                }
                if (data.IsVolume == '1') {
                    calcRadioGroup.allowBlank = false;
                    calcRadioGroup.validate();

                    calcRadioGroup.show();
                    volumeField.show();

                    sumField.allowBlank = true;
                    sumField.validate();

                    me.enableComponent(tariffField, true);
                    me.disableComponent(sumField, false);

                    //Если уже установлены значения объема или суммы, устанавливаем радиобаттоны
                    if (volumeField.getValue() != '') {
                        calcRadioGroup.setValue({ rb: '1' });
                    } else if (sumField.getValue != '') {
                        calcRadioGroup.setValue({ rb: '2' });
                    }
                };
            }).error(function(response) {
                Ext.Msg.alert('Ошибка!', 'При получении параметра произошла ошибка!');
            });

        switch (value) {
        case 7: //Перенос сальдо
        {
            //Если редактируется запись, то отрисовываем по дефолту - не редактируем
            //if (recordId) {
            //    return;
            //}

            transferContainer.show();

            transferToServiceField.allowBlank = false;
            transferToSupplierField.allowBlank = false;

            sumField.allowBlank = true;
            sumField.reset();
            sumField.hide();
            break;
        }
        case 8: //Снятие (обнуление) общего сальдо
        case 81: //Снятие (обнуление) дебитового сальдо
        case 82: //Снятие (обнуление) кредитового сальдо
        {
            //Если редактируется запись, то отрисовываем по дефолту - не редактируем
            //if (recordId) {
            //    return;
            //}

            sumField.allowBlank = true;
            sumField.reset();
            sumField.hide();
            break;
        }
        }
    },

    //При смене типа вычисления
    onChangeCalcRadioGroup: function(obj, value) {
        var me = this,
            view = obj.up('window'),
            volumeField = view.down('numberfield[name=Volume]'),
            sumField = view.down('numberfield[name=Sum]');

        if (value.rb == 1) //по объему и тарифу
        {
            me.enableComponent(volumeField, false);
            me.disableComponent(sumField, false);
        } else //по сумме и тарифу
        {
            me.disableComponent(volumeField, false);
            me.enableComponent(sumField, false);
        }
    },

    enableComponent: function(component, toShow) {
        component.allowBlank = false;
        component.validate();
        if (toShow) {
            component.show();
        } else {
            component.enable();
        }
    },

    disableComponent: function(component, toHide) {
        component.allowBlank = true;
        component.validate();
        if (toHide) {
            component.hide();
        } else {
            component.disable();
        }
    },

    serviceSaldoEdit: function(btn) {
        var me = this,
            view = btn.up('personalaccountsaldoeditgrid'),
            personalAccountId = me.getContextValue(view, 'personalAccountId'),
            dataBankId = me.getContextValue(view, 'dataBankId');

        var win = Ext.create('B4.form.register.personalaccount.saldo.ServiceSaldoEdit',
        {
            dataBankId: dataBankId,
            personalAccountId: personalAccountId
        });
        win.on({
            saved: function() {
                view.getStore().load();
            }
        });
        win.show();
    }
});