const inquirer = require('inquirer');
const {
    getAllDepartments,
    getAllRoles,
    getAllEmployees,
    getAllManagers,
    addDepartment,
    addRole,
    addEmployee,
    updateRoleSalary,
    updateEmployeeRole,
    updateEmployeeManager,
    getEmployeesByDepartment,
    sortEmployeesBySalary,
    sortEmployeesByLastName,
    getEmployeesByRole,
    sortRolesBySalary,
    groupRolesByDepartment,
    deleteDepartment,
    deleteRole,
    deleteEmployee,
    getTotalBudgetByDepartment,
} = require('./queries');
const chalk = require('chalk');

// Function to generate ASCII art
const generateAsciiArt = () => {
    const asciiArt = `
    .----------------------------------------------------------------------------.
    |                                                                            |
    |    ███████╗███╗   ███╗██████╗ ██╗      ██████╗ ██╗   ██╗███████╗███████╗   |
    |    ██╔════╝████╗ ████║██╔══██╗██║     ██╔═══██╗╚██╗ ██╔╝██╔════╝██╔════╝   |
    |    █████╗  ██╔████╔██║██████╔╝██║     ██║   ██║ ╚████╔╝ █████╗  █████╗     |
    |    ██╔══╝  ██║╚██╔╝██║██╔═══╝ ██║     ██║   ██║  ╚██╔╝  ██╔══╝  ██╔══╝     |
    |    ███████╗██║ ╚═╝ ██║██║     ███████╗╚██████╔╝   ██║   ███████╗███████╗   |
    |    ╚══════╝╚═╝     ╚═╝╚═╝     ╚══════╝ ╚═════╝    ╚═╝   ╚══════╝╚══════╝   |
    |                                                                            |
    |    ███╗   ███╗ █████╗ ███╗   ██╗ █████╗  ██████╗ ███████╗██████╗           |
    |    ████╗ ████║██╔══██╗████╗  ██║██╔══██╗██╔════╝ ██╔════╝██╔══██╗          |
    |    ██╔████╔██║███████║██╔██╗ ██║███████║██║  ███╗█████╗  ██████╔╝          |
    |    ██║╚██╔╝██║██╔══██║██║╚██╗██║██╔══██║██║   ██║██╔══╝  ██╔══██╗          |
    |    ██║ ╚═╝ ██║██║  ██║██║ ╚████║██║  ██║╚██████╔╝███████╗██║  ██║          |
    |    ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝          |
    '----------------------------------------------------------------------------'
    `;
    console.log(asciiArt);
};


