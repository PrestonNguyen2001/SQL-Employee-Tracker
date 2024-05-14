// Handler.js
const inquirer = require("inquirer");
const chalk = require("chalk");
const Tables = require("../tables/table");

// Global functions for logging success and error messages
function logSuccess(message) {
  console.log(chalk.bgGreen.black("\n SUCCESS ") + " " + chalk.green(message));
}
function logError(message) {
  console.log(chalk.bgRed.black(" ERROR ") + " " + chalk.red(message));
}

class Handler {
  constructor(queries) {
    this.queries = queries;
  }

  // -------------------------------------
  // -- Add Handlers
  // -------------------------------------

  // Add Department Handler
  async addDepartment() {
    try {
      const { name } = await inquirer.prompt({
        type: "input",
        name: "name",
        message: "Enter the name of the department:",
      });
      const result = await this.queries.addDepartment(name);
      if (result.success) {
        logSuccess("Department added successfully.\n");
      } else {
        logError(result.message);
      }
    } catch (error) {
      console.error(chalk.red("Error while adding department:"), error);
    }
  }

  // Add Role Handler
  async addRole() {
    try {
      const departments = await this.queries.viewAllDepartments();

      if (departments.length === 0) {
        console.log(
          "No departments found. Please add departments before adding roles."
        );
        return;
      }

      const departmentChoices = departments.map((department) => ({
        name: department.name,
        value: department.id,
      }));

      const roleDetails = await inquirer.prompt([
        {
          type: "input",
          name: "title",
          message: "Enter the title of the role:",
        },
        {
          type: "input",
          name: "salary",
          message: "Enter the salary for the role:",
          validate: function (value) {
            const valid = !isNaN(parseFloat(value));
            return valid || "Please enter a valid number for the salary.";
          },
        },
        {
          type: "list",
          name: "departmentId",
          message: "Choose the department for the role:",
          choices: departmentChoices,
        },
      ]);

      await this.queries.addRole(
        roleDetails.title,
        parseFloat(roleDetails.salary),
        roleDetails.departmentId
      );
      logSuccess("Role added successfully!\n");
    } catch (error) {
      logError("Error adding role.\n");
    }
  }

  // Add Employee Handler
  async addEmployee() {
    try {
      const { isManager } = await inquirer.prompt([
        {
          type: "confirm",
          name: "isManager",
          message: "Is this employee a manager?",
          default: false,
        },
      ]);

      const roles = await this.queries.viewAllRoles();
      const roleChoices = roles.map((role) => ({
        name: `${role.title} (ID: ${role.id})`,
        value: role.id,
      }));

      if (isManager) {
        await this.addEmployeeAsManager(roleChoices);
      } else {
        const { hasManager } = await inquirer.prompt([
          {
            type: "confirm",
            name: "hasManager",
            message: "Does this employee have a manager?",
            default: true,
          },
        ]);

        if (hasManager) {
          const managers = await this.queries.viewAllManagers();
          const managerChoices = managers.map((manager) => ({
            name: `${manager.manager_first_name} ${manager.manager_last_name} (ID: ${manager.manager_id})`,
            value: manager.manager_id,
          }));
          await this.addEmployeeWithManagerOption(roleChoices, managerChoices);
        } else {
          await this.addEmployeeNoManager(roleChoices);
        }
      }
    } catch (error) {
      console.error("Error during employee addition process:", error);
    }
  }

  // Add Employee as Manager
  async addEmployeeAsManager(roleChoices) {
    try {
      const answers = await inquirer.prompt([
        {
          type: "input",
          name: "firstName",
          message: "Enter the first name of the manager:",
        },
        {
          type: "input",
          name: "lastName",
          message: "Enter the last name of the manager:",
        },
        {
          type: "list",
          name: "roleId",
          message: "Select the role for the manager:",
          choices: roleChoices,
        },
      ]);

      await this.queries.addEmployee(
        answers.firstName,
        answers.lastName,
        answers.roleId,
        null, 
        true 
      );

      logSuccess("Manager added successfully!");
    } catch (error) {
      logError("Error adding manager.");
    }
  }

