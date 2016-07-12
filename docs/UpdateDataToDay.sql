/*
Run this script on:

(local).SATOR_PROD    -  This database will be modified

to synchronize it with:

(local).SATOR_TEST

You are recommended to back up your database before running this script

Script created by SQL Data Compare version 11.1.3 from Red Gate Software Ltd at 12/07/2016 07:34:19

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

PRINT(N'Drop constraints from [dbo].[modulemenu]')
ALTER TABLE [dbo].[modulemenu] DROP CONSTRAINT [FK_modulemenu_menu]
ALTER TABLE [dbo].[modulemenu] DROP CONSTRAINT [FK_modulemenu_module]

PRINT(N'Drop constraint FK_menuaction_menu from [dbo].[menuaction]')
ALTER TABLE [dbo].[menuaction] DROP CONSTRAINT [FK_menuaction_menu]

PRINT(N'Drop constraint FK_profilemenu_menu from [dbo].[profilemenu]')
ALTER TABLE [dbo].[profilemenu] DROP CONSTRAINT [FK_profilemenu_menu]

PRINT(N'Drop constraint FK_usersmenu_menu from [dbo].[usersmenu]')
ALTER TABLE [dbo].[usersmenu] DROP CONSTRAINT [FK_usersmenu_menu]

PRINT(N'Add row to [dbo].[menu]')
SET IDENTITY_INSERT [dbo].[menu] ON
INSERT INTO [dbo].[menu] ([id], [name], [description], [router], [glyph], [available], [guid], [isactive], [menutype]) VALUES (39, 'Processamento', 'Cadastro de Processamentos Realizados', 'flowprocessingview', 'fa fa-life-ring', ',2,', 'D5FB3807-DC01-4AE9-8639-F156BDB5561F', 1, 'tpTree')
SET IDENTITY_INSERT [dbo].[menu] OFF

PRINT(N'Add rows to [dbo].[modulemenu]')
SET IDENTITY_INSERT [dbo].[modulemenu] ON
INSERT INTO [dbo].[modulemenu] ([id], [parentid], [glyph], [moduleid], [menuid], [name], [orderby]) VALUES (67, NULL, 'fa fa-retweet', 2, NULL, 'Processos', 0.01)
INSERT INTO [dbo].[modulemenu] ([id], [parentid], [glyph], [moduleid], [menuid], [name], [orderby]) VALUES (68, 67, NULL, 2, 39, '67', 0.00)
SET IDENTITY_INSERT [dbo].[modulemenu] OFF
PRINT(N'Operation applied to 2 rows out of 2')

PRINT(N'Add constraints to [dbo].[modulemenu]')
ALTER TABLE [dbo].[modulemenu] ADD CONSTRAINT [FK_modulemenu_menu] FOREIGN KEY ([menuid]) REFERENCES [dbo].[menu] ([id])
ALTER TABLE [dbo].[modulemenu] ADD CONSTRAINT [FK_modulemenu_module] FOREIGN KEY ([moduleid]) REFERENCES [dbo].[module] ([id])

PRINT(N'Add constraint FK_menuaction_menu to [dbo].[menuaction]')
ALTER TABLE [dbo].[menuaction] WITH NOCHECK ADD CONSTRAINT [FK_menuaction_menu] FOREIGN KEY ([menuid]) REFERENCES [dbo].[menu] ([id])

PRINT(N'Add constraint FK_profilemenu_menu to [dbo].[profilemenu]')
ALTER TABLE [dbo].[profilemenu] WITH NOCHECK ADD CONSTRAINT [FK_profilemenu_menu] FOREIGN KEY ([menuid]) REFERENCES [dbo].[menu] ([id])

PRINT(N'Add constraint FK_usersmenu_menu to [dbo].[usersmenu]')
ALTER TABLE [dbo].[usersmenu] WITH NOCHECK ADD CONSTRAINT [FK_usersmenu_menu] FOREIGN KEY ([menuid]) REFERENCES [dbo].[menu] ([id])
COMMIT TRANSACTION
GO
