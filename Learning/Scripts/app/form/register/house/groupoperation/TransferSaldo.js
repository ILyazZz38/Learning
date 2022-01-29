/*Окно групповых операций с домами: Перенос сальдо*/
Ext.define("B4.form.register.house.groupoperation.TransferSaldo", {
    extend: 'B4.form.Window',
    alias: 'widget.transfersaldogroupoperation',
    mixins: ['B4.mixins.window.ModalMask'],
    layout: 'anchor',
    autoHeight: true,
    width: 600,
    minWidth: 600,
    title: 'Групповые операции с домами: перенос сальдо',
    constrain: true,
  
    parentView: undefined,
    dataBankId: undefined,
    selectedPersonalAccountList: undefined,

    requires: [
        'B4.ux.button.Close',
        'B4.ux.button.Save',
        'B4.form.ComboBox',
        'B4.form.SelectField'
    ],
    
    listeners: {
        afterrender: function(view) {
            view.getForm().isValid();
        }
    },

    initComponent: function () {
        var me = this;

        Ext.applyIf(me, {
            defaults: {
                margin: '10 5 5 5',
                labelWidth: 150,
                anchor: "100%"
            },
           
            items: [
                {
                    xtype: 'b4combobox',
                    name: 'TransferId',
                    fieldLabel: 'Вид переноса сальдо',
                    labelWidth: 160,
                    allowBlank: false,
                    editable: false,
                    valueField: 'Id',
                    width: "100%",
                    displayField: 'Name',
                    url: '/HouseChangeManagementOrganization/GetListSaldoTransfers',
                    listeners: {
                        'change': function(field) {
                            var ServiceIdTo = me.down('b4combobox[name=ServiceIdTo]');
                            var SupplierIdTo = me.down('b4combobox[name=SupplierIdTo]');
                            if (field.getValue() == null || field.getValue() == "")
                                return;

                            if (field.getValue() == 4 || field.getValue() == 6 || field.getValue() == 7) //Снятие (обнуление) общего/дебитового/кредитового сальдо
                            {
                                ServiceIdTo.clearValue();
                                ServiceIdTo.setDisabled(true);
                                SupplierIdTo.clearValue();
                                SupplierIdTo.setDisabled(true);
                            }
                            else 
                            {
                                ServiceIdTo.setDisabled(false);
                            }
                    }
                    }
                },
                {
                    xtype: 'container',
                    layout: 'hbox',
                    items: [
                        {
                            xtype: 'b4monthpicker',
                            name: 'DateStart',
                            allowBlank: false,
                            labelWidth: 160,
                            flex: 1,
                            fieldLabel: 'Месяц начала действия',
                            format: 'm.Y'
                        },
                         {
                             xtype: 'b4monthpicker',
                             name: 'DateEnd',
                             margin: '0 0 0 30',
                             labelWidth: 160,
                             flex: 1,
                             fieldLabel: 'Месяц окончания действия',
                             format: 'm.Y'
                         }
                    ]
                },
                {
                    xtype: 'container',
                    layout: 'hbox',
                    items: [
                        {
                            xtype: 'b4combobox',
                            name: 'ServiceIdFrom',
                            margin: '10 5 5 0',
                            labelWidth: 160,
                            displayField: 'Name',
                            valueField: 'Id',
                            queryMode: 'local',
                            labelAlign: 'top',
                            flex: 1,
                            editable: false,
                            url: '/Service/ListWithoutPaging',
                            fieldLabel: 'Услуга, с которой переносится сальдо',
                            allowBlank: false,
                            listeners: {
                                'change': function (field) {
                                 
                                    var supplierIdFrom = me.down('b4combobox[name=SupplierIdFrom]');
                                    if (me.down('b4combobox[name=ServiceIdFrom]').getValue() == null || me.down('b4combobox[name=ServiceIdFrom]').getValue() == "")
                                        return;
                                    supplierIdFrom.clearValue();
                                    supplierIdFrom.setDisabled(false);
                                    supplierIdFrom.getStore().on({
                                        beforeload: function (curstore, operation) {
                                            operation.params = operation.params || {};
                                            operation.params.serviceId = me.down('b4combobox[name=ServiceIdFrom]').getValue();
                                            operation.params.dataBankId = me.dataBankId;
                                        }
                                    });
                                    supplierIdFrom.getStore().load();
                                }
                            }
                        },
                        {
                            xtype: 'b4combobox',
                            name: 'ServiceIdTo',
                            margin: '10 5 5 0',
                            labelWidth: 160,
                            flex: 1,
                            displayField: 'Name',
                            valueField: 'Id',
                            queryMode: 'local',
                            labelAlign: 'top',
                            editable: false,
                            url: '/Service/ListWithoutPaging',
                            fieldLabel: 'Услуга, на которую переносится сальдо',
                            allowBlank: false,
                            listeners: {
                                'change': function (field) {
                                  
                                    var SupplierIdTo = me.down('b4combobox[name=SupplierIdTo]');
                                    if (me.down('b4combobox[name=ServiceIdTo]').getValue() == null || me.down('b4combobox[name=ServiceIdTo]').getValue() == "") return;
                                    SupplierIdTo.clearValue();
                                    SupplierIdTo.setDisabled(false);
                                    SupplierIdTo.getStore().on({
                                        beforeload: function (curstore, operation) {
                                            operation.params = operation.params || {};
                                            operation.params.serviceId = me.down('b4combobox[name=ServiceIdTo]').getValue();
                                            operation.params.dataBankId = me.dataBankId;
                                        }
                                    });
                                    SupplierIdTo.getStore().load();
                                }
                            }
                        }
                    ]
                },
                {
                    xtype: 'container',
                    layout: 'hbox',
                    items: [
                        {
                            xtype: 'b4combobox',
                            name: 'SupplierIdFrom',
                            margin: '0 5 5 0',
                            labelWidth: 160,
                            flex: 1,
                            displayField: 'NameWithReceiver',
                            valueField: 'Id',
                            queryMode: 'local',
                            labelAlign: 'top',
                            disabled: true,
                            editable: false,
                            storeAutoLoad: false,
                            url: '/Supplier/ListWithoutPaging',
                            fieldLabel: 'Договор ЖКУ, с которого переносится сальдо',
                            allowBlank: false
                        },
                        {
                            xtype: 'b4combobox',
                            name: 'SupplierIdTo',
                            margin: '0 5 5 0',
                            labelWidth: 160,
                            flex: 1,
                            displayField: 'NameWithReceiver',
                            valueField: 'Id',
                            labelAlign: 'top',
                            queryMode: 'local',
                            disabled: true,
                            editable: false,
                            storeAutoLoad: false,
                            url: '/Supplier/ListWithoutPaging',
                            fieldLabel: 'Договор ЖКУ, на который переносится сальдо',
                            allowBlank: false
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
                                    xtype: 'b4savebutton',
                                    listeners: {
                                        click: function (btn) {
                                            btn.up('window').saveData(btn);
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

    saveData: function (btn) {
        var view = this;
        if (view.getForm().isValid()) {
            var
             typeTransfer = view.down('b4combobox[name=TransferId]'),
             dateFromField = view.down('b4monthpicker[name=DateStart]'),
             dateToField = view.down('b4monthpicker[name=DateEnd]'),
             serviceIdFrom = view.down('b4combobox[name=ServiceIdFrom]'),
             serviceIdTo = view.down('b4combobox[name=ServiceIdTo]'),
             supplierIdFrom = view.down('b4combobox[name=SupplierIdFrom]'),
             supplierIdTo = view.down('b4combobox[name=SupplierIdTo]');

            if (view.down('b4monthpicker[name=DateEnd]').getValue() && view.down('b4monthpicker[name=DateStart]').getValue() > view.down('b4monthpicker[name=DateEnd]').getValue()) {
                B4.QuickMsg.msg('Внимание', 'Начало периода не может быть позже окончания', 'warning');
                return;
            }

            view.getEl().mask('Сохранение...');

            B4.Ajax.request({
                url: B4.Url.action('/TransferSaldo/SaveGroupTransferSaldo'),
                timeout: 9999999,
                params: {
                    dateFromField: dateFromField.getValue(),
                    dateToField: dateToField.getValue(),
                    typeTransfer: typeTransfer.getValue(),
                    serviceIdFrom: serviceIdFrom.getValue(),
                    serviceIdTo: serviceIdTo.getValue(),
                    supplierIdFrom: supplierIdFrom.getValue(),
                    supplierIdTo: supplierIdTo.getValue(),
                    selectedPersonalAccountList: Ext.encode(view.selectedPersonalAccountList)
                }
            }).next(function (resp) {
                view.getEl().unmask();
                var response = Ext.decode(resp.responseText);

                if (response.success) {
                    B4.QuickMsg.msg('Выполнено', 'Данные успешно сохранены', 'success');
                } else {
                    B4.QuickMsg.msg('Внимание', response.message, 'warning');
                }

                view.close();
            }).error(function (response) {
                view.getEl().unmask();
                Ext.Msg.alert('Ошибка!', !Ext.isString(response.message) ? 'При выполнении операции произошла ошибка!' : response.message);
            });
        }
        else {
            //получаем все поля формы
            var fields = view.getForm().getFields();

            var invalidFields = '';

            //проверяем, если поле не валидно, то записываем fieldLabel в строку инвалидных полей
            Ext.each(fields.items, function (field) {
                if (!field.isValid()) {
                    invalidFields += '<br>' + field.fieldLabel;
                }
            });

            //выводим сообщение
            Ext.Msg.alert('Ошибка сохранения!', 'Не заполнены обязательные поля: ' + invalidFields);
        }
    }
});