  // Add Employee without Manager
  async addEmployeeNoManager(roleChoices) {
    try {
      const answers = await inquirer.prompt([
        {
          type: "input",
          name: "firstName",
          message: "Enter the first name of the employee:",
        },
        {
          type: "input",
          name: "lastName",
          message: "Enter the last name of the employee:",
        },
        {
          type: "list",
          name: "roleId",
          message: "Select the role for the employee:",
          choices: roleChoices,
        },
      ]);

      await this.queries.addEmployee(
        answers.firstName,
        answers.lastName,
        answers.roleId,
        null, 
        false 
      );

      logSuccess("Employee added successfully!");
    } catch (error) {
      logError("Error adding employee.");
    }
  }
  // Add Employee with Manager
  async addEmployeeWithManagerOption(roleChoices, managerChoices) {
    try {
      const answers = await inquirer.prompt([
        {
          type: "input",
          name: "firstName",
          message: "Enter the first name of the employee:",
        },
        {
          type: "input",
          name: "lastName",
          message: "Enter the last name of the employee:",
        },
        {
          type: "list",
          name: "roleId",
          message: "Select the role for the employee:",
          choices: roleChoices,
        },
        {
          type: "list",
          name: "managerId",
          message: "Select the manager for the employee:",
          choices: managerChoices,
          default: () =>
            managerChoices.length > 0 ? managerChoices[0].value : null,
        },
      ]);

      await this.queries.addEmployee(
        answers.firstName,
        answers.lastName,
        answers.roleId,
        answers.managerId,
        false 
      );

      logSuccess("Employee added successfully!");
    } catch (error) {
      logError("Error adding employee.");
    }
  }

  // -------------------------------------
  // -- Delete Handlers
  // -------------------------------------

  // Delete Department Handler
  async deleteDepartment() {
    try {
      const departments = await this.queries.viewAllDepartments();
      if (!departments || departments.length === 0) {
        console.log("No departments available to delete.");
        return;
      }

      const departmentChoices = departments.map((department) => ({
        name: `${department.id}: ${department.name}`,
        value: department.id,
      }));

      const { departmentId } = await inquirer.prompt({
        type: "list",
        name: "departmentId",
        message: "Choose the department to delete:",
        choices: departmentChoices,
      });

      const { confirmDelete } = await inquirer.prompt({
        type: "confirm",
        name: "confirmDelete",
        message: "Are you sure you want to delete this department?",
      });

      if (!confirmDelete) {
        console.log("Department deletion canceled.");
        return;
      }

      const roles = await this.queries.getRolesByDepartment(departmentId);
      if (roles.length > 0) {
        console.log(
          "Some roles need to be reassigned to another department before this department can be deleted."
        );
        for (const role of roles) {
          console.log(`Reassign Role ID ${role.id}: ${role.title}`);

          const newDepartmentChoices = departments
            .filter((dep) => dep.id !== departmentId)
            .map((department) => ({
              name: `${department.id}: ${department.name}`,
              value: department.id,
            }));

          const { newDepartmentId } = await inquirer.prompt({
            type: "list",
            name: "newDepartmentId",
            message: `Select new department for the role '${role.title}':`,
            choices: newDepartmentChoices,
          });

          await this.queries.updateRoleDepartment(role.id, newDepartmentId);
          console.log(`${role.title} reassigned to new department.`);
        }
      }

      const deleteResult = await this.queries.deleteDepartment(departmentId);
      if (deleteResult) {
        logSuccess("Department deleted successfully!");
      } else {
        logError("Error deleting department.");
      }
    } catch (error) {
      console.error("Error deleting department:", error);
    }
  }

