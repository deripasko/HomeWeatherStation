
var indexController = function(params) {

    var headerMap = [];
    headerMap['ID'] = {name: "", title: "", align: "", width: "", visibility: false};
    headerMap['ModuleID'] = {name: "", title: "", align: "", width: "", visibility: false};
    headerMap['ModuleName'] = {name: "Модуль", title: "", align: "", width: "", visibility: false};
    headerMap['MAC'] = {name: "", title: "", align: "", width: "", visibility: true};
    headerMap['IP'] = {name: "", title: "", align: "", width: "", visibility: true};
    headerMap['Description'] = {name: "Описание", title: "", align: "", width: "", visibility: true};
    headerMap['LastSeenDateTime'] = {name: "Был в сети", title: "", align: "", width: "", visibility: true};

    function requestModulesData() {
        queryHelper.requestModuleData({}, renderModulesData);
    }

    function renderModulesData(moduleData) {

        var modules = moduleData.data;
        var fields = moduleData.fields;

        var container = ge("pageContainer");
        var row = document.createElement("div");
        row.className = "row";
        container.appendChild(row);

        for (var i = 0; i < modules.length; i++) {
            renderModule(row, fields, modules[i]);
        }
    }

    function renderModule(row, fields, module) {
        var col = document.createElement("div");
        col.className = "col-sm-6 col-md-4 moduleWidget";
        row.appendChild(col);
        var thumbnail = document.createElement("div");
        thumbnail.className = "thumbnail";
        col.appendChild(thumbnail);
        var caption = document.createElement("div");
        caption.className = "caption";
        thumbnail.appendChild(caption);

        var header = document.createElement("h3");
        header.innerHTML = "{0} (#{1})".format(module.ModuleName, module.ModuleID);
        caption.appendChild(header);

        var hr = document.createElement("hr");
        caption.appendChild(hr);

        renderModuleFields(caption, fields, module);

        hr = document.createElement("hr");
        caption.appendChild(hr);

        var p = document.createElement("p");
        var href = "http://{0}".format(module.IP);
        p.innerHTML = "<a href='" + href + "' target='_blank' class='btn btn-default' role='button'>Состояние</a> <a href='" + href + "/setup' target='_blank' class='btn btn-primary' role='button'>Настройка</a>".format(module.IP);
        caption.appendChild(p);
    }

    function getHeaderByName(name) {
        return headerMap[name];
    }

    function getModuleParam(module, param) {
        var param = module[param];
        if (isStringEmpty(param))
            return "&ndash;";
        return param;
    }

    function renderModuleFields(container, fields, module) {

        var fieldsContainer = document.createElement("div");
        fieldsContainer.className = "fieldsContainer";
        container.appendChild(fieldsContainer);

        for (var i = 0; i < fields.length; i++) {
            var field = fields[i];

            var header = getHeaderByName(field.name);
            if (header && !header.visibility)
                continue;

            var row = document.createElement("h4");
            var paramName = (!header || isStringEmpty(header.name)) ? field.name : header.name;
            row.innerHTML = "{0}: <span class='label label-success floatRight'>{1}</span>".format(paramName, getModuleParam(module, field.name));
            fieldsContainer.appendChild(row);
        }
    }

    function init() {
        requestModulesData();
    }

    init();
};
