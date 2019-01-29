DROP DATABASE IF EXISTS subtool;
CREATE DATABASE subtool;
USE subtool;
CREATE TABLE projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    projectName VARCHAR(255) NOT NULL,
    projectType VARCHAR(255) NOT NULL,
    privacy INT NOT NULL,
    startLang VARCHAR(255) NOT NULL,
    endLang VARCHAR(255) NOT NULL,
    link VARCHAR(255) NOT NULL,
    packLength INT NOT NULL
);
CREATE TABLE rules (
    idProject INT NOT NULL,
    startWord VARCHAR(255) NOT NULL,
    endWord VARCHAR(255) NOT NULL
);