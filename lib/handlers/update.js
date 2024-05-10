const chalk = require("chalk");

const queries = require("../queries/queries");
const inquirer = require("inquirer");

// Update Role Salary Handler
async function handleUpdateRoleSalary(roleId, newSalary) {
  try {
    const roles = await queries.viewAllRoles();
    const roleChoices = roles.map((role) => ({
      name: `${role.id}: ${role.title} - Current Salary: ${role.salary}`,
      value: role.id,
    }));
    // Prompt the user to choose a role for salary update
    const { roleId } = await inquirer.prompt({
      type: "list",
      name: "roleId",
      message: "Choose the role to update salary:",
      choices: roleChoices,
    });

    // Find the selected role based on the role ID
    const selectedRole = roles.find((role) => role.id === roleId);

    // Display the current salary of the selected role
    console.log(
      `Current salary for ${selectedRole.title}: ${selectedRole.salary}`
    );

    // Prompt the user to enter the new salary
    const { newSalary } = await inquirer.prompt({
      type: "input",
      name: "newSalary",
      message: "Enter the new salary:",
    });

    // Call the updateRoleSalary function with the chosen role ID and new salary
    await queries.updateRoleSalary(roleId, newSalary);

    console.log("Role salary updated successfully!");
    // displayRoleOptions(); // Go back to role options
  } catch (error) {
    console.error("Error updating role salary:", error);
  }
}

// Update Employee Role Handler
async function handleUpdateEmployeeRole(employeeId, newRoleId) {
  try {
    // Fetch all employees and roles
    const employees = await queries.viewAllEmployees();
    const roles = await queries.viewAllRoles();

    // Create arrays of choices for employees and roles
    const employeeChoices = employees.map((employee) => ({
      name: `${employee.first_name} ${employee.last_name} - Current Role: ${employee.role_title}`,
      value: employee.id,
    }));
    const roleChoices = roles.map((role) => ({
      name: role.title,
      value: role.id,
    }));

    // Prompt the user to select an employee
    const { employeeId } = await inquirer.prompt({
      type: "list",
      name: "employeeId",
      message: "Select the employee to update role:",
      choices: employeeChoices,
    });

    // Prompt the user to select a new role for the employee
    const { newRoleId } = await inquirer.prompt({
      type: "list",
      name: "newRoleId",
      message: `Select the new role for the employee:`,
      choices: roleChoices,
    });

    // Update the employee's role with the new role ID
    await queries.updateEmployeeRole(employeeId, newRoleId);
    console.log("Employee role updated successfully!");

    // Display employee options
    displayEmployeeOptions();
  } catch (error) {
    console.error("Error updating employee role:", error);
  }
}

async function handleUpdateRole() {
  try {
    const updateRoleOptions = [
      "➣ Update Role Title",
      "➣ Update Role Department",
      "➣ Update Role Salary\n",
      chalk.red("*** Back to Role Options ***\n"),
    ];

    const { updateRoleOption } = await inquirer.prompt([
      {
        type: "list",
        name: "updateRoleOption",
        message: "Update Role:",
        choices: updateRoleOptions,
      },
    ]);

    switch (updateRoleOption) {
      case "➣ Update Role Title":
        await handleUpdateRoleTitle();
        break;
      case "➣ Update Role Department":
        await handleUpdateRoleDepartment();
        break;
      case "➣ Update Role Salary\n":
        await handleUpdateRoleSalary();
        break;
      case chalk.red("*** Back to Role Options ***\n"):
        break;
    }
  } catch (error) {
    console.error("Error updating role:", error);
  }
}

// Update Employee Manager Handler
async function handleUpdateEmployeeManager(employeeId, newManagerId) {
  try {
    // Fetch all employees and managers
    const employees = await queries.viewAllEmployees();
    let managers = await queries.viewAllManagers();

    // Filter employees who have a manager
    const employeesWithManagers = employees.filter(
      (employee) => employee.manager
    );

    // Prompt the user to select an employee who has a manager
    const { employeeId } = await inquirer.prompt({
      type: "list",
      name: "employeeId",
      message: "Choose an employee to update manager:",
      choices: employeesWithManagers.map((employee) => ({
        name: `${employee.first_name} ${employee.last_name} - Current Manager: ${employee.manager}`,
        value: employee.id,
        manager: employee.manager, // Include manager name for each employee
      })),
    });

    // Find the selected employee
    const selectedEmployee = employeesWithManagers.find(
      (emp) => emp.id === employeeId
    );

    // Fetch all managers, including those marked as managers when adding employees
    if (selectedEmployee.ismanager) {
      managers.push(selectedEmployee);
    }

    // Prepend a "null" option for cases where the employee doesn't have a manager
    managers.unshift({
      manager_first_name: "None",
      manager_last_name: "",
      manager_id: null,
    });

    // Prompt the user to select a new manager for the employee
    const { newManagerId } = await inquirer.prompt({
      type: "list",
      name: "newManagerId",
      message: `Current Manager: ${
        selectedEmployee.manager || "None"
      }.\nChoose a new manager for ${selectedEmployee.first_name} ${
        selectedEmployee.last_name
      }:`,
      choices: managers.map((manager) => ({
        name: `${manager.manager_first_name} ${manager.manager_last_name}`, // Display manager's first and last name
        value: manager.manager_id,
      })),
    });

    // Update the employee's manager with the new manager ID
    await queries.updateEmployeeManager(employeeId, newManagerId);
    console.log("Employee manager updated successfully!");
  } catch (error) {
    console.error("Error updating employee manager:", error);
  }
}

