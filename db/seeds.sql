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
('Finance Manager', 85000, 4); 

-- Insert employees
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
('John', 'Doe', 1, NULL), -- No manager
('Jane', 'Smith', 2, NULL), -- No manager
('Michael', 'Brown', 3, NULL), -- No manager
('Emily', 'Johnson', 4, NULL), -- No manager
('David', 'Williams', 5, NULL), -- No manager
('Jessica', 'Martinez', 6, NULL), -- No manager
('Christopher', 'Jones', 7, NULL), -- No manager
('Ashley', 'Brown', 8, NULL), -- No manager
('Matthew', 'Garcia', 9, NULL), -- No manager
('Amanda', 'Davis', 10, 2), -- Linked to Sales Manager
('Daniel', 'Rodriguez', 11, 7), -- Linked to Operations Manager
('Olivia', 'Wilson', 10, 5), -- Linked to HR Manager
('William', 'Moore', 4, 5); -- Linked to Financial Analyst
