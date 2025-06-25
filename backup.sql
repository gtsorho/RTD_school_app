-- MySQL dump 10.13  Distrib 8.0.39, for Linux (x86_64)
--
-- Host: localhost    Database: elvturk
-- ------------------------------------------------------
-- Server version	8.0.39-0ubuntu0.22.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Categories`
--

DROP TABLE IF EXISTS `Categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Categories`
--

LOCK TABLES `Categories` WRITE;
/*!40000 ALTER TABLE `Categories` DISABLE KEYS */;
INSERT INTO `Categories` VALUES (1,'orange','2024-12-07 01:55:26','2024-12-07 01:55:26'),(2,'pinaple','2024-12-07 01:57:06','2024-12-07 01:57:06'),(3,'multifruiter','2024-12-07 14:06:03','2024-12-07 14:06:03');
/*!40000 ALTER TABLE `Categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Invoices`
--

DROP TABLE IF EXISTS `Invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Invoices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` datetime NOT NULL,
  `total_items` float NOT NULL,
  `is_balanced` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `UserId` int DEFAULT NULL,
  `recipientId` int DEFAULT NULL,
  `total_amount` float NOT NULL,
  `amount_paid` float NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `UserId` (`UserId`),
  KEY `recipientId` (`recipientId`),
  CONSTRAINT `Invoices_ibfk_1` FOREIGN KEY (`UserId`) REFERENCES `Users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Invoices_ibfk_2` FOREIGN KEY (`recipientId`) REFERENCES `Users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Invoices`
--

LOCK TABLES `Invoices` WRITE;
/*!40000 ALTER TABLE `Invoices` DISABLE KEYS */;
INSERT INTO `Invoices` VALUES (23,'2024-12-28 00:00:00',60,0,'2024-12-28 00:16:25','2024-12-28 01:10:14',1,2,2480,2500),(24,'2025-01-01 00:00:00',2,0,'2025-01-01 16:22:12','2025-01-01 16:22:12',1,2,86.4,0),(25,'2025-01-01 00:00:00',2,0,'2025-01-01 17:12:22','2025-01-01 17:12:22',1,2,86.4,0),(26,'2025-01-01 00:00:00',6,0,'2025-01-01 17:13:16','2025-01-01 17:13:34',1,1,257.2,200),(27,'2025-01-01 00:00:00',12,0,'2025-01-01 17:19:40','2025-01-01 17:19:40',1,1,579.6,120);
/*!40000 ALTER TABLE `Invoices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Items`
--

DROP TABLE IF EXISTS `Items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `quantity` float NOT NULL,
  `unitPrice` float NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `ProductId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ProductId` (`ProductId`),
  CONSTRAINT `Items_ibfk_1` FOREIGN KEY (`ProductId`) REFERENCES `Products` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Items`
--

LOCK TABLES `Items` WRITE;
/*!40000 ALTER TABLE `Items` DISABLE KEYS */;
INSERT INTO `Items` VALUES (1,22,48.4,'2024-12-07 13:47:56','2025-01-01 17:19:40',1),(2,53,43.2,'2024-12-07 14:03:21','2025-01-01 17:12:22',1),(3,177,32,'2024-12-07 14:06:24','2025-01-01 17:13:16',2),(8,174,48.3,'2024-12-08 01:16:16','2025-01-01 17:19:40',5),(9,5,43.2,'2024-12-08 13:59:26','2025-01-01 14:48:34',5),(10,71,32,'2024-12-08 14:44:37','2025-01-01 17:13:16',6),(11,76,70,'2024-12-15 20:57:40','2024-12-27 19:49:48',3),(12,14,70,'2024-12-27 07:28:39','2024-12-27 08:47:03',7);
/*!40000 ALTER TABLE `Items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Product_Logs`
--

DROP TABLE IF EXISTS `Product_Logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Product_Logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `log` text,
  `UserId` int DEFAULT NULL,
  `type` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `UserId` (`UserId`),
  CONSTRAINT `Product_Logs_ibfk_1` FOREIGN KEY (`UserId`) REFERENCES `Users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Product_Logs`
