DROP DATABASE IF EXISTS employee_tracker_db;
CREATE DATABASE employee_tracker_db;

\c employee_tracker_db;

-- -- Drop existing tables and sequences if they exist to avoid conflicts
DROP TABLE IF EXISTS employee CASCADE;
DROP TABLE IF EXISTS role CASCADE;
DROP TABLE IF EXISTS department CASCADE;

-- Create the department table
CREATE TABLE department (
    id SERIAL PRIMARY KEY,
    name VARCHAR(30) UNIQUE NOT NULL
);

-- Create the role table
CREATE TABLE role (
    id SERIAL PRIMARY KEY,
    title VARCHAR(50) UNIQUE NOT NULL,
    salary DECIMAL NOT NULL,
    department_id INTEGER NOT NULL,
    FOREIGN KEY (department_id) REFERENCES department(id)
);

-- Create the employee table
CREATE TABLE employee (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INTEGER NOT NULL,
    is_manager BOOLEAN NOT NULL DEFAULT false,
    manager_id INTEGER,
    FOREIGN KEY (role_id) REFERENCES role(id),
    FOREIGN KEY (manager_id) REFERENCES employee(id)
);

-- Indexes for improving query performance
CREATE INDEX idx_department_name ON department(name);
CREATE INDEX idx_role_title ON role(title);
CREATE INDEX idx_role_department_id ON role(department_id);
CREATE INDEX idx_employee_role_id ON employee(role_id);
CREATE INDEX idx_employee_manager_id ON employee(manager_id);

-- Optional: Add additional constraints or triggers if business logic requires
-- Example trigger might enforce business rules such as salary limits per department