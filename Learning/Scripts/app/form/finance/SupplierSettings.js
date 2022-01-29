/*
   Финансы - окно настроек договоров
*/
Ext.define('B4.form.finance.SupplierSettings', {
    extend: 'B4.form.Window',
    alias: 'widget.financesuppliersettings',

    mixins: ['B4.mixins.window.ModalMask'],
    width: 600,
    height: 400,
    title: 'Настройка договоров ЖКУ',
    modal: true,

    requires: [
        'B4.ux.button.Close',
        'B4.form.MonthPicker',
        'B4.ux.button.Save',
        'B4.form.ComboBox',
        'B4.enums.PayStatus',
        'B4.enums.TypePay',
        'B4.store.finance.PackLog',
        'B4.ux.grid.toolbar.Paging',
        'B4.form.MonthPicker',
        'B4.ux.grid.plugin.HeaderFilters'
    ],
    listeners: {
        afterrender: function (view) {
            var me = this, grid = view.down('gridpanel');
            grid.store.on({
                'load': function (store, operation) {
                    var model = grid.getSelectionModel();
                    var records = store.getRange();
                    var checkedRecords = [];
                    Ext.each(records, function (rec) {
                        var flag = false;
                        Ext.each(checkedRecords, function (rec1) {
                            if (rec.get("Id") == rec1.Id) {
                                flag = true;
                            }
                        });
                        if (!flag) {
                            checkedRecords.push(rec.data);
                        }
                    });
                    Ext.each(records, function (rec) {
                        if (rec.get("AllowOverpayments"))
                            model.select(rec, true);
                    });
                    view.checkedRecords = checkedRecords;
                }
            }, me);

            grid.store.load();
            grid.getSelectionModel().on('select', function (selModel, record, index) {
                var checkedRecords = view.checkedRecords;
                Ext.each(me.checkedRecords, function (rec) {
                    if (rec.Id == record.get("Id"))
                        rec.AllowOverpayments = true;
                });
                view.checkedRecords = checkedRecords;
            });
            grid.getSelectionModel().on('deselect', function (selModel, record, index) {
                var checkedRecords = view.checkedRecords;
                Ext.each(me.checkedRecords, function (rec) {
                    if (rec.Id == record.get("Id"))
                        rec.AllowOverpayments = false;
                });
                view.checkedRecords = checkedRecords;
            });
        }
    },

    refresh: function (btn) {
        var view = btn.up('window'),
         grid = view.down('gridpanel');
        grid.store.load();
    },
    dataInStore: [],
    saveValues: function (btn) {
        var me = this, view = btn.up('window'),
            grid = view.down('gridpanel'),
            checkedRecords = view.checkedRecords;
        view.getEl().mask('Сохранение...');
        B4.Ajax.request({
            url: B4.Url.action('SaveSupplierAllowOverpayment', 'Overpayment'),
            params: {
                dataBankId: view.dataBankId,
                List: Ext.encode(checkedRecords.map(function (item) {
                    return {
                        Id: item.Id,
                        AllowOverpayments: item.AllowOverpayments
                    };
                }))
            }
        }).next(function (resp) {
            view.getEl().unmask();
            var result = Ext.decode(resp.responseText);
            if (!result.success) {
                B4.QuickMsg.msg('Внимание', result.message, 'warning');
                return;
            }

            grid.store.load();
        }).error(function (resp) {
            view.getEl().unmask();
            B4.QuickMsg.msg('Внимание', 'При сохранении произошла ошибка', 'warning');
        });
    },

    initComponent: function () {
        var me = this,
            store = Ext.create('B4.base.Store', {
                autoLoad: true,
                proxy: {
                    type: 'b4proxy',
                    controllerName: 'Overpayment',
                    listAction: 'ListSupplierAllowOverpayment'
                },
                fields: [
                    'Id',
                    'Name',
                    'AllowOverpayments'
                ]
            });
        Ext.applyIf(me, {
            items: [
                {
                    xtype: 'gridpanel',
                    name: 'SupplierOverpayment',
                    anchor: '0 0',
                    selModel: Ext.create('Ext.selection.CheckboxModel',
                                    {
                                    }),
                    store: store,
                    width: 40,
                    columnLines: true,
                    title: '',
                    border: true,
                    columns: [
                        {
                            xtype: 'gridcolumn',
                            dataIndex: 'Name',
                            flex: 1,
                            text: 'Наименование договора ЖКУ',
                            filter: {
                                xtype: 'textfield'
                            }
                        }
                    ],
                    viewConfig: {
                        loadMask: true
                    },
                    plugins: [
                       Ext.create('B4.ux.grid.plugin.HeaderFilters')
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
                                        click: me.refresh
                                    }
                                },
                                {
                                    xtype: 'button',
                                    name: 'Save',
                                    text: 'Сохранить',
                                    iconCls: 'icon-accept',
                                    listeners: {
                                        click: me.saveValues
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
                },
                {
                    xtype: 'fieldset',
                    title: 'Фильтр',
                    defaults: {
                        margin: 5
                    },
                    padding: 0,
                    layout: 'vbox',
                    items: [
                       {
                           xtype: 'b4selectfield',
                           store: 'B4.store.finance.contractfin.ContractFin',
                           name: 'Contract',
                           margin: '5 5 0 5',
                           fieldLabel: 'Договор ЕРЦ',
                           labelWidth: 140,
                           allowBlank: false,
                           width: '100%',
                           textProperty: 'FullName',
                           valueField: 'Id',
                           editable: false,
                           listeners: {
                               change: function (field, value) {
                                   var view = field.up('window');
                                   if (!view) return;
                                   var contract = view.down('b4selectfield[name=Contract]');
                                   view.down('gridpanel').store.on('beforeload', function (store, operation) {
                                       operation.params = operation.params || {};
                                       operation.params.contractorId = contract.getValue();
                                   }, me);
                                   me.refresh(field);
                               }
                           },
                           columns: [
                               {
                                   text: 'Агент',
                                   dataIndex: 'AgentName',
                                   flex: 1,
                                   filter: {
                                       xtype: 'textfield'
                                   }
                               },
                               {
                                   text: 'Принципал',
                                   dataIndex: 'PrincipalName',
                                   flex: 1,
                                   filter: {
                                       xtype: 'textfield'
                                   }
                               },
                               {
                                   text: '№',
                                   dataIndex: 'Number',
                                   width: 40,
                                   filter: {
                                       xtype: 'textfield'
                                   }
                               },
                               {
                                   text: 'Дата',
                                   dataIndex: 'Date',
                                   width: 80,
                                   filter: {
                                       xtype: 'textfield'
                                   },
                                   renderer: function (value) {
                                       if (value && !Ext.isEmpty(value)) {

                                           return Ext.Date.format(new Date(value), 'd.m.Y');
                                       }
                                       return '';
                                   }
                               }
                           ]
                       },
                        {
                            xtype: 'checkbox',
                            fieldLabel: 'Показать выбранные',
                            labelWidth: 140,
                            name: 'showSelected',
                            listeners: {
                                change: function (ch, value) {
                                    var view = ch.up('window'),
                                        gridStore = view.down('gridpanel').store;
                                    gridStore.on('beforeload', function (store, operation) {
                                        operation.params = operation.params || {};
                                        operation.params.showSelected = value;
                                    }, me);
                                    gridStore.load();
                                }
                            }
                        }
                    ]
                },
                {
                    xtype: 'b4pagingtoolbar',
                    displayInfo: true,
                    store: store,
                    dock: 'bottom'
                }
            ]
        });

        me.callParent(arguments);
    }
});