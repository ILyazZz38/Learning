/*
    Аспект расширенного поиска лицевых счетов
*/
Ext.define('B4.aspects.AccountsSearchWindow', {
    extend: 'B4.base.Aspect',

    alias: 'widget.accountssearchwindow',

    selectorsForProxy: undefined, // селекторы b4selectfield
    widget: undefined, // alias окна поиска
    complexFilterName: undefined, // название фильтра данного поиска
    otherFilterNames: [], // список остальных фильтров
    findEventName: 'find', // событие, которое вызывается при поиске
    filterOperand: CondExpr.operands.and, //оператор объединения фильтров
    gridSelector: undefined, // селектор грида, в котором отображаются данные поиска
    onlyOneBank: false, // не искать, если не выбрано более одного банка данных
    dataBankIdProperty: 'dataBankId', // наименование контекстного значения, хранящего 

    advancedsearchbycharge: undefined,
    advancedsearchbychargewin: undefined,

    advancedsearchbyservice: undefined,
    advancedsearchbyservicewin: undefined,

    advancedsearchbyshortdelivery: undefined,
    advancedsearchbyshortdeliverywin: undefined,

    advancedsearchbyparams: undefined, //'accountsadvancedsearchbyparams',
    advancedsearchbyparamswin: undefined, //'accountsadvancedsearchbyparams',

    advancedsearchbycountervalue: undefined,
    advancedsearchbycountervaluewin: undefined,
    advancedsearchwithoutpuvalwin: undefined,

    advancedsearchbyboiler: undefined,
    advancedsearchbyboilerwin: undefined,

    controllergrid: undefined, //'B4.controller.register.personalaccount.Grid'

    constructor: function (config) {
        Ext.apply(this, config);
        this.callParent(arguments);
    },

    init: function (controller) {
        var me = this,
            actions = {};

        me.callParent(arguments);

        actions[me.widget] = {
            'afterrender': {
                fn: me.onRender,
                scope: me
            },
            'find': {
                fn: me.find,
                scope: me
            }
        };


        //поиск по начислениям
        actions[me.advancedsearchbycharge + ' button[name=AddCharge]'] = {
            'click': {
                fn: me.openAddCharge,
                scope: me
            }
        };
        actions[me.advancedsearchbycharge + ' b4deletecolumn'] = {
            'click': {
                fn: function (grid, b, t, y, r, record) {
                    grid.getStore().remove(record);
                },
                scope: me
            }
        };
        actions[me.advancedsearchbychargewin + ' [name=AddCharge]'] = {
            'click': {
                fn: me.gridAddCharge,
                scope: me
            }
        };

        //поиск по оказываемым услугам
        actions[me.advancedsearchbyservice + ' button[name=AddService]'] = {
            'click': {
                fn: me.openAddService,
                scope: me
            }
        };
        actions[me.advancedsearchbyservice + ' b4deletecolumn'] = {
            'click': {
                fn: function (grid, b, t, y, r, record) {
                    grid.getStore().remove(record);
                },
                scope: me
            }
        };
        actions[me.advancedsearchbyservicewin + ' [name=AddService]'] = {
            'click': {
                fn: me.gridAddService,
                scope: me
            }
        };

        //поиск по недопоставкам
        actions[me.advancedsearchbyshortdelivery + ' button[name=AddShortDelivery]'] = {
            'click': {
                fn: me.openAddShortDelivery,
                scope: me
            }
        };
        actions[me.advancedsearchbyshortdelivery + ' b4deletecolumn'] = {
            'click': {
                fn: function (grid, b, t, y, r, record) {
                    grid.getStore().remove(record);
                },
                scope: me
            }
        };
        actions[me.advancedsearchbyshortdeliverywin + ' [name=AddShortDelivery]'] = {
            'click': {
                fn: me.gridAddShortDelivery,
                scope: me
            }
        };

        //поиск по параметрам
        actions[me.advancedsearchbyparams + ' button[name=AddParams]'] = {
            'click': {
                fn: me.openAddParams,
                scope: me
            }
        };
        actions[me.advancedsearchbyparams + ' b4deletecolumn'] = {
            'click': {
                fn: function (grid, b, t, y, r, record) {
                    grid.getStore().remove(record);
                },
                scope: me
            }
        };
        actions[me.advancedsearchbyparamswin + ' [name=AddParams]'] = {
            'click': {
                fn: me.gridAddParams,
                scope: me
            }
        };

        //поиск по показаниям ПУ
        actions[me.advancedsearchbycountervalue + ' button[name=Add]'] = {
            'click': {
                fn: me.openAddCounterValue,
                scope: me
            }
        };
        actions[me.advancedsearchbycountervalue + ' button[name=SearchLsWithoutPU]'] = {
            'click': {
                fn: me.openSearchLsWithoutPUCounterValue,
                scope: me
            }
        };
        actions[me.advancedsearchbycountervalue + ' b4deletecolumn'] = {
            'click': {
                fn: function (grid, b, t, y, r, record) {
                    grid.getStore().remove(record);
                },
                scope: me
            }
        };
        actions[me.advancedsearchbycountervaluewin + ' [name=Add]'] = {
            'click': {
                fn: me.gridAddCounterValue,
                scope: me
            }
        };

        actions[me.advancedsearchwithoutpuvalwin + ' [name=Add]'] = {
            'click': {
                fn: me.gridAddCounterValue,
                scope: me
            }
        };

        actions[me.advancedsearchbyparamswin + ' b4selectfield[name=ParameterName]'] = {
            'change': { fn: me.onChangeParameter, scope: me }
        };

        //поиск по котельным
        actions[me.advancedsearchbyboiler + ' button[name=Add]'] = {
            'click': {
                fn: me.openAddBoiler,
                scope: me
            }
        };
        actions[me.advancedsearchbyboiler + ' b4deletecolumn'] = {
            'click': {
                fn: function (grid, b, t, y, r, record) {
                    grid.getStore().remove(record);
                },
                scope: me
            }
        };
        actions[me.advancedsearchbyboilerwin + ' [name=Add]'] = {
            'click': {
                fn: me.gridAddBoiler,
                scope: me
            }
        };

        controller.control(actions);
    },

    //
    onRender: function () {
        var me = this,
            grid = Ext.ComponentQuery.query(me.gridSelector)[0],
            banks = grid.down('combobox[name=cmbDataBank]').getValue(),
            dataBankId = banks;

        if (!dataBankId || (Ext.isIterable(dataBankId) && dataBankId.length === 0)) {
            B4.QuickMsg.msg(
                'Внимание',
                'Выберите хотя бы банк данных для поиска!',
                'warning'
            );
        }

        if ((Ext.isIterable(dataBankId) && dataBankId.length > 1) && me.onlyOneBank) {
            B4.QuickMsg.msg(
                'Внимание',
                'Для данного поиска необходимо выбрать только один банк данных!',
                'warning'
            );
        }

        if (!me.widget) return;
        var win = me.componentQuery(me.widget) || Ext.widget(me.widget); //шаблон поиска

        me.controller.setContextValue(win, 'dataBankIdPropertyValue', dataBankId);
        Ext.iterate(me.selectorsForProxy, function (selector) {
            win.down(selector).getStore().getProxy().setExtraParam("advancedsearch", true); //признак-костыль
            win.down(selector).getStore().getProxy().setExtraParam(me.dataBankIdProperty, dataBankId); //проставить dataBankId на всех combobox в шаблоне поиска
        });

        //Очистка контекста при обновлении страницы
        me.controller.setContextValue(me.complexFilterName, undefined);
    },

    //событие find, инициированное кнопкой "Применить" на шаблоне поиска
    find: function (win, findInFinded, isCharge) {
        var me = this,
            view = me.controller.getMainView(),
            filters = [],
            filtersGroup = [],
            filtersTerritorialArea = [],
            filtersOKO = [],
            filtersFilials = [],
            filtersOwner = [],
            oldFilters;

        if (isCharge == true) {
            //поиск начислений
            me.getListFilters(win, filters);
        } else {
            //поисковая форма
            if (me.complexFilterName == 'dataFilter') {
                //поиск по адресу
                me.getFilters(win, filters, ['PersonalAccountGroupId', 'OKO', 'TerritorialArea', 'FilialOKO'], true); //игногрируем поля PersonalAccountGroupId, OKO, TerritorialArea, FilialOKO

            } else if (me.complexFilterName == 'tenantCardFilter') {
                //поиск по людям
                me.getFilters(win, filters, 'OwnerForSearch', true); //игногрируем поле собственника

            } else {
                me.getFilters(win, filters);
            }
        }

        if (findInFinded) {
            oldFilters = me.controller.getContextValue(me.complexFilterName);
            if (oldFilters) {
                filters = filters.concat(oldFilters);
            }
        } else {
            Ext.iterate(me.otherFilterNames, function (filterName) {
                me.controller.setContextValue(filterName, undefined);
            });
            me.controller.setContextValue(me.complexFilterName, undefined);
        }
        me.controller.setContextValue(me.complexFilterName, filters);
        //отдельно группа лс
        if (me.complexFilterName == 'dataFilter') {
            //обработать PersonalAccountGroupId
            me.getFilters(win, filtersGroup, 'PersonalAccountGroupId', false); //ТОЛЬКО поле PersonalAccountGroupId
            me.getFilters(win, filtersTerritorialArea, 'TerritorialArea', false); //ТОЛЬКО поле ТУ
            me.getFilters(win, filtersOKO, 'OKO', false); //ТОЛЬКО поле ОКО
            me.getFilters(win, filtersFilials, 'FilialOKO', false); //ТОЛЬКО поле Филиал
            var gr;
            //Находим первое вхождение TypeFind в Filters - последние добавление условия с группами
            var j=-1;
            for (var i = 0; i < filters.length; i++){
                if (filters[i].DataIndex == "TypeFind") {
                    j = i;
                    break;
                }
            }
            //Если такое есть, то распределяем группы на три вида: Есть во всех(1), есть хотя бы в одной(2), нет ни в одной(3)
            if (j > -1) {

                switch (filters[j].Value) {
                    case 1:
                        gr = 1;
                        break;
                    case 2:
                        gr = 3;
                        break;
                    case 3:
                        gr = 2;
                        break;
                }
                //Записываем вид в фильтр
                if (filtersGroup.length > 0 && filtersGroup[0].Value != "All") {
                    filtersGroup[0].Filters.forEach(function (item) {
                        item.Group = gr;
                    });
                }
            }
            //Если искать в найденном, добавляем старые значения
            if (findInFinded) {
                oldFilters = me.controller.getContextValue(view, 'groupOfPersonalAccountFilter');
                if (oldFilters) {
                     filtersGroup = filtersGroup.concat(oldFilters);
                }
            } else {
                Ext.iterate(me.otherFilterNames, function (filterName) {
                    me.controller.setContextValue(view, filterName, undefined);
                });
            }
            me.controller.setContextValue('groupOfPersonalAccountFilter', filtersGroup);
            me.controller.setContextValue('groupOfTerritorialAreas', filtersTerritorialArea);
            me.controller.setContextValue('groupOfOKO', filtersOKO);
            me.controller.setContextValue('groupOfFilials', filtersFilials);
        }

        //отдельно собствениик
        if (me.complexFilterName == 'tenantCardFilter') {
            //обработать OwnerForSearch
            me.getFilters(win, filtersOwner, 'OwnerForSearch', false); //ТОЛЬКО поле OwnerForSearch 

            if (findInFinded) {
                oldFilters = me.controller.getContextValue(view, 'ownerCardFilter');
                if (oldFilters) {
                    //   filtersOwner = filtersOwner.concat(oldFilters);
                }
            } else {
                Ext.iterate(me.otherFilterNames, function (filterName) {
                    me.controller.setContextValue(view, filterName, undefined);
                });
            }
            me.controller.setContextValue('ownerCardFilter', filtersOwner);
        }


        //в зависимости от выбранного реестра вытащить соответствующий Controller и Grid
        var gridController = me.controller.application.controllers.getByKey(me.controllergrid); //getByKey('B4.controller.register.personalaccount.Grid');
        var grid = Ext.ComponentQuery.query(me.gridSelector)[0];

        if (grid) {
            //вызвать событие find в искомом реестре
            grid.fireEvent(
                me.findEventName,
                win,
                me.complexFilterName,
                { Group: me.filterOperand, Filters: filters },
                findInFinded,
                gridController,
                grid,
                { Group: me.filterOperand, Filters: filtersGroup },
                { Group: me.filterOperand, Filters: filtersTerritorialArea },
                { Group: me.filterOperand, Filters: filtersOKO },
                { Group: me.filterOperand, Filters: filtersFilials },
                { Group: me.filterOperand, Filters: filtersOwner }
            );

            //открыть панель с реестром
            var container = Ext.ComponentQuery.query('#contentPanel')[0];
            container.setActiveTab(grid);

        } else {

            //TODO если грид не открыт, то надо сначала открыть
        }
    },

    //собрать все значения формы из шаблона поиска
    getFilters: function (item, filters, specificString, ignore) {
        var me = this;
        Ext.iterate(item.items.items, function (subitem) {
            if (subitem.items && Ext.isIterable(subitem.items.items)) {
                me.getFilters(subitem, filters, specificString, ignore);
            } else {

                if (!subitem.dataIndex) return;

                if (specificString) {
                    //учет personalAccountGroupId
                    //if (subitem.dataIndex == specificString) {
                    if (specificString.indexOf(subitem.dataIndex) > -1 || subitem.dataNameSearch && specificString.indexOf(subitem.dataNameSearch) > -1) {
                        if (ignore)
                            return;
                    } else {
                        if (ignore == false)
                            return;
                    }
                }

                var value = subitem.hasCustomValue ? subitem.customValue : subitem.getValue();
                if ((value != undefined && value !== '' && value !== false || (subitem.hasCustomValue && value === false)) && (!Ext.isIterable(value) || value.length > 0)) {
                    var targetValue = undefined;
                    if (subitem.targetField) {
                        targetValue = subitem.up('form').down(subitem.targetField).getValue();
                    }
                    if (targetValue && (!Ext.isIterable(targetValue) || targetValue.length > 0)) {

                        // если есть ограничение сверху на значение
                        if (Ext.isIterable(value)) {
                            var filterGroup = [];
                            Ext.iterate(value, function (valueItem) {
                                filterGroup.push({ DataIndex: subitem.dataIndex, Operand: subitem.altOp, Value: valueItem });
                            });
                            filters.push({ Group: CondExpr.operands.or, Filters: filterGroup });
                        } else {
                            filters.push({ DataIndex: subitem.dataIndex, Operand: subitem.altOp, Value: value });
                        }
                    } else {
                        if (Ext.isIterable(value)) {
                            var filterGroup = [];
                            Ext.iterate(value, function (valueItem) {
                                filterGroup.push({ DataIndex: subitem.dataIndex, Operand: subitem.op, Value: valueItem });
                            });
                            filters.push({ Group: CondExpr.operands.or, Filters: filterGroup });
                        } else {
                            filters.push({ DataIndex: subitem.dataIndex, Operand: subitem.op, Value: value });
                        }
                    }
                }
            }
        });
    },

    //собрать все значения формы из шаблона поиска
    getListFilters: function (win, filters) {
        var recIn, rec,
            storeSelected = win.getStore();

        Ext.each(storeSelected.data.items, function (record) {
            recOut = {};
            rec = record.getData();
            for (var key in rec) {
                if (rec[key] != undefined && (rec[key] != '' || rec[key].__proto__ != String().__proto__))
                    recOut[key] = rec[key];
            }
            filters.push(Ext.encode(recOut));
        });
    },



    //поиск по начислениям

    //открыть окно добавления начисления
    openAddCharge: function (btn) {
        var me = this;
        var store = btn.up('grid').getStore();

        var view = Ext.widget(me.advancedsearchbychargewin, {
            renderTo: me.controller.getMainView().getEl(),
            gridStore: store
        });

        var model = me.controller.getModel('register.personalaccount.listofcharges.SearchOfCharges');
        var rec = new model({ Id: 0 });
        view.loadRecord(rec);
        view.getForm().isValid();
        view.show();
    },

    //добавления начисления в гридец
    gridAddCharge: function (btn) {
        var me = this,
            win = btn.up('window'),
            form = win.getForm(),
            serv = win.down('b4selectfield[name=Service]'),
            supp = win.down('b4selectfield[name=Supplier]'),
            store = win.gridStore;

        form.updateRecord();

        var record = form.getRecord();

        if (serv.value) {
            record.data.ServiceId = serv.value.Id;
            record.data.ServiceName = serv.value.Name;
        }
        if (supp.value) {
            record.data.SupplierId = supp.value.Id;
            record.data.SupplierName = supp.value.Name;
        }

        store.add(record.getData());

        win.close();
    },

    //поиск по услугам

    //открыть окно добавления услуги
    openAddService: function (btn) {
        var me = this;
        var store = btn.up('grid').getStore();

        var view = Ext.widget(me.advancedsearchbyservicewin, {
            renderTo: me.controller.getMainView().getEl(),
            gridStore: store
        });

        var model = me.controller.getModel('register.personalaccount.servicelist.SearchOfService');
        var rec = new model({ Id: 0 });
        view.loadRecord(rec);
        view.getForm().isValid();
        view.show();
    },

    //добавления начисления в гридец
    gridAddService: function (btn) {

        var me = this,
            win = btn.up('window'),
            form = win.getForm(),
            serv = win.down('b4selectfield[name=Service]'),
            supp = win.down('b4selectfield[name=Supplier]'),
            frml = win.down('b4selectfield[name=Formula]'),
            agen = win.down('b4selectfield[name=Agent]'),
            prin = win.down('b4selectfield[name=Principal]'),
            work = win.down('b4selectfield[name=Worker]'),
            dateb = win.down('datefield[name=DateBegin]'),
            datee = win.down('datefield[name=DateEnd]'),
            store = win.gridStore;

        form.updateRecord();

        var record = form.getRecord();

        if (serv.value) {
            record.data.ServiceId = serv.value.Id;
            record.data.ServiceName = serv.value.Name;
        }
        if (supp.value) {
            record.data.SupplierId = supp.value.Id;
            record.data.SupplierName = supp.value.Name;
        }
        if (frml.value) {
            record.data.FormulaId = frml.value.Id;
            record.data.FormulaName = frml.value.Name;
        }
        if (agen.value) {
            record.data.AgentId = agen.value.Id;
            record.data.AgentName = agen.value.Name;
        }
        if (prin.value) {
            record.data.PrincipalId = prin.value.Id;
            record.data.PrincipalName = prin.value.Name;
        }
        if (work.value) {
            record.data.WorkerId = work.value.Id;
            record.data.WorkerName = work.value.Name;
        }
        if (dateb) {
            record.data.DateBegin = dateb.getValue();
        }
        if (datee) {
            record.data.DateEnd = datee.getValue();
        }

        store.add(record.getData());

        win.close();
    },

    //поиск по недопоставкам

    //открыть окно добавления недопоставки
    openAddShortDelivery: function (btn) {
        var me = this;
        var store = btn.up('grid').getStore();

        var view = Ext.widget(me.advancedsearchbyshortdeliverywin, {
            renderTo: me.controller.getMainView().getEl(),
            gridStore: store
        });

        var model = me.controller.getModel('register.personalaccount.shortdelivery.SearchByShortDelivery');
        var rec = new model({ Id: 0 });
        view.loadRecord(rec);
        view.getForm().isValid();
        view.show();
    },

    //добавления в гридец
    gridAddShortDelivery: function (btn) {
        var me = this,
            win = btn.up('window'),
            form = win.getForm(),
            store = win.gridStore,
            percentFrom = win.down('[name=WidthdrawalPercentageFrom]'),
            percentTo = win.down('[name=WidthdrawalPercentageTo]'),
            attribute = '';

        form.updateRecord();

        var record = form.getRecord();

        if (record.get('DateFrom') && record.get('DateTo') && record.get('DateFrom') > record.get('DateTo')) {
            B4.QuickMsg.msg('Внимание', 'Некорректный период', 'warning');
            return;
        }

        if (percentFrom.getValue()) {
            attribute += percentFrom.fieldLabel + ' ' + percentFrom.getValue();
        }
        if (percentTo.getValue()) {
            if (attribute) {
                attribute += ', ';
            }
            attribute += percentTo.fieldLabel + ' ' + percentTo.getValue();
        }

        record.set('PreciseSearch', win.down('checkbox[name=PreciseSearch]').rawValue);
        record.set('ServiceName', win.down('b4selectfield[name=ServiceId]').rawValue);
        record.set('SupplierName', win.down('b4selectfield[name=SupplierId]').rawValue);
        record.set('TypeName', win.down('b4combobox[name=TypeId]').rawValue);
        record.set('Attribute', attribute);

        store.add(record.getData());

        win.close();
    },


    //поиск по параметрам

    //открыть окно добавления параметра
    openAddParams: function (btn) {
        var me = this;
        var store = btn.up('grid').getStore();

        var view = Ext.widget(me.advancedsearchbyparamswin, {
            renderTo: me.controller.getMainView().getEl(),
            gridStore: store
        });

        var model = me.controller.getModel('parameter.SearchOfParams');
        var rec = new model({ Id: 0 });
        view.loadRecord(rec);
        view.getForm().isValid();
        view.show();
    },

    //добавления параметра в гридец
    gridAddParams: function (btn) {
        var me = this,
            win = btn.up('window'),
            form = win.getForm(),
            valn = win.down('[name=Value]'),
            store = win.gridStore;
        
        if (win.selectedParameter) {
            form.updateRecord();

            var record = form.getRecord();
            if (record.get('Value') && record.get('ValueTo')) {
                if (win.selectedParameter.ParameterTypeNative === 'int' && parseInt(record.get('Value')) > parseInt(record.get('ValueTo'))) {
                    B4.QuickMsg.msg('Внимание',
                        'Начало диапазона значений не может быть больше его окончания',
                        'warning');
                    return;
                }
                else if (win.selectedParameter.ParameterTypeNative !== 'int' &&
                    record.get('Value') > record.get('ValueTo')) {
                    B4.QuickMsg.msg('Внимание',
                       'Начало диапазона значений не может быть больше его окончания',
                       'warning');
                    return;
                }
            }

            if (record.get('DateBegin') && record.get('DateEnd') && record.get('DateBegin') > record.get('DateEnd')) {
                B4.QuickMsg.msg('Внимание', 'Начало периода действия не может быть больше его окончания', 'warning');
                return;
            }

            record.data.ParameterId = win.selectedParameter.Id;
            record.data.ParameterName = win.selectedParameter.ParameterName;
            record.data.Type = win.selectedParameter.Type;
            record.data.ParameterTypeNative = win.selectedParameter.ParameterTypeNative;
            record.data.NewValue = record.data.Value;
            record.data.TableNumber = win.selectedParameter.TableNumber;
            if (valn) {
                if (Ext.getClass(valn).getName() == 'Ext.form.field.ComboBox') {
                    record.data.NewValue = valn.rawValue;
                }
                else if (Ext.getClass(valn).getName() == 'B4.form.SelectField') {
                    record.data.NewValue = valn.rawValue;
                    if (valn.value)
                    record.data.Value = valn.value.PayerId;
                }
            }
            store.add(record.getData());

            win.close();

            return;
        }

        B4.QuickMsg.msg(
            'Внимание',
            'Выберите характеристику жилья!',
            'warning'
        );
    },

    onChangeParameter: function (cmp, rec) {
        if (!rec) return;

        var form = cmp.up('window'),
            store,
            component,
            componentTo = undefined,
            valueList = rec.ValuesList;

        if (rec.ParameterTypeNative === 'sprav' || rec.ParameterTypeNative === 'bool' || rec.ParameterTypeNative === 'terarea') {
            component = Ext.create('Ext.form.field.ComboBox', {
                editable: false,
                displayField: 'ValueName',
                valueField: 'Value',
                anchor: '100%'
            });

            store = Ext.create('Ext.data.Store', {
                fields: ['Value', 'ValueName'],
                data: valueList,
                anchor: '100%'
            });
            component.bindStore(store);
        } else if (rec.ParameterTypeNative === 'float') {
            component = Ext.create('Ext.form.field.Number', {
                hideTrigger: true,
                decimalPrecision: 4,
                customFormat: '0,000.0000'
            });
            componentTo = Ext.create('Ext.form.field.Number', {
                hideTrigger: true,
                decimalPrecision: 4,
                customFormat: '0,000.0000'
            });
        } else if (rec.ParameterTypeNative === 'courier') {
            component = Ext.create('B4.form.SelectField', {
                store: Ext.create('B4.store.dict.DeliveryCourier'),
                editable: false,
                textProperty: 'PayerName',
                valueField: 'PayerName',
                columnLines: true,
                width: 450,
                columns: [
                    {
                        xtype: 'gridcolumn',
                        dataIndex: 'PayerName',
                        flex: 2,
                        text: 'Курьер доставки',
                        filter: {
                            xtype: 'textfield'
                        }
                    },
                    {
                        xtype: 'datecolumn',
                        dataIndex: 'DateBegin',
                        flex: 0.5,
                        text: 'Действует с',
                        format: 'd.m.Y'
                    },
                    {
                        xtype: 'datecolumn',
                        dataIndex: 'DateEnd',
                        flex: 0.5,
                        text: 'Действует по',
                        format: 'd.m.Y'
                    },
                    {
                        xtype: 'b4enumcolumn',
                        dataIndex: 'IsUd',
                        flex: 1,
                        text: 'Курьер для удержания за доставку ЕПД',
                        enumName: 'B4.enums.YesNo'
                    }]
            });
        } else if (rec.ParameterTypeNative === 'date') {
            component = Ext.create('Ext.form.field.Date', {
                format: 'd.m.Y',
                name: 'Value',
                labelWidth: 100
            });
            componentTo = Ext.create('Ext.form.field.Date', {
                format: 'd.m.Y',
                name: 'Value',
                labelWidth: 100
            });
        }
        else if (rec.ParameterTypeNative === 'datetime') {
            component = Ext.create('Ext.ux.form.DateTimeField', {
                format: 'd.m.Y',
                name: 'Value',
                labelWidth: 100
            });

            componentTo = Ext.create('Ext.ux.form.DateTimeField', {
                format: 'd.m.Y',
                name: 'Value',
                labelWidth: 100
            });
        }
        else if (rec.ParameterTypeNative === 'int') {
            component = Ext.create('Ext.form.field.Text', {
                maskRe: /[0-9]/
            });
            componentTo = Ext.create('Ext.form.field.Text', {
                maskRe: /[0-9]/
            });
        } else {
            component = Ext.create('Ext.form.field.Text', {
                anchor: '100%'
            });
        }

        Ext.apply(component, {
            name: 'Value',
            labelAlign: 'right',
            labelWidth: 140,
            fieldLabel: 'Значение',
            flex: 1,
            margin: '5 5 5 5'
        });

        // добавление компонента на форму
        var val = form.down('[name=Value]');
        if (val) {
            form.remove(val);
        }

        val = form.down('[name=InterCont]');
        if (val) {
            form.remove(val);
        }

        if (componentTo == undefined) {
            //простое значение
            form.insert(3, component);
            component.isValid();

        } else {
            //интервальное значение
            Ext.apply(componentTo, {
                name: 'ValueTo',
                labelAlign: 'right',
                labelWidth: 70,
                fieldLabel: 'по',
                flex: 1,
                margin: '0 5 5 5'
            });

            var cont = Ext.create('Ext.container.Container', {
                name: 'InterCont',
                layout: {
                    type: 'hbox',
                    align: 'stretch'
                },
                defaults: {
                    labelAlign: 'right'
                },
                items: [component, componentTo]
            });

            form.insert(3, cont);
            component.isValid();
            componentTo.isValid();


            /*
            form.insert(3, component);
            component.isValid();

            Ext.apply(componentTo, {
                name: 'ValueTo',
                labelAlign: 'right',
                labelWidth: 140,
                fieldLabel: 'по',
                flex: 1,
                margin: '0 5 5 5'
            });

            form.insert(4, componentTo);
            componentTo.isValid();
            */
        }

        rec.ParameterId = rec.Id;
        form.selectedParameter = rec;

        /*
        var model = me.controller.getModel('parameter.SearchOfParams');
        var recm = new model(rec);
        form.loadRecord(new model(recm));
        form.getForm().isValid();
        */
    },

    //поиск по показаниям ПУ

    //открыть окно добавления показания ПУ
    openAddCounterValue: function (btn) {
        var me = this;
        var store = btn.up('grid').getStore();

        var view = Ext.widget(me.advancedsearchbycountervaluewin, {
            renderTo: me.controller.getMainView().getEl(),
            gridStore: store
        });
        var model = me.controller.getModel('register.personalaccount.counter.SearchByCounterValue');
        var countertype = view.down('b4selectfieldcountertype');
        countertype.getStore().getProxy().setExtraParam(me.dataBankIdProperty, Ext.encode(me.controller.getContextValue(me.controller.getMainView(), 'dataBankIdPropertyValue')));
        countertype.dataBankId = Ext.encode(me.controller.getContextValue(me.controller.getMainView(), 'dataBankIdPropertyValue'))
        var сounterKind = 3;
      
        if (me.advancedsearchbycountervaluewin == 'housesadvancedsearchbycountervaluewindow')
            сounterKind = 1;

        var rec = new model({ Id: 0, CounterKind: сounterKind });
        view.loadRecord(rec);
        view.getForm().isValid();
        view.show();
    },

    openSearchLsWithoutPUCounterValue: function (btn) {
        var me = this;
        var store = btn.up('grid').getStore(),
            mainView = me.controller.getMainView();
        
        var view = Ext.widget(me.advancedsearchwithoutpuvalwin, {
            renderTo: mainView.getEl(),
            gridStore: store
        });

        var сounterKind = 1;
        var titleEl = '',
            modelName = 'register.personalaccount.counter.SearchByCounterValue';
        if (mainView.xtype == 'housesadvancedsearchbycountervalue') {
            titleEl = 'домов';
            сounterKind = 1;
            modelName = 'register.house.counter.SearchByCounterValue';
        }
        else {
            titleEl = 'лицевых счетов';
            сounterKind = 3;
        }

        view.setTitle('Поиск ' + titleEl + ' с действующей услугой без открытых ПУ');
        if (mainView.down('checkbox[name=FindInFinded]').getValue())
            view.setTitle(view.title + ' (в найденном перечне ' + titleEl + ')');

        var model = me.controller.getModel(modelName);

        B4.Ajax.request({
            url: B4.Url.action('/CalculationMonth/GetCalculationMonth'),
            method: 'GET'
        }).next(function (jsonResp) {
            var data = Ext.decode(jsonResp.responseText).data;
            if (!data) return;
            var date = new Date(data.CalculationMonth);
            view.down('datefield[name=SearchPeriodDateBegin]').setValue(date);
            view.down('datefield[name=SearchPeriodDateEnd]').setValue(new Date(date.getFullYear(), date.getMonth()+1, 0));
        }).error(function (response) {
            Ext.Msg.alert('Ошибка!',
                !Ext.isString(response.message)
                    ? 'При получении текущего расчетного месяца произошла ошибка!'
                    : response.message);
        });

        var rec = new model({ Id: 0, CounterKind: сounterKind });
        view.loadRecord(rec);
        view.getForm().isValid();
        if (mainView.xtype == 'housesadvancedsearchbycountervalue')
            view.down('b4combobox[name=CounterKind]').getStore().removeAt(3);
        view.down('b4combobox[name=CounterKind]').getStore().removeAt(0);
        view.show();
    },

    //добавления начисления в гридец
    gridAddCounterValue: function (btn) {
        var me = this,
            win = btn.up('window');
        if (win) {
            var form = win.getForm(),
                store = win.gridStore,
                withoutCounters = win.xtype == 'searchwithoutpuvalwindow' ? true : false,
                service = win.down('b4selectfield[name=Service]'),
                counterKind = win.down('b4combobox[name=CounterKind]'),
                counterType = win.down('b4selectfieldcountertype'),
                counterNumber = win.down('textfield[name=CounterNumber]'),
                multiplier = win.down('numberfield[name=Multiplier]'),
                capacity = win.down('numberfield[name=Capacity]');


            if (!form.isValid()) {
                B4.QuickMsg.msg('Внимание', 'Не все поля корректно заполнены', 'warning');
                return;
            }

            var isuEEDateBegin = win.down('datefield[name=IsuEEDateBegin]'),
                isuEEDateEnd = win.down('datefield[name=IsuEEDateEnd]');

            if (win.xtype != 'searchwithoutpuvalwindow') {
                var valueBegin = win.down('numberfield[name=ValueBegin]'),
                    valueEnd = win.down('numberfield[name=ValueEnd]'),
                    valueDateBegin = win.down('datefield[name=ValueDateBegin]'),
                    valueDateEnd = win.down('datefield[name=ValueDateEnd]'),
                    closingDateBegin = win.down('datefield[name=ClosingDateBegin]'),
                    closingDateEnd = win.down('datefield[name=ClosingDateEnd]'),
                    checkingDateBegin = win.down('datefield[name=CheckingDateBegin]'),
                    checkingDateEnd = win.down('datefield[name=CheckingDateEnd]'),
                    nextCheckingDateBegin = win.down('datefield[name=NextCheckingDateBegin]'),
                    nextCheckingDateEnd = win.down('datefield[name=NextCheckingDateEnd]'),
                    breakingDateBegin = win.down('datefield[name=BreakingDateBegin]'),
                    breakingDateEnd = win.down('datefield[name=BreakingDateEnd]'),
                    repairingDateBegin = win.down('datefield[name=RepairingDateBegin]'),
                    repairingDateEnd = win.down('datefield[name=RepairingDateEnd]'),
                    actuality = win.down('combobox[name=Actuality]'),

                    actualityArray = actuality.getValue().filter(function (item) { return item !== ''; });
            }
            else {
                var searchPeriodDateBegin = win.down('datefield[name=SearchPeriodDateBegin]'),
                    searchPeriodDateEnd = win.down('datefield[name=SearchPeriodDateEnd]');
            }

            form.updateRecord();

            var record = form.getRecord();

            record.data.WithoutCounters = withoutCounters;
            record.data.ServiceId = service.getValue();
            record.data.ServiceName = service.getText();
            record.data.CounterKind = counterKind.getValue();
            record.data.CounterKindName = counterKind.valueModels.length > 0 ? counterKind.valueModels[0].get('Display') : '';
            record.data.CounterType = counterType.getStore().data.items.find(x => x.internalId === counterType.getValue())?.data;
            record.data.CounterNumber = counterNumber.getValue();
            record.data.Multiplier = multiplier.getValue();
            record.data.Capacity = capacity.getValue();

            if (win.xtype != 'searchwithoutpuvalwindow') {
                record.data.ValueBegin = valueBegin.getValue();
                record.data.ValueEnd = valueEnd.getValue();
                record.data.ValueDateBegin = valueDateBegin.getValue();
                record.data.ValueDateEnd = valueDateEnd.getValue();
                record.data.ClosingDateBegin = closingDateBegin.getValue();
                record.data.ClosingDateEnd = closingDateEnd.getValue();
                record.data.CheckingDateBegin = checkingDateBegin.getValue();
                record.data.CheckingDateEnd = checkingDateEnd.getValue();
                record.data.NextCheckingDateBegin = nextCheckingDateBegin.getValue();
                record.data.NextCheckingDateEnd = nextCheckingDateEnd.getValue();
                record.data.BreakingDateBegin = breakingDateBegin.getValue();
                record.data.BreakingDateEnd = breakingDateEnd.getValue();
                record.data.RepairingDateBegin = repairingDateBegin.getValue();
                record.data.RepairingDateEnd = repairingDateEnd.getValue();
                record.data.Actuality = actualityArray.length == 1
                    ? actualityArray[0]
                    : null;
            }
            else {
                record.data.SearchPeriodDateBegin = searchPeriodDateBegin.getValue();
                record.data.SearchPeriodDateEnd = searchPeriodDateEnd.getValue();
            }

            record.data.IsuEEDateBegin = isuEEDateBegin.getValue();
            record.data.IsuEEDateEnd = isuEEDateEnd.getValue();

            
            if (win.xtype == 'searchwithoutpuvalwindow') {
                Ext.Msg.confirm('Внимание', 'Запускается поиск без показаний ПУ', function (result) {
                    if (result == 'yes') {
                        store.add(record.getData());
                        win.close();
                        me.find(me.controller.getMainView(), me.controller.getMainView().down('checkbox[name=FindInFinded]').getValue(), true);
                    }
                });
            }
            else {
                store.add(record.getData());
                win.close();
            }
        }
    },

    //поиск по котельным

    //открыть окно добавления котельной
    openAddBoiler: function (btn) {
        var me = this,
            store = btn.up('grid').getStore(),
            registerGrid = btn.up('b4portal').down(me.gridSelector),
            view = Ext.widget(me.advancedsearchbyboilerwin, {
                renderTo: me.controller.getMainView().getEl(),
                gridStore: store
            });

        view.down('[name=BoilerId]').getStore().on({
            beforeLoad: function (curStore, operation) {
                operation.params = operation.params || {};
                if (registerGrid) {
                    operation.params.dataBankList = Ext.encode(registerGrid.down('[name=cmbDataBank]').getValue());
                }
            }
        });
        view.on({
            afterrender: function () {
                view.down('[name=ServiceId]').getStore().load();
            }
        });

        var model = me.controller.getModel('register.house.boiler.SearchByBoiler');
        var rec = new model({ Id: 0 });
        view.loadRecord(rec);
        view.getForm().isValid();
        view.show();
    },

    //добавления котельной в гридец
    gridAddBoiler: function (btn) {
        var me = this,
            win = btn.up('window'),
            form = win.getForm(),
            store = win.gridStore,
            boilerField = win.down('[name=BoilerId]'),
            serviceField = win.down('[name=ServiceId]');

        if (!form.isValid()) {
            B4.QuickMsg.msg('Внимание', 'Не все поля корректно заполнены', 'warning');
            return;
        }

        form.updateRecord();

        var record = form.getRecord();
        record.set('BoilerName', boilerField.value.Name);
        record.set('DataBank', boilerField.value.DataBank);
        record.set('ServiceName', serviceField.rawValue);

        store.add(record.getData());

        win.close();
    }
});
