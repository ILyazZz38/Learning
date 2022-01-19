Ext.define('Learning.view.Window', {
    extend: 'Learning.form.Window',

    mixins: ['Learning.mixims.window.ModalMask'],
    layout: 'anchor',
    width: 645,

    alias: 'widjet.additionalservicewindow',
    title: 'доп',

    requires: [
        'Learning.ux.button.Close',
        'Learning.form.SelectField',
        'Learning.form.Combobox',
        'Learning.ux.button.Save'
    ],

    initComponent: function () {
        var me = this,
            contragentStore = Ext.create('Learning.store.finance.LegalEntityFin');

        Ext.applyIf(me, {
            defaults: {
                labelWidth: 150
            },
            items: [
                {
                    xtype: 'textfield',
                    fieldLabel: 'Наименование услуги',
                    allowBlank: false,
                    name: 'Name',
                    maxLength: 100,
                    anchor: '100%'
                },
                {
                    xtype: 'b4selectfield',
                    store: contragentStore,
                    name: 'Contragent',
                    modal: true,
                    anchor: '100%',
                    fieldLabel: 'Поставщик',
                    displayField: 'Name',
                    valueField: 'Id',
                    editable: false,
                    allowBlank: false,
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
                }
            ],
            dockedItems: [
                {
                    xtype: 'toolbar',
                    dock: 'top',
                    items: [
                        {
                            xtype: 'buttongroup',
                            columns: 2,
                            items: [
                                { xtype: 'b4savebutton' }
                            ]
                        },
                        { xtype: 'tbfill' },
                        {
                            xtype: 'buttongroup',
                            columns: 2,
                            items: [
                                { xtype: 'b4closebutton' }
                            ]
                        }
                    ]
                }
            ]
        });

        me.callParent(arguments);
    }
});