  // Delete Role Handler
  async deleteRole() {
    try {
      const roles = await this.queries.viewAllRoles();
      const roleChoices = roles.map((role) => ({
        name: `${role.id}: ${role.title}`,
        value: role.id,
      }));

      const { roleId } = await inquirer.prompt([
        {
          type: "list",
          name: "roleId",
          message: "Choose the role to delete:",
          choices: roleChoices,
        },
      ]);

      const { confirmDelete } = await inquirer.prompt([
        {
          type: "confirm",
          name: "confirmDelete",
          message: "Are you sure you want to delete this role?",
          default: false,
        },
      ]);

      if (confirmDelete) {
        const deletionResult = await this.queries.deleteRole(roleId);
        if (deletionResult.success) {
          logSuccess("Role deleted successfully!");
          return;
        }

        if (deletionResult.employees) {
          console.log(
            "Some employees need to be reassigned before this role can be deleted.\n"
          );
          for (const emp of deletionResult.employees) {
            console.log(
              `Reassign Employee ID ${emp.id}: ${emp.first_name} ${emp.last_name}\n`
            );
            const { newRoleId } = await inquirer.prompt([
              {
                type: "list",
                name: "newRoleId",
                message: `Select new role for ${emp.first_name} ${emp.last_name}:`,
                choices: roleChoices.filter((role) => role.value !== roleId),
              },
            ]);

            await this.queries.updateEmployeeRole(emp.id, newRoleId);
            console.log(
              `${emp.first_name} ${emp.last_name} reassigned to new role.`
            );
          }

          const finalDeletionResult = await this.queries.deleteRole(roleId);
          if (finalDeletionResult.success) {
            logSuccess("Role deleted successfully!");
          } else {
            logError("Error deleting role.");
          }
        }
      } else {
        console.log("Deletion cancelled.");
      }
    } catch (error) {
      console.error("Error deleting role:", error);
    }
  }

  // Delete Employee Handler
  async deleteEmployee() {
    try {
      const employees = await this.queries.viewAllEmployees();
      const employeeChoices = employees.map((employee) => ({
        name: `${employee.first_name} ${employee.last_name} (ID: ${employee.id})`,
        value: employee.id,
      }));

      const { employeeId, confirmDelete } = await inquirer.prompt([
        {
          type: "list",
          name: "employeeId",
          message: "Choose the employee to delete:",
          choices: employeeChoices,
        },
        {
          type: "confirm",
          name: "confirmDelete",
          message: "Are you sure you want to delete this employee?",
          default: false,
        },
      ]);

      if (!confirmDelete) {
        console.log("Deletion cancelled.");
        return;
      }

      const managedEmployees = await this.queries.viewEmployeesByManager(
        employeeId
      );
      if (managedEmployees.length > 0) {
        console.log(
          chalk.yellow(
            "This employee is a manager of other employees. Please reassign them before deletion."
          )
        );
        for (const emp of managedEmployees) {
          console.log(
            chalk.underline(
              `Reassign Employee ID ${emp.id}: ${emp.first_name} ${emp.last_name}\n`
            )
          );
          const { newManagerId } = await inquirer.prompt([
            {
              type: "list",
              name: "newManagerId",
              message: `Select a new manager for '${emp.first_name} ${emp.last_name}':`,
              choices: employeeChoices.filter((e) => e.value !== employeeId),
            },
          ]);
          await this.queries.updateEmployeeManager(emp.id, newManagerId);
          console.log(
            `Manager for ${emp.first_name} ${emp.last_name} reassigned to new manager.`
          );
        }
      }

      await this.queries.deleteEmployee(employeeId);
      logSuccess("Employee deleted successfully!");
    } catch (error) {
      logError("Error deleting employee.");
    }
  }

  // -------------------------------------
  // -- Sort Handlers
  // -------------------------------------

  // Sort Employees by Last Name Handler
  async sortEmployeesByLastName() {
    try {
      const employees = await this.queries.sortEmployeesByLastName();
      const table = Tables.sortEmployeesByLastNameTable(employees);

      console.log(table.toString());
    } catch (error) {
      console.error("Error sorting employees by last name:", error);
    }
  }

  // Sort Employees by Salary Handler //
  async sortEmployeesBySalary() {
    try {
      const employees = await this.queries.sortEmployeesBySalary();
      if (!employees) {
        throw new Error("No employees data returned");
      }

      const table = Tables.sortEmployeesBySalaryTable(employees);
      if (!table || typeof table.toString !== "function") {
        throw new Error(
          "Table object is not defined or does not have a toString method"
        );
      }
      console.log(table.toString());
    } catch (error) {
      console.error("Error sorting employees by salary:", error);
    }
  }

