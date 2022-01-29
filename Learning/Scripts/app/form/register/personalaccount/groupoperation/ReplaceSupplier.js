/*
   Окно групповой замены договоров
*/
Ext.define('B4.form.register.personalaccount.groupoperation.ReplaceSupplier', {
    extend: 'B4.form.Window',
    alias: 'widget.replacesuppliergroup',

    mixins: ['B4.mixins.window.ModalMask'],

    layout: 'fit',
    title: 'Групповая операция замены договоров ЖКУ',
    constrain: true,

    dataBankId: undefined,
    selectedPersonalAccountList: undefined,
    isHouses: false,
    tableName: undefined,

    maximizable: true,
    minimizable: true,

    requires: [
        'B4.ux.button.Close',
        'B4.ux.button.Save',
        'B4.ux.grid.plugin.HeaderFilters',
        'B4.ux.grid.toolbar.Paging',
        'B4.ux.grid.column.Enum',
        'B4.ux.grid.filter.YesNo',
        'B4.ux.button.Update',
        'B4.form.SelectFieldContracts'
    ],

    listeners: {
        afterrender: function (view) {
            var width = Ext.getBody().getViewSize().width * 0.7;
            var height = Ext.getBody().getViewSize().height * 0.7;
            view.setWidth(width);
            view.setHeight(height);
            view.center();


            view.down('label[name=BankName]').setText('Выбранный банк данных: ' + view.dataBank.name);
            view.down('label[name=PersonalAccountCount]').setText((view.isHouses ? 'Всего выбрано домов: ' : 'Всего выбрано ЛС: ') + view.countPersonalAccount);

            view.getForm().isValid();

            view.getEl().mask('Формирование списка ЛС...');
            B4.Ajax.request({
                url: B4.Url.action('/ReplaceSupp/GetReplaceSuppTempTableKvarList'),
                timeout: 9999999,
                params: {
                    isHouses: view.isHouses,
                    dataBankId: view.dataBank.id,
                    personalAccountList: Ext.encode(view.selectedPersonalAccountList)
                }
            }).next(function (resp) {
                view.getEl().unmask();
                var response = Ext.decode(resp.responseText);
                if (response.success) {
                    view.getEl().unmask();
                    view.tableName = response.message;
                } else {
                    view.getEl().unmask();
                    B4.QuickMsg.msg('Внимание', response.message, 'warning');
                }
            }).error(function (resp) {
                view.getEl().unmask();
                B4.QuickMsg.msg('Внимание', 'При выполнении операции произошла ошибка', 'warning');
            });

            //------------------------------------------------------------
            // расчетный месяц
            B4.Ajax.request({
                url: B4.Url.action('/CalculationMonth/GetCalculationMonth')
            }).next(function (resp) {
                var response = Ext.decode(resp.responseText);
                view.down('b4monthpicker[name=CalcMonth]').setValue(response.data.CalculationMonth);
            });

            //------------------------------------------------------------
            // грид с транзакциями
            var gridTransaction = view.down('[name=Transaction]');
            gridTransaction.on('selectionchange', function (selModel, record) {
                var win = selModel.view.up('window');
                
                if (record != null && record.length > 0) {
                    var grid = win.down('[name=ReplaceSuppDetail]');

                    grid.getStore().on({
                        beforeLoad: function (store, operation) {
                            operation.params = operation.params || {};
                            operation.params.replaceSuppTransactionId = record[0].get('Id');
                        }
                    });

                    grid.getStore().load();
                }
            });

            gridTransaction.getStore().load();
            if (gridTransaction.getStore().totalCount > 1) {
                gridTransaction.getSelectionModel().select(0);
            }

        }
    },

    save: function (saveBtn) {
        var view = saveBtn.up('window');

        if (view.selectedPersonalAccountList.length === 0) {
            B4.QuickMsg.msg(
                'Внимание',
                'Для проведения групповой операции необходимо выбрать лицевые счета',
                'warning'
            );
            return;
        }

        if (!view.getForm().isValid()) {
            B4.QuickMsg.msg('Внимание', 'Не все поля корректно заполнены', 'warning');
            return;
        }
        
        var sel = view.down('[name=Suppliers]').getSelectionModel().getSelection();
      
        var list = [];
        sel.map(function (item) {
            list.push({
                nzpSupp: item.get('nzp_supp'),
                nzpServ: item.get('nzp_serv')
            });
        });
        
        if (list.length === 0) {
            B4.QuickMsg.msg(
                'Внимание',
                'Для проведения групповой операции необходимо выбрать договоры ЖКУ',
                'warning'
            );
            return;
        }
        
        replaceSuppFunc = function () {
            view.getEl().mask('Сохранение...');
            B4.Ajax.request({
                url: B4.Url.action('/ReplaceSupp/ReplaceSupp'),
                timeout: 9999999,
                params: {
                    newNzpSupp: view.down('[name=NewSupplier]').getValue(),
                    tableName: view.tableName,
                    oldNzpSuppList: Ext.encode(list),
                    replaceMode: view.down('[name=ReplaceMode]').getValue(),
                    isNotFullReplace: view.down('checkbox[name=IsNotFullReplace]').getValue()
                }
            }).next(function (resp) {
                view.getEl().unmask();
                var response = Ext.decode(resp.responseText);
                if (response.success) {
                    B4.QuickMsg.msg('Выполнено', 'Поставлена задача по замене договоров', 'success');
                    //view.close();
                } else {
                    B4.QuickMsg.msg('Внимание', response.message, 'warning');
                }
            }).error(function (resp) {
                view.getEl().unmask();
                B4.QuickMsg.msg('Внимание', 'При выполнении операции произошла ошибка', 'warning');
            });
        }

        Ext.Msg.confirm('Предупреждение',
            'Вы уверены, что хотите заменить договоры?', function (result) {
                if (result == 'yes') {
                    replaceSuppFunc();
                }
            }
        );
    },

    getReplaceSuppReport: function (button) {
        var win = button.up('window');

        var suppList = {};
        var val = win.down('[name=FindReplaceSupp]').getValue();
        if (val != 'all') {
            suppList = Ext.encode(val);
        } 

        win.getEl().mask('Формирование отчета...');
        B4.Ajax.request({
            url: B4.Url.action('/ReplaceSupp/GetReplaceSuppReport'),
            timeout: 9999999,
            params: {
                dataBankId: win.dataBank.id,
                tableName: win.tableName,
                suppList: suppList,
                calcMonth: win.down('b4monthpicker[name=CalcMonth]').getValue()
            }
        }).next(function (resp) {
            win.getEl().unmask();
            var response = Ext.decode(resp.responseText);
            if (response.success) {
                B4.QuickMsg.msg('Выполнено', 'Отчет можно скачать в Моих файлах', 'success');
            } else {
                B4.QuickMsg.msg('Внимание', response.message, 'warning');
            }
        }).error(function (resp) {
            win.getEl().unmask();
            B4.QuickMsg.msg('Внимание', 'При выполнении операции произошла ошибка', 'warning');
        });
    },

    findReplaceSupp: function (cmp) {
        var win = cmp.up('window');

        var suppList = {}, servList = {};
        var val = win.down('[name=FindReplaceSupp]').getValue(),
            valserv = win.down('[name=Service]').getValue(),
            levelOfDetails = win.down('[name=LevelOfDetail]').getValue();

        if (val != 'all') {
            suppList = Ext.encode(val);
        }

        if (valserv != 'all') {
            servList = Ext.encode(valserv);
        }

        var grid = win.down('[name=Suppliers]');
        grid.getStore().load({
            params: {
                dataBankId: win.dataBank.id,
                tableName: win.tableName,
                suppList: suppList,
                servList: servList,
                calcMonth: win.down('b4monthpicker[name=CalcMonth]').getValue(),
                serviceDetails: levelOfDetails == 2
            }
        });
    },

    getReplaceSuppDifferenceReport: function (button) {
        var view = button.up('window');

        var sel = view.down('[name=Suppliers]').getSelectionModel().getSelection();
        var list = sel.map(function (item) {
            return item.get('nzp_supp');
        });

        if (list.length === 0) {
            B4.QuickMsg.msg(
                'Внимание',
                'Необходимо выбрать заменяемые договоры ЖКУ',
                'warning'
            );
            return;
        }

        if (!view.down('[name=NewSupplier]').getValue()) {
            B4.QuickMsg.msg(
                'Внимание',
                'Необходимо выбрать новый договор ЖКУ',
                'warning'
            );
            return;
        }

        view.getEl().mask('Формирование отчета...');
        B4.Ajax.request({
            url: B4.Url.action('/ReplaceSupp/GetReplaceSuppDifferenceReport'),
            timeout: 9999999,
            params: {
                dataBankId: view.dataBank.id,
                newNzpSupp: view.down('[name=NewSupplier]').getValue(),
                oldNzpSuppList: Ext.encode(list)
            }
        }).next(function (resp) {
            view.getEl().unmask();
            var response = Ext.decode(resp.responseText);
            if (response.success) {
                B4.QuickMsg.msg('Выполнено', 'Отчет можно скачать в Моих файлах', 'success');
            } else {
                B4.QuickMsg.msg('Внимание', response.message, 'warning');
            }
        }).error(function (resp) {
            view.getEl().unmask();
            B4.QuickMsg.msg('Внимание', 'При выполнении операции произошла ошибка', 'warning');
        });
    },

    initComponent: function () {
        var me = this;
        var storeFindSupplier = Ext.create('B4.store.finance.SupplierFin'),
            storeReplaceSupp = Ext.create('B4.store.register.personalaccount.replacesupp.SupplierList'),
            storeTransaction = Ext.create('B4.store.register.personalaccount.replacesupp.ReplaceSuppTransaction'),
            storeReplaceDetail = Ext.create('B4.store.register.personalaccount.replacesupp.ReplaceSuppDetail'),
            serviceStore = Ext.create('B4.store.finance.ServicesFin');

        var storeReplaceMode = Ext.create('Ext.data.Store', {
            fields: ['name'],
            data: [
                { id: 1, name: 'Простая замена без объединения периодов действия договоров' },
                { id: 2, name: 'Замена с объединением периодов действия договоров' }
            ]
        });

        var storeLevelOfDetail= Ext.create('Ext.data.Store', {
            fields: ['name'],
            data: [
                { id: 1, name: 'По договорам' },
                { id: 2, name: 'По договорам и услугам' }
            ]
        });

        serviceStore.on({
            'beforeload': function (curStore, operation) {
                operation.params = operation.params || {};
                operation.params.ignoreItogo = true;
            }
        });

        Ext.applyIf(me, {
            items: [
                {
                    xtype: 'tabpanel',
                    activeTab: 0,
                    items: [
                        {
                            xtype: 'panel',
                            border: false,
                            bodyStyle: B4.getBgStyle(),
                            title: 'Выполнить замену',
                            
                            layout: {
                                type: 'vbox',
                                align: 'stretch'
                            },

                            dockedItems: [
                                {
                                    xtype: 'toolbar',
                                    dock: 'top',
                                    items: [
                                        {
                                            xtype: 'buttongroup',
                                            items: [
                                                {
                                                    xtype: 'b4savebutton',
                                                    text: 'Заменить',
                                                    listeners: {
                                                        click: me.save
                                                    }
                                                },
                                                {
                                                    xtype: 'b4updatebutton',
                                                    listeners: {
                                                        click: function (btn) {
                                                            me.findReplaceSupp(btn);
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
                                                    handler: function () {
                                                        this.up('window').close();
                                                    }
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ],

                            items: [
                                {
                                    xtype: 'panel',
                                    frame: true,
                                    layout: 'vbox',
                                    margin: '0 0 10 0',

                                    defaults: {
                                        margin: '5 0 2 10'
                                    },

                                    items: [
                                        {
                                            xtype: 'label',
                                            html: '<b>Внимание! При замене договоров ЖКУ, параметры заменяемого договора не будут автоматически перенесены для нового договора (тарифы, настройки для расчета начислений и т.п.). <br>Для сверки параметров договоров запустите отчет по кнопке "Отчет рассогласования".</b>',
                                            name: 'Attention'
                                        },
                                        {
                                            xtype: 'label',
                                            text: 'В списке выбраны лицевые счета из банка данных',
                                            name: 'BankName'
                                        },
                                        {
                                            xtype: 'label',
                                            text: 'Всего выбрано лицевых счетов',
                                            name: 'PersonalAccountCount'
                                        },
                                        {
                                            xtype: 'checkbox',
                                            name: 'IsNotFullReplace',
                                            boxLabel: 'Частичная замена начислений за текущий и прошлый годы'
                                        }
                                    ]
                                },
                                {
                                    xtype: 'combobox',
                                    editable: false,
                                    allowBlank: false,
                                    name: 'LevelOfDetail',
                                    fieldLabel: 'Детализация',
                                    displayField: 'name',
                                    value: 1,
                                    labelAlign: 'right',
                                    margin: '0 10 10 0',
                                    valueField: 'id',
                                    store: storeLevelOfDetail,
                                    labelWidth: 110,
                                    listeners: {
                                        change: function (combobox, newValue) {
                                            var panel = combobox.up('panel');
                                            if (!panel) return;
                                            var grid = panel.down('gridpanel[name=Suppliers]');
                                            if (!grid) return;
                                            var column = grid.columns[2];
                                            if (!column) return;
                                            var serv = panel.down('b4selectfield[name=Service]');
                                            if (newValue == 1) {
                                                column.hide();
                                                serv.hide();
                                            } else {
                                                column.show();
                                                serv.show();
                                            }
                                            me.findReplaceSupp(combobox);
                                        }
                                    }
                                },
                                {
                                    xtype: 'b4selectfieldcontracts',
                                    name: 'FindReplaceSupp',
                                    labelAlign: 'right', 
                                    fieldLabel: 'Найти договора',
                                    editable: false,
                                    store: storeFindSupplier,
                                    selectionMode: 'MULTI',
                                    textProperty: 'Name',
                                    margin: '0 10 10 0',
                                    labelWidth: 110,
                                    listeners: {
                                        valueselected: function (cmp, value) {
                                            me.findReplaceSupp(cmp);
                                        },
                                        valueselectedall: function (cmp, value) {
                                            me.findReplaceSupp(cmp);
                                        }
                                    }
                                },
                                {
                                    xtype: 'b4selectfield',
                                    name: 'Service',
                                    queryMode: 'local',
                                    labelAlign: 'right',
                                    labelWidth: 110,
                                    store: serviceStore,
                                    margin: '0 10 10 0',
                                    fieldLabel: 'Найти услуги',
                                    selectionMode: 'MULTI',
                                    hidden: true,
                                    listeners: {
                                        valueselected: function (cmp) {
                                            me.findReplaceSupp(cmp);
                                        },
                                        valueselectedall: function (cmp) {
                                            me.findReplaceSupp(cmp);
                                        }
                                    }
                                },
                                {
                                    xtype: 'container',
                                    layout: 'hbox',
                                    margin: '0 10 10 0',
                                    items: [
                                        {
                                            xtype: 'b4monthpicker',
                                            name: 'CalcMonth',
                                            labelAlign: 'right',
                                            fieldLabel: 'Расчетный месяц',
                                            labelWidth: 110,
                                            editable: false,
                                            allowBlank: false,
                                            width: 230
                                        },
                                        { xtype: 'tbfill' },
                                        {
                                            xtype: 'button',
                                            name: 'GetReplaceSuppReport',
                                            text: 'Сохранить в отчет',
                                            iconCls: 'icon-printer',
                                            listeners: {
                                                click: me.getReplaceSuppReport
                                            }
                                        }
                                                
                                    ]
                                },
                                {
                                    xtype: 'gridpanel',
                                    name: 'Suppliers',
                                    store: storeReplaceSupp,
                                    flex: 1,
                                    selModel: Ext.create('Ext.selection.CheckboxModel', {
                                        checkOnly: true
                                    }),

                                    columns: [
                                        {
                                            text: 'Договор ЖКУ',
                                            dataIndex: 'name_supp',
                                            sortable: false,
                                            hideable: false,
                                            flex: 1
                                        },
                                        {
                                            text: 'Услуга',
                                            dataIndex: 'service',
                                            sortable: false,
                                            hideable: false,
                                            hidden: true,
                                            flex: 1
                                        },
                                        {
                                            text: 'Получатель',
                                            dataIndex: 'receiver_name',
                                            sortable: false,
                                            hideable: false,
                                            flex: 1
                                        },
                                        {
                                            xtype: 'gridcolumn',
                                            dataIndex: 'sum_insaldo',
                                            text: 'Вх.сальдо',
                                            sortable: false,
                                            flex: 1,
                                            renderer: me.numberRenderer
                                        },
                                        {
                                            xtype: 'gridcolumn',
                                            dataIndex: 'sum_tarif',
                                            text: 'Начислено',
                                            sortable: false,
                                            flex: 1,
                                            renderer: me.numberRenderer
                                        },
                                        {
                                            xtype: 'gridcolumn',
                                            dataIndex: 'sum_nedop',
                                            text: 'Недопоставки',
                                            sortable: false,
                                            flex: 1,
                                            renderer: me.numberRenderer
                                        },
                                        {
                                            xtype: 'gridcolumn',
                                            dataIndex: 'reval',
                                            text: 'Перерасчеты',
                                            sortable: false,
                                            flex: 1,
                                            renderer: me.numberRenderer
                                        },
                                        {
                                            xtype: 'gridcolumn',
                                            dataIndex: 'real_charge',
                                            text: 'Корректировки',
                                            sortable: false,
                                            flex: 1,
                                            renderer: me.numberRenderer
                                        },
                                        {
                                            xtype: 'gridcolumn',
                                            dataIndex: 'sum_money',
                                            text: 'Оплачено',
                                            sortable: false,
                                            flex: 1,
                                            renderer: me.numberRenderer
                                        },
                                        {
                                            xtype: 'gridcolumn',
                                            dataIndex: 'sum_outsaldo',
                                            text: 'Исх.сальдо',
                                            sortable: false,
                                            flex: 1,
                                            renderer: me.numberRenderer
                                        },
                                        {
                                            xtype: 'b4editcolumn',
                                            handler: function (gridView, rowIndex, colIndex, el, e, rec) {
                                                var view = gridView.up('window');

                                                var win = Ext.create('B4.form.register.personalaccount.groupoperation.ReplaceSuppKvarList', {
                                                    dataBankId: view.dataBank.id,
                                                    tableName: view.tableName,
                                                    nzpSupp: rec.get('nzp_supp')
                                                });

                                                win.show();
                                            }
                                        }
                                    ],
                                    listeners: {
                                        itemdblclick: function (dv, record) {

                                            var wndConfig = {};
                                            var win = dv.up('window');
                                            Ext.applyIf(wndConfig, {
                                                height: 470,
                                                width: 900,
                                                layout: 'anchor',
                                                constrain: true,
                                                renderTo: Ext.getBody(),
                                                modal: me.modalWindow == true,
                                                title: 'Детализация по договору и всем услугам этого договора',
                                                items: [
                                                    {
                                                        xtype: 'panel',
                                                        frame: true,
                                                        height: 30,
                                                        margin: '10 0 10 0',
                                                        items: [
                                                             {
                                                                 xtype: 'label',
                                                                 text: 'Выбранный договор ЖКУ',
                                                                 name: 'SuppName'
                                                             }
                                                        ]
                                                    },
                                                    {
                                                        xtype: 'gridpanel',
                                                        name: 'ServiceDetails',
                                                        anchor: '0 -50',
                                                        store: Ext.create('B4.store.register.personalaccount.replacesupp.SupplierList'),
                                                        columns: [
                                                            {
                                                                text: 'Услуга',
                                                                dataIndex: 'service',
                                                                sortable: false,
                                                                hideable: false,
                                                                flex: 2.5
                                                            },
                                                            {
                                                                xtype: 'datecolumn',
                                                                dataIndex: 'dat_s',
                                                                text: 'Дата начала',
                                                                sortable: false,
                                                                flex: 1,
                                                                format: 'd.m.Y'
                                                            },
                                                            {
                                                                xtype: 'datecolumn',
                                                                dataIndex: 'dat_po',
                                                                text: 'Дата окончания',
                                                                sortable: false,
                                                                flex: 1,
                                                                format: 'd.m.Y'
                                                            },
                                                            {
                                                                xtype: 'gridcolumn',
                                                                dataIndex: 'sum_insaldo',
                                                                text: 'Вх.сальдо',
                                                                sortable: false,
                                                                flex: 1,
                                                                renderer: me.numberRenderer
                                                            },
                                                            {
                                                                xtype: 'gridcolumn',
                                                                dataIndex: 'sum_tarif',
                                                                text: 'Начислено',
                                                                sortable: false,
                                                                flex: 1,
                                                                renderer: me.numberRenderer
                                                            },
                                                            {
                                                                xtype: 'gridcolumn',
                                                                dataIndex: 'sum_nedop',
                                                                text: 'Недопоставки',
                                                                sortable: false,
                                                                flex: 1,
                                                                renderer: me.numberRenderer
                                                            },
                                                            {
                                                                xtype: 'gridcolumn',
                                                                dataIndex: 'reval',
                                                                text: 'Перерасчеты',
                                                                sortable: false,
                                                                flex: 1,
                                                                renderer: me.numberRenderer
                                                            },
                                                            {
                                                                xtype: 'gridcolumn',
                                                                dataIndex: 'real_charge',
                                                                text: 'Корректировки',
                                                                sortable: false,
                                                                flex: 1,
                                                                renderer: me.numberRenderer
                                                            },
                                                            {
                                                                xtype: 'gridcolumn',
                                                                dataIndex: 'sum_money',
                                                                text: 'Оплачено',
                                                                sortable: false,
                                                                flex: 1,
                                                                renderer: me.numberRenderer
                                                            },
                                                            {
                                                                xtype: 'gridcolumn',
                                                                dataIndex: 'sum_outsaldo',
                                                                text: 'Исх.сальдо',
                                                                sortable: false,
                                                                flex: 1,
                                                                renderer: me.numberRenderer
                                                            }
                                                        ]
                                                    }
                                                ],
                                                listeners: {
                                                    afterrender: function (form, record) {

                                                        var serviceDetails = form.down('gridpanel[name=ServiceDetails]').getStore();
                                                            serviceDetails.load();
                                                    }

                                                }
                                            });
                                            wndConfig.items[1].store.on({
                                                beforeload: function(curStore, operation) {
                                                    operation.params = operation.params || {};
                                                    operation.params.suppList = record.data.nzp_supp;
                                                    operation.params.dataBankId = win.dataBank.id;
                                                    operation.params.tableName = win.tableName;
                                                    operation.params.serviceDetails = true;
                                                    operation.params.calcMonth = win.down('b4monthpicker[name=CalcMonth]').getValue();
                                                }
                                            });

                                            wndConfig.items[0].items[0].text = 'Выбранный договор ЖКУ: ' + record.data.name_supp;
                                            me.selectWindow = Ext.create('Ext.window.Window', wndConfig);
                                            me.selectWindow.show();
                                            me.selectWindow.center();
                                        }
                                    }
                                },
                                {
                                    xtype: 'container',
                                    layout: 'hbox',
                                    margin: '10 10 0 10',
                                    items: [
                                        {
                                            xtype: 'b4selectfieldcontracts',
                                            store: 'B4.store.finance.SupplierFin',
                                            name: 'NewSupplier',
                                            fieldLabel: 'На договор',
                                            textProperty: 'Name',
                                            valueField: 'Id',
                                            editable: false,
                                            allowBlank: false,
                                            labelAlign: 'right',
                                            labelWidth: 110,
                                            flex: 1
                                        },
                                        {
                                            xtype: 'button',
                                            name: 'GetReplaceSuppDiffReport',
                                            text: 'Отчет рассогласования',
                                            iconCls: 'icon-printer',
                                            listeners: {
                                                click: me.getReplaceSuppDifferenceReport
                                            }
                                        }
                                    ]
                                },
                                {
                                    xtype: 'combobox',
                                    editable: false,
                                    allowBlank: false,
                                    name: 'ReplaceMode',
                                    fieldLabel: 'Режим замены',
                                    displayField: 'name',
                                    valueField: 'id',
                                    labelAlign: 'right',
                                    store: storeReplaceMode,
                                    labelWidth: 110,
                                    margin: '10 10 10 10'
                                }
                            ]
                        },
                        {
                            xtype: 'panel',
                            border: false,
                            bodyStyle: B4.getBgStyle(),
                            title: 'Результаты замен',
                            flex: 1,
                            layout: {
                                type: 'vbox',
                                align: 'stretch'
                            },

                            dockedItems: [
                                {
                                    xtype: 'toolbar',
                                    dock: 'top',
                                    items: [
                                        {
                                            xtype: 'button',
                                            name: 'Refresh',
                                            text: 'Обновить',
                                            iconCls: 'icon-arrow-refresh',
                                            handler: function () {
                                                var win = this.up('window');
                                                win.down('[name=Transaction]').getStore().load();
                                            }
                                        },
                                        { xtype: 'tbfill' },
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

                            items: [
                                {
                                    xtype: 'gridpanel',
                                    name: 'Transaction',
                                    store: storeTransaction,
                                    flex: 2,
                                    title: 'Замены договоров ЖКУ',

                                    columns: [
                                        {
                                            xtype: 'datecolumn',
                                            dataIndex: 'StartedOn',
                                            width: 110,
                                            text: 'Начало',
                                            format: 'd.m.Y H:i',
                                            filter: {
                                                xtype: 'datefield'
                                            },
                                            sortable: false
                                        },
                                        {
                                            xtype: 'b4enumcolumn',
                                            flex: 1,
                                            dataIndex: 'StatusId',
                                            text: 'Состояние',
                                            sortable: false,
                                            enumName: 'B4.enums.TypeReplaceSuppTransactionStatus',
                                            filter: true,

                                            renderer: function (val, meta, record) {
                                                return record.get("StatusName");
                                            }
                                        },
                                        {
                                            xtype: 'datecolumn',
                                            dataIndex: 'FinishedOn',
                                            width: 110,
                                            text: 'Окончание',
                                            format: 'd.m.Y H:i',
                                            filter: {
                                                xtype: 'datefield'
                                            },
                                            sortable: false
                                        },
                                        {
                                            xtype: 'gridcolumn',
                                            dataIndex: 'UserName',
                                            flex: 1,
                                            text: 'Пользователь',
                                            filter: {
                                                xtype: 'textfield'
                                            },
                                            sortable: false
                                        }
                                    ],

                                    dockedItems: [
                                        {
                                            xtype: 'b4pagingtoolbar',
                                            displayInfo: true,
                                            dock: 'bottom',
                                            store: storeTransaction
                                        }
                                    ],

                                    plugins: [
                                        Ext.create('B4.ux.grid.plugin.HeaderFilters')
                                    ]
                                },
                                {
                                    xtype: 'gridpanel',
                                    name: 'ReplaceSuppDetail',
                                    store: storeReplaceDetail,
                                    flex: 3,
                                    title: 'Детализация замены договоров',

                                    columns: [
                                        {
                                            xtype: 'gridcolumn',
                                            dataIndex: 'OldNameSupp',
                                            flex: 1,
                                            text: 'Старый договор',
                                            filter: {
                                                xtype: 'textfield'
                                            },
                                            sortable: false
                                        },
                                        {
                                            xtype: 'gridcolumn',
                                            dataIndex: 'NameSupp',
                                            flex: 1,
                                            text: 'Новый договор',
                                            filter: {
                                                xtype: 'textfield'
                                            },
                                            sortable: false
                                        },
                                        {
                                            xtype: 'gridcolumn',
                                            dataIndex: 'NumLs',
                                            width: 70,
                                            text: '№ ЛС',
                                            filter: {
                                                xtype: 'textfield'
                                            },
                                            sortable: false
                                        },
                                        {
                                            xtype: 'gridcolumn',
                                            dataIndex: 'Address',
                                            flex: 2,
                                            text: 'Адрес',
                                            filter: {
                                                xtype: 'textfield'
                                            },
                                            sortable: false
                                        },
                                        {
                                            xtype: 'gridcolumn',
                                            dataIndex: 'Service',
                                            flex: 1,
                                            text: 'Услуга',
                                            filter: {
                                                xtype: 'textfield'
                                            },
                                            sortable: false
                                        },
                                        {
                                            xtype: 'gridcolumn',
                                            dataIndex: 'IsReplace',
                                            width: 70,
                                            text: 'На замену',
                                            
                                            renderer: function (val) {
                                                return val == 1 ? 'Да' : 'Нет';
                                            },
                                            
                                            filter: {
                                                xtype: 'b4dgridfilteryesno'/*,
                                                listeners: {
                                                    afterrender: function (cmb) {
                                                        cmb.setValue(true);
                                                    }
                                                }*/
                                            },
                                            sortable: false
                                        }
                                    ],

                                    plugins: [
                                        Ext.create('B4.ux.grid.plugin.HeaderFilters')
                                    ],

                                    dockedItems: [
                                        {
                                            xtype: 'b4pagingtoolbar',
                                            displayInfo: true,
                                            dock: 'bottom',
                                            store: storeReplaceDetail
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

    numberRenderer: function (value) {
        return Ext.util.Format.number(parseFloat(value), '0,000.00').replace(',', '.');
    }
});