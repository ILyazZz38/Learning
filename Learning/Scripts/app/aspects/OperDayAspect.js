/*
    Аспект работы с оперднем
*/
Ext.define('B4.aspects.OperDayAspect', {
    extend: 'B4.base.Aspect',

    alias: 'widget.operdayaspect',

    requires: [
        'B4.QuickMsg',
        'B4.utils.KP6Utils',
        'B4.model.finance.OperDay',
        'B4.view.finance.OperDayWindow',
        'B4.aspects.permission.Kp60PermissionAspect'
    ],

    mixins: {
        mask: 'B4.mixins.MaskBody'
    },

    editFormSelector: 'operdaywindow',
    gridSelector: undefined,

    editWindowView: 'finance.OperDayWindow',
    modelName: 'finance.OperDay',
    storeName: 'finance.OperDay',

    constructor: function (config) {
        Ext.apply(this, config);
        this.callParent(arguments);
    },

    init: function (controller) {
        var me = this;
        var actions = {};

        controller.models.push('finance.OperDay');
        controller.views.push('finance.OperDayWindow');

        //настройка аспекта разрешений
        var permissionAsp = Ext.create('B4.aspects.permission.Kp60PermissionAspect');
        permissionAsp.permissions = [
            {
                name: 'Kp60.Finance.OperdayTransfer',
                applyTo: 'button[name=forwardOperDay]',
                selector: 'operdaywindow',
                applyBy: function (component, allowed) {
                    var view = component.up('window');

                    Ext.each(view.query('[permissionGroup=ChangeOperDay]'), function () {
                        this.setDisabled(!allowed);
                    });
                }
            }
        ];
        permissionAsp.init(controller);
        controller.aspects.push(permissionAsp);

        actions[this.editFormSelector] = {
            'beforerender': {
                fn: me.beforerender,
                scope: me
            }
        };

        actions[this.gridSelector + " button[name=OperDayButton]"] = {
            'click': {
                fn: me.btnAction,
                scope: me
            }
        };

        if (this.editFormSelector) {
            actions[this.editFormSelector + '[aspectName=' + me.name + '] button[name="forwardOperDay"]'] = {
                'click': {
                    fn: this.changeOperDay,
                    scope: this
                }
            };
        }
        if (this.editFormSelector) {
            actions[this.editFormSelector + '[aspectName=' + me.name + '] button[name="backOperDay"]'] = {
                'click': {
                    fn: this.changeOperDay,
                    scope: this
                }
            };
        }

        controller.control(actions);
        me.callParent(arguments);
    },

    beforerender: function (editForm) {
        editForm.down('button[name=forwardOperDay]').ctxKey = this.controller.getContext().ctxKey;
        editForm.down('button[name=backOperDay]').ctxKey = this.controller.getContext().ctxKey;
    },

    btnAction: function (btn) {
        this.editRecord();
    },

    //подменим выборку данных
    editRecord: function (record) {
        var me = this,
            id = 1,
            model;

        model = this.getModel('finance.OperDay');

        model.load(1, {
            success: function (rec) {
                me.setFormData(rec);
            },
            scope: this
        });

        this.getForm().getForm().isValid();
    },

    getGrid: function () {
        if (this.gridSelector) {
            return this.componentQuery(this.gridSelector);
        }
        return null;
    },

    getForm: function () {
        var me = this,
            grid = this.getGrid();

        if (me.editFormSelector) {
            var editWindow = this.componentQuery(me.editFormSelector);

            if (!editWindow) {
                me.fireEvent('beforewindowcreated', me);
                var renderTo = grid;
                if (Ext.isString(me.editWindowContainerSelector)) {
                    renderTo = me.componentQuery(me.editWindowContainerSelector);
                    if (!renderTo)
                        throw "Не удалось найти контейнер для формы редактирования по селектору " + me.editWindowContainerSelector;
                }

                var editView = me.controller.getView(me.editWindowView);
                if (!editView)
                    throw "Не удалось найти вьюшку контроллера " + me.editWindowView;

                editWindow = editView.create({ constrain: true, renderTo: renderTo.getEl(), aspectName: me.name });

                me.bindToParent(grid, editWindow);

                me.fireEvent('windowcreated', me, editWindow, grid);

                editWindow.show();
                editWindow.center();
            }

            return editWindow;
        }
        return null;
    },

    setFormData: function (rec) {
        var me = this,
            form = this.getForm(),
            dateField = form.down('datefield[name=OperDate]');

        form.getEl().mask('Загрузка...');
        if (this.fireEvent('beforesetformdata', this, rec, form) !== false) {
            this.controller.setContextValue(form, 'operDay', rec.get('OperDate'));
            form.loadRecord(rec);
            form.getForm().updateRecord();
            form.getForm().isValid();

            B4.Ajax.request({
                url: B4.Url.action('GetCalculationMonth', 'CalculationMonth')
            }).next(function (resp) {
                var response = Ext.decode(resp.responseText),
                    calcMonth = response.data.Month - 1,
                    calcYear = response.data.Year;

                dateField.minValue = new Date(calcYear, calcMonth, 1);
                dateField.maxValue = new Date(calcYear, calcMonth, me.daysInMonth(calcMonth + 1, calcYear));
                form.getEl().unmask();
            });

            B4.Ajax.request({
                url: B4.Url.action('GetAutomaticallyChange', 'OperDay')
            }).next(function (resp) {
                var response = Ext.decode(resp.responseText),
                 changeField = form.down('checkbox[name=AutomaticChange]');
                changeField.setValue(response.Data.isAutomatic);
                if (response.Data.isVisible) changeField.show();
                else changeField.hide();
            });
        }

        this.fireEvent('aftersetformdata', this, rec, form);
    },

    daysInMonth: function (month, year) {
        return new Date(year, month, 0).getDate();
    },

    bindToParent: function (grid, win) {
        grid.add(win);
        win.on('beforedestroy', function () {
            if (grid.floatingItems) {
                grid.floatingItems.removeAtKey(win.getId()); //#warning необходимость в этом отпадет с версией 4.2    
            }
        });
    },

    getRecordBeforeSave: function (record) {
        return record;
    },


    getModel: function () {
        return this.controller.getModel(this.modelName);
    },

    closeWindowHandler: function () {
        this.getForm().close();
    },


    changeOperDay: function (btn) {
        var me = this;
        var view = me.getForm();
        var forward = (btn.name == 'forwardOperDay');

        var actMessage = forward ? 'Закрытие операционного дня' : 'Возврат на предыдущий операционный день';
        var action = forward ? 'закрыть операционный день' : 'вернуться на предыдущий операционный день';

        Ext.Msg.confirm(actMessage,
            'Вы действительно хотите ' + action + '?', function (result) {

                if (result == 'yes') {

                    view.getEl().mask(actMessage + '...');

                    B4.Ajax.request({
                        url: B4.Url.action('/OperDay/ChangeOperDay'),
                        method: 'POST',
                        params: {
                            forward: forward
                        },

                        timeout: 600000
                    }).next(function (jsonResp) {

                        view.getEl().unmask();

                        var response = Ext.decode(jsonResp.responseText);
                        B4.QuickMsg.msg(
                            response.success ? 'Выполнено' : 'Внимание',
                            response.data,
                            response.success ? 'success' : 'warning'
                        );

                        //обновить правый верхний угол
                        B4.utils.KP6Utils.showCurMonth();
                        view.close();

                    }).error(function (response) {

                        view.getEl().unmask();
                        Ext.Msg.alert('Ошибка!', !Ext.isString(response.message) ? 'При выполнении операции произошла ошибка!' : response.message);

                        B4.utils.KP6Utils.showCurMonth();
                        view.close();

                    });
                }
            }, me);
    }
});