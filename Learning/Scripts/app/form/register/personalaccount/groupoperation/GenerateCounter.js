Ext.define('B4.form.register.personalaccount.groupoperation.GenerateCounter', {
    extend: 'B4.form.Window',
    alias: 'widget.generatecountergroup',

    mixins: ['B4.mixins.window.ModalMask'],
    width: 600,
    height: 570,
    layout: 'anchor',
    title: 'Генерация ИПУ',
    bodyPadding: 10,

    dataBank: undefined,
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
            view.down('textfield[name=BankName]').setValue(view.dataBank.name);
            view.down('textfield[name=PersonalAccountCount]').setValue(view.countPersonalAccount);
            view.down('gridpanel').getStore().load();

            view.getForm().isValid();
        }
    },

    save: function (btn) {
        var view = btn.up('window'),
            grid = view.down('gridpanel'),
            modifiedRecords = grid.getStore().getModifiedRecords(),
            //Получаем только валидные измененные записи
            records = modifiedRecords.filter(function (record) {
                return record.get('Count') && record.get('CounterType');
            }).map(function (record) {
                return {
                    Id: record.get('Id'),
                    Count: record.get('Count'),
                    CounterType: record.get('CounterType')
                };
            });

        //Если есть невалидниые измененные записи, выводим предупреждение
        if (modifiedRecords.filter(function (record) {
            if (record.get('Count') || record.get('CounterType')) {
                return record.get('Count') == undefined || !record.get('CounterType');
        }
            return false;
        }).length > 0) {
            B4.QuickMsg.msg('Внимание', 'У добавляемых приборов учета необходимо указать их количество и тип', 'warning');
            return;
        }
        
        view.getEl().mask('Сохранение...');
        B4.Ajax.request({
            url: B4.Url.action('/Counter/GenerateIndividualCounter'),
            timeout: 9999999,
            params: {
                dataBankId: view.dataBank.id,
                personalAccountList: Ext.encode(view.selectedPersonalAccountList),
                counterList: Ext.encode(records)
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

    initComponent: function () {
        var me = this,
            serviceStore = Ext.create('B4.store.register.house.services.AvailableServices'),
            counterTypeStore = Ext.create('B4.store.register.personalaccount.counter.CounterType', {
                listeners: {
                    beforeload: function (curStore, operation) {
                        operation.params = operation.params || {};
                        operation.params.dataBankId = me.dataBank.id;
                    }
                }
            });

        Ext.applyIf(me, {
            items: [
                {
                    xtype: 'textfield',
                    fieldLabel: 'В списке содержатся лицевые счета из банка данных',
                    anchor: '100%',
                    labelWidth: 310,
                    disabled: true,
                    margin: '0 0 10 0',
                    name: 'BankName'
                },
                {
                    xtype: 'textfield',
                    fieldLabel: 'Всего выбрано лицевых счетов',
                    anchor: '100%',
                    labelWidth: 190,
                    disabled: true,
                    margin: '0 0 10 0',
                    name: 'PersonalAccountCount'
                },
                {
                    xtype: 'gridpanel',
                    anchor: '0 -60',
                    name: 'Services',
                    store: serviceStore,
                    columns: [
                        {
                            text: 'Услуга',
                            dataIndex: 'ServiceName',
                            sortable: false,
                            hideable: false,
                            flex: 2
                        },
                        {
                            text: 'Количество',
                            dataIndex: 'Count',
                            sortable: false,
                            hideable: false,
                            flex: 1,
                            getEditor: function (record) {
                                return Ext.create('Ext.grid.CellEditor', {
                                    field: Ext.create('Ext.form.field.Number', {
                                        minValue: 0,
                                        decimalPrecision: 0
                                    })
                                });
                            }
                        },
                        {
                            text: 'Тип прибора учета',
                            dataIndex: 'CounterType',
                            sortable: false,
                            hideable: false,
                            flex: 1.5,
                            renderer: function (value, metaData, record) {
                                var typeRecord = counterTypeStore.findRecord('Id', value);
                                return typeRecord
                                    ? typeRecord.get('Name')
                                    : '';
                            },
                            getEditor: function (record) {
                                return Ext.create('Ext.form.field.ComboBox', {
                                    store: counterTypeStore,
                                    editable: false,
                                    displayField: 'Name',
                                    valueField: 'Id'
                                });
                            }
                        }
                    ],
                    plugins: [
                        Ext.create('Ext.grid.plugin.CellEditing', {
                            clicksToEdit: 1,
                            pluginId: 'cellEditing'
                        })
                    ],
                    viewConfig: {
                        markDirty: false
                    }
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
                                    text: 'Сгенерировать',
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