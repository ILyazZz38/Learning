/*
    B4.form.SelectField для выбора договоров ЖКУ
*/
Ext.define('B4.form.SelectFieldContracts', {
    extend: 'B4.form.SelectField',
    alias: 'widget.b4selectfieldcontracts',
    alternateClassName: ['B4.SelectFieldContracts'],

    requires: [
        'Ext.grid.Panel',
        'B4.ux.grid.plugin.HeaderFilters',
        'B4.ux.grid.column.Enum'
    ],

    labelAlign: 'right',
    modalWindow: true,

    layout: {
        type: 'hbox',
        align: 'stretch'
    },
    defaults: {
        labelAlign: 'right'
    },
    name: 'Contracts',
    title: 'Выбор договоров ЖКУ',
    
    idProperty: 'Id',
    textProperty: 'Name',
    displayField: 'Name',
    editable: false,
    fieldLabel: 'Договор ЖКУ',
    windowCfg: {
        width: 900
    },
    columns: [
        {
            text: 'Код договора',
            dataIndex: 'Id',
            flex: 1,
            filter: {
                xtype: 'numberfield', operand: CondExpr.operands.eq
            }
        },
        {
            text: 'Наименование',
            dataIndex: 'Name',
            flex: 2,
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
        },
        {
            text: 'Получатель',
            dataIndex: 'ReceiverName',
            flex: 1,
            filter: {
                xtype: 'textfield'
            }
        },
        {
            text: 'Расчетный счет',
            dataIndex: 'Rcount',
            flex: 1,
            filter: {
                xtype: 'textfield'
            }
        },
        {
            text: 'Получатель пени',
            dataIndex: 'ReceiverPeniName',
            flex: 1,
            filter: {
                xtype: 'textfield'
            }
        },
        {
            text: 'Р/с получ. пени',
            dataIndex: 'RcountPeni',
            flex: 1,
            filter: {
                xtype: 'textfield'
            }
        }
    ]
});
