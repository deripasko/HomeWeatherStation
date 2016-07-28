-- phpMyAdmin SQL Dump
-- version 4.3.12
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Jul 28, 2016 at 07:48 PM
-- Server version: 5.5.35-33.0-log
-- PHP Version: 5.4.39

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `host1402357`
--

-- --------------------------------------------------------

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

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
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
