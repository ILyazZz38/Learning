Ext.define('B4.form.BigNumberField', {
    extend: 'Ext.form.field.Text',

    alias: 'widget.bignumberfield',

    //Длина целой части числа
    integerLength: undefined,
    //Длина дробной части числа
    decimalLength: undefined,
    //Разрешить отрицательные числа
    allowNegative: true,
    //отображение наименования валюты (руб.)
    showCurrency: false,

    initComponent: function () {
        var me = this,
            cssClass = me.showCurrency ? ' class="input-big-number-field"' : '',
            fieldStyle = me.showCurrency ? 'text-align:right;' : '',
            negativePart = me.allowNegative ? '(\\+|\\-)?' : '',
            integerPart = me.integerLength ? '\\d{1,' + me.integerLength + '}' : '\\d+',
            decimalPart = me.decimalLength ? '\\d{1,' + me.decimalLength + '}' : '\\d*',
            regex = new RegExp('^' + negativePart + integerPart + '(|\\.' + decimalPart + ')$'),
            regexText = (me.integerLength ? 'Количество символов целой части не должно превышать ' + me.integerLength + '. ' : '')
                + (me.decimalLength ? 'Количество символов дробной части не должно превышать ' + me.decimalLength + '. ' : '')
                + (!me.allowNegative ? 'Отрицательное значение запрещено.' : '');

        Ext.apply(me,
            {
                fieldStyle: fieldStyle,
                maskRe: /[\d\.\-]/,
                regex: regex,
                regexText: regexText,
                fieldSubTpl: [ // note: {id} here is really {inputId}, but {cmpId} is available
                    '<span ' + cssClass + '>',
                    '<input id="{id}" type="{type}" role="{role}" {inputAttrTpl}',
                    ' size="1"', // allows inputs to fully respect CSS widths across all browsers
                    '<tpl if="name"> name="{name}"</tpl>',
                    '<tpl if="value"> value="{[Ext.util.Format.htmlEncode(values.value)]}"</tpl>',
                    '<tpl if="placeholder"> placeholder="{placeholder}"</tpl>',
                    '{%if (values.maxLength !== undefined){%} maxlength="{maxLength}"{%}%}',
                    '<tpl if="readOnly"> readonly="readonly"</tpl>',
                    '<tpl if="disabled"> disabled="disabled"</tpl>',
                    '<tpl if="tabIdx"> tabIndex="{tabIdx}"</tpl>',
                    '<tpl if="fieldStyle"> style="{fieldStyle}"</tpl>',
                    ' class="{fieldCls} {typeCls} {editableCls} {inputCls}" autocomplete="off"/>',
                    '<span/>',
                    {
                        disableFormats: true
                    }
                ]
            });

        me.callParent(arguments);
    }
});