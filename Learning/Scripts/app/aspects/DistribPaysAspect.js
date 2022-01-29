/*
    Аспект распределения и отката оплаты
*/
Ext.define('B4.aspects.DistribPaysAspect', {
    extend: 'B4.base.Aspect',

    alias: 'widget.distribPaysAspect',

    requires: [
        'B4.QuickMsg',
        'B4.mixins.MaskBody',
        'B4.mixins.LayoutControllerLoader'
    ],

    gridSelector: undefined,

    constructor: function(config) {
        Ext.apply(this, config);
        this.callParent(arguments);
    },

    init: function(controller) {
        var me = this,
            actions = {};

        me.callParent(arguments);

        actions[me.gridSelector + ' ' + ' button[name=OnDistribPays]'] = {
            'click': {
                fn: me.onDistribPays,
                scope: me
            }
        };

        actions[me.gridSelector + ' ' + ' button[name=OffDistribPays]'] = {
            'click': {
                fn: me.offDistribPays,
                scope: me
            }
        };

        actions[me.gridSelector + ' ' + ' button[name=Repair]'] = {
            'click': {
                fn: me.repair,
                scope: me
            }
        };

        actions[me.gridSelector + ' ' + ' button[name=InCase]'] = {
            'click': {
                fn: me.inCase,
                scope: me
            }
        };

        actions[me.gridSelector + ' ' + ' button[name=OutCase]'] = {
            'click': {
                fn: me.outCase,
                scope: me
            }
        };

        controller.control(actions);
    },

    //распределение выбранных оплат 
    onDistribPays: function(but) {
        this.distribPays(true, but);
    },

    //отмена распределения выбранных оплат 
    offDistribPays: function(but) {
        this.distribPays(false, but);
    },

    //распределение/отмена распределения оплат
    distribPays: function (distrib, but) {

        var me = this,
            view = but.up('grid') || Ext.ComponentQuery.query(me.gridSelector)[0],
            selectedRecords = view.getSelectionModel().getSelection(),
            groupList = [];

        Ext.each(selectedRecords, function(item) {
            groupList.push(item.raw.Id);
        });

        var actMessage = distrib ? 'Распределение оплат' : 'Отмена распределения списка оплат';
        var action = distrib ? 'распределения выбранных оплат' : 'отмены распределения списка оплат';

        if (groupList.length && groupList.length > 0) {

            Ext.Msg.confirm(actMessage,
                'Вы действительно хотите выполнить операцию ' + action + '?', function(result) {

                    if (result == 'yes') {
                        view.getEl().mask(actMessage + '...');
                        B4.Ajax.request({
                            url: 'PayFin/Distrib',
                            method: 'POST',
                            timeout: 9999999,
                            params: {
                                distrib: distrib,
                                groupList: Ext.encode(groupList),
                                year: selectedRecords[0].get('Year')
                            }
                        }).next(function(jsonResp) {
                            view.getEl().unmask();
                            
                            var response = Ext.decode(jsonResp.responseText);
                            Ext.Msg.alert(response.success ? 'Выполнено!' : 'Внимание!', response.message);

                            var st = view.getStore();
                            if (st) st.reload();
                            view.getSelectionModel().clearSelections();
                            me.refreshData();

                        }).error(function (response) {

                            view.getEl().unmask();
                            Ext.Msg.alert('Ошибка!', !Ext.isString(response.message) ? 'При выполнении операции произошла ошибка!' : response.message);

                            var st = view.getStore();
                            if (st) st.reload();
                        });
                    }
                }, me);
        } else {

            Ext.Msg.alert('Внимание!', 'Выберите записи оплат!');

        }
    },

    //исправление оплат в корзине
    repair: function (but) {
        var me = this,
            view = but.up('grid') || Ext.ComponentQuery.query(me.gridSelector)[0],
            selectedRecords = view.getSelectionModel().getSelection(),
            groupList = [];

        Ext.each(selectedRecords, function(item) {
            groupList.push(item.raw.Id);
        });


        var actMessage = 'Исправление оплат в корзине';
        var action = 'исправление выбранных оплат';

        if (groupList.length && groupList.length > 0) {

            Ext.Msg.confirm(actMessage,
                'Вы действительно хотите выполнить операцию ' + action + '?', function(result) {

                    if (result == 'yes') {

                        view.getEl().mask(actMessage + '...');

                        B4.Ajax.request({
                            url: 'PayFin/Repair',
                            method: 'POST',
                            params: {
                                groupList: Ext.encode(groupList)
                            },
                            timeout: 9999999
                        }).next(function(jsonResp) {

                            view.getEl().unmask();

                            var response = Ext.decode(jsonResp.responseText);
                            Ext.Msg.alert(response.success ? 'Выполнено!' : 'Внимание!', response.data);
                            view.getStore().reload();

                            me.refreshData();

                        }).error(function(response) {

                            view.getEl().unmask();
                            Ext.Msg.alert('Ошибка!', !Ext.isString(response.message) ? 'При выполнении операции произошла ошибка!' : response.message);

                            view.getStore().reload();
                        });
                    }
                }, me);
        } else {

            Ext.Msg.alert('Внимание!', 'Выберите записи оплат!');

        }
    },

    inCase: function (btn) {
        var me = this,
            view = btn.up('gridpanel'),
            selectedPayments = view.getSelectionModel().getSelection();

        if (!selectedPayments.length) {
            B4.QuickMsg.msg('Внимание', 'Для выполнения операции выберите оплаты', 'warning');
            return;
        }

        Ext.Msg.confirm('Внимание', 'Вы действительно хотите переместить в портфель выбранные платежи?', function (answer) {
            if (answer == 'yes') {
                view.getEl().mask('Перемещение в портфель...');
                B4.Ajax.request({
                    url: B4.Url.action('/Portfolio/MovingPortfolio'),
                    params: {
                        inCase: true,
                        payments: Ext.encode(selectedPayments.map(function (item) {
                            return {
                                PaymentId: item.get('Id'),
                                Year: item.get('Year')
                            }
                        }))
                    }
                }).next(function (resp) {
                    view.getEl().unmask();
                    var response = Ext.decode(resp.responseText);
                    if (!response.success) {
                        B4.QuickMsg.msg('Внимание', response.message, 'warning');
                        return;
                    }

                    B4.QuickMsg.msg('Выполнено', 'Операция перемещения в портфель выполнена', 'success');
                    view.getSelectionModel().clearSelections();
                    view.getStore().load();
                }).error(function (resp) {
                    view.getEl().unmask();
                    B4.QuickMsg.msg('Внимание', 'При выполнении операции произошла ошибка', 'warning');
                    return;
                });
            }
        });
    },

    outCase: function (btn) {
        var me = this,
            view = btn.up('gridpanel'),
            selectedPayments = view.getSelectionModel().getSelection();

        if (!selectedPayments.length) {
            B4.QuickMsg.msg('Внимание', 'Для выполнения операции выберите оплаты', 'warning');
            return;
        }

        Ext.Msg.confirm('Внимание', 'Вы действительно хотите убрать из портфеля выбранные платежи?', function (answer) {
            if (answer == 'yes') {
                view.getEl().mask('Перемещение из портфеля...');
                B4.Ajax.request({
                    url: B4.Url.action('/Portfolio/MovingPortfolio'),
                    params: {
                        inCase: false,
                        payments: Ext.encode(selectedPayments.map(function (item) {
                            return {
                                PaymentId: item.get('Id'),
                                Year: item.get('Year')
                            }
                        }))
                    }
                }).next(function (resp) {
                    view.getEl().unmask();
                    var response = Ext.decode(resp.responseText);
                    if (!response.success) {
                        B4.QuickMsg.msg('Внимание', response.message, 'warning');
                        return;
                    }

                    B4.QuickMsg.msg('Выполнено', 'Операция перемещения из портфеля выполнена', 'success');
                    view.getSelectionModel().clearSelections();
                    view.getStore().load();
                }).error(function (resp) {
                    view.getEl().unmask();
                    B4.QuickMsg.msg('Внимание', 'При выполнении операции произошла ошибка', 'warning');
                    return;
                });
            }
        });
    },

    //обновить данные после выполнении операции
    refreshData: function() {

    }
});