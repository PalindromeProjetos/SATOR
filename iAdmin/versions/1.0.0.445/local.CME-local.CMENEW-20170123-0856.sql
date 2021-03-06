/*
Run this script on:

(local).CMENEW    -  This database will be modified

to synchronize it with:

(local).CME

You are recommended to back up your database before running this script

Script created by SQL Data Compare version 11.1.3 from Red Gate Software Ltd at 23/01/2017 08:56:15

*/
		
SET NUMERIC_ROUNDABORT OFF
GO
SET ANSI_PADDING, ANSI_WARNINGS, CONCAT_NULL_YIELDS_NULL, ARITHABORT, QUOTED_IDENTIFIER, ANSI_NULLS, NOCOUNT ON
GO
SET DATEFORMAT YMD
GO
SET XACT_ABORT ON
GO
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE
GO
BEGIN TRANSACTION
-- Pointer used for text / image updates. This might not be needed, but is declared here just in case
DECLARE @pv binary(16)

PRINT(N'Drop constraints from [dbo].[enumtypelist]')
ALTER TABLE [dbo].[enumtypelist] DROP CONSTRAINT [FK_enumtypelist_enumtype]

PRINT(N'Delete rows from [dbo].[enumtypelist]')
DELETE FROM [dbo].[enumtypelist] WHERE [id]=1195
DELETE FROM [dbo].[enumtypelist] WHERE [id]=2195
DELETE FROM [dbo].[enumtypelist] WHERE [id]=2196
DELETE FROM [dbo].[enumtypelist] WHERE [id]=2197
DELETE FROM [dbo].[enumtypelist] WHERE [id]=2198
DELETE FROM [dbo].[enumtypelist] WHERE [id]=2199
DELETE FROM [dbo].[enumtypelist] WHERE [id]=2200
DELETE FROM [dbo].[enumtypelist] WHERE [id]=2201
DELETE FROM [dbo].[enumtypelist] WHERE [id]=2202
DELETE FROM [dbo].[enumtypelist] WHERE [id]=2203
DELETE FROM [dbo].[enumtypelist] WHERE [id]=2204
DELETE FROM [dbo].[enumtypelist] WHERE [id]=2205
DELETE FROM [dbo].[enumtypelist] WHERE [id]=2206
PRINT(N'Operation applied to 13 rows out of 13')

PRINT(N'Delete rows from [dbo].[enumtype]')
DELETE FROM [dbo].[enumtype] WHERE [id]=1057
DELETE FROM [dbo].[enumtype] WHERE [id]=1058
PRINT(N'Operation applied to 2 rows out of 2')

PRINT(N'Add rows to [dbo].[enumtype]')
SET IDENTITY_INSERT [dbo].[enumtype] ON
INSERT INTO [dbo].[enumtype] ([id], [name], [description], [observation], [reserved]) VALUES (58, 'outputtype', 'Tipo de Saída Item Arsenal', 'Lista tipos de saida', 1)
INSERT INTO [dbo].[enumtype] ([id], [name], [description], [observation], [reserved]) VALUES (59, 'regresstype', 'Tipo de Retorno', 'Lista tipos de retornos', 1)
INSERT INTO [dbo].[enumtype] ([id], [name], [description], [observation], [reserved]) VALUES (60, 'flowtype', 'Tipo de Fluxo', 'Lista tipos de fluxos', 1)
INSERT INTO [dbo].[enumtype] ([id], [name], [description], [observation], [reserved]) VALUES (61, 'boxtype', 'Tipo de Kit', 'Lista tipos de Kit', 1)
INSERT INTO [dbo].[enumtype] ([id], [name], [description], [observation], [reserved]) VALUES (62, 'chargeflag', 'Tipo de Ciclo/Carga', 'Lista tipos de ciclo', 1)
INSERT INTO [dbo].[enumtype] ([id], [name], [description], [observation], [reserved]) VALUES (63, 'chargestatus', 'Siatuação do item Cilco/Carga', 'Lista Status item', 1)
SET IDENTITY_INSERT [dbo].[enumtype] OFF
PRINT(N'Operation applied to 6 rows out of 6')

