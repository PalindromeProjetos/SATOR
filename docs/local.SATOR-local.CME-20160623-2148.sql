/*
Run this script on:

(local).CME    -  This database will be modified

to synchronize it with:

(local).SATOR

You are recommended to back up your database before running this script

Script created by SQL Data Compare version 11.1.3 from Red Gate Software Ltd at 23/06/2016 21:47:41

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

PRINT(N'Drop constraints from [dbo].[menuaction]')
ALTER TABLE [dbo].[menuaction] DROP CONSTRAINT [FK_menuaction_action]
ALTER TABLE [dbo].[menuaction] DROP CONSTRAINT [FK_menuaction_menu]

PRINT(N'Update rows in [dbo].[menuaction]')
UPDATE [dbo].[menuaction] SET [menuid]=16, [actionid]=10 WHERE [id]=83
UPDATE [dbo].[menuaction] SET [actionid]=1 WHERE [id]=84
UPDATE [dbo].[menuaction] SET [actionid]=3 WHERE [id]=85
PRINT(N'Operation applied to 3 rows out of 3')

PRINT(N'Add rows to [dbo].[action]')
SET IDENTITY_INSERT [dbo].[action] ON
INSERT INTO [dbo].[action] ([id], [directive], [description], [guid], [isactive], [negation]) VALUES (11, 'INSERT_MATERIALBOXTARGE', 'Inserir Cor no  Esquema de Cores', '74AE05EE-E510-4F49-9723-E705C06DD2F5', 1, 'Não existe permissão habilitada para esta ação no seu perfil!')
INSERT INTO [dbo].[action] ([id], [directive], [description], [guid], [isactive], [negation]) VALUES (12, 'UPDATE_MATERIALBOXTARGE', 'Atualizar Cor no  Esquema de Cores', '156557F3-C5AC-41F6-985A-EE3EF7A81C37', 1, 'Não existe permissão habilitada para esta ação no seu perfil!')
INSERT INTO [dbo].[action] ([id], [directive], [description], [guid], [isactive], [negation]) VALUES (13, 'INSERT_MATERIALBOXITEM', 'Inserir Material no Kit', 'C6348B3C-06D5-4C10-9264-4B0EC582E8D5', 1, 'Não existe permissão habilitada para esta ação no seu perfil!')
INSERT INTO [dbo].[action] ([id], [directive], [description], [guid], [isactive], [negation]) VALUES (14, 'UPDATE_MATERIALBOXITEM', 'Atualizar Material no Kit', '0E6B5DF9-66C0-4801-B7A8-704290FEAFDC', 1, 'Não existe permissão habilitada para esta ação no seu perfil!')
INSERT INTO [dbo].[action] ([id], [directive], [description], [guid], [isactive], [negation]) VALUES (15, 'DELETE_MATERIALBOXITEM', 'Remover Material no Kit', '6E285F8A-DB3D-4CE0-8ACC-E8B86C9735F3', 1, 'Não existe permissão habilitada para esta ação no seu perfil!')
SET IDENTITY_INSERT [dbo].[action] OFF
PRINT(N'Operation applied to 5 rows out of 5')

PRINT(N'Add rows to [dbo].[enumtype]')
SET IDENTITY_INSERT [dbo].[enumtype] ON
INSERT INTO [dbo].[enumtype] ([id], [name], [description], [observation], [reserved]) VALUES (1, 'gender', 'Sexo', 'Listar gêneros sexuais', 1)
INSERT INTO [dbo].[enumtype] ([id], [name], [description], [observation], [reserved]) VALUES (2, 'addresstype', 'Tipo de Endereço', 'Listar tipos de endereço', 1)
INSERT INTO [dbo].[enumtype] ([id], [name], [description], [observation], [reserved]) VALUES (3, 'maritalstatus', 'Estado Civil', 'Listar estado civil
S = Solteiro
C = Casado
D = Divorciado', 0)
INSERT INTO [dbo].[enumtype] ([id], [name], [description], [observation], [reserved]) VALUES (4, 'linetype', 'Tipo de Linha Telefonica', 'Listar Tipo de Linha Telefonica', 1)
INSERT INTO [dbo].[enumtype] ([id], [name], [description], [observation], [reserved]) VALUES (5, 'phonetype', 'Tipo de Telefone', 'Listar Tipo de Telefone', 1)
INSERT INTO [dbo].[enumtype] ([id], [name], [description], [observation], [reserved]) VALUES (6, 'typeperson', 'Tipo de Pessoa', 'Tipo de Pessoa F - Física J - Jurídica T - Todas', 1)
INSERT INTO [dbo].[enumtype] ([id], [name], [description], [observation], [reserved]) VALUES (7, 'racecolor', 'Raça/Cor', 'Listar raça /  cor', 0)
INSERT INTO [dbo].[enumtype] ([id], [name], [description], [observation], [reserved]) VALUES (9, 'bank', 'Bancos', 'Listar bancos', 0)
INSERT INTO [dbo].[enumtype] ([id], [name], [description], [observation], [reserved]) VALUES (10, 'accounttype', 'Tipo de Conta', 'Listar tipos de contas', 1)
INSERT INTO [dbo].[enumtype] ([id], [name], [description], [observation], [reserved]) VALUES (11, 'phoneoperator', 'Operadora', 'Listar operador de telefonia', 0)
INSERT INTO [dbo].[enumtype] ([id], [name], [description], [observation], [reserved]) VALUES (12, 'doctorstatus', 'Status do Profissional', 'Listar status do profissional', 1)
INSERT INTO [dbo].[enumtype] ([id], [name], [description], [observation], [reserved]) VALUES (13, 'bondtype', 'Tipo de Ligação Contratante', 'Listar tipos de ligação', 1)
INSERT INTO [dbo].[enumtype] ([id], [name], [description], [observation], [reserved]) VALUES (16, 'subunit', 'SubUnidade', 'Listar sub unidades', 0)
INSERT INTO [dbo].[enumtype] ([id], [name], [description], [observation], [reserved]) VALUES (17, 'shift', 'Turno', 'Listar turnos', 1)
INSERT INTO [dbo].[enumtype] ([id], [name], [description], [observation], [reserved]) VALUES (18, 'dutytype', 'Tipo de Turnos', 'Listar tipos de turnos', 1)
INSERT INTO [dbo].[enumtype] ([id], [name], [description], [observation], [reserved]) VALUES (19, 'holidaytype', 'Tipo de Feriado', 'Listar tipos de feriados', 1)
INSERT INTO [dbo].[enumtype] ([id], [name], [description], [observation], [reserved]) VALUES (20, 'additivestatus', 'Estado do Aditivo', 'Listar estados dos aditivos', 1)
INSERT INTO [dbo].[enumtype] ([id], [name], [description], [observation], [reserved]) VALUES (21, 'shifttype', 'Tipo de Plantão', 'Listar tipos de plantões', 0)
INSERT INTO [dbo].[enumtype] ([id], [name], [description], [observation], [reserved]) VALUES (22, 'weekday', 'Dias da Semana', 'Listar dias da semana', 1)
INSERT INTO [dbo].[enumtype] ([id], [name], [description], [observation], [reserved]) VALUES (23, 'mobiledigit', 'Máscara para Celular', 'Listar mascaras para telefones celulares', 0)
INSERT INTO [dbo].[enumtype] ([id], [name], [description], [observation], [reserved]) VALUES (24, 'allocationschema', 'Esquema de Atribuição', 'Listar esquemas de atribuição', 0)
INSERT INTO [dbo].[enumtype] ([id], [name], [description], [observation], [reserved]) VALUES (25, 'releasetype', 'Tipo de Lançamento', 'Listar tipos de lançamentos', 1)
INSERT INTO [dbo].[enumtype] ([id], [name], [description], [observation], [reserved]) VALUES (26, 'allocationtype', 'Tipo de Atribuição da Unidade', 'Listar tipos de atribuições da unidade', 1)
SET IDENTITY_INSERT [dbo].[enumtype] OFF
PRINT(N'Operation applied to 23 rows out of 23')

PRINT(N'Add rows to [dbo].[enumtypelist]')
SET IDENTITY_INSERT [dbo].[enumtypelist] ON
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (1, 1, 'M', 'Masculino', NULL, 0, 0)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (2, 1, 'F', 'Feminino', NULL, 0, 0)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (3, 7, '001', 'Branco', NULL, 0, 0)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (4, 7, '002', 'Negro', NULL, 0, 0)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (5, 7, '003', 'Pardo', NULL, 0, 0)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (6, 7, '004', 'Amarelo', NULL, 0, 0)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (7, 7, '005', 'Indígena', NULL, 0, 0)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (10, 4, 'F', 'Fixo', 'Telefone fixo', 0, 0)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (11, 4, 'C', 'Celular', 'Telefone celular', 0, 0)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (12, 5, 'C', 'Comercial', 'Telefone comercial', 0, 0)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (13, 5, 'P', 'Particular', 'Telefone particular', 0, 0)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (14, 9, '1', 'Banco do Brasil', NULL, 0, 0)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (15, 9, '237', 'Banco Bradesco', NULL, 0, 0)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (16, 9, '339', 'Banco HSBC', NULL, 0, 0)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (17, 10, 'C', 'Conta Corrente', NULL, 0, 0)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (18, 10, 'P', 'Conta Poupança', NULL, 0, 0)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (19, 10, 'S', 'Conta Salário', NULL, 0, 0)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (20, 11, '021', 'Claro', NULL, 0, 0)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (21, 11, '031', 'Oi', NULL, 0, 0)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (22, 11, '015', 'Vivo', NULL, 0, 0)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (23, 11, '041', 'TIM', NULL, 0, 0)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (24, 11, '025', 'GVT', NULL, 0, 0)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (25, 3, 'S', 'Solteiro', NULL, 0, 0)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (26, 3, 'C', 'Casado', NULL, 0, 0)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (27, 3, 'D', 'Divorciado', NULL, 0, 0)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (28, 12, 'A', 'Ativo', NULL, 0, 0)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (29, 12, 'S', 'Suspenso', NULL, 0, 0)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (30, 12, 'F', 'Falecido', NULL, 0, 0)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (31, 12, 'I', 'Inativo', NULL, 0, 0)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (32, 13, 'C', 'Contrato', NULL, 0, 0)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (33, 13, 'V', 'Convênio', NULL, 0, 0)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (34, 13, 'P', 'Plantão', NULL, 0, 0)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (45, 16, '001', 'SESUMED', 'Órgão Municipal de Saúde', 0, 0)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (46, 16, '002', 'MAGSCAN', 'Clínica', 0, 0)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (47, 16, '003', 'CARDIACA', 'Unidade Cardíaca', 0, 0)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (48, 16, '004', 'HEMODINAMICA', 'ELETROFISIOLOGIA', 0, 0)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (49, 16, '005', 'ELETROFISIOLOGIA', 'Unidade Neuro', 0, 0)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (50, 17, 'D', 'Diurno', NULL, 0, 0)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (51, 17, 'N', 'Noturno', NULL, 0, 0)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (52, 18, 'I', 'Integral', 'Corresponde a um periodo initerrupto de 12hs', 0, 0)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (53, 18, 'F', 'Fração', 'Fração de 12hs', 0, 0)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (54, 19, 'F', 'Feriado Fixo', NULL, 0, 0)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (55, 19, 'V', 'Feriado Variável', NULL, 0, 0)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (56, 20, 'P', 'Pendente', NULL, 0, 0)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (57, 20, 'A', 'Ativo', NULL, 0, 0)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (58, 20, 'I', 'Inativo', NULL, 0, 0)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (59, 6, 'F', 'Física', NULL, 0, 0)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (60, 6, 'J', 'Jurídica', NULL, 0, 0)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (61, 16, '000', 'PLANTÕES', 'GERAL E VASCULAR', 0, 0)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (87, 11, '022', 'NET', NULL, 0, 0)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (88, 7, '099', 'Sem Informação', NULL, 0, 0)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (89, 21, '001', 'PLANTÕES NORMAIS', NULL, 0, 1)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (90, 21, '002', 'PLANTÕES CARDIACA', NULL, 0, 2)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (93, 9, '341', 'Banco Itaú', NULL, 0, 0)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (94, 22, 'sun', 'Domingo', NULL, 0, 0)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (95, 22, 'mon', 'Segunda', NULL, 0, 1)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (96, 22, 'tue', 'Terça', NULL, 0, 2)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (97, 22, 'wed', 'Quarta', NULL, 0, 3)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (98, 22, 'thu', 'Quinta', NULL, 0, 4)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (99, 22, 'fri', 'Sexta', NULL, 0, 5)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (100, 22, 'sat', 'Sábado', NULL, 0, 6)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (101, 23, '092', '99999-9999', NULL, 0, 0)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (102, 23, '097', '99999-9999', NULL, 0, 0)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (103, 24, '001', 'Giro Vertical', NULL, 0, 1)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (104, 24, '002', 'Giro Horizontal', NULL, 0, 2)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (105, 24, '003', 'Giro SubUnidade', NULL, 0, 3)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (106, 24, '004', 'Captar C#01', NULL, 0, 4)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (107, 24, '005', 'Captar C#02', NULL, 0, 5)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (108, 24, '006', 'Captar C#03', NULL, 0, 6)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (109, 24, '007', 'Captar H#01', NULL, 0, 7)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (110, 24, '008', 'Captar H#02', NULL, 0, 8)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (111, 24, '009', 'Captar N#01', NULL, 0, 9)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (112, 24, '010', 'Extra FDS', NULL, 0, 10)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (113, 24, '011', 'Socio Fixo', NULL, 0, 11)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (114, 24, '012', 'Giro UnidadeDiurno', NULL, 0, 12)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (115, 24, '013', 'Giro UnidadeNoturno', NULL, 0, 13)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (116, 25, 'C', 'Processado', NULL, 0, 1)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (117, 25, 'M', 'Manual', NULL, 0, 2)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (118, 24, '014', 'Plantão Parenteses', NULL, 0, 14)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (119, 26, '000', 'Giro Vertical Unidade - P1', 'Giro vertical da unidade após o processamento', 0, 0)
INSERT INTO [dbo].[enumtypelist] ([id], [enumtypeid], [code], [description], [observation], [isactive], [orderby]) VALUES (120, 26, '001', 'Giro Vertical Unidade - P2', 'Giro vertical da unidade após o processamento Passo Dois', 0, 1)
SET IDENTITY_INSERT [dbo].[enumtypelist] OFF
PRINT(N'Operation applied to 81 rows out of 81')

PRINT(N'Add row to [dbo].[menu]')
SET IDENTITY_INSERT [dbo].[menu] ON
INSERT INTO [dbo].[menu] ([id], [name], [description], [router], [glyph], [available], [guid], [isactive], [menutype]) VALUES (37, 'Apresentação Insumo', 'Cadastro Apresentação Insumo', 'unitmeasurementedit', 'fa fa-random', ',1,', '8ACCF18A-58BE-451A-A659-8A2ED08F1620', 1, 'tpDock')
SET IDENTITY_INSERT [dbo].[menu] OFF

PRINT(N'Add rows to [dbo].[menuaction]')
SET IDENTITY_INSERT [dbo].[menuaction] ON
INSERT INTO [dbo].[menuaction] ([id], [menuid], [actionid]) VALUES (86, 36, 4)
INSERT INTO [dbo].[menuaction] ([id], [menuid], [actionid]) VALUES (87, 36, 10)
INSERT INTO [dbo].[menuaction] ([id], [menuid], [actionid]) VALUES (88, 36, 11)
INSERT INTO [dbo].[menuaction] ([id], [menuid], [actionid]) VALUES (89, 36, 12)
INSERT INTO [dbo].[menuaction] ([id], [menuid], [actionid]) VALUES (90, 36, 13)
INSERT INTO [dbo].[menuaction] ([id], [menuid], [actionid]) VALUES (91, 36, 14)
INSERT INTO [dbo].[menuaction] ([id], [menuid], [actionid]) VALUES (92, 36, 15)
INSERT INTO [dbo].[menuaction] ([id], [menuid], [actionid]) VALUES (93, 37, 1)
INSERT INTO [dbo].[menuaction] ([id], [menuid], [actionid]) VALUES (94, 37, 3)
INSERT INTO [dbo].[menuaction] ([id], [menuid], [actionid]) VALUES (95, 37, 4)
SET IDENTITY_INSERT [dbo].[menuaction] OFF
PRINT(N'Operation applied to 10 rows out of 10')

PRINT(N'Add constraints to [dbo].[menuaction]')
ALTER TABLE [dbo].[menuaction] ADD CONSTRAINT [FK_menuaction_action] FOREIGN KEY ([actionid]) REFERENCES [dbo].[action] ([id])
ALTER TABLE [dbo].[menuaction] ADD CONSTRAINT [FK_menuaction_menu] FOREIGN KEY ([menuid]) REFERENCES [dbo].[menu] ([id])
COMMIT TRANSACTION
GO
