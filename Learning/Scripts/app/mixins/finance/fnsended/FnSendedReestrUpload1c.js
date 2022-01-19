Ext.define('B4.mixins.finance.fnsended.FnSendedReestrUpload1c', {

    initFnSendedReestrUpload1c: function (control) {
        var me = this;

        control['button[name=FnSendedReestrUpload1c]'] = {
            click: {
                fn: me.showFnSendedReestrUpload1cWindow,
                scope: me
            }
        };
        control['fnsendedreestrupload1cwindow'] = {
            afterrender: {
                fn: me.onShow,
                scope: me
            }
        };
        control['fnsendedreestrupload1cwindow button[name=Upload]'] = {
            click: {
                fn: me.onUpload,
                scope: me
            }
        };
        control['fnsendedreestrupload1cwindow button[name=Confirm]'] = {
            click: {
                fn: me.onConfirm,
                scope: me
            }
        };
        control['fnsendedreestrupload1cwindow button[name=RefreshStatus]'] = {
            click: {
                fn: me.onRefreshStatus,
                scope: me
            }
        };
        control['fnsendedreestrupload1cwindow button[name=DownloadLog]'] = {
            click: {
                fn: me.onDownloadLog,
                scope: me
            }
        };
        control['fnsendedreestrupload1cwindow button[name=Reset]'] = {
            click: {
                fn: me.onReset,
                scope: me
            }
        };
        control['fnsendedreestrupload1cwindow b4closebutton'] = {
            click: {
                fn: me.onCloseWindow,
                scope: me
            }
        };

        me.subscribeSignalR();
    },

    subscribeSignalR: function () {
        var me = this;

        B4.signalR.hubs.messageHub.fnSendedReestrUpload1cStatusChanged.push(function (status) {
            var view = Ext.ComponentQuery.query('fnsendedreestrupload1cwindow')[0];

            if (view) {
                me.setFormByStatus(view, status);
                B4.QuickMsg.info('Статус загрузки реестра платежных поручений изменен на ' + me.getStatusDisplay(status));
            }
        });
    },

    getStatusDisplay: function (status) {
        var display;

        Ext.iterate(B4.enums.FnSendedReestrUpload1cStatusType.Meta,
            function (x) {
                var item = B4.enums.FnSendedReestrUpload1cStatusType.Meta[x];
                if (item.Value == status) {
                    display = item.Display;
                }
            });

        return display;
    },

    showFnSendedReestrUpload1cWindow: function (btn) {
        var view = Ext.create('B4.view.finance.transferregister.FnSendedReestrUpload1cWindow');
        view.show();
    },

    onShow: function (view) {
        var me = this,
            grid = view.down('gridpanel'),
            selectionModel = grid.getSelectionModel();

        grid.getStore().on({
            load: function (curStore, records) {
                var recordsToCheck = records.filter(function (x) {
                    return !x.get('IsReadOnly');
                });

                selectionModel.select(recordsToCheck);
            }
        });

        selectionModel.on({
            beforeselect: function (cur, rec) {
                if (rec.get('IsReadOnly')) {
                    B4.QuickMsg.warning('У записи указана некорректная дата');
                    return false;
                }
            }
        });

        me.getLastUpload(view);
    },

    onRefreshStatus: function (btn) {
        var me = this,
            view = btn.up('window');

        me.getLastUpload(view);
    },

    //Получаем последний экземпляр загрузки
    getLastUpload: function (view) {
        var me = this,
            viewEl = view.getEl();

        viewEl.mask('Загрузка...');
        B4.Ajax.request({
            url: B4.Url.action('/FnSendedReestrUpload1c/GetLastUpload')
        }).next(function (resp) {
            viewEl.unmask();
            var response = Ext.decode(resp.responseText);
            //Настраиваем форму в соответствии со статусом
            me.setFormByStatus(view, response.data != null
                ? response.data.Status
                : null);
        }).error(function () {
            viewEl.unmask();
            B4.QuiskMsg.warning('При получении загрузки произошла ошибка');
        });
    },

    //Настраиваем форму в соответствии со статусом
    setFormByStatus: function (view, status) {
        var me = this,
            file = view.down('fieldset[name=UploadFile]'),
            statusContainer = view.down('[name=StatusContainer]'),
            statusField = view.down('[name=Status]'),
            transferGrid = view.down('[name=TransferGrid]'),
            confirmButton = view.down('button[name=Confirm]'),
            uploadButton = view.down('button[name=Upload]'),
            resetButton = view.down('button[name=Reset]'),
            downloadLogButton = view.down('button[name=DownloadLog]');

        //Устанавливаем наименование статуса
        if (status) {
            statusField.setValue(me.getStatusDisplay(status));
        }

        file.hide();
        statusContainer.hide();
        transferGrid.hide();
        confirmButton.hide();
        uploadButton.hide();
        downloadLogButton.hide();
        resetButton.hide();

        switch (status) {
            case B4.enums.FnSendedReestrUpload1cStatusType.UploadingFile:
                statusContainer.show();
                break;
            case B4.enums.FnSendedReestrUpload1cStatusType.TransferAnalysis:
                statusContainer.show();
                confirmButton.show();
                downloadLogButton.show();
                resetButton.show();
                transferGrid.show();
                transferGrid.getStore().load();
                break;
            case B4.enums.FnSendedReestrUpload1cStatusType.TransferConfirmation:
                statusContainer.show();
                break;
            case B4.enums.FnSendedReestrUpload1cStatusType.Completed:
            case B4.enums.FnSendedReestrUpload1cStatusType.UploadError:
            case B4.enums.FnSendedReestrUpload1cStatusType.ConfirmationError:
                statusContainer.show();
                uploadButton.show();
                file.show();
                downloadLogButton.show();
                break;
            default:
                {
                    uploadButton.show();
                    file.show();
                }
        }

        view.getForm().isValid();
    },

    onUpload: function (btn) {
        var me = this,
            view = btn.up('window'),
            viewEl = view.getEl();

        if (!view.down('[name=File]').rawValue) {
            B4.QuickMsg.warning('Необходимо выбрать файл');
            return;
        }

        viewEl.mask('Загрузка...');
        view.getForm().submit({
            url: B4.Url.action('/FnSendedReestrUpload1c/UploadFile'),
            success: function (meta, resp) {
                viewEl.unmask();

                var response = Ext.decode(resp.response.responseText);
                if (!B4.HandleResponseError(response)) {
                    return;
                }

                B4.QuickMsg.info('Файл загружается');
            },

            failure: function (meta, resp) {
                viewEl.unmask();

                var response = Ext.decode(resp.response.responseText);
                B4.QuickMsg.warning(response.message);
            }
        });
    },

    onConfirm: function (btn) {
        var me = this,
            view = btn.up('window'),
            viewEl = view.getEl(),
            records = view.down('gridpanel').getSelectionModel().getSelection().map(function (x) {
                return x.get('Id');
            });

        if (!records.length) {
            B4.QuickMsg.warning('Необходимо указать записи для подтверждения');
            return;
        }

        Ext.Msg.confirm('Внимание', 'Вы действительно хотите подтвердить загрузку?', function (ans) {
            if (ans == 'yes') {
                viewEl.mask('Подтверждение...');
                B4.Ajax.request({
                    url: B4.Url.action('/FnSendedReestrUpload1c/ConfirmUpload'),
                    params: {
                        records: Ext.encode(records)
                    }
                }).next(function (resp) {
                    viewEl.unmask();
                    var response = Ext.decode(resp.responseText);

                    if (!B4.HandleResponseError(response)) {
                        return;
                    }

                    B4.QuickMsg.info('Выполняется подтверждение');
                }).error(function () {
                    viewEl.unmask();
                    B4.QuickMsg.warning('При подтверждении произошла ошибка');
                });
            }
        });
    },

    onDownloadLog: function (btn) {
        window.open(B4.Url.action('/FnSendedReestrUpload1c/DownloadLog'));
    },

    onReset: function (btn) {
        var me = this,
            view = btn.up('window'),
            viewEl = view.getEl();

        Ext.Msg.confirm('Внимание', 'Вы действительно хотите сбросить процесс загрузки?', function (ans) {
            if (ans == 'yes') {
                viewEl.mask('Сбрасывание процесса загрузки...');
                B4.Ajax.request({
                    url: B4.Url.action('/FnSendedReestrUpload1c/Reset')
                }).next(function (resp) {
                    viewEl.unmask();

                    var response = Ext.decode(resp.responseText);
                    if (!B4.HandleResponseError(response)) {
                        return;
                    }

                    B4.QuickMsg.success('Процесс сброшен');
                    me.getLastUpload(view);
                }).error(function (resp) {
                    viewEl.unmask();
                    B4.QuickMsg.warning('При сбросе процесса произошла ошибка');
                });
            }
        });
    },

    onCloseWindow: function(btn) {
        var view = btn.up('window'),
            bcReestrGrid = Ext.ComponentQuery.query('transferregisterpanel gridpanel[name=PaymentOrdersRegistryGrid]')[0];

        view.close();

        if (!bcReestrGrid) {
            return;
        }

        bcReestrGrid.getStore().load();
    }
});