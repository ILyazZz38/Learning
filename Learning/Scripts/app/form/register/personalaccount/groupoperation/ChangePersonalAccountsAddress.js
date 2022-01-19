Ext.define('B4.form.register.personalaccount.groupoperation.ChangePersonalAccountsAddress', {
    extend: 'B4.form.Window',
    alias: 'widget.changepersonalaccountsaddressgroup',

    mixins: ['B4.mixins.window.ModalMask'],
    width: 600,
    height: 210,
    layout: 'anchor',
    title: 'Смена адреса лицевых счетов',
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
        'B4.ux.grid.toolbar.Paging',
        'Ext.form.FieldSet'
    ],

    listeners: {
        afterrender: function (view) {
            view.down('textfield[name=BankName]').setValue(view.dataBank.name);
            view.down('textfield[name=PersonalAccountCount]').setValue(view.countPersonalAccount);
            view.getForm().isValid();
        }
    },

    save: function (btn) {
        var view = btn.up('window'),
            house = view.down('b4selectfield[name=HouseId]').getValue();

        view.getEl().mask('Проверка типа дома ...');
        B4.Ajax.request({
            url: B4.Url.action('/PersonalAccount/CheckChangePersonalAccountsAddress'),
            timeout: 9999999,
            params: {
                houseId: house.HouseId,
                dataBankId: view.dataBank.id,
                personalAccountList: Ext.encode(view.selectedPersonalAccountList)
            }
        }).next(function (resp) {

            var res = Ext.decode(resp.responseText);

            view.getEl().unmask();
            
            if (!res.success){
                B4.QuickMsg.msg('Внимание', res.message, 'warning');
                return;
            }
            else {
                if (res.message  == ""){
                    view.changeAddress(view);
                }
                else {
                    Ext.Msg.defaultButton = 'no';
                    Ext.Msg.confirm('Изменение адреса', res.message, function (result) {
                        if (result == 'yes') {
                            view.changeAddress(view);
                        }
                    }, view);
                }
            }
            
        }).error(function (resp) {
            view.getEl().unmask();
            B4.QuickMsg.msg('Внимание', 'При выполнении операции произошла ошибка', 'warning');
        });
        
      
    },
    
    changeAddress: function(view){
        var  house = view.down('b4selectfield[name=HouseId]').getValue();
        view.getEl().mask('Сохранение...');
        B4.Ajax.request({
            url: B4.Url.action('/PersonalAccount/ChangePersonalAccountsAddress'),
            timeout: 9999999,
            params: {
                houseId: house.HouseId,
                dataBankId: view.dataBank.id,
                personalAccountList: Ext.encode(view.selectedPersonalAccountList)
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
            housesStore = Ext.create('B4.store.register.house.grid.House', {
                listeners: {
                    beforeload: function (curStore, operation) {
                        operation.params = operation.params || {};
                        operation.params.dataBankId = me.dataBank.id;
                    }
                }
            });

        Ext.applyIf(me, {
            defaults: {
            },
            items: [
                {
                    xtype: 'textfield',
                    fieldLabel: 'В списке содержатся лицевые счета из банка данных',
                    anchor: '100%',
                    labelWidth: 310,
                    labelAlign: 'right',
                    disabled: true,
                    margin: '0 0 10 0',
                    name: 'BankName'
                },
                {
                    xtype: 'textfield',
                    fieldLabel: 'Всего выбрано лицевых счетов',
                    anchor: '100%',
                    labelWidth: 310,
                    labelAlign: 'right',
                    disabled: true,
                    margin: '0 0 10 0',
                    name: 'PersonalAccountCount'
                },
                 {
                     xtype: 'fieldset',
                     layout: 'hbox',
                     anchor: '100%',
                     title: 'Новый адрес',
                     items: [
                         {
                             xtype: 'b4selectfield',
                             name: 'HouseId',
                             store: housesStore,
                             idProperty: 'HouseId',
                             labelAlign: 'right',
                             labelWidth: 50,
                             width: '100%',
                             textProperty: 'Address',
                             isGetOnlyIdProperty: false,
                             fieldLabel: 'Дом',
                             modalWindow: true,
                             allowBlank: false,
                             editable: false,
                             columns: [
                                 {
                                     text: 'Адрес',
                                     dataIndex: 'Address',
                                     flex: 2,
                                     filter: { xtype: 'textfield' }
                                 },
                                 {
                                     text: 'Управляющая организация',
                                     dataIndex: 'ManagementOrganizationName',
                                     flex: 1,
                                     filter: { xtype: 'textfield' }
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
                                    xtype: 'button',
                                    name: 'Save',
                                    text: 'Выполнить смену адреса',
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