PRINT(N'Add rows to [dbo].[enumtypelist]')
SET IDENTITY_INSERT [dbo].[enumtypelist] ON
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby], [filtertype]) VALUES (229, 54, '003', 'Retorno de Materiais', 'Materiais', 1, 2, NULL)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby], [filtertype]) VALUES (230, 58, 'P', 'Padrão', 'Saída Padrão', 1, 0, NULL)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby], [filtertype]) VALUES (231, 58, 'A', 'Avulso', 'Saída Avulso', 1, 1, NULL)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby], [filtertype]) VALUES (232, 58, 'E', 'Empréstimo', 'Saída Emprestimo', 1, 2, NULL)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby], [filtertype]) VALUES (233, 59, '001', 'Não usado', NULL, 1, 1, NULL)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby], [filtertype]) VALUES (234, 59, '002', 'Procedimento cancelado', NULL, 1, 2, NULL)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby], [filtertype]) VALUES (235, 51, 'SATOR_MOVIMENTO_OF', 'Movimento Entrada', 'Movimento Entrada', 1, 15, NULL)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby], [filtertype]) VALUES (236, 51, 'SATOR_MOVIMENTO_TO', 'Movimento Saida', 'Movimento Saída', 1, 16, NULL)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby], [filtertype]) VALUES (237, 51, 'SATOR_MOVIMENTO_IN', 'Movimento Retorno', 'Movimento Retorno', 1, 17, NULL)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby], [filtertype]) VALUES (238, 51, 'SATOR_PREPARA_LEITURA', 'Prepara Recebimento', 'Prepara Recebimento', 1, 18, NULL)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby], [filtertype]) VALUES (239, 51, 'SATOR_PREPARA_LOTE_CARGA', 'Prepara Lote Avulso', 'Prepara Lote Avulso', 1, 19, NULL)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby], [filtertype]) VALUES (240, 51, 'SATOR_REVERTE_FASE', 'Reverte Fase', 'Reverte Fase', 1, 20, NULL)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby], [filtertype]) VALUES (241, 51, 'SATOR_LOTE_TRIAGEM', 'Triagem', 'Triagem', 1, 21, NULL)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby], [filtertype]) VALUES (242, 60, '001', 'Normal', NULL, 1, 1, NULL)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby], [filtertype]) VALUES (243, 60, '002', 'Kit de Tecidos', NULL, 1, 2, NULL)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby], [filtertype]) VALUES (244, 61, '001', 'Kitparil', NULL, 1, 1, NULL)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby], [filtertype]) VALUES (245, 61, '002', 'Kitlasque', NULL, 1, 2, NULL)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby], [filtertype]) VALUES (246, 61, '003', 'Kitexploda', NULL, 1, 3, NULL)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby], [filtertype]) VALUES (247, 62, '001', 'Preparando Carga', NULL, 1, 1, NULL)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby], [filtertype]) VALUES (248, 62, '002', 'Ciclo Iniciado', NULL, 1, 2, NULL)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby], [filtertype]) VALUES (249, 62, '003', 'Ciclo Encerrado', NULL, 1, 3, NULL)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby], [filtertype]) VALUES (250, 62, '004', 'Carga Cancelada', NULL, 1, 4, NULL)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby], [filtertype]) VALUES (251, 62, '005', 'Carga Criada', NULL, 1, 5, NULL)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby], [filtertype]) VALUES (252, 62, '006', 'Carga Finalizada', NULL, 1, 6, NULL)
SET IDENTITY_INSERT [dbo].[enumtypelist] OFF
PRINT(N'Operation applied to 24 rows out of 24')

PRINT(N'Add constraints to [dbo].[enumtypelist]')
ALTER TABLE [dbo].[enumtypelist] ADD CONSTRAINT [FK_enumtypelist_enumtype] FOREIGN KEY ([enumtypeid]) REFERENCES [dbo].[enumtype] ([id])
COMMIT TRANSACTION
GO
