Ext.define('B4.ux.selectfield.OperatorSelectfield', {
    extend: 'B4.form.SelectField',

    alias: 'widget.operatorselectfield',

    store: 'B4.store.administration.Operator',
    fieldLabel: 'Пользователь',

    idProperty: 'Id',
    textProperty: 'Name',

    windowCfg: {
        modal: true
    },
    columns: [
        {
            text: 'Имя',
            dataIndex: 'Name',
            flex: 1,
            filter: {
                xtype: 'textfield'
            }
        },
        {
            text: 'Логин',
            dataIndex: 'Login',
            flex: 1,
            filter: {
                xtype: 'textfield'
            }
        }
    ]
});