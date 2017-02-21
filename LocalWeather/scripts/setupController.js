
var setupController = function() {

    var SENSORS_DELAY = 10000;

    var modules = [];
    var moduleSensors = [];
    var sensors = [];
    var fields = [];
    var serverDateTime;

    var headerMap = [];
    headerMap['ID'] = {name: "", title: "", align: "", width: "", visibility: false};
    headerMap['ModuleID'] = {name: "", title: "", align: "", width: "", visibility: false};
    headerMap['ModuleName'] = {name: "Модуль", title: "", align: "", width: "", visibility: false};
    headerMap['MAC'] = {name: "", title: "", align: "", width: "", visibility: true};
    headerMap['IP'] = {name: "", title: "", align: "", width: "", visibility: true};
    headerMap['Description'] = {name: "Описание", title: "Нажмите для правки", align: "", width: "", visibility: true};
    headerMap['SensorDelay'] = {name: "Период опроса, сек", title: "", align: "", width: "", visibility: true};
    headerMap['LastSeenDateTime'] = {name: "Обновлено", title: "", align: "", width: "", visibility: true};
    headerMap['IsActive'] = {name: "", title: "", align: "", width: "", visibility: false};
    headerMap['ChartVisibility'] = {name: "", title: "", align: "", width: "", visibility: false};
    headerMap['TableVisibility'] = {name: "", title: "", align: "", width: "", visibility: false};
    headerMap['ValidationCode'] = {name: "", title: "", align: "", width: "", visibility: false};

///////////////////////////////////////////////////////////////////////////////////////////

    function requestModulesData() {
        queryHelper.requestData({
            getSensors: 1,
            getModules: 1,
            modulesSortBy: "ModuleName"
        }, renderModulesData);
    }

    function onTimer() {
        queryHelper.requestData({
            getModules: 1,
            getModuleSensors: 1
        }, updateModulesData);
    }

    function requestModuleSensorsData(moduleId) {
        queryHelper.requestData({
            getModules: 1,
            getModuleSensors: 1
        }, function(payload) { moduleSensorsDataReceived(payload, moduleId); });
    }

///////////////////////////////////////////////////////////////////////////////////////////

    function getModuleByMAC(mac) {
        for (var i = 0; i < modules.length; i++) {
            if (modules[i].MAC == mac)
                return modules[i];
        }

        return null;
    }

///////////////////////////////////////////////////////////////////////////////////////////

    function renderModulesData(payload) {

        fields = payload.modules.fields;
        modules = payload.modules.data;
        sensors = payload.sensors.data;
        serverDateTime = new Date(payload.modules.ServerDateTime);

        if (modules.length > 0) {
            ge("jumboMessage").style.display = "none";
        }

        for (var i = 0; i < modules.length; i++) {
            modules[i].LastSeenDateTime = new Date(modules[i].LastSeenDateTime);
        }

        var container = ge("pageContainer");
        var row = document.createElement("div");
        row.className = "row";
        container.appendChild(row);

        for (i = 0; i < modules.length; i++) {
            renderModule(row, modules[i]);
        }

        console.log("Time until everything loaded: ", Date.now()-timerStart);

        renderSensorsData();

        window.setInterval(onTimer, SENSORS_DELAY);
    }

    function getModuleStatus(module) {

        var isActive = module.IsActive !== 0;
        var lastSeenDateTime = module.LastSeenDateTime;
        var diff = Math.abs(serverDateTime - lastSeenDateTime);
        var delay = module.SensorDelay * 1000; //in ms
        var isOn = diff < delay * 2;
        var status = isActive ? (isOn ? "В сети" : "Не в сети") : "Выключен";
        var className = isActive ? (isOn ? "success" : "danger") : "warning";
        var buttonClass = isOn ? "btn" : "btn disabled";

        var headerId = "{0}_header".format(module.MAC);
        var widgetId = "{0}_widget".format(module.MAC);
        var btnStatusId = "{0}_btnStatus".format(module.MAC);
        var btnSetupId = "{0}_btnSetup".format(module.MAC);
        var btnEditId = "{0}_btnEdit".format(module.MAC);

        return {
            name: module.ModuleName,
            moduleId: module.ModuleID,
            status: status,
            className: className,
            isOn: isOn,
            headerId: headerId,
            buttonClass: buttonClass,
            btnStatusId: btnStatusId,
            btnSetupId: btnSetupId,
            btnEditId: btnEditId,
            widgetId: widgetId
        };
    }

    function getModuleTitle(status) {
        return "{0} (#{1})&nbsp;&nbsp;<span class='label label-{3}'>{2}</span>".format(status.name, status.moduleId, status.status, status.className);
    }

    function getModuleLink(module) {
        return "http://{0}".format(module.IP);
    }

    function renderModule(row, module) {

        var status = getModuleStatus(module);

        var col = document.createElement("div");
        col.id = status.widgetId;
        col.className = "col-sm-6 col-md-4 moduleWidget";
        row.appendChild(col);

        var thumbnail = document.createElement("div");
        thumbnail.className = "thumbnail";
        col.appendChild(thumbnail);

        var caption = document.createElement("div");
        caption.className = "caption";
        thumbnail.appendChild(caption);

        var header = document.createElement("h3");
        header.id = status.headerId;
        header.innerHTML = getModuleTitle(status);
        caption.appendChild(header);

        var hr = document.createElement("hr");
        caption.appendChild(hr);

        renderModuleFields(caption, module);

        hr = document.createElement("hr");
        caption.appendChild(hr);

        var p = document.createElement("p");
        p.innerHTML = "<a title='Правка параметров отображения модуля' data-mac='" + module.MAC + "' data-toggle='modal' data-target='#editModuleModal' id='" + status.btnEditId + "' class='btn btn-info' role='button'>Параметры модуля</a>";
        caption.appendChild(p);

        hr = document.createElement("hr");
        caption.appendChild(hr);

        p = document.createElement("p");
        var href = getModuleLink(module);

        p.innerHTML = "<a title='Состояние устройства' href='" + href + "' target='_blank' id='" + status.btnStatusId + "' class='" + status.buttonClass + " btn-default' role='button'>Состояние</a> " +
                      "<a title='Настройка устройства' href='" + href + "/setup' target='_blank' id='" + status.btnSetupId + "' class='" + status.buttonClass + " btn-primary' role='button'>Настройка</a>";
        caption.appendChild(p);

        var btnEditId = ge(status.btnEditId);
        btnEditId.onclick = function() {
            var title = ge("moduleModalTitle");
            title.innerHTML = "Параметры {0} (#{1})".format(status.name, status.moduleId);

            var mac = this.getAttribute("data-mac");
            var m = getModuleByMAC(mac);
            if (m) {
                ge("inputDescription").value = m.Description;
                ge("inputActive").checked = m.IsActive != 0;
                ge("inputMAC").value = mac;
                requestModuleSensorsData(m.ModuleID);
            }
        };
    }

    function updateInitialInputAllState() {

        var enabledCnt = 0;
        var disabledCnt = 0;

        for (var i = 0; i < sensors.length; i++) {
            var sensor = sensors[i];
            var sensorId = sensor.ID;
            var cb = ge("cb_{0}".format(sensorId));
            if (cb) {
                if (cb.checked)
                    enabledCnt++;
                else
                    disabledCnt++;
            }
        }

        if (enabledCnt == sensors.length) {
            ge("inputAll").indeterminate = false;
            ge("inputAll").checked = true;
            return;
        }
        if (disabledCnt == sensors.length) {
            ge("inputAll").indeterminate = false;
            ge("inputAll").checked = false;
            return;
        }

        ge("inputAll").indeterminate = true;
        ge("inputAll").checked = false;
    }

    function getHeaderByName(name) {
        return headerMap[name];
    }

    function getModuleParam(module, param) {
        var text = module[param];
        if (isStringEmpty(text))
            return "&ndash;";
        return text;
    }

    function getParamValue(fieldName, value) {
        if (fieldName == "LastSeenDateTime")
            return DateFormat.format.date(value, "HH:mm:ss dd/MM/yyyy");

        return value;
    }

    function getModuleParamMap(header, field, module) {
        var paramName = (!header || isStringEmpty(header.name)) ? field.name : header.name;
        var paramValue = getParamValue(field.name, getModuleParam(module, field.name));
        var paramId = "{0}_{1}".format(module.MAC, field.name);

        return {name: paramName, value: paramValue, id: paramId};
    }

    function formatPrettyDate(module) {
        var lastSeenDateTime = module.LastSeenDateTime;
        return DateFormat.format.prettyDate(lastSeenDateTime);
    }

    function renderModuleFields(container, module) {

        var fieldsContainer = document.createElement("div");
        fieldsContainer.className = "fieldsContainer";
        container.appendChild(fieldsContainer);

        for (var i = 0; i < fields.length; i++) {
            var field = fields[i];

            var header = getHeaderByName(field.name);
            if (header && !header.visibility)
                continue;

            var row = document.createElement("h4");
            var paramMap = getModuleParamMap(header, field, module);

            var paramName = paramMap.name;
            var paramValue = paramMap.value;
            var paramId = paramMap.id;
            var paramTitle = header.title;

            if (field.name == "LastSeenDateTime") {
                paramTitle = paramValue;
                paramValue = formatPrettyDate(module);
            }

            row.innerHTML = "{0}: <span class='label label-default floatRight' id='{2}' title='{3}'>{1}</span>".format(paramName, paramValue, paramId, paramTitle);
            fieldsContainer.appendChild(row);
        }
    }

    function updateModulesData(payload) {

        fields = payload.modules.fields;
        modules = payload.modules.data;
        moduleSensors = payload.modules.moduleSensors;
        serverDateTime = new Date(payload.modules.ServerDateTime);

        for (var i = 0; i < modules.length; i++) {
            modules[i].LastSeenDateTime = new Date(modules[i].LastSeenDateTime);
        }

        for (i = 0; i < modules.length; i++) {
            updateModule(modules[i]);
        }
    }

    function updateModule(module) {

        var status = getModuleStatus(module);
        var btnStatus = ge(status.btnStatusId);
        var btnSetup = ge(status.btnSetupId);
        var col = ge(status.widgetId);

        if (status.isOn) {
            var href = getModuleLink(module);
            btnStatus.href = href;
            btnSetup.href = href + "/setup";
        }

        var header = ge(status.headerId);
        header.innerHTML = getModuleTitle(status);

        btnStatus.className = status.buttonClass + " btn-default";
        btnSetup.className = status.buttonClass + " btn-primary";

        updateModuleFields(module);
    }

    function updateModuleFields(module) {

        for (var i = 0; i < fields.length; i++) {
            var field = fields[i];

            var header = getHeaderByName(field.name);
            if (header && !header.visibility)
                continue;

            var paramMap = getModuleParamMap(header, field, module);
            var label = ge(paramMap.id);

            var paramValue = paramMap.value;
            var paramTitle = header.title;

            if (field.name == "LastSeenDateTime") {
                paramTitle = paramValue;
                paramValue = formatPrettyDate(module);
            }

            label.innerHTML = paramValue;
            label.title = paramTitle;
        }
    }

    function getActiveModuleSensors(queryParams) {

        var statuses = [];
        for (var i = 0; i < sensors.length; i++) {
            var sensorId = sensors[i].ID;
            var sensorName = sensors[i].SensorName;
            var cb = ge("cb_{0}".format(sensorId));
            if (cb) {
                queryParams[sensorName] = cb.checked ? 1 : 0;
            }
        }
        return statuses;
    }

    function getSensorIsActive(moduleId, sensorId) {

        for (var i = 0; i < moduleSensors.length; i++)
        {
            var data = moduleSensors[i];
            if (data.moduleId == moduleId) {

                for (var j = 0; j < data.sensors.length; j++)
                {
                    var sensor = data.sensors[j];
                    if (sensor.sensorId == sensorId)
                        return sensor.isActive == 1;
                }

            }
        }

        return false;
    }

    function toggleActiveModuleSensors(moduleId) {

        var enabledCnt = 0;
        var disabledCnt = 0;

        for (var i = 0; i < sensors.length; i++) {
            var sensor = sensors[i];
            var sensorId = sensor.ID;
            var cb = ge("cb_{0}".format(sensorId));
            if (cb) {
                var isActive = getSensorIsActive(moduleId, sensorId);
                cb.checked = isActive;

                if (isActive)
                    enabledCnt++;
                else
                    disabledCnt++;
            }
        }
    }

    function setupEventHandlers() {

        var btnSaveModule = ge("btnSaveModule");
        btnSaveModule.onclick = function() {

            var description = ge("inputDescription").value;
            var mac = ge("inputMAC").value;
            var isActive = ge("inputActive").checked;

            var queryParams = {
                mac: mac,
                description: description,
                isActive: isActive,
                getModuleSensors: 1,
                updateSensors: 1
            };
            getActiveModuleSensors(queryParams);

            queryHelper.updateModuleData(queryParams, moduleDataUpdated);
        };
    }

    function moduleDataUpdated(moduleData) {
        updateModulesData(moduleData);
    }

    function moduleSensorsDataReceived(payload, moduleId) {
        moduleSensors = payload.modules.moduleSensors;
        toggleActiveModuleSensors(moduleId);
        updateInitialInputAllState();
    }

    function renderSensorsData() {

        // render checkboxes with sensors' data once, then only update labels
        var sensorsList = ge("sensorsList");
        for (var i = 0; i < sensors.length; i++) {
            renderSensor(sensorsList, sensors[i]);
        }
        ge("inputAll").onclick = selectAllSensors;
    }

    function selectAllSensors() {
        var stateToSet = ge("inputAll").checked;
        for (var i = 0; i < sensors.length; i++) {
            var sensor = sensors[i];
            var cb = ge("cb_{0}".format(sensor.ID));
            cb.checked = stateToSet;
        }
    }

    function renderSensor(sensorsList, sensor) {

        var row = document.createElement("div");
        row.className = "row";
        sensorsList.appendChild(row);

        var label = document.createElement("label");
        label.className = "col-sm-2";
        label.innerHTML = "&nbsp;";
        row.appendChild(label);

        var container = document.createElement("div");
        container.className = "col-sm-10";
        row.appendChild(container);

        var cbContainer = document.createElement("div");
        cbContainer.className = "checkbox checkbox-warning no-top-bottom-margin";
        container.appendChild(cbContainer);

        var cb = document.createElement("input");
        cb.type = "checkbox";
        cb.id = "cb_{0}".format(sensor.ID);
        cb.onclick = function() {
            updateInitialInputAllState();
        };
        cbContainer.appendChild(cb);

        var lbl = document.createElement("label");
        lbl.htmlFor = cb.id;
        lbl.innerHTML = sensor.Description;
        lbl.id = "label_{0}".format(sensor.ID);
        cbContainer.appendChild(lbl);

        var editButton = document.createElement("span");
        editButton.id = "edit_{0}".format(sensor.ID);
        editButton.className = "glyphicon glyphicon-pencil editSensorDescriptionIcon";
        editButton.title = "Переименовать";
        editButton.setAttribute("data-sensor-id", sensor.ID);
        editButton.onclick = function() {
            var sensorIdToEdit = this.getAttribute("data-sensor-id");

            var nameInput = ge("name_{0}".format(sensorIdToEdit));
            var saveInput = ge("save_{0}".format(sensorIdToEdit));
            var label = ge("label_{0}".format(sensorIdToEdit));

            nameInput.style.display = saveInput.style.display = "";
            this.style.display = "none";

            nameInput.value = label.innerHTML;
            nameInput.focus();
        };
        cbContainer.appendChild(editButton);

        var descriptionInput = document.createElement("input");
        descriptionInput.id = "name_{0}".format(sensor.ID);
        descriptionInput.type = "text";
        descriptionInput.style.display = "none";
        descriptionInput.className = "editSensorDescriptionInput";
        cbContainer.appendChild(descriptionInput);

        var saveButton = document.createElement("span");
        saveButton.id = "save_{0}".format(sensor.ID);
        saveButton.className = "glyphicon glyphicon-ok editSensorDescriptionIcon";
        saveButton.style.display = "none";
        saveButton.title = "Сохранить";
        saveButton.setAttribute("data-sensor-id", sensor.ID);
        saveButton.onclick = function() {
            var sensorIdToEdit = this.getAttribute("data-sensor-id");

            var nameInput = ge("name_{0}".format(sensorIdToEdit));
            var editInput = ge("edit_{0}".format(sensorIdToEdit));
            var label = ge("label_{0}".format(sensorIdToEdit));

            nameInput.style.display = this.style.display = "none";
            editInput.style.display = "";

            var mac = ge("inputMAC").value;
            var newDescription = nameInput.value;

            if (!isStringEmpty(newDescription)) {
                label.innerHTML = newDescription;

                queryHelper.updateSensorData({
                    description: newDescription,
                    mac: mac,
                    sensorId: sensorIdToEdit
                }, sensorDescriptionUpdated);
            }
        };
        cbContainer.appendChild(saveButton);
    }

    function sensorDescriptionUpdated(payload) {

        var sensorsData = payload.moduleSensors.data;
        for (var i = 0; i < sensorsData.length; i++) {
            var sensor = sensorsData[i];
            var sensorId = sensor.SensorID;
            var label = ge("label_{0}".format(sensorId));
            if (label) {
                label.innerHTML = sensor.Description;
            }
        }
    }

    function init() {
        requestModulesData();
        setupEventHandlers();
    }

    init();
};
