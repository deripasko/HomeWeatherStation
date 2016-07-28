--
-- Table structure for table `WeatherModule`
--

CREATE TABLE IF NOT EXISTS `WeatherModule` (
  `ID` int(11) NOT NULL,
  `ModuleID` int(11) NOT NULL,
  `ModuleName` varchar(50) NOT NULL,
  `MAC` varchar(50) NOT NULL,
  `IP` varchar(15) NOT NULL,
  `Description` text,
  `SensorDelay` int(11) DEFAULT NULL,
  `LastSeenDateTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `IsActive` bit(1) DEFAULT NULL,
  `TableVisibility` bit(1) DEFAULT b'1',
  `ChartVisibility` bit(1) DEFAULT b'1',
  `ValidationCode` varchar(16) DEFAULT NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `WeatherModule`
--
ALTER TABLE `WeatherModule`
  ADD PRIMARY KEY (`ID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `WeatherModule`
--
ALTER TABLE `WeatherModule`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=3;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
