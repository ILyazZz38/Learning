/**
 * Аспект реализующий логику взаимодействия грида и окна редактирования/просмотра объектов из этого грида.
 * Фактически это тоже самое что и B4.aspects.GridEditForm, только работает с окном, а не с формой.
 *
 * Пример использования:
 * <pre>
 * requires: [
 *     'B4.aspects.GridEditWindow',
 * ],
 *
 * aspects: [{
 *     xtype: 'grideditwindowaspect',
 *     gridSelector: 'objectksgrid',
 *     editFormSelector: 'objectkswindow',
 *     modelName: 'Objectks',
 *     storeName: 'Objectks',
 *     editWindowView: 'Objectks.EditWindow'
 *  }]
 * </pre>
 */
Ext.define('B4.aspects.GridEditForm', {
    extend: 'B4.base.Aspect',
    requires: ['B4.mixins.MaskBody'],
    alias: 'widget.grideditformaspect',

    mixins: {
        mask: 'B4.mixins.MaskBody'
    },

    /**
     * @cfg {String} gridSelector
     * Селектор по которому аспект находит грид
     */
    gridSelector: null,

    /**
     * @cfg {String} editFormSelector
     * Селектор по которому аспект находит форму
     */
    editFormSelector: null,

    /**
     * @cfg {String} storeName
     * Имя класса стора, который будет использоваться при обновлении грида.
     * Не обязательный параметр. По умолчанию стор будет браться из самого грида по селектору.
     */
    storeName: null,

    /**
     * @cfg {String} modelName
     * Имя класса модели стора и грида.
     */
    modelName: null,

    controller: null,

    constructor: function (config) {
        Ext.apply(this, config);
        this.callParent(arguments);

        this.addEvents(
            'beforerowaction',
            'beforegridaction',
            'beforesetformdata',
            'aftersetformdata',
            'beforesaverequest',
            'getdata',
            'validate',
            'beforesave',
            'savesuccess',
            'deletesuccess',
            'savefailure',
            'beforedelete',
            'beforeeditrecord'
        );
    },

    /**
     * @method init
     */
    init: function (controller) {
        var actions = {};
        this.callParent(arguments);

        actions[this.gridSelector] = {
            'rowaction': {
                fn: this.rowAction,
                scope: this
            },
            'itemdblclick': {
                fn: this.rowDblClick,
                scope: this
            },
            'gridaction': {
                fn: this.gridAction,
                scope: this
            }
        };

        actions[this.gridSelector + ' b4addbutton'] = {
            'click': {
                fn: this.btnAction,
                scope: this
            }
        };

        actions[this.gridSelector + ' b4updatebutton'] = {
            'click': {
                fn: this.btnAction,
                scope: this
            }
        };

        if (this.editFormSelector) {
            actions[this.editFormSelector + ' b4savebutton'] = {
                'click': {
                    fn: this.saveRequestHandler,
                    scope: this
                }
            };
        }

        this.otherActions(actions);

        controller.control(actions);
    },

    /**
     * @method otherActions
     * Данный метод служит для перекрытия в контроллерах где используется данный аспект,
     * на случай если потребуется к данному аспекту добавить дополнительные обработчики
     * @template
     * @param actions
     */
    otherActions: function (actions) {
    },

    /**
     * @method btnAction
     */
    btnAction: function (btn) {
        btn.up(this.gridSelector).fireEvent('gridaction', btn.up(this.gridSelector), btn.actionName);
    },

    /**
     * @method getForm
     * Возвращает форму по указанному в конфиге селектору editFormSelector
     * @returns {Ext.form.Panel}
     */
    getForm: function () {
        if (this.editFormSelector) {
            return this.componentQuery(this.editFormSelector);
        }

        return null;
    },

    /**
     * @method getGrid
     * Возвращает грид по указанному в конфиге селектору gridSelector
     * @returns {Ext.grid.Panel}
     */
    getGrid: function () {
        if (this.gridSelector) {
            return this.componentQuery(this.gridSelector);
        }
        return null;
    },

    /**
     * @method rowAction
     */
    rowAction: function (grid, action, record) {
        if (!grid || grid.isDestroyed) return;
        if (this.fireEvent('beforerowaction', this, grid, action, record) !== false) {
            switch (action.toLowerCase()) {
                case 'edit':
                    this.editRecord(record, grid);
                    break;
                case 'delete':
                    this.deleteRecord(record, grid);
                    break;
            }
        }
    },

    /**
     * @method gridAction
     */
    gridAction: function (grid, action) {
        if (!grid || grid.isDestroyed) return;
        if (this.fireEvent('beforegridaction', this, grid, action) !== false) {
            switch (action.toLowerCase()) {
                case 'add':
                    this.editRecord(null, grid);
                    break;
                case 'update':
                    this.updateGrid(grid);
                    break;
            }
        }
    },

    /**
     * @method rowDblClick
     */
    rowDblClick: function (view, record) {
        if (!view || view.isDestroyed) return;
        this.editRecord(record, view);
    },

    /**
     * @method getModel
     * В этом методе передается record потому, что в некоторых случаях при использовании
     * данного аспекта есть необходимость подменять модели
     * Когда грид состоит из объектов нескольких моделей, то там где мы его используем
     * перекрываем этот метод и по значениям record ставим нужную модель
     * @param record Запись стора
     * @returns {*|Ext.data.Model}
     */
    getModel: function () {
        return this.controller.getModel(this.modelName);
    },

    getEditParams: function () {
        return {};
    },

    /**
     * @method editRecord
     */
    editRecord: function (record, grid) {
        var me = this,
            id = record ? record.getId() : null,
            model,
            editParams;

        if (!this.fireEvent('beforeeditrecord', this, record, grid)) {
            return;
        }

        model = this.getModel(record);
        editParams = me.getEditParams(record);

        id ? model.load(id, {
            params: editParams,
            success: function (rec) {
                me.setFormData(rec);
            },
            scope: this
        }) : this.setFormData(new model({ Id: 0 }));
        this.getForm().getForm().isValid();
    },

    /**
     * @method setFormData
     */
    setFormData: function (rec) {
        var form = this.getForm();
        if (this.fireEvent('beforesetformdata', this, rec, form) !== false) {
            form.loadRecord(rec);
            form.getForm().updateRecord();
            form.getForm().isValid();
        }

        this.fireEvent('aftersetformdata', this, rec, form);
    },

    /**
     * @method deleteRecord
     */
    deleteRecord: function (record, grid) {
        var me = this;

        Ext.Msg.confirm('Удаление записи!', 'Вы действительно хотите удалить запись?', function (result) {
            if (result == 'yes') {
                var model = this.getModel(record);

                var rec = new model({ Id: record.getId() });

                //Событие для получения параметров при удалении записи
                var deleteParams = {};
                me.fireEvent('getdeleteparams', me, deleteParams, grid, record);
                me.mask('Удаление', B4.getBody());
                rec.destroy({
                    params: deleteParams
                })
                    .next(function (resp) {
                        var respData = resp ? resp.responseData : null;
                        this.fireEvent('deletesuccess', this, grid, respData);
                        me.updateGrid(grid);
                        me.unmask();
                    }, this)
                    .error(function (result) {
                        Ext.Msg.alert('Ошибка удаления!', Ext.isString(result.responseData) ? result.responseData : result.responseData.message);
                        me.unmask();
                    }, this);
            }
        }, me);
    },

    /**
     * @method updateGrid
     */
    updateGrid: function (grid) {
        if (this.storeName) {
            this.controller.getStore(this.storeName).load();
        }
        else {
            this.getGrid().getStore().reload();
        }
    },

    /**
     * @method getRecordBeforeSave
     * Данный метод предназначен для того чтобы произвести специфичные действия с record
     * Например перед сохранением надо поменять какие-то поля.
     * @template
     * @param record Запись стора грида
     */
    getRecordBeforeSave: function (record) {
        return record;
    },

    /**
     * @method saveRequestHandler
     */
    saveRequestHandler: function (button) {
        var rec,
            from = this.getForm(),
            grid = button.up(this.gridselector),
            editWin = button.up(this.editFormSelector);

        if (this.fireEvent('beforesaverequest', this) !== false) {
            from.getForm().updateRecord();
            rec = this.getRecordBeforeSave(from.getRecord());
            if (!this.fireEvent('getdata', this, rec, grid, editWin)){
                return;
            }

            if (from.getForm().isValid()) {
                if (this.fireEvent('validate', this)) {
                    this.saveRecord(rec, grid);
                }
            } else {
                //получаем все поля формы
                var fields = from.getForm().getFields();

                var invalidFields = '';

                //проверяем, если поле не валидно, то записиваем fieldLabel в строку инвалидных полей
                Ext.each(fields.items, function (field) {
                    if (!field.isValid()) {
                        invalidFields += '<br>' + field.fieldLabel;
                    }
                });

                //выводим сообщение
                Ext.Msg.alert('Ошибка сохранения!', 'Не заполнены обязательные поля: ' + invalidFields);
            }
        }
    },

    getSaveParams: function () {
        return {};
    },


    /**
     * @method saveRecord
     */
    saveRecord: function (rec, grid) {
        if (this.fireEvent('beforesave', this, rec, grid) !== false) {
            //if (this.hasUpload() && this.isFileLoad()) { ***Артур*** закоментировал так как если файл не загружен, то не корректно обрабатывается record так как попадает в о вторую ветку
            if (this.hasUpload()) {
                this.saveRecordHasUpload(rec, grid);
            }
            else {
                this.saveRecordHasNotUpload(rec, grid);
            }
        }
    },

    /**
     * @method saveRecordHasUpload
     */
    saveRecordHasUpload: function (rec) {
        var me = this;
        var frm = me.getForm();
        me.mask('Сохранение', frm);
        frm.submit({
            url: rec.getProxy().getUrl({ action: rec.phantom ? 'create' : 'update' }),
            params: {
                records: Ext.encode([rec.getData()])
            },
            success: function (form, action) {
                me.unmask();
                me.updateGrid();

                var model = me.getModel(rec);

                if (action.result.data.length > 0) {
                    var id = action.result.data[0] instanceof Object ? action.result.data[0].Id : action.result.data[0];
                    model.load(id, {
                        success: function (newRec) {
                            me.setFormData(newRec);
                            me.fireEvent('savesuccess', me, newRec);
                        }
                    });
                }
            },
            failure: function (form, action) {
                me.unmask();
                me.fireEvent('savefailure', rec, action.result.message);
                Ext.Msg.alert('Ошибка сохранения!', action.result.message);
            }
        });
    },

    /**
     * @method saveRecordHasNotUpload
     */
    saveRecordHasNotUpload: function (rec) {
        var me = this;
        var frm = me.getForm(),
            saveParams = me.getSaveParams(rec, frm);

        me.mask('Сохранение', frm);
        
        rec.save({ id: rec.getId(), params: saveParams})
            .next(function (result) {
                me.unmask();
                me.updateGrid();
                me.fireEvent('savesuccess', me, result.record);
            }, this)
            .error(function (result) {
                me.unmask();
                me.fireEvent('savefailure', result.record, result.responseData);

                Ext.Msg.alert('Ошибка сохранения!', Ext.isString(result.responseData) ? result.responseData : result.responseData.message);
            }, this);
    },

    /**
     * @method hasUpload
     */
    hasUpload: function () {
        return this.getForm().getForm().hasUpload();
    },

    /**
     * @method isFileLoad
     */
    isFileLoad: function () {
        return !!this.getForm().getForm().getFields().findBy(function (f) {
            return Ext.isFunction(f.isFileLoad) && f.isFileLoad();
        });
    }
});