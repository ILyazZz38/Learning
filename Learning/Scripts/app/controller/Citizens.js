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
            //'citizenlist grid[name=resultSearch]': {
            //    itemdblclick: this.LoadCitizens
            //},
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

    //onRenderGrid: function (grid) {
    //    var store = grid.getStore();
    //    store.on({
    //        beforeload: function (curStore, operation) {
    //            operation.params = operation.params || {};
    //            operation.params.someMyParametr = 'someMyValue';
    //        }
    //    });
    //    store.load();
    //},

    LoadCitizens: function (e, record) {
        //if (e.id == "create") {
        //    //var view = Ext.widget('CitizenList');
        //    //view.down('form').loadRecord(record);
        //    this.record = record;
        //}
        //if (e.id == "edit") {
        //    //var view = Ext.widget('CitizenList');
        //    //view.down('form').loadRecord(this.record);
        //    this.record = record;
        //};
        //if (e.id == "delete") {
        //    //var view = Ext.widget('CitizenList');
        //    //view.down('form').loadRecord(this.record);
        //    this.record = record;
        //};
        this.record = record;




//        var panel = button.up('citizenlist');
//        var gridpanel = panel.down('gridpanel[name=resultsearch]');

//        var storegridpanel = gridpanel.getstore();
//        /*storegridpanel.load();*/
//        var jdata = this.getparams(panel);
//        ext.ajax.request({
//            url: 'citizens/table',
//            method: 'get',
//            jsondata: jdata,
//            success: function (response) {
//                //var data = ext.decode(response.responsetext);
//                //if (data.success) {
//                    storegridpanel.load();
///*                    store.load();*/
//                //    ext.msg.alert('обновление', data.message);
//                //}
//                //else {
//                //    ext.msg.alert('обновление', 'не удалось обновить');
//                //}
//            }
//        });
/*        storeGridPanel.load();*/
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
            gridPanel.store.remoteFilter = false;
            gridPanel.store.clearFilter();
            gridPanel.store.remoteFilter = true;
            //gridPanel.store.filter(...);
            gridPanel.getStore();
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
        //var jData = this.GetParams(panel);

        //Ext.Ajax.request({
        //    url: 'Citizens/Table',
        //    /*method: 'POST',*/
        //    method: 'GET',
        //    jsonData: jData,
        //    success: function (response) {
        //        //var data = Ext.decode(response.responseText);
        //        //if (data.success) {
        //            storeGridPanel.load();
        //        //    Ext.Msg.alert('Обновление', data.message);
        //        //}
        //        //else {
        //        //    Ext.Msg.alert('Обновление', 'Не удалось обновить');
        //        //}
        //    }
        //});
        /*storeGridPanel.load();*/
    },

    //GetParams: function (panel) {
    //    var surnameText = panel.down('textfield[name=surnamefilter]').getValue();
    //    var nameText = panel.down('textfield[name=namefilter]').getValue();
    //    var fathernameText = panel.down('textfield[name=fathernamefilter]').getValue();
    //    var firstdateDate = panel.down('datefield[name=firstdatefilter]');
    //    var lastdateDate = panel.down('datefield[name=lastdatefilter]');
    //    var jData = {
    //        surNameFilter: surnameText ? surnameText + '' : '',
    //        nameFilter: nameText ? nameText + '' : '',
    //        fatherNameFilter: fathernameText ? fathernameText + '' : '',
    //        firstDateFilter: firstdateDate.getValue() ? Ext.Date.format(firstdateDate.getValue(), 'Y.m.d') : '',
    //        lastDateFilter: lastdateDate.getValue() ? Ext.Date.format(lastdateDate.getValue(), 'Y.m.d') : '',
    //    };
    //    return jData;
    //},
    //GetAddParams: function (panel) {
    //    var surnameText = panel.down('textfield[name=addSurName]').getValue();
    //    var nameText = panel.down('textfield[name=addFirstName]').getValue();
    //    var fathernameText = panel.down('textfield[name=addFatherName]').getValue();
    //    var birthdayDate = panel.down('datefield[name=addBithday]');
    //    var jData = {
    //        SurName: surnameText ? surnameText + '' : '',
    //        FirstName: nameText ? nameText + '' : '',
    //        FatherName: fathernameText ? fathernameText + '' : '',
    //        Birthday: birthdayDate.getValue() ? Ext.Date.format(birthdayDate.getValue(), 'Y.m.d') : '',
    //    };
    //    return jData;
    //},
    //GetEditParams: function (panel, id) {
    //    var surnameText = panel.down('textfield[name=editSurName]').getValue();
    //    var nameText = panel.down('textfield[name=editFirstName]').getValue();
    //    var fathernameText = panel.down('textfield[name=editFatherName]').getValue();
    //    var birthdayDate = panel.down('datefield[name=editBithday]');
    //    var jData = {
    //        SurName: surnameText ? surnameText + '' : '',
    //        FirstName: nameText ? nameText + '' : '',
    //        FatherName: fathernameText ? fathernameText + '' : '',
    //        Birthday: birthdayDate.getValue() ? Ext.Date.format(birthdayDate.getValue(), 'Y.m.d') : '',
    //        CitizenId: id,
    //    };
    //    return jData;
    //},
    //Окно добавления
    AddCitizen: function () {
        var me = this;

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
                            allowBlank: false  // requires a non-empty value
                        },
                        {
                            margin: '5 5 5 5',
                            xtype: 'textfield',
                            width: 300,
                            name: 'addFirstName',
                            fieldLabel: 'Имя',
                            allowBlank: false  // requires a non-empty value
                        },
                        {
                            margin: '5 5 5 5',
                            xtype: 'textfield',
                            width: 300,
                            name: 'addFatherName',
                            fieldLabel: 'Отчество',
                            allowBlank: false  // requires a non-empty value
                        },
                        {
                            margin: '5 5 5 5',
                            xtype: 'datefield',
                            anchor: '100%',
                            fieldLabel: 'Дата рождения',
                            name: 'addBithday',
                            width: 300,
                            // The value matches the format; will be parsed and displayed using that format.
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
                                    // this == the button, as we are in the local scope
                                    //var container = button.up('container[name=addContainer]');
                                    var panel = button.up('form[name=addPanel]')
                                    var surname = panel.down('textfield[name=addSurName]').getValue();
                                    var firstname = panel.down('textfield[name=addFirstName]').getValue();
                                    var fathername = panel.down('textfield[name=addFatherName]').getValue();
                                    var birthday = panel.down('datefield[name=addBithday]').getValue();

                                    /*var jData = me.GetAddParams(panel);*/

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
                            // The value matches the format; will be parsed and displayed using that format.
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
                            value: surName.getValue,
                            fieldLabel: 'Фамилия',
                            allowBlank: false  // requires a non-empty value
                        },
                        {
                            margin: '5 5 5 5',
                            xtype: 'textfield',
                            width: 300,
                            name: 'editFirstName',
                            value: firstName.getValue,
                            fieldLabel: 'Имя',
                            allowBlank: false  // requires a non-empty value
                        },
                        {
                            margin: '5 5 5 5',
                            xtype: 'textfield',
                            width: 300,
                            name: 'editFatherName',
                            value: fatherName.getValue,
                            fieldLabel: 'Отчество',
                            allowBlank: false  // requires a non-empty value
                        },
                        {
                            margin: '5 5 5 5',
                            xtype: 'datefield',
                            anchor: '100%',
                            name: 'editBithday',
                            value: Birthday.getValue,
                            fieldLabel: 'Дата рождения',
                            width: 300,
                            // The value matches the format; will be parsed and displayed using that format.
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
                                    // this == the button, as we are in the local scope
                                    //var container = button.up('container[name=addContainer]');
                                    var panel = button.up('form[name=editPanel]')
                                    var surname = panel.down('textfield[name=editSurName]').getValue();
                                    var firstname = panel.down('textfield[name=editFirstName]').getValue();
                                    var fathername = panel.down('textfield[name=editFatherName]').getValue();
                                    var birthday = panel.down('datefield[name=editBithday]').getValue();
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
                                                    /*var store = Ext.widget('editColumn').getStore();*/
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
                            // The value matches the format; will be parsed and displayed using that format.
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
                            var panel = button.up('form[name=editPanel]')
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
                                        //var store = Ext.widget('citizenlist').getStore();
                                        //var record = store.getById(id);
                                        //store.remove(record);
                                        //gridPanel.getForm.reset();
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

        //window.open('Report/GetReport', '.pdf')
        var form = Ext.create('Ext.form.Panel', {
            standardSubmit: true,
            method: 'POST',
            url: 'FastReport/GetReport',

        });

        // Call the submit to begin the file download.
        form.submit({
            target: '_blank', // Avoids leaving the page. 

        });


    },
});