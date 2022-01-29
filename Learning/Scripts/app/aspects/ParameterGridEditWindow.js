/*
    Аспект изменения записи в гриде параметров, основанный на базовом аспекте с перекрытыми
    методами, т.к при запросе записи, помимо Id необходимо передавать 
    и локальный банк данных из которого будет тянуться запись
*/

Ext.define('B4.aspects.ParameterGridEditWindow', {
    extend: 'B4.aspects.GridEditWindow',
    alias: 'widget.paragrideditwindowaspect',
    

    editRecord: function (record) {
        var me = this,
            id = record ? record.getId() : null,
            dataBank = me.getDataBank(record),
            model;

        model = this.getModel(record);

        id ? model.load(id, {
            params: {
                dataBankId: dataBank
            },
            success: function (rec) {
                me.setFormData(rec);
            },
            scope: this
        }) : this.setFormData(new model({ Id: 0 }));
    },
    
    saveRecordHasNotUpload: function (rec) {
        var me = this,
            dataBank = me.getDataBank(rec),
            frm = me.getForm();
   
        me.mask('Сохранение', frm);
        // К сожалению свойство persist не работает поэтому здесь этот костыль
        rec.set('DataBank', dataBank ? dataBank.toString() : 0);
        rec.save(
            {
                id: rec.getId(),
                params: { DataBank: dataBank }
            })
            .next(function (result) {
                me.unmask();
                me.updateGrid();
                me.fireEvent('savesuccess', me, result.record);
            }, this)
            .error(function (result) {
                me.unmask();
                me.fireEvent('savefailure', result.record, result.responseData);

                Ext.Msg.alert('Ошибка сохранения!', Ext.isString(result.responseData) ? result.responseData : result.responseData.message);
            }, this);
    },
    
    getDataBank: function (record) {
        return record && record.data
            ? record.get('DataBank')
            : 0;
    },
    
    updateGrid: function() {
        this.getGrid().getStore().load();
    },

    deleteRecord: function (record) {
        var me = this,
            dataBank = me.getDataBank(record);

        Ext.Msg.confirm('Удаление записи!', 'Вы действительно хотите удалить запись?', function (result) {
            if (result == 'yes') {
                var model = this.getModel(record);

                var rec = new model({ Id: record.getId() });
                rec.set('DataBank', dataBank);
                // Это делается чтобы в запрос на удаление было передано поле банка данных, иначе он передает только Id
                rec.phantom = true;
                me.mask('Удаление', B4.getBody());
                rec.destroy()
                    .next(function () {
                        this.fireEvent('deletesuccess', this);
                        me.updateGrid();
                        me.unmask();
                    }, this)
                    .error(function (result) {
                        Ext.Msg.alert('Ошибка удаления!', Ext.isString(result.responseData) ? result.responseData : result.responseData.message);
                        me.unmask();
                    }, this);
            }
        }, me);
    }
});
