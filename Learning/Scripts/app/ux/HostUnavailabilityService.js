Ext.define('B4.ux.HostUnavailabilityService', {

    //Показать окно с сообщением о недоступности хоста
    showUnavailabilityWindow: function () {
        //Определяем, открыто ли окно 
        var openedWindow = Ext.ComponentQuery.query('window[name=HostUnavailable]')[0];

        if (openedWindow) {
            return;
        }

        var win = Ext.create('Ext.window.Window', {
            name: 'HostUnavailable',
            onTop: true,
            modal: true,
            maskCls: 'showOnTop',
            closable: false,
            title: 'Пожалуйста, подождите',
            defaults: {
                margin: 10
            },
            items: [
                {
                    xtype: 'label',
                    text: 'Хост перестал отвечать. Выполняется попытка восстановления соединения...'
                },
                {
                    xtype: 'progressbar',
                    interval: 500,
                    text: 'Восстановление соединения',
                    listeners: {
                        afterrender: function () {
                            this.wait();
                        }
                    }
                }
            ]
        });
        win.show();
    },

    //Скрыть окно
    hideUnavailabilityWindow: function () {
        //Определяем, открыто ли окно 
        var openedWindow = Ext.ComponentQuery.query('window[name=HostUnavailable]')[0];

        if (!openedWindow) {
            return;
        }

        openedWindow.close();
    }
});