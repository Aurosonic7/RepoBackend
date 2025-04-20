CREATE TABLE IF NOT EXISTS Resource (
  idResource     INT AUTO_INCREMENT PRIMARY KEY,
  title          VARCHAR(55)   NOT NULL,
  description    VARCHAR(255)  NOT NULL,
  datePublication DATE         NOT NULL,
  isActive       BOOLEAN       NOT NULL DEFAULT TRUE,
  idCategory     INT           NOT NULL,
  idCareer       INT           NOT NULL,
  idDirector     INT           NOT NULL,
  idRevisor1     INT           NOT NULL,
  idRevisor2     INT           NOT NULL,
  FOREIGN KEY (idCategory) REFERENCES Category(idCategory),
  FOREIGN KEY (idCareer)   REFERENCES Career(idCareer),
  FOREIGN KEY (idDirector) REFERENCES User(idUser),
  FOREIGN KEY (idRevisor1) REFERENCES User(idUser),
  FOREIGN KEY (idRevisor2) REFERENCES User(idUser)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;