-- Tabla intermedia para asociar remitos y operarios
CREATE TABLE IF NOT EXISTS remito_operarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  remito_id INT NOT NULL,
  operario_id INT NOT NULL,
  FOREIGN KEY (remito_id) REFERENCES remitos(id),
  FOREIGN KEY (operario_id) REFERENCES usuarios(id)
);
