Ext.define('B4.form.MultiFileField', {
    extend: 'B4.form.FileField',
    alias: 'widget.multifilefield',
    buttonText: 'Выбрать',
   
    initComponent: function () {
        var me = this;

        me.on('beforeSelectClick', function () {
                me.fileInputEl.set({ multiple: true });
        });

        me.callParent(arguments);
    },

    onInputFileChange: function (button, e, value) {
        this.duringFileSelect = true;
        var me = this,
            upload = me.fileInputEl.dom,
            files = upload.files,
            names = [];

        if (files) {
            for (var i = 0; i < files.length; i++)
                names.push(files[i].name);
            value = names.join(', ');
        }
     
        Ext.form.field.File.superclass.setValue.call(this, value);
        me.setMultiple();
        delete this.duringFileSelect;
    },

    setMultiple: function () {
        var me = this;
        me.fileInputEl.set({ multiple: true });
    }
});