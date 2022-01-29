/*
   Окно группового изменения сальдо
*/
Ext.define('B4.form.register.personalaccount.groupoperation.SaldoEditView', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.saldoeditgroupview',

    mixins: ['B4.mixins.window.ModalMask'],
    width: 900,
    autoHeight: true,
    layout: 'anchor',
    title: 'Просмотр реестров изменений',
    bodyPadding: 10,

    dataBankId: undefined,
    selectedPersonalAccountList: undefined,
    isHouses: false,

    requires: [
        'B4.ux.button.Close',
        'B4.form.MonthPicker',
        'B4.ux.button.Save',
        'B4.form.ComboBox',
        'B4.store.finance.PackLog',
        'B4.ux.grid.toolbar.Paging',
        'B4.enums.TypeSaldoEditServiceStandart',
        'B4.ux.grid.column.Delete',
        'B4.ux.grid.column.Edit',
    ],

    initComponent: function () {
        var me = this,
            storeSaldoEdit = Ext.create("B4.store.register.personalaccount.groupoperation.SaldoEditWindow");

        Ext.applyIf(me, {
            items: [
                {
                    xtype: 'gridpanel',
                    height: 300,
                    width: 700,
                    name: 'unloadGrid',
                    plugins: [
                        Ext.create('Ext.grid.plugin.CellEditing', {
                            clicksToEdit: 1
                        })
                    ],
                    layout: 'fit',
                    anchor: '0 0',
                    columnLines: true,
                    store: storeSaldoEdit,
                    selModel: Ext.create('Ext.selection.CheckboxModel', {
                        checkOnly: true
                    }),
                    columns: [
                        {
                            xtype: 'gridcolumn',
                            dataIndex: 'operation',
                            flex: 2,
                            text: 'Тип операции',
                            filter: {
                                xtype: 'textfield'
                            }
                        },
                        {
                            xtype: 'gridcolumn',
                            dataIndex: 'sposobraspr',
                            flex: 3,
                            text: 'Способ распределения',
                            filter: {
                                xtype: 'textfield'
                            }
                        },
                        {
                            xtype: 'gridcolumn',
                            dataIndex: 'service',
                            flex: 2,
                            text: 'С услуги',
                            filter: {
                                xtype: 'textfield'
                            }
                        },
                        {
                            xtype: 'gridcolumn',
                            dataIndex: 'supp',
                            flex: 3,
                            text: 'С договора',
                            filter: {
                                xtype: 'textfield'
                            }
                        },
                        {
                            xtype: 'gridcolumn',
                            dataIndex: 'onserv',
                            flex: 3,
                            text: 'На услугу',
                            filter: {
                                xtype: 'textfield'
                            }
                        },
                        {
                            xtype: 'gridcolumn',
                            dataIndex: 'oncontract',
                            flex: 2,
                            text: 'На договор',
                            filter: {
                                xtype: 'textfield'
                            }
                        },
                        {
                            xtype: 'gridcolumn',
                            dataIndex: 'user',
                            flex: 3,
                            text: 'Пользователь',
                            filter: {
                                xtype: 'textfield'
                            }
                        },
                        {
                            xtype: 'datecolumn',
                            dataIndex: 'datuchet',
                            flex: 2,
                            text: 'Дата',
                            format: 'd.m.Y',
                            filter: {
                                xtype: 'textfield'
                            }
                        },
                        {
                            xtype: 'gridcolumn',
                            dataIndex: 'doc',
                            flex: 3,
                            text: 'Документ',
                            filter: {
                                xtype: 'textfield'
                            }
                        },
                        {
                            xtype: 'gridcolumn',
                            dataIndex: 'comment',
                            flex: 2.5,
                            text: 'Комментарий',
                            filter: {
                                xtype: 'textfield'
                            }
                        }
                    ],
                    dockedItems: [
                        {
                            xtype: 'toolbar',
                            dock: 'top',
                            items: [
                                {
                                    xtype: 'buttongroup',
                                    defaults: {
                                        margin: '2 0 2 0'
                                    },
                                    items: [
                                        {
                                            xtype: 'b4updatebutton',
                                            handler: function () {
                                                this.up('gridpanel').getStore().load();
                                            }
                                        },
                                        {
                                            xtype: 'button',
                                            name: 'Unload',
                                            text: 'Выгрузить',
                                            iconCls: 'icon-arrow-down'
                                        }
                                    ]
                                },
                                '->',
                                {
                                    xtype: 'buttongroup',
                                    items: [
                                        {
                                            xtype: 'datefield',
                                            name: 'SaldoEditChargeDate',
                                            allowBlank: false,
                                            filter: {
                                                xtype: 'datefield'
                                            },
                                            labelWidth: 100,
                                            width: 200,
                                            labelAlign: 'right',
                                            fieldLabel: 'Расчетный месяц',
                                            editable: false
                                        }
                                    ]
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