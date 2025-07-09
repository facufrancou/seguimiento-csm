-- MySQL Script generado por MySQL Workbench + tabla intermedia remito_operarios
-- Tue Jul  8 22:45:44 2025

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema seguimiento_entregas
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `seguimiento_entregas` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci ;
USE `seguimiento_entregas` ;

-- -----------------------------------------------------
-- Table `seguimiento_entregas`.`clientes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `clientes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(255) NOT NULL,
  `cuit` VARCHAR(20) NULL DEFAULT NULL,
  `domicilio` VARCHAR(255) NULL DEFAULT NULL,
  `localidad` VARCHAR(100) NULL DEFAULT NULL,
  `condicion_iva` VARCHAR(50) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `cuit` (`cuit` ASC) VISIBLE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table `seguimiento_entregas`.`remitos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `remitos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `numero_remito` VARCHAR(50) NOT NULL,
  `cliente_id` INT NOT NULL,
  `fecha_emision` DATE NULL DEFAULT NULL,
  `condicion_operacion` VARCHAR(100) NULL DEFAULT NULL,
  `observaciones` TEXT NULL DEFAULT NULL,
  `archivo_pdf` VARCHAR(255) NULL DEFAULT NULL,
  `estado` ENUM('pendiente', 'entregado') NULL DEFAULT 'pendiente',
  PRIMARY KEY (`id`),
  UNIQUE INDEX `numero_remito` (`numero_remito` ASC) VISIBLE,
  INDEX `cliente_id` (`cliente_id` ASC) VISIBLE,
  CONSTRAINT `remitos_ibfk_1`
    FOREIGN KEY (`cliente_id`)
    REFERENCES `clientes` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table `seguimiento_entregas`.`usuarios`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `contraseña` VARCHAR(255) NOT NULL,
  `rol` ENUM('admin', 'operario') NULL DEFAULT 'operario',
  `creado_en` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `email` (`email` ASC) VISIBLE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table `seguimiento_entregas`.`entregas`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `entregas` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `remito_id` INT NOT NULL,
  `operario_id` INT NOT NULL,
  `fecha_entrega` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  `nombre_operario` VARCHAR(100) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `remito_id` (`remito_id` ASC) VISIBLE,
  INDEX `operario_id` (`operario_id` ASC) VISIBLE,
  CONSTRAINT `entregas_ibfk_1`
    FOREIGN KEY (`remito_id`)
    REFERENCES `remitos` (`id`),
  CONSTRAINT `entregas_ibfk_2`
    FOREIGN KEY (`operario_id`)
    REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table `seguimiento_entregas`.`productos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `productos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `codigo_bit` VARCHAR(20) NULL DEFAULT NULL,
  `nombre` VARCHAR(255) NOT NULL,
  `unidad_medida` VARCHAR(50) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `codigo_bit` (`codigo_bit` ASC) VISIBLE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table `seguimiento_entregas`.`remito_productos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `remito_productos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `remito_id` INT NOT NULL,
  `producto_id` INT NOT NULL,
  `cantidad` DECIMAL(10,2) NOT NULL,
  `entregado` TINYINT(1) NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  INDEX `remito_id` (`remito_id` ASC) VISIBLE,
  INDEX `producto_id` (`producto_id` ASC) VISIBLE,
  CONSTRAINT `remito_productos_ibfk_1`
    FOREIGN KEY (`remito_id`)
    REFERENCES `remitos` (`id`),
  CONSTRAINT `remito_productos_ibfk_2`
    FOREIGN KEY (`producto_id`)
    REFERENCES `productos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table `seguimiento_entregas`.`tokens_acceso`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tokens_acceso` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `remito_id` INT NOT NULL,
  `token` VARCHAR(100) NOT NULL,
  `expiracion` DATETIME NULL DEFAULT NULL,
  `usado` TINYINT(1) NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE INDEX `token` (`token` ASC) VISIBLE,
  INDEX `remito_id` (`remito_id` ASC) VISIBLE,
  CONSTRAINT `tokens_acceso_ibfk_1`
    FOREIGN KEY (`remito_id`)
    REFERENCES `remitos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Tabla intermedia remito_operarios
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `remito_operarios` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `remito_id` INT NOT NULL,
  `operario_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `remito_id` (`remito_id` ASC) VISIBLE,
  INDEX `operario_id` (`operario_id` ASC) VISIBLE,
  CONSTRAINT `remito_operarios_ibfk_1`
    FOREIGN KEY (`remito_id`)
    REFERENCES `remitos` (`id`),
  CONSTRAINT `remito_operarios_ibfk_2`
    FOREIGN KEY (`operario_id`)
    REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;