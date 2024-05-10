// handlers/view.js
const inquirer = require("inquirer");
const queries = require("../queries/queries");

// View All Departments Handler
async function handleViewAllDepartments() {
  const departments = await queries.viewAllDepartments();
  console.table(departments);
}

// View All Roles Handler
async function handleViewAllRoles() {
  const roles = await queries.viewAllRoles();
  console.table(roles);
}

// View Role

// View All Managers Handler
async function handleViewAllManagers() {
  const managers = await queries.viewAllManagers();
  console.table(managers); // Assuming you want to show managers immediately
}

// View All Employees Handler
async function handleViewAllEmployees() {
  const employees = await queries.viewAllEmployees();
  console.table(employees);
}

// View Employees by Manager Handler
async function handleViewEmployeesByManager() {
  try {
    const managers = await queries.viewAllManagers(); // Assuming viewAllManagers is a function that lists all managers
    const managerNames = managers.map(
      (manager) => `${manager.manager_first_name} ${manager.manager_last_name}`
    );

    const { managerName } = await inquirer.prompt([
      {
        type: "list",
        name: "managerName",
        message: "Choose a manager to view employees:",
        choices: managerNames,
      },
    ]);

    // Find the manager object associated with the selected manager name
    const selectedManager = managers.find(
      (manager) =>
        `${manager.manager_first_name} ${manager.manager_last_name}` ===
        managerName
    );

    // If selectedManager is undefined, log an error and return
    if (!selectedManager) {
      console.error("Selected manager not found");
      return;
    }

    // Retrieve the manager ID
    const managerId = selectedManager.manager_id;

    // Now we have the manager ID, we can fetch employees by manager
    const employees = await queries.viewEmployeesByManager(managerId);
    const simplifiedEmployees = employees.map((employee) => ({
      employee_id: employee.id,
      employee_name: `${employee.first_name} ${employee.last_name}`,
      role_id: employee.role_id,
      manager_name: `${selectedManager.manager_first_name} ${selectedManager.manager_last_name}`, // Change is_manager to manager_name
    }));
    console.table(simplifiedEmployees);
  } catch (error) {
    console.error("Error viewing employees by manager:", error);
  }
}

// View Employees by Department Handler
async function handleViewEmployeesByDepartment() {
  try {
    const departments = await queries.viewAllDepartments(); // Assumes function exists in queries to fetch all departments
    const departmentChoices = departments.map((department) => ({
      name: department.name,
      value: department.id,
    }));

    const { departmentId } = await inquirer.prompt([
      {
        type: "list",
        name: "departmentId",
        message: "Choose a department to view employees:",
        choices: departmentChoices,
      },
    ]);

    const employees = await queries.viewEmployeesByDepartment(departmentId);
    console.table(employees);
  } catch (error) {
    console.error("Error handling view of employees by department:", error);
  }
}

// View Roles By Department Handler
async function handleViewRolesByDepartment() {
  const departments = await queries.viewRolesByDepartment();
  console.table(departments);
}


// View Total Budget by All Departments Handler
async function handleViewTotalBudgetByAllDepartments() {
  try {
    const { totalBudget, departments } =
      await queries.viewTotalBudgetByAllDepartments();
    console.log(`Total Budget by All Departments: $${totalBudget}`);
    console.table(departments);
  } catch (error) {
    console.error("Error in viewing total budget by all departments:", error);
  }
}

// View Total Utilized Budget by Department Handler
async function handleViewTotalUtilizedBudgetByDepartment() {
  try {
    const departments = await queries.viewAllDepartments();
    const departmentChoices = departments.map((department) => ({
      name: department.name,
      value: department.id,
    }));

    const { departmentId } = await inquirer.prompt({
      type: "list",
      name: "departmentId",
      message: "Select a department:",
      choices: departmentChoices,
    });

     const [totalUtilizedBudget, employeeDetails] = await Promise.all([
       queries.viewTotalUtilizedBudgetByDepartment(departmentId),
       queries.viewEmployeeDetailsByDepartment(departmentId),
     ]);

     // Display total utilized budget
     console.log(
       `Total utilized budget for department ${departmentId}: ${totalUtilizedBudget}`
     );

     // Display employee details
     console.table(employeeDetails);
  } catch (error) {
    console.error(
      "Error in viewing total utilized budget by department:",
      error
    );
  }
}


module.exports = {
  handleViewAllRoles,
  handleViewAllManagers,
  handleViewAllDepartments,
  handleViewAllEmployees,
  handleViewEmployeesByManager,
  handleViewEmployeesByDepartment,
  handleViewRolesByDepartment,
  handleViewTotalBudgetByAllDepartments,
  handleViewTotalUtilizedBudgetByDepartment,
};
