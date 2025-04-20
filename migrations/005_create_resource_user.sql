CREATE TABLE IF NOT EXISTS ResourceUser (
  idUser       INT NOT NULL,
  idResource   INT NOT NULL,
  PRIMARY KEY (idUser, idResource),
  FOREIGN KEY (idUser)     REFERENCES User(idUser),
  FOREIGN KEY (idResource) REFERENCES Resource(idResource)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;