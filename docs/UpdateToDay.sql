/*
Run this script on:

        (local).SATOR_PROD    -  This database will be modified

to synchronize it with:

        (local).SATOR_TEST

You are recommended to back up your database before running this script

Script created by SQL Compare version 11.1.3 from Red Gate Software Ltd at 12/07/2016 07:31:37

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
PRINT N'Dropping foreign keys from [dbo].[sterilizationtypeinput]'
GO
ALTER TABLE [dbo].[sterilizationtypeinput] DROP CONSTRAINT [FK_sterilizationtypeinput_input]
ALTER TABLE [dbo].[sterilizationtypeinput] DROP CONSTRAINT [FK_sterilizationtypeinput_sterilizationtype]
GO
IF @@ERROR <> 0 SET NOEXEC ON
GO
PRINT N'Dropping constraints from [dbo].[sterilizationtypeinput]'
GO
ALTER TABLE [dbo].[sterilizationtypeinput] DROP CONSTRAINT [PK_sterilizationtypeinput]
GO
IF @@ERROR <> 0 SET NOEXEC ON
GO
PRINT N'Creating [dbo].[flowprocessing]'
GO
CREATE TABLE [dbo].[flowprocessing]
(
[id] [int] NOT NULL IDENTITY(1, 1),
[sterilizationtypeid] [int] NOT NULL,
[materialboxid] [int] NULL,
[dateof] [datetime] NOT NULL CONSTRAINT [DF_flowprocessing_dateof] DEFAULT (getdate()),
[dateto] [datetime] NULL,
[username] [varchar] (80) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
[prioritylevel] [char] (1) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL
)
GO
IF @@ERROR <> 0 SET NOEXEC ON
GO
PRINT N'Creating primary key [PK_flowprocessing] on [dbo].[flowprocessing]'
GO
ALTER TABLE [dbo].[flowprocessing] ADD CONSTRAINT [PK_flowprocessing] PRIMARY KEY CLUSTERED  ([id])
GO
IF @@ERROR <> 0 SET NOEXEC ON
GO
PRINT N'Creating [dbo].[flowprocessinginput]'
GO
CREATE TABLE [dbo].[flowprocessinginput]
(
[id] [int] NOT NULL IDENTITY(1, 1),
[flowprocessingid] [int] NOT NULL,
[inputpresentationd] [int] NOT NULL,
[ischecked] [bit] NOT NULL CONSTRAINT [DF_flowprocessinginput_ischecked] DEFAULT ((0)),
[presentation] [char] (3) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
[quantity] [decimal] (12, 3) NOT NULL CONSTRAINT [DF_flowprocessinginput_quantity] DEFAULT ((0)),
[datevalidity] [date] NULL,
[lotpart] [varchar] (20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL
)
GO
IF @@ERROR <> 0 SET NOEXEC ON
GO
PRINT N'Creating primary key [PK_flowprocessinginput] on [dbo].[flowprocessinginput]'
GO
ALTER TABLE [dbo].[flowprocessinginput] ADD CONSTRAINT [PK_flowprocessinginput] PRIMARY KEY CLUSTERED  ([id])
GO
IF @@ERROR <> 0 SET NOEXEC ON
GO
PRINT N'Creating [dbo].[flowprocessingmaterial]'
GO
CREATE TABLE [dbo].[flowprocessingmaterial]
(
[id] [int] NOT NULL IDENTITY(1, 1),
[materialid] [int] NOT NULL,
[flowprocessingid] [int] NOT NULL
)
GO
IF @@ERROR <> 0 SET NOEXEC ON
GO
PRINT N'Creating primary key [PK_flowprocessingmaterial] on [dbo].[flowprocessingmaterial]'
GO
ALTER TABLE [dbo].[flowprocessingmaterial] ADD CONSTRAINT [PK_flowprocessingmaterial] PRIMARY KEY CLUSTERED  ([id])
GO
IF @@ERROR <> 0 SET NOEXEC ON
GO
PRINT N'Rebuilding [dbo].[sterilizationtypeinput]'
GO
CREATE TABLE [dbo].[RG_Recovery_1_sterilizationtypeinput]
(
[id] [int] NOT NULL IDENTITY(1, 1),
[sterilizationtypeid] [int] NOT NULL,
[inputpresentationid] [int] NOT NULL,
[presentation] [char] (3) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
[acronym] [char] (3) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL
)
GO
IF @@ERROR <> 0 SET NOEXEC ON
GO
SET IDENTITY_INSERT [dbo].[RG_Recovery_1_sterilizationtypeinput] ON
GO
IF @@ERROR <> 0 SET NOEXEC ON
GO
INSERT INTO [dbo].[RG_Recovery_1_sterilizationtypeinput]([id], [sterilizationtypeid], [inputpresentationid]) SELECT [id], [sterilizationtypeid], [inputid] FROM [dbo].[sterilizationtypeinput]
GO
IF @@ERROR <> 0 SET NOEXEC ON
GO
SET IDENTITY_INSERT [dbo].[RG_Recovery_1_sterilizationtypeinput] OFF
GO
IF @@ERROR <> 0 SET NOEXEC ON
GO
DECLARE @idVal BIGINT
SELECT @idVal = IDENT_CURRENT(N'[dbo].[sterilizationtypeinput]')
IF @idVal IS NOT NULL
    DBCC CHECKIDENT(N'[dbo].[RG_Recovery_1_sterilizationtypeinput]', RESEED, @idVal)
GO
IF @@ERROR <> 0 SET NOEXEC ON
GO
DROP TABLE [dbo].[sterilizationtypeinput]
GO
IF @@ERROR <> 0 SET NOEXEC ON
GO
EXEC sp_rename N'[dbo].[RG_Recovery_1_sterilizationtypeinput]', N'sterilizationtypeinput', N'OBJECT'
GO
IF @@ERROR <> 0 SET NOEXEC ON
GO
PRINT N'Creating primary key [PK_sterilizationtypeinput] on [dbo].[sterilizationtypeinput]'
GO
ALTER TABLE [dbo].[sterilizationtypeinput] ADD CONSTRAINT [PK_sterilizationtypeinput] PRIMARY KEY CLUSTERED  ([id])
GO
IF @@ERROR <> 0 SET NOEXEC ON
GO
PRINT N'Adding foreign keys to [dbo].[flowprocessinginput]'
GO
ALTER TABLE [dbo].[flowprocessinginput] ADD CONSTRAINT [FK_flowprocessinginput_flowprocessing] FOREIGN KEY ([flowprocessingid]) REFERENCES [dbo].[flowprocessing] ([id])
ALTER TABLE [dbo].[flowprocessinginput] ADD CONSTRAINT [FK_flowprocessinginput_inputpresentation] FOREIGN KEY ([inputpresentationd]) REFERENCES [dbo].[inputpresentation] ([id])
GO
IF @@ERROR <> 0 SET NOEXEC ON
GO
PRINT N'Adding foreign keys to [dbo].[flowprocessingmaterial]'
GO
ALTER TABLE [dbo].[flowprocessingmaterial] ADD CONSTRAINT [FK_flowprocessingmaterial_flowprocessing] FOREIGN KEY ([flowprocessingid]) REFERENCES [dbo].[flowprocessing] ([id])
ALTER TABLE [dbo].[flowprocessingmaterial] ADD CONSTRAINT [FK_flowprocessingmaterial_material] FOREIGN KEY ([materialid]) REFERENCES [dbo].[material] ([id])
GO
IF @@ERROR <> 0 SET NOEXEC ON
GO
PRINT N'Adding foreign keys to [dbo].[flowprocessing]'
GO
ALTER TABLE [dbo].[flowprocessing] ADD CONSTRAINT [FK_flowprocessing_sterilizationtype] FOREIGN KEY ([sterilizationtypeid]) REFERENCES [dbo].[sterilizationtype] ([id])
ALTER TABLE [dbo].[flowprocessing] ADD CONSTRAINT [FK_flowprocessing_materialbox] FOREIGN KEY ([materialboxid]) REFERENCES [dbo].[materialbox] ([id])
GO
IF @@ERROR <> 0 SET NOEXEC ON
GO
PRINT N'Adding foreign keys to [dbo].[sterilizationtypeinput]'
GO
ALTER TABLE [dbo].[sterilizationtypeinput] ADD CONSTRAINT [FK_sterilizationtypeinput_inputpresentation] FOREIGN KEY ([inputpresentationid]) REFERENCES [dbo].[inputpresentation] ([id])
ALTER TABLE [dbo].[sterilizationtypeinput] ADD CONSTRAINT [FK_sterilizationtypeinput_sterilizationtype] FOREIGN KEY ([sterilizationtypeid]) REFERENCES [dbo].[sterilizationtype] ([id])
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
