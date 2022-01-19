Ext.define('B4.ux.form.InfoPanel', {
    extend: 'Ext.container.Container',

    alias: 'widget.infopanel',

    text: undefined,
    iconCls: undefined,
    textAlign: 'center',

    style: 'border: 1px solid #a6c7f1 !important; font: 12px tahoma,arial,helvetica,sans-serif; background: transparent; margin: 10px; padding: 5px 10px; line-height: 16px;',

    initComponent: function () {
        var html = '';

        if (this.iconCls) {
            html += '<div class="' + this.iconCls + '" style="display:inline-block;font-size:15pt"></div>';
        }
        html += '<div style="display:inline-block; padding-left: 5px; text-align: ' + this.textAlign + ';">' + this.text + '</div>';

        Ext.apply(this, {
            html: html
        });

        this.callParent(arguments);
    }
});