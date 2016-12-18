-- phpMyAdmin SQL Dump
-- version 4.5.1
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: 2016-12-18 18:00:10
-- 服务器版本： 10.1.9-MariaDB
-- PHP Version: 5.6.15

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `saboteur`
--

-- --------------------------------------------------------

--
-- 表的结构 `carta`
--

CREATE TABLE `carta` (
  `Fila` int(10) DEFAULT NULL,
  `Columna` int(10) DEFAULT NULL,
  `Propietario` varchar(10) DEFAULT NULL,
  `Partida` varchar(20) NOT NULL,
  `Path` varchar(100) NOT NULL,
  `Estado` varchar(10) NOT NULL,
  `Visible` int(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- 表的结构 `comenta`
--

CREATE TABLE `comenta` (
  `Jugador` varchar(10) NOT NULL,
  `Comentario` varchar(140) NOT NULL,
  `Partida` varchar(20) NOT NULL,
  `Fecha` date NOT NULL,
  `Foto` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- 表的结构 `jugador`
--

CREATE TABLE `jugador` (
  `Nick` varchar(10) NOT NULL,
  `Password` varchar(512) NOT NULL,
  `Nombre_completo` varchar(20) NOT NULL,
  `Sexo` varchar(1) NOT NULL,
  `Foto` varchar(100) DEFAULT NULL,
  `Fecha_nacimiento` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- 表的结构 `participa`
--

CREATE TABLE `participa` (
  `Jugador` varchar(10) NOT NULL,
  `Role` varchar(10) NOT NULL,
  `Partida` varchar(20) NOT NULL,
  `Herramienta` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- 表的结构 `partida`
--

CREATE TABLE `partida` (
  `Nombre` varchar(20) NOT NULL,
  `Creador` varchar(10) NOT NULL,
  `Fecha` date NOT NULL,
  `Turno` varchar(10) NOT NULL,
  `Estado` varchar(15) NOT NULL,
  `Ganador` varchar(10) NOT NULL,
  `Max_jugadores` int(1) NOT NULL,
  `Max_turno` int(3) NOT NULL,
  `PosOro` int(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- 表的结构 `sessions`
--

CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) UNSIGNED NOT NULL,
  `data` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `carta`
--
ALTER TABLE `carta`
  ADD KEY `Propiedario` (`Propietario`),
  ADD KEY `Partida` (`Partida`);

--
-- Indexes for table `comenta`
--
ALTER TABLE `comenta`
  ADD KEY `Jugador` (`Jugador`),
  ADD KEY `Partida` (`Partida`);

--
-- Indexes for table `jugador`
--
ALTER TABLE `jugador`
  ADD PRIMARY KEY (`Nick`);

--
-- Indexes for table `participa`
--
ALTER TABLE `participa`
  ADD KEY `Jugador` (`Jugador`),
  ADD KEY `Partida` (`Partida`);

--
-- Indexes for table `partida`
--
ALTER TABLE `partida`
  ADD PRIMARY KEY (`Nombre`),
  ADD KEY `Creador` (`Creador`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`session_id`);

--
-- 限制导出的表
--

--
-- 限制表 `carta`
--
ALTER TABLE `carta`
  ADD CONSTRAINT `carta_ibfk_1` FOREIGN KEY (`Partida`) REFERENCES `partida` (`Nombre`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `carta_ibfk_2` FOREIGN KEY (`Propietario`) REFERENCES `jugador` (`Nick`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- 限制表 `comenta`
--
ALTER TABLE `comenta`
  ADD CONSTRAINT `comenta_ibfk_1` FOREIGN KEY (`Jugador`) REFERENCES `jugador` (`Nick`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `comenta_ibfk_2` FOREIGN KEY (`Partida`) REFERENCES `partida` (`Nombre`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- 限制表 `participa`
--
ALTER TABLE `participa`
  ADD CONSTRAINT `participa_ibfk_1` FOREIGN KEY (`Jugador`) REFERENCES `jugador` (`Nick`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `participa_ibfk_2` FOREIGN KEY (`Partida`) REFERENCES `partida` (`Nombre`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- 限制表 `partida`
--
ALTER TABLE `partida`
  ADD CONSTRAINT `partida_ibfk_1` FOREIGN KEY (`Creador`) REFERENCES `jugador` (`Nick`) ON DELETE CASCADE ON UPDATE CASCADE;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
