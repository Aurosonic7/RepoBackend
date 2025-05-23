CREATE TABLE
  IF NOT EXISTS Career (
    idCareer INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(55) NOT NULL UNIQUE,
    idFaculty INT NOT NULL,
    FOREIGN KEY (idFaculty) REFERENCES Faculty (idFaculty)
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;