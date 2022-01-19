Ext.define('B4.form.register.house.groupoperation.SetSquarePremise', {
    extend: 'B4.form.Window',
    alias: 'widget.setsquarepremisegroup',

    mixins: ['B4.mixins.window.ModalMask'],
    width: 420,
    height: 110,
    layout: 'anchor',
    title: 'Установить площади жилых/нежилых помещений',
    bodyPadding: 10,

    dataBank: undefined,
    selectedPersonalAccountList: undefined,
    isHouses: false,

    requires: [
        'B4.ux.button.Close',
        'B4.form.MonthPicker',
        'B4.ux.button.Save'
    ],

    listeners: {
        afterrender: function (view) {
            view.getForm().isValid();
        }
    },

    save: function(btn) {
        var view = btn.up('window');
        view.getEl().mask('Сохранение...');
        var darS = view.down('b4monthpicker[name=DateFrom]').getValue(),
            darPo = view.down('b4monthpicker[name=DateTo]').getValue();

        Ext.Msg.confirm('Предупреждение', 'Вы выбрали период ' + darS.toLocaleDateString() + ' - ' + darPo.toLocaleDateString() + '. ' +
            'В данный период в выбранных домах параметры "Площадь нежилых помещений дома" и "Площадь жилых помещений дома" будут перерассчитаны. Вы хотите продолжить?', function(answer) {

                if (answer === 'yes') {
                    B4.Ajax.request({
                        url: B4.Url.action('/PersonalAccount/SetSquarePremise'),
                        timeout: 9999999,
                        params: {
                            DateFrom: darS,
                            DateTo: darPo,
                            housesIdList: Ext.encode(view.selectedPersonalAccountList), //тут всё-таки дома
                            dataBankId: view.dataBankId
                        }
                    }).next(function(resp) {
                        view.getEl().unmask();
                        var response = Ext.decode(resp.responseText);
                        if (response.success) {
                            B4.QuickMsg.msg('Выполнено', 'Задача поставленна на выполнение', 'success');
                            view.close();
                        } else {
                            B4.QuickMsg.msg('Внимание', response.message, 'warning');
                        }
                    }).error(function(resp) {
                        view.getEl().unmask();
                        B4.QuickMsg.msg('Внимание', 'При выполнении операции произошла ошибка', 'warning');
                    });
                }
                view.getEl().unmask();
            });
    },

    initComponent: function () {
        var me = this;
        
        Ext.applyIf(me, {
            items: [
                {
                    xtype: 'container',
                    layout: 'hbox',
                    defaults: {
                        flex: 1
                    },
                    items: [
                        {
                            xtype: 'b4monthpicker',
                            fieldLabel: 'Период с',
                            name: 'DateFrom',
                            labelWidth: 60,
                            labelAlign: 'right',
                            flex: 1,
                            allowBlank: false,
                            validator: function () {
                                var endDate = this.up('container').down('b4monthpicker[name=DateTo]');
                                if (endDate.getValue() < this.getValue()) {
                                    return 'Дата начала не может быть позже даты окончания';
                                }
                                return true;
                            },
                            listeners: {
                                change: function () {
                                    this.up('window').getForm().isValid();
                                },
                                afterrender: function(cmp) {
                                    B4.Ajax.request({
                                        url: B4.Url.action('/OperDay/Get')
                                    }).next(function(resp) {
                                        var response = Ext.decode(resp.responseText);
                                        var calcMonth = new Date(response.data.OperDate);
                                        cmp.setValue(calcMonth);
                                    });
                                }
                            }
                        },
                        {
                            xtype: 'b4monthpicker',
                            fieldLabel: 'по',
                            name: 'DateTo',
                            labelWidth: 60,
                            labelAlign: 'right',
                            flex: 1,
                            allowBlank: false,
                            listeners: {
                                change: function () {
                                    this.up('window').getForm().isValid();
                                },
                                afterrender: function (cmp) {
                                    B4.Ajax.request({
                                        url: B4.Url.action('/OperDay/Get')
                                    }).next(function (resp) {
                                        var response = Ext.decode(resp.responseText);
                                        var calcMonth = new Date(response.data.OperDate);
                                        cmp.setValue(calcMonth);
                                        cmp.setMaxValue(calcMonth);
                                    });
                                }
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
                                    xtype: 'button',
                                    name: 'Save',
                                    text: 'Установить',
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