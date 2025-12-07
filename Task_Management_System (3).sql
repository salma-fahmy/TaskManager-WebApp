--  Disable row count messages to prevent number of rows affected messages f
SET NOCOUNT ON;


--  Drop old tables if they already exist to avoid conflicts when re-creating them
IF OBJECT_ID('dbo.Attachments','U') IS NOT NULL DROP TABLE dbo.Attachments;
IF OBJECT_ID('dbo.Comments','U') IS NOT NULL DROP TABLE dbo.Comments;
IF OBJECT_ID('dbo.Tasks','U') IS NOT NULL DROP TABLE dbo.Tasks;
IF OBJECT_ID('dbo.Project_Members','U') IS NOT NULL DROP TABLE dbo.Project_Members;
IF OBJECT_ID('dbo.Projects','U') IS NOT NULL DROP TABLE dbo.Projects;
IF OBJECT_ID('dbo.Notifications','U') IS NOT NULL DROP TABLE dbo.Notifications;
IF OBJECT_ID('dbo.Users','U') IS NOT NULL DROP TABLE dbo.Users;


--  Users Table
CREATE TABLE dbo.Users (
    User_ID      INT IDENTITY(1,1) PRIMARY KEY,   -- Auto-incremented primary key for each user
    Name         NVARCHAR(200) NOT NULL,          -- Full name of the user, cannot be null
    Email        NVARCHAR(255) NOT NULL UNIQUE,   -- User email, must be unique
    Password     NVARCHAR(500) NOT NULL,          -- password for security
    Role         NVARCHAR(50) NOT NULL,           -- User role ( Manager, Employee)
    Created_At   DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(), -- Record creation timestamp
    Updated_At   DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()  -- Last update timestamp
);


--  Projects Table
CREATE TABLE dbo.Projects (
    Project_ID    INT IDENTITY(1,1) PRIMARY KEY,  -- Auto-incremented primary key for each project
    Title         NVARCHAR(300) NOT NULL,         -- Project title
    Description   NVARCHAR(MAX) NULL,             -- Detailed description (optional)
    Start_Date    DATE NULL,                       -- Project start date (optional)
    End_Date      DATE NULL,                       -- Project end date (optional)
    Status        NVARCHAR(50) NOT NULL DEFAULT 'New', -- Current status, default 'New'
    Created_At    DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(), -- Timestamp when created
    Updated_At    DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(), -- Timestamp when updated
    Owner_ID      INT NOT NULL,                   -- ID of the user who owns the project

    -- Foreign key constraint linking Project Owner to Users table
    CONSTRAINT FK_Projects_Owner 
    FOREIGN KEY (Owner_ID) REFERENCES dbo.Users(User_ID)
);


--  Project Members Table (Many-to-Many relationship between Users and Projects)
CREATE TABLE dbo.Project_Members (
    Project_ID        INT NOT NULL,               -- Project reference
    User_ID           INT NOT NULL,               -- User reference
    Joined_At         DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(), -- When the user joined the project
    Role_in_Project   NVARCHAR(100) NULL,        -- Optional role within the project

    CONSTRAINT PK_Project_Members PRIMARY KEY (Project_ID, User_ID), -- Composite primary key

    -- Foreign key linking to Projects table
    CONSTRAINT FK_PM_Project 
    FOREIGN KEY (Project_ID) REFERENCES dbo.Projects(Project_ID) ON DELETE CASCADE,

    -- Foreign key linking to Users table
    CONSTRAINT FK_PM_User 
    FOREIGN KEY (User_ID) REFERENCES dbo.Users(User_ID) ON DELETE CASCADE
);


