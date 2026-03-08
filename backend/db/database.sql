-- Users Table 
CREATE TABLE Users (
    email VARCHAR(255) PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    dept VARCHAR(255),
    designation VARCHAR(255),
    role VARCHAR(255),
    phone_number VARCHAR(10)
);

-- Events Table
CREATE TABLE Event (
    event_id SERIAL PRIMARY KEY,
    event_title VARCHAR(255) NOT NULL,
    organised_by VARCHAR(255),
    organiser_name VARCHAR(255),
    category VARCHAR(255),
    faculty_incharge_email VARCHAR(255) REFERENCES Users(email),
    start_date DATE,
    end_date DATE,
    approval_status VARCHAR(255),
    approval_document_url TEXT,
    halls_booked JSON,   -- flexible JSON
    sponsors JSON,       -- flexible JSON
    stalls JSON,         -- flexible JSON
    banners JSON         -- flexible JSON
);

ALTER TABLE Event
ADD COLUMN event_description TEXT;

ALTER TABLE Users
ADD COLUMN name VARCHAR(255);

ALTER TABLE Event
ADD COLUMN created_at TIMESTAMP DEFAULT NOW();

ALTER TABLE Event
ADD COLUMN expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '7 days');

CREATE UNIQUE INDEX unique_date_range
ON Event(start_date, end_date)
WHERE approval_status IN ('pending', 'confirmed');

CREATE INDEX idx_event_expires_at
ON Event(expires_at)
WHERE approval_status = 'pending';

ALTER TABLE Event
ADD COLUMN event_nature character varying(255),
ADD COLUMN expected_participants integer;

-- Update existing records to set default values for new columns
UPDATE Event
SET event_nature = 'Intracollegiate',
    expected_participants = 0
WHERE event_nature IS NULL OR expected_participants IS NULL;

-- backend/db/dummyUsers.sql
INSERT INTO Users (email, dept, designation, role, password) VALUES (
    'faculty.amcs@psgtech.ac.in',
    'Applied Mathematics and Computational Sciences',
    'Associate Professor',
    'faculty',
    '$2a$10$wHl2hbsxkWsSDDrIxiKshOJJUm6lMhoejmO8ha7C0xgHJLbzZb8y2'
);

INSERT INTO Users (email, role, password) VALUES (
    'admin@psgtech.ac.in',
    'admin',
    '$2a$10$lDxc10wm8KZOJhmGaDKYL.I1fUKYmEQeQSZcROyIBG8bJcKStuRyy'
);

UPDATE Users
SET phone_number = '9876543210'
WHERE email = 'faculty.amcs@psgtech.ac.in';

