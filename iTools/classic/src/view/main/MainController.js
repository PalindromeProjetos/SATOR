//@charset UTF-8
Ext.define( 'iTools.view.main.MainController', {
    extend: 'Smart.ux.main.MainController',

    alias: 'controller.main',

    requires: [
        'Smart.ux.main.MainController'
    ],

    url: '../iAdmin/business/Calls/users.php',

    getHubStorage: function () {
        var href = window.location.href.substring(0, window.location.href.indexOf(Ext.manifest.name)),
            storage = new CrossStorageClient(href + 'library/crossdomain/example/hub.html');

        return storage;
    },

    onAfterRenderWorkstation: function (view) {
        var me = this,
            workstation = {},
            storage = me.getHubStorage(),
            areasid = view.down('hiddenfield[name=areasid]'),
            cmesubareassearch = view.down('cmesubareassearch'),
            printlocate = view.down('textfield[name=printlocate]');

        cmesubareassearch.focus(false, 200);

        if(!storage) {
            return false;
        }

        storage.onConnect().then(function () {
           return storage.get('workstation');
        }).then(function (result) {
            if(result || result.length != 0) {
                workstation = Ext.decode(result);
                areasid.setValue(workstation.areasid);
                printlocate.setValue(workstation.printlocate);
                cmesubareassearch.setRawValue(workstation.areasname);
            }
        })['catch'](function (result) {
            console.log(result);
        });
    },

    onUpdateWorkstation: function () {
        var me = this,
            workstation = {},
            view = me.getView(),
            storage = me.getHubStorage(),
            areasid = view.down('hiddenfield[name=areasid]'),
            cmesubareassearch = view.down('cmesubareassearch'),
            printlocate = view.down('textfield[name=printlocate]');

        if(!view.isValid()) {
            return false;
        }

        if(!storage) {
            return false;
        }

        workstation = {
            areasid: areasid.getValue(),
            printlocate: printlocate.getValue(),
            areasname: cmesubareassearch.getRawValue()
        };

        var setKeys = function () {
            storage.del('workstation');
            return storage.set('workstation', JSON.stringify(workstation));
        };

        storage.onConnect()
           .then(setKeys)
           .then(function () {
               return storage.get('workstation');
           }).then(function (res) {
           console.log(res);
        })['catch'](function (err) {
           console.log(err);
        });
    },

    onClosedWorkstation: function () {
        window.location.reload();
    }

});