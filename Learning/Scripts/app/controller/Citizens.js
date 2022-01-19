Ext.define('Learning.controller.Citizens', {
    extend: 'Ext.app.Controller',

    views: ['CitizenList'/*, 'Citizen'*/],
    stores: ['CitizenStore'],
    models: ['Citizen'],
    init: function () {
        this.control({
            'viewport > citizenlist': {
                itemdblclick: this.editCitezen
            },
            'citizenlist button[action=search]': {
                click: this.SearchCitizen
            }
            //'citizenwindow button[action=new]': {
            //    click: this.createBook
            //},
            //'citizenwindow button[action=change]': {
            //    click: this.updateBook
            //},
            //'citizenwindow button[action=delete]': {
            //    click: this.deleteBook
            //},
            //'bookwindow button[action=clear]': {
            //    click: this.clearForm
        });
    },
    // обновление
    updateBook: function (button) {
        var win = button.up('window'),
            form = win.down('form'),
            values = form.getValues(),
            id = form.getRecord().get('id');
        values.id = id;
        Ext.Ajax.request({
            url: 'app/data/update.php',
            params: values,
            success: function (response) {
                var data = Ext.decode(response.responseText);
                if (data.success) {
                    var store = Ext.widget('citizenlist').getStore();
                    store.load();
                    Ext.Msg.alert('Обновление', data.message);
                }
                else {
                    Ext.Msg.alert('Обновление', 'Не удалось обновить гражданина в реестре');
                }
            }
        });
    },
    // создание
    createBook: function (button) {
        var win = button.up('window'),
            form = win.down('form'),
            values = form.getValues();
        Ext.Ajax.request({
            url: 'app/data/create.php',
            params: values,
            success: function (response, options) {
                var data = Ext.decode(response.responseText);
                if (data.success) {
                    Ext.Msg.alert('Создание', data.message);
                    var store = Ext.widget('citizenlist').getStore();
                    store.load();
                }
                else {
                    Ext.Msg.alert('Создание', 'Не удалось добавить гражданина в реестр');
                }
            }
        });
    },
    // удаление
    deleteBook: function (button) {
        var win = button.up('window'),
            form = win.down('form'),
            id = form.getRecord().get('id');
        Ext.Ajax.request({
            url: 'app/data/delete.php',
            params: { id: id },
            success: function (response) {
                var data = Ext.decode(response.responseText);
                if (data.success) {
                    Ext.Msg.alert('Удаление', data.message);
                    var store = Ext.widget('citizenlist').getStore();
                    var record = store.getById(id);
                    store.remove(record);
                    form.getForm.reset();
                }
                else {
                    Ext.Msg.alert('Удаление', 'Не удалось удалить гражданина из реестра');
                }
            }
        });
    },
    clearForm: function (grid, record) {
        var view = Ext.widget('citizenwindow');
        view.down('form').getForm().reset();
    },
    editCitezen: function (grid, record) {
        var view = Ext.widget('citizenwindow');
        view.down('form').loadRecord(record);
    },

    SearchCitizen: function (button) {
        var panel = button.up('citizenlist');
        var gridPanel = panel.down('gridpanel[name=resultSearch]');

        var storeGridPanel = gridPanel.getStore();

        var jData = this.GetParams(panel);

        Ext.Ajax.request({
            url: 'Search/preSearch',
            method: 'POST',
            jsonData: jData,
            success: function (response) {
                var data = Ext.decode(response.responseText);
                if (data.success) {
                    var store = Ext.widget('booklist').getStore();
                    store.load();
                    Ext.Msg.alert('Обновление', data.message);
                }
                else {
                    Ext.Msg.alert('Обновление', 'Не удалось обновить книгу в библиотеке');
                }
            }
        });
        storeGridPanel.load();
    },
    GetParams: function (panel) {
        var surnameText = panel.down('textfield[name=surnamefilter]').getValue();
        var nameText = panel.down('textfield[name=namefilter]').getValue();
        var fathernameText = panel.down('textfield[name=fathernamefilter]').getValue();
        var firstdateDate = panel.down('datefield[name=firstdatefilter]');
        var lastdateDate = panel.down('datefield[name=lastdatefilter]');
        var jData = {
            surNameFilter: surnameText ? surnameText + '' : '',
            nameFilter: nameText ? nameText + '' : '',
            fatherNameFilter: fathernameText ? fathernameText + '' : '',
            firstDateFilter: firstdateDate.getValue() ? Ext.Date.format(firstdateDate.getValue(), 'Y.m.d') : '',
            lastDateFilter: lastdateDate.getValue() ? Ext.Date.format(lastdateDate.getValue(), 'Y.m.d') : '',
        };
        return jData;
    }
});