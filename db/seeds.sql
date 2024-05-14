-- Insert departments
INSERT INTO department (name) VALUES
('Engineering'),
('Sales'),
('Marketing'),
('Finance'),
('Human Resources'),
('Customer Service'),
('Operations'),
('Research and Development');

-- Insert roles
INSERT INTO role (title, salary, department_id) VALUES
('Software Engineer', 80000, 1),
('Sales Manager', 60000, 2),
('Marketing Coordinator', 50000, 3),
('Financial Analyst', 70000, 4),
('HR Manager', 65000, 5),
('Customer Service Representative', 45000, 6),
('Operations Manager', 75000, 7),
('Research Analyst', 60000, 8),
('Senior Software Engineer', 100000, 1),
('Sales Associate', 40000, 2),
('Marketing Manager', 70000, 3),
('Engineering Manager', 90000, 1),
('Finance Manager', 85000, 4),
('Marketing Director', 100000, 3); -- Added the missing role

-- Insert employees
INSERT INTO employee (first_name, last_name, role_id, manager_id, is_manager) VALUES
('John', 'Doe', 1, NULL, FALSE), -- No manager, not a manager
('Jane', 'Smith', 2, NULL, TRUE), -- No manager, is a manager
('Michael', 'Brown', 13, NULL, TRUE), -- No manager, is a manager
('Emily', 'Johnson', 4, 3, FALSE), -- No manager, not a manager
('David', 'Williams', 5, NULL, TRUE), -- No manager, is a manager
('Jessica', 'Martinez', 6, NULL, FALSE), -- No manager, not a manager
('Christopher', 'Jones', 7, NULL, TRUE), -- No manager, is a manager
('Ashley', 'Brown', 8, NULL, FALSE), -- No manager, not a manager
('Matthew', 'Garcia', 9, NULL, FALSE), -- No manager, not a manager
('Amanda', 'Davis', 10, 2, FALSE), -- Linked to Sales Manager, not a manager
('Daniel', 'Rodriguez', 11, 7, FALSE), -- Linked to Operations Manager, not a manager
('Olivia', 'Wilson', 10, 15, FALSE), -- Linked to HR Manager, not a manager
('William', 'Moore', 4, NULL, FALSE), -- Linked to Financial Analyst, not a manager
('Emma', 'Thomas', 12, NULL, TRUE), -- Linked to Engineering Manager, not a manager
('James', 'Anderson', 13, NULL, TRUE), -- Linked to Sales Director, is a manager
('Sophie', 'Brown', 14, 14, TRUE), -- Linked to Marketing Director, is a manager
('Mia', 'Taylor', 10, 2, FALSE), -- Linked to Sales Manager, not a manager
('Logan', 'Clark', 11, 7, FALSE), -- Linked to Operations Manager, not a manager
('Chloe', 'Hernandez', 10, 5, FALSE), -- Linked to HR Manager, not a manager
('Liam', 'Gonzalez', 4, 5, FALSE); -- Linked to Financial Analyst, not a manager