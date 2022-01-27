Ext.define('Learning.controller.Citizens', {
    extend: 'Ext.app.Controller',

    views: ['CitizenList', 'Add'],
    stores: ['CitizenStore'],
    models: ['Citizen'],
    init: function () {
        this.control({
            'viewport > citizenlist': {
                itemclick: this.LoadCitizens
            },
            'citizenlist button[action=search]': {
                click: this.SearchCitizen
            },
            'citizenlist button[action=create]': {
                click: this.AddCitizen
            },
            'citizenlist button[action=edit]': {
                click: this.EditCitizen
            },
            'citizenlist button[action=delete]': {
                click: this.DeleteCitizen
            },
            'citizenlist button[action=print]': {
                click: this.Print
            }
       
        });
    },

    LoadCitizens: function (e, record) {
        this.record = record;
    },

    SearchCitizen: function (button) {
        var panel = button.up('citizenlist');
        var gridPanel = panel.down('gridpanel[name=table]');
        var surnameText = panel.down('textfield[name=surname]').getValue();
        var firstnameText = panel.down('textfield[name=firstname]').getValue();
        var fathernameText = panel.down('textfield[name=fathername]').getValue();
        var firstDate = panel.down('datefield[name=firstdate]').getValue();
        var lastDate = panel.down('datefield[name=lastdate]').getValue();
        if (surnameText == "" & firstnameText == "" & fathernameText == "" & firstDate == null & lastDate == null) {
            //gridPanel.store.remoteFilter = false;
            //gridPanel.store.clearFilter();
            //gridPanel.store.remoteFilter = true;
            //gridPanel.getStore();
        }
        else {
            if (surnameText != "") {
                gridPanel.getStore().filter([{
                    property: 'surname',
                    value: surnameText
                }
                ]);
            }
            
            if (firstnameText != "") {
                gridPanel.getStore().filter([{
                    property: 'firstname',
                    value: firstnameText
                }
                ]);
            }
            
            if (fathernameText != "") {
                gridPanel.getStore().filter([{
                    property: 'fathername',
                    value: fathernameText
                }
                ]);
            }

            if (firstDate != null) {
                gridPanel.getStore().filter([{
                    filterFn: function (item) {
                        var value = item.get('birthday');
                        value = value.substring(0, 10);
                        value = Ext.Date.parse(value, 'd.m.Y')
                        return value > firstDate
                    }
                }
                ]);
            }
            if (lastDate != null) {
                gridPanel.getStore().filter([{
                    filterFn: function (item) {
                        var value = item.get('birthday');
                        value = value.substring(0, 10);
                        value = Ext.Date.parse(value, 'd.m.Y')
                        return value < lastDate
                    }
                }
                ]);
            }
        }
    },

    //Окно добавления
    AddCitizen: function (upButton) {
        var list = upButton.up('citizenlist');
        var gridPanel = list.down('gridpanel[name=table]');

        var form = new Ext.form.Panel({
            height: 165,
            width: 315,
            name: 'addPanel',
            items: [
                {
                    xtype: 'container',
                    name: 'addContainer',
                    layout: {
                        type: 'vbox',
                    },
                    items: [
                        {
                            margin: '5 5 5 5',
                            xtype: 'textfield',
                            width: 300,
                            name: 'addSurName',
                            fieldLabel: 'Фамилия',
                            allowBlank: false
                        },
                        {
                            margin: '5 5 5 5',
                            xtype: 'textfield',
                            width: 300,
                            name: 'addFirstName',
                            fieldLabel: 'Имя',
                            allowBlank: false
                        },
                        {
                            margin: '5 5 5 5',
                            xtype: 'textfield',
                            width: 300,
                            name: 'addFatherName',
                            fieldLabel: 'Отчество',
                            allowBlank: false
                        },
                        {
                            margin: '5 5 5 5',
                            xtype: 'datefield',
                            anchor: '100%',
                            fieldLabel: 'Дата рождения',
                            name: 'addBithday',
                            width: 300,
                            format: 'd m Y',
                            value: '2 4 1978'
                        },
                        {
                            margin: '5 5 5 5',
                            xtype: 'button',
                            text: 'Добавить',
                            name: 'addButton',
                            width: 75,
                            listeners: {
                                click: function (button) {
                                    var panel = button.up('form[name=addPanel]')
                                    var surname = panel.down('textfield[name=addSurName]').getValue();
                                    var firstname = panel.down('textfield[name=addFirstName]').getValue();
                                    var fathername = panel.down('textfield[name=addFatherName]').getValue();
                                    var birthday = panel.down('datefield[name=addBithday]').getValue();

                                    if (surname.getValue != '' | firstname.getValue != '' | birthday.getValue != '') {
                                        Ext.Ajax.request({
                                            url: 'EditTableColumn/AddColumn',
                                            params: { surname: surname, firstname: firstname, fathername: fathername, birthday: birthday },
                                            success: function (response, options){
                                                var data = Ext.decode(response.responseText);
                                                if (data.success) {
                                                    Ext.Msg.alert('Добавление гражданина', data.message);
                                                    gridPanel.store.load();
                                                    var win = panel.up('window[name=addWin]');
                                                    win.close();
                                                }
                                                else {
                                                    Ext.Msg.alert('Создание', 'Не удалось добавить гражданина');
                                                }
                                            }
                                        });
                                    }
                                    else {
                                        alert('Введите все данные о гражданине!');
                                    }
                                },
                            }
                        }
                    ]
                }
            ]
        })
        var win = new Ext.Window({
            title: 'Добавление данных о гражданине',
            name: 'addWin',
        });
        win.add(form);
        win.show();
    },

    //Окно реадактирования
    EditCitizen: function (upButton) {
        var list = upButton.up('citizenlist');
        var gridPanel = list.down('gridpanel[name=table]');
        var surName;
        var firstName;
        var fatherName;
        var Birthday;
        if (gridPanel.getSelectionModel().hasSelection()) {
            var selectionModel = gridPanel.getSelectionModel();
            var selectedRecords = selectionModel.getSelection();
            surName = selectedRecords[0].get('surname');
            firstName = selectedRecords[0].get('firstname');
            fatherName = selectedRecords[0].get('fathername');
            Birthday = selectedRecords[0].get('birthday');
            Birthday = Birthday.substring(0, 10);
            Birthday = Ext.Date.parse(Birthday, 'd.m.Y')
        }
        var me = this;
        var form = new Ext.form.Panel({
            height: 165,
            width: 315,
            name: 'editPanel',
            items: [
                {
                    xtype: 'container',
                    name: 'editContainer',
                    layout: {
                        type: 'vbox',
                    },
                    items: [
                        {
                            margin: '5 5 5 5',
                            xtype: 'textfield',
                            width: 300,
                            name: 'editSurName',
                            value: surName,
                            fieldLabel: 'Фамилия',
                            allowBlank: false
                        },
                        {
                            margin: '5 5 5 5',
                            xtype: 'textfield',
                            width: 300,
                            name: 'editFirstName',
                            value: firstName,
                            fieldLabel: 'Имя',
                            allowBlank: false
                        },
                        {
                            margin: '5 5 5 5',
                            xtype: 'textfield',
                            width: 300,
                            name: 'editFatherName',
                            value: fatherName,
                            fieldLabel: 'Отчество',
                            allowBlank: false
                        },
                        {
                            margin: '5 5 5 5',
                            xtype: 'datefield',
                            anchor: '100%',
                            name: 'editBithday',
                            value: Birthday,
                            fieldLabel: 'Дата рождения',
                            width: 300,
                            format: 'd m Y'
                        },
                        {
                            margin: '5 5 5 5',
                            xtype: 'button',
                            text: 'Изменить',
                            name: 'editButton',
                            width: 75,
                            listeners: {
                                click: function (button) {
                                    var panel = button.up('form[name=editPanel]')
                                    var id;
                                    if (gridPanel.getSelectionModel().hasSelection()) {
                                        var selectionModel = gridPanel.getSelectionModel()
                                        var selectedRecords = selectionModel.getSelection()
                                        id = selectedRecords[0].get('id_citizen')
                                    }

                                    if (surname != '' | firstname != '' | birthday != '') {
                                        Ext.Ajax.request({
                                            url: 'EditTableColumn/UpdateColumn',
                                            params: {id: id, surname: surname, firstname: firstname, fathername: fathername, birthday: birthday },
                                            success: function(response, options) {
                                                var data = Ext.decode(response.responseText);
                                                if (data.success) {
                                                    Ext.Msg.alert('Изменение', data.message);
                                                    gridPanel.store.load();
                                                    var win = panel.up('window[name=editWin]');
                                                    win.close();
                                                }
                                                else {
                                                    Ext.Msg.alert('Изменение', 'Не удалось обновить строку ');
                                                }
                                            }
                                        });
                                    }
                                    else {
                                        alert('Введите все данные о гражданине!');
                                    }
                                },
                            }
                        }
                    ]
                }
            ]
        })
        var win = new Ext.Window({
            title: 'Изменение данных гражданина',
            name: 'editWin'
        });
        win.add(form);
        win.show();
    },

    //Окно подтверждения удаления
    DeleteCitizen: function (upButton) {
        var list = upButton.up('citizenlist');
        var gridPanel = list.down('gridpanel[name=table]');

        var form = new Ext.form.Panel({
            height: 35,
            width: 245,
            name: 'delPanel',
            layout: {
                
                type: 'hbox',
            },
            items: [
                {
                    xtype: 'button',
                    name: 'deleteButton',
                    margin: '5 5 5 5',
                    text: 'Удалить данные!',
                    listeners: {
                        click: function (button) {
                            var id;
                            var panel = button.up('form[name=delPanel]')
                            if (gridPanel.getSelectionModel().hasSelection()) {
                                var selectionModel = gridPanel.getSelectionModel()
                                var selectedRecords = selectionModel.getSelection()
                                id = selectedRecords[0].get('id_citizen')
                            }
                            Ext.Ajax.request({
                                url: 'EditTableColumn/DeleteColumn',
                                params: { id: id },
                                success: function (response) {
                                    var data = Ext.decode(response.responseText);
                                    if (data.success) {
                                        Ext.Msg.alert('Удаление', data.message);
                                        gridPanel.store.load();
                                        var win = panel.up('window[name=delWin]');
                                        win.close();
                                    }
                                    else {
                                        Ext.Msg.alert('Удаление', 'Не удалось удалить строку');
                                    }
                                }
                            });
                        }
                    }
                },
                {
                    xtype: 'button',
                    name: 'dontDeleteButton',
                    margin: '5 5 5 5',
                    text: 'Не удалять данные!',
                    listeners: {
                        click: function (button) {
                            var panel = button.up('form[name=delPanel]')
                            var win = panel.up('window[name=delWin]');
                            win.close();
                        }
                    }
                }
            ]
        })
        var win = new Ext.window.Window({
            title: 'Удалить данные гражданина?',
            name: 'delWin',
        });
        win.add(form);
        win.show();
    },

    Print: function () {
        var form = Ext.create('Ext.form.Panel', {
            standardSubmit: true,
            method: 'POST',
            url: 'FastReport/GetReport',
        });
        form.submit({
            target: '_blank',
        });
    },
});