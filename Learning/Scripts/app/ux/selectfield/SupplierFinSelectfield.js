Ext.define('B4.ux.selectfield.SupplierFinSelectfield', {
    extend: 'B4.form.SelectField',

    alias: 'widget.supplierfinselectfield',

    store: 'B4.store.finance.SupplierFin',
    fieldLabel: 'Договор ЖКУ',
    idProperty: 'Id',
    textProperty: 'Name',
    windowCfg: {
        modal: true
    },
    editable: false,

    columns: [
        {
            text: 'Наименование',
            dataIndex: 'Name',
            flex: 1,
            filter: {
                xtype: 'textfield'
            }
        },
        {
            text: 'Агент',
            dataIndex: 'AgentName',
            flex: 1,
            filter: {
                xtype: 'textfield'
            }
        },
        {
            text: 'Принципал',
            dataIndex: 'PrincipalName',
            flex: 1,
            filter: {
                xtype: 'textfield'
            }
        },
        {
            text: 'Поставщик',
            dataIndex: 'WorkerName',
            flex: 1,
            filter: {
                xtype: 'textfield'
            }
        }
    ]
});