// Function to start the application
const startApp = () => {
    
    console.log("\n"); // Add a newline for spacing at the beginning

    // Initial choices containing main options
    const initialChoices = [
        '',
        '➣ Department Options',
        '➣ Role Options',
        '➣ Employee Options\n',
        chalk.red('*** Exit ***\n')
    ];

    // Function to display the initial choices and handle user selection
    const displayInitialChoices = () => {
        inquirer.prompt([
            {
                type: 'list',
                name: 'mainOption',
                message: 'What would you like to do?\n (Select an option below and press Enter)',
                choices: initialChoices
            }
        ]).then((answers) => {
            // Check the user's selection and display corresponding additional options
            switch (answers.mainOption) {
                case '➣ Department Options':
                    displayDepartmentOptions();
                    break;
                case '➣ Role Options':
                    displayRoleOptions();
                    break;
                case '➣ Employee Options\n':
                    displayEmployeeOptions();
                    break;
                case chalk.red('*** Exit ***\n'):
                    console.log('Goodbye!');
                    process.exit();
                    break;
            }
        });
    };

// --------------------------------------------------------------------------
// --  DEPARTMENT OPTIONS                                                   //
// --------------------------------------------------------------------------
    // Function to display department-related options
    const displayDepartmentOptions = async () => {
        try {
            // Add department-related options to the initial choices
            const departmentOptions = [
                '➣ View all Departments',
                '➣ Add Department',
                '➣ Delete Department',
                "➣ View Department's Budget\n",
                chalk.red('*** Back to Main Menu ***\n') // Add option to go back to main menu
            ];
    
            // Prompt user for department-related options
            const answers = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'departmentOption',
                    message: 'Department Options:',
                    choices: departmentOptions
                }
            ]);
    
            // Handle user selection of department-related options
            switch (answers.departmentOption) {
                case '➣ View all Departments':
                    // Fetch all departments and display them
                    const departments = await getAllDepartments();
                    console.table(departments);
                    displayDepartmentOptions(); // Go back to department options
                    break;
                case '➣ Add Department':
                    addDepartmentPrompt();
                    break;
                case '➣ Delete Department':
                    // Fetch all departments and use them as choices
                    // const departmentsToDelete = await getAllDepartments();
                    // const departmentNamesToDelete = departmentsToDelete.map(department => department.name);
                    // const departmentChoiceToDelete = await inquirer.prompt([
                    //     {
                    //         type: 'list',
                    //         name: 'departmentName',
                    //         message: 'Choose a department to delete:',
                    //         choices: departmentNamesToDelete
                    //     }
                    // ]);
                    deleteDepartmentPrompt();
                    break;
                case "➣ View Department's Budget\n":
                    // Fetch all departments and use them as choices
                    // const departmentsToViewBudget = await getAllDepartments();
                    // const departmentNamesToViewBudget = departmentsToViewBudget.map(department => department.name);
                    // const departmentChoiceToViewBudget = await inquirer.prompt([
                    //     {
                    //         type: 'list',
                    //         name: 'departmentName',
                    //         message: 'Choose a department to view budget:',
                    //         choices: departmentNamesToViewBudget
                    //     }
                    // ]);
                    viewTotalBudgetByDepartmentPrompt();
                    break;
                case chalk.red('*** Back to Main Menu ***\n'):
                    displayInitialChoices(); // Go back to main menu
                    break;
            }
        } catch (error) {
            console.error('Error displaying department options:', error);
        }
    };
    
    // Prompt for adding a department
    const addDepartmentPrompt = () => {
        inquirer.prompt([
            {
                type: 'input',
                name: 'name',
                message: 'Enter the name of the department:',
            },
        ]).then((answers) => {
            addDepartment(answers.name).then(() => {
                console.log('Department added successfully!');
                displayDepartmentOptions(); // Go back to department options
            });
        });
    };

    // Prompt for deleting a department
    const deleteDepartmentPrompt = async () => {
        try {
            // Retrieve all departments
            const departments = await getAllDepartments();
            
            // Map department names to choices
            const departmentChoices = departments.map(department => ({
                name: department.name,
                value: department.id
            }));

            // Prompt the user to select a department to delete
            const { departmentId, confirmDelete } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'departmentId',
                    message: 'Choose a department to delete:',
                    choices: departmentChoices
                },
                {
                    type: 'confirm',
                    name: 'confirmDelete',
                    message: 'Are you sure you want to delete? [y/n]',
                    default: false,
                }
            ]);

            if (confirmDelete) {
                await deleteDepartment(departmentId);
                console.log('Department deleted successfully!');
            } else {
                console.log('Deletion cancelled.');
            }

            // Go back to department options
            displayDepartmentOptions();
        } catch (error) {
            console.error('Error deleting department:', error);
            displayDepartmentOptions(); // Go back to department options
        }
    };

    // Prompt for viewing total budget by department
    const viewTotalBudgetByDepartmentPrompt = async () => {
        try {
            // Fetch all departments
            const departments = await getAllDepartments();
            
            // Map department names to choices
            const departmentChoices = departments.map(department => ({
                name: department.name,
                value: department.id
            }));
            
            // Prompt user to select a department
            const { departmentId } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'departmentId',
                    message: 'Select a department:',
                    choices: departmentChoices
                },
            ]);

            // Get total budget for the selected department
            const totalBudget = await getTotalBudgetByDepartment(departmentId);

            // Display total budget
            console.log(`Total budget for department ${departmentId}: ${totalBudget}`);
            
            // Go back to department options
            displayDepartmentOptions();
        } catch (error) {
            console.error('Error viewing total budget by department:', error);
        }
    };

