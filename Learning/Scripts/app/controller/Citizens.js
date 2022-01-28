Ext.define('Learning.controller.Citizens', {
    extend: 'Ext.app.Controller',
    views: ['CitizenList'],
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
            },
        });
        getFilter = 0;
    },

    LoadCitizens: function (e, record) {
        this.record = record;
    },

    //Поиск по фильтрам
    SearchCitizen: function (button) {
        var panel = button.up('citizenlist');
        var gridPanel = panel.down('gridpanel[name=table]');
        var surnameText = panel.down('textfield[name=surname]').getValue();
        var firstnameText = panel.down('textfield[name=firstname]').getValue();
        var fathernameText = panel.down('textfield[name=fathername]').getValue();
        var firstDate = panel.down('datefield[name=firstdate]').getValue();
        var lastDate = panel.down('datefield[name=lastdate]').getValue();        
        var qwerty = panel.down('datefield[name=firstdate]');

        if (surnameText == "" & firstnameText == "" & fathernameText == "" & firstDate == null & lastDate == null) {
            Ext.Msg.alert('Ошибка!', 'Поиск невозможен! Введите данные для поиска!');
        }
        else {
            if (firstDate == null) {
                firstDate = '01 01 0001'
            }
            if (lastDate == null) {
                lastDate = '01 01 0001'
            }

            var gridStore = gridPanel.getStore();
            gridStore.load({
                params: {
                    surname: surnameText,
                    firstname: firstnameText,
                    fathername: fathernameText,
                    firstBirthday: firstDate,
                    lastBirthday: lastDate
                },
                callback: function (records, operation, success) {
                    try {
                        var data = Ext.decode(operation.response.responseText);
                        if (data.success) {
                            getFilter = 1;
                            globalSurname = surnameText;
                            globalFirstname = firstnameText;
                            globalFathername = fathernameText;
                            if (firstDate == null) {
                                globalFirstdate = '01 01 0001'
                            }
                            else {
                                globalFirstdate = firstDate;
                            }
                            if (lastDate == null) {
                                globalLastdate = '01 01 0001'
                            }
                            else {
                                globalLastdate = lastDate;
                            }
                        }
                    }
                    catch {
                        Ext.Msg.alert('Ошибка!', 'Граждане с похожими данными не найдены!');
                    }
                },
            });
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
                            fieldLabel: 'Отчество'
                        },
                        {
                            margin: '5 5 5 5',
                            xtype: 'datefield',
                            anchor: '100%',
                            fieldLabel: 'Дата рождения',
                            name: 'addBithday',
                            width: 300,
                            allowBlank: false,
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
                                                    if (getFilter == 1) {
                                                        var gridStore = gridPanel.getStore();
                                                        gridStore.load({
                                                            params: {
                                                                surname: globalSurname,
                                                                firstname: globalFirstname,
                                                                fathername: globalFathername,
                                                                firstBirthday: globalFirstdate,
                                                                lastBirthday: globalLastdate
                                                            },
                                                        });
                                                    }
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
                            fieldLabel: 'Отчество'
                        },
                        {
                            margin: '5 5 5 5',
                            xtype: 'datefield',
                            anchor: '100%',
                            name: 'editBithday',
                            value: Birthday,
                            fieldLabel: 'Дата рождения',
                            width: 300,
                            allowBlank: false,
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
                                    var surname = panel.down('textfield[name=editSurName]').getValue();
                                    var firstname = panel.down('textfield[name=editFirstName]').getValue();
                                    var fathername = panel.down('textfield[name=editFatherName]').getValue();
                                    var birthday = panel.down('datefield[name=editBithday]').getValue();
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
                                                    if (getFilter == 1) {
                                                        var gridStore = gridPanel.getStore();
                                                        gridStore.load({
                                                            params: {
                                                                surname: globalSurname,
                                                                firstname: globalFirstname,
                                                                fathername: globalFathername,
                                                                firstBirthday: globalFirstdate,
                                                                lastBirthday: globalLastdate
                                                            },
                                                        });
                                                    }
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
                                        if (getFilter == 1) {
                                            var gridStore = gridPanel.getStore();
                                            gridStore.load({
                                                params: {
                                                    surname: globalSurname,
                                                    firstname: globalFirstname,
                                                    fathername: globalFathername,
                                                    firstBirthday: globalFirstdate,
                                                    lastBirthday: globalLastdate
                                                },
                                            });
                                        }
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

    //Печать
    Print: function (button) {
        
        if (getFilter == 1) {
            var form = Ext.create('Ext.form.Panel', {
                standardSubmit: true,
            })

            if (globalFirstdate != '01 01 0001')
                var firstDate = Ext.Date.format(globalFirstdate, 'd.m.Y')
            else
                var firstDate = globalFirstdate
            if (globalLastdate != '01 01 0001')
                var lastDate = Ext.Date.format(globalLastdate, 'd.m.Y')
            else
                var lastDate = globalLastdate

            form.getForm().submit({
                url: 'FastReport/GetReport',
                params: {
                    surname: globalSurname,
                    firstname: globalFirstname,
                    fathername: globalFathername,
                    firstBirthday: firstDate,
                    lastBirthday: lastDate
                },
            });
        } else {
            Ext.Msg.alert('Ошибка!', 'Печать невозможна! Введите данные для поиска!');
        }
    },
});