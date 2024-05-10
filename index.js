const chalk = require("chalk");
const inquirer = require("inquirer");
const {
  handleViewAllDepartments,
  handleViewAllRoles,
  handleViewAllEmployees,
  handleViewAllManagers,
  handleViewTotalBudgetByAllDepartments,
  handleViewTotalUtilizedBudgetByDepartment,
  handleViewEmployeesByDepartment,
  handleViewEmployeesByManager,
  handleViewRolesByDepartment,
} = require("./lib/handlers/view");
const {
  handleUpdateRole,
  handleUpdateEmployeeRole,
  handleUpdateEmployeeManager,
  handleUpdateDepartmentName,
} = require("./lib/handlers/update");
const { 
  handleAddDepartment,
  handleAddRole, 
  handleAddEmployee,
  } = require("./lib/handlers/add");

const {
  handleDeleteDepartment,
  handleDeleteRole,
  handleDeleteEmployee,
} = require("./lib/handlers/delete");
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
    "",
    "➣ Department Options",
    "➣ Role Options",
    "➣ Employee Options\n",
    chalk.red("*** Exit ***\n"),
  ];

  // Function to display the initial choices and handle user selection
  const displayInitialChoices = () => {
    inquirer
      .prompt([
        {
          type: "list",
          name: "mainOption",
          message:
            "What would you like to do?\n (Select an option below and press Enter)",
          choices: initialChoices,
        },
      ])
      .then((answers) => {
        // Check the user's selection and display corresponding additional options
        switch (answers.mainOption) {
          case "➣ Department Options":
            displayDepartmentOptions();
            break;
          case "➣ Role Options":
            displayRoleOptions();
            break;
          case "➣ Employee Options\n":
            displayEmployeeOptions();
            break;
          case chalk.red("*** Exit ***\n"):
            console.log("Goodbye!");
            process.exit();
            break;
        }
      });
  };

  const displayDepartmentOptions = async () => {
    const departmentOptions = [
      "➣ Add Department",
      "➣ Delete Department",
      "➣ Update Department Name",
      "➣ View all Departments",
      "➣ View Total Budget by All Departments",
      "➣ View Total Utilized Budget by Department\n",
      chalk.red("*** Back to Main Menu ***\n"),
    ];

    const answers = await inquirer.prompt({
      type: "list",
      name: "departmentOption",
      message: "Department Options:",
      choices: departmentOptions,
    });

    switch (answers.departmentOption) {
      case "➣ Add Department":
        await handleAddDepartment();
        displayDepartmentOptions();
        break;
      case "➣ Delete Department":
        await handleDeleteDepartment();
        displayDepartmentOptions();
        break;
      case "➣ Update Department Name":
        await handleUpdateDepartmentName();
        displayDepartmentOptions();
        break;
      case "➣ View all Departments":
        await handleViewAllDepartments();
        displayDepartmentOptions();
        break;
      case "➣ View Total Budget by All Departments":
        await handleViewTotalBudgetByAllDepartments();
        displayDepartmentOptions();
        break;
      case "➣ View Total Utilized Budget by Department\n":
        await handleViewTotalUtilizedBudgetByDepartment();
        displayDepartmentOptions();
        break;
      case chalk.red("*** Back to Main Menu ***\n"):
        await displayInitialChoices();
        break;
    }
  };

  const displayRoleOptions = async () => {
    const roleOptions = [
      "➣ Add a role",
      "➣ Delete role",
      "➣ Update Role",
      "➣ View all roles",
      "➣ View Roles by Department\n",
      chalk.red("*** Back to Main Menu ***\n"),
    ];

    const answers = await inquirer.prompt({
      type: "list",
      name: "roleOption",
      message: "Role Options:",
      choices: roleOptions,
    });

    switch (answers.roleOption) {
      case "➣ Add a role":
        await handleAddRole();
        displayRoleOptions();
        break;
      case "➣ Delete role":
        await handleDeleteRole();
        displayRoleOptions();
        break;
      case "➣ Update Role":
        await handleUpdateRole();
        displayRoleOptions();
        break;
      case "➣ View all roles":
        await handleViewAllRoles();
        displayRoleOptions();
        break;
      case "➣ View Roles by Department\n":
        await handleViewRolesByDepartment();
        displayRoleOptions();
        break;
      case chalk.red("*** Back to Main Menu ***\n"):
        await displayInitialChoices();
        break;
    }
  };

  const displayEmployeeOptions = async () => {
    const employeeOptions = [
      "➣ Add New Employee",
      "➣ Delete Employee",
      "➣ Update Employee Role",
      "➣ Update Employee Manager",
      "➣ View All Employees",
      "➣ View All Managers",
      "➣ View Employees by Manager",
      "➣ View Employees by Department",
      "➣ View Employees by Role",
      "➣ Sort Employees by Salary",
      "➣ Sort Employees by Last Name\n",
      chalk.red("*** Back to Main Menu ***\n"),
    ];

    const answers = await inquirer.prompt({
      type: "list",
      name: "employeeOption",
      message: "Employee Options:",
      choices: employeeOptions,
    });

    switch (answers.employeeOption) {
      case "➣ Add New Employee":
        await handleAddEmployee();
        break;
      case "➣ Delete Employee":
        await handleDeleteEmployee();
        break;
      case "➣ Update Employee Role":
        await handleUpdateEmployeeRole();
        break;
      case "➣ Update Employee Manager":
        await handleUpdateEmployeeManager();
        break;
      case "➣ View All Employees":
        await handleViewAllEmployees();
        break;
      case "➣ View All Managers":
        await handleViewAllManagers();
        break;
      case "➣ View Employees by Manager":
        await handleViewEmployeesByManager();
        break;
      case "➣ View Employees by Department":
        await handleViewEmployeesByDepartment();
        break;
      case "➣ View Employees by Role":
        await handleViewEmployeesByRole();
        break;
      case "➣ Sort Employees by Salary":
        await handleSortEmployeesBySalary();
        break;
      case "➣ Sort Employees by Last Name\n":
        await handleSortEmployeesByLastName();
        break;
      case chalk.red("*** Back to Main Menu ***\n"):
        await displayInitialChoices();
        break;
    }
  };

 displayInitialChoices();
}

 // Generate ASCII art when the application starts
  generateAsciiArt();
// Start the application by displaying initial choices
startApp();