// --------------------------------------------------------------------------
// --  ROLE OPTIONS                                                         //
// --------------------------------------------------------------------------

    // Function to display role-related options
    const displayRoleOptions = async () => {
        try {
            // Add role-related options to the initial choices
            const roleOptions = [
                '➣ Add a role',
                '➣ Delete role',
                '➣ View all roles',
                '➣ View Role Salaries',
                '➣ Update Role Salary',
                
                '➣ Group Roles by Department\n',
                
                chalk.red('*** Back to Main Menu ***\n') // Add option to go back to main menu
            ];
    
            // Prompt user for role-related options
            const answers = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'roleOption',
                    message: 'Role Options:',
                    choices: roleOptions
                }
            ]);
    
            // Handle user selection of role-related options
            switch (answers.roleOption) {
                case '➣ Add a role':
                    addRolePrompt();
                    break;
                case '➣ Delete role':
                    // Fetch all roles and use them as choices
                    // const rolesToDelete = await getAllRoles();
                    // const roleTitlesToDelete = rolesToDelete.map(role => role.title);
                    // const roleChoiceToDelete = await inquirer.prompt([
                    //     {
                    //         type: 'list',
                    //         name: 'roleTitle',
                    //         message: 'Choose a role to delete:',
                    //         choices: roleTitlesToDelete
                    //     }
                    // ]);roleChoiceToDelete.roleTitle
                    deleteRolePrompt();
                    break;
                case '➣ View all roles':
                    // Fetch all roles and display them
                    const roles = await getAllRoles();
                    console.table(roles);
                    displayRoleOptions(); // Go back to role options
                    break;
                case '➣ View Role Salaries':
                    sortRolesBySalaryPrompt();
                    break;
                case '➣ Update Role Salary':
                    // Fetch all roles and use them as choices
                    // const rolesToUpdate = await getAllRoles();
                    // const roleTitlesToUpdate = rolesToUpdate.map(role => role.title);
                    // const roleChoiceToUpdate = await inquirer.prompt([
                    //     {
                    //         type: 'list',
                    //         name: 'roleTitle',
                    //         message: 'Choose a role to update salary:',
                    //         choices: roleTitlesToUpdate
                    //     }
                    // ]); roleChoiceToUpdate.roleTitle
                    updateRoleSalaryPrompt();
                    break;
                
                case '➣ Group Roles by Department\n':
                    groupRolesByDepartmentPrompt();
                    break;
                
                case chalk.red('*** Back to Main Menu ***\n'):
                    displayInitialChoices(); // Go back to main menu
                    break;
            }
        } catch (error) {
            console.error('Error displaying role options:', error);
        }
    };
    
    // Prompt for adding a role
    const addRolePrompt = () => {
        getAllDepartments().then((departments) => {
            inquirer.prompt([
                {
                    type: 'input',
                    name: 'roleTitle',
                    message: 'Enter the title of the role:',
                    validate: (input) => {
                        if (input.trim() === '') {
                            return 'Please enter a role title.';
                        }
                        return true;
                    }
                },
                {
                    type: 'input',
                    name: 'roleSalary',
                    message: 'Enter the salary for the role:',
                    validate: (input) => {
                        const isValidSalary = /^\d+(\.\d{1,2})?$/.test(input.trim());
                        if (isValidSalary) {
                            return true;
                        }
                        return 'Please enter a valid salary (e.g., 50000.00)';
                    }
                },
                {
                    type: 'list',
                    name: 'departmentId',
                    message: 'Select the department for the role:',
                    choices: departments.map((department) => ({
                        name: department.name,
                        value: department.id,
                    })),
                },
            ]).then((answers) => {
                const { roleTitle, roleSalary, departmentId } = answers;
                addRole(roleTitle, parseFloat(roleSalary), departmentId).then(() => {
                    console.log('Role added successfully!');
                    displayRoleOptions();
                });
            });
        });
    };

    // Prompt for deleting a role
    const deleteRolePrompt = async () => {
        try {
            // Fetch all roles
            const roles = await getAllRoles();

            // Create an array of role titles for choices
            const roleChoices = roles.map(role => ({
                name: `${role.id}: ${role.title}`,
                value: role.id
            }));

            // Prompt the user to choose a role for deletion
            const answers = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'roleId',
                    message: 'Choose the role to delete:',
                    choices: roleChoices
                }
            ]);

            // Call the deleteRole function with the chosen role ID
            await deleteRole(answers.roleId);
            
            console.log('Role deleted successfully!');
            displayRoleOptions(); // Go back to role options
        } catch (error) {
            console.error('Error deleting role:', error);
        }
    };

   // Prompt for updating role salary
    const updateRoleSalaryPrompt = async () => {
        try {
            // Fetch all roles
            const roles = await getAllRoles();

            // Create an array of role titles for choices
            const roleChoices = roles.map(role => ({
                name: `${role.id}: ${role.title}`,
                value: role.id
            }));

            // Prompt the user to choose a role for salary update
            const { roleId } = await inquirer.prompt({
                type: 'list',
                name: 'roleId',
                message: 'Choose the role to update salary:',
                choices: roleChoices
            });

            // Find the selected role based on the role ID
            const selectedRole = roles.find(role => role.id === roleId);

            // Display the current salary of the selected role
            console.log(`Current salary for ${selectedRole.title}: ${selectedRole.salary}`);

            // Prompt the user to enter the new salary
            const { newSalary } = await inquirer.prompt({
                type: 'input',
                name: 'newSalary',
                message: 'Enter the new salary:',
            });

            // Call the updateRoleSalary function with the chosen role ID and new salary
            await updateRoleSalary(roleId, newSalary);

            console.log('Role salary updated successfully!');
            displayRoleOptions(); // Go back to role options
        } catch (error) {
            console.error('Error updating role salary:', error);
        }
    };

    // Prompt for sorting roles by salary
    const sortRolesBySalaryPrompt = () => {
        sortRolesBySalary().then((roles) => {
            console.table(roles);
            displayRoleOptions(); // Go back to role options
        });
    };

    // Prompt for grouping roles by department
    const groupRolesByDepartmentPrompt = () => {
        groupRolesByDepartment().then((roles) => {
            console.table(roles);
            displayRoleOptions(); // Go back to role options
        });
    };


