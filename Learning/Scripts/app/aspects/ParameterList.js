/*
    Аспект inline-редактирования параметров 
*/
Ext.define('B4.aspects.ParameterList', {
    extend: 'B4.base.Aspect',

    alias: 'widget.parameterlistaspect',

    requires: [
        'B4.view.parameter.ParameterList',
        'B4.view.parameter.Window',
        'B4.QuickMsg',
        'B4.form.MonthPicker',
        'B4.aspects.GridEditWindow',
        'B4.enums.SystemParameters',
        'B4.enums.ContractERCParameters',
        'B4.view.parameter.PictParamWindow'
    ],

    name: undefined,
    gridSelector: undefined,
    editFormSelector: 'parameterwindow',
    editWindowView: 'parameter.Window',
    modelName: 'parameter.Parameters',
    storeName: 'parameter.Parameters',
    allowCloseButton: false,
    objectId: undefined,
    dataBankId: undefined,
    parameterTableNumber: undefined,
    regId: undefined,
    showWarning: false,

    constructor: function (config) {
        Ext.apply(this, config);
        this.callParent(arguments);
    },

    init: function (controller) {
        this.callParent(arguments);

        var permissionAspect = Ext.create('B4.aspects.permission.Kp60PermissionAspect', {
            permissions: [
                {
                    name: 'Kp60.PersonalAccountRegister.ShowWarning',
                    applyTo: 'button[name=saveValue]',
                    selector: 'parameterwindow',
                    applyBy: function (component, allowed) {
                        this.controller.setContextValue(component.up('parameterwindow'), 'showWarning', allowed);
                    }
                }
            ]
        });
        permissionAspect.init(controller);

        this.controller.aspects.push(permissionAspect);

        controller.control({

        });
    },

    //dataBankId - идентификатор банка 
    //personalAccountId - идентификатор лицевого счета
    //serviceId - идентификатор услуги, по которой искать параметры 
    //regId - ИД сущности, по которой искать параметры(необязательный параметр)
    //parameterTableNumber - номер таблицы параметров(необязательный параметр)
    //showAllParameters - отображать все параметры
    //objectIdMethod - метод поиска по идентификатору объекта
    setFormData: function (grid, params) {
        var me = this,
            view = grid,
            paramsStore = view.getStore();

        //Первую загрузку производить из базы
        me.controller.setContextValue(view, 'getFromDataBase', true);

        if (me.allowCloseButton) {
            view.down('b4closebutton[name=closeWindow]').show();
        }

        //т.к. к этому параметру обращается эдитор грида, храним его на вьюхе
        if (params.allowedToEditParameterTables) {
            grid.allowedToEditParameterTables = params.allowedToEditParameterTables;
        }
        //сохраняем параметры
        //if (params.objectId) {
        me.controller.setContextValue(view, 'objectId', params.objectId);
        //}
        if (params.objectIdMethod) {
            me.controller.setContextValue(view, 'objectIdMethod', params.objectIdMethod);
        }
        if (params.dataBankId) {
            me.controller.setContextValue(view, 'dataBankId', params.dataBankId);
        }
        if (params.parameterTableNumber) {
            me.controller.setContextValue(view, 'parameterTableNumber', params.parameterTableNumber);
        }
        if (params.regId) {
            me.controller.setContextValue(view, 'regId', params.regId);
        }
        if (params.onlyCentralBank) {
            me.controller.setContextValue(view, 'onlyCentralBank', params.onlyCentralBank);
        }
        if (params.personalAccountId) {
            me.controller.setContextValue(view, 'personalAccountId', params.personalAccountId);
        }
        if (params.serviceId) {
            me.controller.setContextValue(view, 'serviceId', params.serviceId);
        }
        if (params.counterId) {
            me.controller.setContextValue(view, 'counterId', params.counterId);
        }
        if (params.showAllParameters || view.down('checkbox[name=showAllParameters]')) {
            me.controller.setContextValue(view, 'showAllParameters', params.showAllParameters || view.down('checkbox[name=showAllParameters]').getValue());
        }
        if (params.hideWarnings) {
            me.controller.setContextValue(view, 'hideWarnings', params.hideWarnings);
        }
        if (params.concreteParameters) {
            me.controller.setContextValue(view, 'concreteParameters', params.concreteParameters);
        }

        if (params.prmWitActualVal) {
            me.controller.setContextValue(view, 'prmWitActualVal', params.prmWitActualVal);
        }

        //загрузка грида с параметрами
        paramsStore.on({
            'beforeload': function (store, operation) {
                var objectId = me.controller.getContextValue(view, 'objectId'),
                    dataBankId = me.controller.getContextValue(view, 'dataBankId'),
                    parameterTableNumber = me.controller.getContextValue(view, 'parameterTableNumber'),
                    regId = me.controller.getContextValue(view, 'regId'),
                    personalAccountId = me.controller.getContextValue(view, 'personalAccountId'),
                    houseId = me.controller.getContextValue(view, 'houseId'),
                    serviceId = me.controller.getContextValue(view, 'serviceId'),
                    counterId = me.controller.getContextValue(view, 'counterId'),
                    objectIdMethod = me.controller.getContextValue(view, 'objectIdMethod'),
                    chargeDate = me.controller.getContextValue(view, 'chargeDate'),
                    concreteParameters = me.controller.getContextValue(view, 'concreteParameters'),
                    showAllParameters = me.controller.getContextValue(view, 'showAllParameters'),
                    getFromDataBase = me.controller.getContextValue(view, 'getFromDataBase'),
                    prmWitActualVal = me.controller.getContextValue(view, 'prmWitActualVal');

                operation.params = operation.params || {};
                operation.params.objectId = objectId;
                operation.params.dataBankId = dataBankId;
                operation.params.parameterTableNumber = parameterTableNumber;
                operation.params.regId = regId;
                operation.params.personalAccountId = personalAccountId;
                operation.params.houseId = houseId;
                operation.params.serviceId = serviceId;
                operation.params.counterId = counterId;
                operation.params.objectIdMethod = objectIdMethod;
                operation.params.showAllParameters = showAllParameters;
                operation.params.chargeDate = chargeDate;
                operation.params.concreteParameters = concreteParameters;
                //Если стор уже загружался, данные достаем из кэша
                operation.params.getFromDataBase = getFromDataBase;
                // показать параметры с актульными значениями
                operation.params.prmWitActualVal = prmWitActualVal;

                me.controller.setContextValue(view, 'getFromDataBase', false);

                if (view.getEl()) view.getEl().mask();
            },

            'load': function () {
                if (view.getEl()) view.getEl().unmask();
            }
        });

        paramsStore.load();

        //Настройка аспекта редактирования периодов параметров
        var periodsAsp = Ext.create('B4.aspects.GridEditWindow', {
            gridSelector: me.gridSelector,
            editFormSelector: me.editFormSelector,
            modelName: me.modelName,
            storeName: me.storeName,
            editWindowView: me.editWindowView,
            listeners: {
                beforesetformdata: function (aspect, record, form) {
                    //Настраиваем период
                    if (record.get('IsDay')) {
                        form.down('b4monthpicker[name=DateBegin]').destroy();
                        form.down('b4monthpicker[name=DateEnd]').destroy();
                        form.down('datefield[name=DateBegin]').allowBlank = false;
                    } else {
                        form.down('datefield[name=DateBegin]').destroy();
                        form.down('datefield[name=DateEnd]').destroy();
                        form.down('b4monthpicker[name=DateBegin]').allowBlank = false;

                        //Подменяем рендерер дат в гриде периодов параметров
                        form.down('gridcolumn[dataIndex=DateBegin]').renderer = form.down('gridcolumn[dataIndex=DateEnd]').renderer = function (value) {
                            return value ? Ext.Date.format(new Date(value), 'F Y') : '';
                        };
                    }
                },
                //Т.к. при загрузке модели может некорректно установиться значение комбобокса, устанавливаем его вручную
                aftersetformdata: function (aspect, record, form) {
                    var valueComponent = form.down('[name=Value]');
                    if (valueComponent.xtype == 'combobox') {
                        valueComponent.setValue(valueComponent.getStore().findRecord('Value', (record.get('Value')), 0, false, true, true));
                    }
                    if (valueComponent.xtype == 'datefield') {
                        valueComponent.setValue(Ext.Date.parse(record.raw.Value, 'd.m.Y'));
                    }

                    if (valueComponent.inputMask) {
                        $.mask.definitions['А']='[АВЕКМНОРСТУХ]';
                        $('#' + valueComponent.getEl().select('input').elements[0].id).mask(valueComponent.inputMask);
                    }

                    var sys = B4.enums.SystemParameters, erc = B4.enums.ContractERCParameters;
                    var comissionParams = [sys.ExternalComissionType, sys.ExternalComissionPercent,
                    sys.ExternalComissionValue, sys.ExternalComissionNDS,
                    erc.ExternalComissionType, erc.ExternalComissionPercent,
                    erc.ExternalComissionValue, erc.ExternalComission];
                    if (comissionParams.includes(record.data.ParameterId)) {
                        B4.Ajax.request({
                            url: B4.Url.action('/CalculationMonth/GetCalculationMonth')
                        }).next(function (resp) {
                            var response = Ext.decode(resp.responseText);
                            if (!response.success) {
                                B4.QuickMsg.msg('Внимание', response.message, 'warning');
                                return;
                            }
                            var calcMonth = new Date(response.data.CalculationMonth);
                            form.down('[name=DateBegin]').minValue = calcMonth;
                        });
                    }
                }
            },
            getForm: function () {
                var asp = this;

                var editWindow = Ext.widget(asp.editFormSelector, {
                    name: me.name
                });

                var storePeriods = editWindow.down('parameterperiodsgrid').getStore();
                storePeriods.on({
                    beforeload: function (store, operation) {
                        operation.params = operation.params || {};
                        operation.params.parameterId = asp.controller.getContextValue(view, 'parameterId');
                        operation.params.objectId = asp.controller.getContextValue(view, 'objectId');
                        operation.params.dataBankId = asp.controller.getContextValue(view, 'dataBankId');
                    }
                });
                storePeriods.load();

                asp.fireEvent('windowcreated', asp, editWindow, view);

                //Пописка на события формы редактирования
                editWindow.on({
                    afterrender: { fn: asp.afterEditFormRendered, scope: asp }
                });

                editWindow.show();
                return editWindow;
            },
            afterEditFormRendered: function (form) {
                var asp = this;
                var store,
                    storenorm,
                    component,
                    rec = Ext.decode(me.controller.getContextValue(view, 'record')),
                    allowEdit = me.controller.getContextValue(view, 'allowEdit'),
                    valueList = rec.ValuesList,
                    normativesList = rec.NormativesList,
                    selectedNormative = rec.SelectedNormative,
                    selectedNormativeValue = rec.Value,
                    insertPosition = 3,
                    normCombobox;
                if (allowEdit) {
                    form.down('button[name=edit]').enable();
                } else {
                    B4.QuickMsg.msg(
                        'Внимание',
                        'Данный параметр изменять нельзя',
                        'warning'
                    );
                }

                if (rec.ParameterTypeNative === 'norm') {
                    component = Ext.create('B4.form.ComboBox', {
                        editable: false,
                        name: 'Value',
                        displayField: 'ValueName',
                        valueField: 'Value',
                        anchor: '100%',
                        url: '/Normatives/GetSpravParamValuesByNormative'
                    });
                    component.getStore().on(
                        'beforeload', function (store, operation) {
                            operation.params = operation.params || {};
                            operation.params.normativeId = normCombobox.getValue();
                            operation.params.parameterId = asp.controller.getContextValue(view, 'parameterId');
                        }
                    );
                    insertPosition = 4;

                    normCombobox = Ext.create('Ext.form.field.ComboBox', {
                        editable: false,
                        name: 'normCombobox',
                        fieldLabel: 'Норматив',
                        labelAlign: 'right',
                        displayField: 'ValueName',
                        valueField: 'Value',
                        disabled: true,
                        anchor: '100%',
                        listeners: {
                            change: function (field, newValue) {

                                if (field.up())
                                    field.up().down('combobox[name=Value]').getStore().load();

                            }
                        }
                    });
                    storenorm = Ext.create('Ext.data.Store', {
                        fields: ['Value', 'ValueName'],
                        data: normativesList,
                        anchor: '100%'
                    });
                    normCombobox.bindStore(storenorm);
                    normCombobox.setValue(selectedNormative);
                    form.insert(3, normCombobox);
                } else if (rec.ParameterTypeNative === 'sprav' || rec.ParameterTypeNative === 'bool') {
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
                        decimalPrecision: 10,
                        customFormat: '0,000.0000'
                    });
                } else if (rec.ParameterTypeNative === 'datetime') {
                    component = Ext.create('Ext.ux.form.DateTimeField', {
                        format: 'd.m.Y',
                        name: 'Value',
                        editable: false,
                        labelWidth: 100
                    });
                } else if (rec.ParameterTypeNative === 'date') {
                    component = Ext.create('Ext.form.field.Date', {
                        format: 'd.m.Y',
                        name: 'Value',
                        editable: false,
                        labelWidth: 100
                    });
                } else if (rec.ParameterTypeNative === 'int') {
                    component = Ext.create('Ext.form.field.Text', {
                        maskRe: /[0-9]/,
                        validator: function (val) {
                            if (parseInt(val) != val)
                                return (val + " не целое число. Вводимое значение должно быть целым числом!");
                            return true;
                        }
                    });
                } else if (rec.ParameterTypeNative === 'mask') {
                    component = Ext.create('Ext.form.field.Text', {
                        maxLength: 18,
                        emptyText: rec.Required,
                        regexText: 'Номер телефона должен быть в формате: ' + rec.Required,
                        inputMask: rec.Required
                    });
                }
                else if (rec.ParameterTypeNative === 'pict') {
                    component = Ext.create('B4.form.FileField', {
                            possibleFileExtensions: 'jpg,jpeg,png'
                    });
                }
                else {
                    component = Ext.create('Ext.form.field.Text', {
                        anchor: '100%'
                    });
                }

                Ext.apply(component, {
                    name: 'Value',
                    labelAlign: 'right',
                    allowBlank: false,
                    fieldLabel: 'Значение',
                    disabled: true
                });

                // добавление компонента на форму
                form.insert(insertPosition, component);
                component.isValid();

                component.on({
                    change: function (field, newValue) {
                        //выставить флаг запись редактировалась или снять  - при выборе "Не выбрано"
                        me.controller.setContextValue(view, 'recordEditedParameter', (field.hideTrigger || newValue != -1));
                    }
                });

                //Подписка на события формы редактирования
                form.on({
                    close: { fn: this.onClose, scope: this }
                });

                form.down('parameterperiodsgrid').on({
                    rowaction: { fn: this.onGridPeriodAction, scope: this }
                });

                form.down('button[name=deleteParameterValue]').on({
                    click: { fn: this.deleteParameterValue, scope: this }
                });

                form.down('button[name=saveValue]').on({
                    click: { fn: this.saveRequest, scope: this }
                });

                form.down('button[name=edit]').on({
                    click: { fn: this.onEditClick, scope: this }
                });

                //флаг запись не редактировалась
                me.controller.setContextValue(view, 'recordEditedParameter', false);

                //Скрываем дату по
                form.down('datefield[name=DateEnd]').setValue('');
                form.down('b4deletecolumn').hide();
            },

            editRecord: function (record) {
                var asp = this,
                    controller = asp.controller,
                    parameterId = record.get('ParameterId'),
                    objectId = record.get('ObjectId'),
                    model,
                    dataBankId = controller.getContextValue(view, 'dataBankId'),
                    parameterTableNumber = controller.getContextValue(view, 'parameterTableNumber'),
                    regId = controller.getContextValue(view, 'regId'),
                    personalAccountId = controller.getContextValue(view, 'personalAccountId'),
                    houseId = controller.getContextValue(view, 'houseId'),
                    serviceId = controller.getContextValue(view, 'serviceId'),
                    counterId = controller.getContextValue(view, 'counterId'),
                    objectIdMethod = controller.getContextValue(view, 'objectIdMethod'),
                    concreteParameters = me.controller.getContextValue(view, 'concreteParameters'),
                    showAllParameters = controller.getContextValue(view, 'showAllParameters'),
                    getFromDataBase = controller.getContextValue(view, 'getFromDataBase');

                if (!controller.getContextValue(view, 'objectId')) {
                    controller.setContextValue(view, 'objectId', objectId);
                }
                if (objectId == 0) {
                    objectId = controller.getContextValue(view, 'objectId');
                }

                if ((!objectId || objectId == 0) && (parameterTableNumber != 10 && parameterTableNumber != 5)) {
                    Ext.MessageBox.alert('Внимание', 'Полное редактирование параметра будет доступно после создания ПУ. Пока он не создан, указание значений параметров выполняется в самом списке нажатием на значение колонки "Новое значение".');
                    return;
                }

                model = this.getModel(record);

                view.getEl().mask('Загрузка...');

                parameterId ? model.load(parameterId, {
                    params: {
                        objectId: objectId,
                        parameterId: parameterId,
                        dataBankId: dataBankId,
                        parameterTableNumber: parameterTableNumber,
                        regId: regId,
                        personalAccountId: personalAccountId,
                        houseId: houseId,
                        serviceId: serviceId,
                        counterId: counterId,
                        objectIdMethod: objectIdMethod,
                        concreteParameters: concreteParameters,
                        showAllParameters: showAllParameters || !record.get('Value'),
                        getFromDataBase: getFromDataBase
                    },
                    success: function (rec) {
                        view.getEl().unmask();
                        asp.setFormData(rec);
                    },
                    error: function () {
                        B4.QuickMsg.msg('Внимание', 'При выполнении операции произошла ошибка', 'warning');
                        view.getEl().unmask();
                    },
                    scope: this
                }) : this.setFormData(new model({ Id: 0 }));
            },
            closeWindowHandler: function (button) {
                view.getStore().reload();
            },
            rowDblClick: function (curView, record) {
                //#sadButTrue при открытии нескольких аспектов, этот метод загоняется, приходится регистрировать свой слушатель далее по коду
                return false;
            },

            saveRequest: function (component) {
                var me = this;
                var rec, from = component.up('window');
                if (this.fireEvent('beforesaverequest', this) !== false) {
                    from.getForm().updateRecord();
                    rec = this.getRecordBeforeSave(from.getRecord());

                    this.fireEvent('getdata', this, rec);

                    if (from.getForm().isValid()) {
                        if (this.fireEvent('validate', this)) {
                            if (this.controller.getContextValue(component.up('parameterwindow'), 'showWarning') && (rec.data.ParameterId == 7 || rec.data.ParameterId == 463)) {
                                Ext.Msg.confirm('Предупреждение', 'Проверьте корректность ввода нормативов в параметрах ' +
                                    '\"Водоснабжение\" и \"Обеспечение водой ЛС для горячей воды\".\nПродолжить сохранение?',
                                    function (result) {
                                        if (result == 'yes') {
                                            me.saveRecord(rec, from);
                                        }
                                    });
                            }
                            else {
                                this.saveRecord(rec, from);
                            }
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
            },

            saveRecord: function (rec, frm) {
                var asp = this,
                    dataBankId = asp.controller.getContextValue(view, 'dataBankId'),
                    objectId = asp.controller.getContextValue(view, 'objectId'),
                    parameterTableNumber = asp.controller.getContextValue(view, 'parameterTableNumber'),
                    regId = asp.controller.getContextValue(view, 'regId'),
                    dateBegin = frm.down('datefield[name=DateBegin]').getValue(),
                    dateEnd = frm.down('datefield[name=DateEnd]').getValue(),
                    value = undefined;

                //получение удаленных записей
                var recordEdited = asp.controller.getContextValue(view, 'recordEditedParameter');

                if (!recordEdited) {
                    asp.unmask();
                    asp.updateGrid();
                    frm.close();
                    view.getStore().load();
                    return;
                }

                if (dateBegin && dateEnd && dateBegin > dateEnd) {
                    B4.QuickMsg.msg('Внимание', 'Дата начала периода действия параметра не может быть больше даты окончания периода действия параметра', 'warning');
                    return;
                }

                if (rec.get('Value') != undefined) {
                    if (rec.raw.ParameterTypeNative === 'date') {
                        value = rec.get('Value');
                    } else {
                        value = rec.get('Value');
                    }
                } else {
                    value = frm.down('[name=Value]').getRawValue();
                }

                if (value == null || Ext.isString(value) && value.trim() == '') {
                    B4.QuickMsg.msg('Внимание', 'Для сохранения параметра укажите сохраняемое значение', 'warning');
                    return;
                }

                frm.getEl().mask('Сохранение...');

                frm.submit(
                    {
                        url: B4.Url.action('/Parameter/Update'),
                        timeout: 1000000,
                        params: {
                            id: rec.getId(),
                            DateBegin: dateBegin,
                            DateEnd: dateEnd,
                            dataBankId: dataBankId,
                            parameterTableNumber: parameterTableNumber,
                            isDayUchet: rec.get('IsDay'),
                            regId: regId,
                            Value: value,
                            objectId: objectId
                        },
                        success: function (form, action) {
                        if (action.result.success) {
                            if (action.result.message != '') {
                                B4.QuickMsg.msg('Внимание', action.result.message, 'warninig');
                            }
                            B4.QuickMsg.msg('Выполнено', 'Параметр успешно сохранен', 'success');
                            //Обновляем данные из БД
                            me.controller.setContextValue(view, 'getFromDataBase', true);
                            view.getStore().load();
                            frm.close();
                        } else {
                            if (action.result.message != '') {
                                B4.QuickMsg.msg('Внимание', action.result.message, 'warninig');
                            }
                            B4.QuickMsg.msg('Внимание', 'При выполнении операции произошла ошибка', 'warninig');
                            frm.getEl().unmask();
                        }
                        //frm.down('parameterperiodsgrid').getStore().load();
                        },
                        failure: function (form, action) {
                            frm.getEl().unmask();
                            B4.QuickMsg.msg('Внимание', action.result && action.result.message ? action.result.message : 'При выполнении операции произошла ошибка', 'warning');
                        }
                    });
            },

            //удаление периода действия параметра
            onGridPeriodAction: function (curGrid, action, record) {
                if (action == 'delete') {
                    var asp = this,
                        dateBegin = record.get('DateBegin'),
                        dateEnd = record.get('DateEnd'),
                        win = curGrid.up('window'),
                        dataBankId = asp.controller.getContextValue(view, 'dataBankId'),
                        parameterId = asp.controller.getContextValue(view, 'parameterId'),
                        objectId = asp.controller.getContextValue(view, 'objectId');

                    Ext.Msg.confirm('Удаление', 'Вы действительно хотите удалить значение параметра ' +
                        (dateBegin && dateEnd ? 'за период' : '') +
                        (dateBegin ? ' c ' + Ext.Date.format(new Date(dateBegin), 'd.m.Y') : '') +
                        (dateEnd ? ' по ' + Ext.Date.format(new Date(dateEnd), 'd.m.Y') : '') + '?',
                        function (result) {
                            if (result == 'yes') {
                                asp.deleteParameter(win, parameterId, dataBankId, objectId, dateBegin, dateEnd);
                            }
                        });
                }

                if (action == 'doubleclick') {
                    if (record.get('ParameterTypeNative') != 'pict')
                        return;

                    var pictWin = Ext.widget('pictparameterwindow');

                    pictWin.on('beforerender', function () {
                        B4.Ajax.request({
                            url: B4.Url.action('GetPictParamValue', 'Parameter'),
                            params: {
                                id: record.getId(),
                                parameterTableNumber: record.get('TableNumber'),
                                pref: record.get('Pref')
                            }
                        }).next(function (resp) {
                            var pict = resp.responseText.substring(1, resp.responseText.length - 1);
                            pictWin.down('image[name=PictParamValue]').setSrc("data:image/png;base64," + pict);
                        });
                    });
                    
                    pictWin.show();
                }
            },

            deleteParameterValue: function (button) {
                var asp = this,
                    contr = this.controller,
                    win = button.up('window'),
                    dateBegin = win.down('datefield[name=DateBegin]').getValue(),
                    dateEnd = win.down('datefield[name=DateEnd]').getValue(),
                    dataBankId = contr.getContextValue(view, 'dataBankId'),
                    parameterId = contr.getContextValue(view, 'parameterId'),
                    objectId = contr.getContextValue(view, 'objectId');

                if (!dateBegin) {
                    Ext.Msg.alert('Ошибка!', 'Для удаления значения необходимо выбрать период действия параметра.');
                    return;
                }

                Ext.Msg.confirm('Удаление', 'Вы действительно хотите удалить значение параметра ' +
                    (dateBegin && dateEnd ? 'за период' : '') +
                    ' c ' + Ext.Date.format(new Date(dateBegin), 'd.m.Y') +
                    (dateEnd ? ' по ' + Ext.Date.format(new Date(dateEnd), 'd.m.Y') : '') + '?',
                    function (result) {
                        if (result == 'yes') {
                            asp.deleteParameter(win, parameterId, dataBankId, objectId, dateBegin, dateEnd);
                        }
                    });
            },

            //Удалить параметр
            deleteParameter: function (win, id, dataBankId, objectId, dateBegin, dateEnd) {
                win.getEl().mask('Удаление');
                B4.Ajax.request({
                    url: B4.Url.action('DeleteParametersPeriods', 'Parameter'),
                    method: 'POST',
                    params: {
                        id: id,
                        dataBankId: dataBankId,
                        objectId: objectId,
                        deletedRecords: Ext.encode([{ DateBegin: dateBegin, DateEnd: dateEnd }])
                    }
                }).next(function (response) {
                    var result = Ext.decode(response.responseText);
                    if (result.success) {
                        win.close();
                        if (result.message != '') {
                            B4.QuickMsg.msg('Внимание', result.message, 'warninig');
                        }
                        //Удаляем данные из БД
                        me.controller.setContextValue(view, 'getFromDataBase', true);
                        view.getStore().load();
                    } else {
                        B4.QuickMsg.msg('Ошибка',
                            !Ext.isString(result.message) ? 'При выполнении операции произошла ошибка!' : result.message,
                            'warning');
                        win.getEl().unmask();
                    }                  
                }).error(function (response) {
                    Ext.Msg.alert('Ошибка!', !Ext.isString(response.message) ? 'При удалении значения параметра произошла ошибка!' : response.message);
                    win.getEl().unmask();
                });
            },

            onEditClick: function (button) {
                var editView = button.up('window'),

                    periodsStore = editView.down('parameterperiodsgrid').getStore(),
                    rec = editView.getRecord(),

                    objectId = me.controller.getContextValue(editView, 'objectId'),
                    dataBankId = me.controller.getContextValue(editView, 'dataBankId'),

                    dateBeginField = editView.down('datefield[name=DateBegin]'),
                    dateEndField = editView.down('datefield[name=DateEnd]'),
                    valueField = editView.down('[name=Value]'),
                    normativeField = editView.down('[name=normCombobox]');

                editView.getEl().mask('Загрузка...');

                //Блокируем записи
                B4.Ajax.request({
                    url: B4.Url.action('ChangeBlock', 'Parameter'),
                    params: {
                        id: rec.getId(),
                        dataBankId: rec.get('DataBank') || dataBankId,
                        objectId: objectId,
                        parameterTableNumber: rec.get('TableNumber'),
                        block: true
                    }
                }).next(function (resp) {
                    editView.getEl().unmask();
                    var response = Ext.decode(resp.responseText);

                    if (!response.success) {
                        B4.QuickMsg.msg('Внимание', response.message, 'warning');
                        return;
                    }

                    periodsStore.load();

                    editView.down('button[name=edit]').disable();
                    editView.down('button[name=saveValue]').enable();
                    editView.down('button[name=deleteParameterValue]').enable();
                    editView.down('b4deletecolumn').show();

                    dateEndField.setValue();
                    valueField.setValue();

                    dateBeginField.enable();
                    dateEndField.enable();
                    valueField.enable();
                    if (normativeField) normativeField.enable();
                });
            },

            onClose: function (editView) {
                var rec = editView.getRecord(),
                    objectId = me.controller.getContextValue(editView, 'objectId'),
                    dataBankId = me.controller.getContextValue(editView, 'dataBankId');

                //Снимаем блокировку
                B4.Ajax.request({
                    url: B4.Url.action('ChangeBlock', 'Parameter'),
                    params: {
                        id: rec.getId(),
                        dataBankId: rec.get('DataBank') || dataBankId,
                        objectId: objectId,
                        parameterTableNumber: rec.get('TableNumber'),
                        block: false
                    }
                });
            }
        });

        periodsAsp.init(me.controller);
        me.controller.aspects.push(periodsAsp);

        //Подписка на события
        view.on({
            itemdblclick: function (curGrid, record) {
                var contr = me.controller;
                contr.setContextValue(view, 'source', record.get('TableNumber'));
                contr.setContextValue(view, 'parameterId', record.get('Id'));
                contr.setContextValue(view, 'record', Ext.encode(record.raw));
                contr.setContextValue(view, 'allowEdit', record.get('AllowEdit') && !view.checkParameterTableDenial(record));
                periodsAsp.editRecord(record);
            },
            rowaction: function (curGrid, action, record) {
                if (action == 'edit') {
                    me.controller.setContextValue(view, 'parameterId', record.get('Id'));
                    me.controller.setContextValue(view, 'record', Ext.encode(record.raw));
                    me.controller.setContextValue(view, 'allowEdit', record.get('AllowEdit') && !view.checkParameterTableDenial(record));
                    periodsAsp.editRecord(record);
                    return false;
                }
            },
            show: function () {
                me.controller.setContextValue(view, 'getFromDataBase', true);
            }
        });

        if (view.down('button[name=saveParameterList]')) {
            view.down('button[name=saveParameterList]').on({
                click: function (button) {
                    me.onSaveParameterList(button);
                }
            });
        }
        if (view.down('button[name=refreshParameters]')) {
            view.down('button[name=refreshParameters]').on({
                click: function (button) {
                    view.getStore().load();
                }
            });
        }
        //чекбокс на отображение всех параметров
        if (view.down('checkbox[name=showAllParameters]')) {
            view.down('checkbox[name=showAllParameters]').on({
                change: function (checkbox) {
                    me.changeShowAllCheckBox(checkbox);
                }
            });
        }
        if (view.down('b4calcmonthpicker[name=chargeDate]')) {
            view.down('b4calcmonthpicker[name=chargeDate]').on({
                focus: function (cmp) {
                    cmp.flagChange = true;
                },
                change: function (cmp) {
                    if (cmp.flagChange)
                        me.changeCalcMonth(cmp);
                }
            });
        }
    },

    changeShowAllCheckBox: function (checkbox) {
        var view = checkbox.up('parameterlist'),
            paramsStore = view.getStore();

        this.controller.setContextValue(view, 'showAllParameters', checkbox.getValue());
        paramsStore.load();
    },

    changeCalcMonth: function (dtpicker) {
        var me = this,
            view = dtpicker.up('parameterlist'),
            paramsStore = view.getStore();

        this.controller.setContextValue(view, 'chargeDate', dtpicker.getValue());
        paramsStore.load();
    },

    saveParameterList: function (component) {
        var me = this,
            view = component.up('parameterlist'),
            editedRecords = view.getStore().getUpdatedRecords(),
            hideWarnings = me.controller.getContextValue(view, 'hideWarnings'),
            parameterList = [],
            record,
            newValue;

        if (!me.fireEvent('beforeSave', me, editedRecords)) {
            return;
        }

        if (editedRecords.length == 0 && !hideWarnings) {
            //B4.QuickMsg.msg(
            //    'Внимание',
            //    'Введите значения',
            //    'warning'
            //);
            return;
        }

        //заполняем список с измененными параметрами
        for (var i in editedRecords) {
            record = editedRecords[i];
            if (record.data.Value !== record.data.NewValue) {
                if (record.get('ParameterTypeNative') == 'date') {
                    newValue = Ext.Date.format(new Date(record.get('NewValue')), 'd.m.Y');
                } else {
                    newValue = record.get('NewValue');
                }

                if (newValue == undefined || Ext.isString(newValue) && newValue.trim() == '') {
                    B4.QuickMsg.msg('Внимание', 'Для сохранения параметра укажите сохраняемое значение', 'warning');
                    return;
                }

                parameterList.push({
                    objectId: (record.get('ObjectId') ? record.get('ObjectId') : me.controller.getContextValue(view, 'objectId')) + '',
                    parameterId: record.get('ParameterId') + '',
                    value: newValue + '',
                    parameterTableNumber: record.get('TableNumber')
                });
            }
        }

        if (parameterList.length == 0) {
            if (!hideWarnings)
                B4.QuickMsg.msg(
                    'Внимание',
                    'Введите значения, отличающиеся от текущих',
                    'warning'
                );

        } else {
            view.getEl().mask('Сохранение...');
            Ext.Ajax.request({
                url: 'Parameter/SaveParameterList',
                params: {
                    dataBankId: me.controller.getContextValue(view, 'dataBankId'),
                    parameterList: Ext.encode([parameterList])
                },

                success: function (resp) {
                    var viewEl = view.getEl();
                    if (viewEl) {
                        viewEl.unmask();
                    }
                    var response = Ext.decode(resp.responseText);
                    if (!response.success) {
                        B4.QuickMsg.msg('Внимание', response.message, 'warning');
                    }

                    if (view.isVisible()) {
                        //Удаляем данные из БД
                        me.controller.setContextValue(view, 'getFromDataBase', true);
                        view.getStore().load();
                    }
                },

                failure: function () {
                    view.getEl().unmask();
                    B4.QuickMsg.msg('Внимание', 'Во время выполнения операции произошла ошибка', 'warning');
                }
            });
        }
    },

    //Сохранение списка параметров
    onSaveParameterList: function (button) {
        this.saveParameterList(button);
    }
});