--  Tasks Table
CREATE TABLE dbo.Tasks (
    Task_ID      INT IDENTITY(1,1) PRIMARY KEY,  -- Auto-incremented task ID
    Title        NVARCHAR(300) NOT NULL,         -- Task title
    Description  NVARCHAR(MAX) NULL,             -- Task details
    Status       NVARCHAR(50) NOT NULL DEFAULT 'Open', -- Task status
    Priority     NVARCHAR(50) NOT NULL DEFAULT 'Normal', -- Priority level
    Due_Date     DATE NULL,                       -- Task due date (optional)
    Created_At   DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    Updated_At   DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    Project_ID   INT NOT NULL,                    -- The project this task belongs to
    Assigned_To  INT NOT NULL,                    -- User assigned to this task

    -- Foreign key linking task to project
    CONSTRAINT FK_Tasks_Project 
    FOREIGN KEY (Project_ID) REFERENCES dbo.Projects(Project_ID) ON DELETE CASCADE,

    -- Foreign key linking task to assigned user
    CONSTRAINT FK_Tasks_AssignedTo 
    FOREIGN KEY (Assigned_To) REFERENCES dbo.Users(User_ID)
);


--  Comments Table (comments on tasks)
CREATE TABLE dbo.Comments (
    Comment_ID   INT IDENTITY(1,1) PRIMARY KEY,  -- Auto-incremented comment ID
    Comment_Text NVARCHAR(MAX) NOT NULL,         -- Actual comment content
    Created_At   DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    Task_ID      INT NOT NULL,                   -- Task reference
    User_ID      INT NOT NULL,                   -- User who wrote the comment

    -- Foreign key linking comment to task
    CONSTRAINT FK_Comments_Task 
    FOREIGN KEY (Task_ID) REFERENCES dbo.Tasks(Task_ID) ON DELETE CASCADE,

    -- Foreign key linking comment to user
    CONSTRAINT FK_Comments_User 
    FOREIGN KEY (User_ID) REFERENCES dbo.Users(User_ID)
);


--  Attachments Table (file attachments for tasks)
CREATE TABLE dbo.Attachments (
    Attachment_ID INT IDENTITY(1,1) PRIMARY KEY, -- Auto-incremented attachment ID
    File_Name     NVARCHAR(400) NOT NULL,        -- Original file name
    File_URL      NVARCHAR(2000) NOT NULL,       -- Path/URL to the stored file
    Uploaded_At   DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    Task_ID       INT NOT NULL,                  -- Task reference

    -- Foreign key linking attachment to task
    CONSTRAINT FK_Attachments_Task 
    FOREIGN KEY (Task_ID) REFERENCES dbo.Tasks(Task_ID) ON DELETE CASCADE
);


--  Notifications Table
CREATE TABLE dbo.Notifications (
    Notification_ID INT IDENTITY(1,1) PRIMARY KEY, -- Auto-incremented notification ID
    Message        NVARCHAR(MAX) NOT NULL,         -- Notification message
    Is_Read        BIT NOT NULL DEFAULT 0,         -- Flag to indicate if user has read it
    Created_At     DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    User_ID        INT NOT NULL,                   -- User to notify

    -- Foreign key linking notification to user
    CONSTRAINT FK_Notifications_User 
    FOREIGN KEY (User_ID) REFERENCES dbo.Users(User_ID) ON DELETE CASCADE
);


--  Trigger: Ensure Project Owner is a Manager
-- This trigger prevents inserting/updating a project with a non-manager owner
IF OBJECT_ID('dbo.trg_Projects_EnsureOwnerIsManager','TR') IS NOT NULL
    DROP TRIGGER dbo.trg_Projects_EnsureOwnerIsManager;
GO

CREATE TRIGGER dbo.trg_Projects_EnsureOwnerIsManager
ON dbo.Projects
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Check if the Owner_ID exists and has role 'MANAGER'
    IF EXISTS(
        SELECT 1
        FROM inserted i
        LEFT JOIN dbo.Users u ON i.Owner_ID = u.User_ID
        WHERE u.User_ID IS NULL OR UPPER(LTRIM(RTRIM(u.Role))) <> 'MANAGER'
    )
    BEGIN
        RAISERROR('Project Owner must exist and have Role = MANAGER.',16,1);
        ROLLBACK TRANSACTION; -- Undo the insert/update
        RETURN;
    END