  // -------------------------------------
  // -- Update Handlers
  // -------------------------------------

  // Update Role Salary Handler
  async updateRoleSalary() {
    try {
      const roles = await this.queries.viewAllRoles();
      const roleChoices = roles.map((role) => ({
        name: `${role.id}: ${role.title} - Current Salary: ${role.salary}`,
        value: role.id,
      }));
      const { roleId } = await inquirer.prompt({
        type: "list",
        name: "roleId",
        message: "Choose the role to update salary:",
        choices: roleChoices,
      });

      const { newSalary } = await inquirer.prompt({
        type: "input",
        name: "newSalary",
        message: "Enter the new salary:",
      });

      await this.queries.updateRoleSalary(roleId, newSalary);
      logSuccess("Role salary updated successfully!");
    } catch (error) {
      logError("Error updating role salary.");
    }
  }

  // Update Employee Role Handler
  async updateEmployeeRole() {
    try {
      const employees = await this.queries.viewAllEmployees();
      if (employees.length === 0) {
        console.log(
          chalk.yellow(
            "No employees found. Please add employees before updating roles."
          )
        );
        return;
      }

      const roles = await this.queries.viewAllRoles();
      if (roles.length === 0) {
        console.log(
          chalk.yellow(
            "No roles found. Please add roles before updating employee roles."
          )
        );
        return;
      }

      const employeeChoices = employees.map((employee) => ({
        name: `${chalk.bold(employee.first_name)} ${chalk.bold(
          employee.last_name
        )} | ${chalk.hex("#FFC300").bold("Current Role:")} ${chalk
          .hex("#FF5733")
          .bold(employee.role_title)}`,
        value: employee.id,
      }));

      const roleChoices = roles.map((role) => ({
        name: `${chalk.hex("#34ebd8").bold(role.title)}`,
        value: role.id,
      }));

      console.log(chalk.blueBright("Employee Role Update\n"));
      const { employeeId } = await inquirer.prompt({
        type: "list",
        name: "employeeId",
        message: chalk.magenta("Select the employee to update role:\n"),
        choices: employeeChoices,
      });

      const { newRoleId } = await inquirer.prompt({
        type: "list",
        name: "newRoleId",
        message: chalk.magenta("Select the new role for the employee:"),
        choices: roleChoices,
      });

      await this.queries.updateEmployeeRole(employeeId, newRoleId);
      logSuccess("Employee role updated successfully!");
    } catch (error) {
      logError("Error updating employee role.");
    }
  }

  // Update Role Handler (wrapper for various role updates)
  async updateRole() {
    try {
      const updateRoleOptions = [
        "",
        "➣ Update Role Title",
        "➣ Update Role Department",
        "➣ Update Role Salary\n",
        chalk.red("*** Back to Role Options ***\n"),
      ];

      const { updateRoleOption } = await inquirer.prompt({
        type: "list",
        name: "updateRoleOption",
        message: "Update Role:",
        choices: updateRoleOptions,
      });

      switch (updateRoleOption) {
        case "➣ Update Role Title":
          await this.updateRoleTitle();
          break;
        case "➣ Update Role Department":
          await this.updateRoleDepartment();
          break;
        case "➣ Update Role Salary\n":
          await this.updateRoleSalary();
          break;
        case chalk.red("*** Back to Role Options ***\n"):
          break;
      }
    } catch (error) {
      console.error("Error updating role:", error);
    }
  }

  // Update Role Title Handler
  async updateRoleTitle() {
    try {
      const roles = await this.queries.viewAllRoles();
      const roleChoices = roles.map((role) => ({
        name: role.title,
        value: role.id,
      }));

      const { roleId } = await inquirer.prompt({
        type: "list",
        name: "roleId",
        message: "Select a role to update:",
        choices: roleChoices,
      });

      const { newTitle } = await inquirer.prompt({
        type: "input",
        name: "newTitle",
        message: "Enter the new role title:",
      });

      await this.queries.updateRoleTitle(roleId, newTitle);
      logSuccess("Role title updated successfully!");
    } catch (error) {
      logError("Error updating role title.");
    }
  }

