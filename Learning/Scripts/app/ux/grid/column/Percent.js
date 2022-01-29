Ext.define('B4.ux.grid.column.Percent', {
    extend: 'Ext.grid.column.Column',
    alias: ['widget.b4percentcolumn'],
    alternateClassName: 'B4.grid.PercentColumn',

    width: 120,

    tooltip: "Прогресс",
    text: "Прогресс",
    align: 'center',

    renderer: function (value, meta, record) {
        if (value > 0) {
            value = (value * 100);
        }

        var percent = Ext.util.Format.number(value, '0') + "%";

        if (record.get('FileStatusId') == 16) {
            meta.style = 'background-color: #FFDEDE';
        } else {
        meta.style = 'background: linear-gradient(to right,  #D9E5F3 ' + percent + ',#ffffff ' + percent + '); ' +
            'background: -webkit-linear-gradient(left, #D9E5F3 ' + percent + ',#ffffff ' + percent + ');' +
            'background:    -moz-linear-gradient(left, #D9E5F3 ' + percent + ', #ffffff ' + percent + ');' +
            'background:     -ms-linear-gradient(left, #D9E5F3 ' + percent + ',#ffffff ' + percent + ');' +
            'background:      -o-linear-gradient(left, #D9E5F3 ' + percent + ',#ffffff ' + percent + ');';
        }

        return percent;
    }
});