Ext.define('B4.form.register.personalaccount.groupoperation.SignAllocation', {
    extend: 'B4.form.Window',
    alias: 'widget.signallocationgroup',

    mixins: ['B4.mixins.window.ModalMask'],
    width: 500,
    autoHeight: true,
    layout: 'anchor',
    title: 'Групповая операция с признаками перерасчета',
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
        'B4.ux.grid.toolbar.Paging'
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

        view.getEl().mask('Сохранение...');
        B4.Ajax.request({
            url: B4.Url.action('/SignAllocation/SaveGroup'),
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
    },

    onDelete: function (btn) {
        var view = btn.up('window'),
            values = view.getForm().getValues();

        if (!view.getForm().isValid()) {
            B4.QuickMsg.msg('Внимание', 'Не все поля корректно заполнены', 'warning');
            return;
        }

        Ext.Msg.confirm('Внимание', 'Вы действительно хотите удалить указанные признаки перерасчета?', function(ans) {
            if (ans === 'yes') {
                view.getEl().mask('Удаление...');
                B4.Ajax.request({
                    url: B4.Url.action('/SignAllocation/DeleteGroup'),
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
                }).next(function(resp) {
                    view.getEl().unmask();
                    var response = Ext.decode(resp.responseText);
                    if (response.success) {
                        B4.QuickMsg.msg('Выполнено', 'Операция выполнена успешно', 'success');
                        view.close();
                    } else {
                        B4.QuickMsg.msg('Внимание', response.message, 'warning');
                    }
                }).error(function() {
                    view.getEl().unmask();
                    B4.QuickMsg.msg('Внимание', 'В связи с тем, что было выбрано большое количество лицевых счетов, операция продолжает выполняться в фоне, результат операции можно посмотреть в логах', 'info', 20000);
                });
            }
        });
    },

    initComponent: function () {
        var me = this,
            supplierStore = Ext.create('B4.store.finance.SupplierFin'),
            serviceStore = Ext.create('B4.store.finance.ServicesFin');

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
                            xtype: 'datefield',
                            allowBlank: false,
                            name: 'DateBegin',
                            fieldLabel: 'Период перерасчета с',
                            labelWidth: 140,
                            width: 240,
                            margin: '0 10 0 0',
                            listeners: {
                                change: function (cmp) {
                                    cmp.up('window').getForm().isValid();
                                }
                            },
                            validator: function (val) {
                                var endField = this.up('container').down('[name=DateEnd]');
                                return me.valudation(Ext.Date.parse(val, 'd.m.Y'), this, endField);
                            }
                        },
                        {
                            xtype: 'datefield',
                            allowBlank: false,
                            name: 'DateEnd',
                            fieldLabel: 'по',
                            labelWidth: 20,
                            width: 120,
                            listeners: {
                                change: function (cmp) {
                                    cmp.up('window').getForm().isValid();
                                }
                            },
                            validator: function (val) {
                                var beginField = this.up('container').down('[name=DateBegin]');
                                return me.valudation(Ext.Date.parse(val, 'd.m.Y'), beginField, this);
                            }
                        }
                    ]
                },
                {
                    xtype: 'b4selectfieldcontracts',
                    name: 'Supplier',
                    queryMode: 'local',
                    anchor: '100%',
                    labelWidth: 140,
                    store: supplierStore,
                    fieldLabel: 'Договор ЖКУ'
                },
                {
                    xtype: 'b4selectfield',
                    name: 'Service',
                    queryMode: 'local',
                    anchor: '100%',
                    labelWidth: 140,
                    allowBlank: false,
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
                                    name: 'DeleteMustCalc',
                                    text: 'Удалить',
                                    iconCls: 'icon-accept',
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

    valudation: function (val, beginField, endField, showVal) {
        var beginValue = beginField.getValue(),
            endValue = endField.getValue(),
            beginDisplay = Ext.Date.format(beginValue, 'd.m.Y'),
            endDisplay = Ext.Date.format(endValue, 'd.m.Y');


        if (beginValue == null || endValue == null) {
            return true;
        }

        if (val > endValue) {
            return 'Значение должно быть меньше ' + (endDisplay != '' ? endDisplay : endValue);
        }
        if (val < beginValue) {
            return 'Значение должно быть больше ' + (beginDisplay != '' ? beginDisplay : beginValue);
        }

        return true;
    }
});