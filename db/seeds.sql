-- Insert initial data
INSERT INTO department (name) VALUES ('Engineering'), ('Sales'), ('Marketing');

INSERT INTO role (title, salary, department_id) VALUES
('Software Engineer', 80000, 1),
('Sales Manager', 60000, 2),
('Marketing Coordinator', 50000, 3);

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
('John', 'Doe', 1, NULL),
('Jane', 'Smith', 2, 1),
('Michael', 'Brown', 3, 2);
