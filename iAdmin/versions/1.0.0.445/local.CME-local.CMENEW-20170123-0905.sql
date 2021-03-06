/*
Run this script on:

        (local).CMENEW    -  This database will be modified

to synchronize it with:

        (local).CME

You are recommended to back up your database before running this script

Script created by SQL Compare version 11.1.3 from Red Gate Software Ltd at 23/01/2017 09:05:27

*/
SET NUMERIC_ROUNDABORT OFF
GO
SET ANSI_PADDING, ANSI_WARNINGS, CONCAT_NULL_YIELDS_NULL, ARITHABORT, QUOTED_IDENTIFIER, ANSI_NULLS ON
GO
SET XACT_ABORT ON
GO
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE
GO
BEGIN TRANSACTION
GO
IF @@ERROR <> 0 SET NOEXEC ON
GO
PRINT N'Dropping extended properties'
GO
EXEC sp_dropextendedproperty N'MS_Description', 'SCHEMA', N'dbo', 'TABLE', N'flowprocessing', 'COLUMN', N'flowstatus'
GO
IF @@ERROR <> 0 SET NOEXEC ON
GO
PRINT N'Dropping foreign keys from [dbo].[enumtypelist]'
GO
ALTER TABLE [dbo].[enumtypelist] DROP CONSTRAINT [FK_enumtypelist_enumtype]
GO
IF @@ERROR <> 0 SET NOEXEC ON
GO
PRINT N'Dropping foreign keys from [dbo].[flowprocessing]'
GO
ALTER TABLE [dbo].[flowprocessing] DROP CONSTRAINT [FK_flowprocessing_areas]
ALTER TABLE [dbo].[flowprocessing] DROP CONSTRAINT [FK_flowprocessing_client]
ALTER TABLE [dbo].[flowprocessing] DROP CONSTRAINT [FK_flowprocessing_flowing]
ALTER TABLE [dbo].[flowprocessing] DROP CONSTRAINT [FK_flowprocessing_instrumentator]
ALTER TABLE [dbo].[flowprocessing] DROP CONSTRAINT [FK_flowprocessing_materialbox]
ALTER TABLE [dbo].[flowprocessing] DROP CONSTRAINT [FK_flowprocessing_material]
ALTER TABLE [dbo].[flowprocessing] DROP CONSTRAINT [FK_flowprocessing_place]
ALTER TABLE [dbo].[flowprocessing] DROP CONSTRAINT [FK_flowprocessing_sterilizationtype]
GO
IF @@ERROR <> 0 SET NOEXEC ON
GO
PRINT N'Dropping foreign keys from [dbo].[flowprocessingstep]'
GO
ALTER TABLE [dbo].[flowprocessingstep] DROP CONSTRAINT [FK_flowprocessingstep_flowprocessing]
GO
IF @@ERROR <> 0 SET NOEXEC ON
GO
PRINT N'Dropping foreign keys from [dbo].[flowprocessingcharge]'
GO
ALTER TABLE [dbo].[flowprocessingcharge] DROP CONSTRAINT [FK_flowprocessingcharge_equipment]
GO
IF @@ERROR <> 0 SET NOEXEC ON
GO
PRINT N'Dropping constraints from [dbo].[flowprocessing]'
GO
ALTER TABLE [dbo].[flowprocessing] DROP CONSTRAINT [PK_flowprocessing]
GO
IF @@ERROR <> 0 SET NOEXEC ON
GO
PRINT N'Dropping constraints from [dbo].[flowprocessing]'
GO
ALTER TABLE [dbo].[flowprocessing] DROP CONSTRAINT [DF_flowprocessing_dateof]
GO
IF @@ERROR <> 0 SET NOEXEC ON
GO
PRINT N'Dropping constraints from [dbo].[flowprocessing]'
GO
ALTER TABLE [dbo].[flowprocessing] DROP CONSTRAINT [DF_flowprocessing_flowstatus]
GO
IF @@ERROR <> 0 SET NOEXEC ON
GO
PRINT N'Dropping index [UQ_flowprocessing] from [dbo].[flowprocessing]'
GO
DROP INDEX [UQ_flowprocessing] ON [dbo].[flowprocessing]
GO
IF @@ERROR <> 0 SET NOEXEC ON
GO
PRINT N'Altering [dbo].[flowprocessingstep]'
GO
IF @@ERROR <> 0 SET NOEXEC ON
GO
ALTER TABLE [dbo].[flowprocessingstep] DROP
COLUMN [cyclestart],
COLUMN [cyclefinal],
COLUMN [typechoice]
GO
IF @@ERROR <> 0 SET NOEXEC ON
GO
PRINT N'Rebuilding [dbo].[flowprocessing]'
GO
CREATE TABLE [dbo].[RG_Recovery_1_flowprocessing]
(
[id] [int] NOT NULL IDENTITY(1, 1),
[sterilizationtypeid] [int] NOT NULL,
[version] [int] NOT NULL,
[areasid] [int] NOT NULL,
[materialid] [int] NOT NULL,
[materialboxid] [int] NULL,
[clientid] [int] NOT NULL,
[username] [varchar] (80) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
[barcode] [varchar] (20) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
[prioritylevel] [char] (1) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
[dateof] [datetime] NOT NULL CONSTRAINT [DF_flowprocessing_dateof] DEFAULT (getdate()),
[dateto] [datetime] NULL,
[surgicalwarning] [varchar] (20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
[patientname] [varchar] (80) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
[flowstatus] [char] (1) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL CONSTRAINT [DF_flowprocessing_flowstatus] DEFAULT ('R'),
[flowtype] [char] (3) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
[boxtype] [char] (3) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
[dataflowstep] [varchar] (max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL
)
GO
IF @@ERROR <> 0 SET NOEXEC ON
GO
SET IDENTITY_INSERT [dbo].[RG_Recovery_1_flowprocessing] ON
GO
IF @@ERROR <> 0 SET NOEXEC ON
GO
INSERT INTO [dbo].[RG_Recovery_1_flowprocessing]([id], [sterilizationtypeid], [version], [areasid], [materialid], [materialboxid], [clientid], [username], [barcode], [prioritylevel], [dateof], [dateto], [surgicalwarning], [patientname], [flowstatus], [dataflowstep]) SELECT [id], [sterilizationtypeid], [version], [areasid], [materialid], [materialboxid], [clientid], [username], [barcode], [prioritylevel], [dateof], [dateto], [surgicalwarning], [patientname], [flowstatus], [dataflowstep] FROM [dbo].[flowprocessing]
GO
IF @@ERROR <> 0 SET NOEXEC ON
GO
SET IDENTITY_INSERT [dbo].[RG_Recovery_1_flowprocessing] OFF
GO
IF @@ERROR <> 0 SET NOEXEC ON
GO
DECLARE @idVal BIGINT
SELECT @idVal = IDENT_CURRENT(N'[dbo].[flowprocessing]')
IF @idVal IS NOT NULL
    DBCC CHECKIDENT(N'[dbo].[RG_Recovery_1_flowprocessing]', RESEED, @idVal)
GO
IF @@ERROR <> 0 SET NOEXEC ON
GO
DROP TABLE [dbo].[flowprocessing]
GO
IF @@ERROR <> 0 SET NOEXEC ON
GO
EXEC sp_rename N'[dbo].[RG_Recovery_1_flowprocessing]', N'flowprocessing', N'OBJECT'
GO
IF @@ERROR <> 0 SET NOEXEC ON
GO
PRINT N'Creating primary key [PK_flowprocessing] on [dbo].[flowprocessing]'
GO
ALTER TABLE [dbo].[flowprocessing] ADD CONSTRAINT [PK_flowprocessing] PRIMARY KEY CLUSTERED  ([id])
GO
IF @@ERROR <> 0 SET NOEXEC ON
GO
PRINT N'Creating index [UQ_flowprocessing] on [dbo].[flowprocessing]'
GO
CREATE UNIQUE NONCLUSTERED INDEX [UQ_flowprocessing] ON [dbo].[flowprocessing] ([barcode])
GO
IF @@ERROR <> 0 SET NOEXEC ON
GO
PRINT N'Altering [dbo].[areas]'
GO
IF @@ERROR <> 0 SET NOEXEC ON
GO
ALTER TABLE [dbo].[areas] ADD
[doscreening] [bit] NOT NULL CONSTRAINT [DF_areas_doscreening] DEFAULT ((0))
GO
IF @@ERROR <> 0 SET NOEXEC ON
GO
PRINT N'Altering [dbo].[flowprocessingcharge]'
GO
IF @@ERROR <> 0 SET NOEXEC ON
GO
ALTER TABLE [dbo].[flowprocessingcharge] DROP
COLUMN [equipmentid]
GO
IF @@ERROR <> 0 SET NOEXEC ON
GO
PRINT N'Altering [dbo].[sterilizationtype]'
GO
IF @@ERROR <> 0 SET NOEXEC ON
GO
ALTER TABLE [dbo].[sterilizationtype] ADD
[flowtype] [char] (3) COLLATE SQL_Latin1_General_CP1_CI_AS NULL CONSTRAINT [DF_sterilizationtype_flowtype] DEFAULT ((1))
GO
IF @@ERROR <> 0 SET NOEXEC ON
GO
PRINT N'Creating [dbo].[printserver]'
GO
CREATE TABLE [dbo].[printserver]
(
[id] [int] NOT NULL IDENTITY(1, 1),
[printlocate] [varchar] (80) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
[description] [varchar] (80) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL
)
GO
IF @@ERROR <> 0 SET NOEXEC ON
GO
PRINT N'Creating primary key [PK_printserver] on [dbo].[printserver]'
GO
ALTER TABLE [dbo].[printserver] ADD CONSTRAINT [PK_printserver] PRIMARY KEY CLUSTERED  ([id])
GO
IF @@ERROR <> 0 SET NOEXEC ON
GO
PRINT N'Adding foreign keys to [dbo].[flowprocessing]'
GO
ALTER TABLE [dbo].[flowprocessing] WITH NOCHECK  ADD CONSTRAINT [FK_flowprocessing_areas] FOREIGN KEY ([areasid]) REFERENCES [dbo].[areas] ([id])
GO
IF @@ERROR <> 0 SET NOEXEC ON
GO
PRINT N'Adding foreign keys to [dbo].[flowprocessing]'
GO
ALTER TABLE [dbo].[flowprocessing] ADD CONSTRAINT [FK_flowprocessing_client] FOREIGN KEY ([clientid]) REFERENCES [dbo].[client] ([id])
ALTER TABLE [dbo].[flowprocessing] ADD CONSTRAINT [FK_flowprocessing_materialbox] FOREIGN KEY ([materialboxid]) REFERENCES [dbo].[materialbox] ([id])
ALTER TABLE [dbo].[flowprocessing] ADD CONSTRAINT [FK_flowprocessing_material] FOREIGN KEY ([materialid]) REFERENCES [dbo].[material] ([id])
ALTER TABLE [dbo].[flowprocessing] ADD CONSTRAINT [FK_flowprocessing_sterilizationtype] FOREIGN KEY ([sterilizationtypeid]) REFERENCES [dbo].[sterilizationtype] ([id])
GO
IF @@ERROR <> 0 SET NOEXEC ON
GO
PRINT N'Adding foreign keys to [dbo].[flowprocessingstep]'
GO
ALTER TABLE [dbo].[flowprocessingstep] ADD CONSTRAINT [FK_flowprocessingstep_flowprocessing] FOREIGN KEY ([flowprocessingid]) REFERENCES [dbo].[flowprocessing] ([id])
GO
IF @@ERROR <> 0 SET NOEXEC ON
GO
PRINT N'Creating extended properties'
GO
EXEC sp_addextendedproperty N'MS_Description', N'Status do Fluxo
R = Registrado
I = Iniciado
E = Encerrado
S = Suspenso
C = Cancelado', 'SCHEMA', N'dbo', 'TABLE', N'flowprocessing', 'COLUMN', N'flowstatus'
GO
IF @@ERROR <> 0 SET NOEXEC ON
GO
COMMIT TRANSACTION
GO
IF @@ERROR <> 0 SET NOEXEC ON
GO
DECLARE @Success AS BIT
SET @Success = 1
SET NOEXEC OFF
IF (@Success = 1) PRINT 'The database update succeeded'
ELSE BEGIN
	IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION
	PRINT 'The database update failed'
END
GO
