Ext.define('B4.form.register.personalaccount.groupoperation.ReplaceSuppKvarList', {
    extend: 'B4.form.Window',
    alias: 'widget.replacesuppkvarlist',

    width: 900,
    height: 600,
    layout: 'anchor',
    title: 'Список лицевых счетов',

    dataBankId: undefined,
    tableName: undefined,
    nzpSupp: undefined,

    requires: [
        'B4.ux.button.Close',
        'B4.form.ComboBox',
        'B4.ux.grid.toolbar.Paging'
    ],

    listeners: {
        afterrender: function (view) {
            var grid = view.down('gridpanel');

            grid.getStore().load();
        }
    },

    initComponent: function () {
        var me = this,
            personalAccountStore = Ext.create('B4.store.register.personalaccount.replacesupp.ReplaceSuppKvarList', {
                listeners: {
                    beforeload: function (curStore, operation) {
                        operation.params = operation.params || {};
                        operation.params.dataBankId = me.dataBankId;
                        operation.params.tableName = me.tableName;
                        operation.params.nzpSupp = me.nzpSupp;
                    }
                }
            });

        Ext.applyIf(me, {
            items: [
                {
                    xtype: 'gridpanel',
                    store: personalAccountStore,
                    layout: 'fit',
                    anchor: '0 0',
                    columns: [
                        {
                            xtype: 'b4editcolumn',
                            handler: function (gridView, rowIndex, colIndex, el, e, rec) {
                                window.location = Ext.String.format('#personalaccountinfo/{0}/{1}/', rec.get('Id'), me.dataBankId);
                            }
                        },
                        {
                            xtype: 'gridcolumn',
                            text: 'Л/С',
                            dataIndex: 'PersonalAccountNumber',
                            width: 70,
                            filter: { xtype: 'numberfield', operand: CondExpr.operands.eq }
                        },
                        {
                            xtype: 'gridcolumn',
                            text: 'Платежный код',
                            dataIndex: 'PaymentCode',
                            width: 110,
                            filter: { xtype: 'numberfield', operand: CondExpr.operands.eq }
                        },
                        {
                            xtype: 'gridcolumn',
                            text: 'Абонент',
                            dataIndex: 'Fio',
                            flex: 1,
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
                            text: 'Корп',
                            flex: 1,
                            dataIndex: 'HouseBuild',
                            filter: { xtype: 'textfield' }
                        },
                        {
                            xtype: 'gridcolumn',
                            text: 'Квартира',
                            flex: 1,
                            dataIndex: 'FlatNumber',
                            filter: { xtype: 'textfield' }
                        }
                    ],
                    plugins: [
                        Ext.create('B4.ux.grid.plugin.HeaderFilters', { pluginId: 'filter' })
                    ],
                    viewConfig: {
                        loadMask: true
                    }
                }
            ],
            dockedItems: [
                {
                    xtype: 'toolbar',
                    dock: 'top',
                    items: [
                        {
                            xtype: 'container',
                            flex: 1
                        },
                        {
                            xtype: 'buttongroup',
                            items: [
                                {
                                    xtype: 'b4closebutton',
                                    listeners: {
                                        click: function (btn) {
                                            btn.up('window').close();
                                        }
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        me.callParent(arguments);
    }
});