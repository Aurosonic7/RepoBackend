CREATE TABLE
    IF NOT EXISTS Student (
        idStudent INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(55) NOT NULL,
        isActive BOOLEAN NOT NULL DEFAULT TRUE,
        idCareer INT NOT NULL,
        FOREIGN KEY (idCareer) REFERENCES Career (idCareer)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;