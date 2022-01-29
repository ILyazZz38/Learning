Ext.define('B4.aspects.CalculateAccount', {
    extend: 'B4.base.Aspect',

    alias: 'widget.calculateaccountaspect',

    calcButtonSelector: undefined,

    initialize: function (view, personalAccountId, dataBankId, callBackFunction) {
        var me = this;

        view.down(me.calcButtonSelector).on({
            click: function (btn) {
                me.calcAccount(view, dataBankId, personalAccountId, callBackFunction);
            }
        });

        B4.signalR.hubs.calculationHub.notifyCalculationCompletition.push(function (completedPersonalAccountId, userId) {
            me.onCalculationCompleted(completedPersonalAccountId, userId, view, personalAccountId, callBackFunction);
        });
    },

    onCalculationCompleted: function (completedPersonalAccountId, userId, view, personalAccountId, callBackFunction) {
        if (B4.User.UserId != userId || completedPersonalAccountId != personalAccountId) {
            return;
        }
        
        var calcAccounts = Ext.decode(B4.Variables.getValue('KP60CalcAccounts'));

        if (calcAccounts) {
            var index = calcAccounts.indexOf(personalAccountId);
            calcAccounts.splice(index, 1);
            B4.Variables.set('KP60CalcAccounts', Ext.encode(calcAccounts));
        }

        if (view && view.getEl()) {
            view.getEl().unmask();
        }

        if (callBackFunction) {
            callBackFunction();
        }
    },

    //Расчет лицевого счета
    calcAccount: function (view, dataBankId, personalAccountId) {
        var me = this,
            calcAccounts = Ext.decode(B4.Variables.getValue('KP60CalcAccounts')) || [];
			
        Ext.Msg.confirm('Расчет счета', 'Вы хотите выполнить расчет счета?', function (result) {
            if (result == 'yes') {
                view.getEl().mask('Расчет...');

                calcAccounts.push(personalAccountId);
                B4.Variables.set('KP60CalcAccounts', Ext.encode(calcAccounts));

                B4.Ajax.request({
                    url: 'CalculationMonth/Calculate',
                    timeout: 9999999,
                    method: 'POST',
                    params: {
                        personalAccountId: personalAccountId,
                        dataBankId: dataBankId
                    }
                }).next(function (jsonResp) {
                    var response = Ext.decode(jsonResp.responseText);
                    B4.QuickMsg.msg(
                        response.success ? 'Выполнено' : 'Внимание',
                        response.data,
                        response.success ? 'success' : 'warning'
                    );
                    if (response && !response.success) {
                        if (view.getEl()) {
                            view.getEl().unmask();
                        }
                    }
                }).error(function (resp) {
                    B4.QuickMsg.msg('Внимание', 'При выполнении операции произошла ошибка', 'warning');
                    view.getEl().unmask();
                });
            }
        }, me);
    }
});