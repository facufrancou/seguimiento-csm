-- Modificar el ENUM de estado en la tabla remitos para incluir 'parcial'
ALTER TABLE `seguimiento_entregas`.`remitos` 
MODIFY COLUMN `estado` ENUM('pendiente', 'entregado', 'parcial') DEFAULT 'pendiente';