--

LOCK TABLES `Product_Logs` WRITE;
/*!40000 ALTER TABLE `Product_Logs` DISABLE KEYS */;
INSERT INTO `Product_Logs` VALUES (1,'2024-12-27 19:49:48','2024-12-27 19:49:48','{\"date\":\"2024-12-27T00:00:00.000Z\",\"recipientId\":null,\"soreId\":1,\"store\":{\"location\":\"main store\"},\"recipient\":{\"location\":null},\"Items\":[{\"Categories\":[{\"id\":3,\"name\":\"multifruiter\"}],\"Product\":{\"id\":3,\"name\":\"Juicee\",\"description\":\"another Drink\",\"StoreId\":1},\"item_invoice\":{\"quantity\":76,\"unitPrice\":70,\"subtotal\":5320}}]}',1,'store'),(2,'2024-12-27 20:41:42','2024-12-27 20:41:42','{\"date\":\"2024-12-27T00:00:00.000Z\",\"recipientId\":null,\"soreId\":2,\"store\":{\"location\":\"gr-2302-18\"},\"recipient\":{\"location\":null},\"Items\":[{\"Categories\":[{\"id\":2,\"name\":\"pinaple\"}],\"Product\":{\"id\":5,\"name\":\"Kalipo\",\"description\":\"from Aquafresh n\",\"StoreId\":2},\"item_invoice\":{\"quantity\":113,\"unitPrice\":48.3,\"subtotal\":5457.9}},{\"Categories\":[{\"id\":3,\"name\":\"multifruiter\"}],\"Product\":{\"id\":6,\"name\":\"fruteli\",\"description\":\"from Aquafresh\",\"StoreId\":2},\"item_invoice\":{\"quantity\":63,\"unitPrice\":32,\"subtotal\":2016}}]}',1,'store'),(3,'2024-12-28 00:16:25','2024-12-28 00:16:25','{\"id\":23,\"date\":\"2024-12-28T00:00:00.000Z\",\"total_items\":60,\"total_amount\":2480,\"amount_paid\":0,\"is_balanced\":false,\"createdAt\":\"2024-12-28T00:16:25.000Z\",\"updatedAt\":\"2024-12-28T00:16:25.000Z\",\"recipientId\":2,\"UserId\":1,\"Items\":[{\"id\":2,\"unitPrice\":43.2,\"Categories\":[{\"id\":2,\"name\":\"pinaple\",\"item_categories\":{\"ItemId\":2,\"CategoryId\":2}}],\"Product\":{\"id\":1,\"name\":\"Kalipo\",\"description\":\"from Aquafresh\",\"StoreId\":1},\"item_invoice\":{\"quantity\":50,\"subtotal\":2160}},{\"id\":3,\"unitPrice\":32,\"Categories\":[{\"id\":3,\"name\":\"multifruiter\",\"item_categories\":{\"ItemId\":3,\"CategoryId\":3}}],\"Product\":{\"id\":2,\"name\":\"fruteli\",\"description\":\"from Aquafresh\",\"StoreId\":1},\"item_invoice\":{\"quantity\":10,\"subtotal\":320}}],\"User\":{\"username\":\"superAdmin\",\"phone\":\"0544069203\"},\"recipient\":{\"username\":\"johnDoe\",\"phone\":\"0544069203\"}}',1,'invoice created'),(9,'2024-12-28 01:09:26','2024-12-28 01:09:26','{\"id\":23,\"date\":\"2024-12-28T00:00:00.000Z\",\"total_items\":60,\"total_amount\":2480,\"amount_paid\":700,\"is_balanced\":false,\"createdAt\":\"2024-12-28T00:16:25.000Z\",\"updatedAt\":\"2024-12-28T01:09:26.000Z\",\"recipientId\":2,\"UserId\":1,\"Items\":[{\"id\":2,\"unitPrice\":43.2,\"Categories\":[{\"id\":2,\"name\":\"pinaple\",\"item_categories\":{\"ItemId\":2,\"CategoryId\":2}}],\"Product\":{\"id\":1,\"name\":\"Kalipo\",\"description\":\"from Aquafresh\",\"StoreId\":1},\"item_invoice\":{\"quantity\":50,\"subtotal\":2160}},{\"id\":3,\"unitPrice\":32,\"Categories\":[{\"id\":3,\"name\":\"multifruiter\",\"item_categories\":{\"ItemId\":3,\"CategoryId\":3}}],\"Product\":{\"id\":2,\"name\":\"fruteli\",\"description\":\"from Aquafresh\",\"StoreId\":1},\"item_invoice\":{\"quantity\":10,\"subtotal\":320}}],\"User\":{\"username\":\"superAdmin\",\"phone\":\"0544069203\"},\"recipient\":{\"username\":\"johnDoe\",\"phone\":\"0544069203\"}}',1,'invoice updated'),(10,'2024-12-28 01:09:55','2024-12-28 01:09:55','{\"id\":23,\"date\":\"2024-12-28T00:00:00.000Z\",\"total_items\":60,\"total_amount\":2480,\"amount_paid\":1700,\"is_balanced\":false,\"createdAt\":\"2024-12-28T00:16:25.000Z\",\"updatedAt\":\"2024-12-28T01:09:55.000Z\",\"recipientId\":2,\"UserId\":1,\"Items\":[{\"id\":2,\"unitPrice\":43.2,\"Categories\":[{\"id\":2,\"name\":\"pinaple\",\"item_categories\":{\"ItemId\":2,\"CategoryId\":2}}],\"Product\":{\"id\":1,\"name\":\"Kalipo\",\"description\":\"from Aquafresh\",\"StoreId\":1},\"item_invoice\":{\"quantity\":50,\"subtotal\":2160}},{\"id\":3,\"unitPrice\":32,\"Categories\":[{\"id\":3,\"name\":\"multifruiter\",\"item_categories\":{\"ItemId\":3,\"CategoryId\":3}}],\"Product\":{\"id\":2,\"name\":\"fruteli\",\"description\":\"from Aquafresh\",\"StoreId\":1},\"item_invoice\":{\"quantity\":10,\"subtotal\":320}}],\"User\":{\"username\":\"superAdmin\",\"phone\":\"0544069203\"},\"recipient\":{\"username\":\"johnDoe\",\"phone\":\"0544069203\"}}',1,'invoice updated'),(11,'2024-12-28 01:10:14','2024-12-28 01:10:14','{\"id\":23,\"date\":\"2024-12-28T00:00:00.000Z\",\"total_items\":60,\"total_amount\":2480,\"amount_paid\":2500,\"is_balanced\":false,\"createdAt\":\"2024-12-28T00:16:25.000Z\",\"updatedAt\":\"2024-12-28T01:10:14.000Z\",\"recipientId\":2,\"UserId\":1,\"Items\":[{\"id\":2,\"unitPrice\":43.2,\"Categories\":[{\"id\":2,\"name\":\"pinaple\",\"item_categories\":{\"ItemId\":2,\"CategoryId\":2}}],\"Product\":{\"id\":1,\"name\":\"Kalipo\",\"description\":\"from Aquafresh\",\"StoreId\":1},\"item_invoice\":{\"quantity\":50,\"subtotal\":2160}},{\"id\":3,\"unitPrice\":32,\"Categories\":[{\"id\":3,\"name\":\"multifruiter\",\"item_categories\":{\"ItemId\":3,\"CategoryId\":3}}],\"Product\":{\"id\":2,\"name\":\"fruteli\",\"description\":\"from Aquafresh\",\"StoreId\":1},\"item_invoice\":{\"quantity\":10,\"subtotal\":320}}],\"User\":{\"username\":\"superAdmin\",\"phone\":\"0544069203\"},\"recipient\":{\"username\":\"johnDoe\",\"phone\":\"0544069203\"}}',1,'invoice updated'),(12,'2025-01-01 16:22:12','2025-01-01 16:22:12','{\"id\":24,\"date\":\"2025-01-01T00:00:00.000Z\",\"total_items\":2,\"total_amount\":86.4,\"amount_paid\":0,\"is_balanced\":false,\"createdAt\":\"2025-01-01T16:22:12.000Z\",\"updatedAt\":\"2025-01-01T16:22:12.000Z\",\"recipientId\":2,\"UserId\":1,\"Items\":[{\"id\":2,\"unitPrice\":43.2,\"Categories\":[{\"id\":2,\"name\":\"pinaple\",\"item_categories\":{\"ItemId\":2,\"CategoryId\":2}}],\"Product\":{\"id\":1,\"name\":\"Kalipo\",\"description\":\"from Aquafresh\",\"StoreId\":1},\"item_invoice\":{\"quantity\":2,\"subtotal\":86.4}}],\"User\":{\"username\":\"superAdmin\",\"phone\":\"0544069203\"},\"recipient\":{\"username\":\"johnDoe\",\"phone\":\"0544069203\"}}',1,'invoice created'),(13,'2025-01-01 17:12:22','2025-01-01 17:12:22','{\"id\":25,\"date\":\"2025-01-01T00:00:00.000Z\",\"total_items\":2,\"total_amount\":86.4,\"amount_paid\":0,\"is_balanced\":false,\"createdAt\":\"2025-01-01T17:12:22.000Z\",\"updatedAt\":\"2025-01-01T17:12:22.000Z\",\"recipientId\":2,\"UserId\":1,\"Items\":[{\"id\":2,\"unitPrice\":43.2,\"Categories\":[{\"id\":2,\"name\":\"pinaple\",\"item_categories\":{\"ItemId\":2,\"CategoryId\":2}}],\"Product\":{\"id\":1,\"name\":\"Kalipo\",\"description\":\"from Aquafresh\",\"StoreId\":1},\"item_invoice\":{\"quantity\":2,\"subtotal\":86.4}}],\"User\":{\"username\":\"superAdmin\",\"phone\":\"0544069203\"},\"recipient\":{\"username\":\"johnDoe\",\"phone\":\"0544069203\"}}',1,'invoice created'),(14,'2025-01-01 17:13:16','2025-01-01 17:13:16','{\"id\":26,\"date\":\"2025-01-01T00:00:00.000Z\",\"total_items\":6,\"total_amount\":257.2,\"amount_paid\":0,\"is_balanced\":false,\"createdAt\":\"2025-01-01T17:13:16.000Z\",\"updatedAt\":\"2025-01-01T17:13:16.000Z\",\"recipientId\":1,\"UserId\":1,\"Items\":[{\"id\":8,\"unitPrice\":48.3,\"Categories\":[{\"id\":1,\"name\":\"orange\",\"item_categories\":{\"ItemId\":8,\"CategoryId\":1}},{\"id\":2,\"name\":\"pinaple\",\"item_categories\":{\"ItemId\":8,\"CategoryId\":2}}],\"Product\":{\"id\":5,\"name\":\"Kalipo\",\"description\":\"from Aquafresh n\",\"StoreId\":2},\"item_invoice\":{\"quantity\":4,\"subtotal\":193.2}},{\"id\":10,\"unitPrice\":32,\"Categories\":[{\"id\":3,\"name\":\"multifruiter\",\"item_categories\":{\"ItemId\":10,\"CategoryId\":3}}],\"Product\":{\"id\":6,\"name\":\"fruteli\",\"description\":\"from Aquafresh\",\"StoreId\":2},\"item_invoice\":{\"quantity\":2,\"subtotal\":64}}],\"User\":{\"username\":\"superAdmin\",\"phone\":\"0544069203\"},\"recipient\":{\"username\":\"superAdmin\",\"phone\":\"0544069203\"}}',1,'invoice created'),(15,'2025-01-01 17:13:34','2025-01-01 17:13:34','{\"id\":26,\"date\":\"2025-01-01T00:00:00.000Z\",\"total_items\":6,\"total_amount\":257.2,\"amount_paid\":200,\"is_balanced\":false,\"createdAt\":\"2025-01-01T17:13:16.000Z\",\"updatedAt\":\"2025-01-01T17:13:34.000Z\",\"recipientId\":1,\"UserId\":1,\"Items\":[{\"id\":8,\"unitPrice\":48.3,\"Categories\":[{\"id\":1,\"name\":\"orange\",\"item_categories\":{\"ItemId\":8,\"CategoryId\":1}},{\"id\":2,\"name\":\"pinaple\",\"item_categories\":{\"ItemId\":8,\"CategoryId\":2}}],\"Product\":{\"id\":5,\"name\":\"Kalipo\",\"description\":\"from Aquafresh n\",\"StoreId\":2},\"item_invoice\":{\"quantity\":4,\"subtotal\":193.2}},{\"id\":10,\"unitPrice\":32,\"Categories\":[{\"id\":3,\"name\":\"multifruiter\",\"item_categories\":{\"ItemId\":10,\"CategoryId\":3}}],\"Product\":{\"id\":6,\"name\":\"fruteli\",\"description\":\"from Aquafresh\",\"StoreId\":2},\"item_invoice\":{\"quantity\":2,\"subtotal\":64}}],\"User\":{\"username\":\"superAdmin\",\"phone\":\"0544069203\"},\"recipient\":{\"username\":\"superAdmin\",\"phone\":\"0544069203\"}}',1,'invoice updated'),(16,'2025-01-01 17:19:40','2025-01-01 17:19:40','{\"id\":27,\"date\":\"2025-01-01T00:00:00.000Z\",\"total_items\":12,\"total_amount\":579.6,\"amount_paid\":120,\"is_balanced\":false,\"createdAt\":\"2025-01-01T17:19:40.000Z\",\"updatedAt\":\"2025-01-01T17:19:40.000Z\",\"recipientId\":1,\"UserId\":1,\"Items\":[{\"id\":8,\"unitPrice\":48.3,\"Categories\":[{\"id\":1,\"name\":\"orange\",\"item_categories\":{\"ItemId\":8,\"CategoryId\":1}},{\"id\":2,\"name\":\"pinaple\",\"item_categories\":{\"ItemId\":8,\"CategoryId\":2}}],\"Product\":{\"id\":5,\"name\":\"Kalipo\",\"description\":\"from Aquafresh n\",\"StoreId\":2},\"item_invoice\":{\"quantity\":12,\"subtotal\":579.6}}],\"User\":{\"username\":\"superAdmin\",\"phone\":\"0544069203\"},\"recipient\":{\"username\":\"superAdmin\",\"phone\":\"0544069203\"}}',1,'invoice created');
/*!40000 ALTER TABLE `Product_Logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Products`
--

DROP TABLE IF EXISTS `Products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `StoreId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `StoreId` (`StoreId`),
  CONSTRAINT `Products_ibfk_1` FOREIGN KEY (`StoreId`) REFERENCES `Stores` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Products`
--

LOCK TABLES `Products` WRITE;
/*!40000 ALTER TABLE `Products` DISABLE KEYS */;
INSERT INTO `Products` VALUES (1,'Kalipo','from Aquafresh','2024-12-07 02:03:18','2024-12-07 02:03:18',1),(2,'fruteli','from Aquafresh','2024-12-07 02:24:30','2024-12-07 02:24:30',1),(3,'Juicee','another Drink','2024-12-07 12:40:16','2024-12-07 12:40:16',1),(5,'Kalipo','from Aquafresh n','2024-12-08 01:16:16','2024-12-15 18:40:12',2),(6,'fruteli','from Aquafresh','2024-12-08 14:44:37','2024-12-08 14:44:37',2),(7,'Juicee','another Drink','2024-12-27 07:28:39','2024-12-27 07:28:39',2);
/*!40000 ALTER TABLE `Products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Stores`
--

DROP TABLE IF EXISTS `Stores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Stores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `location` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `UserId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `UserId` (`UserId`),
  CONSTRAINT `Stores_ibfk_1` FOREIGN KEY (`UserId`) REFERENCES `Users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Stores`
--

LOCK TABLES `Stores` WRITE;
/*!40000 ALTER TABLE `Stores` DISABLE KEYS */;
INSERT INTO `Stores` VALUES (1,'main store','main warehouse at the offficeee','2024-12-06 20:32:08','2024-12-15 17:56:16',1),(2,'gr-2302-18','johns truck','2024-12-06 20:41:56','2024-12-06 20:41:56',2),(3,'ga-8921-20','mensah\'s car','2024-12-06 20:44:00','2024-12-06 20:44:00',2);
/*!40000 ALTER TABLE `Stores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT '0544069203',
  `role` enum('admin','sales','manager') DEFAULT 'sales',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Users`
--

LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
INSERT INTO `Users` VALUES (1,'superAdmin','$2b$10$q0x5c8Cx7d//E7KqZn/egOBvDjeAsZcLEyRxOr7pxjraEk0QGe6z.','0544069203','admin','2024-12-06 00:13:46','2024-12-06 00:13:46'),(2,'johnDoe','$2b$10$zSoGE4NWlfcdTnhZnZMRwuI/lfA5vNZIflB9k1r91a0tKgHZh0ura','0544069203','sales','2024-12-06 22:58:56','2024-12-06 22:58:56');
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `item_categories`
--

DROP TABLE IF EXISTS `item_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `item_categories` (
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `ItemId` int NOT NULL,
  `CategoryId` int NOT NULL,
  PRIMARY KEY (`ItemId`,`CategoryId`),
  KEY `CategoryId` (`CategoryId`),
  CONSTRAINT `item_categories_ibfk_1` FOREIGN KEY (`ItemId`) REFERENCES `Items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `item_categories_ibfk_2` FOREIGN KEY (`CategoryId`) REFERENCES `Categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `item_categories`
--

LOCK TABLES `item_categories` WRITE;
/*!40000 ALTER TABLE `item_categories` DISABLE KEYS */;
INSERT INTO `item_categories` VALUES ('2025-01-01 17:13:16','2025-01-01 17:13:16',1,1),('2024-12-07 13:47:56','2024-12-15 21:00:42',1,2),('2024-12-07 14:03:21','2024-12-07 14:03:21',2,2),('2024-12-07 14:06:24','2024-12-07 14:06:24',3,3),('2024-12-08 01:16:16','2024-12-08 01:16:16',8,1),('2024-12-27 07:10:33','2024-12-27 07:10:33',8,2),('2024-12-08 13:59:26','2024-12-08 13:59:26',9,2),('2024-12-08 14:44:37','2024-12-08 14:44:37',10,3),('2024-12-15 20:57:40','2024-12-15 20:57:40',11,3),('2024-12-27 07:28:39','2024-12-27 07:28:39',12,3);
/*!40000 ALTER TABLE `item_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `item_invoices`
--

DROP TABLE IF EXISTS `item_invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `item_invoices` (
  `quantity` int NOT NULL,
  `subtotal` float NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `InvoiceId` int NOT NULL,
  `ItemId` int NOT NULL,
  PRIMARY KEY (`InvoiceId`,`ItemId`),
  KEY `ItemId` (`ItemId`),
  CONSTRAINT `item_invoices_ibfk_1` FOREIGN KEY (`InvoiceId`) REFERENCES `Invoices` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `item_invoices_ibfk_2` FOREIGN KEY (`ItemId`) REFERENCES `Items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `item_invoices`
--

LOCK TABLES `item_invoices` WRITE;
/*!40000 ALTER TABLE `item_invoices` DISABLE KEYS */;
INSERT INTO `item_invoices` VALUES (50,2160,'2024-12-28 00:16:25','2024-12-28 00:16:25',23,2),(10,320,'2024-12-28 00:16:25','2024-12-28 00:16:25',23,3),(2,86.4,'2025-01-01 16:22:12','2025-01-01 16:22:12',24,2),(2,86.4,'2025-01-01 17:12:22','2025-01-01 17:12:22',25,2),(4,193.2,'2025-01-01 17:13:16','2025-01-01 17:13:16',26,8),(2,64,'2025-01-01 17:13:16','2025-01-01 17:13:16',26,10),(12,579.6,'2025-01-01 17:19:40','2025-01-01 17:19:40',27,8);
/*!40000 ALTER TABLE `item_invoices` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-02-06  9:54:47