  // Update Role Department Handler
  async updateRoleDepartment() {
    try {
      const roles = await this.queries.viewAllRoles();
      const roleChoices = roles.map((role) => ({
        name: `${role.title} - Current Department: ${role.department_name}`,
        value: role.id,
      }));

      const { roleId } = await inquirer.prompt({
        type: "list",
        name: "roleId",
        message: "Select a role to update its department:",
        choices: roleChoices,
      });

      const departmentsResponse = await this.queries.viewAllDepartments();
      const departments = departmentsResponse.departments;

      const departmentChoices = departments.map((department) => ({
        name: department.name,
        value: department.id,
      }));

      const { newDepartmentId } = await inquirer.prompt({
        type: "list",
        name: "newDepartmentId",
        message: "Select a new department for the role:",
        choices: departmentChoices,
      });

      await this.queries.updateRoleDepartment(roleId, newDepartmentId);
      logSuccess("Role department updated successfully!");
    } catch (error) {
      logError("Error updating role department.");
    }
  }

  // Update Employee Manager Handler
  async updateEmployeeManager() {
    try {
      const employees = await this.queries.viewAllEmployees();

      const nonManagerEmployees = employees.filter((emp) => !emp.is_manager);

      const employeeChoices = nonManagerEmployees.map((employee) => ({
        name: `${chalk.green(employee.first_name)} ${chalk.green(
          employee.last_name
        )} - ${chalk.yellow("Current Manager")}: ${
          employee.manager_name
            ? chalk.blue(employee.manager_name)
            : chalk.red("None")
        }`,
        value: employee.id,
      }));

      const { employeeId } = await inquirer.prompt({
        type: "list",
        name: "employeeId",
        message: "Select an employee to update manager:",
        choices: employeeChoices,
      });

      const managers = employees.filter((emp) => emp.is_manager);
      const managerChoices = managers.map((manager) => ({
        name: `${manager.first_name} ${manager.last_name}`,
        value: manager.id,
      }));

      const { newManagerId } = await inquirer.prompt({
        type: "list",
        name: "newManagerId",
        message: "Select a new manager for the employee:",
        choices: managerChoices,
      });

      await this.queries.updateEmployeeManager(employeeId, newManagerId);
      logSuccess("Employee manager updated successfully!");
    } catch (error) {
      logError("Error updating employee manager.");
    }
  }

  // Update Department Name Handler
  async updateDepartmentName() {
    try {
      const departments = await this.queries.viewAllDepartments();

      if (!departments || departments.length === 0) {
        console.log("No departments found.");
        return;
      }

      const departmentChoices = departments.map((department) => ({
        name: department.name,
        value: department.id,
      }));

      const { departmentId } = await inquirer.prompt({
        type: "list",
        name: "departmentId",
        message: "Select a department to update name:",
        choices: departmentChoices,
      });

      const { newDepartmentName } = await inquirer.prompt({
        type: "input",
        name: "newDepartmentName",
        message: "Enter the new department name:",
      });

      const result = await this.queries.updateDepartmentName(
        departmentId,
        newDepartmentName
      );

      if (result) {
        logSuccess("Department name updated successfully!");
      } else {
        logError("Error updating department name.");
      }
    } catch (error) {
      console.error("Error updating department name:", error);
    }
  }

  // -------------------------------------
  // --  View
  // -------------------------------------
  // View All Departments Handler //
  async viewAllDepartments() {
    try {
      const departments = await this.queries.viewAllDepartments();

      if (!Array.isArray(departments) || departments.length === 0) {
        logError("No departments found.");
        return;
      }

      const table = Tables.viewAllDepartmentsTable(departments);
      console.log(table.toString());
    } catch (error) {
      logError("Error viewing all departments.");
    }
  }

