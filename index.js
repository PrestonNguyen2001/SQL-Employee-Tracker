const chalk = require("chalk");
const inquirer = require("inquirer");
const Handler = require("./lib/handlers/handler");
const queries = require("./lib/queries/queries");
const handler = new Handler(queries);



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
    chalk.hex("#1E90FF").italic.bold("📁 ➣ Department Options"),
    chalk.hex("#32CD32").italic.bold("👤 ➣ Role Options"),
    chalk.hex("#FFD700").italic.bold("🧑‍💼 ➣ Employee Options\n"),
    // "➣ Run Chalk Demos",
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
          pageSize: 20,
        },
      ])
      .then((answers) => {
        // Use the exact strings including chalk styles for matching in the switch statement
        const chosenOption = answers.mainOption.replace(/\u001b\[.*?m/g, ""); // Removes ANSI color codes for matching

        switch (chosenOption) {
          case "📁 ➣ Department Options":
            displayDepartmentOptions();
            break;
          case "👤 ➣ Role Options":
            displayRoleOptions();
            break;
          case "🧑‍💼 ➣ Employee Options\n":
            displayEmployeeOptions();
            break;
          // case "➣ Run Chalk Demos":
          //   runChalkDemos();
          //   displayInitialChoices(); // Recall the function to prompt again
          //   break;
          case "*** Exit ***\n":
            console.log("Exiting...");
            process.exit(); // Exit the application
            break;
          default:
            console.log("Invalid option selected.");
            displayInitialChoices(); // Recall the function to prompt again
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
        await handler.addDepartment();
        displayDepartmentOptions();
        break;
      case "➣ Delete Department":
        await handler.deleteDepartment();
        displayDepartmentOptions();
        break;
      case "➣ Update Department Name":
        await handler.updateDepartmentName();
        displayDepartmentOptions();
        break;
      case "➣ View all Departments":
        await handler.viewAllDepartments();
        displayDepartmentOptions();
        break;
      case "➣ View Total Budget by All Departments":
        await handler.viewTotalBudgetByAllDepartments();
        displayDepartmentOptions();
        break;
      case "➣ View Total Utilized Budget by Department\n":
        await handler.viewTotalUtilizedBudgetByDepartment();
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
        await handler.addRole();
        displayRoleOptions();
        break;
      case "➣ Delete role":
        await handler.deleteRole();
        displayRoleOptions();
        break;
      case "➣ Update Role":
        await handler.updateRole();
        displayRoleOptions();
        break;
      case "➣ View all roles":
        await handler.viewAllRoles();
        displayRoleOptions();
        break;
      case "➣ View Roles by Department\n":
        await handler.viewRolesByDepartment();
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
        await handler.addEmployee();
        displayEmployeeOptions();
        break;
      case "➣ Delete Employee":
        await handler.deleteEmployee();
        displayEmployeeOptions();
        break;
      case "➣ Update Employee Role":
        await handler.updateEmployeeRole();
        displayEmployeeOptions();
        break;
      case "➣ Update Employee Manager":
        await handler.updateEmployeeManager();
        displayEmployeeOptions();
        break;
      case "➣ View All Employees":
        await handler.viewAllEmployees();
        displayEmployeeOptions();
        break;
      case "➣ View All Managers":
        await handler.viewAllManagers();
        displayEmployeeOptions();
        break;
      case "➣ View Employees by Manager":
        await handler.viewEmployeesByManager();
        displayEmployeeOptions();
        break;
      case "➣ View Employees by Department":
        await handler.viewEmployeesByDepartment();
        displayEmployeeOptions();
        break;
      case "➣ View Employees by Role":
        await handler.viewEmployeesByRole();
        displayEmployeeOptions();
        break;
      case "➣ Sort Employees by Salary":
        await handler.sortEmployeesBySalary();
        displayEmployeeOptions();
        break;
      case "➣ Sort Employees by Last Name\n":
        await handler.sortEmployeesByLastName();
        displayEmployeeOptions();
        break;
      case chalk.red("*** Back to Main Menu ***\n"):
        await displayInitialChoices();
        break;
    }
  };




 
  displayInitialChoices();
};

// Generate ASCII art when the application starts
generateAsciiArt();
// Start the application by displaying initial choices
startApp();

// Warm Tones


