Ext.define('B4.aspects.BillingReportPanel', {
    extend: 'B4.base.Aspect',

    alias: 'widget.billingReportPanelAspect',

    requires: [
        'B4.view.report.BillingReportPanel',
        'B4.QuickMsg',
        'B4.mixins.MaskBody',
        'B4.mixins.LayoutControllerLoader'
    ],

    panelSelector: undefined,
    hidePrepare: false,

    constructor: function (config) {
        Ext.apply(this, config);
        this.callParent(arguments);
    },

    init: function (controller) {
        var me = this;

        me.callParent(arguments);

        controller.control({
            'billingReportPanel': {
                'afterrender': {
                    fn: me.onPanelLoad,
                    scope: me
                }
            }
        });
    },
    
    onPanelLoad: function (panel) {
        var me = this;

        panel.down('panel[name=ReportContainer]').setVisible(!me.hidePrepare);
        panel.down('button[name=GenerateReport]').setVisible(!me.hidePrepare);
    },

    getPanel: function () {
        if (this.gridSelector) {
            return this.componentQuery(this.gridSelector);
        }
        return null;
    },
    
    hltmFormatCode: 32, // 32 - html
    pdfFormatCode: 1, // 1 - pdf

    //Настройка аспекта
    setFormData: function (params) {
        var me = this,
            view = me.getPanel(),
            reportListStore = view.down('combobox[name=ReportList]').getStore();

        //Заполнение списка отчетов
        Ext.iterate(params.reportList, function (record, i) {
            reportListStore.add({
                id: i,
                ClassName: record.ClassName,
                ReportName: record.ReportName,
                ReportParams: typeof record.ReportParams === 'undefined' ? null : record.ReportParams,
                ExtraReportParams: record.ExtraReportParams
            });
        });

        //Подписка на события
        view.down('combobox[name=ReportList]').on({
            change: function () {
                me.selectedReportChanged(view);
            }
        });
        view.down('button[name=GenerateReport]').on({
            click: function () {
                //exportFormat = 32 - html, 35 - html5
                me.generateReport(me.hltmFormatCode);
            }
        });
        view.down('splitbutton[name=PrintReport]').on({
            click: function () {
                if (view.down('combobox[name=ReportList]').getValue() === null) {
                    B4.QuickMsg.msg(
                       'Внимание',
                       'Выберите отчет',
                       'warning'
                   );
                }
            }
        });
    },

    //Генерация отчета
    //exportFormat - идентификатор формата(StiExportFormat), в котором выгружать отчет
    generateReport: function (exportFormat) {
        var me = this,
            view = me.getPanel(),
            reportCombobox = view.down('combobox[name=ReportList]'),
            selValue = reportCombobox.getValue(),
            selRecord,
            reportParams;

        if (selValue === null) {
            B4.QuickMsg.msg(
                'Внимание',
                'Выберите отчет',
                'warning'
            );
            return;
        }
        
        if (!view.getForm().isValid()) {
            B4.QuickMsg.msg(
                'Внимание',
                'Некоторые поля заполнены неправильно!',
                'warning'
            );
            return;
        }
        
        view.getEl().mask('Генерация отчета...');
        
        selRecord = reportCombobox.findRecordByValue(selValue);
        reportParams = selRecord.get('ReportParams');

        Ext.each(view.getForm().getFields().items, function(item) {
            if (!item.name || item.name === 'ReportList') return;
            reportParams[item.name] = item.getValue();
        });
        
        B4.Ajax.request({
            url: 'BillingReport/GetReport',
            params: {
                ReportName: selRecord.get('ReportName'),
                ClassName: selRecord.get('ClassName'),
                ExportFormat: exportFormat,
                ReportParams: Ext.encode([reportParams])
            },

            timeout: 600000
        }).next(function (response) {
            //Если отчет не надо выгружать => отобразить его на форме (exportFormat = 32 - html)
            var url = Ext.decode(response.responseText);
            if (exportFormat == me.hltmFormatCode && !me.hidePrepare) {
                // если формат html - отображаем на форме
                view.down('panel[name=ReportContainer]').update(url);
            } else if (exportFormat == me.pdfFormatCode) {
                // если pdf - открываем в новом окне
                window.open(url);
            } else {
                // иначе скачиваем
                document.location.href = url;
            }

            view.getEl().unmask();
        })

        .error(function (response) {
            view.getEl().unmask();
            Ext.Msg.alert('Ошибка!', !Ext.isString(response.message) ? 'При создании отчета произошла ошибка!' : response.message);
        });
    },

    //Если изменился выбранный отчет, обновляем список возможных форматов
    selectedReportChanged: function (view) {
        var me = this,
            reportCombobox = view.down('combobox[name=ReportList]'),
            selValue = reportCombobox.getValue(),
            selRecord = reportCombobox.findRecordByValue(selValue),
            extraParams = selRecord.get('ExtraReportParams'),
            result,
            format;

        view.getEl().mask('Подготовка отчета...');
        
        if (extraParams) {
            view.insert(0, extraParams);
            view.down('panel[name=ReportContainer]').anchor = '0 -' + (extraParams.length * 27);
        } else {
            view.down('panel[name=ReportContainer]').anchor = '0 -80';
        }
        view.doLayout();

        B4.Ajax.request({
            url: 'BillingReport/GetExportFormatList',
            params: {
                ReportName: selRecord.get('ReportName'),
                ClassName: selRecord.get('ClassName')
            }
        }).next(function (response) {
            result = Ext.decode(response.responseText);

            //Добавляем в меню пункты с форматами
            var splitButton = view.down('splitbutton[name=PrintReport]');
            splitButton.menu.removeAll();
            for (var i in result.formatList) {
                format = result.formatList[i];

                splitButton.menu.add(Ext.create("Ext.menu.Item", {
                    text: format.Name,
                    iconCls: me.getFormatIcon(format.Id),
                    formatId: format.Id,
                    handler: function (item) {
                        me.generateReport(item.formatId);
                    }
                }));
            }

            view.getEl().unmask();
        })
        .error(function () {
            view.getEl().unmask();
        });
    },

    //Получить иконку формата
    getFormatIcon: function (formatId) {
        switch (formatId) {
            case 1: //PDF
                return 'icon-page-white-acrobat';
            case 12: //Excel
                return 'icon-page-white-excel';
            case 14: //Excel 2007
                return 'icon-page-white-excel';
            case 15: //Word 2007
                return 'icon-page-white-word';
            default:
                return null;
        }
    }
});