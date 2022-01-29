Ext.define('B4.form.register.personalaccount.groupoperation.ManagementOrganizationScopeChange',
{
    extend: 'B4.form.Window',

    mixins: ['B4.mixins.window.ModalMask'],
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    height: 600,
    width: 1000,
    alias: 'widget.grouphousechangemagementorganizationwindow',
    title: 'Смена управляющей компании (УК) / договоров',
    bodyPadding: 5,

    //количество выбранных ЛС
    countPersonalAccount: undefined,
    dataBankNamesList: undefined,
    dataBankId: undefined,
    nameAspect: undefined,
    selectedPersonalAccountList: undefined,
    application: undefined,

    requires: [
        'B4.ux.button.Close',
        'B4.ux.button.Save',
        'B4.ux.grid.column.Delete',
        'B4.plugin.InputOnlyDisabler',
        'B4.form.ComboBox',
        'B4.form.SelectField',
        'B4.store.finance.ManagementOrganizationFin',
        'B4.store.finance.HousingDepartmentFin',
        'B4.store.finance.CountyFin',
        'B4.store.finance.QuarterFin',
        'Ext.ux.CheckColumn',
        'B4.form.SelectFieldContracts'
    ],

    plugins: [
        {
            ptype: 'inputonlydisabler'
        }
    ],
    counter: 0,
    listeners: {
        afterrender: function(view) {
            var dateBegin = view.down('[name=StartDate]'),
                dateCalc = view.down('[name=ChargeDate]');
            view.getEl().mask("Загрузка" + '...');
            B4.Ajax.request({
                url: B4.Url.action('/CalculationMonth/GetCalculationMonth')
            }).next(function(resp) {
                var response = Ext.decode(resp.responseText);
                //Устанавливаем в окончание периода текущий расчетный месяц
                if (dateBegin.getValue() == null)
                    dateBegin.setValue(response.data.CalculationMonth);
                dateCalc.setValue(response.data.CalculationMonth);

            });
        }
    },
    save: function (button) {
        var me = this,
            view = button.up('window'),
            mo = view.down('b4selectfield[name=MoList]');

        if (mo.getValue() == null) {
            B4.QuickMsg.msg(
                'Внимание',
                'Выберите управляющую организацию!',
                'warning',
                10000);
            return;
        }

        Ext.Msg.confirm('Вы уверены?',
            'Вы действительно хотите выполнить операцию "Смены УК"?',
            function(result) {

                if (result == 'yes') {

                    view.getEl().mask("Смена УК выполняется. Подождите, пожалуйста" + '...');
                    B4.Ajax.request({
                        url: B4.Url.action('/HouseChangeManagementOrganization/ChangeManegementOrganization'),
                        method: 'POST',
                        timeout: 9999999,
                        params: {
                            DateBegin: view.down('[name=StartDate]').getValue(),
                            ManagementOrganizationId: mo.getValue()
                        }
                    }).next(function(jsonResp) {
                        var response = Ext.decode(jsonResp.responseText);
                        view.getEl().unmask();
                        B4.QuickMsg.msg(
                            response.success ? 'Выполнено' : 'Внимание',
                            response.success ? 'Перенос УК выполнен успешно!' : response.message,
                            response.success ? 'success' : 'warning',
                            10000);
                        if (response.success) view.loadChangeManagement(view);

                    }).error(function(response) {
                        view.getEl().unmask();
                        Ext.Msg.alert('Ошибка!',
                            !Ext.isString(response.message)
                            ? 'При выполнении операции произошла ошибка!'
                            : response.message);
                    });
                }
            },
            me);

    },

    saveSupplier: function (button) {
        var me = this,
            view = button.up('window'),
            mo = view.down('b4selectfield[name=MoList]');
        
        Ext.Msg.confirm('Вы уверены?',
            'Вы действительно хотите выполнить операцию "Смены договоров"?',
            function (result) {

                if (result == 'yes') {

                    view.getEl().mask("Смена УК / договора выполняется. Подождите, пожалуйста" + '...');
                    B4.Ajax.request({
                        url: B4.Url.action('/HouseChangeManagementOrganization/ChangeManegementOrganization'),
                        method: 'POST',
                        timeout: 9999999,
                        params: {
                            DateBegin: view.down('[name=StartDate]').getValue(),
                            ManagementOrganizationId: mo.getValue(),
                            onlyChangeSupplier: true
                        }
                    }).next(function (jsonResp) {
                        var response = Ext.decode(jsonResp.responseText);
                        view.getEl().unmask();
                        B4.QuickMsg.msg(
                            response.success ? 'Выполнено' : 'Внимание',
                            response.success ? 'Смена договоров выполнена успешно!' : response.message,
                            response.success ? 'success' : 'warning',
                            10000);
                        if (response.success) view.loadChangeManagement(view);

                    }).error(function (response) {
                        view.getEl().unmask();
                        Ext.Msg.alert('Ошибка!',
                            !Ext.isString(response.message)
                                ? 'При выполнении операции произошла ошибка!'
                                : response.message);
                    });
                }
            },
            me);

    },

    loadChangeManagement: function(view, notReloadMo) {
        var me = this,
            houseList = Ext.encode(view.selectedPersonalAccountList),
            dateBegin = view.down('[name=StartDate]');
        view.getEl().mask("Загрузка" + '...');
        B4.Ajax.request({
            url: B4.Url.action('/HouseChangeManagementOrganization/SaveChangeUserCash'),
            params: {
                HouseList: houseList,
                DateBegin: dateBegin.getValue()
            },
            timeout: 9999999
        }).next(function() {
            view.down('gridpanel[name=ContractGrid]').getStore().on({
                'load': function() {
                    view.getEl().unmask();
                }
            });
            if (notReloadMo)
                view.down('gridpanel[name=ContractGrid]').getStore().load();
            else view.down('b4selectfield[name=MoList]').clearValue();

            view.down('gridpanel[name=ManagementOrganizationGrid]').getStore().on({
                beforeload: function(cerStore, operation) {
                    operation.params.list = Ext.encode(houseList);
                }
            });
            view.down('gridpanel[name=ManagementOrganizationGrid]').getStore().load();
        }).error(function(response) {

            view.getEl().unmask();
            Ext.Msg.alert('Ошибка!',
                !Ext.isString(response.message) ? 'При выполнении операции произошла ошибка!' : response.message);
        });

    },
    initComponent: function() {
            var me = this,
                storeContract = Ext.create('B4.store.register.house.saldo.Contract'),
                storeManagementOrganization = Ext.create('B4.store.register.house.saldo.ManagementOrganization'),
                storeSaldoTransfer = Ext.create('B4.store.register.house.saldo.SaldoTransfer'),
                supplierStore = Ext.create('B4.base.Store',
                {
                    autoLoad: false,
                    proxy: {
                        type: 'b4proxy',
                        controllerName: 'HouseChangeManagementOrganization',
                        listAction: 'GetListSupplier',
                        timeout: 9999999
                    },
                    fields: [
                        'Name',
                        'PrincipalName',
                        'AgentName',
                        'Id',
                        'WorkerName',
                        'ReceiverName',
                        'ReceiverPeniName',
                        'Rcount',
                        'RcountPeni'
                    ]
                });
            Ext.applyIf(me,
            {
                defaults: {
                    margin: '5 0',
                    labelAlign: 'right'
                },
                items: [
                    {
                        xtype: 'label',
                        text: 'В реестре содержатся дома из банка данных:'
                    },
                    {
                        xtype: 'textareafield',
                        editable: false,
                        margin: '0 0 0 50',
                        disabled: true,
                        value: me.dataBankNamesList.toString()
                    },
                    {
                        xtype: 'label',
                        text: 'Всего выбрано домов: ' + me.countPersonalAccount,
                        cls: 'tomato-text'
                    },
                    {
                        xtype: 'container',
                        layout: {
                            type: 'hbox',
                            align: 'stretch'
                        },
                        defaults: {
                            margin: '0 0 0 5',
                            labelAlign: 'right'
                        },
                        items: [
                            {
                                xtype: 'button',
                                text: 'Выполнить смену УК',
                                tooltip: 'Выполнить смену УК',
                                iconCls: 'icon-folder-database',
                                name: 'changeManOrg',
                                listeners: {
                                    click: me.save
                                }
                            },
                            {
                                xtype: 'button',
                                text: 'Выполнить смену договоров',
                                tooltip: 'Выполнить смену договоров без смены УК',
                                iconCls: 'icon-folder-database',
                                name: 'changeSupplier',
                                listeners: {
                                    click: me.saveSupplier
                                }
                            },
                            {
                                xtype: 'button',
                                text: 'К контрагентам',
                                tooltip: 'Перейти к контрагентам',
                                iconCls: 'icon-folder-go',
                                name: 'GoLegalEntity',
                                listeners: {
                                    click: function() { me.application.redirectTo(Ext.String.format('contragent')) }
                                }
                            },
                            {
                                xtype: 'button',
                                text: 'К УК',
                                tooltip: 'Перейти к управляющим организациям',
                                iconCls: 'icon-folder-go',
                                name: 'GoManOrg',
                                listeners: {
                                    click: function() {
                                        me.application.redirectTo(Ext.String.format('managementorganizationlist'))
                                    }
                                }
                            },
                            {
                                xtype: 'button',
                                text: 'К договорам ЕРЦ',
                                tooltip: 'Перейти к договорам ЕРЦ',
                                iconCls: 'icon-folder-go',
                                name: 'GoContrERC',
                                listeners: {
                                    click: function() {
                                        me.application.redirectTo(Ext.String.format('contractfinlist'))
                                    }
                                }
                            },
                            {
                                xtype: 'button',
                                text: 'К договорам ЖКУ',
                                tooltip: 'Перейти к договорам ЖКУ',
                                iconCls: 'icon-folder-go',
                                name: 'GoContrGKU',
                                listeners: {
                                    click: function() { me.application.redirectTo(Ext.String.format('contract')) }
                                }
                            },
                            {
                                xtype: 'button',
                                text: 'К доступным услугам',
                                tooltip: 'Перейти к доступным услугам',
                                iconCls: 'icon-folder-go',
                                name: 'GoServiceGKU',
                                listeners: {
                                    click: function() {
                                        me.application.redirectTo(Ext.String.format('calcmonthservices'))
                                    }
                                }
                            }
                        ]
                    },
                    {
                        xtype: 'fieldset',
                        items: [
                            {
                                xtype: 'container',
                                layout: {
                                    type: 'hbox',
                                    align: 'stretch'
                                },
                                defaults: {
                                    margin: '0 0 0 5',
                                    labelAlign: 'right'
                                },
                                items: [
                                    {
                                        xtype: 'container',
                                        flex: 1,
                                        layout: {
                                            type: 'vbox',
                                            align: 'stretch'
                                        },
                                        items: [
                                            {
                                                xtype: 'b4selectfield',
                                                store: 'B4.store.finance.ManagementOrganizationFin',
                                                name: 'MoList',
                                                labelWidth: 60,
                                                fieldLabel: 'Новая УК',
                                                displayField: 'Name',
                                                valueField: 'Id',
                                                editable: false,
                                                columns: [
                                                    {
                                                        text: 'Наименование',
                                                        dataIndex: 'Name',
                                                        flex: 1,
                                                        filter: {
                                                            xtype: 'textfield'
                                                        }
                                                    }
                                                ],
                                                listeners: {
                                                    change: function(field, value) {
                                                        var
                                                            view = field
                                                                .up('grouphousechangemagementorganizationwindow');
                                                        if (view == undefined) return;
                                                        me.counter = 0;
                                                        B4.Ajax.request({
                                                            url: B4.Url
                                                                .action('/HouseChangeManagementOrganization/UpdateData'),
                                                            method: 'POST',
                                                            timeout: 9999999,
                                                            params: {
                                                                ManagementOrganizationId: me
                                                                    .down('b4selectfield[name=MoList]').getValue()
                                                            }
                                                        }).next(function(jsonResp) {
                                                            view.down('gridpanel[name=ContractGrid]').columns[6]
                                                                .getEditor().items.items[0].setValue(" ");
                                                            view.down('gridpanel[name=ContractGrid]').getStore().load();
                                                        }).error(function(response) {
                                                            view.getEl().unmask();
                                                            Ext.Msg
                                                                .alert('Ошибка!',
                                                                    !Ext.isString(response.message)
                                                                    ? 'При выполнении операции произошла ошибка!'
                                                                    : response.message);
                                                        });
                                                    }
                                                }
                                            },
                                            {
                                                xtype: 'datefield',
                                                name: 'StartDate',
                                                labelWidth: 160,
                                                width: 250,
                                                labelAlign: 'left',
                                                fieldLabel: 'Дата начала действия УК',
                                                listeners: {
                                                    'change': {
                                                        fn: function(button) {
                                                            me.loadChangeManagement(button.up('window'), true);
                                                        },
                                                        scope: me
                                                    }
                                                }
                                            },
                                            {
                                                xtype: 'b4calcmonthpicker',
                                                name: 'ChargeDate',
                                                labelWidth: 160,
                                                disabled: true,
                                                width: 250,
                                                labelAlign: 'left',
                                                fieldLabel: 'Текущий расчетный месяц'
                                            }
                                        ]
                                    },
                                    {
                                        xtype: 'container',
                                        width: 20
                                    },
                                    {
                                        xtype: 'gridpanel',
                                        name: 'ManagementOrganizationGrid',
                                        flex: 2,
                                        height: 100,
                                        store: storeManagementOrganization,
                                        plugins: [
                                            Ext.create('Ext.grid.plugin.CellEditing',
                                            {
                                                clicksToEdit: 1
                                            })
                                        ],
                                        title: '',
                                        columns: [
                                            {
                                                xtype: 'gridcolumn',
                                                dataIndex: 'ManagementOrganizationId',
                                                flex: 0.7,
                                                text: 'Код УК'
                                            },
                                            {
                                                xtype: 'gridcolumn',
                                                dataIndex: 'ManagementOrganization',
                                                flex: 2,
                                                text: 'Старые УК'
                                            },
                                            {
                                                xtype: 'numbercolumn',
                                                dataIndex: 'TotalSquare',
                                                flex: 1,
                                                text: 'Общая площадь',
                                                filter: {
                                                    xtype: 'numberfield',
                                                    decimalPrecision: 2,
                                                    operand: CondExpr.operands.eq
                                                }
                                            },
                                            {
                                                xtype: 'gridcolumn',
                                                dataIndex: 'CountPersonalAccount',
                                                flex: 1,
                                                text: 'Количество открытых ЛС'
                                            },
                                            {
                                                xtype: 'gridcolumn',
                                                dataIndex: 'CountHouse',
                                                flex: 1,
                                                text: 'Количество домов'
                                            },
                                            {
                                                xtype: 'numbercolumn',
                                                dataIndex: 'Transfer',
                                                flex: 2,
                                                text: 'Перенос исх. сальдо',
                                                sortable: false,
                                                getEditor: function() {
                                                    return Ext.create('Ext.grid.CellEditor',
                                                    {
                                                        field: Ext.create('Ext.form.field.ComboBox',
                                                        {
                                                            store: storeSaldoTransfer,
                                                            editable: false,
                                                            queryMode: 'local',
                                                            valueField: 'Id',
                                                            displayField: 'Name',
                                                            listeners: {
                                                                change: function(field) {
                                                                    var
                                                                        row = field.up('gridpanel').getSelectionModel()
                                                                            .getSelection();
                                                                    B4.Ajax.request({
                                                                        url: B4.Url
                                                                            .action('/HouseChangeManagementOrganization/ChangeTransferGrid'),
                                                                        method: 'POST',
                                                                        timeout: 9999999,
                                                                        params: {
                                                                            Id: row[0].get('Id'),
                                                                            Transfer: field.getValue()
                                                                        }
                                                                    }).next(function(jsonResp) {
                                                                        field.up('gridpanel').getStore().load();
                                                                    }).error(function(response) {
                                                                        view.getEl().unmask();
                                                                        Ext.Msg
                                                                            .alert('Ошибка!',
                                                                                !Ext.isString(response.message)
                                                                                ? 'При выполнении операции произошла ошибка!'
                                                                                : response.message);
                                                                    });
                                                                }
                                                            }
                                                        })
                                                    });
                                                },
                                                renderer: function(value) {
                                                    var index = storeSaldoTransfer.findExact('Id', value);
                                                    var record = storeSaldoTransfer.getAt(index);
                                                    return record
                                                        ? record.get('Name')
                                                        : '';
                                                }
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        xtype: 'fieldset',
                        title: 'Договоры ЖКУ, действующие по домам старой УК',
                        flex: 1,
                        items: [
                            {
                                xtype: 'gridpanel',
                                name: 'ContractGrid',
                                store: storeContract,
                                plugins: [
                                    Ext.create('Ext.grid.plugin.CellEditing',
                                    {
                                        clicksToEdit: 1
                                    })
                                ],
                                flex: 1,
                                anchor: '0 0',
                                title: '',
                                columns: [
                                    {
                                        xtype: 'checkcolumn',
                                        dataIndex: 'IsClosed',
                                        flex: 0.7,
                                        header: 'Закрыть',
                                        listeners: {
                                            checkchange: function(column, rowIndex, checked) {
                                                me.mask('Загрузка...');
                                                var row = storeContract.getAt(rowIndex);
                                                B4.Ajax.request({
                                                    url: B4.Url
                                                        .action('/HouseChangeManagementOrganization/OnClickClose'),
                                                    method: 'POST',
                                                    timeout: 9999999,
                                                    params: {
                                                        Id: row.get('Id'),
                                                        isClose: row.get('IsClosed') ? 1 : 0
                                                    }
                                                }).next(function(jsonResp) {
                                                    me.unmask();
                                                }).error(function(response) {
                                                    me.unmask();
                                                    Ext.Msg
                                                        .alert('Ошибка!',
                                                            !Ext.isString(response.message)
                                                            ? 'При выполнении операции произошла ошибка!'
                                                            : response.message);
                                                });
                                            }
                                        }
                                    },
                                    {
                                        xtype: 'gridcolumn',
                                        dataIndex: 'ManagementOrganizationId',
                                        flex: 0.5,
                                        text: 'Код УК'
                                    },
                                    {
                                        xtype: 'gridcolumn',
                                        dataIndex: 'Service',
                                        flex: 2,
                                        text: 'Наименование услуги'
                                    },
                                    {
                                        xtype: 'gridcolumn',
                                        dataIndex: 'Supplier',
                                        flex: 2,
                                        text: 'Старый договор ЖКУ'
                                    },
                                    {
                                        xtype: 'gridcolumn',
                                        dataIndex: 'CountPersonalAccount',
                                        flex: 0.7,
                                        text: 'Количество открытых ЛС'
                                    },
                                    {
                                        xtype: 'gridcolumn',
                                        dataIndex: 'CountHouse',
                                        flex: 0.7,
                                        text: 'Количество домов'
                                    },
                                    {
                                        xtype: 'gridcolumn',
                                        dataIndex: 'NewSupplierId',
                                        flex: 3,
                                        text: 'Новый договор ЖКУ',
                                        sortable: false,
                                        getEditor: function(record) {
                                            return Ext.create('Ext.grid.CellEditor',
                                            {
                                                field: Ext.create('B4.form.SelectFieldContracts',
                                                {
                                                    store: supplierStore,
                                                    editable: false,
                                                    limit: 1000,
                                                    queryMode: 'local',
                                                    valueField: 'Id',
                                                    displayField: 'Name',
                                                    onTrigger2Click: function () {
                                                        var me = this;
                                                        me.selectedRecords = [];
                                                        me.choosedRecords = [];
                                                        me.setValue(undefined);
                                                        me.updateDisplayedText();

                                                        record.set('NewSupplier', null);
                                                        record.set('NewSupplierId', null);

                                                        B4.Ajax.request({
                                                            url: B4.Url
                                                                .action('/HouseChangeManagementOrganization/ChangeContractGrid'),
                                                            method: 'POST',
                                                            timeout: 9999999,
                                                            params: {
                                                                Id: record.get('Id'),
                                                                newSupplierId: 0
                                                            }
                                                        });
                                                    },
                                                    listeners: {
                                                        valueselected: function(cmp, value) {
                                                            record.set('NewSupplier', cmp.rawValue);
                                                            record.set('NewSupplierId', value);
                                                            B4.Ajax.request({
                                                                url: B4.Url
                                                                    .action('/HouseChangeManagementOrganization/ChangeContractGrid'),
                                                                method: 'POST',
                                                                timeout: 9999999,
                                                                params: {
                                                                    Id: record.get('Id'),
                                                                    newSupplierId: record.get('NewSupplierId')
                                                                }
                                                            });
                                                        },
                                                        render: function(field) {
                                                            supplierStore.on({
                                                                beforeload: function(curStore, operation) {
                                                                    operation.params = operation.params || {};
                                                                    operation.params.ManagementOrganizationId = me
                                                                        .down('b4selectfield[name=MoList]').getValue();
                                                                }
                                                            });
                                                            supplierStore.load();
                                                        }
                                                    }
                                                })
                                            });
                                        },
                                        renderer: function(value, meta, record) {
                                            return record
                                                ? record.get('NewSupplier')
                                                : '';
                                        }
                                    }
                                ]
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
                                        xtype: 'b4updatebutton',
                                        listeners: {
                                            click: function(button) {
                                                me.loadChangeManagement(button.up('window'));
                                            }
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
                                            click: function(button) {
                                                button.up('window').close();
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
        }
    
});


