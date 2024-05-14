# SQL-Employee-Tracker

## Table of Contents

- Description
- Elements
- Installation
- Usage
- Test
- License
- Contributing
- Questions

## Walkthrough Video

To view a video on installing and using this application, click the link below:
 [Demo](https://youtu.be/pJNnc6mVO6U)

## Challenge Description

This challenge involves created a command-line content management system. This application is designed to manage a company's employee database, using Node.js, Inquirer, and PostgreSQL.

## Challenge Elements

### User Story

```markdown
AS A business owner
I WANT to be able to view and manage the departments, roles, and employees in my company
SO THAT I can organize and plan my business

```

### Acceptance Criteria

```markdown
GIVEN a command-line application that accepts user input
WHEN I start the application
THEN I am presented with the following options: view all departments, view all roles, view all employees, add a department, add a role, add an employee, and update an employee role
WHEN I choose to view all departments
THEN I am presented with a formatted table showing department names and department ids
WHEN I choose to view all roles
THEN I am presented with the job title, role id, the department that role belongs to, and the salary for that role
WHEN I choose to view all employees
THEN I am presented with a formatted table showing employee data, including employee ids, first names, last names, job titles, departments, salaries, and managers that the employees report to
WHEN I choose to add a department
THEN I am prompted to enter the name of the department and that department is added to the database
WHEN I choose to add a role
THEN I am prompted to enter the name, salary, and department for the role and that role is added to the database
WHEN I choose to add an employee
THEN I am prompted to enter the employee’s first name, last name, role, and manager, and that employee is added to the database
WHEN I choose to update an employee role
THEN I am prompted to select an employee to update and their new role and this information is updated in the database
```

## Installation Instructions

1. To get started with the application, clone the repository and run the following command to install the necessary dependencies: `npm install`.

2. To set up the Database, follow these instructions:
    - Create a .env file in the root of your project and add your database credentials:
        ```markdown
        DB_USER=your_username
        DB_HOST=localhost
        DB_NAME=your_database
        DB_PASSWORD=your_password
        DB_PORT=5432
        ```
        
    - Navigate to the `db` folder by entering `cd db` into the terminal.
    - Connect to your PostgreSQL database: `psql -U your_username -d your_database
    - Run the following commands to set up the database schema and seed data:
        ```markdown
        \i schema.sql
        \i seeds.sql
        ```



1. To use the application, run node index.js and follow the on-screen prompts.

2. Follow the on-screen prompts to navigate through the various options and perform operations such as viewing, adding, updating, and deleting departments, roles, and employees.

The application includes the following functionalites:

- View all departments
- View all roles
- View all employees
- Add a department
- Add a role
- Add an employee
- Update a department name
- Update a role
- Update an employee role
- Update employee managers
- View employees by manager
- View employees by department
- View employees by role
- View roles by department
- Delete departments
- Delete roles
- Delete employees
- View the total budget by all departments
- View the total utilized budget by department
- Sort employees by salary
- Sort employees by last name

## Test Instructions

To test this SQL-Employee-Tracker application, follow these steps:

1. Enter `npm test` into your command line.
    - Note: Reset the database schema and seed data before running the test.

## Contributing

You can contribute to this project in various ways:

- **Code Contributions**: If you find a bug or have an enhancement in mind, feel free to fork the repository, make your changes, and submit a pull request. Please ensure that your code follows the project's coding conventions and that you include appropriate tests.

- **Bug Reports**: If you encounter any issues with the application, please open a new issue on the GitHub repository. Provide detailed information about the problem, including steps to reproduce it, and we'll do our best to address it promptly.

- **Feature Requests**: If you have ideas for new features or improvements, you can also open an issue to discuss them. We're always interested in hearing feedback from the community.

## Questions

- If you have any questions, feel free to reach out via: <https://github.com/PrestonNguyen2001>
- For additional questions or support, contact me at <prestonnguyen2001@gmail.com>
