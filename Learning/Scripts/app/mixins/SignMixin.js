Ext.define('B4.mixins.SignMixin', {

    signCompleted: function (success, message) {
        if (success) {

        } else {
            Ext.Msg.alert('Ошибка', message);
        }
    },

    saveSign: function (id, sign) {
        Ext.Msg.alert('Внимание', 'Не определен метод сохранения подписи');
    },

    signData: function (signDataIterator, view) {
        var me = this;

        B4.utils.crypto.CryptoUtils.selectCertificate({
            view: view,
            handler: function (sender, data) {
                me.internalSignData(sender, data, signDataIterator);
            },
            scope: this
        });

        return;
    },

    internalSignData: function (sender, data, signDataIterator) {
        if (signDataIterator.isOver()) {
            this.signCompleted(true);
            return;
        }

        var me = this,
            dataToSign = signDataIterator.getCurrentSignData();

        //Если нет данных для подписи, то обрабатываем следующую итерацию
        if (!dataToSign) {
            signDataIterator.moveNext();
            me.internalSignData(sender, data, signDataIterator);
        }

        //Выполняем подписывание
        B4.utils.Crypto.signData({
            thumbprint: data.Thumbprint,
            content: dataToSign,
            cadesType: B4.utils.Crypto.CADESCOM_CADES_TYPE.CADESCOM_CADES_BES,
            detached: true
            //attributes: [
            //    {
            //        name: B4.utils.Crypto.CADESCOM_ATTRIBUTE
            //            .CADESCOM_AUTHENTICATED_ATTRIBUTE_SIGNING_TIME,
            //        value: new Date()
            //    },
            //    {
            //        name: B4.utils.Crypto.CADESCOM_ATTRIBUTE
            //            .CADESCOM_AUTHENTICATED_ATTRIBUTE_DOCUMENT_NAME,
            //        value: 'Тестовый документ'
            //    }
            //]
        }, function (res) {
            if (res.success) {
                // Действия в случае удачного подписания
                me.saveSign(signDataIterator.getCurrent(), res.data);
            } else {
                signCompleted(false, res.error);
                return;
            }

            //Выполняем следующую итерацию
            signDataIterator.moveNext();
            me.internalSignData(sender, data, signDataIterator);
        });
    }
});