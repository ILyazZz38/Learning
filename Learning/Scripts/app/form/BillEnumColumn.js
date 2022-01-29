Ext.define('B4.form.BillEnumColumn', {
    extend: 'Ext.grid.column.Column',
    alias: ['widget.b4billenumcolumn'],
    alternateClassName: 'B4.grid.EnumColumn',
    requires: ['B4.form.EnumCombo'],

    /**
    * @cfg {String/Class} enumName
    * Наименование класса перечисления, либо само перечисление
    */
    enumName: '',
    /**
    * @cfg {String} filterName
    * Поле сущности, по которому необходимо фильтровать на сервере.
    * Если не передано, соответсвует значению поля dataIndex
    */
    filterName: '',
    /**
    * @cfg {Number[]/String[]} enumItems
    * Список элементов для отображения.
    * Может быть передано либо название элемента перечисления, либо его числовое значение
    */
    enumItems: [],

    defaultValue: '',

    constructor: function (config) {
        config = config || {};
        Ext.applyIf(config, {
            width: 120
        });

        // получаем наименование перечисления
        var enumName = config.enumName;
        var enumCls = null;
        if (Ext.isEmpty(enumName)) {
            Ext.Error.raise('Не передан класс перечисления');
            return;
        }
        else if (Ext.isString(enumName)) {
            enumCls = Ext.ClassManager.get(enumName);
            if (!enumCls) {
                Ext.syncRequire(enumName);
                enumCls = Ext.ClassManager.get(enumName);
            }
        }
        else if (enumName.isEnum == true) {
            enumCls = enumName;
        }

        if (Ext.isEmpty(enumCls)) {
            Ext.Error.raise('Не удалось определить класс перечисления');
            return;
        }

        var defaultValue = this.defaultValue;
        var renderer = null;
        var renderField = [];
        if (!Ext.isEmpty(config.filterName)) {
            renderField = config.filterName.split('.');
            if (renderField.length > 1 && renderField[0] == config.dataIndex) {
                renderField = renderField.splice(1);
            }
        }

        if (renderField.length) {
            renderer = Ext.pass(function (path, v) {
                var obj = v;
                Ext.each(path, function (i) {
                    if (obj)
                        obj = obj[i];
                    else
                        return false;
                });

                var meta = this.getMeta(obj);
                return obj ? (Ext.isEmpty(meta) ? defaultValue : meta.Display) : '';
            }, [renderField], enumCls);
        } else {
            renderer = Ext.bind(function (v) {
                var meta = this.getMeta(v);
                return Ext.isEmpty(meta) ? defaultValue : meta.Display;
            }, enumCls);
        }

        Ext.applyIf(config, {
            renderer: renderer
        });

        if (config.filter == true) {
            Ext.apply(config, {
                filter: {
                    xtype: 'b4enumcombo',
                    enumName: enumCls,
                    includeNull: true,
                    filterName: config.filterName || config.dataIndex,
                    operand: CondExpr.operands.eq,
                    operator: config.multiSelect ? 'in' : 'eq',
                    type: config.multiSelect ? 'list' : 'combo',
                    enumItems: config.enumItems || []
                }
            });
        }

        this.callParent([config]);
    }
});