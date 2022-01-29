Ext.define('B4.form.BillingFileField', {
    extend: 'B4.form.FileField',
    alias: 'widget.billingfilefield',
    fileController: 'File',
    downloadAction: 'Get',
    category: 3,
    onFileDownLoad: function () {
        if (this.fileId) {
            window.open(this.getFileUrl(this.fileId, this.category));
        }
    },

    getFileUrl: function (id, category) {
        return B4.Url.content(Ext.String.format('{0}/{1}?Id={2}&Category={3}', this.fileController, this.downloadAction, id, category));
    }
});