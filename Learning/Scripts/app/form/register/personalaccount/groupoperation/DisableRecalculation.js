Ext.define('B4.form.register.personalaccount.groupoperation.DisableRecalculation', {
    extend: 'B4.form.Window',
    alias: 'widget.disablerecalculation',

    mixins: ['B4.mixins.window.ModalMask'],
    width: 500,
    autoHeight: true,
    layout: 'anchor',
    title: 'Периоды запрета перерасчета',
    bodyPadding: 10,

    dataBankId: undefined,
    selectedPersonalAccountList: undefined,
    isHouses: false,

    requires: [
        'B4.ux.button.Close',
        'B4.form.MonthPicker',
        'B4.ux.button.Save',
        'B4.form.ComboBox',
        'B4.store.finance.PackLog',
        'B4.form.SelectFieldContracts',
        'B4.form.BillMonthPicker'
    ],

    listeners: {
        afterrender: function (view) {
            view.getForm().isValid();
        }
    },

    save: function (btn) {
        var view = btn.up('window'),
            values = view.getForm().getValues();

        if (!view.getForm().isValid()) {
            B4.QuickMsg.msg('Внимание', 'Не все поля корректно заполнены', 'warning');
            return;
        }
        Ext.Msg.confirm('Внимание', 'Вы действительно хотите сохранить указанные периоды запрета перерасчета?', function (ans) {
            if (ans === 'yes') {
                view.getEl().mask('Сохранение...');
                B4.Ajax.request({
                    url: B4.Url.action('/ProhibitedCalcPeriod/SaveGroup'),
                    timeout: 9999999,
                    params: {
                        dataBankId: view.dataBankId,
                        isHouses: view.isHouses,
                        personalAccountList: Ext.encode(view.selectedPersonalAccountList),
                        serviceList: Ext.encode(values.Service),
                        supplier: values.Supplier,
                        dateBegin: values.DateBegin,
                        dateEnd: values.DateEnd
                    }
                }).next(function (resp) {
                    view.getEl().unmask();
                    var response = Ext.decode(resp.responseText);
                    if (response.success) {
                        B4.QuickMsg.msg('Выполнено', 'Данные успешно сохранены', 'success');
                        view.close();
                    } else {
                        B4.QuickMsg.msg('Внимание', response.message, 'warning');
                    }
                }).error(function (resp) {
                    view.getEl().unmask();
                    B4.QuickMsg.msg('Внимание', 'При выполнении операции произошла ошибка', 'warning');
                });
            }
        });
    },

    onDelete: function (btn) {
        var view = btn.up('window'),
            values = view.getForm().getValues();

        if (!view.down('datefield[name=DateBegin]').isValid()) {
            B4.QuickMsg.msg('Внимание', 'Дата начала периода заполнена некорректно', 'warning');
            return;
        }
        if (!view.down('datefield[name=DateEnd]').isValid()) {
            B4.QuickMsg.msg('Внимание', 'Дата окончания периода заполнена некорректно', 'warning');
            return;
        }

        Ext.Msg.confirm('Внимание', 'Вы действительно хотите удалить указанные периоды запрета перерасчета?', function (ans) {
            if (ans === 'yes') {
                view.getEl().mask('Удаление...');
                B4.Ajax.request({
                    url: B4.Url.action('/ProhibitedCalcPeriod/DeleteGroup'),
                    timeout: 9999999,
                    params: {
                        dataBankId: view.dataBankId,
                        personalAccountList: Ext.encode(view.selectedPersonalAccountList),
                        serviceList: Ext.encode(values.Service),
                        supplier: values.Supplier,
                        dateBegin: values.DateBegin,
                        dateEnd: values.DateEnd
                    }
                }).next(function (resp) {
                    view.getEl().unmask();
                    var response = Ext.decode(resp.responseText);
                    if (response.success) {
                        B4.QuickMsg.msg('Выполнено', 'Операция выполнена успешно', 'success');
                        view.close();
                    } else {
                        B4.QuickMsg.msg('Внимание', response.message, 'warning');
                    }
                }).error(function () {
                    B4.QuickMsg.msg('Внимание', 'В связи с тем, что было выбрано большое количество лицевых счетов, операция продолжает выполняться в фоне, результат операции можно посмотреть в логах', 'info', 20000);
                });
            }
        });
    },

    initComponent: function () {
        var me = this,
            supplierStore = Ext.create('B4.store.finance.SupplierFin'),
            serviceStore = Ext.create('B4.store.finance.ServicesFin', {
                autoLoad: false
            });

        Ext.applyIf(me, {
            items: [
                {
                    xtype: 'container',
                    margin: '0 0 5 0',
                    layout: {
                        type: 'hbox',
                        align: 'stretch'
                    },
                    items: [
                        {
                            xtype: 'b4billmonthpicker',
                            allowBlank: false,
                            name: 'DateBegin',
                            labelAlign: 'right',
                            fieldLabel: 'Период запрета перерасчета с',
                            labelWidth: 180,
                            width: 300,
                            margin: '0 10 0 0',
                            listeners: {
                                change: function (cmp) {
                                    cmp.up('window').getForm().isValid();
                                }
                            },
                            validator: function (val) {
                                var endField = this.up('container').down('[name=DateEnd]');
                                return me.valudation(this, endField);
                            }
                        },
                        {
                            xtype: 'b4billmonthpicker',
                            allowBlank: false,
                            name: 'DateEnd',
                            fieldLabel: 'по',
                            labelWidth: 20,
                            lastDayInMonth: true,
                            width: 150,
                            listeners: {
                                change: function (cmp) {
                                    cmp.up('window').getForm().isValid();
                                }
                            },
                            validator: function (val) {
                                var beginField = this.up('container').down('[name=DateBegin]');
                                return me.valudation(beginField, this);
                            }
                        }
                    ]
                },
                {
                    xtype: 'b4selectfieldcontracts',
                    name: 'Supplier',
                    queryMode: 'local',
                    anchor: '100%',
                    labelWidth: 180,
                    labelAlign: 'right',
                    store: supplierStore,
                    fieldLabel: 'Договор ЖКУ'
                },
                {
                    xtype: 'b4selectfield',
                    name: 'Service', 
                    emptyText: 'По всем услугам',                    
                    anchor: '100%',
                    labelWidth: 180,
                    labelAlign: 'right',                  
                    store: serviceStore,
                    fieldLabel: 'Услуги',
                    selectionMode: 'MULTI'
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
                                    name: 'Save',
                                    text: 'Сохранить',
                                    iconCls: 'icon-accept',
                                    listeners: {
                                        click: me.save
                                    }
                                },
                                {
                                    xtype: 'button',
                                    name: 'Delete',
                                    text: 'Удалить',
                                    iconCls: 'icon-delete',
                                    listeners: {
                                        click: me.onDelete
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
                }
            ]
        });

        me.callParent(arguments);
    },

    valudation: function (beginField, endField) {
        var beginValue = beginField.getValue(),
            endValue = endField.getValue();

        if (beginValue == null || endValue == null) {
            return true;
        }

        if (beginValue > endValue) {
            return 'Дата начала не может быть больше конца';
        }
       
        return true;
    }
});