  // View All Roles Handler //
  async viewAllRoles() {
    try {
      const rolesResponse = await this.queries.viewAllRoles();

      if (!rolesResponse || rolesResponse.length === 0) {
        logError("No roles found.");
        return;
      }

      const table = Tables.viewAllRolesTable(rolesResponse);
      console.log(table.toString());
    } catch (error) {
      logError("Error viewing all roles.");
    }
  }

  // View All Employees Handler //
  async viewAllEmployees() {
    try {
      const employeesResponse = await this.queries.viewAllEmployees();
      if (!employeesResponse || employeesResponse.length === 0) {
        logError("No employees found.");
        return;
      }

      const table = Tables.viewAllEmployeesTable(employeesResponse);
      console.log(table.toString());
    } catch (error) {
      logError("Error viewing all employees.");
    }
  }

  // View All Managers Handler
  async viewAllManagers() {
    try {
      const managers = await this.queries.viewAllManagers();
      if (!managers || managers.length === 0) {
        logError("No managers found.");
        return;
      }
      const table = Tables.viewAllManagersTable(managers);

      console.log(table.toString());
    } catch (error) {
      logError("Error viewing all managers.");
    }
  }

  // View Employees by Manager Handler
  async viewEmployeesByManager() {
    try {
      const managers = await this.queries.viewAllManagers();
      if (managers.length === 0) {
        logError("No managers found.");
        return;
      }

      const managerChoices = managers.map((manager) => ({
        name: `${manager.manager_first_name} ${manager.manager_last_name}`,
        value: manager.manager_id,
      }));

      const response = await inquirer.prompt({
        type: "list",
        name: "managerId",
        message: "Choose a manager to view employees:",
        choices: managerChoices,
      });

      const employees = await this.queries.viewEmployeesByManager(
        response.managerId
      );
      if (employees.length === 0) {
        logError("No employees found for this manager.");
        return;
      }

      const table = Tables.viewEmployeesByManagerTable(employees);
      console.log(table.toString());
    } catch (error) {
      logError("Error viewing employees by manager.");
    }
  }

  // Update Role Department Handler
  async updateRoleDepartment() {
    try {
      const roles = await this.queries.viewAllRoles();
      const roleChoices = roles.map((role) => ({
        name: `${role.title} - Current Department: ${role.department_name}`,
        value: role.id,
      }));

      const { roleId } = await inquirer.prompt({
        type: "list",
        name: "roleId",
        message: "Select a role to update its department:",
        choices: roleChoices,
      });

      const departments = await this.queries.viewAllDepartments();

      const departmentChoices = departments.map((department) => ({
        name: department.name,
        value: department.id,
      }));

      const { newDepartmentId } = await inquirer.prompt({
        type: "list",
        name: "newDepartmentId",
        message: "Select a new department for the role:",
        choices: departmentChoices,
      });

      await this.queries.updateRoleDepartment(roleId, newDepartmentId);
      logSuccess("Role department updated successfully!");
    } catch (error) {
      logError("Error updating role department.");
    }
  }

  // View Employees by Department Handler //
  async viewEmployeesByDepartment() {
    try {
      const departmentsResponse = await this.queries.viewAllDepartments();

      if (
        !Array.isArray(departmentsResponse) ||
        departmentsResponse.length === 0
      ) {
        logError("No departments available to display.");
        return;
      }

      const departmentChoices = departmentsResponse.map((department) => ({
        name: department.name,
        value: department.id,
      }));

      const { departmentId } = await inquirer.prompt({
        type: "list",
        name: "departmentId",
        message: "Select a department:",
        choices: departmentChoices,
      });


      const employeesResponse = await viewEmployeesByDepartment(departmentId);

      if (!employeesResponse || employeesResponse.length === 0) {
        logError("No employees found in this department.");
        return;
      }

      const table = Tables.viewEmployeesByDepartmentTable(employeesResponse);
      console.log(table.toString());
    } catch (error) {
      logError("Error viewing employees by department:", error);
    }
  }

