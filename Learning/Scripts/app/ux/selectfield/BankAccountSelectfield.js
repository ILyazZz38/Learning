Ext.define('B4.ux.selectfield.BankAccountSelectfield', {
    extend: 'B4.form.SelectField',

    alias: 'widget.bankaccountselectfield',

    fieldLabel: 'Расчетный счет',
    idProperty: 'Id',
    textProperty: 'SettlementAccount',
    windowCfg: {
        modal: true
    },
    editable: false,
    allowBlank: false,
    requires: [
      'B4.enums.YesNo',
      'B4.ux.grid.filter.YesNo'
    ],
    columns: [
        {
            text: 'Расчетный счет',
            dataIndex: 'SettlementAccount',
            flex: 1,
            filter: {
                xtype: 'numberfield'
            }
        },
        {
            text: 'Банк',
            dataIndex: 'BankName',
            flex: 1,
            filter: {
                xtype: 'textfield'
            }
        },
        {
            text: 'Контрагент',
            dataIndex: 'LegalEntityName',
            flex: 1,
            filter: {
                xtype: 'textfield'
            }
        },
        {
            xtype: 'b4enumcolumn',
            dataIndex: 'IsSpec',
            text: 'Спец. счет',
            enumName: 'B4.enums.YesNo',
            filter: true
        }
    ],


    initComponent: function () {
        Ext.apply(this, {
            store: Ext.create('B4.store.finance.BankAccount')
        });

        this.callParent(arguments);
    }
});