Ext.define('B4.ux.SignDataIterator', {

    //Массив идентификаторов, по которым будут доставаться данные для подписывания
    idArray: [],

    //Метод, возвращающий данные для подписывания для конкретного идентификатора
    getSignData: function (id) { },

    constructor: function (config) {
        if (!config.idArray) {
            console.error('В B4.ux.SignDataIterator при создании не определен массив idArray');
        }
        if (!config.getSignData) {
            console.error('В B4.ux.SignDataIterator при создании не определен метод getSignData');
        }

        this.idArray = config.idArray;
        this.getSignData = config.getSignData;
    },

    curIndex: 0,

    isOver: function () {
        return this.curIndex >= this.idArray.length;
    },

    getCurrent: function () {
        if (this.isOver()) {
            return null;
        }

        return this.idArray[this.curIndex];
    },

    getCurrentSignData: function () {
        if (this.isOver()) {
            return null;
        }

        return this.getSignData(this.getCurrent());
    },

    moveNext: function () {
        this.curIndex++;
    }
});