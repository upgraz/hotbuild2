//IntelliSense for WebMatrix /VS
/// <reference path="../.vsdoc/jquery-1.9.1-vsdoc.js" /> 
/// <reference path="../.vsdoc/knockout-2.2.1.debug.js" />
/// <reference path="../.vsdoc/lodash-2.4.1.js" />
var hotbuildsettings = (function () {

    function HotBuildSettingsViewModel(hbglobal, hbglobalkey) {
        var self = this;
        self.hotbuildglobal = ko.observable(hbglobal).extend({ notify: 'always' });;
        self.hotbuildglobalkey = ko.observable(hbglobalkey);
        self.cleanhotbuildglobal = ko.observable(hbglobal);
        self.cleanhotbuildglobalkey = ko.observable(hbglobalkey);
        self.selectedhotbuild = ko.observableArray([]);
        self.filteredunits = ko.observableArray([]);
        self.units = ko.observableArray([]);
        bif.registerBIFReadyCallback(function () {
            var start = /[^\/]*$/;  // ^ : start , \/ : '/', $ : end // as wildcard: /*.json 
            var end = /[.]json$/;
            var filteredresults = [];
            var filteredunits = [];
            var filteredbuildings = [];
            var results = bif.getBuildableUnitIDs();
            for (var i = 0; i < results.length; i++) {
                var bifunit = bif.units[results[i]];
                var hotbuildunit = bifunit;
                hotbuildunit.json = hotbuildunit.path;
                hotbuildunit.displayname = hotbuildunit.display_name;
                hotbuildunit.desc = hotbuildunit.description;
                hotbuildunit.factory = "";
                //console.log(hotbuildunit.json);
                if (_.contains(hotbuildunit.unit_types, 'UNITTYPE_Mobile')) {
                    if (_.contains(hotbuildunit.unit_types, 'UNITTYPE_Basic')) {
                        _.contains(hotbuildunit.unit_types, 'UNITTYPE_Bot') ? hotbuildunit.factory = 'botfac' : '';
                        _.contains(hotbuildunit.unit_types, 'UNITTYPE_Tank') ? hotbuildunit.factory = 'vecfac' : '';
                        _.contains(hotbuildunit.unit_types, 'UNITTYPE_Air') ? hotbuildunit.factory = 'afac' : '';
                        _.contains(hotbuildunit.unit_types, 'UNITTYPE_Naval') ? hotbuildunit.factory = 'nfac' : '';
                    }
                    else {
                        _.contains(hotbuildunit.unit_types, 'UNITTYPE_Bot') ? hotbuildunit.factory = 'abotfac' : '';
                        _.contains(hotbuildunit.unit_types, 'UNITTYPE_Tank') ? hotbuildunit.factory = 'avecfac' : '';
                        _.contains(hotbuildunit.unit_types, 'UNITTYPE_Air') ? hotbuildunit.factory = 'aafac' : '';
                        _.contains(hotbuildunit.unit_types, 'UNITTYPE_Naval') ? hotbuildunit.factory = 'anfac' : '';
                    }
                    //should change to bif is built by orbital launcher
                    //Orbital is changing rapidly so hacky fixes here
                    if (hotbuildunit.json === "/pa/units/orbital/orbital_fabrication_bot/orbital_fabrication_bot.json") {
                        hotbuildunit.factory = 'ofac';
                    }
                    if (hotbuildunit.json === "/pa/units/orbital/orbital_lander/orbital_lander.json") {
                        hotbuildunit.factory = 'ofac';
                    }
                    if (hotbuildunit.json === "/pa/units/orbital/orbital_fighter/orbital_fighter.json") {
                        hotbuildunit.factory = 'ofac';
                    }
                    if (hotbuildunit.json === "/pa/units/orbital/radar_satellite/radar_satellite.json") {
                        hotbuildunit.factory = 'ofac';
                    }
                }

                hotbuildunit.image = hotbuildunit.buildPicture;
                filteredresults.push(hotbuildunit);

            }
            //hack for nuke and anti nuke ammo
            var nukeammo = {};
            nukeammo.json = "/pa/units/land/nuke_launcher/nuke_launcher_ammo.json";
            nukeammo.displayname = "Nuclear Missile";
            nukeammo.desc = "Creates Nuclear Explosion";
            nukeammo.factory = "nuke";
            nukeammo.unit_types = ['UNITTYPE_Air','UNITTYPE_Mobile','UNITTYPE_Orbital'];
            nukeammo.image = '../live_game/img/build_bar/units/' + nukeammo.json.substring(nukeammo.json.search(start), nukeammo.json.search(end)) + '.png';
            nukeammo.display_group = '1';
            filteredresults.push(nukeammo);
            var anukeammo = {};
            anukeammo.json = "/pa/units/land/anti_nuke_launcher/anti_nuke_launcher_ammo.json";
            anukeammo.displayname = "Anti Nuclear Missile";
            anukeammo.desc = "Intercepts Nuclear Missiles";
            anukeammo.factory = "antinuke";
            anukeammo.unit_types = ['UNITTYPE_Air','UNITTYPE_Mobile'];
            anukeammo.image = '../live_game/img/build_bar/units/' + anukeammo.json.substring(anukeammo.json.search(start), anukeammo.json.search(end)) + '.png';
            anukeammo.display_group = '1';
            filteredresults.push(anukeammo);
            
            for (var j = 0; j < filteredresults.length; j++) {
                if (!_.contains(filteredresults[j].unit_types, "UNITTYPE_Structure")){
                    filteredunits.push(filteredresults[j]);
                }
            }
            for (var j = 0; j < filteredresults.length; j++) {
                if (_.contains(filteredresults[j].unit_types, "UNITTYPE_Structure")){
                    filteredbuildings.push(filteredresults[j]);
                }
            }

            filteredbuildings = _.sortBy(filteredbuildings, 'display_group');
            self.filteredunits(filteredbuildings); //set standard on buildings
            self.units(filteredresults);
            updateExistingSettings();
        });

        function updateExistingSettings() {
            //now compare / update the existing hotbuildglobal data so it's always up 2 date
            for (var hbkey in self.hotbuildglobal()) {
                //if(_.contains(self.units(),hb.json))
                for (var i = 0; i < self.hotbuildglobal()[hbkey].length; i++) {
                    var match = _.find(self.units(), { 'json': self.hotbuildglobal()[hbkey][i].json });
                    self.hotbuildglobal()[hbkey][i] = match;
                }
                var goodstuff = [];
                for (var i = 0; i < self.hotbuildglobal()[hbkey].length; i++) {
                    if (self.hotbuildglobal()[hbkey][i] !== undefined) {
                        goodstuff.push(self.hotbuildglobal()[hbkey][i]);
                    }
                }
                self.hotbuildglobal()[hbkey] = goodstuff;

            }
        }
        self.unitbuildfilter = ko.observable(true);
        self.unitbuildfilter.subscribe(function (value) {
            self.activeSubFilters("All");
            self.filterunits();
        });
        self.toggleTopFilter = function (buildings) {
            self.unitbuildfilter(buildings);
        };
        self.filters = ko.observableArray(["All", "Economy", "Factory", "Defense", "Recon"]);
        self.activeSubFilters = ko.observable("All");
        self.activeSubFilters.subscribe(function (value) {
            self.filterunits();
        });
        self.addFilter = function (filter) {
            self.activeSubFilters(filter);
        };
        self.filterunits = function () {
            self.filteredunits([]);
            self.filters([]); //make empty to fix scrolling
            if (self.unitbuildfilter()) {
                self.filters(["All", "Economy", "Factory", "Defense", "Recon"]);
                if (self.activeSubFilters() !== 'All') {
                    //check subfilters for buildings
                    for (var i = 0; i < self.units().length; i++) {
                        if (self.units()[i].factory === "") {
                            if (self.activeSubFilters() === 'Economy' && _.contains(self.units()[i].unit_types, "UNITTYPE_Economy")) {
                                self.filteredunits.push(self.units()[i]);
                            }
                            if (self.activeSubFilters() === 'Factory' && _.contains(self.units()[i].unit_types, "UNITTYPE_Factory")) {
                                self.filteredunits.push(self.units()[i]);

                            }
                            if (self.activeSubFilters() === 'Defense' && _.contains(self.units()[i].unit_types, "UNITTYPE_Defense")) {
                                self.filteredunits.push(self.units()[i]);

                            }
                            if (self.activeSubFilters() === 'Recon' && _.contains(self.units()[i].unit_types, "UNITTYPE_Recon")) {
                                self.filteredunits.push(self.units()[i]);
                            }
                        }
                    }
                }
                else {
                    for (var i = 0; i < self.units().length; i++) {
                        if (self.units()[i].factory === "") {
                            self.filteredunits.push(self.units()[i]);
                        }
                    }
                }
            }
            else {
                self.filters(["All", "Land", "Air", "Naval", "Orbital"]);
                if (self.activeSubFilters() !== 'All') {
                    for (var i = 0; i < self.units().length; i++) {
                        if (self.units()[i].factory !== "") {
                            if (self.activeSubFilters() === 'Land' && _.contains(self.units()[i].unit_types, "UNITTYPE_Land")) {
                                self.filteredunits.push(self.units()[i]);
                            }
                            if (self.activeSubFilters() === 'Air' && _.contains(self.units()[i].unit_types, "UNITTYPE_Air")) {
                                self.filteredunits.push(self.units()[i]);
                            }
                            if (self.activeSubFilters() === 'Naval' && _.contains(self.units()[i].unit_types, "UNITTYPE_Naval")) {
                                self.filteredunits.push(self.units()[i]);
                            }
                            if (self.activeSubFilters() === 'Orbital' && _.contains(self.units()[i].unit_types, "UNITTYPE_Orbital")) {
                                self.filteredunits.push(self.units()[i]);
                            }
                        }
                    }
                }
                else {
                    for (var i = 0; i < self.units().length; i++) {
                        if (self.units()[i].factory !== "") {
                            self.filteredunits.push(self.units()[i]);
                        }
                    }
                }
            }
        };

        self.klayouts = ko.observableArray([]);
        self.klayout = ko.observable({
            //'row0': ['esc', 'F1', 'F2', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'],
            //'row1': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
            'row2': ['tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
            'row3': ['capslock', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', '\'', 'return'],
            'row4': ['left-shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'right-shift'],
            'row5': ['space']
        });

        self.ChangeLayout = function () {
            for (var i = 0; i < self.klayouts.length; i++) {
                if (self.klayouts[i][0] === model.hotbuild_klayout()) {
                    $.getJSON('coui://ui/mods/hotbuild2/layouts/' + self.klayouts[i][1], function (imported) {
                        self.klayout(imported);
                    });
                    
                    break;
                }
            }
        }

        

        self.keyboardkey = ko.observable();
        self.uberkey = ko.observable();
        self.selectedkeyinfo = ko.observable();
        self.selectKey = function () {
            self.selectedhotbuild(self.hotbuildglobal()[self.selectedkeyinfo() + "s"]);
        };
        self.selectedkeyinfo.subscribe(function (value) {
            self.selectKey();
        });
        self.keyboardkey.subscribe(function (value) {
            console.log("keyboard key changed to " + value);

            var keyindex = _.indexOf(_.keys(_.invert(self.hotbuildglobalkey())), value);
            var hotbuildkey = _.keys(self.hotbuildglobalkey())[keyindex];
            if (hotbuildkey !== undefined) {
                self.selectedkeyinfo(hotbuildkey.substring(0, hotbuildkey.length - 1));
            }
            else {
                //find first unused hotbuildkey and select it 
                var lastindex = _.keys(self.hotbuildglobalkey()).length + 1;
                self.hotbuildglobalkey()['hotbuild' + lastindex + 's'] = value;
                self.hotbuildglobal()['hotbuild' + lastindex + 's'] = [];
                self.selectedkeyinfo('hotbuild' + lastindex);

            }
            //get uberkey info
            var fuberkey = false;
            _.forEach(model.keybindGroups(), function (o) {
                _.forEach(o.keybinds(), function (k) {
                    if (k.binding() == value) {
                        fuberkey = true;
                        self.uberkey(k.action());
                    }
                });
            });
            if (!fuberkey) {
                self.uberkey(undefined);
            }
        });


        self.uberkeys = ko.computed(function () {
            var uberkeys = [];
            _.forEach(model.keybindGroups(), function (o) {
                _.forEach(o.keybinds(), function (k) {
                    uberkeys.push(k.binding());
                });
            });
            return uberkeys;
        });

        self.disabledkeys = ko.computed(function () {
            var diskeys = ['capslock', 'left-shift', 'right-shift', 'return'];
            if (model.camera_key_pan_style() === "WASD") {
                diskeys = diskeys.concat(['w', 'a', 's', 'd']);
            }
            return diskeys;
        });

        self.hotbuildkeys = ko.observableArray([]);

        self.hotbuildglobal.subscribe(function (value) {
            self.updatehotbuildkeys();
        });

        self.updatehotbuildkeys = function () {
            self.hotbuildkeys(_.keys(_.invert(self.hotbuildglobalkey())));
        }
        self.Save = function () {
            //do cleanup of empty props
            var viewmodelconfigkey = self.hotbuildglobalkey();
            var viewmodelconfig = self.hotbuildglobal();
            for (var hotkey in viewmodelconfigkey) {
                if (viewmodelconfig[hotkey].length === 0) {
                    delete viewmodelconfigkey[hotkey];
                    delete viewmodelconfig[hotkey];
                }
            }
            //create copy + rename props so they are back sequential
            var copyconfigkey = viewmodelconfigkey;
            var copyconfig = viewmodelconfig;
            viewmodelconfigkey = {};
            viewmodelconfig = {};
            var nr = 1;
            for (var hotkey in copyconfigkey) {
                viewmodelconfigkey['hotbuild' + nr + 's'] = copyconfigkey[hotkey];
                viewmodelconfig['hotbuild' + nr + 's'] = [];
                for (var i = 0; i < copyconfig[hotkey].length; i++) {
                    viewmodelconfig['hotbuild' + nr + 's'].push({ 'json': copyconfig[hotkey][i].json });
                    //viewmodelconfig['hotbuild' + nr + 's'][i] = copyconfig[hotkey][i];
                }
                //viewmodelconfig['hotbuild' + nr + 's'].json = copyconfig[hotkey].json;
                nr++;
            }

            self.cleanhotbuildglobalkey(viewmodelconfigkey);
            self.cleanhotbuildglobal(viewmodelconfig);
            model.hotbuildconfig = self.cleanhotbuildglobal();
            model.hotbuildconfigkey = self.cleanhotbuildglobalkey();
        };



        self.swapKey = function () {
            swapto = $("#swapkey").val();

            if (self.keyboardkey() !== "" && swapto !== "") {
                if (self.keyboardkey() !== swapto) {
                    var swapposition;
                    var currentposition;
                    //find swap position
                    for (var hotkey in self.hotbuildglobalkey()) {
                        if (self.hotbuildglobalkey()[hotkey] === swapto) {
                            swapposition = hotkey;
                            break;
                        }

                    }
                    //find current key position
                    for (var hotkey in self.hotbuildglobalkey()) {
                        if (self.hotbuildglobalkey()[hotkey] === self.keyboardkey()) {
                            currentposition = hotkey;
                            break;
                        }
                    }
                    if (swapposition !== undefined) {
                        self.hotbuildglobalkey()[currentposition] = swapto;
                        self.hotbuildglobalkey()[swapposition] = self.keyboardkey();
                    }
                    else {
                        self.hotbuildglobalkey()[currentposition] = swapto;
                    }
                    self.Save();
                }
            }
            self.updatehotbuildkeys();
            console.log(swapto);
            self.keyboardkey(swapto);

        };
        //remove for dummies that don't know to drag it back 
        self.remFromList = function (item) {
            self.selectedhotbuild.remove(item);
            self.Save();
            self.updatehotbuildkeys();
        };

        self.cDefaultList = ko.observableArray([]);
        self.showingDefaultPrompt = ko.observable(false);
        self.showCommunityDefaultPrompt = function () {
            self.showingDefaultPrompt(true);
            $("#comdefaultsDlg").dialog({
                dialogClass: "no-close",
                draggable: false,
                resizable: false,
                modal: true,
                complete: function (data, textStatus) { }
            });
            $("#setComDefaults").click(function () {
                console.log("set Community Defaults " + model.hotbuild_cdefaults());
                for (var i = 0; i < self.cDefaultList.length; i++) {
                    if (self.cDefaultList[i][0] === model.hotbuild_cdefaults()) {
                        self.importfromfile("/ui/mods/hotbuild2/defaults/" + self.cDefaultList[i][1])
                        break;
                    }
                }
                self.showingDefaultPrompt(false);
                $("#comdefaultsDlg").dialog("close");
            });
            $("#ignoreComDefaults").click(function () {
                self.showingDefaultPrompt(false);
                $("#comdefaultsDlg").dialog("close");
            });
        };

        self.export = function () {
            console.log('export');
            var keyboardsettings = {};
            keyboardsettings.uber = ko.toJS(model.keybindGroups());
            self.Save();
            keyboardsettings.hotbuildglobalkey = self.cleanhotbuildglobalkey();
            keyboardsettings.hotbuildglobal = self.cleanhotbuildglobal();
            keyboardsettings.camera_key_pan_style = model.camera_key_pan_style();
            $("#ieport").val(JSON.stringify(keyboardsettings));
        };

        self.import = function () {
            console.log('import');
            if ($("#ieport").val() !== '') {
                var imported = JSON.parse($("#ieport").val());
                for (var kvgm in imported.uber) {
                    console.log(imported.uber[kvgm].name);
                    var modelKeybindGroupIndex;
                    for (var mkvgm in model.keybindGroups()) {
                        if (imported.uber[kvgm].name === model.keybindGroups()[mkvgm].name()) {
                            modelKeybindGroupIndex = mkvgm;
                            break;
                        }
                    }
                    if (modelKeybindGroupIndex !== undefined) {
                        console.log(model.keybindGroups()[modelKeybindGroupIndex].name());
                        for (var i = 0; i < imported.uber[kvgm].keybinds.length; i++) {
                            for(var j = 0; j < model.keybindGroups()[modelKeybindGroupIndex].keybinds().length; j++){
                                if(imported.uber[kvgm].keybinds[i].action === model.keybindGroups()[modelKeybindGroupIndex].keybinds()[j].action())
                                {
                                    try {
                                        console.log("OLD" + model.keybindGroups()[modelKeybindGroupIndex].keybinds()[i].action() + " = " + model.keybindGroups()[modelKeybindGroupIndex].keybinds()[i].binding());
                                        console.log("NEW" + imported.uber[kvgm].keybinds[i].action + " = " + imported.uber[kvgm].keybinds[i].binding);
                                        model.keybindGroups()[modelKeybindGroupIndex].keybinds()[j].binding(imported.uber[kvgm].keybinds[i].binding);
                                        break;
                                    }
                                    catch (err) {
                                        console.log(err);
                                    }
                                }
                            }
                        }
                    }
                }
                self.hotbuildglobalkey(imported.hotbuildglobalkey);
                self.hotbuildglobal(imported.hotbuildglobal);
                model.camera_key_pan_style(imported.camera_key_pan_style);
                forgetFramePosition('hotbuild_info_frame');
                updateExistingSettings();
                self.Save();
                self.keyboardkey('');
            }
            else {
                //alert("Please input Text to import in textbox");
            }
        };

        self.importfromfile = function (importfile) {
            console.log('importing importfile');
            $.getJSON('coui:/' + importfile, function (imported) {
                for (var kvgm in imported.uber) {
                    console.log(imported.uber[kvgm].name);
                    var modelKeybindGroupIndex;
                    for (var mkvgm in model.keybindGroups()) {
                        if (imported.uber[kvgm].name === model.keybindGroups()[mkvgm].name()) {
                            modelKeybindGroupIndex = mkvgm;
                            break;
                        }
                    }
                    if (modelKeybindGroupIndex !== undefined) {
                        console.log(model.keybindGroups()[modelKeybindGroupIndex].name());
                        for (var i = 0; i < imported.uber[kvgm].keybinds.length; i++) {
                            for(var j = 0; j < model.keybindGroups()[modelKeybindGroupIndex].keybinds().length; j++){
                                if(imported.uber[kvgm].keybinds[i].action === model.keybindGroups()[modelKeybindGroupIndex].keybinds()[j].action())
                                {
                                    try {
                                        console.log("OLD" + model.keybindGroups()[modelKeybindGroupIndex].keybinds()[i].action() + " = " + model.keybindGroups()[modelKeybindGroupIndex].keybinds()[i].binding());
                                        console.log("NEW" + imported.uber[kvgm].keybinds[i].action + " = " + imported.uber[kvgm].keybinds[i].binding);
                                        model.keybindGroups()[modelKeybindGroupIndex].keybinds()[j].binding(imported.uber[kvgm].keybinds[i].binding);
                                        break;
                                    }
                                    catch (err) {
                                        console.log(err);
                                    }
                                }
                            }
                        }
                    }
                }
                self.hotbuildglobalkey(imported.hotbuildglobalkey);
                self.hotbuildglobal(imported.hotbuildglobal);
                model.camera_key_pan_style(imported.camera_key_pan_style);
                forgetFramePosition('hotbuild_info_frame');
                updateExistingSettings();
                self.Save();
                self.keyboardkey('');
            });
        };

        self.showingImportExportDialog = ko.observable(false);

        self.showImportExportDialog = function () {
            self.showingImportExportDialog(true);
            $('#importexportDlg').dialog({
                width: 'auto',
                modal: true,
                buttons: {
                    "Import": function () { self.import(); },
                    "Export": function () { self.export(); }
                },
                close: function () {
                    self.showingImportExportDialog(false);
                }
            });
        };

        self.keyboardclickhandler = function () {
            var $this = $(this);
            var character = $this.html();
            if (!$this.hasClass('dis')) {
                if (!$this.hasClass('active')) {
                    self.keyboardkey(character.toLowerCase());
                }
            }
        };
    }


    var hotbuildglobal = {};
    var hotbuildglobalkey = {};

    var settings = decode(localStorage.settings);
    hotbuildglobal = settings.hotbuildconfig ? settings.hotbuildconfig : hotbuildglobal;
    hotbuildglobalkey = settings.hotbuildconfigkey ? settings.hotbuildconfigkey : hotbuildglobalkey;

    var hbuisettings = new HotBuildSettingsViewModel(hotbuildglobal, hotbuildglobalkey);
    var hotbuildsettings = {};
    hotbuildsettings.viewmodel = hbuisettings;
    hotbuildsettings.viewmodel.updatehotbuildkeys();

    return hotbuildsettings;

})();

(function () {

    function loadHotBuildSettings(element, url, model) {
        element.load(url, function () {
            console.log("Loading html " + url);
            ko.applyBindings(model, element.get(0));
            $("#keyboard li").bind("click dblclick", hotbuildsettings.viewmodel.keyboardclickhandler);
        });
    }

    model.oldSettingsBeforeHotbuild = model.settings;
    model.settings = ko.computed(function () {
        var newSettings = model.oldSettingsBeforeHotbuild();
        newSettings.hotbuildconfigkey = hotbuildsettings.viewmodel.cleanhotbuildglobalkey();
        newSettings.hotbuildconfig = hotbuildsettings.viewmodel.cleanhotbuildglobal();
        return newSettings;
    });

    model.addSetting_DropDown('Choose Community Defaults', 'hotbuild_cdefaults', 'UI', ["DEFAULT"], 0, 'Hotbuild2');
    model.addSetting_Button('', 'Apply Defaults', 'UI', 'hotbuildsettings.viewmodel.showCommunityDefaultPrompt', 'Hotbuild2');
    //model.addSetting_Button('Set Community Defaults', '(&#8592;&#8593;&#8594;&#8595;)', 'UI', 'hotbuildsettings.viewmodel.showCommunityDefaultPrompt', 'Hotbuild2');
    //model.addSetting_Button('Set Community Defaults', 'WASD', 'UI', 'hotbuildsettings.viewmodel.showCommunityDefaultWASDPrompt', 'Hotbuild2');
    model.addSetting_Button('Import/Export', 'Import/Export', 'UI', 'hotbuildsettings.viewmodel.showImportExportDialog', 'Hotbuild2');
    model.addSetting_DropDown('Choose Keyboard Layout', 'hotbuild_klayout', 'UI', ["DEFAULT"], 0, 'Hotbuild2');
    model.addSetting_Button('', 'Change Layout', 'UI', 'hotbuildsettings.viewmodel.ChangeLayout', 'Hotbuild2');
    model.addSetting_DropDown('Hotbuild Show Key on BuildBar', 'hotbuild_show_key_on_buildbar', 'UI', ['ON', 'OFF'], 0, 'Hotbuild2');
    model.addSetting_DropDown('Hotbuild Show Key on SideBar', 'hotbuild_show_key_on_sidebar', 'UI', ['ON', 'OFF'], 0, 'Hotbuild2');
    model.addSetting_Text('Hotbuild Reset Time', 'hotbuild_reset_time', 'UI', 'Number', 2000, 'Hotbuild2');
    model.addSetting_DropDown('Hotbuild Reset Cycle when Shift isn\'t down', 'hotbuild_shift_key_recycle', 'UI', ['ON', 'OFF'], 1, 'Hotbuild2');
    model.registerFrameSetting('hotbuild_info_frame', 'Hotbuild Preview', true);
    
    $.getJSON("coui://ui/mods/hotbuild2/defaults/default_list.json", function (data) {
        var defaultdropdownlist = [];
        for (var i = 0; i < data.defaults.length; i++) {
            defaultdropdownlist.push(data.defaults[i][0]);
        }
        hotbuildsettings.viewmodel.cDefaultList = data.defaults;
        model.hotbuild_cdefaults_options(defaultdropdownlist);
    });
    $.getJSON("coui://ui/mods/hotbuild2/layouts/keyboard_layouts.json", function (data) {
        var defaultdropdownlist = [];
        for (var i = 0; i < data.klayouts.length; i++) {
            defaultdropdownlist.push(data.klayouts[i][0]);
        }
        hotbuildsettings.viewmodel.klayouts = data.klayouts;
        model.hotbuild_klayout_options(defaultdropdownlist);
    });

    ko.bindingHandlers.sortable.beforeMove = function (arg) {
        if (hotbuildsettings.viewmodel.selectedkeyinfo() !== undefined) {
            if (arg.item.factory !== "" && arg.sourceParentNode.className === undefined) {
                var unitCheck = true;
                for (var i = 0; i < hotbuildsettings.viewmodel.selectedhotbuild().length; i++) {
                    if (hotbuildsettings.viewmodel.selectedhotbuild()[i].factory == arg.item.factory) {
                        unitCheck = false;
                        break;
                    }
                }
                if (!unitCheck) {
                    arg.cancelDrop = true;
                }
                return arg;
            }
        }
        else {
            arg.cancelDrop = true;
            return arg;
        }
    };

    ko.bindingHandlers.sortable.afterMove = function (arg) {
        hotbuildsettings.viewmodel.filterunits(); // should really clone eh
        hotbuildsettings.viewmodel.Save();
        hotbuildsettings.viewmodel.updatehotbuildkeys();
    };

    ko.bindingHandlers.keyboard = {
        //init loading of layout using ko
        update: function (element, valueAccessor, allBindings) {

            var isLetter = function (input) {
                var re = /[a-zA-Z]/;
                if (re.test(input)){
                    return true;
                }
                else {
                    return false;
                }
            };
            var isSpecial = function (input, $key) {
                switch (input) {
                    case 'tab':
                        $key.addClass('tab');
                        return true;
                        break;
                    case 'capslock':
                        $key.addClass('capslock');
                        return true;
                        break;
                    case 'return':
                        $key.addClass('return');
                        return true;
                        break;
                    case 'left-shift':
                        $key.addClass('left-shift');
                        return true;
                        break;
                    case 'right-shift':
                        $key.addClass('right-shift');
                        return true;
                        break;
                    case 'space':
                        $key.addClass('space');
                        return true;
                        break;
                    default:
                        return false;
                        break;
                }
            }
            // First get the latest data that we're bound to
            var value = valueAccessor();
            // Next, whether or not the supplied model property is observable, get its current value
            var layoutDefault = ko.utils.unwrapObservable(value);
            //debugger;
            var $keyboard = $('#keyboard');
            $keyboard.html('');
            for(var prop in layoutDefault){
                for (var i = 0; i < layoutDefault[prop].length; i++) {
                    var $key = $("<li/>");
                    if (!isSpecial(layoutDefault[prop][i], $key)){
                        if (isLetter(layoutDefault[prop][i])) {
                            $key.addClass('letter');
                        }else {
                            $key.addClass('symbol');
                        }
                    }
                    $key.html(layoutDefault[prop][i]);
                    //debugger;
                    if (i === layoutDefault[prop].length - 1) {
                        console.log("lalala" + layoutDefault[prop][i])
                        $key.addClass('lastitem');
                    }
                    $keyboard.append($key);
                }
            }
            $("#keyboard li").bind("click dblclick", hotbuildsettings.viewmodel.keyboardclickhandler);
        }
    };

    ko.bindingHandlers.colorhotbuildkeys = {
        update: function (element, valueAccessor, allBindings) {
            // First get the latest data that we're bound to
            var value = valueAccessor();
            // Next, whether or not the supplied model property is observable, get its current value
            var valueUnwrapped = ko.utils.unwrapObservable(value);
            $('#keyboard li').each(function (index) {
                if ($(this).hasClass('hbk')) {
                    $(this).removeClass('hbk');
                }
            });
            for (var i = 0; i < valueUnwrapped.length; i++) {
                $("#keyboard li").each(function (index) {
                    if ($(this).text() === valueUnwrapped[i]) {
                        if (!$(this).hasClass('hbk')) {
                            $(this).toggleClass('hbk');
                        }
                    }
                });
            }
        }
    };

    ko.bindingHandlers.coloruberkeys = {
        update: function (element, valueAccessor, allBindings) {
            // First get the latest data that we're bound to
            var value = valueAccessor();
            // Next, whether or not the supplied model property is observable, get its current value
            var valueUnwrapped = ko.utils.unwrapObservable(value);
            $('#keyboard li').each(function (index) {
                if ($(this).hasClass('uber')) {
                    $(this).removeClass('uber');
                }
            });
            for (var i = 0; i < valueUnwrapped.length; i++) {
                $("#keyboard li").each(function (index) {
                    if ($(this).text() === valueUnwrapped[i]) {
                        if (!$(this).hasClass('uber')) {
                            $(this).toggleClass('uber');
                        }
                    }
                });
            }
        }
    };

    ko.bindingHandlers.colordisabledkeys = {
        update: function (element, valueAccessor, allBindings) {
            // First get the latest data that we're bound to
            var value = valueAccessor();
            // Next, whether or not the supplied model property is observable, get its current value
            var valueUnwrapped = ko.utils.unwrapObservable(value);
            $('#keyboard li').each(function (index) {
                if ($(this).hasClass('dis')) {
                    $(this).removeClass('dis');
                }
            });
            for (var i = 0; i < valueUnwrapped.length; i++) {
                $("#keyboard li").each(function (index) {
                    if ($(this).text() === valueUnwrapped[i]) {
                        if (!$(this).hasClass('dis')) {
                            $(this).toggleClass('dis');
                        }
                    }
                });
            }
        }
    };

    ko.bindingHandlers.activekey = {
        update: function (element, valueAccessor, allBindings) {
            // First get the latest data that we're bound to
            var value = valueAccessor();
            // Next, whether or not the supplied model property is observable, get its current value
            var valueUnwrapped = ko.utils.unwrapObservable(value);
            $('#keyboard li').each(function (index) {
                if ($(this).hasClass('active')) {
                    $(this).css('box-shadow', '');
                    $(this).removeClass('active');
                }
            });
            $("#keyboard li").each(function (index) {
                if ($(this).text() === valueUnwrapped) {
                    var $this = $(this);
                    if (!$this.hasClass('active')) {
                        $this.addClass('active');
                        $this.css('box-shadow', '0px 0px 2px 2px rgba(0,255,255,.7)');
                        var $selectedButton = $this.clone();
                        //$selectedButton.removeClass('active');
                        $selectedButton.attr('id', 'kbselection');
                        $selectedButton.css({ 'box-shadow': '', 'border': 'rgba(0,255,255,1) solid thin', '-webkit-border-radius': '5px', 'text-transform': 'uppercase !important' });
                        $('#kbselection').replaceWith($selectedButton);
                        $('#kbselection').click(function () {
                            $('#changeKeyDlg').dialog({
                                height: 150,
                                width: 150,
                                modal: true,
                                buttons: {
                                    "Change Key": function () { hotbuildsettings.viewmodel.swapKey(); $(this).dialog("close"); }
                                },
                                close: function () {
                                }
                            });

                        });
                        return true;
                    }
                }
            });
        }
    };

    var $gamesettings = $("#game_settings");
    $gamesettings.children(":first").append("<li class='game_settings'>" +
                                            "<a href='#tab_hotbuildprefs'>HOTBUILD</a>" +
                                            "</li>");
    $gamesettings.append('<div class="div_settings" id="tab_hotbuildprefs"></div>');
    loadHotBuildSettings($('#tab_hotbuildprefs'), '../../mods/hotbuild2/settings/hotbuild_settings.html', hotbuildsettings.viewmodel);
})();
