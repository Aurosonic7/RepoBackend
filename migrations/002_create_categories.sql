CREATE TABLE
  IF NOT EXISTS Category (
    idCategory INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30) NOT NULL,
    description VARCHAR(255) NOT NULL
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;