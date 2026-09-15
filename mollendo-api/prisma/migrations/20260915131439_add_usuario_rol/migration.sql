/*
  Warnings:

  - Added the required column `rol` to the `usuario` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "rol_usuario" AS ENUM ('administracion', 'empresa', 'vigilancia');

-- AlterTable
ALTER TABLE "usuario" ADD COLUMN     "rol" "rol_usuario" NOT NULL;
