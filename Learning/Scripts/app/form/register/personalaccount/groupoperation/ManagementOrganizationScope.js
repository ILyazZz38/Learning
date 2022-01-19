/*
  Установка областей действия управляющей компании (УК)
*/
Ext.define('B4.form.register.personalaccount.groupoperation.ManagementOrganizationScope', {
    extend: 'B4.form.Window',
    alias: 'widget.managementorganizationscopegroup',

    mixins: ['B4.mixins.window.ModalMask'],
    width: 980,
    minWidth: 980,
    minHeight: 500,
    maxHeight: 500,
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    constrain: true,
    title: 'Установка областей действия управляющей компании (УК)',
    // bodyPadding: 10,

    dataBankId: undefined,
    selectedPersonalAccountList: undefined,
    isHouses: false,

    requires: [
        'B4.ux.button.Close',
        'B4.form.MonthPicker',
        'B4.ux.button.Save',
        'B4.form.ComboBox',
        'B4.store.finance.PackLog',
        'B4.ux.grid.toolbar.Paging',
        'B4.enums.TypeSaldoEditServiceStandart'
    ],

    listeners: {
        afterrender: function (view) {
            var me = this,
                grid = view.down('gridpanel'),
                dateBegin = view.down('b4calcmonthpicker[name=DateBegin]');
            B4.Ajax.request({
                url: B4.Url.action('/CalculationMonth/GetCalculationMonth')
            }).next(function (resp) {
                var response = Ext.decode(resp.responseText);

                //Устанавливаем в окончание периода текущий расчетный месяц
                if (dateBegin.getValue() == null)
                    dateBegin.setValue(response.data.CalculationMonth);
                grid.store.on({
                    beforeload: function (curStore, operation) {
                        operation.params = operation.params || {};
                        operation.params.DateBegin = dateBegin.getValue();
                        operation.params.HouseList = Ext.encode(view.selectedPersonalAccountList);
                    },
                    load: function () {
                        me.isLoad = true;
                        view.down('b4updatebutton[name=Update]').setDisabled(false);
                        view.down('button[name=Save]').setDisabled(false);
                        view.down('b4calcmonthpicker[name=DateBegin]').setDisabled(false);
                    }
                });
                grid.store.load();
            });

            view.getForm().isValid();
        }
    },

    save: function (btn) {
        var view = btn.up('window'),
            me = this;
        var list = view.down('gridpanel').store.getRange().map(function (item) {
            return { id: item.get("Id") }
        });

        if (!view.getForm().isValid()) {
            B4.QuickMsg.msg('Внимание', 'Не все поля корректно заполнены', 'warning');
            return;
        }
        Ext.Msg.confirm("Области действия УК",
              'Вы действительно хотите выполнить операцию Установки области действия УК?', function (result) {

                  if (result == 'yes') {

                      view.getEl().mask('Сохранение...');
                      B4.Ajax.request({
                          url: B4.Url.action('/HouseManagementOrganizationScope/SaveManagementOrganizationScope'),
                          timeout: 9999999,
                          params: {
                              List: Ext.encode(list),
                              DateBegin: view.down('b4calcmonthpicker[name=DateBegin]').getValue(),
                              DateEnd: view.down('b4monthpicker[name=DateEnd]').getValue(),
                              ManagementOrganizationId: view.down('b4selectfield[name=ManagementOrganizationId]').getValue()
                          }
                      }).next(function (resp) {
                          view.getEl().unmask();
                          var response = Ext.decode(resp.responseText);
                          if (response.success) {
                              B4.QuickMsg.msg('Выполнено', 'Операция успешно выполнена', 'success');
                              view.close();
                          } else {
                              B4.QuickMsg.msg('Внимание', response.message, 'warning');
                          }
                      }).error(function (resp) {
                          view.getEl().unmask();
                          B4.QuickMsg.msg('Внимание', resp.message, 'warning');
                      });
                  }
              }, me);

    },
    isLoad: false,
    initComponent: function () {
        var me = this,
            store = Ext.create('B4.store.register.house.ManagementOrganizationScope');

        Ext.applyIf(me, {
            layout: 'anchor',
            flex: 1,
            items: [
                {
                    xtype: 'fieldset',
                    layout: 'anchor',
                    items: [
                         {
                             xtype: 'label',
                             text: 'В реестре содержатся дома из банка данных:'
                         },
                        {
                            xtype: 'textareafield',
                            editable: false,
                            margin: '5 0 5 20',
                            anchor: '100%',
                            disabled: true,
                            value: me.dataBankNamesList.toString()
                        },
                        {
                            xtype: 'label',
                            text: 'Всего выбрано домов: ' + me.countPersonalAccount,
                            cls: 'tomato-text'
                        }
                    ]
                },
                {
                    xtype: 'container',
                    layout: 'hbox',
                    items: [
                        {
                            xtype: 'b4calcmonthpicker',
                            name: 'ChargeDate',
                            labelWidth: 160,
                            margin: '5 0 0 0',
                            labelAlign: 'right',
                            disabled: true,
                            fieldLabel: 'Расчетный месяц'
                        },
                        {
                            xtype: 'b4selectfield',
                            anchor: '100%',
                            margin: '5 10 0 10',
                            name: 'ManagementOrganizationId',
                            flex: 1,
                            displayField: 'Name',
                            valueField: 'Id',
                            queryMode: 'local',
                            editable: false,
                            store: 'B4.store.finance.ManagementOrganizationFin',
                            allowBlank: false,
                            fieldLabel: 'Управляющая компания'
                        }
                    ]
                },
                {
                    xtype: 'container',
                    anchor: '0 0',
                    flex: 1,
                    layout: {
                        type: 'hbox',
                        align: 'stretch'
                    },
                    items: [
                        {
                            xtype: 'container',
                            items: [
                                {
                                    xtype: 'b4calcmonthpicker',
                                    name: 'DateBegin',
                                    labelWidth: 160,
                                    margin: '10 0 0 0',
                                    disabled: true,
                                    allowBlank: false,
                                    editable: true,
                                    labelAlign: 'right',
                                    fieldLabel: 'Месяц начала действия',
                                    listeners: {
                                        change: function (field) {
                                            if (me.isLoad)
                                                field.up('managementorganizationscopegroup').down('gridpanel').store.reload();
                                        }
                                    }
                                },
                                {
                                    xtype: 'b4monthpicker',
                                    fieldLabel: 'Месяц окончания действия',
                                    labelWidth: 160,
                                    margin: '5 0 0 0',
                                    labelAlign: 'right',
                                    name: 'DateEnd',
                                    allowBlank: false,
                                    value: new Date(3000, 0, 1)
                                }
                            ]
                        },
                        {
                            xtype: 'gridpanel',
                            anchor: '0 0',
                            flex: 1,
                            store: store,
                            margin: 10,
                            columnLines: true,
                            name: 'citizenship',
                            columns: [
                                {
                                    xtype: 'gridcolumn',
                                    flex: 1,
                                    text: 'Код УК',
                                    dataIndex: 'Id'
                                },
                                {
                                    xtype: 'gridcolumn',
                                    flex: 5,
                                    text: 'Действующие УК',
                                    dataIndex: 'ManagementOrganization'
                                },
                                {
                                    xtype: 'gridcolumn',
                                    flex: 1,
                                    text: 'Общая площадь ЛС',
                                    dataIndex: 'TotalSquare'
                                },
                                {
                                    xtype: 'gridcolumn',
                                    flex: 1,
                                    text: 'Количество ЛС',
                                    dataIndex: 'CountPersonalAccount'
                                },
                                {
                                    xtype: 'gridcolumn',
                                    flex: 1,
                                    text: 'Количество домов',
                                    dataIndex: 'CountHouse'
                                }
                            ],
                            viewConfig: {
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
                                            xtype: 'b4updatebutton',
                                            disabled: true,
                                            name: 'Update',
                                            listeners: {
                                                click: function (button) {
                                                    var grid = button.up('managementorganizationscopegroup').down('gridpanel');
                                                    grid.store.reload();
                                                }
                                            }
                                        },
                                        {
                                            xtype: 'button',
                                            name: 'Save',
                                            text: 'Установить области действия УК',
                                            disabled: true,
                                            iconCls: 'icon-accept',
                                            listeners: {
                                                click: me.save
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
    }
});