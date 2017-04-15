DROP TABLE IF EXISTS `appointments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `appointments` (
  `AppointmentId` int(11) NOT NULL AUTO_INCREMENT,
  `date` DATE NOT NULL,
  `doctor` varchar(255) NOT NULL,
  `time` time NOT NULL,
  `place` varchar(255) NOT NULL,
  `reason` varchar(255) NOT NULL,
  `medication` varchar(255) NOT NULL,
  PRIMARY KEY (`AppointmentId`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `workouts`
--

DROP TABLE IF EXISTS `Medications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Medications` (
  `MedicationId` int(20) NOT NULL AUTO_INCREMENT,
  `days` VARCHAR(255) NOT NULL,
  `TOD` TEXT NOT NULL,
  `freq` int(11) NOT NULL,
  `instructions` VARCHAR(255) NOT NULL,
  `Purpose` VARCHAR(255) NOT NULL,
  FOREIGN KEY (AppointmentId) REFERENCES appointments(AppointmentId)
  PRIMARY KEY (`MedicationId`),
) ENGINE=InnoDB AUTO_INCREMENT=256 DEFAULT CHARSET=latin1;
