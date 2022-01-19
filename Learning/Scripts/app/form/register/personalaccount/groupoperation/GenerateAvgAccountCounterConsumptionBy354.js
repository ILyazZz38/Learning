Ext.define('B4.form.register.personalaccount.groupoperation.GenerateAvgAccountCounterConsumptionBy354', {
    extend: 'B4.form.Window',

    requires: [
        'B4.ux.form.InfoPanel'
    ],

    modal: true,
    width: 620,
    layout: {
        type: 'hbox',
        align: 'stretch'
    },
    houses: [],

    initComponent: function () {
        var me = this,
            servicesStore = Ext.create('B4.store.dict.service.AvgServiceConsumptionGenerationServices');

        Ext.apply(me,
            {
                title: 'Генерация среднего ИПУ/ОКПУ по 354 пост. в текущем месяце',
                defaults: {
                    margin: 5
                },
                items: [
                    {
                        xtype: 'gridpanel',
                        title: 'Услуги',
                        name: 'Services',
                        padding: 2,
                        flex: 1,
                        store: servicesStore,
                        selModel: Ext.create('Ext.selection.CheckboxModel',
                            {
                                listeners: {
                                    'select': {
                                        fn: me.onSelect,
                                        scope: me
                                    },
                                    'deselect': {
                                        fn: me.onDeselect,
                                        scope: me
                                    }
                                }
                            }),
                        columns: [
                            {
                                dataIndex: 'Name',
                                sortable: false,
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
                                        text: 'Рассчитать',
                                        iconCls: 'icon-accept',
                                        listeners: {
                                            'click': {
                                                fn: me.onSave,
                                                scope: me
                                            }
                                        }
                                    }
                                ]
                            },
                            {
                                xtype: 'tbfill'
                            },
                            {
                                xtype: 'buttongroup',
                                items: [
                                    {
                                        xtype: 'b4closebutton',
                                        handler: function () {
                                            this.up('window').close();
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ],
                listeners: {
                    'afterrender': me.onLoad
                }
            });

        me.callParent(arguments);
    },
    onLoad: function (view) {
        var viewEl = view.getEl();
    },

    onSave: function () {
        var me = this,
            services = this.down('gridpanel[name=Services]').getSelectionModel().getSelection(),
            form = this.getForm(),
            values = form.getValues(),
            viewEl = this.getEl();

        if (!services.length) {
            B4.QuickMsg.warning('Необходимо выбрать услуги');
            return;
        }

        if (!form.isValid()) {
            B4.QuickMsg.warning('Не все поля корректно заполнены');
            return;
        }

        Ext.MessageBox.confirm('Внимание', 'Вы уверены, что хотите сгенерировать средний расход по приборам учета?', function (ans) {
            if (ans == 'yes') {
                viewEl.mask('Генерация...');
                B4.Ajax.request({
                    url: B4.Url.action('/Counter/CalcAvgAccountCounterConsumptionBy354'),
                    params: {
                        personalAccounts: Ext.encode(me.personalAccount),
                        kindId: 3,
                        services: Ext.encode(services.map(function (x) { return x.get('Id'); }))
                    }
                }).next(function (resp) {
                    viewEl.unmask();
                    var response = Ext.decode(resp.responseText);
                    if (response.Data.success) {
                        B4.QuickMsg.success('Поставлена задача по генерации среднего расхода');
                    }
                    else {
                        B4.QuickMsg.warning(response.Data.message);
                        return;
                    }
                    me.close();
                }).error(function () {
                    viewEl.unmask();
                    B4.QuickMsg.warning('При генерации среднего расхода произошла ошибка');
                });
            }
        });
    }
});