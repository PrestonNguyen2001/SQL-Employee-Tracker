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
('Jessica', 'Martinez', 6, NULL, FALSE), -- No manager, not a manager
('Christopher', 'Jones', 7, NULL, TRUE), -- No manager, is a manager
('Ashley', 'Brown', 8, NULL, FALSE), -- No manager, not a manager
('Matthew', 'Garcia', 9, NULL, FALSE), -- No manager, not a manager
('Amanda', 'Davis', 10, NULL, FALSE), -- Previously managed by Jane, now no manager
('Daniel', 'Rodriguez', 11, 7, FALSE), -- Managed by Operations Manager
('Olivia', 'Wilson', 10, 5, FALSE), -- Managed by HR Manager
('William', 'Moore', 4, NULL, FALSE), -- Previously managed by Emily, now no manager
('Emma', 'Thomas', 12, NULL, TRUE), -- No manager, is a manager
('James', 'Anderson', 13, NULL, TRUE), -- No manager, is a manager
('Sophie', 'Brown', 11, NULL, TRUE), -- No manager, is a manager
('Mia', 'Taylor', 10, NULL, FALSE), -- Previously managed by Jane, now no manager
('Logan', 'Clark', 11, 7, FALSE), -- Managed by Operations Manager
('Chloe', 'Hernandez', 10, 5, FALSE), -- Managed by HR Manager
('Liam', 'Gonzalez', 4, 5, FALSE); -- Managed by HR Manager