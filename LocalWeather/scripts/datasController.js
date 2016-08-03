
var datasController = function(params) {

    var modules = [];
    var sensors = [];
    var weatherData = [];
    var fields = [];
    var serverDateTime;

    var sortBy = "ID";
    var sortAscending = false;
    var pageSize = 20;
    var pageIndex = 0;
    var queryType = "all";
    var filteredMacs = "";
    var rowsCount = 0;

    var headerMap = [];
    headerMap['ID'] = {name: "#", title: "", align: "", width: "50px", visibility: true};
    headerMap['MAC'] = {name: "", title: "", align: "", width: "", visibility: false};
    headerMap['ModuleID'] = {name: "", title: "", align: "", width: "", visibility: false};
    headerMap['Description'] = {name: "", title: "", align: "", width: "", visibility: false};
    headerMap['ModuleName'] = {name: "Модуль", title: "", align: "", width: "150px", visibility: true};
    headerMap['Temperature1'] = {name: "T1, °C", title: "", align: "", width: "70px", visibility: true};
    headerMap['Temperature2'] = {name: "T2, °C", title: "", align: "", width: "70px", visibility: true};
    headerMap['Temperature3'] = {name: "T3, °C", title: "", align: "", width: "70px", visibility: true};
    headerMap['Temperature4'] = {name: "T4, °C", title: "", align: "", width: "70px", visibility: true};
    headerMap['Humidity1'] = {name: "RH 1, %", title: "Относительная влажность", align: "", width: "70px", visibility: true};
    headerMap['Humidity2'] = {name: "RH 2, %", title: "Относительная влажность", align: "", width: "70px", visibility: true};
    headerMap['Humidity3'] = {name: "RH 3, %", title: "Относительная влажность", align: "", width: "70px", visibility: true};
    headerMap['Humidity4'] = {name: "RH 4, %", title: "Относительная влажность", align: "", width: "70px", visibility: true};
    headerMap['Pressure1'] = {name: "P 1, mmHg", title: "", align: "", width: "90px", visibility: true};
    headerMap['Pressure2'] = {name: "P 2, mmHg", title: "", align: "", width: "90px", visibility: true};
    headerMap['Pressure3'] = {name: "P 3, mmHg", title: "", align: "", width: "90px", visibility: true};
    headerMap['Pressure4'] = {name: "P 4, mmHg", title: "", align: "", width: "90px", visibility: true};
    headerMap['Illumination'] = {name: "Lx", title: "Освещенность", align: "", width: "50px", visibility: true};
    headerMap['CO2'] = {name: "CO&#8322;, ppm", title: "Уровень CO2", align: "", width: "90px", visibility: true};
    headerMap['MeasuredDateTime'] = {name: "Измерено", title: "Дата и время измерения", align: "", width: "150px", visibility: true};

    function getModuleByMAC(mac) {
        for (var i = 0; i < modules.length; i++) {
            if (modules[i].MAC == mac)
                return modules[i];
        }

        return null;
    }

    function getWeatherQueryParams() {
        return {
            getWeather: 1,
            sortBy: sortBy,
            sortAscending: sortAscending,
            pageSize: pageSize,
            pageIndex: pageIndex,
            queryType: queryType,
            filteredMacs: filteredMacs
        };
    }

    function getQueryParams() {
        return {
            getModules: 1,
            getSensors: 1,
            modulesSortBy: "ModuleName"
        };
    }

    function getSensorDataByName(sensorName) {
        for (var i = 0; i < sensors.length; i++) {
            if (sensors[i].SensorName == sensorName)
                return sensors[i];
        }
        return null;
    }

    function renderWeatherTable(payload, initialRequest) {

        if (initialRequest === true) {
            fields = payload.fields;
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

        var fieldName;
        var headerInfo;
        var sensor;
        var showColumn;

        var renderedColumnsCount = 0;

        for (i = 0; i < fields.length; i++) {
            fieldName = fields[i].name;
            headerInfo = headerMap[fieldName];

            sensor = getSensorDataByName(fieldName);
            showColumn = true;
            if (sensor != null) {
                showColumn = sensor.TableVisibility == 1;
            }

            // visible or not set
            if ((!headerInfo || headerInfo.visibility) && showColumn) {
                var th = document.createElement("th");
                th.innerHTML = (!headerInfo || isStringEmpty(headerInfo.name)) ? fieldName : headerInfo.name;
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

        for (i = 0; i < weatherData.length; i++) {
            var weatherItem = weatherData[i];

            var tr = document.createElement("tr");
            gridPlaceholder.appendChild(tr);

            for (var j = 0; j < fields.length; j++) {
                fieldName = fields[j].name;
                headerInfo = headerMap[fieldName];

                sensor = getSensorDataByName(fieldName);
                showColumn = true;
                if (sensor != null) {
                    showColumn = sensor.TableVisibility == 1;
                }

                // visible or not set
                if ((!headerInfo || headerInfo.visibility) && showColumn) {
                    var td = document.createElement("td");
                    renderDataCell(td, fieldName, weatherItem);
                    tr.appendChild(td);

                    if (headerInfo && !isStringEmpty(headerInfo.align)) {
                        td.style.textAlign = headerInfo.align;
                    }
                }
            }
        }

        if (weatherData.length == 0) {
            var tr = document.createElement("tr");
            gridPlaceholder.appendChild(tr);

            var td = document.createElement("td");
            td.colSpan = renderedColumnsCount;
            td.className = "noData";
            tr.appendChild(td);

            td.innerHTML = "Нет данных для отображения.";
        }

        if (initialRequest === true) {
            renderPager();
        }

        console.log("Time until everything loaded: ", Date.now()-timerStart);
    }

    function getModuleTitle(module) {
        return "{0} (#{1})".format(module.ModuleName, module.ModuleID);
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

            var description = "";
            var title = getModuleTitle(data);
            td.title = title;

            var module = getModuleByMAC(data.MAC);
            if (module) {
                var status = getModuleStatus(module);
                description = module.Description;
                td.className = status.className;
                td.title += " - " + status.status;
            } else {
                description = data.Description;
            }

            td.innerHTML = isStringEmpty(description) ? title : description;

            return;
        }
        if (fieldName == "MeasuredDateTime") {
            td.innerHTML = DateFormat.format.date(data[fieldName], "HH:mm:ss dd/MM/yyyy");
            return;
        }
        if (fieldName == "Pressure1" || fieldName == "Pressure2" || fieldName == "Pressure3" || fieldName == "Pressure4") {
            if (data[fieldName]) {
                var pressureInMmHg = data[fieldName] * 0.750064;
                td.innerHTML = pressureInMmHg.toFixed(2);
                return;
            }
        }

        td.innerHTML = isStringEmpty(text) ? "" : text;
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

    function renderSensorsData(sensorsData) {
        // save received data
        sensors = sensorsData.data;

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

        var cb = document.createElement("input");
        cb.type = "checkbox";
        cb.className = "styled";
        cb.checked = sensor.TableVisibility == 1;
        cb.setAttribute("sensorid", sensor.ID);
        cb.id = "cb_{0}".format(sensor.ID);
        cb.onclick = function() {
            var sensorId = parseInt(this.getAttribute("sensorid"));
            queryHelper.updateSensorData({
                id: sensorId,
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
        sensors = payload.sensors.data;
        renderWeatherTable(null, false);
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

    function requestDataComplete(payload) {
        renderModulesData(payload.modules);
        renderSensorsData(payload.sensors);

        requestWeatherData();
    }

    function renderModulesData(moduleData) {

        modules = moduleData.data;
        serverDateTime = new Date(moduleData.ServerDateTime);

        for (var i = 0; i < modules.length; i++) {
            modules[i].LastSeenDateTime = new Date(modules[i].LastSeenDateTime);
        }

        renderModules();
        filteredMacs = getFilteredMacs();
    }

    function renderModules() {
        var modulesList = ge("modulesList");
        modulesList.innerHTML = "";

        for (var i = 0; i < modules.length; i++) {
            // render dropdown item
            renderModule(modulesList, modules[i]);
        }

        if (modules.length == 0) {
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
        label.innerHTML = isStringEmpty(module.Description) ? title : (module.Description + " &ndash; " + title);
        label.htmlFor = cb.id;
        label.title = module.MAC;
        cbParent.appendChild(label);
    }

    function getFilteredMacs() {
        var macs = [];
        for (var i = 0; i < modules.length; i++) {
            var module = modules[i];

            var cb = ge("cb_{0}".format(module.MAC));
            if (cb.checked) {
                macs.push(module.MAC);
            }
        }

        return macs.join(",");
    }

    function moduleDataUpdated(payload) {

        modules = payload.modules.data;
        for (var i = 0; i < modules.length; i++) {
            modules[i].LastSeenDateTime = new Date(modules[i].LastSeenDateTime);
        }

        filteredMacs = getFilteredMacs();
        requestWeatherData();
    }

    function init() {
        requestData();
    }

    init();
};
