/*
    Аспект групповых операций
*/
Ext.define('B4.aspects.GroupOperAspect', {
    extend: 'B4.base.Aspect',

    alias: 'widget.groupOperAspect',

    requires: [
        'B4.QuickMsg',
        'B4.mixins.MaskBody',
        'B4.mixins.LayoutControllerLoader',
        'B4.view.register.houseregister.house.GroupHouseData',
        'B4.model.register.personalaccount.backorder.BackOrder',
        'B4.view.register.personalaccount.grid.GroupList',
        'B4.view.register.personalaccount.grid.LoadWindow',
        'B4.view.register.personalaccount.grid.GroupHouseRoomCharacteristics',
        'B4.view.register.personalaccount.grid.GroupHouseCharacteristics',
        'B4.view.register.personalaccount.grid.GroupBackorder',
        'B4.view.register.personalaccount.grid.GroupAccountData',
        'B4.view.register.personalaccount.grid.GroupServices',
        'B4.view.register.personalaccount.groupoperation.GroupPaymentCodesParameters',
        'B4.view.register.personalaccount.grid.GroupAccountFactura',
        'B4.view.register.personalaccount.grid.GroupServiceProviders',
        'B4.view.register.personalaccount.grid.GroupAccountPeniService',
        'B4.form.register.personalaccount.groupoperation.Tariff',
        'B4.form.register.personalaccount.groupoperation.SaldoEdit',
        'B4.form.register.personalaccount.groupoperation.ManagementOrganizationScopeChange',
        'B4.form.register.personalaccount.groupoperation.ManagementOrganizationScope',
        'B4.aspects.permission.Kp60PermissionAspect',
        'B4.view.register.houseregister.housegroup.GroupOper',
        'B4.form.register.house.groupoperation.Boiler',
        'B4.view.register.houseregister.epdformsetting.Window',
        'B4.form.register.personalaccount.groupoperation.SignAllocation',
        'B4.form.register.personalaccount.groupoperation.DisableRecalculation',
        'B4.view.register.personalaccount.grid.GroupCountersCharesteristics',
        'B4.form.register.personalaccount.groupoperation.GenerateCounter',
        'B4.form.register.personalaccount.groupoperation.ChangePersonalAccountsAddress',
        'B4.form.register.house.groupoperation.TransferSaldo',
        'B4.form.register.personalaccount.groupoperation.ReplaceSupplier',
        'B4.view.register.personalaccount.groupoperation.MergeLs',
        'B4.form.register.house.groupoperation.SetSquarePremise',
        'B4.view.register.personalaccount.grid.GroupPersonalAccountData',
        'B4.form.register.house.groupoperation.GenerateAvgCounterConsumption',
        'B4.form.register.personalaccount.groupoperation.GenerateAvgCounterConsumption'
    ],

    nameAspect: undefined,
    gridSelector: undefined,
    backorderWindowSelector: undefined,
    dataWindowSelector: undefined,
    dataChangeManagementOrganizationWindowSelector: undefined,
    servicesWindowSelector: undefined, //'personalaccountgroupservices',
    groupWindowSelector: undefined, //'personalaccountgrouplist',
    houseroomWindowSelector: undefined, //houseroomcharacteristics
    houseParamsWindowSelector: undefined,
    paymentCodesParametersSelector: undefined,
    facturaWindowSelector: undefined, //groupaccountfacturawindow
    serviceprovidersWindowSelector: undefined, // groupaccountserviceproviderswindow
    peniServiceWindowSelector: undefined,
    housegroupGroupOper: undefined,
    managementOrganizationScopeSelector: undefined,
    boilerGroupOperSelector: undefined,
    epdFormSettingGroupOperSelector: undefined,
    groupCountersCharesteristic: undefined,
    signAllocationGroupOperSelector: undefined,
    disableRecalculationGroupOperSelector: undefined,
    groupCountersValsSelector: undefined,
    generatePersonalCounterGroupOperSelector: undefined,
    ChangePersonalAccountsAddressGroupOperSelector: undefined,

    selectedRecords: undefined,
    multiBank: true, //признак мультибанка
    isHouses: false, //true-список домов, false-список лицевых счетов
    isHouseParams: false, //true - домовые параметры

    constructor: function (config) {
        Ext.apply(this, config);
        this.callParent(arguments);
    },

    init: function (controller) {
        var me = this,
            actions = {};

        me.callParent(arguments);

        //------------------------------------------------
        //Групповые операции над списком домов
        //------------------------------------------------
        //домовые недопоставки
        actions[me.gridSelector + ' menuitem[name=HouseBackorder]'] = {
            'click': {
                fn: me.onOpenGroupHouseBackorder,
                scope: me
            }
        };
        //домовые услуги
        actions[me.gridSelector + ' menuitem[name=HouseServices]'] = {
            'click': {
                fn: me.onOpenHouseServices,
                scope: me
            }
        };

        //домовые параметры
        actions[me.gridSelector + ' menuitem[name=HouseGroupHouseParams]'] = {
            'click': {
                fn: me.onOpenHouseGroupHouseRoomParams,
                scope: me
            }
        };

        //квартирные характеристики
        actions[me.gridSelector + ' menuitem[name=HouseGroupHouseCharacteristics]'] = {
            'click': {
                fn: me.onOpenHouseGroupHouseRoomCharacteristics,
                scope: me
            }
        };
        //домовые реквизиты
        actions[me.gridSelector + ' menuitem[name=HouseData]'] = {
            'click': {
                fn: me.onOpenGroupHouseData,
                scope: me
            }
        };

        //расчет среднего по ОДПУ
        actions[me.gridSelector + ' menuitem[name=CalcAvgODPUConsumption]'] = {
            'click': {
                fn: function (view) { me.generateAverageConsumption(view, B4.enums.CounterTypesHouse.HouseCounter) },
                scope: me
            }
        };

        //расчет среднего по ГПУ
        actions[me.gridSelector + ' menuitem[name=CalcAvgGPUConsumption]'] = {
            'click': {
                fn: function (view) { me.generateAverageConsumption(view, B4.enums.CounterTypesHouse.GroupCounter) },
                scope: me
            }
        };

        //расчет среднего по ИПУ
        actions[me.gridSelector + ' menuitem[name=CalcAvgCounterConsumption]'] = {
            'click': {
                fn: me.generateAverageConsumptionIPU,
                scope: me
            }
        };
        //расчет среднего по ИПУ/ОКПУ по 354
        actions[me.gridSelector + ' menuitem[name=CalcAvgAccountCounterConsumptionBy354]'] = {
            'click': {
                fn: me.generateAverageConsumptionIPUBy354,
                scope: me
            }
        };
        //расчет среднего по ИПУ/ОКПУ для перерасчетных месяцев
        actions[me.gridSelector + ' menuitem[name=CalcAvgAccountCounterConsumptionBy354ForRecalcPeriods]'] = {
            'click': {
                fn: me.generateAverageConsumptionIPUBy354ForRecalcPeriods,
                scope: me
            }
        };
        actions[me.dataWindowSelector + '[nameAspect=' + me.nameAspect + '] button[name=SaveHouseData]'] = {
            'click': {
                fn: me.onSaveGroupHouseData,
                scope: me
            }
        };

        //домовые ЕПД
        actions[me.gridSelector + ' menuitem[name=HouseFactura]'] = {
            'click': {
                fn: me.onOpenHouseFactura,
                scope: me
            }
        };

        actions[me.gridSelector + ' menuitem[name=HouseChangeManagementOrganization]'] = {
            'click': {
                fn: me.onOpenHouseChangeManagementOrganization,
                scope: me
            }
        };
        actions[me.gridSelector + ' menuitem[name=HouseGroup]'] = {
            'click': {
                fn: me.onOpenGroupHouse,
                scope: me
            }
        };
        actions[me.housegroupGroupOper + ' b4addbutton'] = {
            'click': {
                fn: function (button) {
                    var edf = this.getEditForm();
                    edf.performSelection(me.onSelected(this, button.up('window')));
                },
                scope: me
            }
        };
        actions[me.housegroupGroupOper + ' b4updatebutton'] = {
            'click': {
                fn: function (button) {
                    button.up('window').down('gridpanel').getView().refresh();
                },
                scope: me
            }
        };
        actions[me.housegroupGroupOper] = {
            'afterrender': {
                fn: function (view) {
                    me.viewGroupOper = view;
                    view.down('gridpanel').store.load();
                },
                scope: me
            }
        };
        actions[me.housegroupGroupOper + ' gridpanel'] = {
            'rowaction': {
                fn: function (gridView, rowIndex, rec) {
                    Ext.Msg.confirm('Удаление записи!', 'Вы действительно хотите удалить запись?', function (result) {
                        if (result == 'yes') {
                            gridView.getEl().mask('Удаление...');
                            gridView.store.remove(rec);
                            gridView.getEl().unmask();
                        }
                    }, me);

                },
                scope: me
            }
        };
        actions[me.housegroupGroupOper + ' button[name=inGroup]'] = {
            'click': {
                fn: function (button) {
                    var me = this, mainView = me.controller.getMainView(), view = button.up('window'), groupList = [], houseListid = [];
                    var houseList = me.controller.getContextValue(mainView, me.selectedRecords);
                    var records = view.down('gridpanel').store.getRange();
                    groupList = records.filter(function (item) { return item.get('Checked'); }).map(function (item) { return item.getId(); });
                    for (var i in houseList) {
                        houseListid.push(houseList[i].id);
                    }
                    Ext.Msg.confirm('Добавление домов в группу!', 'Вы действительно хотите добавить дома в выбранные группы?', function (result) {
                        if (result == 'yes') {
                            view.getEl().mask('Добавление...');
                            B4.Ajax.request({
                                url: B4.Url.action('SaveGroup', 'HouseGroup'),
                                params: {
                                    groupList: Ext.encode(groupList),
                                    houseList: Ext.encode(houseListid)
                                }
                            }).next(function (resp) {
                                view.getEl().unmask();
                                B4.QuickMsg.msg(
                                    'Успех',
                                    'Групповая операция успешно выполнена',
                                    'info'
                                );
                                view.close();
                            });

                        }
                    }, me);

                },
                scope: me
            }
        };
        actions[me.housegroupGroupOper + ' button[name=outGroup]'] = {
            'click': {
                fn: function (button) {
                    var me = this, mainView = me.controller.getMainView(), view = button.up('window'), groupList = [], houseListid = [];
                    var houseList = me.controller.getContextValue(mainView, me.selectedRecords);
                    var records = view.down('gridpanel').store.getRange();
                    groupList = records.filter(function (item) { return item.get('Checked'); }).map(function (item) { return item.getId(); });
                    for (var i in houseList) {
                        houseListid.push(houseList[i].id);
                    }
                    Ext.Msg.confirm('Исключение домов из группы!', 'Вы действительно хотите исключить дома из выбранных групп?', function (result) {
                        if (result == 'yes') {
                            view.getEl().mask('Исключение...');
                            B4.Ajax.request({
                                url: B4.Url.action('DeleteGroup', 'HouseGroup'),
                                params: {
                                    groupList: Ext.encode(groupList),
                                    houseList: Ext.encode(houseListid)
                                }
                            }).next(function (resp) {
                                view.getEl().unmask();
                                B4.QuickMsg.msg(
                                    'Успех',
                                    'Групповая операция успешно выполнена',
                                    'info'
                                );
                                view.close();
                            });

                        }
                    }, me);

                },
                scope: me
            }
        };

        actions[me.gridSelector + ' menuitem[name=ManagementOrganizationScope]'] = {
            'click': {
                fn: me.onOpenManagementOrganizationScope,
                scope: me
            }
        };

        actions[me.gridSelector + ' menuitem[name=BoilerGroupOper]'] = {
            'click': {
                fn: me.onOpenBoilerGroupOper,
                scope: me
            }
        };
        
        actions[me.gridSelector + ' menuitem[name=EpdFormSettingGroupOper]'] = {
            'click': {
                fn: me.onOpenEpdFormSettingGroupOper,
                scope: me
            }
        };


        //------------------------------------------------
        //Групповые операции над списком лс
        //------------------------------------------------
        //групповые недопоставки
        actions[me.gridSelector + ' menuitem[name=PersonalAccountBackorder]'] = {
            'click': {
                fn: me.onOpenGroupPersonalAccountBackorder,
                scope: me
            }
        };
        actions[me.backorderWindowSelector + '[nameAspect=' + me.nameAspect + '] button[name=Add]'] = {
            'click': {
                fn: me.onSaveGroupPersonalAccountBackorder,
                scope: me
            }
        };
        actions[me.backorderWindowSelector + '[nameAspect=' + me.nameAspect + '] button[name=Delete]'] = {
            'click': {
                fn: me.onDeleteGroupPersonalAccountBackorder,
                scope: me
            }
        };


        //групповые реквизиты лицевого счета
        actions[me.gridSelector + ' menuitem[name=PersonalAccountData]'] = {
            'click': {
                fn: me.onOpenGroupPersonalAccountData,
                scope: me
            }
        };
        actions[me.dataWindowSelector + '[nameAspect=' + me.nameAspect + '] button[name=Add]'] = {
            'click': {
                fn: me.onSaveGroupPersonalAccountData,
                scope: me
            }
        };


        //групповые услуги
        actions[me.gridSelector + ' menuitem[name=PersonalAccountServices]'] = {
            'click': {
                fn: me.onOpenPersonalAccountServices,
                scope: me
            }
        };
        actions[me.servicesWindowSelector + '[nameAspect=' + me.nameAspect + ']'] = {
            'afterrender': {
                fn: me.onPersonalAccountServicesRender,
                scope: me
            }
        };
        actions[me.servicesWindowSelector + '[nameAspect=' + me.nameAspect + '] grid'] = {
            'rowaction': {
                fn: me.onGroupServiceRowAction,
                scope: me
            }
        };
        actions[me.servicesWindowSelector + '[nameAspect=' + me.nameAspect + '] b4savebutton'] = {
            'click': {
                fn: me.groupServiceSave,
                scope: me
            }
        };

        //группы лс
        actions[me.gridSelector + ' menuitem[name=PersonalAccountGroup]'] = {
            'click': {
                fn: me.onOpenPersonalAccountGroup,
                scope: me
            }
        };
        actions[me.groupWindowSelector + '[nameAspect=' + me.nameAspect + ']'] = {
            'afterrender': {
                fn: me.onLoadGroupList,
                scope: me
            }
        };
        actions[me.groupWindowSelector + ' b4addbutton'] = {
            'click': {
                fn: me.addNewGroup,
                scope: me
            }
        };

        actions[me.groupWindowSelector + '[nameAspect=' + me.nameAspect + '] button[name=IncludeInGroup]'] = {
            'click': {
                fn: me.includeInGroup,
                scope: me
            }
        };
        actions[me.groupWindowSelector + '[nameAspect=' + me.nameAspect + '] button[name=ExcludeFromGroup]'] = {
            'click': {
                fn: me.excludeFromGroup,
                scope: me
            }
        };


        //групповые операции с параметрами
        actions[me.gridSelector + ' menuitem[name=PersonalAccountGroupHouseRoomCharacteristics]'] = {
            'click': {
                fn: me.onOpenPersonalAccountGroupHouseRoomCharacteristics,
                scope: me
            }
        };
        actions[me.houseroomWindowSelector + '[nameAspect=' + me.nameAspect + '] b4savebutton'] = {
            'click': {
                fn: me.onGroupHouseRoomCharacteristicsSave,
                scope: me
            }
        };
        actions[me.houseroomWindowSelector + '[nameAspect=' + me.nameAspect + '] parameterlist'] = {
            'rowaction': {
                fn: me.onGroupHouseRoomCharacteristicsDelete,
                scope: me
            }
        };
        //групповые операции с характеристиками жилья
        actions[me.gridSelector + ' menuitem[name=PersonalAccountGroupHouseCharacteristics]'] = {
            'click': {
                fn: me.onOpenPersonalAccountGroupHouseCharacteristics,
                scope: me
            }
        };

        //групповые операции с параметрами платежных кодов
        actions[me.gridSelector + ' menuitem[name=PersonalAccountGroupPaymentCodesParameters]'] = {
            'click': {
                fn: me.onOpenPersonalAccountGroupPaymentCodesParameters,
                scope: me
            }
        };

        //групповой ввод показаний ПУ
        actions[me.gridSelector + ' menuitem[name=GroupCountersVals]'] = {
            'click': {
                fn: me.onOpenGroupCountersVals,
                scope: me
            }
        };


        actions[me.gridSelector + ' menuitem[name=GroupCountersCharesteristic]'] = {
            'click': {
                fn: me.onOpenGroupCountersCharesteristic,
                scope: me
            }
        };


        //Групповая печать лицевых счетов
        actions[me.gridSelector + ' menuitem[name=PersonalAccountFactura]'] = {
            'click': {
                fn: me.onOpenPersonalAccountFactura,
                scope: me
            }
        };
        actions[me.facturaWindowSelector + '[nameAspect=' + me.nameAspect + '] button[name=Export]'] = {
            'click': {
                fn: me.onSavePersonalAccountFactura,
                scope: me
            }
        };
        
        //ИЗменение признаков перерасчета
        actions[me.gridSelector + ' menuitem[name=SignAllocation]'] = {
            'click': {
                fn: me.onOpenSignAllocation,
                scope: me
            }
        };

        //Изменение признаков запрета перерасчета
        actions[me.gridSelector + ' menuitem[name=DisableRecalculation]'] = {
            'click': {
                fn: me.onOpenDisableRecalculation,
                scope: me
            }
        };

        //Генерация ИПУ
        actions[me.gridSelector + ' menuitem[name=GeneratePersonalCounter]'] = {
            'click': {
                fn: me.onOpenGeneratePersonalCounter,
                scope: me
            }
        };

        //Смена адреса лицевых счетов
        actions[me.gridSelector + ' menuitem[name=ChangePersonalAccountsAddress]'] = {
            'click': {
                fn: me.onOpenChangePersonalAccountsAddress,
                scope: me
            }
        };

        //Групповая настройка пени
        actions[me.gridSelector + ' menuitem[name=PersonalAccountPeniService]'] = {
            'click': {
                fn: me.onOpenPersonalAccountPeniService,
                scope: me
            }
        };

        actions[me.peniServiceWindowSelector + '[nameAspect=' + me.nameAspect + ']'] = {
            'afterrender': {
                fn: function (view) {
                    var mainView = me.controller.getMainView(),
                        payers = view.down('b4selectfield[name=PaymentList]'),
                        supplierStore = view.down('b4selectfield[name=SupplierList]').getStore(),
                        store = payers.getStore(),
                        legalEntityId = payers.getValue(),
                        selectedPersonalAccounts = me.controller.getContextValue(mainView, me.selectedRecords);
                    view.down('datefield[name=DateBegin]').focus(false, 200);
                    view.down('b4selectfield[name=FormulaList]').setValue({ Id: 50, Name: 'Расчет пени', MeasureName: 'с кв. в мес' });
                    store.on({
                        beforeload: function (store, operation) {
                            operation.params = operation.params || {};
                            operation.params.dataBankId = me.controller.getContextValue(mainView, 'dataBankId');
                            operation.params.personalAccountList = Ext.encode(selectedPersonalAccounts.map(function (item) { return item.id; }));
                            operation.params.LegalEntityId = legalEntityId;
                        }
                    });
                    store.load();
                    supplierStore.on({
                        beforeload: function (store, operation) {
                            operation.params = operation.params || {};
                            operation.params.dataBankId = me.controller.getContextValue(mainView, 'dataBankId');
                            operation.params.personalAccountList = Ext.encode(selectedPersonalAccounts.map(function (item) { return item.id; }));
                            operation.params.LegalEntityId = legalEntityId;
                        }
                    });
                    supplierStore.load();
                },
                scope: me
            }
        };
        actions[me.peniServiceWindowSelector + '[nameAspect=' + me.nameAspect + '] b4selectfield[name=PaymentList]'] = {
            'change': {
                fn: function (field) {
                    var view = field.up('window');
                    var supplierList = view.down('[name=SupplierList]');
                    if (supplierList) {
                        if (supplierList.getValue() || field.getValue()) {
                            supplierList.allowBlank = true;
                        } else {
                            supplierList.allowBlank = false;
                        }
                        supplierList.isValid();
                        if (!field.getValue())
                            supplierList.clearValue();
                        supplierList.getStore().on({
                            beforeload: function (store, operation) {
                                operation.params = operation.params || {};
                                operation.params.LegalEntityId = field.getValue();
                            }
                        });
                    }
                },
                scope: me
            }
        };
        actions[me.peniServiceWindowSelector + '[nameAspect=' + me.nameAspect + '] button[name=Add]'] = {
            'click': {
                fn: me.onSaveGroupPeniService,
                scope: me
            }
        };
        actions[me.gridSelector + ' menuitem[name=TariffOperations]'] = {
            'click': {
                fn: me.onOpenTariffOperation,
                scope: me
            }
        };
        actions[me.gridSelector + ' menuitem[name=SaldoEdit]'] = {
            'click': {
                fn: me.onOpenSaldoEdit,
                scope: me
            }
        };
        actions[me.gridSelector + ' menuitem[name=SaldoTransfer]'] = {
            'click': {
                fn: me.onOpenTransferSaldoWindow,
                scope: me
            }
        };

        //Замена договоров ЖКУ
        actions[me.gridSelector + ' menuitem[name=ReplaceSupplier]'] = {
            'click': {
                fn: me.onOpenReplaceSupp,
                scope: me
            }
        };

        //Слияние ЛС
        actions[me.gridSelector + ' menuitem[name=MergeLs]'] = {
            'click': {
                fn: me.onOpenMergeLsWindow,
                scope: me
            }
        };

        //Установить площади жилых/нежилых помещений
        actions[me.gridSelector + ' menuitem[name=SetSquarePremise]'] = {
            'click': {
                fn: me.onOpenSetSquarePremise,
                scope: me
            }
        };

        //Групповой ввод реквизитов ЛС
        actions[me.gridSelector + ' menuitem[name=PersonalAccountGroupData]'] = {
            'click': {
                fn: me.onOpenPersonalAccountGroupData,
                scope: me
            }
        };

        actions[me.gridSelector + ' menuitem[name=SetOwnerCount]'] = {
            'click': {
                fn: me.onOpenSetSobstwWindow,
                scope: me
            }
        };

        actions[me.gridSelector + ' menuitem[name=SetServiceProvider]'] = {
            'click': {
                fn: me.onOpenSetServiceProviderWindow,
                scope: me
            }
        };
        actions[me.serviceprovidersWindowSelector + '[nameAspect=' + me.nameAspect + '] button[name=Execute]'] = {
            'click': {
                fn: me.onPerformGroupOperationServiceProvider,
                scope: me
            }
        };
        actions[me.serviceprovidersWindowSelector + '[nameAspect=' + me.nameAspect + '] button[name=Overwrite]'] = {
            'click': {
                fn: me.onPerformGroupOperationOverwriteServiceProvider,
                scope: me
            }
        };
        actions[me.serviceprovidersWindowSelector + '[nameAspect=' + me.nameAspect + '] b4calcmonthpicker[name=DateOfSet]'] = {
            'change': {
                fn: me.onChangeSelectedMonth,
                scope: me
            }
        };
        
        controller.control(actions);
    },

    loadChangeManagement: function (view, notReloadMo) {
        var me = this,
            mainView = me.controller.getMainView(),
            houseList = me.controller.getContextValue(mainView, me.selectedRecords),
            dateBegin = view.down('b4calcmonthpicker[name=StartDate]'),
            dateCalc = view.down('b4calcmonthpicker[name=ChargeDate]');
        view.getEl().mask("Загрузка" + '...');
        B4.Ajax.request({
            url: B4.Url.action('/CalculationMonth/GetCalculationMonth')
        }).next(function (resp) {
            var response = Ext.decode(resp.responseText);

            //Устанавливаем в окончание периода текущий расчетный месяц
            if (dateBegin.getValue() == null)
                dateBegin.setValue(response.data.CalculationMonth);
            dateCalc.setValue(response.data.CalculationMonth);

            B4.Ajax.request({
                url: B4.Url.action('/HouseChangeManagementOrganization/SaveChangeUserCash'),
                params: {
                    HouseList: Ext.encode(houseList),
                    DateBegin: dateBegin.getValue()
                },
                timeout: 9999999
            }).next(function (jsonResp) {
                view.down('gridpanel[name=ContractGrid]').getStore().on({
                    'load': function () {
                        view.getEl().unmask();
                    }
                });
                if (notReloadMo)
                    view.down('gridpanel[name=ContractGrid]').getStore().load();
                else view.down('b4selectfield[name=MoList]').clearValue();
                view.down('gridpanel[name=ManagementOrganizationGrid]').getStore().load();
            }).error(function (response) {

                view.getEl().unmask();
                Ext.Msg.alert('Ошибка!', !Ext.isString(response.message) ? 'При выполнении операции произошла ошибка!' : response.message);
            });
        });

    },
    //------------------------------------------------
    //Групповые операции над списком домов
    //------------------------------------------------

    //Домовые ЕПД
    onOpenHouseFactura: function (menuItem) {
        var me = this;

        me.isHouses = true; //операция по домам
        me.onOpenPersonalAccountFactura(menuItem);
    },

    //Домовые недопоставки
    onOpenGroupHouseBackorder: function (menuItem) {
        var me = this;

        me.isHouses = true; //операция по домам
        me.onOpenGroupPersonalAccountBackorder(menuItem);
    },

    //Домовые услуги
    onOpenHouseServices: function (menuItem) {
        var me = this;

        me.isHouses = true; //операция по домам
        me.onOpenPersonalAccountServices(menuItem);
    },

    //Квартирные характеристики
    onOpenHouseGroupHouseRoomCharacteristics: function (menuItem) {
        var me = this;

        me.isHouses = true; //операция по домам
        me.onOpenPersonalAccountGroupHouseRoomCharacteristics(menuItem);
    },

    //Домовые параметры
    onOpenHouseGroupHouseRoomParams: function (menuItem) {
        var me = this;

        me.isHouseParams = true; //домовые параметры
        me.isHouses = true; //операция по домам
        me.onOpenPersonalAccountGroupHouseRoomCharacteristics(menuItem);
    },

    onOpenHouseChangeManagementOrganization: function (menuItem) {
        var me = this,
            mainView = me.controller.getMainView(),
            selectedPersonalAccounts = me.controller.getContextValue(mainView, me.selectedRecords);

        if (selectedPersonalAccounts.length == 0) {
            B4.QuickMsg.msg(
                'Внимание',
                'Для проведения групповой операции необходимо выбрать дома',
                'warning'
            );
            return;
        }

        //список банков данных
        var dataBanksList = [];
        var dataBanksId = [];

        if (me.multiBank) {

            var dataBanksStore = mainView.down('combobox[name=cmbDataBank]').getStore();
            Ext.each(selectedPersonalAccounts, function (item) {
                var bankName = dataBanksStore.findRecord('Id', item.dataBankId, 0, false, true, true).get('Name');
                if (!Ext.Array.contains(dataBanksList, bankName)) {
                    //получаем название                 
                    dataBanksList.push(bankName);
                    dataBanksId.push(item.dataBankId);
                }
            });

        }
        else {
            dataBankId = me.controller.getContextValue(mainView, 'dataBankId');
            dataBanksList = 'указанный дом';
            dataBanksId.push(dataBankId);
        }

        var view = Ext.widget(me.dataChangeManagementOrganizationWindowSelector, {
            renderTo: mainView.getEl(),
            dataBankNamesList: dataBanksList,
            countPersonalAccount: selectedPersonalAccounts.length,
            nameAspect: me.nameAspect,
            isHouses: me.isHouses,
            selectedPersonalAccountList: selectedPersonalAccounts,
            application: me.controller.application
        });

        //me.onDataSetFilter(view, dataBanksId);
        view.show();
    },
    viewGroupOper: undefined,

    onOpenGroupHouse: function (menuItem) {
        var me = this,
            mainView = me.controller.getMainView(),
            selectedPersonalAccounts = me.controller.getContextValue(mainView, me.selectedRecords);

        if (selectedPersonalAccounts.length == 0) {
            B4.QuickMsg.msg(
                'Внимание',
                'Для проведения групповой операции необходимо выбрать дома',
                'warning'
            );
            return;
        }

        //список банков данных
        var dataBanksList = [];
        var dataBanksId = [];

        if (me.multiBank) {

            var dataBanksStore = mainView.down('combobox[name=cmbDataBank]').getStore();
            Ext.each(selectedPersonalAccounts, function (item) {
                var bankName = dataBanksStore.findRecord('Id', item.dataBankId, 0, false, true, true).get('Name');
                if (!Ext.Array.contains(dataBanksList, bankName)) {
                    //получаем название                 
                    dataBanksList.push(bankName);
                    dataBanksId.push(item.dataBankId);
                }
            });

        }
        else {
            dataBankId = me.controller.getContextValue(mainView, 'dataBankId');
            dataBanksList = 'указанный дом';
            dataBanksId.push(dataBankId);
        }

        var view = Ext.widget(me.housegroupGroupOper, {
            renderTo: mainView.getEl(),
            dataBankNamesList: dataBanksList,
            countPersonalAccount: selectedPersonalAccounts.length,
            nameAspect: me.nameAspect,
            isHouses: me.isHouses
        });
        me.viewGroupOper = view;
        //me.onDataSetFilter(view, dataBanksId);
        view.show();
    },
    //Выбор Групповые операции - Реквизиты дома
    onOpenGroupHouseData: function (menuItem) {

        var me = this,
            mainView = me.controller.getMainView(),
            selectedPersonalAccounts = me.controller.getContextValue(mainView, me.selectedRecords);

        if (selectedPersonalAccounts.length == 0) {
            B4.QuickMsg.msg(
                'Внимание',
                'Для проведения групповой операции необходимо выбрать дома',
                'warning'
            );
            return;
        }

        //список банков данных
        var dataBanksList = [];
        var dataBanksId = [];

        if (me.multiBank) {

            var dataBanksStore = mainView.down('combobox[name=cmbDataBank]').getStore();
            Ext.each(selectedPersonalAccounts, function (item) {
                var bankName = dataBanksStore.findRecord('Id', item.dataBankId, 0, false, true, true).get('Name');
                if (!Ext.Array.contains(dataBanksList, bankName)) {
                    //получаем название                 
                    dataBanksList.push(bankName);
                    dataBanksId.push(item.dataBankId);
                }
            });

        }
        else {
            dataBankId = me.controller.getContextValue(mainView, 'dataBankId');
            dataBanksList = 'указанный дом';
            dataBanksId.push(dataBankId);
        }

        var view = Ext.widget(me.dataWindowSelector, {
            renderTo: mainView.getEl(),
            dataBankNamesList: dataBanksList,
            countPersonalAccount: selectedPersonalAccounts.length,
            nameAspect: me.nameAspect,
            isHouses: me.isHouses
        });

        //me.onDataSetFilter(view, dataBanksId);
        view.show();
    },


    //установить фильтры на store по bankId
    onDataSetFilter: function (view, dataBanksId) {

        var me = this,
            selectfields = view.down('b4selectfield');

        Ext.each(selectfields, function (item) {

            var store1 = item.getStore();
            store1.on('beforeload', function (store, operation) {

                operation.params = operation.params || {};
                operation.params.dataBanksId = Ext.encode(dataBanksId);

            }, me);
        });
    },

    generateAverageConsumption: function (view, kind) {
        var me = this,
            mainView = me.controller.getMainView(),
            houseList = me.controller.getContextValue(mainView, me.selectedRecords),
            generateWindow;

        //Если есть право на генерацию средних без учета отопительных периодов
        B4.Ajax.request({
            url: B4.Url.action('/Operator/CheckHasPermission'),
            params: {
                permission: 'Kp60.HouseRegister.GroupOper.AvgGen.DisableHeatingPeriods'
            }
        }).next(function (resp) {
            var response = Ext.decode(resp.responseText);

            if (response.result) {
                generateWindow = Ext.create('B4.form.register.house.groupoperation.GenerateAvgCounterConsumption',
                    {
                        houses: houseList,
                        kind: kind,
                        showDisablePeriodsCheckbox: true
                    });
            }
            else {
                generateWindow = Ext.create('B4.form.register.house.groupoperation.GenerateAvgCounterConsumption',
                    {
                        houses: houseList,
                        kind: kind,
                        showDisablePeriodsCheckbox: false
                    });
            }
            if (houseList.length == 0) {
                B4.QuickMsg.msg(
                    'Внимание',
                    'Для проведения расчета среднего необходимо выбрать список домов',
                    'warning'
                );
                return;
            }
            generateWindow.show();
        });
    },

    //Выполнить групповую операцию Генерация средних расходов ИПУ
    generateAverageConsumptionIPU: function () {
        var me = this,
            mainView = me.controller.getMainView(),
            personalAccountList = me.controller.getContextValue(mainView, me.selectedRecords);

        var generateWindow = Ext.create('B4.form.register.personalaccount.groupoperation.GenerateAvgCounterConsumption',
            {
                personalAccount: personalAccountList
            });

        if (personalAccountList.length == 0) {
            B4.QuickMsg.msg(
                'Внимание',
                'Для проведения расчета среднего необходимо выбрать список лицевых счетов!',
                'warning'
            );
            return;
        }

        generateWindow.show();
    },

    //Выполнить групповую операцию Генерация средних расходов ИПУ/ОКПУ по 354
    generateAverageConsumptionIPUBy354: function () {
        var me = this,
            mainView = me.controller.getMainView(),
            personalAccountList = me.controller.getContextValue(mainView, me.selectedRecords);

        var generateWindow = Ext.create('B4.form.register.personalaccount.groupoperation.GenerateAvgAccountCounterConsumptionBy354',
            {
                personalAccount: personalAccountList
            });

        if (personalAccountList.length == 0) {
            B4.QuickMsg.msg(
                'Внимание',
                'Для проведения расчета среднего необходимо выбрать список лицевых счетов!',
                'warning'
            );
            return;
        }

        generateWindow.show();
    },

    //Выполнить групповую операцию Генерация средних расходов ИПУ/ОКПУ по 354 для перерасчетных месяцев
    generateAverageConsumptionIPUBy354ForRecalcPeriods: function () {
        var me = this,
            mainView = me.controller.getMainView(),
            personalAccountList = me.controller.getContextValue(mainView, me.selectedRecords);

        var generateWindow = Ext.create('B4.form.register.personalaccount.groupoperation.GenerateAvgAccountCounterConsumptionBy354ForRecalcPeriods',
            {
                personalAccount: personalAccountList
            });

        if (personalAccountList.length == 0) {
            B4.QuickMsg.msg(
                'Внимание',
                'Для проведения расчета среднего необходимо выбрать список лицевых счетов!',
                'warning'
            );
            return;
        }

        generateWindow.show();
    },

    //Выполнить групповую операцию добавления реквизитов дома
    onSaveGroupHouseData: function (button) {

        var me = this,
            mainView = me.controller.getMainView(),
            view = button.up('window'),
            selectedPersonalAccounts = me.controller.getContextValue(mainView, me.selectedRecords),
            moId = view.down('b4selectfield[name=MoList]').getValue(),
            hdId = view.down('b4selectfield[name=HdList]').getValue(),
            notice = view.down('textareafield[name=Notice]').getValue(),
            noticeDel = view.down('checkbox[name=cbNoticeDel]').getValue(),
            coId = view.down('b4selectfield[name=CoList]').getValue(),
            quId = view.down('b4selectfield[name=QuList]').getValue();

        if (moId > 0 || hdId > 0 || coId > 0 || quId > 0 || !Ext.isEmpty(notice) || noticeDel == true) {
        } else {
            B4.QuickMsg.msg(
                'Внимание',
                'Не указаны данные!',
                'warning'
            );

            return;
        }

        Ext.Msg.confirm('Реквизиты дома', 'Изменить реквизиты?',
            function (result) {
                if (result == 'yes') {

                    view.getEl().mask('Сохранение данных...');

                    B4.Ajax.request({
                        url: 'House/GroupChangeData',
                        params: {
                            houseList: Ext.encode(selectedPersonalAccounts),
                            moId: moId,
                            hdId: hdId,
                            coId: coId,
                            quId: quId,
                            notice: notice,
                            noticeDel: noticeDel
                        },
                        timeout: 9999999

                    }).next(function (jsonResp) {
                        var response = Ext.decode(jsonResp.responseText);

                        B4.QuickMsg.msg(
                            response.success ? 'Выполнено' : 'Внимание',
                            response.success ? 'Групповая операция успешно завершена!' : response.message,
                            response.success ? 'success' : 'warning',
                            10000
                        );

                        view.getEl().unmask();

                        if ('getStore' in mainView) {
                            mainView.getStore().reload();
                        } else {
                            mainView.down('gridpanel').getStore().reload();
                        }

                        view.close();

                    }).error(function (response) {

                        view.getEl().unmask();
                        Ext.Msg.alert('Ошибка!', !Ext.isString(response.message) ? 'При выполнении операции произошла ошибка!' : response.message);
                    });
                }
            }, me);
    },







    //------------------------------------------------
    //Групповые операции над списком лс
    //------------------------------------------------

    //Квартирные недопоставки
    onOpenGroupPersonalAccountBackorder: function (menuItem) {

        var me = this;

        var mainView = me.controller.getMainView(),
            selectedPersonalAccounts = me.controller.getContextValue(mainView, me.selectedRecords),
            dataBankId,
            msg = me.isHouses ? 'Для проведения групповой операции необходимо выбрать дома' : 'Для проведения групповой операции необходимо выбрать лицевые счета',
            msg2 = me.isHouses ? 'Для проведения групповой операции необходимо выбрать дома из одного банка данных' : 'Для проведения групповой операции необходимо выбрать лицевые счета из одного банка данных';

        if (selectedPersonalAccounts.length == 0) {
            B4.QuickMsg.msg('Внимание', msg, 'warning');
            return;
        }

        //список банков данных
        var dataBanksList = [];

        if (me.multiBank) {

            var dataBanksStore = mainView.down('combobox[name=cmbDataBank]').getStore();
            Ext.each(selectedPersonalAccounts, function (item) {
                var bankName = dataBanksStore.findRecord('Id', item.dataBankId, 0, false, true, true).get('Name');
                if (!Ext.Array.contains(dataBanksList, bankName)) {
                    //получаем название                 
                    dataBanksList.push(bankName);
                }
            });

            //Проверка на соответствие всем ЛС одному банку данных
            dataBankId = selectedPersonalAccounts[0].dataBankId;
            Ext.each(selectedPersonalAccounts, function (item) {
                if (item.dataBankId != dataBankId) {
                    B4.QuickMsg.msg('Внимание', msg2, 'warning');
                    return;
                }
            });

        } else {

            dataBankId = me.controller.getContextValue(mainView, 'dataBankId');
            dataBanksList = 'указанный дом';

        }

        var view = Ext.widget(me.backorderWindowSelector, {
            renderTo: mainView.getEl(),
            dataBankNamesList: dataBanksList,
            countPersonalAccount: selectedPersonalAccounts.length,
            dataBankId: dataBankId,
            isHouses: me.isHouses,
            nameAspect: me.nameAspect
        });

        var model = me.controller.getModel('register.personalaccount.backorder.BackOrder');
        var rec = new model({ Id: 0 });
        view.loadRecord(rec);

        //выбор услуг
        var serviceCombo = view.down('b4combobox[name=ServiceId]');
        serviceCombo.on({
            focus: function (combobox) {
                combobox.flagChange = true;
            },
            change: function (combobox) {

                //Перезагружаем стор с типами недопоставки только, если услуга была изменена пользователем
                if (combobox.flagChange) {
                    me.reloadTypeStore(combobox);
                }
            }
        });
        var serviceStore = serviceCombo.getStore();
        serviceStore.load({
            params: {
                dataBankId: dataBankId,
                groupId: -900 //Загрузка только "недпоставочных" услуг
            }
        });

        //выбор типов
        var typeCombo = view.down('b4combobox[name=TypeId]');
        typeCombo.on({
            focus: function (combobox) {
                combobox.flagChange = true;
            },
            change: function (combobox) {
                //делаем обязательным поле % от типа недопоставки

                var selectedRecord = combobox.findRecordByValue(combobox.getValue());
                var servCombobox = combobox.up('window').down('b4combobox[name=ServiceId]');
                var selectedServ = servCombobox.findRecordByValue(servCombobox.getValue());

                if (combobox.flagChange && selectedRecord) {
                    var fi = combobox.up('window').down('numberfield[name=WidthdrawalPercentage]');
                    fi.allowBlank = true;

                    if ((selectedRecord.get('Id') >= 2000) //проценты
                        ||
                        (selectedServ.get('Id') == 8 || selectedServ.get('Id') == 9) && (selectedRecord.raw.IsParam == 1) //Температуры
                    ) {
                        //обязательное поле процент/температура
                        //fi.allowBlank = false;
                        fi.show();
                        fi.setFieldLabel(selectedRecord.get('Id') >= 2000 ? "Процент снятия" : "Температура");
                    } else {
                        fi.hide();
                    }

                    //fi.setVisible(!fi.allowBlank);
                    fi.setValue(null);
                    fi.validate();
                }
            }
        });

        var typeStore = typeCombo.getStore();
        typeStore.getProxy().setExtraParam('dataBankId', dataBankId);
        typeStore.load();


        view.getForm().isValid();
        view.show();
    },

    //Перезагрузка комбобокса с типами недопоставки
    reloadTypeStore: function (combobox) {
        var typeCombobox = combobox.up('window').down('b4combobox[name=TypeId]'),
            serviceId = combobox.getValue();

        typeCombobox.setValue('');
        typeCombobox.getStore().getProxy().setExtraParam('serviceId', serviceId);
        typeCombobox.getStore().load();

        var fi = combobox.up('window').down('numberfield[name=WidthdrawalPercentage]');
        fi.setVisible(false);
        fi.setValue(null);
        fi.validate();
    },

    //Выполнить групповую операцию добавления недопоставки
    onSaveGroupPersonalAccountBackorder: function (button) {

        var me = this,
            mainView = me.controller.getMainView(),
            view = button.up('window'),
            selectedPersonalAccounts = me.controller.getContextValue(mainView, me.selectedRecords);

        if (!view.getForm().isValid()) {
            //получаем все поля формы
            var fields = view.getForm().getFields();

            var invalidFields = '';

            //проверяем, если поле не валидно, то записиваем fieldLabel в строку инвалидных полей
            Ext.each(fields.items, function (field) {
                if (!field.isValid()) {
                    invalidFields += '<br>' + field.fieldLabel;
                }
            });

            //выводим сообщение
            Ext.Msg.alert('Ошибка выполнения!', 'Не заполнены обязательные поля: ' + invalidFields);
            return;
        }

        view.getForm().updateRecord();
        var record = view.getRecord().getData();

        if (record.DateFrom > record.DateTo) {
            B4.QuickMsg.msg(
                'Внимание',
                'Дата окончания должна быть позже даты начала',
                'warning'
            );
            return;
        }

        Ext.Msg.confirm('Добавление!', 'Добавить недопоставку ?',
            function (result) {
                if (result == 'yes') {

                    view.getEl().mask('Сохранение недопоставки...');

                    B4.Ajax.request({
                        url: 'ShortDelivery/GroupOperation',
                        params: {
                            personalAccounts: Ext.encode(selectedPersonalAccounts),
                            dataBankId: view.dataBankId,
                            record: Ext.encode(record),
                            add: true,
                            isHouses: view.isHouses //передаем список лс или список домов!
                        },
                        timeout: 9999999
                    }).next(function (jsonResp) {
                        var response = Ext.decode(jsonResp.responseText);

                        B4.QuickMsg.msg(
                            response.success ? 'Выполнено' : 'Внимание',
                            response.success ? 'Групповая операция успешно завершена!' : response.message,
                            response.success ? 'success' : 'warning',
                            10000
                        );

                        view.getEl().unmask();
                        view.close();

                    }).error(function (response) {

                        view.getEl().unmask();
                        Ext.Msg.alert('Ошибка!', !Ext.isString(response.message) ? 'При выполнении операции произошла ошибка!' : response.message);
                    });
                }
            }, me);
    },

    //Выполнить групповую операцию удаления недопоставки
    onDeleteGroupPersonalAccountBackorder: function (button) {

        var me = this,
            mainView = me.controller.getMainView(),
            view = button.up('window'),
            selectedPersonalAccounts = me.controller.getContextValue(mainView, me.selectedRecords);


        if (!view.getForm().isValid()) {
            //получаем все поля формы
            var fields = view.getForm().getFields();

            var invalidFields = '';

            //проверяем, если поле не валидно, то записиваем fieldLabel в строку инвалидных полей
            Ext.each(fields.items, function (field) {
                if (!field.isValid()) {
                    invalidFields += '<br>' + field.fieldLabel;
                }
            });

            //выводим сообщение
            Ext.Msg.alert('Ошибка выполнения!', 'Не заполнены обязательные поля: ' + invalidFields);
            return;
        }

        view.getForm().updateRecord();
        var record = view.getRecord().getData();

        if (record.DateFrom > record.DateTo) {
            B4.QuickMsg.msg(
                'Внимание',
                'Дата окончания должна быть позже даты начала',
                'warning'
            );
            return;
        }

        Ext.Msg.confirm('Удаление!', 'Удалить недопоставку ?',
            function (result) {
                if (result == 'yes') {

                    view.getEl().mask('Удаление недопоставки...');

                    B4.Ajax.request({
                        url: 'ShortDelivery/GroupOperation',
                        params: {
                            personalAccounts: Ext.encode(selectedPersonalAccounts),
                            dataBankId: view.dataBankId,
                            record: Ext.encode(record),
                            add: false,
                            isHouses: view.isHouses //передаем список лс или список домов!
                        },
                        timeout: 9999999
                    }).next(function (jsonResp) {
                        var response = Ext.decode(jsonResp.responseText);

                        B4.QuickMsg.msg(
                            response.success ? 'Выполнено' : 'Внимание',
                            response.success ? 'Групповая операция успешно завершена!' : response.message,
                            response.success ? 'success' : 'warning',
                            10000
                        );

                        view.getEl().unmask();
                        view.close();

                    }).error(function (response) {

                        view.getEl().unmask();
                        Ext.Msg.alert('Ошибка!', !Ext.isString(response.message) ? 'При выполнении операции произошла ошибка!' : response.message);
                    });
                }
            }, me);
    },


    //Выбор Групповые операции - Реквизиты лицевого счета
    onOpenGroupPersonalAccountData: function (menuItem) {

        var me = this,
            mainView = me.controller.getMainView(),
            selectedPersonalAccounts = me.controller.getContextValue(mainView, me.selectedRecords);

        if (selectedPersonalAccounts.length == 0) {
            B4.QuickMsg.msg(
                'Внимание',
                'Для проведения групповой операции необходимо выбрать лицевые счета',
                'warning'
            );
            return;
        }

        //список банков данных
        var dataBanksList = [];

        if (me.multiBank) {

            var dataBanksStore = mainView.down('combobox[name=cmbDataBank]').getStore();
            Ext.each(selectedPersonalAccounts, function (item) {
                var bankName = dataBanksStore.findRecord('Id', item.dataBankId, 0, false, true, true).get('Name');
                if (!Ext.Array.contains(dataBanksList, bankName)) {
                    //получаем название                 
                    dataBanksList.push(bankName);
                }
            });

        }
        else {
            dataBankId = me.controller.getContextValue(mainView, 'dataBankId');
            dataBanksList = 'указанный дом';
        }

        Ext.widget(me.dataWindowSelector, {
            renderTo: mainView.getEl(),
            dataBankNamesList: dataBanksList,
            countPersonalAccount: selectedPersonalAccounts.length,
            nameAspect: me.nameAspect,
            isHouses: me.isHouses
        }).show();
    },


    //Выполнить групповую операцию добавления реквизитов
    onSaveGroupPersonalAccountData: function (button) {

        var me = this,
            mainView = me.controller.getMainView(),
            view = button.up('window'),
            selectedPersonalAccounts = me.controller.getContextValue(mainView, me.selectedRecords),
            moId = view.down('b4selectfield[name=MoList]').getValue(),
            hdId = view.down('b4selectfield[name=HdList]').getValue(),
            districtId = view.down('numberfield[name=District]').getValue(),
            porch = view.down('b4combobox[name=Porch]').getValue();

        if (moId > 0 || hdId > 0 || districtId > 0 || porch > 0) {
        } else {
            B4.QuickMsg.msg(
                'Внимание',
                'Не указаны данные!',
                'warning'
            );
            return;
        }

        Ext.Msg.confirm('Реквизиты лицевого счета!', 'Изменить реквизиты?',
            function (result) {
                if (result == 'yes') {
                    // Проверка на некорректное значение подъезда
                    if (porch && !isNaN(porch)) {
                        if (isNaN(porch) || porch.toString().indexOf('.') != -1 ||
                            porch > 32767 || porch == 0 || porch < -1) {
                            B4.QuickMsg.warning('Подъезд введён некорректно');
                            return;
                        }
                    }

                    view.getEl().mask('Сохранение данных...');

                    B4.Ajax.request({
                        url: 'PersonalAccount/GroupChangeData',
                        params: {
                            personalAccountList: Ext.encode(selectedPersonalAccounts),
                            moId: moId,
                            hdId: hdId,
                            districtId: districtId,
                            porch: porch
                        },
                        timeout: 9999999
                    }).next(function (jsonResp) {
                        var response = Ext.decode(jsonResp.responseText);

                        B4.QuickMsg.msg(
                            response.success ? 'Выполнено' : 'Внимание',
                            response.success ? 'Групповая операция успешно завершена!' : response.message,
                            response.success ? 'success' : 'warning',
                            10000
                        );

                        view.getEl().unmask();

                        if ('getStore' in mainView) {
                            mainView.getStore().reload();
                        } else {
                            mainView.down('gridpanel').getStore().reload();
                        }

                        view.close();

                    }).error(function (response) {

                        view.getEl().unmask();
                        Ext.Msg.alert('Ошибка!', !Ext.isString(response.message) ? 'При выполнении операции произошла ошибка!' : response.message);
                    });
                }
            }, me);
    },



    //Групповая операция - перечень услуг установка
    onOpenPersonalAccountServices: function () {
        var me = this,
            mainView = me.controller.getMainView(),
            selectedPersonalAccounts = me.controller.getContextValue(mainView, me.selectedRecords),
            dataBanksList,
            dataBankId,
            msg = me.isHouses ? 'Для проведения групповой операции необходимо выбрать дома' : 'Для проведения групповой операции необходимо выбрать лицевые счета',
            msg2 = me.isHouses ? 'Для проведения групповой операции необходимо выбрать дома из одного банка данных' : 'Для проведения групповой операции необходимо выбрать лицевые счета из одного банка данных';

        if (selectedPersonalAccounts.length == 0) {
            B4.QuickMsg.msg('Внимание', msg, 'warning');
            return;
        }

        if (me.multiBank) {

            var combo = mainView.down('combobox[name=cmbDataBank]'),
                store = combo.getStore(),
                dataBanks = combo.getValue();

            if (!dataBanks || dataBanks.length !== 1) {
                B4.QuickMsg.msg(
                    'Внимание',
                    'Для проведения групповой операции необходимо выбрать один банк данных',
                    'warning'
                );
                return;
            }

            dataBankId = selectedPersonalAccounts[0].dataBankId;
            Ext.each(selectedPersonalAccounts, function (item) {
                if (item.dataBankId != dataBankId) {
                    B4.QuickMsg.msg('Внимание', msg2, 'warning');
                    return;
                }
            });

            var val = store.getById(dataBanks[0]);
            dataBankId = val.getId();
            dataBanksList = val.get('Name');

        } else {

            dataBankId = me.controller.getContextValue(mainView, 'dataBankId');
            dataBanksList = 'Выбранный дом';
        }

        var win = Ext.widget(me.servicesWindowSelector, {
            renderTo: mainView.getEl(),
            countPersonalAccount: selectedPersonalAccounts.length,
            dataBankNamesList: dataBanksList,
            dataBankId: dataBankId,
            isHouses: me.isHouses,
            nameAspect: me.nameAspect
        });

        win.show();
    },

    //отобразить список услуг
    onPersonalAccountServicesRender: function (win) {
        var store = win.down('grid').getStore();

        store.load({
            url: 'Service/GetServicesForGroupOperation',
            params: {
                dataBankId: win.dataBankId
            }
        });
    },

    onGroupServiceRowAction: function (grid, action, record) {
        var me = this;

        if (action === 'delete') {
            me.groupDeleteService(grid, record);
        }
    },

    //Групповая операция - перечень услуг удаление
    groupDeleteService: function (grid, record) {

        var me = this,
            mainView = me.controller.getMainView(),
            win = grid.up('window'),
            dataBankId = win.dataBank ? win.dataBank.getId() : win.dataBankId,
            selectedPersonalAccounts = me.controller.getContextValue(mainView, me.selectedRecords),
            personalAccountsId = [];

        if (!record.get('DateBegin')) {
            B4.QuickMsg.msg(
                'Внимание',
                'Выберите дату начала действия услуги',
                'warning'
            );
            return;
        }

        for (var i in selectedPersonalAccounts) {
            personalAccountsId.push(selectedPersonalAccounts[i].id);
        }

        var f = function () {
            win.setLoading('Выполнение групповой операции...');
            B4.Ajax.request({
                url: 'Service/GroupOperationDelete',
                params: {
                    personalAccounts: personalAccountsId,
                    dataBankId: dataBankId,
                    record: Ext.encode(record.data),
                    oneActualSupp: win.down('checkbox[name=OneActualSupp]').getValue(),
                    isHouses: win.isHouses //передаем список лс или список домов!
                },
                timeout: 9999999
            }).next(function (jsonResp) {
                var response = Ext.decode(jsonResp.responseText);
                B4.QuickMsg.msg(
                    response.success ? 'Выполнено' : 'Внимание',
                    response.success ? 'Групповая операция успешно завершена' : response.message,
                    response.success ? 'success' : 'warning',
                    10000
                );

                //record.reject();
                //win.setLoading(false);
                win.close();

            }).error(function (response) {

                win.setLoading(false);
                Ext.Msg.alert('Ошибка!', !Ext.isString(response.message) ? 'При выполнении операции произошла ошибка!' : response.message);
            });
        };

        Ext.Msg.confirm('Удаление записи!',
            'Удалить все периоды оказания услуги ' + record.get('Name') +
            ' с ' + Ext.Date.format(record.get('DateBegin'), 'd.m.Y') +
            (record.get('DateEnd') ? ' по ' + Ext.Date.format(record.get('DateEnd'), 'd.m.Y') : '') +
            (record.get('SupplierName') ? ' у которых назначен договор "' + record.get('SupplierName') + '"' : '') +
            (record.get('FormulaName') ? ' и формула расчета "' + record.get('FormulaName') + '"' : '') + '?',
            function (result) {
                if (result == 'yes') {
                    f();
                }
            }, me);
    },

    //Групповая операция - перечень услуг save
    groupServiceSave: function (button) {
        var me = this,
            mainView = me.controller.getMainView(),
            win = button.up('window'),
            dataBankId = win.dataBank ? win.dataBank.getId() : win.dataBankId,
            store = win.down('grid').getStore(),
            records = store.getUpdatedRecords(),
            selectedPersonalAccounts = me.controller.getContextValue(mainView, me.selectedRecords),
            personalAccountsId = [],
            recordsData = [],
            i;

        if (!records || records.length === 0) {
            return;
        }

        for (i in selectedPersonalAccounts) {
            personalAccountsId.push(selectedPersonalAccounts[i].id);
        }

        for (i in records) {
            var record = records[i];
            if (!me.checkRecordForGroupOperation(record)) return;
            recordsData.push(record.data);
        }

        if (recordsData.length == 0)
            return;

        var f = function () {
            win.setLoading('Выполнение групповой операции...');
            B4.Ajax.request({
                url: 'Service/GroupOperationSave',
                params: {
                    personalAccounts: personalAccountsId,
                    dataBankId: dataBankId,
                    records: Ext.encode(recordsData),
                    oneActualSupp: win.down('checkbox[name=OneActualSupp]').getValue(),
                    isHouses: win.isHouses //передаем список лс или список домов!
                },
                timeout: 9999999
            }).next(function (jsonResp) {
                var response = Ext.decode(jsonResp.responseText);
                B4.QuickMsg.msg(
                    response.success ? 'Выполнено' : 'Внимание',
                    response.success ? 'Групповая операция успешно завершена!' : response.message,
                    response.success ? 'success' : 'warning',
                    10000
                );

                //store.rejectChanges();
                //win.setLoading(false);
                win.close();

            }).error(function (response) {

                win.setLoading(false);
                Ext.Msg.alert('Ошибка!', !Ext.isString(response.message) ? 'При выполнении операции произошла ошибка!' : response.message);
            });
        };

        Ext.Msg.confirm('Сохранение услуг!', 'Сохранить выбранные значения услуг?',
            function (result) {
                if (result == 'yes') {
                    f();
                }
            }, me);
    },

    //Групповая операция - перечень услуг проверка
    checkRecordForGroupOperation: function (record) {
        if (!record.get('DateBegin')) {
            B4.QuickMsg.msg(
                'Внимание',
                'Выберите дату начала действия для услуги "' + record.get('Name') + '"!',
                'warning'
            );
            return false;
        }

        if (record.get('DateEnd') && record.get('DateEnd') < record.get('DateBegin')) {
            B4.QuickMsg.msg(
                'Внимание',
                'Выберите дату окончания действия услуги "' + record.get('Name') + '" не раньше даты начала!',
                'warning'
            );
            return false;
        }

        if (!record.get('SupplierId')) {
            B4.QuickMsg.msg(
                'Внимание',
                'Выберите договор для услуги "' + record.get('Name') + '"!',
                'warning'
            );
            return false;
        }

        if (!record.get('FormulaId')) {
            B4.QuickMsg.msg(
                'Внимание',
                'Выберите формулу для услуги "' + record.get('Name') + '"!',
                'warning'
            );
            return false;
        }

        return true;
    },



    //Групповая операция - группы
    onOpenPersonalAccountGroup: function (menuItem) {
        var me = this,
            mainView = me.controller.getMainView(),
            selectedPersonalAccounts = me.controller.getContextValue(mainView, me.selectedRecords),
            dataBanksList,
            dataBankId;

        if (selectedPersonalAccounts.length == 0) {
            B4.QuickMsg.msg(
                'Внимание',
                'Для проведения групповой операции необходимо выбрать записи',
                'warning'
            );
            return;
        }

        //Проверка на соответствие всем ЛС одному банку данных
        if (me.multiBank) {
            var combo = mainView.down('combobox[name=cmbDataBank]'),
                store = combo.getStore(),
                dataBanks = combo.getValue();

            if (!dataBanks || dataBanks.length !== 1) {
                B4.QuickMsg.msg(
                    'Внимание',
                    'Для проведения групповой операции необходимо выбрать один банк данных',
                    'warning'
                );
                return;
            }

            dataBankId = selectedPersonalAccounts[0].dataBankId;
            Ext.each(selectedPersonalAccounts, function (item) {
                if (item.dataBankId != dataBankId) {
                    B4.QuickMsg.msg(
                        'Внимание',
                        'Для проведения групповой операции необходимо выбрать лицевые счета из одного банка данных',
                        'warning'
                    );
                    return;
                }
            });

            var val = store.getById(dataBanks[0]);
            dataBankId = val.getId();
            dataBanksList = val.get('Name');

        } else {
            dataBankId = me.controller.getContextValue(mainView, 'dataBankId');
            dataBanksList = 'Выбранный дом';
        }

        Ext.widget(me.groupWindowSelector, {
            renderTo: mainView.getEl(),
            countPersonalAccount: selectedPersonalAccounts.length,
            dataBankNamesList: dataBanksList,
            dataBankId: dataBankId,
            nameAspect: me.nameAspect,
            isHouses: me.isHouses
        }).show();
    },

    //Групповая операция - загрузка списка групп
    onLoadGroupList: function (view) {

        var mainStore = view.down('gridpanel').getStore(),
            dataBankId = view.dataBankId;

        //Установка идентификатора банка при загрузке грида
        mainStore.on({
            beforeload: function () {
                mainStore.getProxy().setExtraParam('dataBankId', dataBankId);
            }
        });
        mainStore.load();
    },

    //Включить в группу
    includeInGroup: function (button) {
        this.groupOperation(button.up('window'), 'PersonalAccountGroup/IncludeInGroup');
    },

    addNewGroup: function (button) {
        var win = Ext.create('B4.view.register.personalaccount.general.GeneralAddGroupWindow', {
            MainWindow: button.up('window')
        });
        win.show();

        win.down('b4savebutton').on({
            click: function () {
                var groupName = win.down('textfield[name=GroupName]').getValue();

                var record = {
                    Name: groupName
                };
                if (groupName.length < 1 || groupName.length > 80) {
                    B4.QuickMsg.msg(
                        'Внимание',
                        'Длина названия группы должна быть от 1 до 80 символов',
                        'warning'
                    );
                    return;
                }

                B4.Ajax.request({
                    url: 'PersonalAccountGroup/Create',
                    method: 'POST',
                    params: {
                        records: Ext.encode([record])
                    }
                }).next(function (jsonResp) {
                    var response = Ext.decode(jsonResp.responseText);
                    B4.QuickMsg.msg(
                        response.success ? 'Выполнено' : 'Внимание',
                        response.success ? "Новая группа успешно добавлена" : response.resultMessage,
                        response.success ? 'success' : 'warning'
                    );
                    win.MainWindow.down('gridpanel').store.load();
                    win.close();
                });
            }
        });
        win.down('b4closebutton').on({
            click: function () {
                win.close();
            }
        });
    },

    //Исключить из группы
    excludeFromGroup: function (button) {
        this.groupOperation(button.up('window'), 'PersonalAccountGroup/ExcludeFromGroup');
    },

    //Групповая операция - группы exec
    groupOperation: function (view, url) {
        var me = this,
            selectedRecords = view.down('gridpanel').getSelectionModel().getSelection(),
            mainView = me.controller.getMainView(),
            dataBankId = view.dataBankId,
            selectedPersonalAccounts = me.controller.getContextValue(mainView, me.selectedRecords),
            groupList = [];

        Ext.each(selectedRecords, function (item) {
            groupList.push(item.get('Id'));
        });

        view.getEl().mask('Операция выполняется ...');
        
        var f = function () {

            B4.Ajax.request({
                url: url,
                method: 'POST',
                params: {
                    dataBankId: dataBankId,
                    personalAccountList: Ext.encode(selectedPersonalAccounts),
                    groupList: Ext.encode(groupList),
                    isHouses: me.isHouses
                },
                timeout: 9999999
            }).next(function (jsonResp) {
                view.getEl().unmask();
                var response = Ext.decode(jsonResp.responseText);
                B4.QuickMsg.msg(
                    response.success ? 'Выполнено' : 'Внимание',
                    response.resultMessage,
                    response.success ? 'success' : 'warning'
                );

                view.close();

            }).error(function (response) {
                view.getEl().unmask();
                Ext.Msg.alert('Ошибка!', !Ext.isString(response.message) ? 'При выполнении операции произошла ошибка!' : response.message);
            });
        };

        Ext.Msg.confirm('Сохранение групп!', 'Сохранить значения группы?',
            function (result) {
                if (result == 'yes') {
                    f();
                }
                else {
                    view.getEl().unmask();
                }
            }, me);

    },

    //Групповое изменение ПУ
    onOpenGroupCountersVals: function (menuItem) {
        var me = this,
            mainView = me.controller.getMainView(),
            selectedPersonalAccounts = me.controller.getContextValue(mainView, me.selectedRecords),
            dataBankId,
            msg = me.isHouses ? 'Для проведения групповой операции необходимо выбрать дома' : 'Для проведения групповой операции необходимо выбрать лицевые счета';

        if (!selectedPersonalAccounts || selectedPersonalAccounts.length === 0) {
            B4.QuickMsg.msg('Внимание', msg, 'warning');
            return;
        }

        var dataBanksList = [];

        if (me.multiBank) {
            var dataBanksStore = mainView.down('combobox[name=cmbDataBank]').getStore();
            Ext.each(selectedPersonalAccounts, function (item) {
                var bankName = dataBanksStore.findRecord('Id', item.dataBankId, 0, false, true, true).get('Name');
                if (!Ext.Array.contains(dataBanksList, bankName)) {
                    //получаем название                 
                    dataBanksList.push(bankName);
                }
            });
            var exit;
            //Проверка на соответствие всем ЛС одному банку данных
            dataBankId = selectedPersonalAccounts[0].dataBankId;
            Ext.each(selectedPersonalAccounts, function (item) {
                if (item.dataBankId != dataBankId) {
                    exit = true;
                    return;
                }
            });
            if (exit) {
                B4.QuickMsg.msg(
                    'Внимание',
                    'Для проведения групповой операции необходимо выбрать записи из одного банка данных',
                    'warning'
                );
                return;
            }
        } else {
            dataBankId = me.controller.getContextValue(mainView, 'dataBankId');
            dataBanksList = 'указанный дом';
        }

        me.controller.application.redirectTo('groupoperation/countervalues/' + (me.isHouses ? 'houses' : (me.nameAspect == 'groupOperAspectName2' ? 'houseaccounts' : 'accounts')));

        //var view = Ext.widget(me.groupCountersValsSelector, {
        //	countPersonalAccount: selectedPersonalAccounts.length,
        //	personalAccounts: selectedPersonalAccounts,
        //	dataBankId: dataBankId,
        //	isHouses: me.isHouses
        //});

        //if (me.isHouseParams == true) {
        //	var st = view.down('[xtype=parameterlist]').getStore();
        //	st.getProxy().setExtraParam('isHouseParams', true);
        //}

        //view.show();
    },

    //Выбор Групповые операции - характеристики жилья
    onOpenPersonalAccountGroupHouseRoomCharacteristics: function (menuItem) {
        var me = this,
            mainView = me.controller.getMainView(),
            selectedPersonalAccounts = me.controller.getContextValue(mainView, me.selectedRecords),
            dataBankId,
            msg = me.isHouses ? 'Для проведения групповой операции необходимо выбрать дома' : 'Для проведения групповой операции необходимо выбрать лицевые счета';


        if (selectedPersonalAccounts.length == 0) {
            B4.QuickMsg.msg('Внимание', msg, 'warning');
            return;
        }

        var dataBanksList = [];

        if (me.multiBank) {

            var dataBanksStore = mainView.down('combobox[name=cmbDataBank]').getStore();
            Ext.each(selectedPersonalAccounts, function (item) {
                var bankName = dataBanksStore.findRecord('Id', item.dataBankId, 0, false, true, true).get('Name');
                if (!Ext.Array.contains(dataBanksList, bankName)) {
                    //получаем название                 
                    dataBanksList.push(bankName);
                }
            });
            var exit;
            //Проверка на соответствие всем ЛС одному банку данных
            dataBankId = selectedPersonalAccounts[0].dataBankId;
            Ext.each(selectedPersonalAccounts, function (item) {
                if (item.dataBankId != dataBankId) {
                    exit = true;
                    return;
                }
            });
            if (exit) {
                B4.QuickMsg.msg(
                    'Внимание',
                    'Для проведения групповой операции необходимо выбрать записи из одного банка данных',
                    'warning'
                );
                return;
            }
        } else {
            dataBankId = me.controller.getContextValue(mainView, 'dataBankId');
            dataBanksList = 'указанный дом';
        }

        B4.Ajax.request({
            url: 'Parameter/GetIsNewNormParam'
        }).next(function (response) {
            var ret = false;
            if (Ext.decode(response.responseText)) ret = Ext.decode(response.responseText).data;

            var view = Ext.widget(me.houseroomWindowSelector, {
                renderTo: mainView.getEl(),
                dataBankNamesList: dataBanksList,
                countPersonalAccount: selectedPersonalAccounts.length,
                dataBankId: dataBankId,
                isHouses: me.isHouses,
                isHideSpravNormTable: !ret,
                isHouseParams: me.isHouseParams,
                nameAspect: me.nameAspect
            });

            var st = view.down('[xtype=parameterlist]').getStore();
            st.getProxy().setExtraParam('dataBankId', dataBankId);
            if (me.isHouseParams == true) {
                st.getProxy().setExtraParam('isHouseParams', true);
            }

            view.show();
            me.onChangeSize(750, 1000, mainView, view);
        }).error(function () {
            Ext.Msg.alert('Ошибка!', 'Ошибка при выполнении операции');
        });
    },

    //Групповая операция - сохранение параметров ЛС
    onGroupHouseRoomCharacteristicsSave: function (button) {
        var me = this,
            view = button.up('window'),
            mainView = me.controller.getMainView(),
            selectedPersonalAccounts = me.controller.getContextValue(mainView, me.selectedRecords);

        //формирование параметров
        var parameterList = [];
        var parameterIds = []; //для проверки параметров курьера
        var parameterRecords = view.down('parameterlist').getStore().getUpdatedRecords();

        Ext.each(parameterRecords, function (item) {

            if (!me.checkPrmForGroupOperation(item)) return;

            var parameter = {
                parameterId: item.get('Id'),
                value: item.get('ParameterTypeNative') == 'date'
                    ? Ext.Date.format(new Date(item.get('NewValue')), 'd.m.Y')
                    : item.get('NewValue'),
                parameterTableNumber: item.get('TableNumber'),
                dateBegin: item.get('DateBegin'),
                dateEnd: item.get('DateEnd'),
                parameterKind: item.get('ParameterKind')
            };
            parameterList.push(parameter);
            parameterIds.push(parameter.parameterId);
        });

        if (parameterList.length == 0)
            return;

        //Если выбираем на редактирование параметр, связанный с курьером, то должны редактировать только его
        if (parameterList.length > 1 && [9153, 9154, 9155, 1007].some(x => parameterIds.includes(x))) {
            B4.QuickMsg.msg(
                'Внимание',
                'Выставление одновременно нескольких параметров при работе с курьером не предусмотрено.',
                'warning',
                10000
            );
            return;
        }

        var f = function () {

            view.getEl().mask('Сохранение параметров...');
            B4.Ajax.request({
                params: {
                    personalAccountList: Ext.encode(selectedPersonalAccounts),
                    parameterList: Ext.encode(parameterList),
                    isHouses: view.isHouses, //передаем список лс или список домов!
                    isHouseParams: view.isHouseParams
                },
                url: 'PersonalAccount/SaveGroupParameters',
                method: 'POST',
                timeout: 9999999
            }).next(function (jsonResp) {

                view.getEl().unmask();
                var response = Ext.decode(jsonResp.responseText);
                if (response.data != undefined) {
                    B4.QuickMsg.msg(
                        response.data.Success ? 'Выполнено' : 'Внимание',
                        Ext.isString(response.data.Message) ? response.data.Message : '',
                        response.data.Success ? 'success' : 'warning',
                        10000
                    );
                }
                else {
                    B4.QuickMsg.msg(
                        response.success ? 'Выполнено' : 'Внимание',
                        Ext.isString(response.message) ? response.message : '',
                        response.success ? 'success' : 'warning',
                        10000
                    );
                }

                if (response.data != undefined || (response.data == undefined && response.success)) {
                    button.up('window').down('parameterlist').getStore().reload();
                    view.close();
                }

            }).error(function (response) {

                view.getEl().unmask();
                Ext.Msg.alert('Ошибка!', !Ext.isString(response.message) ? 'При выполнении групповой опреации произошла ошибка!' : response.message);
            });
        };

        Ext.Msg.confirm('Сохранение параметров!', 'Сохранить значения параметров?',
            function (result) {
                if (result == 'yes') {
                    f();
                }
            }, me);

    },

    //Групповая операция с параметрами счетчиков
    onOpenGroupCountersCharesteristic: function (menuItem) {

        var me = this,
            mainView = me.controller.getMainView(),
            selectedPersonalAccounts = me.controller.getContextValue(mainView, me.selectedRecords),
            dataBankId,
            msg = me.isHouses ? 'Для проведения групповой операции необходимо выбрать дома' : 'Для проведения групповой операции необходимо выбрать лицевые счета';


        if (selectedPersonalAccounts.length == 0) {
            B4.QuickMsg.msg('Внимание', msg, 'warning');
            return;
        }

        var dataBanksList = [];

        if (me.multiBank) {
            var dataBanksStore = mainView.down('combobox[name=cmbDataBank]').getStore();
            Ext.each(selectedPersonalAccounts, function (item) {
                var bankName = dataBanksStore.findRecord('Id', item.dataBankId, 0, false, true, true).get('Name');
                if (!Ext.Array.contains(dataBanksList, bankName)) {
                    //получаем название                 
                    dataBanksList.push(bankName);
                }
            });
            var exit;
            //Проверка на соответствие всем ЛС одному банку данных
            dataBankId = selectedPersonalAccounts[0].dataBankId;
            Ext.each(selectedPersonalAccounts, function (item) {
                if (item.dataBankId != dataBankId) {
                    exit = true;
                    return;
                }
            });
            if (exit) {
                B4.QuickMsg.msg(
                    'Внимание',
                    'Для проведения групповой операции необходимо выбрать записи из одного банка данных',
                    'warning'
                );
                return;
            }
        } else {

            dataBankId = me.controller.getContextValue(mainView, 'dataBankId');
            dataBanksList = 'указанный дом';

        }

        var view = Ext.widget(me.groupCountersCharesteristic, {
            renderTo: mainView.getEl(),
            dataBankNamesList: dataBanksList,
            countPersonalAccount: selectedPersonalAccounts.length,
            selectedPersonalAccounts: selectedPersonalAccounts,
            dataBankId: dataBankId,
            isHouses: me.isHouses,
            isHouseParams: me.isHouseParams,
            nameAspect: me.nameAspect
        });

        view.show();
        me.onChangeSize(650, 1180, mainView, view);

    },
    onChangeSize: function (height, width, mainView, view) {

        var heightMainView = mainView.getHeight();
        if (heightMainView < height) {
            var heightView = parseInt(heightMainView) - 20;
            view.setHeight(heightView);
            view.getEl().setStyle('height', heightView + 'px');
            view.center();
        }

        var widthMainView = mainView.getWidth();
        if (widthMainView < width) {
            var widthView = parseInt(widthMainView) - 10;
            view.setWidth(widthView);
            view.getEl().setStyle('width', widthView + 'px');
            view.center();
        }
    },
    //Выбор Групповые операции - характеристики жилья
    onOpenPersonalAccountGroupHouseCharacteristics: function (menuItem) {
        var me = this,
            mainView = this.controller.getMainView(),
            dataBankCombo = mainView.down('combobox[name=cmbDataBank]'),
            selectedPersonalAccounts = this.controller.getContextValue(mainView, me.selectedRecords),
            dataBankId;

        if (selectedPersonalAccounts.length == 0) {
            B4.QuickMsg.msg(
                'Внимание',
                'Для проведения групповой операции необходимо выбрать лицевые счета',
                'warning'
            );
            return;
        }

        if (me.multiBank) {
            if (dataBankCombo.getValue().length > 1) {
                B4.QuickMsg.msg(
                    'Внимание',
                    'Для проведения групповой операции выберите один банк данных',
                    'warning'
                );
                return;
            }
            dataBankId = dataBankCombo.getValue()[0];
        } else {
            dataBankId = me.controller.getContextValue(mainView, 'dataBankId');
        }

        B4.Ajax.request({
            url: 'Parameter/GetIsNewNormParam'
        }).next(function (response) {
            var ret = false;
            if (Ext.decode(response.responseText)) ret = Ext.decode(response.responseText).data;

            B4.Ajax.request({
                url: B4.Url.action('/Operator/CheckHasPermission'),
                params: {
                    permission: 'Kp60.HouseRegister.GroupOper.ShowComplexColumnInGroupHouseCharacteristics'
                }
            }).next(function (resp) {
                var responseP = Ext.decode(resp.responseText);

                var view = Ext.widget(me.houseParamsWindowSelector, {
                    renderTo: mainView.getEl(),
                    isHouses: me.isHouses,
                    showComplex: responseP.result,
                    isHouseParams: me.isHouseParams,
                    isHideSpravNormTable: !ret,
                    nameAspect: me.nameAspect,
                    dataBankId: dataBankId,
                    selectedPersonalAccounts: selectedPersonalAccounts
                }).show();

                me.onChangeSize(650, 1180, mainView, view);                
            });  
        }).error(function () {

            Ext.Msg.alert('Ошибка!', 'Ошибка при выполнении операции');
        });


    },

    //Выбор Групповые операции с параметрами платежных кодов
    onOpenPersonalAccountGroupPaymentCodesParameters: function (menuItem) {
        var me = this,
            mainView = this.controller.getMainView(),
            dataBankCombo = mainView.down('combobox[name=cmbDataBank]'),
            selectedPersonalAccounts = this.controller.getContextValue(mainView, me.selectedRecords),
            dataBankId;

        if (selectedPersonalAccounts.length == 0) {
            B4.QuickMsg.msg(
                'Внимание',
                'Для проведения групповой операции необходимо выбрать лицевые счета',
                'warning'
            );
            return;
        }

        if (me.multiBank) {
            if (dataBankCombo.getValue().length > 1) {
                B4.QuickMsg.msg(
                    'Внимание',
                    'Для проведения групповой операции выберите один банк данных',
                    'warning'
                );
                return;
            }
            dataBankId = dataBankCombo.getValue()[0];
        } else {
            dataBankId = me.controller.getContextValue(mainView, 'dataBankId');
        }

        //получить наименование банка данных
        var dataBanksStore = mainView.down('combobox[name=cmbDataBank]').getStore();
        var bankName = dataBanksStore.findRecord('Id', dataBankId, 0, false, true, true).get('Name');

        var view = Ext.widget(me.paymentCodesParametersSelector, {
            renderTo: mainView.getEl(),
            nameAspect: me.nameAspect,
            dataBankId: dataBankId,
            bankName: bankName,
            selectedPersonalAccounts: selectedPersonalAccounts,
            countPersonalAccount: selectedPersonalAccounts.length
        }).show();
        me.onChangeSize(650, 1180, mainView, view);
    },

    //Групповая операция - удаление характеристики жилья
    onGroupHouseRoomCharacteristicsDelete: function (grid, action, record) {
        //только удаление 
        if (action != 'delete') {
            return;
        }

        var me = this,
            view = grid.up('window'),
            mainView = me.controller.getMainView(),
            selectedPersonalAccounts = me.controller.getContextValue(mainView, me.selectedRecords);

        //формирование параметров
        var parameterList = [];
        var parameter = {
            parameterId: record.get('Id'),
            parameterTableNumber: record.get('TableNumber'),
            dateBegin: record.get('DateBegin'),
            dateEnd: record.get('DateEnd'),
            parameterKind: record.get('ParameterKind')
        };
        parameterList.push(parameter);

        if (parameterList.length == 0)
            return;

        var f = function () {

            view.getEl().mask('Сохранение параметров...');
            B4.Ajax.request({
                params: {
                    personalAccountList: Ext.encode(selectedPersonalAccounts),
                    parameterList: Ext.encode(parameterList),
                    isHouses: view.isHouses, //передаем список лс или список домов!
                    isHouseParams: view.isHouseParams
                },
                url: 'PersonalAccount/DeleteGroupParameters',
                method: 'POST',
                timeout: 9999999
            }).next(function (jsonResp) {

                view.getEl().unmask();
                
                var response = Ext.decode(jsonResp.responseText);
                if (response.data != undefined) {
                    B4.QuickMsg.msg(
                        response.data.Success ? 'Выполнено' : 'Внимание',
                        Ext.isString(response.data.Message) ? response.data.Message : '',
                        response.data.Success ? 'success' : 'warning',
                        10000
                    );
                }
                else {
                    B4.QuickMsg.msg(
                        response.success ? 'Выполнено' : 'Внимание',
                        Ext.isString(response.message) ? response.message : '',
                        response.success ? 'success' : 'warning',
                        10000
                    );
                }

                if (response.data != undefined || (response.data == undefined && response.success)) {
                    grid.getStore().reload();
                    view.close();
                }

            }).error(function (response) {

                view.getEl().unmask();
                Ext.Msg.alert('Ошибка!', !Ext.isString(response.message) ? 'При выполнении групповой опреации произошла ошибка!' : response.message);
            });
        };

        Ext.Msg.confirm('Удаление параметров!', 'Удалить значения параметров?',
            function (result) {
                if (result == 'yes') {
                    f();
                }
            }, me);

    },

    //Групповая операция - перечень параметров проверка
    checkPrmForGroupOperation: function (record) {
        if (!record.get('DateBegin')) {
            B4.QuickMsg.msg(
                'Внимание',
                'Выберите дату начала действия для параметра "' + record.get('ParameterName') + '"!',
                'warning'
            );
            return false;
        }

        if (record.get('DateEnd') && record.get('DateEnd') < record.get('DateBegin')) {
            B4.QuickMsg.msg(
                'Внимание',
                'Выберите дату окончания действия параметра "' + record.get('ParameterName') + '" не раньше даты начала!',
                'warning'
            );
            return false;
        }

        if (record.get('NewValue') == undefined) {
            B4.QuickMsg.msg(
                'Внимание',
                'Выберите значение для параметра "' + record.get('ParameterName') + '"!',
                'warning'
            );
            return false;
        }

        return true;
    },

    onOpenPersonalAccountPeniService: function (menuItem) {
        var me = this,
            mainView = me.controller.getMainView(),
            selectedPersonalAccounts = me.controller.getContextValue(mainView, me.selectedRecords), dataBankId;
        if (selectedPersonalAccounts.length == 0) {
            B4.QuickMsg.msg(
                'Внимание',
                'Для проведения групповой операции необходимо выбрать лицевые счета',
                'warning'
            );
            return;
        }

        //список банков данных
        var dataBanksList = [];

        if (me.multiBank) {

            var dataBanksStore = mainView.down('combobox[name=cmbDataBank]').getStore();
            Ext.each(selectedPersonalAccounts, function (item) {
                var bankName = dataBanksStore.findRecord('Id', item.dataBankId, 0, false, true, true).get('Name');
                if (!Ext.Array.contains(dataBanksList, bankName)) {
                    //получаем название                 
                    dataBanksList.push(bankName);
                }
            });

        }
        else {
            dataBankId = me.controller.getContextValue(mainView, 'dataBankId');
            dataBanksList = 'указанный дом';
        }

        if (!dataBankId && dataBanksList.length > 1) {
            B4.QuickMsg.msg(
                'Внимание',
                'Для проведения групповой операции выберите один банк данных',
                'warning'
            );
            return;
        }

        Ext.widget(me.peniServiceWindowSelector, {
            renderTo: mainView.getEl(),
            dataBankNamesList: dataBanksList,
            countPersonalAccount: selectedPersonalAccounts.length,
            nameAspect: me.nameAspect,
            isHouses: me.isHouses
        }).show();
    },

    onOpenTariffOperation: function (menuItem) {
        var me = this,
            mainView = me.controller.getMainView(),
            selectedPersonalAccounts = me.controller.getContextValue(mainView, me.selectedRecords),
            dataBanksList = mainView.down('combobox[name=cmbDataBank]').getValue();

        if (selectedPersonalAccounts.length == 0) {
            B4.QuickMsg.msg(
                'Внимание',
                'Для проведения групповой операции необходимо выбрать лицевые счета',
                'warning'
            );
            return;
        }

        var window = Ext.widget('tariffgroupoperation', {
            renderTo: mainView.getEl(),
            dataBankNamesList: dataBanksList,
            selectedPersonalAccountList: selectedPersonalAccounts,
            parentView: mainView,
            isHouses: me.isHouses
        }).show();
        window.fireEvent('windowcreated', me, window);
    },

    //Групповое изменение сальдо 
    onOpenSaldoEdit: function (menuItem) {
        var me = this,
            dataBankId,
            mainView = me.controller.getMainView(),
            selectedPersonalAccounts = me.controller.getContextValue(mainView, me.selectedRecords),
            dataBanksList = mainView.down('combobox[name=cmbDataBank]').getValue();

        if (selectedPersonalAccounts.length == 0) {
            B4.QuickMsg.msg(
                'Внимание',
                'Для проведения групповой операции необходимо выбрать лицевые счета',
                'warning'
            );
            return;
        }

        if (dataBanksList.length > 1) {
            B4.QuickMsg.msg(
                'Внимание',
                'Для проведения групповой операции выберите один банк данных',
                'warning'
            );
            return;
        }

        Ext.widget('saldoeditgroup', {
            renderTo: mainView.getEl(),
            dataBankId: dataBanksList[0],
            selectedPersonalAccountList: selectedPersonalAccounts,
            parentView: mainView,
            isHouses: me.isHouses
        }).show();
    },

    //Групповой перенос сальдо
    onOpenTransferSaldoWindow: function (menuItem) {
        var me = this,
            dataBankId,
            mainView = me.controller.getMainView(),
            selectedPersonalAccounts = me.controller.getContextValue(mainView, me.selectedRecords),
            dataBanksList = mainView.down('combobox[name=cmbDataBank]').getValue();

        if (selectedPersonalAccounts.length == 0) {
            B4.QuickMsg.msg(
                'Внимание',
                'Для проведения групповой операции необходимо выбрать дома',
                'warning'
            );
            return;
        }

        if (dataBanksList.length > 1) {
            B4.QuickMsg.msg(
                'Внимание',
                'Для проведения групповой операции выберите один банк данных',
                'warning'
            );
            return;
        }

        Ext.widget('transfersaldogroupoperation', {
            renderTo: mainView.getEl(),
            dataBankId: dataBanksList[0],
            selectedPersonalAccountList: selectedPersonalAccounts,
            parentView: mainView,
            isHouses: me.isHouses
        }).show();
    },

    //Выбор Групповые операции - Формирование ЕПД
    onOpenPersonalAccountFactura: function () {
        var me = this,
            mainView = me.controller.getMainView(),
            selectedPersonalAccounts = me.controller.getContextValue(mainView, me.selectedRecords);

        if (selectedPersonalAccounts.length == 0) {
            B4.QuickMsg.msg(
                'Внимание',
                'Для проведения групповой операции необходимо выбрать записи',
                'warning'
            );
            return;
        }

        //список банков данных
        var dataBanksList = [];

        if (me.multiBank) {
            if (me.multiBank && mainView.down('combobox[name=cmbDataBank]').getValue().length > 1) {
                B4.QuickMsg.msg(
                    'Внимание',
                    'Для проведения групповой операции выберите один банк данных',
                    'warning'
                );
                return;
            }
            dataBanksList.push(mainView.down('combobox[name=cmbDataBank]').rawValue);
        }
        else {
            dataBanksList = 'указанный дом';
        }

        var win = Ext.widget(me.facturaWindowSelector, {
            renderTo: mainView.getEl(),
            dataBankNamesList: dataBanksList,
            countPersonalAccount: selectedPersonalAccounts.length,
            nameAspect: me.nameAspect,
            isHouses: me.isHouses
        });

        win.show();
        win.center();
    },
    
    //Выполнить групповую операцию печати
    onSavePersonalAccountFactura: function (button) {
        var me = this,
            mainView = me.controller.getMainView(),
            view = button.up('window'),
            selectedPersonalAccounts = me.controller.getContextValue(mainView, me.selectedRecords),
            invoiceList = view.down('b4combobox[name=InvoiceList]').getValue(),
            countListInPack = view.down('numberfield[name=CountListInPack]').getValue(),
            fileType = view.down('combobox[name=FileType]').getValue(),
            periodS = view.down('b4calcmonthpicker[name=MonthS]').getValue(),
            periodP = view.down('b4calcmonthpicker[name=MonthP]').getValue(),
            isNotPrintZero = view.down('checkbox[name=isNotPrintZero]').getValue(),
            saveFileName = view.down('textfield[name=SaveFileName]').getValue();

        if (!invoiceList || !countListInPack || !fileType) {
            B4.QuickMsg.msg(
                'Внимание',
                'Не указаны данные!',
                'warning'
            );

            return;
        }

        Ext.Msg.confirm('Формирование ЕПД', 'Сформировать платежные документы?',
            function (result) {
                if (result == 'yes') {
                    view.getEl().mask('Формирование...');
                    //Если выбран конкретный получатель, то просто вызываем метод формирования ЕПД
                    B4.Ajax.request({
                        url: 'PersonalAccount/PrintFactura',
                        params: {
                            personalAccountList: Ext.encode(selectedPersonalAccounts),
                            periodS: periodS,
                            periodP: periodP,
                            invoice: invoiceList,
                            count: countListInPack,
                            file: fileType,
                            GroupingFilesKinds: Ext.encode(view.down('combobox[name=GroupingFilesKinds]').getValue()),
                            isNotPrintZero: isNotPrintZero,
                            isHouses: view.isHouses, //передаем список лс или список домов!
                            saveFileName: saveFileName,
                            IsOpenLs: view.down('checkbox[name=IsOpenLs]').getValue()
                        },
                        timeout: 9999999
                    }).next(function (jsonResp) {
                        var response = Ext.decode(jsonResp.responseText);

                        B4.QuickMsg.msg(
                            response.success ? 'Выполнено' : 'Внимание',
                            response.success ? 'Сформированный файл можно скачать в "Моих файлах"' : response.message,
                            response.success ? 'success' : 'warning',
                            10000
                        );

                        view.getEl().unmask();
                        view.close();
                    }).error(function (response) {

                        view.getEl().unmask();
                        Ext.Msg.alert('Ошибка!', !Ext.isString(response.message) ? 'При выполнении операции произошла ошибка!' : response.message);
                    });
                }
            }, me);
    },

    //Выполнить групповую операцию добавления реквизитов
    onSaveGroupPeniService: function (button) {
        var me = this,
            mainView = me.controller.getMainView(),
            view = button.up('window'),
            selectedPersonalAccounts = me.controller.getContextValue(mainView, me.selectedRecords),
            SupplierId = view.down('b4selectfield[name=SupplierList]').getValue(),
            FormulaId = view.down('b4selectfield[name=FormulaList]').getValue(),
            DateBegin = view.down('datefield[name=DateBegin]').getValue(),
            DateEnd = view.down('datefield[name=DateEnd]').getValue(),
            LegalEntityId = view.down('b4selectfield[name=PaymentList]').getValue();

        if (SupplierId <= 0 || FormulaId <= 0 || DateBegin == null) {
            B4.QuickMsg.msg(
                'Внимание',
                'Не указаны данные!',
                'warning'
            );
            return;
        }

        if (DateEnd != null && DateBegin > DateEnd) {
            B4.QuickMsg.msg(
                'Внимание',
                'Дата начала периода действия не долэна быть больше Даты окончания!',
                'warning'
            );
            return;
        }

        Ext.Msg.confirm('Настройка услуги пени', 'Сохранить услугу?',
            function (result) {
                if (result == 'yes') {

                    view.getEl().mask('Сохранение данных...');

                    B4.Ajax.request({
                        url: 'PersonalAccount/GroupPeniServiceSetting',
                        params: {
                            personalAccountList: Ext.encode(selectedPersonalAccounts),
                            SupplierId: SupplierId,
                            FormulaId: FormulaId,
                            LegalEntityId: LegalEntityId,
                            DateBegin: DateBegin,
                            DateEnd: DateEnd
                        },
                        timeout: 9999999
                    }).next(function (jsonResp) {
                        var response = Ext.decode(jsonResp.responseText);

                        B4.QuickMsg.msg(
                            response.success ? 'Выполнено' : 'Внимание',
                            response.success ? 'Групповая операция успешно завершена!' : response.message,
                            response.success ? 'success' : 'warning',
                            10000
                        );

                        view.getEl().unmask();

                        if ('getStore' in mainView) {
                            mainView.getStore().reload();
                        } else {
                            mainView.down('gridpanel').getStore().reload();
                        }

                        view.close();

                    }).error(function (response) {

                        view.getEl().unmask();
                        Ext.Msg.alert('Ошибка!', !Ext.isString(response.message) ? 'При выполнении операции произошла ошибка!' : response.message);
                    });
                }
            }, me);
    },

    onOpenManagementOrganizationScope: function (menuItem) {
        var me = this,
            mainView = me.controller.getMainView(),
            selectedPersonalAccounts = me.controller.getContextValue(mainView, me.selectedRecords);

        if (selectedPersonalAccounts.length == 0) {
            B4.QuickMsg.msg(
                'Внимание',
                'Для проведения групповой операции необходимо выбрать дома',
                'warning'
            );
            return;
        }

        //список банков данных
        var dataBanksList = [];
        var dataBanksId = [];

        if (me.multiBank) {

            var dataBanksStore = mainView.down('combobox[name=cmbDataBank]').getStore();
            Ext.each(selectedPersonalAccounts, function (item) {
                var bankName = dataBanksStore.findRecord('Id', item.dataBankId, 0, false, true, true).get('Name');
                if (!Ext.Array.contains(dataBanksList, bankName)) {
                    //получаем название                 
                    dataBanksList.push(bankName);
                    dataBanksId.push(item.dataBankId);
                }
            });

        }
        else {
            dataBankId = me.controller.getContextValue(mainView, 'dataBankId');
            dataBanksList = 'указанный дом';
            dataBanksId.push(dataBankId);
        }

        var view = Ext.widget(me.managementOrganizationScopeSelector, {
            renderTo: mainView.getEl(),
            dataBankNamesList: dataBanksList,
            countPersonalAccount: selectedPersonalAccounts.length,
            selectedPersonalAccountList: selectedPersonalAccounts,
            nameAspect: me.nameAspect,
            isHouses: me.isHouses
        });
        me.viewGroupOper = view;
        //me.onDataSetFilter(view, dataBanksId);
        view.show();
    },

    onOpenBoilerGroupOper: function (menuItem) {
        var me = this,
            mainView = me.controller.getMainView(),
            selectedHouses = me.controller.getContextValue(mainView, me.selectedRecords),
            dataBankList = mainView.down('combobox[name=cmbDataBank]').getValue(),
            dataBanksStore = mainView.down('combobox[name=cmbDataBank]').getStore(),
            dataBank;

        if (selectedHouses.length == 0) {
            B4.QuickMsg.msg(
                'Внимание',
                'Для проведения групповой операции необходимо выбрать дома',
                'warning'
            );
            return;
        }

        if (!dataBankList.length || dataBankList.length > 1) {
            B4.QuickMsg.msg(
                'Внимание',
                'Для проведения групповой операции необходимо выбрать один банк данных',
                'warning'
            );
            return;
        }

        dataBank = dataBanksStore.getRange().find(function (item) {
            return item.getId() == dataBankList[0];
        });

        var view = Ext.widget(me.boilerGroupOperSelector, {
            renderTo: mainView.getEl(),
            selectedHouses: selectedHouses,
            dataBank: dataBank
        });
        me.viewGroupOper = view;

        view.show();
    },

    onOpenEpdFormSettingGroupOper: function (menuItem) {
        var me = this,
            mainView = me.controller.getMainView(),
            selectedPersonalAccounts = me.controller.getContextValue(mainView, me.selectedRecords);

        if (selectedPersonalAccounts.length == 0) {
            B4.QuickMsg.msg(
                'Внимание',
                'Для проведения групповой операции необходимо выбрать дома',
                'warning'
            );
            return;
        }

        //список банков данных
        var dataBanksList = [];
        var dataBanksId = [];
        var selectedHouses = [];

        if (me.multiBank) {
            var dataBanksStore = mainView.down('combobox[name=cmbDataBank]').getStore();
            Ext.each(selectedPersonalAccounts, function (item) {
                var bankName = dataBanksStore.findRecord('Id', item.dataBankId, 0, false, true, true).get('Name');
                if (!Ext.Array.contains(dataBanksList, bankName)) {
                    //получаем название                 
                    dataBanksList.push(bankName);
                    dataBanksId.push(item.dataBankId);
                }
                var houseId = item.id;
                if (!Ext.Array.contains(selectedHouses, houseId)) {
                    selectedHouses.push(houseId);
                }
            });
        }
        else {
            dataBankId = me.controller.getContextValue(mainView, 'dataBankId');
            dataBanksList = 'указанный дом';
            dataBanksId.push(dataBankId);
            selectedHouses.push(me.controller.getContextValue(mainView, 'houseId'));
        }

        var view = Ext.widget(me.epdFormSettingGroupOperSelector, {
            renderTo: mainView.getEl(),
            dataBankNamesList: dataBanksList,
            dataBanksId: dataBanksId,
            selectedHousesId: selectedHouses,
            countPersonalAccount: selectedPersonalAccounts.length,
            nameAspect: me.nameAspect,
            isHouses: me.isHouses
        });

        view.show();
    },

    onOpenSignAllocation: function (menuItem) {
        var me = this,
            dataBankId,
            mainView = me.controller.getMainView(),
            selectedPersonalAccounts = me.controller.getContextValue(mainView, me.selectedRecords);

        if (selectedPersonalAccounts.length == 0) {
            B4.QuickMsg.msg(
                'Внимание',
                'Для проведения групповой операции необходимо выбрать лицевые счета',
                'warning'
            );
            return;
        }

        //список банков данных
        var dataBanksList = [];

        if (me.multiBank) {
            var dataBanksStore = mainView.down('combobox[name=cmbDataBank]').getStore();
            Ext.each(selectedPersonalAccounts, function (item) {
                var bankName = dataBanksStore.findRecord('Id', item.dataBankId, 0, false, true, true).get('Name');
                if (!Ext.Array.contains(dataBanksList, bankName)) {
                    //получаем название                 
                    dataBanksList.push(bankName);
                }
            });

        }
        else {
            dataBankId = me.controller.getContextValue(mainView, 'dataBankId');
            dataBanksList = 'указанный дом';
        }

        if (me.multiBank && dataBanksList.length > 1) {
            B4.QuickMsg.msg(
                'Внимание',
                'Для проведения групповой операции выберите один банк данных',
                'warning'
            );
            return;
        }

        var win = Ext.widget(me.signAllocationGroupOperSelector, {
            renderTo: mainView.getEl(),
            dataBankNamesList: dataBanksList,
            countPersonalAccount: selectedPersonalAccounts.length,
            selectedPersonalAccountList: selectedPersonalAccounts,
            nameAspect: me.nameAspect,
            isHouses: me.isHouses
        });

        win.show();
        win.center();
    },

    onOpenGeneratePersonalCounter: function (menuItem) {
        var me = this,
            mainView = me.controller.getMainView(),
            dataBankCombo = mainView.down('combobox[name=cmbDataBank]'),
            selectedPersonalAccounts = me.controller.getContextValue(mainView, me.selectedRecords);

        if (selectedPersonalAccounts.length == 0) {
            B4.QuickMsg.msg(
                'Внимание',
                'Для проведения групповой операции необходимо выбрать лицевые счета',
                'warning'
            );
            return;
        }

        if (dataBankCombo.getValue().length > 1) {
            B4.QuickMsg.msg(
                'Внимание',
                'Для проведения групповой операции выберите один банк данных',
                'warning'
            );
            return;
        }

        var bank = {
            id: dataBankCombo.getValue()[0],
            name: dataBankCombo.getStore().findRecord('Id', dataBankCombo.getValue()[0], 0, false, true, true).get('Name')
        };

        var win = Ext.widget(me.generatePersonalCounterGroupOperSelector, {
            renderTo: mainView.getEl(),
            dataBank: bank,
            countPersonalAccount: selectedPersonalAccounts.length,
            selectedPersonalAccountList: selectedPersonalAccounts,
            nameAspect: me.nameAspect,
            isHouses: me.isHouses
        });

        win.show();
        win.center();
    },
    //открытие окна "Смена адреса лицевых счетов "
    onOpenChangePersonalAccountsAddress: function (menuItem) {
        var me = this,
            mainView = me.controller.getMainView(),
            dataBankCombo = mainView.down('combobox[name=cmbDataBank]'),
            selectedPersonalAccounts = me.controller.getContextValue(mainView, me.selectedRecords);

        if (selectedPersonalAccounts.length === 0) {
            B4.QuickMsg.msg(
                'Внимание',
                'Для проведения групповой операции необходимо выбрать лицевые счета',
                'warning'
            );
            return;
        }

        if (dataBankCombo.getValue().length > 1) {
            B4.QuickMsg.msg(
                'Внимание',
                'Для проведения групповой операции выберите один банк данных',
                'warning'
            );
            return;
        }

        var bank = {
            id: dataBankCombo.getValue()[0],
            name: dataBankCombo.getStore().findRecord('Id', dataBankCombo.getValue()[0], 0, false, true, true).get('Name')
        };

        var win = Ext.widget(me.ChangePersonalAccountsAddressGroupOperSelector, {
            renderTo: mainView.getEl(),
            dataBank: bank,
            countPersonalAccount: selectedPersonalAccounts.length,
            selectedPersonalAccountList: selectedPersonalAccounts,
            nameAspect: me.nameAspect,
            isHouses: me.isHouses
        });

        win.show();
        win.center();
    },

    //открытие окна "Установить площади жилых/нежилых помещений"
    onOpenSetSquarePremise: function (menuItem) {
        var me = this,
            mainView = me.controller.getMainView(),
            selectedPersonalAccounts = me.controller.getContextValue(mainView, me.selectedRecords),
            dataBanksList = mainView.down('combobox[name=cmbDataBank]').getValue();

        if (selectedPersonalAccounts.length == 0) {
            B4.QuickMsg.msg(
                'Внимание',
                'Для проведения групповой операции необходимо выбрать дома',
                'warning'
            );
            return;
        }

        if (dataBanksList.length > 1) {
            B4.QuickMsg.msg(
                'Внимание',
                'Для проведения групповой операции выберите один банк данных',
                'warning'
            );
            return;
        }

        Ext.widget('setsquarepremisegroup', {
            renderTo: mainView.getEl(),
            dataBankId: dataBanksList[0],
            selectedPersonalAccountList: selectedPersonalAccounts,
            parentView: mainView,
            isHouses: me.isHouses
        }).show();
    },

    onOpenDisableRecalculation: function (menuItem) {
        var me = this,
            dataBankId,
            mainView = me.controller.getMainView(),
            selectedPersonalAccounts = me.controller.getContextValue(mainView, me.selectedRecords);

        if (selectedPersonalAccounts.length == 0) {
            B4.QuickMsg.msg(
                'Внимание',
                'Для проведения групповой операции необходимо выбрать лицевые счета',
                'warning'
            );
            return;
        }

        //список банков данных
        var dataBanksList = [];

        if (me.multiBank) {
            var dataBanksStore = mainView.down('combobox[name=cmbDataBank]').getStore();
            Ext.each(selectedPersonalAccounts, function (item) {
                var bankName = dataBanksStore.findRecord('Id', item.dataBankId, 0, false, true, true).get('Name');
                if (!Ext.Array.contains(dataBanksList, bankName)) {
                    //получаем название                 
                    dataBanksList.push(bankName);
                }
            });

        }
        else {
            dataBankId = me.controller.getContextValue(mainView, 'dataBankId');
            dataBanksList = 'указанный дом';
        }

        if (me.multiBank && dataBanksList.length > 1) {
            B4.QuickMsg.msg(
                'Внимание',
                'Для проведения групповой операции выберите один банк данных',
                'warning'
            );
            return;
        }

        var win = Ext.widget(me.disableRecalculationGroupOperSelector, {
            renderTo: mainView.getEl(),
            dataBankNamesList: dataBanksList,
            countPersonalAccount: selectedPersonalAccounts.length,
            selectedPersonalAccountList: selectedPersonalAccounts,
            nameAspect: me.nameAspect,
            isHouses: me.isHouses
        });

        var store = win.down('b4selectfield[name=Service]').getStore();

        store.on({
            beforeload: function (curStore, operation) {
                operation.params = operation.params || {};
                operation.params.ignoreItogo = true;
            }
        });
        store.load();

        win.show();
        win.center();
    },

    //открытие окна "Замена договоров ЖКУ"
    onOpenReplaceSupp: function (menuItem) {
        var me = this,
            mainView = me.controller.getMainView(),
            dataBankCombo = mainView.down('combobox[name=cmbDataBank]'),
            selectedPersonalAccounts = me.controller.getContextValue(mainView, me.selectedRecords);

        if (dataBankCombo.getValue().length > 1) {
            B4.QuickMsg.msg(
                'Внимание',
                'Для проведения групповой операции выберите один банк данных',
                'warning'
            );
            return;
        }

        var bank = {
            id: 0,
            name: 'Банк данных не выбран'
        };

        if (dataBankCombo.getValue().length > 0) {
            bank.id = dataBankCombo.getValue()[0];
            bank.name = dataBankCombo.getStore().findRecord('Id', dataBankCombo.getValue()[0], 0, false, true, true).get('Name');
        }

        var win = Ext.widget('replacesuppliergroup', {
            renderTo: mainView.getEl(),
            dataBank: bank,
            countPersonalAccount: selectedPersonalAccounts.length,
            selectedPersonalAccountList: selectedPersonalAccounts,
            nameAspect: me.nameAspect,
            isHouses: me.isHouses
        });

        win.show();
        win.center();
    },

    //открытие окна Установка собственников
    onOpenSetSobstwWindow: function () {
        var me = this,
            mainView = me.controller.getMainView(),
            dataBankCombo = mainView.down('combobox[name=cmbDataBank]'),
            selectedPersonalAccounts = me.controller.getContextValue(mainView, me.selectedRecords);

        if (dataBankCombo.getValue().length > 1) {
            B4.QuickMsg.msg(
                'Внимание',
                'Для проведения групповой операции выберите один банк данных',
                'warning'
            );
            return;
        }

        var bank = {
            id: 0,
            name: 'Банк данных не выбран'
        };

        if (dataBankCombo.getValue().length > 0) {
            bank.id = dataBankCombo.getValue()[0];
            bank.name = dataBankCombo.getStore().findRecord('Id', dataBankCombo.getValue()[0], 0, false, true, true).get('Name');
        }

        var win = Ext.widget('personalaccountgroupoperationsetsobstw', {
            renderTo: mainView.getEl(),
            dataBank: bank,
            countPersonalAccount: selectedPersonalAccounts.length,
            selectedPersonalAccountList: selectedPersonalAccounts,
            nameAspect: me.nameAspect,
            isHouses: me.isHouses
        });

        win.show();
        win.center();
    },

    // открытие окна - Определение исполнителей
    onOpenSetServiceProviderWindow: function () {
        var me = this,
            mainView = me.controller.getMainView(),
            selectedPersonalAccounts = me.controller.getContextValue(mainView, me.selectedRecords);
        
        if (selectedPersonalAccounts.length == 0) {
            B4.QuickMsg.msg(
                'Внимание',
                'Для проведения групповой операции необходимо выбрать записи',
                'warning'
            );
            return;
        }
        
        var win = Ext.widget(me.serviceprovidersWindowSelector, {
            renderTo: mainView.getEl(),
            countPersonalAccount: selectedPersonalAccounts.length,
            selectedPersonalAccountList: selectedPersonalAccounts,
            nameAspect: me.nameAspect
        }); 

        win.show();
        win.center();
    },
    
    //поставить задачу - Определение исполнителей
    onPerformGroupOperationServiceProvider : function(button){
        var me = this,
            mainView = me.controller.getMainView(),
            view = button.up('window'),
            selectedPersonalAccounts = me.controller.getContextValue(mainView, me.selectedRecords),
            date = view.down('b4calcmonthpicker[name=DateOfSet]').getValue();

        if (!date) {
            B4.QuickMsg.msg('Внимание', 'Не указан месяц за который нужно определить исполнителей', 'warning');
            return;
        }

        Ext.Msg.confirm('Определение исполнителей', 'Определить исполнителей для выбранных ЛС?',
            function (result) {
                if (result == 'yes') {
                    B4.Ajax.request({
                        url: 'PersonalAccount/SetServiceProviders',
                        params: {
                            personalAccounts: Ext.encode(selectedPersonalAccounts),
                            calcMonth: date,
                            overwriteServiceProviders: false
                        },
                        timeout: 9999999
                    }).next(function (jsonResp) {
                        var response = Ext.decode(jsonResp.responseText);

                        B4.QuickMsg.msg('Внимание', response.message, 10000);
                        view.close();
                    }).error(function (response) {
                        Ext.Msg.alert('Ошибка!', !Ext.isString(response.message) ? 'При выполнении операции произошла ошибка!' : response.message);
                    });
                }
            }, me);
    },

    //поставить задачу - Переопределение исполнителей по списку ЛС
    onPerformGroupOperationOverwriteServiceProvider : function(button){
        var me = this,
            mainView = me.controller.getMainView(),
            view = button.up('window'),
            selectedPersonalAccounts = me.controller.getContextValue(mainView, me.selectedRecords),
            date = view.down('b4calcmonthpicker[name=DateOfSet]').getValue();

        if (!date) {
            B4.QuickMsg.msg('Внимание', 'Не указан месяц за который нужно перезаписать исполнителей', 'warning');
            return;
        }

        Ext.Msg.confirm('Определение исполнителей', 'Перезаписать исполнителей для выбранных ЛС?',
            function (result) {
                if (result == 'yes') {
                    B4.Ajax.request({
                        url: 'PersonalAccount/SetServiceProviders',
                        params: {
                            personalAccounts: Ext.encode(selectedPersonalAccounts),
                            calcMonth: date,
                            overwriteServiceProviders: true
                        },
                        timeout: 9999999
                    }).next(function (jsonResp) {
                        var response = Ext.decode(jsonResp.responseText);
                        B4.QuickMsg.msg('Внимание', response.message, 10000);
                        view.close();
                    }).error(function (response) {
                        Ext.Msg.alert('Ошибка!', !Ext.isString(response.message) ? 'При выполнении операции произошла ошибка!' : response.message);
                    });
                }
            }, me); 
    },

    // делаем проверку при смене месяца: перезаписать исполнителей можно только в текущем расчетном месяце
    onChangeSelectedMonth: function(picker) {
        var view = picker.up('window');
        // получить выбранный месяц, за который нужно определить исполнителей
        var selectedMonth = picker.getValue();
        // кнопка "Перезаписать" исполнителей
        var overwriteButton = view.down('b4updatebutton[name=Overwrite]');
        // получить текущий расчетный месяц
        B4.Ajax.request({
            url: 'CalculationMonth/GetCalculationMonth',
            method: 'GET'
        }).next(function (jsonResp) {
            var data = Ext.decode(jsonResp.responseText).data;
            if (!data) return;
            var currentDate = new Date(data.CalculationMonth);

            // если выбрали месяц < расчетного, то скрываем кнопку для перезаписи исполнителей
            if(selectedMonth < currentDate){
                overwriteButton.hide();
            }
            else{
                overwriteButton.show();
            }
        }).error(function (response) {
            Ext.Msg.alert('Ошибка!', !Ext.isString(response.message) ? 'При получении текущего расчетного месяца произошла ошибка!' : response.message);
        });
    },
    
    //открытие окна слияние ЛС
    onOpenMergeLsWindow: function () {
        var me = this,
            mainView = me.controller.getMainView(),
            dataBankCombo = mainView.down('combobox[name=cmbDataBank]'),
            selectedPersonalAccounts = me.controller.getContextValue(mainView, me.selectedRecords);

        if (dataBankCombo.getValue().length > 1) {
            B4.QuickMsg.msg(
                'Внимание',
                'Для проведения групповой операции выберите один банк данных',
                'warning'
            );
            return;
        }

        if (selectedPersonalAccounts.length <= 1) {
            B4.QuickMsg.msg(
                'Внимание',
                'Для проведения групповой операции слияния необходимо выбрать не менее двух лицевых счета',
                'warning'
            );
            return;
        }

        var bank = {
            id: 0,
            name: 'Банк данных не выбран'
        };

        if (dataBankCombo.getValue().length > 0) {
            bank.id = dataBankCombo.getValue()[0];
            bank.name = dataBankCombo.getStore().findRecord('Id', dataBankCombo.getValue()[0], 0, false, true, true).get('Name');
        }

        B4.Ajax.request({
            url: B4.Url.action('/PersonalAccount/CheckAddressFromSelectedLs'),
            params: {
                selectedPersonalAccountList: Ext.encode(selectedPersonalAccounts)
            }
        }).next(function (jsonResp) {
            var response = Ext.decode(jsonResp.responseText);

            if (response.success) {
                if (response.message != null && response.message != "") {
                    Ext.Msg.confirm('Внимание', response.message + ' Вы действительно хотите продолжить операцию?', function (ans) {
                        if (ans === 'yes')
                            me.showWindow(mainView, bank, selectedPersonalAccounts, me.nameAspect, me.isHouses);
                    });
                }
                else me.showWindow(mainView, bank, selectedPersonalAccounts, me.nameAspect, me.isHouses);
            }
            else B4.QuickMsg.msg('Внимание', response.message, 'warning');

        }).error(function () {
            win.getEl().unmask();

            B4.QuickMsg.msg('Внимание', 'При выполнении операции произошла ошибка', 'warning');

        });
    },

    showWindow: function (mainView, bank, selectedPersonalAccounts, nameAspect, isHouses) {
        var win = Ext.widget('personalaccountgroupoperationmergels', {
            renderTo: mainView.getEl(),
            dataBank: bank,
            countPersonalAccount: selectedPersonalAccounts.length,
            selectedPersonalAccountList: selectedPersonalAccounts,
            nameAspect: nameAspect,
            isHouses: isHouses
        });

        win.show();
        win.center();
    },

    //Выбор Групповые операции - Групповой ввод реквизитов ЛС
    onOpenPersonalAccountGroupData: function (menuItem) {
        var me = this,
            mainView = this.controller.getMainView(),
            dataBankCombo = mainView.down('combobox[name=cmbDataBank]'),
            selectedPersonalAccounts = this.controller.getContextValue(mainView, me.selectedRecords),
            dataBankId;

        if (selectedPersonalAccounts.length == 0) {
            B4.QuickMsg.msg(
                'Внимание',
                'Для проведения групповой операции необходимо выбрать лицевые счета',
                'warning'
            );
            return;
        }

        if (me.multiBank) {
            if (dataBankCombo.getValue().length > 1) {
                B4.QuickMsg.msg(
                    'Внимание',
                    'Для проведения групповой операции выберите один банк данных',
                    'warning'
                );
                return;
            }
            dataBankId = dataBankCombo.getValue()[0];
        } else {
            dataBankId = me.controller.getContextValue(mainView, 'dataBankId');
        }

        var view = Ext.widget('grouppersonalaccountdata', {
            renderTo: mainView.getEl(),
            nameAspect: me.nameAspect,
            dataBankId: dataBankId,
            selectedPersonalAccounts: selectedPersonalAccounts
        }).show();

        me.onChangeSize(650, 1180, mainView, view);


    }
});