END;
GO


--  Trigger: Auto-update Updated_At in Projects table on UPDATE
IF OBJECT_ID('dbo.trg_Projects_SetUpdatedAt','TR') IS NOT NULL
    DROP TRIGGER dbo.trg_Projects_SetUpdatedAt;
GO

CREATE TRIGGER dbo.trg_Projects_SetUpdatedAt
ON dbo.Projects
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Skip if Updated_At is manually updated
    IF UPDATE(Updated_At)
        RETURN;

    -- Otherwise, set Updated_At to current UTC datetime
    UPDATE p
    SET Updated_At = SYSUTCDATETIME()
    FROM dbo.Projects p
    INNER JOIN inserted i ON p.Project_ID = i.Project_ID;
END;
GO


--  Trigger: Auto-update Updated_At in Tasks table on UPDATE
IF OBJECT_ID('dbo.trg_Tasks_SetUpdatedAt','TR') IS NOT NULL
    DROP TRIGGER dbo.trg_Tasks_SetUpdatedAt;
GO

CREATE TRIGGER dbo.trg_Tasks_SetUpdatedAt
ON dbo.Tasks
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Skip if Updated_At is manually updated
    IF UPDATE(Updated_At)
        RETURN;

    -- Otherwise, update Updated_At automatically
    UPDATE t
    SET Updated_At = SYSUTCDATETIME()
    FROM dbo.Tasks t
    INNER JOIN inserted i ON t.Task_ID = i.Task_ID;
END;
GO


--  Helpful Indexes for faster queries on foreign keys
CREATE INDEX IX_Projects_Owner ON dbo.Projects(Owner_ID);
CREATE INDEX IX_Tasks_Project ON dbo.Tasks(Project_ID);
CREATE INDEX IX_Tasks_AssignedTo ON dbo.Tasks(Assigned_To);
CREATE INDEX IX_Comments_Task ON dbo.Comments(Task_ID);
CREATE INDEX IX_Notifications_User ON dbo.Notifications(User_ID);


--  Reset Password Columns Update
USE TaskManagement;
GO

-- Drop old columns if they exist
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'resetPasswordExpires')
BEGIN
    ALTER TABLE Users DROP COLUMN resetPasswordExpires;
END
GO

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'resetPasswordToken')
BEGIN
    ALTER TABLE Users DROP COLUMN resetPasswordToken;
END
GO

-- Add new columns
ALTER TABLE Users ADD resetPasswordToken NVARCHAR(255) NULL;
ALTER TABLE Users ADD resetPasswordExpires DATETIME2 NULL;
GO


-- Update Task Status Values to standardize statuses
SELECT DISTINCT Status FROM Tasks;

UPDATE Tasks SET Status = 'To-Do' WHERE Status = 'pending';
UPDATE Tasks SET Status = 'In Progress' WHERE Status = 'in-progress';
UPDATE Tasks SET Status = 'Done' WHERE Status = 'completed' OR Status = 'done';


--  Final Trigger Version (Update Only)
DROP TRIGGER IF EXISTS dbo.trg_Projects_EnsureOwnerIsManager;
GO

CREATE TRIGGER dbo.trg_Projects_EnsureOwnerIsManager
ON dbo.Projects
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Only check the Owner role on update
    IF EXISTS (
        SELECT 1
        FROM inserted i
        LEFT JOIN dbo.Users u ON i.Owner_ID = u.User_ID
        WHERE UPPER(LTRIM(RTRIM(u.Role))) <> 'MANAGER'
    )
    BEGIN
        ROLLBACK TRANSACTION; -- Rollback if not manager
        THROW 50001, 'Project Owner must have Role = Manager.', 1;
    END
END;
GO