// Update Department Name Handler
async function handleUpdateDepartmentName(departmentId, newDepartmentName) {
  try {
    // Fetch all departments to display them as options
    const departments = await queries.viewAllDepartments();

    // Generate list of department names for the prompt
    const departmentChoices = departments.map((department) => ({
      name: department.name,
      value: department.id,
    }));

    // Ask user to select a department
    const selectedDepartment = await inquirer.prompt([
      {
        type: "list",
        name: "departmentId",
        message: "Select a department to update:",
        choices: departmentChoices,
      },
    ]);

    // Ask user for the new department name
    const { newDepartmentName } = await inquirer.prompt([
      {
        type: "input",
        name: "newDepartmentName",
        message: "Enter the new department name:",
      },
    ]);

    // Confirm the change
    const { confirm } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: `Are you sure you want to change the department name to '${newDepartmentName}'?`,
      },
    ]);

    if (confirm) {
      // Update department name
      await queries.updateDepartmentName(
        selectedDepartment.departmentId,
        newDepartmentName
      );
      console.log("Department name updated successfully!");
    } else {
      console.log("Update canceled.");
    }

    // Go back to department options
    // displayDepartmentOptions();
  } catch (error) {
    console.error("Error updating department name:", error);
  }
}

// Update Role Title Handler
async function handleUpdateRoleTitle(roleId, newTitle) {
  try {
    // Fetch all roles to display them as options
    const roles = await queries.viewAllRoles();

    // Generate list of role titles for the prompt
    const roleChoices = roles.map((role) => ({
      name: role.title,
      value: role.id,
    }));

    // Ask user to select a role
    const selectedRole = await inquirer.prompt([
      {
        type: "list",
        name: "roleId",
        message: "Select a role to update:",
        choices: roleChoices,
      },
    ]);

    // Ask user for the new role title
    const { newTitle } = await inquirer.prompt([
      {
        type: "input",
        name: "newTitle",
        message: "Enter the new role title:",
      },
    ]);

    // Confirm the change
    const { confirm } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: `Are you sure you want to change the role title to '${newTitle}'?`,
      },
    ]);

    if (confirm) {
      // Update role title
      await queries.updateRoleTitle(selectedRole.roleId, newTitle);
      console.log("Role title updated successfully!");
    } else {
      console.log("Update canceled.");
    }

    // Go back to role options
    // displayRoleOptions();
  } catch (error) {
    console.error("Error updating role title:", error);
  }
}

// Update Role Department Handler
async function handleUpdateRoleDepartment(roleId, newDepartmentId) {
  try {
    // Fetch all roles to display them as options
    const roles = await queries.viewAllRoles();

    // Generate list of role titles for the prompt
    const roleChoices = roles.map((role) => ({
      name: `${role.title} - Current Department: ${role.department_name}`,
      value: role.id,
    }));

    // Ask user to select a role
    const selectedRole = await inquirer.prompt([
      {
        type: "list",
        name: "roleId",
        message: "Select a role to update its department:",
        choices: roleChoices,
      },
    ]);

    // Fetch all departments to display them as options
    const departments = await queries.viewAllDepartments();

    // Generate list of department names for the prompt
    const departmentChoices = departments.map((department) => ({
      name: department.name,
      value: department.id,
    }));

    // Ask user to select a new department
    const { newDepartmentId } = await inquirer.prompt([
      {
        type: "list",
        name: "newDepartmentId",
        message: "Select a new department for the role:",
        choices: departmentChoices,
      },
    ]);

    // Confirm the change
    const { confirm } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: `Are you sure you want to change the department for this role?`,
      },
    ]);

    if (confirm) {
      // Update role department
      await queries.updateRoleDepartment(selectedRole.roleId, newDepartmentId);
      console.log("Role department updated successfully!");
    } else {
      console.log("Update canceled.");
    }

    // Go back to role options
    displayRoleOptions();
  } catch (error) {
    console.error("Error updating role department:", error);
  }
}

module.exports = {
  handleUpdateRole,
  handleUpdateRoleSalary,
  handleUpdateEmployeeRole,
  handleUpdateEmployeeManager,
  handleUpdateDepartmentName,
  handleUpdateRoleTitle,
  handleUpdateRoleDepartment,
};
