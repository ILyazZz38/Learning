/*
    B4.form.SelectField для выбора дома из центрального банка DATA
*/
Ext.define('B4.form.SelectFieldHouse', {
    extend: 'B4.form.SelectField',
    alias: 'widget.b4selectfieldhouse',
    alternateClassName: ['B4.SelectFieldHouse'],

    requires: [
        'Ext.grid.Panel',
        'B4.ux.grid.plugin.HeaderFilters',
        'B4.ux.grid.column.Enum',
        'B4.store.finance.HouseFin'
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
    name: 'House',
    
    store: Ext.create('B4.store.finance.HouseFin'),
    idProperty: 'Id',
    textProperty: 'HouseName',
    editable: false,
    fieldLabel: 'Дом',
    windowCfg: {
        width: 900
    },
    columns: [
        {
            xtype: 'gridcolumn',
            text: 'Улица',
            flex: 1,
            dataIndex: 'StreetName',
            filter: { xtype: 'textfield' }
        },
        {
            xtype: 'gridcolumn',
            text: 'Дом',
            flex: 1,
            dataIndex: 'HouseNumber',
            filter: { xtype: 'textfield' }
        },
        {
            xtype: 'gridcolumn',
            text: 'Корпус',
            flex: 1,
            dataIndex: 'HouseBuild',
            filter: { xtype: 'textfield' }
        },
        {
            xtype: 'gridcolumn',
            text: 'Район',
            flex: 1,
            dataIndex: 'DistrictName',
            filter: { xtype: 'textfield' }
        },
        {
            xtype: 'gridcolumn',
            text: 'УК',
            flex: 1,
            dataIndex: 'ManagementOrganizationName',
            filter: { xtype: 'textfield' }
        },
        {
            xtype: 'gridcolumn',
            text: 'ЖЭУ',
            flex: 1,
            dataIndex: 'HousingDepartmentName',
            filter: { xtype: 'textfield' }
        }
    ]
});
