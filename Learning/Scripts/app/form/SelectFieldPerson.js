/*
    B4.form.SelectField для выбора физического лица
*/
Ext.define('B4.form.SelectFieldPerson', {
    extend: 'B4.form.SelectField',
    alias: 'widget.b4selectfieldperson',
    alternateClassName: ['B4.SelectFieldPersonS'],

    requires: [
        'Ext.grid.Panel',
        'B4.ux.grid.plugin.HeaderFilters'
    ],

    modalWindow: true,
    
    store: Ext.create('B4.store.register.person.Person'),
    idProperty: 'Id',
    textProperty: 'Fio',
    editable: false,
    fieldLabel: 'Физическое лицо',
    listView: 'B4.view.form.PersonFieldList',
    windowCfg: {
        width: 900
    }
});