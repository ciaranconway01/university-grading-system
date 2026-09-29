-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 12, 2026 at 08:46 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `40343604`
--

-- --------------------------------------------------------

--
-- Table structure for table `module_results`
--

CREATE TABLE `module_results` (
  `result_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `module_name` varchar(100) NOT NULL,
  `academic_year` int(11) NOT NULL,
  `credits` int(11) NOT NULL,
  `mark` int(11) NOT NULL,
  `is_resit` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `module_results`
--

INSERT INTO `module_results` (`result_id`, `student_id`, `module_name`, `academic_year`, `credits`, `mark`, `is_resit`) VALUES
(1, 1, 'Dissertation', 3, 40, 72, 0),
(2, 1, 'Module A', 3, 20, 68, 0),
(3, 1, 'Module B', 3, 20, 65, 0),
(4, 1, 'Module C', 3, 20, 74, 0),
(5, 1, 'Module D', 3, 20, 60, 0),
(6, 1, 'Year 2 Software Eng', 2, 20, 65, 0),
(7, 1, 'Year 2 Databases', 2, 20, 70, 0),
(8, 1, 'Year 2 Networks', 2, 20, 62, 0),
(9, 1, 'Year 2 Web Dev', 2, 20, 68, 0),
(10, 1, 'Year 2 Algorithms', 2, 20, 55, 0),
(11, 1, 'Year 2 Security', 2, 20, 60, 0),
(15, 3, 'Year 2 Basics', 2, 20, 85, 0),
(16, 3, 'Year 3 Application', 3, 120, 55, 0),
(17, 4, 'Year 2 Core', 2, 120, 45, 0),
(18, 4, 'Year 3 Resit Module', 3, 120, 85, 1);

-- --------------------------------------------------------

--
-- Table structure for table `officer_assignments`
--

CREATE TABLE `officer_assignments` (
  `assignment_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `programme_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `officer_assignments`
--

INSERT INTO `officer_assignments` (`assignment_id`, `user_id`, `programme_id`) VALUES
(2, 4, 2),
(3, 2, 2),
(5, 6, 8),
(6, 6, 7),
(7, 4, 9),
(8, 2, 1),
(9, 4, 1),
(10, 2, 10);

-- --------------------------------------------------------

--
-- Table structure for table `programmes`
--

CREATE TABLE `programmes` (
  `programme_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `y2_weighting` decimal(3,2) NOT NULL,
  `y3_weighting` decimal(3,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `programmes`
--

INSERT INTO `programmes` (`programme_id`, `name`, `y2_weighting`, `y3_weighting`) VALUES
(1, 'BSc Computer Science', 0.45, 0.55),
(2, 'BA Fine Art', 0.50, 0.50),
(3, 'BA History', 0.60, 0.40),
(7, 'BA French', 0.35, 0.65),
(8, 'BSc Business Management', 0.65, 0.35),
(9, 'BA Politics', 0.25, 0.75),
(10, 'BSc Data Science', 0.20, 0.80);

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `student_id` int(11) NOT NULL,
  `student_number` varchar(10) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `programme_id` int(11) NOT NULL,
  `calculated_classification` varchar(50) DEFAULT NULL,
  `manual_override_classification` varchar(50) DEFAULT NULL,
  `decision_rationale` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`student_id`, `student_number`, `first_name`, `last_name`, `programme_id`, `calculated_classification`, `manual_override_classification`, `decision_rationale`) VALUES
(1, '12345678', 'Alice', 'Johnson', 1, 'Pending', 'Lower Second Class (2:2)', 'Reason.'),
(3, '33333333', 'Charlie', 'Chaplin', 2, 'Pending', NULL, NULL),
(4, '44444444', 'Diana', 'Prince', 1, 'Pending', NULL, NULL),
(5, '987654321', 'A', 'B', 2, 'Pending', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('registry_admin','classification_officer') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `username`, `password_hash`, `role`) VALUES
(1, 'registry_admin', 'password123', 'registry_admin'),
(2, 'John_Smith', 'welcome123', 'classification_officer'),
(4, 'Adam_Smith', 'welcome321', 'classification_officer'),
(6, 'Mary_Jane', 'password321', 'classification_officer');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `module_results`
--
ALTER TABLE `module_results`
  ADD PRIMARY KEY (`result_id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indexes for table `officer_assignments`
--
ALTER TABLE `officer_assignments`
  ADD PRIMARY KEY (`assignment_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `programme_id` (`programme_id`);

--
-- Indexes for table `programmes`
--
ALTER TABLE `programmes`
  ADD PRIMARY KEY (`programme_id`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`student_id`),
  ADD UNIQUE KEY `student_number` (`student_number`),
  ADD KEY `programme_id` (`programme_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `module_results`
--
ALTER TABLE `module_results`
  MODIFY `result_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `officer_assignments`
--
ALTER TABLE `officer_assignments`
  MODIFY `assignment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `programmes`
--
ALTER TABLE `programmes`
  MODIFY `programme_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `student_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `module_results`
--
ALTER TABLE `module_results`
  ADD CONSTRAINT `module_results_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE;

--
-- Constraints for table `officer_assignments`
--
ALTER TABLE `officer_assignments`
  ADD CONSTRAINT `officer_assignments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `officer_assignments_ibfk_2` FOREIGN KEY (`programme_id`) REFERENCES `programmes` (`programme_id`) ON DELETE CASCADE;

--
-- Constraints for table `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `students_ibfk_1` FOREIGN KEY (`programme_id`) REFERENCES `programmes` (`programme_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
