Ext.define('B4.ux.selectfield.LegalEntityFinSelectfield', {
    extend: 'B4.form.SelectField',

    alias: 'widget.legalentityfinselectfield',

    store: 'B4.store.finance.LegalEntityFin',
    fieldLabel: 'Контрагент',
    idProperty: 'Id',
    textProperty: 'Name',
    windowCfg: {
        modal: true
    },
    columns: [
        {
            text: 'Наименование',
            dataIndex: 'Name',
            flex: 1,
            filter: {
                xtype: 'textfield'
            }
        }
    ]
});