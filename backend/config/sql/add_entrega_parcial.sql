-- Agregar campo entrega_parcial a la tabla entregas
ALTER TABLE `seguimiento_entregas`.`entregas` 
ADD COLUMN `entrega_parcial` TINYINT(1) NOT NULL DEFAULT 0 
COMMENT 'Indica si la entrega fue parcial (1) o completa (0)';
