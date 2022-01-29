//Аспект проводок
Ext.define('B4.aspects.ConductAspect', {
    extend: 'B4.base.Aspect',

    alias: 'widget.conductaspect',

    requires: [
        'B4.aspects.permission.Kp60PermissionAspect'
    ],

    rewriteMessage: '',

    init: function (controller) {
        var me = this;

        me.callParent(arguments);

        var permissionAspect = Ext.create('B4.aspects.permission.Kp60PermissionAspect', {
            permissions: [
                {
                    name: 'Kp60.PersonalAccountRegister.Conduct.Edit',
                    applyTo: '[name=Execute]',
                    selector: 'personalaccountconducts',
                    applyBy: function (component, allowed) {
                        if (allowed) {
                            component.show();
                        } else {
                            component.hide();
                        }
                    }
                }
            ]
        });
        permissionAspect.init(controller);

        me.controller.aspects.push(permissionAspect);
    },

    initialize: function (view, dataBankId, personalAccountId, calcMonth) {
        view.down('button[name=Execute]').on({
            'click': {
                fn: this.preparation,
                scope: this
            }
        });

        view.dataBankId = dataBankId;
        view.personalAccountId = personalAccountId;

        var store = view.getStore(),
            dateField = view.down('datefield[name=Date]'),
            typeField = view.down('b4combobox[name=Type]');

        store.on({
            beforeload: function (curStore, operation, options) {
                var typeValue = typeField.getValue();

                operation.params = operation.params || {};
                operation.params.personalAccountId = personalAccountId;
                operation.params.dataBankId = dataBankId;
                operation.params.date = dateField.getValue();
                operation.params.type = typeValue
                    ? typeValue
                    : -1;
            }
        });

        if (calcMonth) {
            dateField.setValue(calcMonth);
        }

        //Подписываемся на изменение контролов
        typeField.getStore().on({
            load: function() {
                typeField.on({
                    change: function (control) {
                        store.load();
                    }
                });

                dateField.on({
                    change: function (control) {
                        store.load();
                    }
                });
            }
        });

        store.load();
    },

    //Подготовительные проверки
    preparation: function (btn) {
        var asp = this,
            me = asp.controller,
            view = btn.up('personalaccountconducts'),
            personalAccountId = view.personalAccountId;

        Ext.Msg.confirm('Внимание!', "<p align='center'><b>Внимание!</b></p><font>" + asp.rewriteMessage +
            "Переформирование проводок приведет к</font> <font color='red'> " +
            "удалению информации для протокола расчета</font><font>  по услуге \"ПЕНИ\"" +
            " за закрытые расчетные месяцы.</br></font> <font color='red'>Все ранее начисленные пени будут сняты</font>" +
            " <font> (см. форму \"Изменение сальдо\" в \"Лицевом счете\"</font>)",
            function (result) {
                if (result == 'yes') {
                    asp.rewriteConducts(view, personalAccountId);
                }
            }, me);
    },

    getRewritePersonalAccountId: function (view, personalAccountId) {
        return personalAccountId;
    },

    //Перезаписать проводки
    rewriteConducts: function (view, personalAccountId) {
        view.getEl().mask('Выполнение...');
        B4.Ajax.request({
            url: B4.Url.action('RewriteConducts', 'Conduct'),
            timeout: 120000,
            params: {
                personalAccountId: this.getRewritePersonalAccountId(view, personalAccountId)
            }
        }).next(function (resp) {
            view.getEl().unmask();
            var response = Ext.decode(resp.responseText);
            if (response.success) {
                B4.QuickMsg.msg('Выполнено', 'Задача поставлена в очередь на выполнение', 'success');
                view.getStore().load();
            } else {
                B4.QuickMsg.msg('Внимание', response.message, 'warning');
            }
        }).error(function (resp) {
            view.getEl().unmask();
            var response = Ext.decode(resp.responseText);
            B4.QuickMsg.msg('Внимание', response.message, 'warning');
        });
    }
});