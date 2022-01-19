Ext.define('B4.form.register.personalaccount.PeniProtocolWindow', {
    extend: 'B4.form.Window',
    alias: 'widget.peniprotocolwindow',

    mixins: ['B4.mixins.window.ModalMask'],
    height: 500,
    width: 1050,
    layout: 'fit',
    title: 'Протокол расчета пени',
    maximizable: true,
    minimizable: true,

    personalAccountId: undefined,
    dataBankId: undefined,
    yy: undefined,
    mm: undefined,
    yyCh: undefined,
    mmCh: undefined,
    serviceId: undefined,
    supplierId: undefined,

    newProtocolTabWasOpened: false,

    requires: [
        'B4.store.register.personalaccount.listofcharges.ExtendedPeniInfo',
        'B4.ux.button.Update',
        'B4.ux.grid.column.Enum',
        'B4.aspects.ButtonDataExport'
    ],
    
    initComponent: function () {
        var me = this,
            extendedPeniInfoStore = Ext.create("B4.store.register.personalaccount.listofcharges.ExtendedPeniInfo", {
                listeners: {
                    beforeload: function (store, operation) {
                        operation.params = operation.params || {};
                        operation.params.personalAccountId = me.personalAccountId;
                        operation.params.dataBankId = me.dataBankId;
                        operation.params.serviceId = me.serviceId;
                        operation.params.supplierId = me.supplierId;
                        operation.params.yy = me.yy;
                        operation.params.mm = me.mm;
                        operation.params.yyCh = me.yyCh;
                        operation.params.mmCh = me.mmCh;
                    },
                    load: function (store, records, options) {
                        if (records == null || records.length === 0) {
                            B4.QuickMsg.msg(
                                'Внимание',
                                'Данные за указанный месяц отсутствуют',
                                'warning'
                            );
                        }

                        var headData = records.findChild("Id", -1).data;
                        var tabPanel = me.down('tabpanel');
                        tabPanel.down('label[name=Address]').setText(headData.Address);
                        tabPanel.down('label[name=CalcMonth]').setText(headData.CalcMonth);
                        tabPanel.down('label[name=ServiceName]').setText(headData.ServiceName);
                        tabPanel.down('label[name=PrincipalName]').setText(headData.PrincipalName);
                        tabPanel.down('label[name=CalcDate]').setText(headData.CalcDate);
                        tabPanel.down('label[name=SumChargeWithRecalc]').setText(headData.SumChargeWithRecalc);
                        tabPanel.down('label[name=SumCharge]').setText(headData.SumCharge);
                        tabPanel.down('label[name=Payments]').setText(headData.Payments);
                        tabPanel.down('label[name=RestDebt]').setText(headData.RestDebt);

                        records.findChild("Id", -1).remove();
                    }
                }
            });

        Ext.applyIf(me, {
            defaults: {
                labelWidth: 90,
                labelAlign: 'right'
            },
            items: [
                {
                    xtype: 'tabpanel',
                    border: false,
                    activeTab: 0,
                    items: [
                        {
                            xtype: 'panel',
                            name: 'OldProtocol',
                            title: 'Старый протокол расчета',
                            autoScroll: true,
                            html: '<iframe src="' + B4.Url.action('/CalculationMonth/GetProtocol?' +
                                'id=' + me.personalAccountId + '&dataBankId=' + me.dataBankId + '&year=' + me.yy + '&month=' + me.mm + '&yearCh=' + me.yyCh + '&monthCh=' + me.mmCh +
                                '&serviceId=' + me.serviceId + '&supplierId=' + me.supplierId + '&isVirtualAccount=false') + '" width="100%" height="100%"/>'
                        },
                        {
                            xtype: 'panel',
                            name: 'NewProtocolPanel',
                            title: 'Новый протокол расчета',
                            columnLines: true,
                            enableColumnHide: true,
                            enableCtxMenu: false,
                            collapsible: true,
                            menuDisabled: true,
                            hideable: false,
                            defaults: {
                                labelAlign: 'left',
                                labelWidth: 90,
                                margin: 5
                            },
                            items: [
                                {
                                    xtype: 'label',
                                    name: 'Address',
                                    cls: 'blue-bold-text'
                                },
                                {
                                    xtype: 'label',
                                    name: 'CalcMonth'
                                },
                                {
                                    xtype: 'container',
                                    layout: {
                                        type: 'hbox',
                                        align: 'stretch'
                                    },
                                    items: [
                                        {
                                            xtype: 'label',
                                            name: 'ServiceName',
                                            margin: '0 10 0 0'
                                        },
                                        {
                                            xtype: 'label',
                                            name: 'PrincipalName',
                                            margin: '0 10 0 0'
                                        },
                                        {
                                            xtype: 'label',
                                            name: 'CalcDate',
                                            cls: 'underline-text'
                                        }
                                    ]
                                },
                                {
                                    xtype: 'label',
                                    name: 'SumChargeWithRecalc'
                                },
                                {
                                    xtype: 'label',
                                    name: 'SumCharge'
                                },
                                {
                                    xtype: 'container',
                                    layout: {
                                        type: 'hbox',
                                        align: 'stretch'
                                    },
                                    items: [
                                        {
                                            xtype: 'label',
                                            name: 'Payments',
                                            margin: '0 10 0 0'
                                        },
                                        {
                                            xtype: 'label',
                                            name: 'RestDebt'
                                        }
                                    ]
                                },
                                {
                                    xtype: 'treepanel',
                                    name: 'PeniSumsGrid',
                                    store: extendedPeniInfoStore,
                                    rootVisible: false,
                                    columnLines: true,
                                    enableColumnHide: true,
                                    enableCtxMenu: false,
                                    menuDisabled: true,
                                    hideable: false,
                                    defaults: {
                                        width: 150
                                    },
                                    columns: [
                                        {
                                            xtype: 'treecolumn',
                                            dataIndex: 'TypeProvName',
                                            text: 'Тип проводки',
                                            width: 600
                                        },
                                        {
                                            xtype: 'datecolumn',
                                            dataIndex: 'ChargeMonth',
                                            format: 'm.Y',
                                            text: 'Месяц начисления',
                                            renderer: function (value) {
                                                var date = Ext.Date.format(new Date(value), 'd.m.Y');
                                                return (Ext.Date.parse(date, 'd.m.Y') > Ext.Date.parse('01.01.1970', 'd.m.Y')) ? date : '';
                                            }
                                        },
                                        {
                                            xtype: 'numbercolumn',
                                            dataIndex: 'ChargeSum',
                                            text: 'Начисление'
                                        },
                                        {
                                            xtype: 'numbercolumn',
                                            dataIndex: 'RecalcMinus',
                                            text: 'Перерасчеты/Корректировки (-)'
                                        },
                                        {
                                            xtype: 'numbercolumn',
                                            dataIndex: 'UsedPayments',
                                            text: 'Оплаты учтенные'
                                        },
                                        {
                                            xtype: 'numbercolumn',
                                            dataIndex: 'CurMonthDebt',
                                            text: 'Задолженность для расчета в тек. месяце'
                                        },
                                        {
                                            text: 'Дата начала просрочки',
                                            columns: [
                                                {
                                                    xtype: 'datecolumn',
                                                    dataIndex: 'DelayBefore2016Date',
                                                    format: 'd.m.Y',
                                                    text: 'До 2016 1/300*'
                                                },
                                                {
                                                    xtype: 'datecolumn',
                                                    dataIndex: 'GraceDaysDate',
                                                    format: 'd.m.Y',
                                                    text: 'Льготные дни'
                                                },
                                                {
                                                    xtype: 'datecolumn',
                                                    dataIndex: 'Date1D300',
                                                    format: 'd.m.Y',
                                                    text: '1/300*'
                                                },
                                                {
                                                    xtype: 'datecolumn',
                                                    dataIndex: 'Date1D130',
                                                    format: 'd.m.Y',
                                                    text: '1/130**'
                                                }
                                            ]
                                        },
                                        {
                                            xtype: 'numbercolumn',
                                            dataIndex: 'UsedOverPayments',
                                            text: 'Учтено оплат/переплат'
                                        },
                                        {
                                            xtype: 'datecolumn',
                                            dataIndex: 'FactPaymentDate',
                                            format: 'd.m.Y',
                                            text: 'Дата фактической оплаты (погашения)',
                                            renderer: function (value) {
                                                var date = Ext.Date.format(new Date(value), 'd.m.Y');
                                                return (Ext.Date.parse(date, 'd.m.Y') > Ext.Date.parse('01.01.1970', 'd.m.Y')) ? date : '';
                                            }
                                        },
                                        {
                                            xtype: 'datecolumn',
                                            dataIndex: 'UnrepayedChargeDate',
                                            format: 'd.m.Y',
                                            text: 'Дата расчета для непогашенных начислений',
                                            renderer: function (value) {
                                                var date = Ext.Date.format(new Date(value), 'd.m.Y');
                                                return (Ext.Date.parse(date, 'd.m.Y') > Ext.Date.parse('01.01.1970', 'd.m.Y')) ? date : '';
                                            }
                                        },
                                        {
                                            text: 'Дней просрочки',
                                            columns: [
                                                {
                                                    xtype: 'gridcolumn',
                                                    dataIndex: 'DelayBefore2016Days',
                                                    text: 'Дни до 2016 1/300*',
                                                    format: '0'
                                                },
                                                {
                                                    xtype: 'numbercolumn',
                                                    dataIndex: 'GraceDays',
                                                    text: 'Льготные дни',
                                                    format: '0'
                                                },
                                                {
                                                    xtype: 'numbercolumn',
                                                    dataIndex: 'Days1D300',
                                                    text: '1/300*',
                                                    format: '0'
                                                },
                                                {
                                                    xtype: 'numbercolumn',
                                                    dataIndex: 'Days1D130',
                                                    text: '1/130**',
                                                    format: '0'
                                                }
                                            ]
                                        },
                                        {
                                            xtype: 'numbercolumn',
                                            dataIndex: 'Rate',
                                            text: 'Ставка % ЦБ РФ'
                                        },
                                        {
                                            xtype: 'numbercolumn',
                                            dataIndex: 'TotalDebt',
                                            text: 'Итоговая задолженность'
                                        },
                                        {
                                            xtype: 'numbercolumn',
                                            dataIndex: 'PeniSum',
                                            text: 'Сумма пени',
                                            format: '0.0000'
                                        }
                                    ],
                                    viewConfig: {
                                        loadMask: true
                                    },
                                    dockedItems: [
                                        {
                                            xtype: 'toolbar',
                                            dock: 'top',
                                            items: [
                                                {
                                                    xtype: 'buttongroup',
                                                    defaults: {
                                                        margin: '2 0 2 0'
                                                    },
                                                    columns: 1,
                                                    items: [
                                                        {
                                                            xtype: 'button',
                                                            iconCls: 'icon-table-go',
                                                            text: 'Выгрузить',
                                                            tooltip: 'Выгрузить в Excel',
                                                            textAlign: 'left',
                                                            name: 'Export'
                                                        }
                                                    ]
                                                }
                                            ]
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
    }
});