
var indexController = function(params) {

    var SENSORS_DELAY = 10000;

    // interval to clear blink CSS styles
    var BLINKS_DELAY = 5000;

    var modules = [];
    var fields = [];
    var sensors = [];
    var moduleSensors = [];
    var moduleWeather = [];

    var weatherValuesPanes = [];

    function requestModulesData() {
        queryHelper.requestData({
            getSensors: 1,
            getModules: 1,
            getModuleSensors: 1,
            getModuleWeather: 1,
            modulesSortBy: "ModuleName"
        }, renderModulesData);
    }

    function convertLastSeenDateTime() {
        for (var i = 0; i < modules.length; i++) {
            modules[i].LastSeenDateTime = new Date(modules[i].LastSeenDateTime);
        }
    }

    function renderModulesData(payload) {

        fields = payload.modules.fields;
        modules = payload.modules.data;
        sensors = payload.sensors.data;
        moduleSensors = payload.modules.moduleSensors;
        moduleWeather = payload.modules.moduleWeather;

        if (modules.length > 0) {
            ge("jumboMessage").style.display = "none";
        }

        convertLastSeenDateTime();

        var container = ge("pageContainer");
        var row = document.createElement("div");
        row.className = "row";
        container.appendChild(row);

        for (i = 0; i < modules.length; i++) {
            renderModule(row, fields, modules[i]);
        }

        window.setInterval(onTimer, SENSORS_DELAY);
        window.setInterval(onBlinksTimer, BLINKS_DELAY);

        console.log("Time until everything loaded: ", Date.now()-timerStart);
    }

    function getModuleStatus(module) {
        var isActive = module.IsActive !== 0;
        var lastSeenDateTime = module.LastSeenDateTime;
        var diff = Math.abs(new Date() - lastSeenDateTime);
        var delay = module.SensorDelay * 1000; //in ms
        var isOn = diff < delay * 2;
        var status = isActive ? (isOn ? "В сети" : "Не в сети") : "Выключен";
        var className = isActive ? (isOn ? "success" : "danger") : "warning";

        var headerId = "{0}_header".format(module.MAC);
        var widgetId = "{0}_widget".format(module.MAC);

        return {
            name: module.ModuleName,
            moduleId: module.ModuleID,
            description: isStringEmpty(module.Description) ? "{0} (#{1})".format(module.ModuleName, module.ModuleID) : module.Description,
            status: status,
            className: className,
            isOn: isOn,
            headerId: headerId,
            widgetId: widgetId
        };
    }

    function getModuleTitle(status) {
        return {
            header: "{0}&nbsp;&nbsp;<span class='label label-{2}'>{1}</span>".format(status.description, status.status, status.className),
            title: "{0} (#{1})".format(status.name, status.moduleId)
        };
    }

    function renderModule(row, fields, module) {

        var status = getModuleStatus(module);

        var col = document.createElement("div");
        col.id = status.widgetId;
        col.className = "col-sm-6 col-md-4 moduleWidget";
        if (!status.isOn) {
            col.classList.add("inactiveModuleWidget");
        }
        row.appendChild(col);

        var thumbnail = document.createElement("div");
        thumbnail.className = "thumbnail";
        col.appendChild(thumbnail);

        var caption = document.createElement("div");
        caption.className = "caption";
        thumbnail.appendChild(caption);

        var header = document.createElement("h3");
        header.id = status.headerId;
        var title = getModuleTitle(status);
        header.innerHTML = title.header;
        header.title = title.title;
        caption.appendChild(header);

        var hr = document.createElement("hr");
        caption.appendChild(hr);

        renderModuleWeatherFields(caption, module);
    }

    function getModuleWeatherByModuleId(moduleId) {
        for (var i = 0; i < moduleWeather.length; i++)
        {
            if (moduleWeather[i].moduleId == moduleId)
                return moduleWeather[i];
        }
        return null;
    }

    function getModuleSensorsByModuleId(moduleId) {
        for (var i = 0; i < moduleSensors.length; i++)
        {
            if (moduleSensors[i].moduleId == moduleId)
                return moduleSensors[i];
        }
        return null;
    }

    function getSensorDataBySensorId(sensorId) {
        for (var i = 0; i < sensors.length; i++)
        {
            if (sensors[i].ID == sensorId)
                return sensors[i];
        }
        return null;
    }

    function getWeatherParams(moduleId, sensorData, weather) {
        var sensorName = sensorData.SensorName;
        var measuredValue = weather[sensorName];

        if (measuredValue != null) {
            if (sensorName == "Pressure1" || sensorName == "Pressure2" || sensorName == "Pressure3" || sensorName == "Pressure4") {
                measuredValue = measuredValue * 0.750064;
                measuredValue = measuredValue.toFixed(2);
            }
        }

        return {
            paramValue: measuredValue == null ? "&ndash;" : (measuredValue + " " + sensorData.Units),
            paramId: "data_{0}_{1}".format(moduleId, sensorData.ID),
            measuredValue: measuredValue
        };
    }

    function renderModuleWeatherFields(container, module) {

        var moduleId = module.ID;

        var weatherData = getModuleWeatherByModuleId(moduleId);
        if (weatherData == null)
            return;

        var sensorsToDisplay = getModuleSensorsByModuleId(moduleId);
        if (sensorsToDisplay == null || sensorsToDisplay.sensors.length == 0)
            return;

        var fieldsContainer = document.createElement("div");
        fieldsContainer.className = "fieldsContainer";
        container.appendChild(fieldsContainer);

        for (var i = 0; i < sensorsToDisplay.sensors.length; i++)
        {
            var sensorToDisplay = sensorsToDisplay.sensors[i];
            var sensorId = sensorToDisplay.sensorId;
            var sensorData = getSensorDataBySensorId(sensorId);
            var weather = weatherData.weather;

            var params = getWeatherParams(moduleId, sensorData, weather);

            var row = document.createElement("h4");
            row.innerHTML = "{0}: <span class='label label-default floatRight' data-value='{3}' id='{2}'>{1}</span>".format(sensorData.Description, params.paramValue, params.paramId, params.measuredValue);
            fieldsContainer.appendChild(row);
        }
    }

    function onTimer() {
        queryHelper.requestData({
            getModules: 1,
            getModuleWeather: 1
        }, updateModulesData);
    }

    function cleanupBlinks() {
        for (var i = 0; i < weatherValuesPanes.length; i++)
        {
            weatherValuesPanes[i].classList.remove("blink_me_up");
            weatherValuesPanes[i].classList.remove("blink_me_down");
        }
        weatherValuesPanes = [];
    }

    function onBlinksTimer() {
        cleanupBlinks();
    }

    function updateModulesData(payload) {

        modules = payload.modules.data;
        moduleWeather = payload.modules.moduleWeather;

        convertLastSeenDateTime();

        for (i = 0; i < modules.length; i++) {
            updateModule(modules[i]);
            updateWeatherFields(modules[i]);
        }
    }

    function updateWeatherFields(module) {

        var moduleId = module.ID;

        var weatherData = getModuleWeatherByModuleId(moduleId);
        if (weatherData == null)
            return;

        var sensorsToDisplay = getModuleSensorsByModuleId(moduleId);
        if (sensorsToDisplay == null || sensorsToDisplay.sensors.length == 0)
            return;

        for (var i = 0; i < sensorsToDisplay.sensors.length; i++)
        {
            var sensorToDisplay = sensorsToDisplay.sensors[i];
            var sensorId = sensorToDisplay.sensorId;
            var sensorData = getSensorDataBySensorId(sensorId);
            var weather = weatherData.weather;

            var params = getWeatherParams(moduleId, sensorData, weather);
            var weatherDiv = ge(params.paramId);

            var previousValue = parseFloat(weatherDiv.getAttribute("data-value"));
            weatherDiv.innerHTML = params.paramValue;
            weatherDiv.setAttribute("data-value", params.measuredValue);

            var classToSet = "";
            if (previousValue > params.measuredValue)
                classToSet = "blink_me_down";
            else if (previousValue < params.measuredValue)
                classToSet = "blink_me_up";

            if (!isStringEmpty(classToSet))
                weatherDiv.classList.add(classToSet);
            weatherValuesPanes.push(weatherDiv);
        }
    }

    function updateModule(module) {

        var status = getModuleStatus(module);

        var col = ge(status.widgetId);
        if (status.isOn) {
            col.classList.remove("inactiveModuleWidget");
        } else {
            col.classList.add("inactiveModuleWidget");
        }

        var header = ge(status.headerId);
        var title = getModuleTitle(status);
        header.innerHTML = title.header;
        header.title = title.title;
    }

    function init() {
        requestModulesData();
    }

    init();
};