// --------------------------------------------------------------------------
// --  EMPLOYEE OPTIONS                                                     //
// --------------------------------------------------------------------------
    // Function to display employee-related options
    const displayEmployeeOptions = async () => {
        try {
            const employeeOptions = [
                '➣ Add New Employee',
                '➣ Delete Employee',
                '➣ Update Employee Role',
                '➣ Update Employee Manager',
                '➣ View All Employees',
                '➣ View All Managers',
                '➣ View Employees by Department',
                '➣ View Employees by Role',
                '➣ Sort Employees by Salary',
                '➣ Sort Employees by Last Name\n',
                chalk.red('*** Back to Main Menu ***\n')
            ];
    
            const answers = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'employeeOption',
                    message: 'Employee Options:',
                    choices: employeeOptions
                }
            ]);
    
            switch (answers.employeeOption) {
                case '➣ Add New Employee':
                    addEmployeePrompt();
                    break;
                case '➣ Delete Employee':
                    deleteEmployeePrompt();
                    break;
                case '➣ Update Employee Role':
                    
                    updateEmployeeRolePrompt();
                    break;
                case '➣ Update Employee Manager':
                    updateEmployeeManagerPrompt();
                    break;
                case '➣ View All Employees':
                    const employees = await getAllEmployees();
                    console.table(employees);
                    displayEmployeeOptions();
                    break;
                case '➣ View All Managers':
                    viewAllManagersPrompt();
                    break;
                case '➣ View Employees by Department':
                    viewEmployeesByDepartmentPrompt();
                    break;
                case '➣ View Employees by Role':
                    groupEmployeesByRolePrompt();
                    break;
                case '➣ Sort Employees by Salary':
                    sortEmployeesBySalaryPrompt();
                    break;
                case '➣ Sort Employees by Last Name\n':
                    sortEmployeesByLastNamePrompt();
                    break;
                case chalk.red('*** Back to Main Menu ***\n'):
                    displayInitialChoices();
                    break;
            }
        } catch (error) {
            console.error('Error displaying employee options:', error);
        }
    };
    
    // Prompt for adding an employee
    const addEmployeePrompt = () => {
        inquirer.prompt([
            {
                type: 'confirm',
                name: 'isManager',
                message: 'Is this employee a manager?',
                default: false,
            },
        ]).then((answers) => {
            if (answers.isManager) {
                addEmployeeAsManagerPrompt();
            } else {
                inquirer.prompt([
                    {
                        type: 'confirm',
                        name: 'hasManager',
                        message: 'Does this employee have a manager?',
                        default: true,
                    },
                    {
                        type: 'input',
                        name: 'firstName',
                        message: 'Enter the first name of the employee:',
                    },
                    {
                        type: 'input',
                        name: 'lastName',
                        message: 'Enter the last name of the employee:',
                    },
                    {
                        type: 'input',
                        name: 'roleId',
                        message: 'Enter the role ID for the employee:',
                    },
                    {
                        type: 'input',
                        name: 'managerId',
                        message: 'Enter the manager ID for the employee (enter 0 or leave blank if none):',
                        validate: (input) => {
                            if (input.trim() === '') {
                                return true; // Allow blank input
                            }
                            const parsedInput = parseInt(input);
                            if (!Number.isNaN(parsedInput) && parsedInput >= 0) {
                                return true; // Allow positive integers including 0
                            }
                            return 'Please enter a valid manager ID (0 or positive integer), or leave it blank to remove the manager.';
                        },
                    },
                ]).then((answers) => {
                    const { firstName, lastName, roleId, managerId } = answers;
                    addEmployee(firstName, lastName, roleId, managerId).then(() => {
                        console.log('Employee added successfully!');
                        startApp();
                    }).catch((error) => {
                        console.error('Error adding employee:', error);
                        startApp();
                    });
                });
            }
        });
    };

    // Prompt for adding an employee as a manager
    const addEmployeeAsManagerPrompt = () => {
        inquirer.prompt([
            {
                type: 'input',
                name: 'firstName',
                message: 'Enter the first name of the manager:',
            },
            {
                type: 'input',
                name: 'lastName',
                message: 'Enter the last name of the manager:',
            },
            {
                type: 'input',
                name: 'roleId',
                message: 'Enter the role ID for the manager:',
            },
        ]).then((answers) => {
            const { firstName, lastName, roleId } = answers;
            addEmployee(firstName, lastName, roleId, null).then(() => {
                console.log('Manager added successfully!');
                startApp();
            }).catch((error) => {
                console.error('Error adding manager:', error);
                startApp();
            });
        });
    };

    // Prompt for deleting an employee
    const deleteEmployeePrompt = async () => {
        try {
            // Fetch all employees
            const employees = await getAllEmployees();

            // Display all employees
            console.table(employees);

            // Create an array of choices using the employee names and IDs
            const employeeChoices = employees.map(employee => ({
                name: `${employee.first_name} ${employee.last_name} (ID: ${employee.id})`,
                value: employee.id
            }));

            // Prompt the user to choose an employee for deletion
            const answers = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'employeeId',
                    message: 'Choose the employee to delete:',
                    choices: employeeChoices
                },
                {
                    type: 'confirm',
                    name: 'confirmDelete',
                    message: 'Are you sure you want to delete this employee? [y/n]',
                    default: false,
                },
            ]);

            // If the user confirms deletion, call the deleteEmployee function with the chosen employee ID
            if (answers.confirmDelete) {
                await deleteEmployee(answers.employeeId);
                console.log('Employee deleted successfully!');
            } else {
                console.log('Deletion cancelled.');
            }

            // Go back to employee options
            displayEmployeeOptions();
        } catch (error) {
            console.error('Error deleting employee:', error);
        }
    };

   // Prompt for updating employee role
    const updateEmployeeRolePrompt = async () => {
        try {
            // Fetch all employees and roles
            const employees = await getAllEmployees();
            const roles = await getAllRoles();

            // Create arrays of choices for employees and roles
            const employeeChoices = employees.map(employee => ({
                name: `${employee.first_name} ${employee.last_name}`,
                value: employee.id,
            }));
            const roleChoices = roles.map(role => ({
                name: role.title,
                value: role.id,
            }));

            // Prompt the user to select an employee
            const { employeeId } = await inquirer.prompt({
                type: 'list',
                name: 'employeeId',
                message: 'Select the employee to update role:',
                choices: employeeChoices,
            });

            // Fetch the current role of the selected employee
            const employee = employees.find(emp => emp.id === employeeId);
            const currentRole = employee ? employee.role_title : 'Unknown';

            // Prompt the user to select a new role for the employee
            const { newRoleId } = await inquirer.prompt({
                type: 'list',
                name: 'newRoleId',
                message: `Current Role: ${currentRole}.\n Select the new role for the employee:`,
                choices: roleChoices,
            });

            // Update the employee's role with the new role ID
            await updateEmployeeRole(employeeId, newRoleId);
            console.log('Employee role updated successfully!');

            // Display employee options
            displayEmployeeOptions();
        } catch (error) {
            console.error('Error updating employee role:', error);
        }
    };

    // Prompt for updating employee manager
    const updateEmployeeManagerPrompt = async () => {
        try {
            // Fetch all employees and managers
            const employees = await getAllEmployees();
            let managers = await getAllManagers();

            // Filter employees who have a manager
            const employeesWithManagers = employees.filter(employee => employee.manager);

            // Prompt the user to select an employee who has a manager
            const { employeeId } = await inquirer.prompt({
                type: 'list',
                name: 'employeeId',
                message: 'Choose an employee to update manager:',
                choices: employeesWithManagers.map(employee => ({
                    name: `${employee.first_name} ${employee.last_name}`,
                    value: employee.id,
                    manager: employee.manager // Include manager name for each employee
                })),
            });

            // Find the selected employee
            const selectedEmployee = employeesWithManagers.find(emp => emp.id === employeeId);

            // Fetch all managers, including those marked as managers when adding employees
            if (selectedEmployee.ismanager) {
                managers.push(selectedEmployee);
            }

            // Prompt the user to select a new manager for the employee
            const { newManagerId } = await inquirer.prompt({
                type: 'list',
                name: 'newManagerId',
                message: `Current Manager: ${selectedEmployee.manager || 'None'}.\nChoose a new manager for ${selectedEmployee.first_name} ${selectedEmployee.last_name}:`,
                choices: managers.map(manager => ({
                    name: `${manager.manager_first_name} ${manager.manager_last_name}`, // Display manager's first and last name
                    value: manager.manager_id,
                })),
            });

            // Update the employee's manager with the new manager ID
            await updateEmployeeManager(employeeId, newManagerId);
            console.log('Employee manager updated successfully!');
        } catch (error) {
            console.error('Error updating employee manager:', error);
        }
    };

    // Prompt for viewing all managers
    const viewAllManagersPrompt = () => {
        getAllManagers().then((managers) => {
            console.table(managers);
            displayEmployeeOptions(); // Go back to employee options
        });
    };

    // Prompt for viewing employees by department
    const viewEmployeesByDepartmentPrompt = async () => {
        try {
            const departments = await getAllDepartments();
            const departmentNames = departments.map(department => department.name);
    
            const { departmentName } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'departmentName',
                    message: 'Choose a department to view employees:',
                    choices: departmentNames
                }
            ]);
    
            // Find the department ID associated with the selected department name
            const selectedDepartment = departments.find(department => department.name === departmentName);
            const departmentId = selectedDepartment.id;
    
            // Now we have the department ID, we can fetch employees by department
            const employees = await getEmployeesByDepartment(departmentId);
            console.table(employees);
            displayEmployeeOptions(); // Go back to employee options
        } catch (error) {
            console.error('Error viewing employees by department:', error);
        }
    };

    // Prompt for sorting employees by salary
    const sortEmployeesBySalaryPrompt = () => {
        sortEmployeesBySalary().then((employees) => {
            console.table(employees);
            displayEmployeeOptions(); // Go back to employee options
        }).catch((error) => {
            console.error('Error sorting employees by salary:', error);
            displayEmployeeOptions(); // Go back to employee options even if there's an error
        });
    };
    
    // Prompt for sorting employees by last name
    const sortEmployeesByLastNamePrompt = () => {
        sortEmployeesByLastName().then((employees) => {
            console.table(employees);
            displayEmployeeOptions(); // Go back to employee options
        });
    };

    // Prompt for grouping employees by role
    const groupEmployeesByRolePrompt = async () => {
        try {
            const roles = await getAllRoles();
            const roleTitles = roles.map(role => role.title);
    
            const { roleTitle } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'roleTitle',
                    message: 'Choose a role to view employees:',
                    choices: roleTitles
                }
            ]);
    
            // Find the role ID associated with the selected role title
            const selectedRole = roles.find(role => role.title === roleTitle);
            const roleId = selectedRole.id;
    
            // Now we have the role ID, we can fetch employees by role
            const employees = await getEmployeesByRole(roleId);
            console.table(employees);
            displayEmployeeOptions(); // Go back to employee options
        } catch (error) {
            console.error('Error grouping employees by role:', error);
        }
    };
    

    


//--------------------------------------------------------------------------//
    
    displayInitialChoices(); // Start the application by displaying initial choices
};

generateAsciiArt(); // Call the function to display ASCII art once

startApp(); // Start the application
