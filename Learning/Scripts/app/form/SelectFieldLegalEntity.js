/*
    B4.form.SelectField для выбора контрагентов
*/
Ext.define('B4.form.SelectFieldLegalEntity', {
    extend: 'B4.form.SelectField',
    alias: 'widget.b4selectfieldleagalentity',
    alternateClassName: ['B4.SelectFieldLegalEntity'],

    requires: [
        'Ext.grid.Panel',
        'B4.ux.grid.plugin.HeaderFilters',
        'B4.ux.grid.column.Enum',
        'B4.store.finance.LegalEntityFin'
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
    name: 'LegalEntity',
    
    idProperty: 'Id',
    textProperty: 'Name',
    displayField: 'Name',
    editable: false,
    fieldLabel: 'Контрагент',
    windowCfg: {
        width: 900
    },
    columns: [
        {
            text: 'Подрядчик',
            dataIndex: 'Name',
            flex: 1,
            filter: {
                xtype: 'textfield'
            }
        },
        {
            text: 'ИНН',
            dataIndex: 'Inn',
            width: 100,
            filter: {
                xtype: 'textfield'
            }
        },
        {
            text: 'КПП',
            dataIndex: 'Kpp',
            width: 100,
            filter: {
                xtype: 'textfield'
            }
        },
        {
            text: 'Роли',
            dataIndex: 'Types',
            flex: 1,
            filter: {
                xtype: 'b4combobox',
                name: 'LegalEntityType',
                storeAutoLoad: false,
                url: '/LegalEntityType/List',
                displayField: 'Name',
                valueField: 'Id'
            }
        }
    ],

    initComponent: function() {
        Ext.apply(this, {
            store: Ext.create('B4.store.finance.LegalEntityFin', {
                proxy: {
                    type: 'b4proxy',
                    controllerName: 'LegalEntityFin',
                    listAction: 'List'
                }
            })
        });

        this.callParent(arguments);
    }
});
