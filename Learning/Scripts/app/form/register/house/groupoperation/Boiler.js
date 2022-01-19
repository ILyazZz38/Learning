/*
   Окно групповых операций с котельными
*/
Ext.define('B4.form.register.house.groupoperation.Boiler', {
    extend: 'B4.form.Window',
    alias: 'widget.boilergroup',

    mixins: ['B4.mixins.window.ModalMask'],
    width: 500,
    autoHeight: true,
    layout: 'anchor',
    title: 'Групповые операции с котельными',
    bodyPadding: 10,

    dataBank: undefined,
    selectedHouses: undefined,
    isHouses: false,

    requires: [
        'B4.ux.button.Close',
        'B4.form.SelectField',
        'B4.ux.button.Save',
        'B4.form.ComboBox'
    ],

    listeners: {
        afterrender: function (view) {
            var me = this,
                boilerField = view.down('b4selectfield[name=BoilerId]'),
                serviceField = view.down('b4combobox[name=ServiceId]'),
                selectedBankLabel = view.down('label[name=SelectedBank]'),
                personalAccountCountLabel = view.down('label[name=PersonalAccountCount]');

            selectedBankLabel.setText('Выбраны дома из банка данных: ' + me.dataBank.get('Name'));
            personalAccountCountLabel.setText('Всего выбрано домов: ' + me.selectedHouses.length);

            boilerField.getStore().on({
                beforeload: function (curStore, operation) {
                    operation.params = operation.params || {};
                    operation.params.dataBankId = me.dataBank.getId();
                    operation.params.houseIdList = Ext.encode(me.selectedHouses);
                }
            });

            serviceField.getStore().on({
                beforeload: function (curStore, operation) {
                    operation.params = operation.params || {};
                    operation.params.dataBankId = me.dataBank.getId();
                    operation.params.houseIdList = Ext.encode(me.selectedHouses);
                }
            });
            serviceField.getStore().load();

            view.getForm().isValid();
        }
    },

    save: function (btn) {
        var view = btn.up('window'),
            form = view.getForm();

        if (!form.isValid()) {
            B4.QuickMsg.msg('Внимание', 'Не все поля корректно заполнены', 'warning');
            return;
        }

        Ext.Msg.confirm('Сохранение', 'Вы действительно хотите сохранить указанные котельные?', function (answer) {
            if (answer == 'yes') {
                view.getEl().mask('Сохранение...');
                B4.Ajax.request({
                    url: B4.Url.action('/HouseBoiler/GroupSaveBoiler'),
                    timeout: 9999999,
                    params: {
                        houseIdList: Ext.encode(view.selectedHouses),
                        dataBankId: view.dataBank.getId(),
                        record: Ext.encode(form.getValues())
                    }
                }).next(function (resp) {
                    view.getEl().unmask();
                    var response = Ext.decode(resp.responseText);
                    if (response.success) {
                        B4.QuickMsg.msg('Выполнено', response.message, 'success');
                        view.close();
                    } else {
                        B4.QuickMsg.msg('Внимание', resp.message, 'warning');
                    }
                }).error(function (resp) {
                    view.getEl().unmask();
                    B4.QuickMsg.msg('Внимание', 'При выполнении операции произошла ошибка', 'warning');
                });
            }
        });
    },

    delete: function (btn) {
        var view = btn.up('window'),
            form = view.getForm();

        if (!form.isValid()) {
            B4.QuickMsg.msg('Внимание', 'Не все поля корректно заполнены', 'warning');
            return;
        }

        Ext.Msg.confirm('Удаление', 'Вы действительно хотите удалить указанные котельные?', function (answer) {
            if (answer == 'yes') {
                view.getEl().mask('Удаление...');
                B4.Ajax.request({
                    url: B4.Url.action('/HouseBoiler/GroupDeleteBoiler'),
                    timeout: 9999999,
                    params: {
                        houseIdList: Ext.encode(view.selectedHouses),
                        dataBankId: view.dataBank.getId(),
                        record: Ext.encode(form.getValues())
                    }
                }).next(function (resp) {
                    view.getEl().unmask();
                    var response = Ext.decode(resp.responseText);
                    if (response.success) {
                        B4.QuickMsg.msg('Выполнено', 'Данные успешно удалены', 'success');
                        view.close();
                    } else {
                        B4.QuickMsg.msg('Внимание', resp.message, 'warning');
                    }
                }).error(function (resp) {
                    view.getEl().unmask();
                    B4.QuickMsg.msg('Внимание', 'При выполнении операции произошла ошибка', 'warning');
                });
            }
        });
    },

    initComponent: function () {
        var me = this,
            boilerStore = Ext.create('B4.store.dict.Boiler'),
            serviceStore = Ext.create('B4.store.register.house.boiler.BoilerServiceList', {
            listeners: {
                load: function (store) {
                    if (!store.data.length) {
                        B4.QuickMsg.msg('Внимание', 'У выбранных домов не открыты услуги, связанные с котельными', 'warning');
                    }
                }
            }
        });

        Ext.applyIf(me, {
            items: [
                {
                    xtype: 'label',
                    margin: 5,
                    name: 'SelectedBank'
                },
                {
                    xtype: 'container'
                },
                {
                    xtype: 'label',
                    margin: 5,
                    name: 'PersonalAccountCount'
                },
                {
                    xtype: 'b4selectfield',
                    store: boilerStore,
                    name: 'BoilerId',
                    margin: 5,
                    modal: true,
                    anchor: '100%',
                    fieldLabel: 'Котельная',
                    displayField: 'Name',
                    valueField: 'Id',
                    editable: false,
                    allowBlank: false,
                    columns: [
                        {
                            text: 'Наименование',
                            dataIndex: 'Name',
                            flex: 1,
                            filter: {
                                xtype: 'textfield'
                            }
                        }
                    ]
                },
                {
                    xtype: 'b4combobox',
                    name: 'ServiceId',
                    margin: '0 5 5 5',
                    editable: false,
                    displayField: 'ServiceName',
                    valueField: 'Id',
                    anchor: '100%',
                    queryMode: 'local',
                    fieldLabel: 'Услуга',
                    allowBlank: false,
                    store: serviceStore
                },
                {
                    xtype: 'container',
                    layout: {
                        type: 'hbox',
                        align: 'stretch'
                    },
                    items: [
                        {
                            xtype: 'datefield',
                            dateName: 'DateBegin',
                            margin: '0 5 5 5',
                            name: 'DateBegin',
                            fieldLabel: 'Начало действия',
                            width: 200,
                            allowBlank: false,
                            listeners: {
                                change: function () {
                                    this.up('window').getForm().isValid();
                                }
                            },
                            validator: function (val) {
                                var view = this.up('window'),
                                    dateBegin = view.down('[name=DateBegin]'),
                                    dateEnd = view.down('[name=DateEnd]');

                                if (dateEnd.getValue() && Ext.Date.parse(val, 'd.m.Y') > dateEnd.getValue()) {
                                    return 'Дата начала не может быть позже даты окончания';
                                }
                                return true;
                            }
                        },
                        {
                            xtype: 'datefield',
                            dateName: 'DateEnd',
                            margin: '0 5 5 5',
                            name: 'DateEnd',
                            fieldLabel: 'Окончание действия',
                            labelWidth: 120,
                            width: 220,
                            listeners: {
                                change: function () {
                                    this.up('window').getForm().isValid();
                                }
                            },
                            validator: function (val) {
                                var view = this.up('window'),
                                    dateBegin = view.down('[name=DateBegin]'),
                                    dateEnd = view.down('[name=DateEnd]');

                                if (dateBegin.getValue() && Ext.Date.parse(val, 'd.m.Y') < dateBegin.getValue()) {
                                    return 'Дата окончания не может быть раньше даты начала';
                                }
                                return true;
                            }
                        },
                        {
                            xtype: 'container',
                            flex: 1
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
                                    iconCls: 'icon-cancel',
                                    listeners: {
                                        click: me.delete
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