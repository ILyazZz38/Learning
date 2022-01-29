/*
    Аспект формы просмотра оплаты и распределения
*/
Ext.define('B4.aspects.PaymentGridWindowAspect', {
    extend: 'B4.aspects.GridEditWindow',

    alias: 'widget.paymentGridWindowAspect',

    requires: [
        'B4.QuickMsg',
        'B4.mixins.MaskBody',
        'B4.mixins.LayoutControllerLoader',
        'B4.enums.TypePack'
    ],

    mixins: {
        kkm: 'B4.mixins.finance.KkmClientMixin'
    },

    //storeName: 'finance.Pay',
    modelName: 'finance.Pay',
    editWindowView: 'B4.view.finance.packspayments.packpaymentinfo.Window',

    panelSelector: undefined,
    uniqueIndex: undefined,

    init: function (controller) {
        var me = this,
            actions = {};

        me.callParent(arguments);

        actions[me.editFormSelector + '[uniqueIndex=' + me.uniqueIndex + '] button[name=distribOnButton]'] = {
            'click': {
                fn: me.runOperation,
                scope: me
            }
        };
        actions[me.editFormSelector + '[uniqueIndex=' + me.uniqueIndex + '] button[name=distribOffButton]'] = {
            'click': {
                fn: me.runOperation,
                scope: me
            }
        };
        actions[me.editFormSelector + '[uniqueIndex=' + me.uniqueIndex + '] button[name=incaseButton]'] = {
            'click': {
                fn: me.runOperation,
                scope: me
            }
        };
        actions[me.editFormSelector + '[uniqueIndex=' + me.uniqueIndex + '] button[name=incaseOutButton]'] = {
            'click': {
                fn: me.runOperation,
                scope: me
            }
        };
        actions[me.editFormSelector + '[uniqueIndex=' + me.uniqueIndex + '] button[name=inbasketButton]'] = {
            'click': {
                fn: me.runOperation,
                scope: me
            }
        };
        actions[me.editFormSelector + '[uniqueIndex=' + me.uniqueIndex + '] button[name=repairButton]'] = {
            'click': {
                fn: me.runOperation,
                scope: me
            }
        };
        actions[me.editFormSelector + '[uniqueIndex=' + me.uniqueIndex + '] button[name=accountButton]'] = {
            'click': {
                fn: me.go2Account,
                scope: me
            }
        };
        actions[me.editFormSelector + '[uniqueIndex=' + me.uniqueIndex + '] button[name=export]'] = {
            'click': {
                fn: me.exportDocument,
                scope: me
            }
        };

        //поле заполнения адреса 
        actions[me.editFormSelector + '[uniqueIndex=' + me.uniqueIndex + '] b4selectfield[name=PersonalAccount]'] = {
            'change': {
                fn: me.onAddressChangeBase,
                scope: me
            }
        };
        //поле получателя
        actions[me.editFormSelector + '[uniqueIndex=' + me.uniqueIndex + '] b4selectfield[name=LegalEntityId]'] = {
            'change': {
                fn: me.onDateMonthCalcChangeBase,
                scope: me
            }
        };
        //поле заполнения месяца платежа
        actions[me.editFormSelector + '[uniqueIndex=' + me.uniqueIndex + '] b4monthpicker[name=DateMonthCalc]'] = {
            'change': {
                fn: me.onDateMonthCalcChangeBase,
                scope: me
            }
        };

        //заполнить авансовый платеж
        actions[me.editFormSelector + '[uniqueIndex=' + me.uniqueIndex + '] b4monthpicker[name="MonthFrom"]'] = {
            focus: function (cmp) {
                cmp.flagChange = true;
            },
            change: { fn: me.fillPays, scope: me }
        };
        actions[me.editFormSelector + '[uniqueIndex=' + me.uniqueIndex + '] b4monthpicker[name="MonthTo"]'] = {
            focus: function (cmp) {
                cmp.flagChange = true;
            },
            change: { fn: me.fillPays, scope: me }
        };
        actions[me.editFormSelector + '[uniqueIndex=' + me.uniqueIndex + '] button[name=CalcPeni]'] = {
            click: { fn: me.calcPeniOff, scope: me }
        };

        //Слушатели на вкладке уточнение суммы оплаты по услугам
        actions[me.editFormSelector + '[uniqueIndex=' + me.uniqueIndex + '] b4monthpicker[name=SelectedMonth]'] = {
            'change': function (cmp, value, old) {
                cmp.up('gridpanel[name=ServiceSum]').getStore().load();
            }
        };
        actions[me.editFormSelector + '[uniqueIndex=' + me.uniqueIndex + '] b4combobox[name=Standart]'] = {
            'change': function (cmp, value, old) {
                var grid = cmp.up('gridpanel[name=ServiceSum]');
                grid.down('gridcolumn[dataIndex=Payment]').setText(cmp.getStore().findRecord('Id', value).get('Name'));

                grid.getStore().load();
            }
        };
        actions[me.editFormSelector + '[uniqueIndex=' + me.uniqueIndex + '] panel[name=ServiceSum] button[name=Distribute]'] = {
            'click': me.distributeServiceSum
        };
        actions[me.editFormSelector + '[uniqueIndex=' + me.uniqueIndex + '] [name=PayerDocument]'] = {
            click: {
                fn: function (btn) {
                    me.showPayerDocument(btn);
                }, scope: me
            }
        };

        controller.control(actions);
    },

    saveRequestHandler: function () {
        var rec, from = this.getForm();
        from.getEl().mask('Сохранение ...');
        if (this.fireEvent('beforesaverequest', this) !== false) {
            from.getForm().updateRecord();
            rec = this.getRecordBeforeSave(from.getRecord());

            this.fireEvent('getdata', this, rec);

            if (from.getForm().isValid()) {
                if (this.fireEvent('validate', this)) {
                    rec.set('PeniDiscount', from.down('[name=PeniDiscount]').getValue());
                    this.saveRecord(rec);
                }
            } else {
                //получаем все поля формы
                var fields = from.getForm().getFields();

                var invalidFields = '';

                //проверяем, если поле не валидно, то записиваем fieldLabel в строку инвалидных полей
                Ext.each(fields.items, function (field) {
                    if (!field.isValid()) {
                        invalidFields += '<br>' + field.fieldLabel;
                    }
                });

                //выводим сообщение
                Ext.Msg.alert('Ошибка сохранения!', 'Не заполнены обязательные поля: ' + invalidFields);
            }
        }
        from.getEl().unmask();
    },

    calcPeniOff: function (btn) {
        var me = this,
            view = btn.up('window'),
            serviceField = view.down('[name=Services]'),
            chargeSum = view.down('[name=SumCharge]').getValue(),
            paySum = view.down('[name=SumPay]').getValue(),
            peniField = view.down('[name=Fines]'),
            chargePeni = parseFloat(view.down('[name=SumPeni]').getValue()),
            peniChargeSum = view.down('[name=SumPeni]').getValue(),
            discountField = view.down('[name=PeniDiscount]'),
            sumInsaldo = me.controller.getContextValue(view, 'SumInsaldo'),
            sumServiceInSaldo = me.controller.getContextValue(view, 'SumServiceInSaldo'),
            sumServiceOutSaldo = me.controller.getContextValue(view, 'SumServiceOutSaldo'),
            sumFineOutSaldo = me.controller.getContextValue(view, 'SumFineOutSaldo'),
            koef = sumServiceOutSaldo > 0 && paySum < sumServiceOutSaldo ?
                paySum / sumServiceOutSaldo
                : 1,
            discount = 0;

        //Если есть долг по пеням
        if (sumFineOutSaldo > 0) {
            //Округляем значение
            discount = Math.round(koef * sumFineOutSaldo * 100) / 100;
        }

        discountField.setValue(discount);

        //Обновляем значение оплачено по пени
        var payPeni = (chargePeni - discount) * koef;
        peniField.setValue(payPeni);
        serviceField.setValue(paySum - payPeni);
        peniField.validate();

        if (!paySum || view.doNotListen) {
            return;
        }
        //view.doNotListen = true;
    },

    onLoad: function (controller, form) {
        var me = this,
            serviceSumStore = form.down('gridpanel[name=ServiceSum]').getStore(),
            personalAccountField = form.down('b4selectfield[name=PersonalAccount]'),
            receiverField = form.down('b4selectfield[name=LegalEntityId]'),
            codePay = form.down('b4combobox[name=CodePay]'),
            typePackId = controller.getContextValue(form, 'TypePackId');

        form.down('panel[name=ServiceSum]').on({
            show: function (panel) {
                panel.down('gridpanel').getStore().load();
            }
        });

        codePay.getStore().on({
            beforeload: function (curStore, operation) {
                operation.params = operation.params || {};
                operation.params.typePackId = typePackId;
            }
        });

        serviceSumStore.on({
            beforeload: function (curStore, operation) {
                var grid1 = form.down('gridpanel[name="ServiceSum"]'),
                    paymentId = controller.getContextValue(form, 'PaymentId'),
                    selectedRecords = grid1.getSelectionModel().getSelection(),
                    sumPay = form.down('[name=SumPay]').getValue(),
                    sumServiceField = form.down('numberfield[name=Services]'),
                    sumService = sumServiceField.getValue(),
                    groupList = [];

                if (!form.down('datefield[name=SelectedMonth]').getValue()) {
                    form.down('datefield[name=SelectedMonth]').setValue(form.down('datefield[name=DateMonthCalc]').getValue());
                }

                if (!paymentId && !personalAccountField.getValue()) {
                    B4.QuickMsg.msg('Внимание', 'Выберите лицевой счет', 'warning');
                    return false;
                }

                if (!form.getForm().isValid()) {
                    B4.QuickMsg.msg('Внимание', 'Реквизиты оплаты заполнены некорректно', 'warning');
                    return false;
                }

                Ext.each(selectedRecords, function (item) {
                    groupList.push(item.raw.Id);
                });
                operation.params = operation.params || {};
                operation.params.id = paymentId;
                operation.params.packDate = form.down('[name=DateInput]').getValue();
                operation.params.selectedMonth = form.down('b4monthpicker[name=SelectedMonth]').getValue();
                operation.params.standart = form.down('b4combobox[name=Standart]').getValue();
                operation.params.sum = sumService;
                operation.params.financeYear = controller.getContextValue(form, 'Year');
                operation.params.groupList = Ext.encode(groupList);
                operation.params.personalAccountId = personalAccountField.getValue();
                operation.params.dataBankId = personalAccountField.getDataBank();
                operation.params.receiverId = receiverField.getValue();
                operation.params.codePay = codePay.getValue();

                //При загрузке вкладки уточнение суммы оплаты по услугам
                form.down('label[name=SumPay]').setText(Ext.util.Format.number(sumService, '0,000.00').replace(',', '.'));
            }
        });
    },

    editRecord: function (record, grid) {
        var me = this,
            id = record ? record.getId() : null,
            model;
        model = this.getModel(record);
        if (grid) {
            grid.getEl().mask('Загрузка...');
        }
        id ? model.load(id, {
            params: {
                year: record.get('Year')
            },
            success: function (rec) {
                var form = me.getForm(),
                    payerDocument = form.down('[name=PayerDocument]');

                payerDocument.hide();
                form.down('[name=RfmControl]').hide();

                if (grid) {
                    grid.getEl().unmask();
                }
                me.setFormData(rec);

                me.checkRfmState(rec.get('PersonalAccountId'), form);
            },
            failure: function (data, result) {
                if (grid) {
                    grid.getEl().unmask();
                }
                if (result.response) {
                    var response = Ext.decode(result.response.responseText);
                    B4.QuickMsg.msg('Внимание', response.message, 'warning');
                    return;
                }

                B4.QuickMsg.msg('Внимание', 'Во время выполнения произошла ошибка', 'warning');
                return;
            },
            scope: this
        }) : this.setFormData(new model({ Id: 0 }));
    },

    checkRfmState: function (personalAccountId, view) {
        var controlRfmLabel = view.down('label[name=RfmControl]');

        B4.services.RfmService.checkPersonalAccount(personalAccountId, function (result) {
            controlRfmLabel.setVisible(!!result.id);
        });
    },

    listeners: {
        windowcreated: function (asp, form, view) {
            var me = this,
                aspects = this.controller.aspectCollection.items,
                permissionAspect;

            for (var i in aspects) {
                if (aspects[i].xtype == 'kp60permissionaspect')
                    permissionAspect = aspects[i];
            }
            me.onLoad(asp.controller, form);
            form.allowEdit = view.allowEdit;
            form.allowDistribute = view.allowDistribute;
            form.down('panel[name=ServiceSum] button[name=Save]').on({
                click: { fn: me.saveServiceSum, scope: me }
            });
            form.down('panel[name=ServiceSum] button[name=ClearAll]').on({
                click: { fn: me.clearServiceSum, scope: me }
            });

            if (permissionAspect) permissionAspect.init(me.controller);
        },
        savesuccess: function (me) {
            me.refreshData(); //обновить данные
        },
        getdata: function (me, record) {
            var accountId = record.get('PersonalAccount');
            if (!accountId) accountId = 0;
            var personalAccountNumber = record.get('PersonalAccountNumber');
            if (!personalAccountNumber) personalAccountNumber = 0;
            record.set('PersonalAccount', { Id: accountId, PersonalAccountNumber: personalAccountNumber, DataBankId: record.get('DataBank') }); //при submit'е данных указать id адреса
        },
        beforesetformdata: function (aspect, record, form) {
            var dataBankId = record.get('DataBank'),
                personalAccountField = form.down('b4selectfield[name=PersonalAccount]');

            personalAccountField.dataBankId = dataBankId;
            record.set('LegalEntityId', { Id: record.get('LegalEntityId'), Name: record.get('LegalEntityName') });
            record.set('NzpPayerPrincip', { Id: record.get('NzpPayerPrincip'), Name: record.get('PrincipalName') });
        },
        aftersetformdata: function (aspect, record, form) {
            var me = this,
                view = form,
                //вытащить распределение оплаты
                grid = form.down('grid[name="Payment"]'),
                distributionPanel = form.down('[name=DistributionPanel]'),
                store = grid.getStore(),
                serviceSumStore = form.down('gridpanel[name=ServiceSum]').getStore(),
                id = record.get('Id'),
                packDate = record.get('DatePack'),
                personalAccountId = record.get('PersonalAccountId'),
                sumPay = record.get('SumPay'),
                legalEntityId = record.get('LegalEntityId'),
                controller = me.controller,
                debtColumn = 'Долг - ',
                receiverField = form.down('b4selectfield[name=LegalEntityId]'),
                codePay = form.down('b4combobox[name=CodePay]'),
                advanceColumn = 'Аванс - ',
                typePackId = controller.getContextValue(form, 'TypePackId');

            if (!controller) {
                controller = me;
            }

            controller.setContextValue(form, 'PaymentId', id);
            controller.setContextValue(form, 'PackDate', packDate);
            controller.setContextValue(form, 'PersonalAccountId', personalAccountId);
            controller.setContextValue(form, 'LegalEntityId', legalEntityId);
            controller.setContextValue(form, 'SumPay', sumPay);
            controller.setContextValue(form, 'MultipleAccounts', record.get('MultipleAccounts'));
            controller.setContextValue(form, 'Year', record.get('Year'));
            store.removeAll();

            if (record.get('PayStatus') == 1) {
                //значит оплата распределена, загрузим список распределения
                store.getProxy().setExtraParam('PayId', id);
                store.getProxy().setExtraParam('OperDate', record.get('OperDate'));
                store.getProxy().setExtraParam('DateMonthCalc', record.get('DateMonthCalc'));
                store.getProxy().setExtraParam('Pref', record.get('Pref'));
                store.getProxy().setExtraParam('CodePay', record.get('CodePay'));
                store.load();
            }

            //Настраиваем грид на вкладке Распределение
            grid.down('numbercolumn[dataIndex=Charge]')
                .setText(record.get('DistrMonth')
                    ? 'Начислено за ' + Ext.Date.format(new Date(record.get('DistrMonth')), 'm.Y') + ' до расщепления'
                    : 'Начислено до расщепления');

            grid.down('gridcolumn[dataIndex=SumPay]')
                .setText(record.get('DistrMonth')
                    ? 'Распределено и учтено в ' + Ext.Date.format(new Date(record.get('DistrMonth')), 'm.Y')
                    : 'Распределено и учтено');

            grid.down('gridcolumn[dataIndex=CurrentState]')
                .setText(record.get('DistrMonth')
                    ? 'Текущее состояние за ' + Ext.Date.format(new Date(record.get('DistrMonth')), 'm.Y')
                    : 'Текущее состояние');

            //Определяем названия колонок
            switch (record.get('DebtField')) {
                case 'sum_charge':
                    debtColumn += 'Начислено к оплате';
                    break;
                case 'sum_outsaldo':
                    debtColumn += 'Исходящее сальдо';
                    break;
                case 'sum_insaldo':
                    debtColumn += 'Входящее сальдо';
                    break;
                default:
                    debtColumn = 'Поле долга не указано';
            }
            grid.down('numbercolumn[dataIndex=SumDebt]').setText(debtColumn);

            switch (record.get('AdvanceField')) {
                case 'rsum_tarif':
                    advanceColumn += 'Начислено за месяц';
                    break;
                case 'sum_tarif':
                    advanceColumn += 'Текущие начисления';
                    break;
                case 'sum_outsaldo':
                    advanceColumn += 'Исходящее сальдо';
                    break;
                case 'sum_insaldo':
                    advanceColumn += 'Входящее сальдо';
                    break;
                default:
                    advanceColumn = 'Поле аванса не указано';
            }
            grid.down('numbercolumn[dataIndex=SumAdvance]').setText(advanceColumn);

            grid = form.down('grid[name="Log"]');
            store = grid.getStore();
            store.getProxy().setExtraParam('PayId', record.get('Id'));

            var operDate = record.get('OperDate'); //берем дату из опердня
            if (!operDate) {
                operDate = record.get('DatePack'); //берем дату из пачки
            }
            var yy = 0;
            if (operDate)
                yy = (new Date(operDate)).getFullYear();

            store.getProxy().setExtraParam('Year', yy);
            store.load();

            me.disableButtons(form, record.get('PayStatus'), record.get('PackStatus'));

            if (typePackId == B4.enums.TypePack.PaymentUK) {
                receiverField.setDisabled(true);
                receiverField.setValue(controller.getContextValue(form, 'PayerId'));
                receiverField.setRawValue(controller.getContextValue(form, 'PayerName'));
            }
            if (typePackId == B4.enums.TypePack.Payment) {
                codePay.setDisabled(true);
                if (codePay.getValue() == B4.enums.KodSumPackLs.SumThroughServiceDevice)
                    receiverField.setDisabled(true);
            }
            if (codePay.getValue() == B4.enums.KodSumPackLs.PayContragents)
                form.down('b4selectfield[name=LegalEntityId]').hide();
            form.down('[name=Services]').validate();
            form.down('[name=Fines]').validate();
            //serviceSumStore.load();

            if (record.get('MultipleAccounts')) {
                B4.QuickMsg.msg('warning', 'У данной оплаты обнаружены множественные расчетные счета!', 'warning');
            }
        }
    },

    //Распределить суммы оплаты по услугам
    distributeServiceSum: function (button) {
        var grid = button.up('gridpanel[name=ServiceSum]'),
            store = grid.getStore(),
            proxy = store.getProxy();

        store.load({
            url: B4.Url.action(proxy.distributedListAction, proxy.controllerName)
        });
    },

    //Очистить суммы оплаты по услугам
    clearServiceSum: function (button) {
        var me = this.controller,
            view = button.up('window'),
            grid = button.up('gridpanel[name=ServiceSum]'),
            paymentId = me.getContextValue(view, 'PaymentId'),
            paymentYear = me.getContextValue(view, 'Year');

        //store.getRange().forEach(function (item) {
        //    item.set('Sum', 0);
        //});
        Ext.Msg.confirm('Внимание', 'Удалить уточненные суммы?', function (answer) {
            if (answer == 'yes') {
                view.getEl().mask('Удаление...');
                B4.Ajax.request({
                    url: B4.Url.action('DeleteServiceSum', 'PayFin'),
                    params: {
                        paymentYear: paymentYear,
                        paymentId: paymentId
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
    },

    //Сохранить суммы по услугам
    saveServiceSum: function (button, callback) {
        var me = this.controller,
            view = button.up('window'),
            month = view.down('b4monthpicker[name=SelectedMonth]').getValue(),
            grid = button.up('gridpanel[name=ServiceSum]'),
            store = grid.getStore(),
            paymentId = me.getContextValue(view, 'PaymentId'),
            paymentYear = me.getContextValue(view, 'Year'),
            personalAccountId = me.getContextValue(view, 'PersonalAccountId'),
            personalAccountField = view.down('[name=PersonalAccount]');

        if (!view.getForm().isValid()) {
            B4.QuickMsg.msg('Внимание', 'Реквизиты оплаты заполнены некорректно', 'warning');
            return false;
        }

        if (me.getContextValue(view, 'showWarning')) {
            B4.QuickMsg.msg('Внимание', 'Необходимо проверить распределение оплаты в разделе \"Контроль распределения оплат\"', 'warning');
        }


        view.getEl().mask('Сохранение...');
        B4.Ajax.request({
            url: B4.Url.action('SaveServiceSum', 'PayFin'),
            params: {
                saveRecords: Ext.encode(Ext.pluck(store.data.items, 'data')),
                selectedMonth: month,
                paymentId: paymentId,
                paymentYear: paymentYear,
                personalAccountId: personalAccountId,
                dataBankId: personalAccountField.getDataBank()
            }
        }).next(function (resp) {
            view.getEl().unmask();
            var response = Ext.decode(resp.responseText);
            if (!response.success) {
                B4.QuickMsg.msg('Внимание', response.message, 'warning');
                return;
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
    },

    //заполнить авансовый платеж
    fillPays: function (cmp, value) {
        return; //задача https://task.bars-open.ru/issues/144361

        if (cmp.flagChange) {
            var sumPay = cmp.up('window').down('numberfield[name="SumPay"]');
            var sumCalc = cmp.up('window').down('textfield[name="SumCalc"]').getValue();
            var monthFrom = cmp.up('window').down('b4monthpicker[name="MonthFrom"]').getValue();
            var monthTo = cmp.up('window').down('b4monthpicker[name="MonthTo"]').getValue();

            if (monthFrom && monthTo && sumCalc > 0) {
                var months = (monthTo.getFullYear() - monthFrom.getFullYear()) * 12;
                months -= monthFrom.getMonth() + 1;
                months += monthTo.getMonth() + 2;
                var k = months <= 0 ? 0 : months;

                sumPay.setValue(sumCalc * k);
            }
        }
    },

    //при смене адреса заполнить поля
    onAddressChangeBase: function (selectfield, value, oldValue) {
        var me = this,
            win = selectfield.ownerCt;
        if (!value) return;
        if (value == "") return;

        var paymentCodeField = win.down('[name=PaymentCode]'),
            receiverField = win.down('[name=LegalEntityId]'),
            fio = win.down('[name=Fio]'),
            personalAccountState = win.down('[name=PersonalAccountState]'),
            typePkod = win.down('b4combobox[name=TypePkod]'),
            managementOrganizationName = win.down('[name=ManagementOrganizationName]'),
            calcPeniBtn = win.down('button[name=CalcPeni]'),
            payerPrincip = win.down('b4selectfield[name=NzpPayerPrincip]');

        if (receiverField) {
            receiverField.setValue();
        }

        if (calcPeniBtn) {
            calcPeniBtn.disable();
        }

        if (paymentCodeField)
            paymentCodeField.setValue(value.PaymentCode);

        if (managementOrganizationName)
            managementOrganizationName.setValue(value.ManagementOrganizationName);

        if (fio)
            fio.setValue(value.Fio);

        if (typePkod)
            typePkod.setValue(value.TypePk);

        if (payerPrincip) payerPrincip.setValue({ Id: value.NzpPayerPrincip, Name: value.PayerPrincipName });

        if (personalAccountState)
            personalAccountState.setValue(value.PersonalAccountState);

        //и вызвать смену месяца оплаты
        if (oldValue && win.newPayment && win.newPayment == true) {
            //обнулить сумму платежа, если меняем адрес
            var sumPay = win.down('[name=SumPay]');
            sumPay.setValue(null);
        }

        var dateMonthCalc = win.down('[name=DateMonthCalc]');
        if (dateMonthCalc) {

            var val = dateMonthCalc.getValue();
            if (val) {
                if (me.controller)
                    me.controller.getAspect('paymentGridWindowAspectName').onDateMonthCalcChangeBase(dateMonthCalc, val, val);
                else
                    me.getAspect('paymentGridWindowAspectName').onDateMonthCalcChangeBase(dateMonthCalc, val, val);
            }
        }
    },

    //при смене месяца заполнить поля по начислениям
    onDateMonthCalcChangeBase: function (cmp, value, b, c) {
        var me = this,
            win = cmp.up('window'),
            sumServiceField = win.down('[name=SumService]'),
            receiverField = win.down('b4selectfield[name=LegalEntityId]'),
            sumPeniField = win.down('[name=SumPeni]'),
            receiverId = 0,
            peniDiscountField = win.down('[name=PeniDiscount]'),
            calcPeniBtn = win.down('button[name=CalcPeni]'),
            payMonth = win.down('[name=DateMonthCalc]'),
            dateInput = win.down('[name=DateInput]').getValue(),
            graceDay = win.down('[name=GraceDay]'),
            controller = me.controller;

        if (!controller) {
            controller = me;
        }

        if (receiverField) {
            receiverId = receiverField.getValue();
        }

        var dateMonth = win.down('[name=DateMonthCalc]').getValue();

        if (!dateMonth) return;

        var toPayField = win.down('[name=SumCharge]');
        if (toPayField) toPayField.setValue(null);
        var paidField = win.down('[name=Paid]');
        if (paidField) paidField.setValue(null);
        var calcField = win.down('[name=SumCalc]');
        calcField.setValue(null);

        if (sumServiceField) {
            sumServiceField.setValue(null);
        }
        if (sumPeniField) {
            sumPeniField.setValue(null);
        }

        //Очищаем скидку пени
        peniDiscountField.setValue(null);

        //вытащить начисления
        var paymentCodeField = win.down('[name=PaymentCode]');
        var personalAccountField = win.down('[name=PersonalAccount]');
        var valPaymentCode = paymentCodeField.getValue();
        var valPersonalAccount = personalAccountField.getValue();
        var dataBankId = personalAccountField.getDataBank();

        var paymentCode = 0;
        var personalAccount = 0;
        if (valPaymentCode) {
            paymentCode = valPaymentCode;
        }
        if (valPersonalAccount) {
            personalAccount = valPersonalAccount;
        }

        var d = new Date(dateMonth);
        var yy = d.getFullYear();
        var mm = d.getMonth() + 1;

        if (receiverId > 0) {
            //Блокируем события
            var notListeningLocal = { value: win.notListening };
            win.notListening = true;

            B4.Ajax.request({
                url: B4.Url.action('GetChargeData', 'CashPay'),
                method: 'POST',
                params: {
                    personalAccount: personalAccount,
                    paymentCode: paymentCode,
                    receiver: receiverId,
                    dataBankId: dataBankId,
                    year: yy, //0
                    month: mm //0
                },
                timeout: 9000000
            }).next(function (jsonResp) {
                var resp = Ext.decode(jsonResp.responseText);

                if (resp.success) {
                    if (graceDay && resp.data.graceDay.length > 0) {
                        var today = new Date();
                        //Приводим к датам
                        var graceDays = resp.data.graceDay.map(function (item) {
                            return new Date(item);
                        });

                        //Определяем следующие прощеные дни
                        var nextGraceDays = graceDays.filter(function (item) {
                            if (new Date(item) >= new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
                                return true;
                            }
                        });

                        //Если такие есть, берем минимальный из них
                        if (nextGraceDays.length > 0) {
                            graceDay.setValue(new Date(Math.min.apply(null, nextGraceDays)));
                        } else {
                            //Иначе берем минимальный из всех
                            graceDay.setValue(new Date(Math.min.apply(null, graceDays)));
                        }

                        //Определяем, является ли сегодняшний день прощеным
                        var isGraceDay = false;
                        resp.data.graceDay.forEach(function (item) {
                            if (Ext.Date.format(new Date(item), 'd.m.Y') == Ext.Date.format(dateInput, 'd.m.Y')) {
                                isGraceDay = true;
                            }
                        });

                        if (calcPeniBtn && isGraceDay && (!notListeningLocal.value)) {
                            //Ext.MessageBox.show({ title: 'Внимание', msg: 'Дата приема платежа совпадает с прощеным днем', buttons: Ext.MessageBox.OK });
                            B4.QuickMsg.msg('Внимание', 'Дата приема платежа совпадает с прощеным днем', 'info');
                            calcPeniBtn.enable();
                        }
                    }
                    toPayField.setValue(null);
                    var paid = resp.data.paid,

                        sumCharge = resp.data.sumCharge,
                        sumIn = resp.data.sumIn,
                        sumOut = resp.data.sumOut,
                        sumTarif = resp.data.sumTarif,
                        sumService = resp.data.sumService,
                        sumPeni = resp.data.sumPeni;

                    //sumIn = sumOut; //чтобы не править нижний код


                    me.controller.setContextValue(win, 'SumInsaldo', sumIn);
                    me.controller.setContextValue(win, 'SumFineOutSaldo', resp.data.sumFineOutSaldo);
                    me.controller.setContextValue(win, 'SumServiceInSaldo', resp.data.sumServiceInSaldo);
                    me.controller.setContextValue(win, 'SumServiceOutSaldo', resp.data.sumServiceOutSaldo);

                    if (sumOut < 0) {
                        sumOut = 0;
                    }

                    toPayField.setValue(sumCharge); //начислено к оплате
                    if (paidField) paidField.setValue(paid); //оплачено

                    if (sumServiceField) {
                        sumServiceField.setValue(sumService);
                    }
                    if (sumPeniField) {
                        sumPeniField.setValue(sumPeni);
                    }

                    if (win.newPayment && win.newPayment == true) {
                        //в новом платеже вычисляем сумму платежа

                        var sumPayField = win.down('[name=SumPay]'); //сумма платежа
                        sumPayField.setValue(sumOut); //всегда исх. сальдо выбранного месяца, Лиза (с)
                        /*
                        //if (sumPayField.getValue() > 0) {
                        //    //не трогаем сумму
                        //} else {
                        if (paid > 0) {
                            //если оплачено, то выводим разницу
                            var sum = sumIn - paid;
                            if (sum > 0)
                                sumPayField.setValue(sum);
                        } else {
                            //к оплате - вх. сальдо
                            sumPayField.setValue(sumIn);
                        }
                        //}
                        */
                    }

                    calcField.setValue(sumTarif);
                    win.down('[name=Fines]').validate();

                    win.down('panel[name=ServiceSum] b4monthpicker[name=SelectedMonth]').setValue(value);

                    //Разблокирываем события
                    win.notListening = false;

                    return;
                }
            });
        }
    },

    //Перейти в лицевой счет
    go2Account: function (cmp) {
        var me = this,
            view = cmp.up('window'),
            record = view.getRecord();

        var account = record.get('PersonalAccount');
        me.controller.application.redirectTo(Ext.String.format('#personalaccountinfo/{0}/{1}', account, record.get('DataBank')));
    },

    //Печать одной платежки
    exportDocument: function (btn) {
        var view = btn.up('window'),
            record = view.getRecord(),
            dataBankId = record.get('DataBank'),
            personalAccountId = record.get('PersonalAccount'),
            legalEntityId = view.down('b4selectfield[name=LegalEntityId]').getValue();
        var payees = legalEntityId > 0 ? [legalEntityId] : null;

        var src = B4.Url.action('/BillingReport/GetInvoicePdf?' +
            'id=' + personalAccountId + '&' +
            'dataBankId=' + dataBankId + '&' +
            'year=0&' +
            'month=0&' +
            'payees=' + Ext.encode(payees));

        Ext.create('B4.form.Window', {
            title: 'Просмотр',
            width: 700,
            height: 500,
            plain: true,
            modal: true,
            constrain: true,
            html: '<iframe src="' + src + '" width="100%" height="100%" />'
        }).show();
    },

    //Операции с оплатой
    runOperation: function (cmp) {
        var me = this,
            view = cmp.up('window'),
            groupList = [];

        var actMessage = '';
        var action = '';
        var operation = '';
        var distrib = false;

        switch (cmp.name) {
            case 'distribOnButton':
                {
                    actMessage = 'Распределение оплаты';
                    action = 'распределения оплаты';
                    operation = 'Distrib';
                    distrib = true;
                    break;
                }
            case 'distribOffButton':
                {
                    actMessage = 'Отмена распределения оплаты';
                    action = 'отмены распределения оплаты';
                    operation = 'Distrib';
                    distrib = false;
                    break;
                }
            case 'incaseButton':
                {
                    actMessage = 'Размещение оплаты в портфеле';
                    action = 'размещения оплаты в портфеле';
                    operation = 'Incase';
                    distrib = true;
                    break;
                }
            case 'incaseOutButton':
                {
                    actMessage = 'Извлечение оплаты из портфеля';
                    action = 'Извлечения оплаты из портфеля';
                    operation = 'Incase';
                    distrib = false;
                    break;
                }
            case 'inbasketButton':
                {
                    actMessage = 'Размещение оплаты в корзине';
                    action = 'размещения оплаты в корзине';
                    operation = 'Inbasket';
                    distrib = true;
                    break;
                }
            case 'repairButton':
                {
                    actMessage = 'Исправление оплаты в корзине';
                    action = 'исправления оплаты в корзине';
                    operation = 'Repair';
                    break;
                }

            default:
        }

        var record = view.getRecord();
        var id = record.getId();
        groupList.push(id);

        Ext.Msg.confirm(actMessage,
            'Вы действительно хотите выполнить операцию ' + action + '?', function (result) {

                if (result == 'yes') {

                    view.getEl().mask(actMessage + '...');

                    B4.Ajax.request({
                        url: 'PayFin/' + operation,
                        method: 'POST',
                        params: {
                            payId: id,
                            distrib: distrib,
                            groupList: Ext.encode(groupList),
                            date_opl: view.down('[name=DateInput]').getValue(),
                            year: me.controller.getContextValue(view, 'Year')
                        },
                        timeout: 9999999
                    }).next(function (jsonResp) {
                        view.getEl().unmask();
                        var response = Ext.decode(jsonResp.responseText);
                        if (!response.success) {
                            B4.QuickMsg.msg('Внимание',
                                response.message,
                                'warning'
                            );
                            return;
                        }

                        //надо переоткрыть форму и перевыбрать грид
                        me.editRecord(record, me.getGrid());
                        me.getGrid().getStore().reload();

                        B4.QuickMsg.msg('Выполнено',
                            'Операция успешно выполнена',
                            'success'
                        );

                        me.refreshData(); //обновить данные

                        //Ext.Msg.alert(response.success ? 'Выполнено!' : 'Внимание!', response.data);

                    }).error(function (response) {
                        view.getEl().unmask();
                        B4.QuickMsg.msg('Внимание', 'При выполнении операции произошла ошибка', 'warning');

                    });
                }
            }, me);
    },



    //закрыть редактирование
    disableFields: function (component, flag) {
        var me = this;
        Ext.iterate(component.items.items, function (subitem) {
            if (subitem.items && Ext.isIterable(subitem.items.items)) {
                me.disableFields(subitem, flag);

            } else if (subitem.isValid) {

                //Эти поля безусловно не должны редактироваться
                if (subitem.name == 'PayStatus' ||
                    subitem.name == 'OperDate' ||
                    subitem.name == 'SumCharge' ||
                    subitem.name == 'SumCalc' ||
                    subitem.name == 'Fio' ||
                    subitem.name == 'ManagementOrganizationName' ||
                    subitem.name == 'BankName' ||
                    subitem.name == 'SumService' ||
                    subitem.name == 'SumPeni' ||
                    subitem.name == 'PeniDiscount' ||
                    subitem.name == 'AlgorithmNumber' ||
                    subitem.name == 'UserDateDistr' ||
                    subitem.name == 'UserDateDistr' ||
                    subitem.name == 'GraceDay' ||

                    subitem.name == 'DistributionParameter' ||
                    subitem.name == 'DistributionPriority' ||
                    subitem.name == 'DistributionPeniOrder' ||
                    subitem.name == 'DistributionAlgorithmNumber' ||
                    subitem.name == 'DistributionDate' ||
                    subitem.name == 'Fines' ||
                    subitem.name == 'PaidInSystem' ||
                    subitem.name == 'BankSumKomiss' ||
                    subitem.name == 'OfficeNumber' ||
                    subitem.name == 'KassirNumber' ||
                    subitem.name == 'UserName'
                ) {
                    subitem.setDisabled(true);
                    if (subitem.labelEl) {
                        subitem.labelEl.setOpacity(1);
                    }

                } else {
                    subitem.setDisabled(flag);
                    if (flag && subitem.labelEl) {
                        subitem.labelEl.setOpacity(1);
                    }
                }
            }
        });


    },

    /*
    public enum PayStatus
    {
        [Display("Не распределена")] 
        NotDistrib = 0,

        [Display("Распределена")]
        Distrib = 1,

        [Display("В корзине")]
        InBasket = 2,

        [Display("В портфеле")]
        InCase = 3
    }
    */

    //закрыть кнопки в зависимости от статуса
    disableButtons: function (form, status, packstatus) {
        var me = this;
        var b,
            b52 = (packstatus == 52); //пачка закрыта;

        b = ((status == 0) || (status == 2)) && form.allowEdit; //Сохраниить: когда не распределена или в корзине
        form.down('buttongroup [name=saveButton]').setDisabled(!b);

        b = ((status == 0) || (status == 2)) && form.allowDistribute; //Распределить: когда не распределена или в корзине
        form.down('buttongroup [name=distribOnButton]').setDisabled(!b);

        b = (!b52 && (status == 1) || (status == 3)) && form.allowDistribute; //Отмена распределена (платежа): когда распределена(и пачка еще не закрыта) или в портфеле
        form.down('buttongroup [name=distribOffButton]').setDisabled(!b);

        b = (status == 1 && form.allowEdit); //В портфель: когда распределена
        form.down('buttongroup [name=incaseButton]').setDisabled(!b);

        b = (status == 3 && form.allowEdit); //Из портфеля: когда в портфеле
        form.down('buttongroup [name=incaseOutButton]').setDisabled(!b);

        b = (status == 0 && form.allowEdit); //В корзину: когда не распределена
        form.down('buttongroup [name=inbasketButton]').setDisabled(!b);

        b = (status == 2 && form.allowEdit); //Исправить: когда в корзине
        if (form.down('buttongroup [name=repairButton]'))
            form.down('buttongroup [name=repairButton]').setDisabled(!b);

        //уточнение суммы оплаты
        b = ((status == 0) || (status == 2)) && form.allowEdit; //Распределить: когда не распределена или в корзине
        form.down('panel[name=ServiceSum] button[name=Distribute]').setDisabled(!b);
        form.down('panel[name=ServiceSum] button[name=Save]').setDisabled(!b);
        form.down('panel[name=ServiceSum] button[name=ClearAll]').setDisabled(!b);
        //form.down('panel[name=ServiceSum] b4monthpicker[name=SelectedMonth]').setDisabled(!b);
        //form.down('panel[name=ServiceSum] b4combobox[name=Standart]').setDisabled(!b);

        //статусы
        switch (status) {
            case 0:
                {
                    //не распределена
                    me.disableFields(form, false); //открыть редактирование
                    break;
                }
            case 1:
                {
                    //распределена
                    me.disableFields(form, true); //закрыть редактирование
                    break;
                }
            case 2:
                {
                    //в корзине
                    me.disableFields(form, false); //открыть редактирование
                    break;
                }
            case 3:
                {
                    //в портфеле
                    me.disableFields(form, true); //закрыть редактирование
                    break;
                }
            default:
        }
    },

    //удаление оплаты
    deleteRecord: function (record) {
        var me = this;

        Ext.Msg.confirm('Удаление оплаты!', 'Вы действительно хотите удалить оплату?', function (result) {
            if (result == 'yes') {
                var model = this.getModel(record),
                    id = record.getId(),
                    operDate = record.get('OperDate'),
                    year = record.get('Year'),
                    pref = record.get('Pref');


                var rec = new model({ Id: id });
                me.mask('Удаление');

                //Отменяем оплату на ККМ
                me.deleteKkmPayment(id, year, operDate, pref, record.get('CreatedOnKkm'), record.get('DeletedOnKkm'), function (returnResp, sessionNumber) {
                    if (!returnResp.success) {
                        me.unmask();
                        return;
                    }

                    //Удаляем оплату
                    rec.destroy({
                        params: {
                            Year: year,
                            SessionNumber: sessionNumber
                        }
                    })
                        .next(function () {
                            me.unmask();
                            this.fireEvent('deletesuccess', this);
                            me.updateGrid();

                            me.refreshData(); //обновить данные

                        },
                            this)
                        .error(function (result) {
                            me.unmask();

                            if (result.responseData && !result.responseData.success) {
                                B4.QuickMsg.warning(result.responseData.message);
                                return;
                            }

                            //Проверяем, выполнилось ли удаление, т.к. мог упать таймаут nginx'a
                            me.checkIsPaymentDeleting(record.getId(), record.get('Year'), 0);
                            console
                                .log('Превышен интервал ожиданию ответа от сервера, запущена асинхронная проверка удаления оплаты');
                        },
                            this);
                });
            }
        }, me);
    },

    //Проверка выполнения удаления оплаты
    checkIsPaymentDeleting: function (paymentId, year, counter) {
        var me = this;

        if (!year || !paymentId) {
            B4.QuickMsg.msg('Внимание', 'Не удалось определить идентификатор или год оплаты', 'warning');
            return;
        }

        //Если прошло слишком много итераций
        if (!counter > 50) {
            B4.QuickMsg.msg('Внимание', 'Во время выполнения удаления произошла ошибка', 'warning', 10000);
            return;
        }

        B4.Ajax.request({
            url: B4.Url.action('/PayFin/CheckIsPaymentDeleted'),
            timeout: 9999999,
            method: 'POST',
            params: {
                paymentId: paymentId,
                year: year
            }
        }).next(function (resp) {
            var response = Ext.decode(resp.responseText);
            if (!response.success) {
                B4.QuickMsg.msg('Внимание', 'При выполнении операции произошла ошибка', 'warning');
                if (view.getEl()) {
                    view.getEl().unmask();
                }
                return;
            }

            switch (response.data) {
                case true:
                    {
                        B4.QuickMsg.msg('Выполнено', 'Удаление выполнено успешно', 'success');
                        break;
                    }
                case false:
                    {
                        //снова проверяем статус удаления
                        Ext.defer(function () {
                            console.log('Проверка удаления оплаты - шаг ' + counter);
                            me.checkIsPaymentDeleting(paymentId, year, counter + 1);
                        }, 10000);
                        return;

                    }
                default:
                    {
                        B4.QuickMsg.msg('Внимание', 'Во время выполнения удаления произошла ошибка', 'warning');
                    }
            }

            me.unmask();
            me.fireEvent('deletesuccess', this);
            me.updateGrid();

            me.refreshData(); //обновить данные
        }).error(function () {
            me.unmask();
            B4.QuickMsg.msg('Внимание', 'Во время выполнения удаления произошла ошибка', 'warning');
        });
    },

    //обновить данные после выполнении операции
    refreshData: function () {

    }
});