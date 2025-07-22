-- Agregar columna cantidad_entregada a remito_productos
ALTER TABLE `seguimiento_entregas`.`remito_productos`
ADD COLUMN `cantidad_entregada` DECIMAL(10,2) NULL DEFAULT NULL AFTER `entregado`;

-- Método 1: Desactivar temporalmente el modo seguro
SET SQL_SAFE_UPDATES = 0;

-- Actualizar los registros existentes para que tengan la misma cantidad entregada que solicitada
UPDATE `seguimiento_entregas`.`remito_productos` 
SET `cantidad_entregada` = `cantidad`
WHERE `entregado` = 1;

-- Volver a activar el modo seguro
SET SQL_SAFE_UPDATES = 1;

-- Método 2: Alternativa usando ID (por si el método 1 falla)
-- UPDATE `seguimiento_entregas`.`remito_productos` 
-- SET `cantidad_entregada` = `cantidad`
-- WHERE `id` IN (SELECT id FROM (SELECT id FROM `seguimiento_entregas`.`remito_productos` WHERE `entregado` = 1) AS temp);
