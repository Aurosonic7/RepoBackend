CREATE TABLE
  IF NOT EXISTS Resource (
    idResource INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(55) NOT NULL,
    description VARCHAR(255) NOT NULL,
    datePublication DATE NOT NULL,
    isActive BOOLEAN NOT NULL DEFAULT TRUE,
    filePath VARCHAR(255) NOT NULL,
    imagePath VARCHAR(255) NOT NULL,
    idStudent INT NOT NULL,
    idCategory INT NOT NULL,
    FOREIGN KEY (idStudent) REFERENCES Student (idStudent),
    FOREIGN KEY (idCategory) REFERENCES Category (idCategory)
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;