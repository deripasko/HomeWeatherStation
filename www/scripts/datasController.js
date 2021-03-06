
var datasController = function() {

    var modules = [];
    var sensors = [];
    var sensorsData = [];
    var weatherData = [];
    var serverDateTime;

    var modulesByMacDictionary = [];
    var sensorsByNameDictionary = [];

    var sortBy = "ID";
    var sortAscending = false;
    var pageSize = 20;
    var pageIndex = 0;
    var queryType = "all";
    var rowsCount = 0;

    var headerMap = [
        {fieldName: "ID", columnHeader: "#", title: "", align: "", width: "70px", visibility: true, showAlways: true},
        {fieldName: "MAC", columnHeader: "", title: "", align: "", width: "", visibility: false},
        {fieldName: "ModuleID", columnHeader: "", title: "", align: "", width: "", visibility: false},
        {fieldName: "Description", columnHeader: "", title: "", align: "", width: "", visibility: false},
        {fieldName: "ModuleName", columnHeader: "Модуль", title: "", align: "", width: "150px", visibility: true, showAlways: true},
        {fieldName: "Temperature1", columnHeader: "T1, °C", title: "", align: "", width: "70px", visibility: true},
        {fieldName: "Temperature2", columnHeader: "T2, °C", title: "", align: "", width: "70px", visibility: true},
        {fieldName: "Temperature3", columnHeader: "T3, °C", title: "", align: "", width: "70px", visibility: true},
        {fieldName: "Temperature4", columnHeader: "T4, °C", title: "", align: "", width: "70px", visibility: true},
        {fieldName: "Humidity1", columnHeader: "RH 1, %", title: "Относительная влажность", align: "", width: "70px", visibility: true},
        {fieldName: "Humidity2", columnHeader: "RH 2, %", title: "Относительная влажность", align: "", width: "70px", visibility: true},
        {fieldName: "Humidity3", columnHeader: "RH 3, %", title: "Относительная влажность", align: "", width: "70px", visibility: true},
        {fieldName: "Humidity4", columnHeader: "RH 4, %", title: "Относительная влажность", align: "", width: "70px", visibility: true},
        {fieldName: "Pressure1", columnHeader: "P 1, mmHg", title: "", align: "", width: "90px", visibility: true},
        {fieldName: "Pressure2", columnHeader: "P 2, mmHg", title: "", align: "", width: "90px", visibility: true},
        {fieldName: "Pressure3", columnHeader: "P 3, mmHg", title: "", align: "", width: "90px", visibility: true},
        {fieldName: "Pressure4", columnHeader: "P 4, mmHg", title: "", align: "", width: "90px", visibility: true},
        {fieldName: "Illumination", columnHeader: "Lx", title: "Освещенность", align: "", width: "50px", visibility: true},
        {fieldName: "CO2", columnHeader: "CO&#8322;, ppm", title: "Уровень CO2", align: "", width: "90px", visibility: true},
        {fieldName: "MeasuredDateTime", columnHeader: "Измерено", title: "Дата и время измерения", align: "", width: "150px", visibility: true, showAlways: true}
    ];

///////////////////////////////////////////////////////////////////////////////////////////

    function getSensorDataBySensorId(sensorId) {
        for (var i = 0; i < sensorsData.length; i++)
        {
            if (sensorsData[i].SensorID == sensorId)
                return sensorsData[i];
        }

        return null;
    }

    function getSensorDataBySensorName(sensorName) {
        var sensor = sensorsByNameDictionary[sensorName];
        if (sensor == null) {
            return null;
        }

        return getSensorDataBySensorId(sensor.ID);
    }

///////////////////////////////////////////////////////////////////////////////////////////

    function getWeatherQueryParams() {
        return {
            getWeather: 1,
            sortBy: sortBy,
            sortAscending: sortAscending,
            pageSize: pageSize,
            pageIndex: pageIndex,
            queryType: queryType,
            fromDataPage: 1
        };
    }

    function getQueryParams() {
        return {
            getModules: 1,
            getSensors: 1,
            getSensorsData: 1,
            modulesSortBy: "ModuleName",

            getWeather: 1,
            sortBy: sortBy,
            sortAscending: sortAscending,
            pageSize: pageSize,
            pageIndex: pageIndex,
            queryType: queryType,
            fromDataPage: 1
        };
    }

    function requestData() {
        var params = getQueryParams();
        queryHelper.requestData(params, requestDataComplete);
    }

    function requestWeatherData() {
        var params = getWeatherQueryParams();
        queryHelper.requestData(params, function (payload) {
            renderWeatherTable(payload.weather, true);
        });
    }

///////////////////////////////////////////////////////////////////////////////////////////

    function renderWeatherTableHeader(head) {

        var renderedColumnsCount = 0;

        for (var i = 0; i < headerMap.length; i++) {

            var headerInfo = headerMap[i];
            var fieldName = headerInfo.fieldName;

            var sensor = getSensorDataBySensorName(fieldName);
            var showColumn = headerInfo.showAlways == true;

            if (sensor != null) {
                showColumn = sensor.TableVisibility == 1;
            }

            if (headerInfo.visibility && showColumn) {

                var th = document.createElement("th");
                th.innerHTML = (!headerInfo || isStringEmpty(headerInfo.columnHeader)) ? fieldName : headerInfo.columnHeader;
                head.appendChild(th);

                renderedColumnsCount++;

                if (headerInfo && !isStringEmpty(headerInfo.width)) {
                    th.style.minWidth = headerInfo.width;
                }

                if (headerInfo && !isStringEmpty(headerInfo.title)) {
                    th.title = headerInfo.title;
                }

                renderSorter(th, fieldName);
            }
        }

        return renderedColumnsCount;
    }

    function renderWeatherTableDataRows(gridPlaceholder) {

        for (var i = 0; i < weatherData.length; i++) {

            var weatherItem = weatherData[i];

            var tr = document.createElement("tr");
            gridPlaceholder.appendChild(tr);

            for (var j = 0; j < headerMap.length; j++) {

                var headerInfo = headerMap[j];
                var fieldName = headerInfo.fieldName;

                var sensor = getSensorDataBySensorName(fieldName);
                var showColumn = headerInfo.showAlways == true;

                if (sensor != null) {
                    showColumn = sensor.TableVisibility == 1;
                }

                // visible or not set
                if (headerInfo.visibility && showColumn) {

                    var td = document.createElement("td");
                    renderDataCell(td, fieldName, weatherItem);
                    tr.appendChild(td);

                    if (headerInfo && !isStringEmpty(headerInfo.align)) {
                        td.style.textAlign = headerInfo.align;
                    }
                }
            }
        }
    }

    function renderWeatherTableEmptyData(gridPlaceholder, renderedColumnsCount) {

        if (weatherData.length == 0) {

            var tr = document.createElement("tr");
            gridPlaceholder.appendChild(tr);

            var td = document.createElement("td");
            td.colSpan = renderedColumnsCount;
            td.className = "noData";
            tr.appendChild(td);

            td.innerHTML = "Нет данных для отображения.";
        }
    }

    function renderWeatherTable(payload, initialRequest) {

        if (initialRequest === true) {

            weatherData = payload.data;

            for (var i = 0; i < weatherData.length; i++) {
                weatherData[i].MeasuredDateTime = isIE ? Date.parse(weatherData[i].MeasuredDateTime.replace(" ", "T")) : new Date(weatherData[i].MeasuredDateTime);
            }

            pageIndex = payload.pageIndex;
            rowsCount = payload.rowsCount;
        }

        var resultsGrid = ge("results");
        resultsGrid.innerHTML = "";

        var gridPlaceholder = document.createElement('table');
        resultsGrid.appendChild(gridPlaceholder);

        var head = document.createElement('thead');
        gridPlaceholder.appendChild(head);

        var renderedColumnsCount = renderWeatherTableHeader(head);
        renderWeatherTableDataRows(gridPlaceholder);
        renderWeatherTableEmptyData(gridPlaceholder, renderedColumnsCount);

        if (initialRequest === true) {
            renderPager();
        }

        console.log("Time until everything loaded: ", Date.now()-timerStart);
    }

    function getModuleTitle(module) {
        return "{0} (#{1})".format(module.IsAqara ? "Aqara" : module.ModuleName, module.ModuleID);
    }

    function getModuleStatus(module) {

        var isActive = module.IsActive !== 0;
        var lastSeenDateTime = module.LastSeenDateTime;
        var diff = Math.abs(serverDateTime - lastSeenDateTime);
        var delay = module.SensorDelay * 1000; //in ms
        var isOn = diff < delay * 2;
        var status = isActive ? (isOn ? "В сети" : "Не в сети") : "Выключен";
        var className = isActive ? (isOn ? "module-online" : "module-offline") : "module-inactive";

        return {
            status: status,
            className: className,
            isOn: isOn
        };
    }

    function renderDataCell(td, fieldName, data) {

        var text = data[fieldName];

        if (fieldName == "ModuleName") {

            var module = modulesByMacDictionary[data.ModuleMAC];
            var description = "";

            if (module) {

                var title = getModuleTitle(module);
                td.title = title;

                var status = getModuleStatus(module);
                description = module.Description;

                td.className = status.className;
                td.title += " - " + status.status;

                td.innerHTML = isStringEmpty(description) ? title : decodeURIComponent(description);

            } else {
                td.innerHTML = "";
            }

            return;
        }

        if (fieldName == "MeasuredDateTime") {
            td.innerHTML = DateFormat.format.date(text, "HH:mm:ss dd/MM/yyyy");
            return;
        }

        if (fieldName == "Pressure1" || fieldName == "Pressure2" || fieldName == "Pressure3" || fieldName == "Pressure4") {
            if (!isStringEmpty(text)) {
                var pressureInMmHg = text * 0.750064;
                td.innerHTML = pressureInMmHg.toFixed(1);
                return;
            }
        }

        if (fieldName == "ID") {
            td.innerHTML = text;
            return;
        }

        td.innerHTML = isStringEmpty(text) ? "" : parseFloat(text).toFixed(1);
    }

    function renderSorter(th, fieldName) {
        if (sortBy == fieldName) {
            th.innerHTML += sortAscending ? "&#8595;" : "&#8593;";
            th.className = "sortedColumn";
        }

        th.setAttribute("sortBy", fieldName);
        th.onclick = function() {
            var sortByToDisplay = this.getAttribute("sortBy");
            if (sortBy == sortByToDisplay) { //change sort order
                sortAscending = !sortAscending;
            } else { //apply new sort column
                sortBy = sortByToDisplay;
                sortAscending = true;
                pageIndex = 0;
            }
            requestWeatherData();
        };
    }

    function isPageDivVisible(pagesCount, pageIndexToRender) {
        if (pageIndexToRender == 0 || pageIndexToRender == pagesCount - 1) { //first and last
            return true;
        }
        return Math.abs(pageIndexToRender - pageIndex) < 3;
    }

    function renderPagerDescription(pagerContainer, pagesCount) {
        var pagerDescription = document.createElement("div");
        pagerDescription.className = "pagerDescription";
        pagerDescription.innerHTML = "Страница {0} из {1}".format(pageIndex + 1, pagesCount);
        pagerContainer.appendChild(pagerDescription);
    }

    function renderGaps(pagerContainer, renderedPages) {
        var previousPage = 0;
        for (var i = 0; i < renderedPages.length; i++) {
            var index = parseInt(renderedPages[i].getAttribute("pageIndex"));
            if (index - previousPage > 1) {
                var pagerGap = document.createElement("div");
                pagerGap.className = "pagerDescription";
                pagerGap.innerHTML = "&ndash;";
                pagerContainer.insertBefore(pagerGap, renderedPages[i]);
            }
            previousPage = index;
        }
    }

    function renderPageSizeChooser(pagerContainer) {
        var pagerGap = document.createElement("div");
        pagerGap.className = "pagerDescription";
        pagerContainer.appendChild(pagerGap);

        var pagerSpan = document.createElement("span");
        pagerGap.appendChild(pagerSpan);

        pagerSpan.className = "example";
        pagerSpan.innerHTML = "Записей на странице: {0}".format(pageSize);
        pagerSpan.setAttribute("data-jq-dropdown", "#jq-dropdown-1");

        var pageSizeAnchors = $(".pageSizeItem");
        pageSizeAnchors.bind("click", function() {
            var pageSizeToSet = parseInt(this.innerHTML);
            if (pageSizeToSet != pageSize) {
                pageSize = pageSizeToSet;
                Cookies.set("tablePageSize", pageSize);
                requestWeatherData();
            }
        });
    }

    function renderPager() {

        var pagesCount = Math.ceil(rowsCount / pageSize);
        var pagerContainer = ge("pager");
        pagerContainer.innerHTML = "";
        var renderedPages = [];

        renderPagerDescription(pagerContainer, pagesCount);

        for (var i = 0; i < pagesCount; i++) {
            if (isPageDivVisible(pagesCount, i)) {
                var pageDiv = document.createElement("div");
                pageDiv.className = "pager";
                if (i == pageIndex) {
                    pageDiv.className += " selectedPage";
                }
                pageDiv.innerHTML = (i + 1).toString();
                pageDiv.setAttribute("pageIndex", i);
                pageDiv.onclick = function () {
                    pageIndex = parseInt(this.getAttribute("pageIndex"));
                    requestWeatherData();
                };
                pagerContainer.appendChild(pageDiv);

                renderedPages.push(pageDiv);
            }
        }

        renderGaps(pagerContainer, renderedPages);
        renderPageSizeChooser(pagerContainer);
    }

    function createEmptyDataPara(parent, text) {
        var emptyPara = document.createElement("p");
        emptyPara.className = "orange";
        emptyPara.innerHTML = text;
        parent.appendChild(emptyPara);
    }

    function renderSensorsData() {
        var sensorsList = ge("sensorsList");
        sensorsList.innerHTML = "";

        for (var i = 0; i < sensors.length; i++) {
            // render dropdown item
            renderSensor(sensorsList, sensors[i]);
        }

        if (sensors.length == 0) {
            createEmptyDataPara(sensorsList, "Нет сенсоров для отображения.");
        }
    }

    function renderSensor(sensorsList, sensor) {

        var cbParent = document.createElement("div");
        cbParent.className = "checkbox checkbox-warning";
        sensorsList.appendChild(cbParent);

        var sensorData = getSensorDataBySensorId(sensor.ID);
        var tableVisibility = sensorData != null ? sensorData.TableVisibility == 1 : false;

        var cb = document.createElement("input");
        cb.type = "checkbox";
        cb.className = "styled";
        cb.checked = tableVisibility;
        cb.setAttribute("sensorid", sensor.ID);
        cb.id = "cb_{0}".format(sensor.ID);
        cb.onclick = function() {
            var sensorId = parseInt(this.getAttribute("sensorid"));
            queryHelper.updateSensorData({
                sensorId: sensorId,
                tableVisibility: this.checked ? 1 : 0
            }, sensorDataUpdated);
        };
        cbParent.appendChild(cb);

        var label = document.createElement("label");
        label.innerHTML = sensor.Description;
        label.htmlFor = cb.id;
        cbParent.appendChild(label);
    }

    function sensorDataUpdated(payload) {
        sensorsData = payload.sensorsData.data;
        // payload = null, initialRequest = false
        renderWeatherTable(null, false);
    }

    function fillSensorsByNameDictionary() {

        sensorsByNameDictionary = [];

        for (var i = 0; i < sensors.length; i++) {
            var sensor = sensors[i];
            sensorsByNameDictionary[sensor.SensorName] = sensor;
        }
    }

    function fillModulesByMacDictionary() {

        modulesByMacDictionary = [];

        for (var i = 0; i < modules.length; i++) {
            var module = modules[i];
            modulesByMacDictionary[module.MAC] = module;
        }
    }

    function requestDataComplete(payload) {

        modules = payload.modules.data;
        sensorsData = payload.sensorsData.data;
        sensors = payload.sensors.data;
        serverDateTime = new Date(payload.modules.ServerDateTime);

        fillSensorsByNameDictionary();
        fillModulesByMacDictionary();

        renderModulesData();
        renderSensorsData();
        renderWeatherTable(payload.weather, true);
    }

    function renderModulesData() {

        for (var i = 0; i < modules.length; i++) {
            modules[i].LastSeenDateTime = new Date(modules[i].LastSeenDateTime);
        }

        renderModules();
    }

    function renderModules() {

        var modulesList = ge("modulesList");
        modulesList.innerHTML = "";

        var visibleCount = 0;
        for (var i = 0; i < modules.length; i++) {
            // render dropdown item
            var module = modules[i];
            if (module.IsActive == 1) {
                visibleCount++;
                renderModule(modulesList, module);
            }
        }

        if (visibleCount == 0) {
            createEmptyDataPara(modulesList, "Нет модулей для отображения.");
        }
    }

    function renderModule(modulesList, module) {

        var cbParent = document.createElement("div");
        cbParent.className = "checkbox checkbox-warning";
        modulesList.appendChild(cbParent);

        var cb = document.createElement("input");
        cb.type = "checkbox";
        cb.className = "styled";
        cb.checked = module.TableVisibility == 1;
        cb.setAttribute("data-mac", module.MAC);
        cb.id = "cb_{0}".format(module.MAC);
        cb.onclick = function() {
            var mac = this.getAttribute("data-mac");
            queryHelper.updateModuleData({
                mac: mac,
                tableVisibility: this.checked ? 1 : 0
            }, moduleDataUpdated);
        };
        cbParent.appendChild(cb);

        var label = document.createElement("label");
        var title = getModuleTitle(module);
        label.innerHTML = isStringEmpty(module.Description) ? title : (decodeURIComponent(module.Description) + " &ndash; " + title);
        label.htmlFor = cb.id;
        label.title = module.MAC;
        cbParent.appendChild(label);
    }

    function moduleDataUpdated(payload) {

        modules = payload.modules.data;
        serverDateTime = new Date(payload.modules.ServerDateTime);

        fillModulesByMacDictionary();

        for (var i = 0; i < modules.length; i++) {
            modules[i].LastSeenDateTime = new Date(modules[i].LastSeenDateTime);
        }

        requestWeatherData();
    }

    function setupSettings() {
        var tablePageSize = Cookies.get("tablePageSize");
        if (tablePageSize != null) {
            pageSize = parseInt(tablePageSize, 10);
        }
    }

    function init() {
        setupSettings();
        requestData();
    }

    init();
};
