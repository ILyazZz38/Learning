Ext.define('B4.mixins.finance.KkmClientMixin', {

    //Отправить метод на ККМ
    sendKkmMethod: function (method, viewEl, payload, callback) {
        B4.Ajax.request({
            url: B4.Url.action('/KkmClient/GetKKmClientRequestData'),
            params: {
                method: method
            }
        }).next(function (resp) {
            var response = Ext.decode(resp.responseText);
            if (!response.success) {
                if (viewEl) {
                    viewEl.unmask();
                }
                Ext.MessageBox.alert('Внимание', response.message);
                return;
            }

            var originalDefaultXhrHeader = Ext.Ajax.useDefaultXhrHeader;
            Ext.Ajax.useDefaultXhrHeader = false;
            Ext.Ajax.request({
                url: response.data.url,
                rawData: Ext.encode({
                    Token: response.data.token,
                    Payload: Ext.encode(payload)
                }),

                success: function (kkmResp) {
                    if (viewEl) {
                        viewEl.unmask();
                    }

                    Ext.Ajax.useDefaultXhrHeader = originalDefaultXhrHeader;
                    var kkmResponse = Ext.decode(kkmResp.responseText);
                    kkmResponse.success = kkmResponse.success
                        ? kkmResponse.success
                        : kkmResponse.Success;
                    kkmResponse.message = kkmResponse.message
                        ? kkmResponse.message
                        : kkmResponse.Message;

                    if (!kkmResponse.success) {
                        B4.QuickMsg.warning(kkmResponse.Message);
                        if (callback) {
                            callback(kkmResponse)
                        }
                        return;
                    }

                    if (callback) {
                        callback(kkmResponse);
                    } else {
                        B4.QuickMsg.success('Операция успешно выполнена');
                    }
                },

                failure: function (resp) {
                    if (viewEl) {
                        viewEl.unmask();
                    }

                    Ext.Ajax.useDefaultXhrHeader = originalDefaultXhrHeader;
                    var message = resp.status ? 'При выполнении операции произошла ошибка' : 'Сервер ККМ недоступен';
                    B4.QuickMsg.warning(message);

                    if (callback) {
                        callback({
                            success: false,
                            message: message
                        });
                    }
                }
            });
        }).error(function (resp) {
            console.error(resp);
            if (viewEl) {
                viewEl.unmask();
            }
            B4.QuickMsg.warning('При выполнении операции произошла ошибка');
            if (callback) {
                callback({
                    success: false,
                    message: 'При выполнении операции произошла ошибка'
                });
            }
        });
    },

    getKkmSessionNumber: function (isOpenSession, callback) {
        var me = this;

        me.checkIsCurrentUserWorkingWithKkm(function (isCurrentUserWorkingWithKkm) {
            if (isCurrentUserWorkingWithKkm) {
                //Получаем номер смены на ККМ
                me.sendKkmMethod('GetSessionNumber', null,
                    { IsOpenSession: isOpenSession }, function (kkmResp) {
                        if (callback) {
                            callback(kkmResp.Data);
                        }
                    });
            } else {
                callback(null);
            }
        });
    },

    //Распечатать чек на ККМ
    //operDate - необязательный параметр
    printKkmCheck: function (payId, packLs, operDate, pref, withoutCheck, sumCash, ofd, paymentStatus, avansPayments, callback) {
        var me = this;

        //Проверяем, работает ли текущий пользователь с ККМ
        me.checkIsCurrentUserWorkingWithKkm(function (isCurrentUserWorkingWithKkm) {
            if (!isCurrentUserWorkingWithKkm) {
                callback({
                    success: true
                });
                return;
            }

            //Получаем полезную нагрузку чека
            B4.Ajax.request({
                url: B4.Url.action('/PayFin/GetCheckPayload'),
                params: {
                    payId: payId,
                    operDate: operDate,
                    pref: pref,
                    invert: false,
                    sumCash: sumCash,
                    ofd: ofd,
                    paymentStatus: paymentStatus,
                    avansPayments: Ext.encode(avansPayments)
                }
            }).next(function (resp) {
                var response = Ext.decode(resp.responseText),
                    payload = response.data;
                if (!response.success) {
                    B4.QuickMsg.warning(response.message);
                    callback({
                        success: false,
                        message: response.message
                    });
                    return;
                }

                payload.WithoutCheck = withoutCheck;

                //Выполняем печать на ККМ                
                me.sendKkmMethod('printcheck', null, payload, function (kkmResp) {
                    if (!kkmResp.success) {
                        B4.QuickMsg.warning('Ошибка при печати чека - ' + kkmResp.message);

                        if (callback) {
                            callback(kkmResp);
                        }
                    } else {
                        //Помечаем оплату как распечатанную на ККМ
                        B4.Ajax.request({
                            url: B4.Url.action('/PayFin/ChangeCreatedOnKkm'),
                            params: {
                                value: true,
                                year: new Date(operDate).getFullYear(),
                                packLsId: packLs
                            }
                        }).next(function () {
                            if (callback) {
                                callback(kkmResp);
                            }
                        }).error(function (resp) {
                            console.error(resp);

                            if (callback) {
                                callback(resp);
                            }
                        });
                    }
                });
            });
        });
    },

    //Проверить, работает ли текущий пользователь с ККМ
    checkIsCurrentUserWorkingWithKkm: function (callback) {
        B4.Ajax.request({
            url: B4.Url.action('/KkmClient/IsCurrentUserWorkingWithKkm')
        }).next(function (resp) {
            var response = Ext.decode(resp.responseText);
            callback(response)
        }).error(function () {
            callback(false);
        });
    },

    deleteKkmPayment: function (payId, year, operDate, pref, createdOnKkm, deletedOnKkm, callback) {
        var me = this;

        //Получаем номер сессии на ККМ
        me.getKkmSessionNumber(false, function (sessionNumber) {
            //Проверяем валидность удаления оплаты
            B4.Ajax.request({
                url: B4.Url.action('/PayFin/CheckDeletePermission'),
                params: {
                    Id: payId,
                    Year: year,
                    SessionNumber: sessionNumber
                }
            }).next(function (resp) {
                var response = Ext.decode(resp.responseText);
                if (!response.success) {
                    B4.QuickMsg.warning(response.message);
                    me.unmask();
                    return;
                }

                //Отменяем оплату на ККМ     последний параметр false т.к. удаление вызывается только из пачек оплат
                me.performKkmReturn(payId, operDate, pref, false, createdOnKkm, deletedOnKkm, false, undefined, null, function (returnResp) {
                    callback(returnResp, sessionNumber);
                });
            }).error(function () {
                callback({
                    success: false
                });
            });
        });
    },

    //Вернуть оплату на ККМ
    performKkmReturn: function (payId, operDate, pref, withoutCheck, createdOnKkm, deletedOnKkm, ofd, paymentStatus, avansPayments, callback) {
        var me = this;

        //Проверяем, работает ли текущий пользователь с ККМ
        me.checkIsCurrentUserWorkingWithKkm(function (isCurrentUserWorkingWithKkm) {
            //Если юзер работает с ККМ, то сначала делаем вовзрат на ней
            //При условии, что оплата уже не была удалена на ККМ
            if (isCurrentUserWorkingWithKkm === true && createdOnKkm && !deletedOnKkm) {
                if (!operDate) {
                    B4.QuickMsg.warning('У оплаты не указан опердень. Возможно, она не была распределена');
                    callback({
                        success: false
                    });
                    return;
                }

                //Получаем полезную нагрузку чека
                B4.Ajax.request({
                    url: B4.Url.action('/PayFin/GetCheckPayload'),
                    params: {
                        payId: payId,
                        operDate: operDate,
                        pref: pref,
                        invert: true,
                        ofd: ofd,
                        paymentStatus: paymentStatus,
                        avansPayments: Ext.encode(avansPayments)
                    }
                }).next(function (resp) {
                    var response = Ext.decode(resp.responseText),
                        payload = response.data;
                    if (!response.success) {
                        B4.QuickMsg.warning(response.message);
                        callback({
                            success: false,
                            message: response.message
                        });
                        return;
                    }
                    payload.WithoutCheck = withoutCheck;
                    //Выполняем отмену на ККМ
                    me.sendKkmMethod('returnpayment', null, payload, function (kkmResp) {
                        if (!kkmResp.success) {
                            B4.QuickMsg.warning('Ошибка при отмене оплаты на ККМ - ' + kkmResp.message);

                            if (callback) {
                                callback(kkmResp);
                            }
                        } else {
                            //Помечаем оплату как отмененную на ККМ
                            B4.Ajax.request({
                                url: B4.Url.action('/PayFin/ChangeDeletedOnKkm'),
                                params: {
                                    value: true,
                                    year: new Date(operDate).getFullYear(),
                                    packLsId: payId
                                }
                            }).next(function () {
                                if (callback) {
                                    callback(kkmResp);
                                }
                            }).error(function () {
                                if (callback) {
                                    callback(kkmResp);
                                }
                            });
                        }
                    });
                });
            } else {
                callback({
                    success: true
                });
            }
        });
    }
});