  // View Roles by Department Handler //
  async viewRolesByDepartment() {
    try {
      const departments = await this.queries.viewAllDepartments();
      if (departments.length === 0) {
        logError("No departments found.");
        return;
      }

      const departmentChoices = departments.map((department) => ({
        name: department.name,
        value: department.id,
      }));

      const { departmentId } = await inquirer.prompt({
        type: "list",
        name: "departmentId",
        message: "Select a department to view roles:",
        choices: departmentChoices,
      });

      const roles = await this.queries.getRolesByDepartment(departmentId);
      if (roles.length === 0) {
        logError("No roles found for this department.");
        return;
      }

      const table = Tables.viewRolesByDepartmentTable(roles);
      console.log(table.toString());
    } catch (error) {
      logError("Error viewing roles by department.");
    }
  }

  // View Employees by Role Handler //
  async viewEmployeesByRole() {
    try {
      const roles = await this.queries.viewAllRoles();
      if (!roles || roles.length === 0) {
        logError("No roles found.");
        return;
      }
      const roleChoices = roles.map((role) => ({
        name: role.title,
        value: role.id,
      }));

      const { roleId } = await inquirer.prompt({
        type: "list",
        name: "roleId",
        message: "Choose a role to view employees:",
        choices: roleChoices,
      });

      const employees = await this.queries.viewEmployeesByRole(roleId);
      if (!employees || employees.length === 0) {
        logError("No employees found for this role.");
        return;
      }
      const table = Tables.viewEmployeesByRoleTable(employees);

      console.log(table.toString());
    } catch (error) {
      logError("Error viewing employees by role.");
    }
  }

  // View Total Budget by All Departments Handler //
  async viewTotalBudgetByAllDepartments() {
    try {
      const { totalBudget, departments } =
        await this.queries.viewTotalBudgetByAllDepartments();

      if (!departments || departments.length === 0) {
        logError("No departments available to display.");
        return;
      }

      const table = Tables.viewTotalBudgetTable(departments);
      console.log(
        chalk.bold(
          "\nTotal Budget Across All Departments: " +
            chalk.green(`${totalBudget}\n`)
        )
      );
      console.log(table.toString());
    } catch (error) {
      console.error("Error viewing total budget by all departments:", error);
    }
  }

  // View Total Utilized Budget by Department Handler //
  async viewTotalUtilizedBudgetByDepartment() {
    try {
      const departmentsResponse = await this.queries.viewAllDepartments();
      if (!departmentsResponse || departmentsResponse.length === 0) {
        logError("No departments available to display.");
        return;
      }

      const departmentChoices = departmentsResponse.map((department) => ({
        name: department.name,
        value: department.id,
      }));

      const { departmentId } = await inquirer.prompt({
        type: "list",
        name: "departmentId",
        message: "Select a department:",
        choices: departmentChoices,
      });

      const totalUtilizedBudget =
        await this.queries.viewTotalUtilizedBudgetByDepartment(departmentId);
      const employees = await this.queries.viewEmployeeDetailsByDepartment(
        departmentId
      );

      console.log(
        "\nTotal Utilized Budget: " +
          chalk.green(`${totalUtilizedBudget.toLocaleString()}\n`)
      );

      console.log("Department Budget Details:\n");
      const table = Tables.viewUtilizedBudgetTable(employees);
      console.log(table.toString());
    } catch (error) {
      logError("Error viewing total utilized budget by department.");
    }
  }

  // View Employees by Department Handler
  async viewEmployeesByDepartment() {
    try {
      const response = await this.queries.viewAllDepartments();

      if (!response || response.length === 0) {
        console.log("No departments available to display.");
        return;
      }

      const departmentChoices = response.map((department) => ({
        name: department.name,
        value: department.id,
      }));

      const { departmentId } = await inquirer.prompt({
        type: "list",
        name: "departmentId",
        message: "Select a department:",
        choices: departmentChoices,
      });

      const employees = await this.queries.viewEmployeesByDepartment(
        departmentId
      );

      if (!employees || employees.length === 0) {
        console.log("No employees found in this department.");
        return;
      }

      const table = Tables.viewEmployeesByDepartmentTable(employees);
    } catch (error) {
      console.error("Error viewing employees by department:", error);
    }
  }
}

module.exports = Handler;
