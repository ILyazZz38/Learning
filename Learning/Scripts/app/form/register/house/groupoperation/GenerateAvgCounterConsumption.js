Ext.define('B4.form.register.house.groupoperation.GenerateAvgCounterConsumption', {
    extend: 'B4.form.Window',

    requires: [
        'B4.ux.form.InfoPanel',
        'B4.enums.Region'
    ],

    modal: true,
    width: 620,
    layout: {
        type: 'hbox',
        align: 'stretch'
    },

    kind: undefined,
    houses: [],
    showDisablePeriodsCheckbox: false,

    initComponent: function () {
        var me = this,
            servicesStore = Ext.create('B4.store.dict.service.AvgServiceConsumptionGenerationServices');

        Ext.apply(me,
            {
                title: 'Настройка генерации среднего расхода по ' + (me.kind == 'odpu' ? 'ОДПУ' : 'ГРПУ'),
                alias: 'widget.generateavgcounterconsumptionwindow',
                defaults: {
                    margin: 5
                },
                items: [
                    {
                        xtype: 'gridpanel',
                        title: 'Услуги',
                        name: 'Services',
                        width: 200,
                        store: servicesStore,
                        selModel: Ext.create('Ext.selection.CheckboxModel',
                            {
                                listeners: {
                                    'select': {
                                        fn: me.onSelect,
                                        scope: me
                                    },
                                    'deselect': {
                                        fn: me.onDeselect,
                                        scope: me
                                    }
                                }
                            }),
                        columns: [
                            {
                                dataIndex: 'Name',
                                sortable: false,
                                flex: 1
                            }
                        ]
                    },
                    {
                        xtype: 'fieldset',
                        title: 'Настройка расчета среднего расхода',
                        padding: 2,
                        flex: 1,
                        layout: {
                            type: 'vbox',
                            align: 'stretch'
                        },
                        defaults: {
                            margin: '0 5 5 5'
                        },
                        items: [
                            {
                                xtype: 'fieldset',
                                title: 'Прошлый период для расчета среднего значения',
                                margin: 5,
                                padding: 2,
                                layout: {
                                    type: 'hbox',
                                    align: 'stretch'
                                },
                                defaults: {
                                    margin: '0 5 5 5'
                                },
                                items: [
                                    {
                                        xtype: 'datefield',
                                        name: 'PreviousPeriodBegin',
                                        width: 150,
                                        labelWidth: 50,
                                        fieldLabel: 'Начало'
                                    },
                                    {
                                        xtype: 'tbfill'
                                    },
                                    {
                                        xtype: 'datefield',
                                        name: 'PreviousPeriodEnd',
                                        width: 170,
                                        labelWidth: 70,
                                        fieldLabel: 'Окончание'
                                    }
                                ]
                            },
                            {
                                xtype: 'fieldset',
                                title: 'Текущий период для установки рассчитанного среднего значения',
                                margin: 5,
                                padding: 2,
                                layout: {
                                    type: 'hbox',
                                    align: 'stretch'
                                },
                                defaults: {
                                    margin: '0 5 5 5'
                                },
                                items: [
                                    {
                                        xtype: 'datefield',
                                        name: 'CurrentPeriodBegin',
                                        width: 150,
                                        labelWidth: 50,
                                        fieldLabel: 'Начало'
                                    },
                                    {
                                        xtype: 'tbfill'
                                    },
                                    {
                                        xtype: 'datefield',
                                        name: 'CurrentPeriodEnd',
                                        width: 170,
                                        labelWidth: 70,
                                        fieldLabel: 'Окончание'
                                    }
                                ]
                            },
                            {
                                xtype: 'label',
                                name: 'Info'
                            },
                            {
                                xtype: 'checkbox',
                                name: 'GenerateBy354',
                                boxLabel: 'Генерировать по правилам Постановления №354',
                                listeners: {
                                    'change': {
                                        fn: me.onGenerateBy354Changed,
                                        scope: me
                                    }
                                }
                            },
                            {
                                xtype: 'checkbox',
                                name: 'DisableHeatingPeriods',
                                hidden: !me.showDisablePeriodsCheckbox,
                                boxLabel: 'Генерировать без учета отопительных периодов',
                                listeners: {
                                    'change': {
                                        fn: me.onDisableHeatingPeriods,
                                        scope: me
                                    }
                                }
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
                                        text: 'Рассчитать',
                                        iconCls: 'icon-accept',
                                        listeners: {
                                            'click': {
                                                fn: me.onSave,
                                                scope: me
                                            }
                                        }
                                    }
                                ]
                            },
                            {
                                xtype: 'tbfill'
                            },
                            {
                                xtype: 'buttongroup',
                                items: [
                                    {
                                        xtype: 'b4closebutton',
                                        handler: function () {
                                            this.up('window').close();
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ],
                listeners: {
                    'afterrender': me.onLoad
                }
            });

        me.callParent(arguments);
    },

    onLoad: function (view) {
        var viewEl = view.getEl();
        viewEl.mask('Загрузка...');

        //Достаем периоды отопления
        B4.Ajax.request({
            url: B4.Url.action('/HeatingPeriods/GetHeatingPeriodsForAvgCounterConsumptionGeneration'),
            params: {
                houses: Ext.encode(view.houses)
            }
        }).next(function (resp) {
            viewEl.unmask();
            var response = Ext.decode(resp.responseText),
                infoPanel = view.down('label[name=Info]'),
                infoText = 'Для услуги Отопление "прошлый период" ';

            view.calcMonth = new Date(response.data.calcMonth);
            
            if (response.data) {
                if (response.data.multipleHeatingPeriodsFound) {
                    Ext.MessageBox.alert('Внимание', 'Для выбранных домов обнаружены несколько отопительных периодов. Из них выбран первый по порядку');
                }

                //Если есть отопительный период
                if (response.data.curPeriodBegin) {
                    view.currentHeatingPeriodBegin = response.data.curPeriodBegin;
                    view.currentHeatingPeriodEnd = response.data.curPeriodEnd;
                }

                if (response.data.prevPeriodBegin) {
                    view.previousHeatingPeriodBegin = response.data.prevPeriodBegin;
                    view.previousHeatingPeriodEnd = response.data.prevPeriodEnd;

                    infoText += Ext.Date.format(new Date(response.data.prevPeriodBegin), 'd.m.Y') +
                        ' - ' + Ext.Date.format(new Date(response.data.prevPeriodEnd), 'd.m.Y');
                } else {
                    infoText += 'в полях "Прошлый период для расчета среднего значения" необходимо указывать прошлый отопительный период.';
                }
            }

            infoPanel.setText(infoText);

            view.setDefaultPeriods(view);
        }).error(function () {
            viewEl.unmask();
            B4.QuickMsg.warning('При определении периодов отопления произошла ошибка');
        });
    },

    onSelect: function (selModel, record) {
        var view = this;

        var previousPeriodBegin = view.down('datefield[name=PreviousPeriodBegin]'),
            previousPeriodEnd = view.down('datefield[name=PreviousPeriodEnd]'),
            currentPeriodBegin = view.down('datefield[name=CurrentPeriodBegin]'),
            currentPeriodEnd = view.down('datefield[name=CurrentPeriodEnd]');

        //Если отопление
        if (record.get('Id') == 8) {
            B4.Ajax.request({
                url: B4.Url.action('/Admin/GetRegionCode')
            }).next(function (resp) {
                var response = Ext.decode(resp.responseText);
                //Для Сахи
                if (response.code == B4.enums.Region.Sakha) {
                    view.saha = true;
                    previousPeriodBegin.setValue(new Date(view.calcMonth.getFullYear() - 1, 0, 1));
                    previousPeriodEnd.setValue(new Date(view.calcMonth.getFullYear(), 0, 1));
                    currentPeriodBegin.setValue(view.calcMonth);
                    currentPeriodEnd.setValue(new Date(view.calcMonth.getFullYear(), view.calcMonth.getMonth() + 1, 1));
                }
                else {
                    previousPeriodBegin.setValue(view.previousHeatingPeriodBegin);
                    previousPeriodEnd.setValue(view.previousHeatingPeriodEnd);
                    currentPeriodBegin.setValue(view.currentHeatingPeriodBegin);
                    currentPeriodEnd.setValue(view.currentHeatingPeriodEnd);
                }
            }).error(function (resp) {
                B4.QuickMsg.warning('Ошибка выполнения операции');
            });
        }
    },

    onDisableHeatingPeriods: function (cmp, value) {
        if (value)
        {
            var previousPeriodBegin = this.down('datefield[name=PreviousPeriodBegin]'),
                previousPeriodEnd = this.down('datefield[name=PreviousPeriodEnd]'),
                currentPeriodBegin = this.down('datefield[name=CurrentPeriodBegin]'),
                currentPeriodEnd = this.down('datefield[name=CurrentPeriodEnd]');

            //Если отопление
            if (this.saha) {
                previousPeriodBegin.setValue(new Date(this.calcMonth.getFullYear() - 1, 0, 1));
                previousPeriodEnd.setValue(new Date(this.calcMonth.getFullYear(), 0, 1));
                currentPeriodBegin.setValue(new Date(this.calcMonth.getFullYear(), 0, 1));
                currentPeriodEnd.setValue(new Date(this.calcMonth.getFullYear() + 1, 0, 1));
            }
            else {
                this.setDefaultPeriods(this);
                currentPeriodBegin.setValue(new Date(this.calcMonth.getFullYear(), 0, 1));
                currentPeriodEnd.setValue(new Date(this.calcMonth.getFullYear(), this.calcMonth.getMonth() + 1, 0));
                previousPeriodBegin.setValue(new Date(this.calcMonth.getFullYear() - 1, 1, 1));
                previousPeriodEnd.setValue(new Date(this.calcMonth.getFullYear() - 1, 11, 31));
            }
        }
    },

    onDeselect: function (selModel, record) {
        //Если отопление
        if (record.get('Id') == 8) {
            this.setDefaultPeriods(this);
        }
    },

    setDefaultPeriods: function (view) {
        var previousPeriodBegin = view.down('datefield[name=PreviousPeriodBegin]'),
            previousPeriodEnd = view.down('datefield[name=PreviousPeriodEnd]'),
            currentPeriodBegin = view.down('datefield[name=CurrentPeriodBegin]'),
            currentPeriodEnd = view.down('datefield[name=CurrentPeriodEnd]');

        previousPeriodBegin.setValue(new Date(view.calcMonth.getFullYear(), 0, 1));
        previousPeriodEnd.setValue(new Date(view.calcMonth.getFullYear(), view.calcMonth.getMonth(), 1));

        var currentCalcMonthBegin = new Date(view.calcMonth.getFullYear(), view.calcMonth.getMonth(), 1);

        currentPeriodBegin.setValue(currentCalcMonthBegin);

        currentCalcMonthBegin.setMonth(view.calcMonth.getMonth() + 1);
        currentCalcMonthBegin.setDate(0);

        currentPeriodEnd.setValue(currentCalcMonthBegin);
    },

    onGenerateBy354Changed: function (cmp, value) {
        var previousPeriodBegin = this.down('datefield[name=PreviousPeriodBegin]'),
            previousPeriodEnd = this.down('datefield[name=PreviousPeriodEnd]'),
            currentPeriodBegin = this.down('datefield[name=CurrentPeriodBegin]'),
            currentPeriodEnd = this.down('datefield[name=CurrentPeriodEnd]'),
            disableHeatingPeriods = this.down('checkbox[name=DisableHeatingPeriods]');

        previousPeriodBegin.allowBlank = !value;
        previousPeriodEnd.allowBlank = !value;
        currentPeriodBegin.allowBlank = !value;
        currentPeriodEnd.allowBlank = !value;
        disableHeatingPeriods.allowBlank = !value;

        this.getForm().isValid();

        previousPeriodBegin.setDisabled(value);
        previousPeriodEnd.setDisabled(value);
        currentPeriodBegin.setDisabled(value);
        currentPeriodEnd.setDisabled(value);
        disableHeatingPeriods.setDisabled(value);
        var currentCalcMonthBegin = new Date(this.calcMonth.getFullYear(), this.calcMonth.getMonth(), 1);

        currentPeriodBegin.setValue(currentCalcMonthBegin);

        currentCalcMonthBegin.setMonth(this.calcMonth.getMonth() + 1);
        currentCalcMonthBegin.setDate(0);

        currentPeriodEnd.setValue(currentCalcMonthBegin);
    },

    onSave: function () {
        var me = this,
            services = this.down('gridpanel[name=Services]').getSelectionModel().getSelection(),
            valueGenerateBy354 = this.down('checkbox[name=GenerateBy354]').getValue(),
            disableHeatingPeriods = this.down('checkbox[name=DisableHeatingPeriods]').getValue(),
            form = this.getForm(),
            values = form.getValues(),
            viewEl = this.getEl(),
            previousPeriodBegin = values.PreviousPeriodBegin ? new Date(values.PreviousPeriodBegin.replace(/(\d+).(\d+).(\d+)/, '$3/$2/$1')) : null,
            previousPeriodEnd = values.PreviousPeriodEnd ? new Date(values.PreviousPeriodEnd.replace(/(\d+).(\d+).(\d+)/, '$3/$2/$1')) : null,
            currentPeriodBegin = values.CurrentPeriodBegin ? new Date(values.CurrentPeriodBegin.replace(/(\d+).(\d+).(\d+)/, '$3/$2/$1')) : null,
            currentPeriodEnd = values.CurrentPeriodEnd ? new Date(values.CurrentPeriodEnd.replace(/(\d+).(\d+).(\d+)/, '$3/$2/$1')) : null;

        if (!services.length) {
            B4.QuickMsg.warning('Необходимо выбрать услуги');
            return;
        }

        if (!form.isValid()) {
            B4.QuickMsg.warning('Не все поля корректно заполнены');
            return;
        }

        if (values.PreviousPeriodBegin && values.PreviousPeriodEnd && previousPeriodBegin > previousPeriodEnd) {
            B4.QuickMsg.warning('Дата окончания прошлого периода должна быть больше или равна дате начала');
            return;
        }

        if (values.CurrentPeriodBegin && values.CurrentPeriodEnd && currentPeriodBegin > currentPeriodEnd) {
            B4.QuickMsg.warning('Дата окончания текущего периода должна быть больше или равна дате начала');
            return;
        }

        if (values.PreviousPeriodEnd && values.CurrentPeriodBegin && previousPeriodEnd > currentPeriodBegin) {
            B4.QuickMsg.warning('Дата начала текущего периода должна быть больше или равна дате окончания прошлого периода');
            return;
        }

        Ext.MessageBox.confirm('Внимание', 'Вы уверены, что хотите сгенерировать средний расход по приборам учета?', function (ans) {
            if (ans == 'yes') {
                viewEl.mask('Генерация...');
                B4.Ajax.request({
                    url: B4.Url.action('/Counter/CalcAvgCounterConsumption'),
                    params: {
                        personalAccounts: Ext.encode(me.houses),
                        kindId: me.kind,
                        generateBy354: valueGenerateBy354,
                        disableHeatingPeriods: disableHeatingPeriods,
                        previousPeriodBegin: values.PreviousPeriodBegin,
                        previousPeriodEnd: values.PreviousPeriodEnd,
                        currentPeriodBegin: values.CurrentPeriodBegin,
                        currentPeriodEnd: values.CurrentPeriodEnd,
                        services: Ext.encode(services.map(function (x) { return x.get('Id'); }))
                    }
                }).next(function (resp) {
                    viewEl.unmask();
                    var response = Ext.decode(resp.responseText);
                    if (!response.Data.success) {
                        B4.QuickMsg.warning(response.Data.message);
                        return;
                    }
                    B4.QuickMsg.success('Средний расход успешно сгенерирован');
                    me.close();
                }).error(function () {
                    viewEl.unmask();
                    B4.QuickMsg.warning('При генерации среднего расхода произошла ошибка');
                });
            }
        });
    }
});