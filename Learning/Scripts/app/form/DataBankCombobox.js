Ext.define('B4.form.DataBankCombobox', {
    extend: 'Ext.container.Container',
    alias: 'widget.databankcombobox',

    requires: [
        'B4.store.register.personalaccount.grid.BankList'
    ],

    name: undefined,
    labelWidth: undefined,
    store: undefined,
    emptyText: '',

    layout: {
        type: 'hbox',
        align: 'stretch'
    },

    getStore: function() {
        return this.down('combobox').getStore();
    },

    initComponent: function () {
        var me = this;

        Ext.applyIf(me, {
            items: [
                {
                    xtype: 'combobox',
                    fieldLabel: 'Банк данных',
                    labelWidth: me.labelWidth ? me.labelWidth : 70,
                    editable: false,
                    multiSelect: true,
                    valueField: 'Id',
                    displayField: 'Name',
                    queryMode: 'local',
                    width: 380,
                    name: me.name,
                    emptyText: me.emptyText,
                    listConfig: {
                        getInnerTpl: function () {
                            return '<div class="x-combo-list-item"><img src="' + Ext.BLANK_IMAGE_URL + '" class="chkCombo-default-icon chkCombo" /> {Name} </div>';
                        }
                    },
                    store: me.store ? me.store : Ext.create("B4.store.register.personalaccount.grid.BankList")
                },
                {
                    xtype: 'button',
                    iconCls: 'icon-bullet-tick',
                    tooltip: 'Выбрать все',
                    handler: function () {
                        var combo = this.up('container').down('combobox'),
                            selectedValues = combo.getValue(),
                            allValues = combo.getStore().collect(combo.valueField);
                        
                        if (allValues.some(function (item) {
                            return selectedValues.indexOf(item) === -1;
                        })) {
                            combo.select(allValues);
                        } else {
                            combo.clearValue();
                        }

                        combo.fireEvent('collapse', combo);
                    }
                }
            ]
        });

        me.callParent(arguments);
    }
});