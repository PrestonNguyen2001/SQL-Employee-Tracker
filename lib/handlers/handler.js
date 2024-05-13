// Handler.js
const inquirer = require("inquirer");
const chalk = require("chalk");
const Tables = require("../tables/table");
const DynamicColorCoding = require("../tables/colorCoding");


 function logSuccess(message) {
   console.log(chalk.bgGreen.black("\n SUCCESS ") + " " + chalk.green(message));
 }
 function logError(message) {
   console.log(chalk.bgRed.black(" ERROR ") + " " + chalk.red(message));
 }

 
//  logSuccess("File uploaded successfully.");
//  logError("Failed to connect to the server.");


class Handler {
  constructor(queries) {
    this.queries = queries;
  }

  // -------------------------------------
  // -- Add Handlers
  // -------------------------------------

  //  console.log(chalk.green("✔") + " Installation complete.");
  // console.log(chalk.red("✖") + " Installation failed.");
  // console.log(chalk.green("✔ Success"), chalk.red("✖ Error"));

  // Add Department Handler
  async addDepartment() {
    try {
      const { name } = await inquirer.prompt({
        type: "input",
        name: "name",
        message: "Enter the name of the department:",
      });
      const success = await this.queries.addDepartment(name); // Capture the return value to determine the outcome
      if (success) {
        logSuccess("\nDepartment added successfully.\n"); // Inform the user that the department was added
      } else {
        logError("\nFailed to add department.\n"); // Inform the user that the department could not be added
      }
    } catch (error) {
      console.error(chalk.red("Error while adding department:"), error); // Error message in red for consistency
    }
  }

  // Add Role Handler
  async addRole() {
    try {
      // Fetch all departments to display as options
      const departmentsResponse = await this.queries.viewAllDepartments();
      const departments = departmentsResponse.departments;

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

      // Prompt user for role details including choosing a department from the list
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

      // Call the function to add a role with the details provided
      await this.queries.addRole(
        roleDetails.title,
        parseFloat(roleDetails.salary), // Ensure salary is parsed as a float
        roleDetails.departmentId
      );
      logSuccess("\nRole added successfully!\n"); // Inform the user that the role was added
    } catch (error) {
      logError("\nError adding role.\n"); // Inform the user that the role could not be added
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
        // Ask if the non-manager employee has a manager
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
          // Proceed to add an employee without a manager
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
        true, // is_manager set to true
        null // No manager for this manager
      );

      logSuccess("Employee added successfully!");
    } catch (error) {
      logError("Error adding employee.");
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
        false, // is_manager set to false
        null // No manager for this employee
      );

      logSuccess("Employee Added!");
    } catch (error) {
      logError("Error adding employee.");
    }
  }

  //   const answers = await inquirer.prompt([
  //     {
  //       type: "input",
  //       name: "firstName",
  //       message: "Enter the first name of the manager:",
  //     },
  //     {
  //       type: "input",
  //       name: "lastName",
  //       message: "Enter the last name of the manager:",
  //     },
  //     {
  //       type: "list",
  //       name: "roleId",
  //       message: "Select the role for the manager:",
  //       choices: roleChoices,
  //     },
  //   ]);

  //   // Notice the order of parameters and where true/false is placed
  //   await this.queries.addEmployee(
  //     answers.firstName,
  //     answers.lastName,
  //     answers.roleId,
  //     true, // is_manager set to true
  //     null // No manager for this manager
  //   );

  // }

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

      // Again, note the order of parameters
      await this.queries.addEmployee(
        answers.firstName,
        answers.lastName,
        answers.roleId,
        false, // is_manager set to false
        answers.managerId // Manager ID selected
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
      const departmentsResponse = await this.queries.viewAllDepartments();
      const departments = departmentsResponse.departments;

      const confirmationMessage =
        chalk.bold("\nWARNING:") +
        " " +
        chalk.white.bgRed(" This action cannot be undone!\n") +
        "\n" +
        chalk.yellowBright.bold(
          "Are you sure you want to delete this department?"
        );

      if (departments.length === 0) {
        console.log("No departments found.");
        return;
      }

      const departmentChoices = departments.map((dept) => ({
        name: `${dept.id}: ${dept.name}`,
        value: dept.id,
      }));

      const { departmentId } = await inquirer.prompt([
        {
          type: "list",
          name: "departmentId",
          message: "Choose the department to delete:",
          choices: departmentChoices,
        },
      ]);

      const { confirmDelete } = await inquirer.prompt([
        {
          type: "confirm",
          name: "confirmDelete",
          message: confirmationMessage,
          default: false,
        },
      ]);

      if (!confirmDelete) {
        console.log("Deletion cancelled.");
        return;
      }

      const roles = await this.queries.getRolesByDepartment(departmentId);
      if (roles.length > 0) {
        console.log(
          chalk.yellow(
            "Some roles need to be reassigned to another department before this department can be deleted."
          )
        );
        for (const role of roles) {
          console.log(
            chalk.underline(`Reassign Role ID ${role.id}: ${role.title}\n`)
          );
          const { newDepartmentId } = await inquirer.prompt([
            {
              type: "list",
              name: "newDepartmentId",
              message: `Select new department for the role '${role.title}':`,
              choices: departmentChoices.filter(
                (dept) => dept.value !== departmentId
              ),
            },
          ]);

          // Update role department
          await this.queries.updateRoleDepartment(role.id, newDepartmentId);
          console.log(`${role.title} reassigned to new department.`);
        }
      }

      // Try deleting the department again after reassignments
      const finalDeletionResult = await this.queries.deleteDepartment(
        departmentId
      );
      if (finalDeletionResult) {
        logSuccess("\nDepartment deleted successfully!");
      } else {
        logError("\nDepartment could not be deleted.");
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
          logSuccess("\nRole deleted successfully!");
          return; // End the function if role is successfully deleted
        }

        // If there are employees still assigned, reassign them
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

            // Update employee role
            await this.queries.updateEmployeeRole(emp.id, newRoleId);
            console.log(
              `${emp.first_name} ${emp.last_name} reassigned to new role.`
            );
          }

          // Try deleting the role again after reassignments
          const finalDeletionResult = await this.queries.deleteRole(roleId);
          if (finalDeletionResult.success) {
            logSuccess("\nRole deleted successfully!");
          } else {
            console.log(
              "Role could still not be deleted after reassignment. Please check data integrity."
            );
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

      if (confirmDelete) {
        await this.queries.deleteEmployee(employeeId);
        logSuccess("\nEmployee deleted successfully!");
      } else {
        console.log("Deletion cancelled.");
      }
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
      const employees = await this.queries.sortEmployeesByLastName(); // This function should sort employees by last name
      const table = Tables.sortEmployeesByLastNameTable(employees);

      console.log(table.toString()); // Outputs the table to the console
    } catch (error) {
      console.error("Error sorting employees by last name:", error);
    }
  }

  // Sort Employees by Salary Handler //
  async sortEmployeesBySalary() {
    try {
      const employees = await this.queries.sortEmployeesBySalary(); // This function should sort employees by salary in your SQL query
      const table = Tables.sortEmployeesBySalaryTable(employees);

      console.log(table.toString()); // Outputs the table to the console
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
        name: `${chalk.hex("#34ebd8").bold(role.title)}`, // Applying teal color and bold style to role title
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
      console.log("Role title updated successfully!");
    } catch (error) {
      console.error("Error updating role title:", error);
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
      console.log("Role department updated successfully!");
    } catch (error) {
      console.error("Error updating role department:", error);
    }
  }

  // Update Employee Manager Handler
  async updateEmployeeManager() {
    try {
      // Fetch all employees
      const employees = await this.queries.viewAllEmployees();

      // Filter out managers from the list of employees for selection
      const nonManagerEmployees = employees.filter((emp) => !emp.is_manager);

      // Create choices for employees excluding managers
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

      // Prompt the user to select an employee (non-manager)
      const { employeeId } = await inquirer.prompt({
        type: "list",
        name: "employeeId",
        message: "Select an employee to update manager:",
        choices: employeeChoices,
      });

      // Retrieve potential managers, which are the original list of employees who are managers
      const managers = employees.filter((emp) => emp.is_manager);
      const managerChoices = managers.map((manager) => ({
        name: `${manager.first_name} ${manager.last_name}`,
        value: manager.id,
      }));

      // Prompt for selecting a new manager
      const { newManagerId } = await inquirer.prompt({
        type: "list",
        name: "newManagerId",
        message: "Select a new manager for the employee:",
        choices: managerChoices,
      });

      // Perform the update operation
      await this.queries.updateEmployeeManager(employeeId, newManagerId);
      console.log(chalk.green("Employee manager updated successfully!"));
    } catch (error) {
      console.error("Error updating employee manager:", error);
    }
  }

  // Update Department Name Handler
  async updateDepartmentName() {
    try {
      const departmentsResponse = await this.queries.viewAllDepartments();
      const departments = departmentsResponse.departments;

      if (departments.length === 0) {
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

      await this.queries.updateDepartmentName(departmentId, newDepartmentName);
      console.log("Department name updated successfully!");
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
      // Fetch all departments
      const departmentsResponse = await this.queries.viewAllDepartments();

      // Add a log to inspect the raw response
      // console.log("Departments Response:", departmentsResponse);

      // Extract departments from the response
      const departments =
        departmentsResponse && departmentsResponse.departments;

      // Add a log to check the extracted departments
      // console.log("Extracted Departments:", departments);

      if (!Array.isArray(departments) || departments.length === 0) {
        console.log("No departments found.");
        return;
      }

      // Create the departments table
      const table = Tables.viewAllDepartmentsTable(departments);

      // Output the table
      console.log(table.toString());
    } catch (error) {
      console.error("Error fetching all departments:", error);
    }
  }

  // View All Roles Handler //
  async viewAllRoles() {
    try {
      const rolesResponse = await this.queries.viewAllRoles();

      if (!rolesResponse || rolesResponse.length === 0) {
        console.log("No roles found.");
        return;
      }

      const table = Tables.viewAllRolesTable(rolesResponse);
      console.log(table.toString());
    } catch (error) {
      console.error("Error fetching all roles:", error);
    }
  }

  // View All Employees Handler //
  async viewAllEmployees() {
    try {
      const employeesResponse = await this.queries.viewAllEmployees(); // Fetch employees
      if (!employeesResponse || employeesResponse.length === 0) {
        console.log(chalk.red("No employees found."));
        return;
      }

      // console.log("Employees data received:", employeesResponse); // Additional logging

      const table = Tables.viewAllEmployeesTable(employeesResponse);
      console.log(table.toString()); // Output the table
    } catch (error) {
      console.error("Error viewing all employees:", error);
    }
  }

  // View All Managers Handler
  async viewAllManagers() {
    try {
      const managers = await this.queries.viewAllManagers(); // Fetch all managers
      if (!managers || managers.length === 0) {
        console.log(chalk.red("No managers found."));
        return;
      }

      // Pass the managers data to the table creation method
      const table = Tables.viewAllManagersTable(managers); // Initialize the table with manager data

      console.log(table.toString()); // Output the table to the console
    } catch (error) {
      console.error("Error viewing all managers:", error);
    }
  }

  // View Employees by Manager Handler
  async viewEmployeesByManager() {
    try {
      // Fetch all managers
      const managers = await this.queries.viewAllManagers();
      if (managers.length === 0) {
        console.log("No managers found.");
        return;
      }

      // Create choices for inquirer prompt
      const managerChoices = managers.map((manager) => ({
        name: `${manager.manager_first_name} ${manager.manager_last_name}`,
        value: manager.manager_id,
      }));

      // Prompt user to select a manager
      const response = await inquirer.prompt({
        type: "list",
        name: "managerId",
        message: "Choose a manager to view employees:",
        choices: managerChoices,
      });

      // Fetch employees by selected manager ID
      const employees = await this.queries.viewEmployeesByManager(
        response.managerId
      );
      if (employees.length === 0) {
        console.log("No employees found for this manager.");
        return;
      }

      // Create table to display employees
      const table = Tables.viewEmployeesByManagerTable(employees); // Pass employees here

      // Output the table
      console.log(table.toString());
    } catch (error) {
      console.error("Error fetching employees by manager:", error);
    }
  }

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
      console.log("Role department updated successfully!");
    } catch (error) {
      console.error("Error updating role department:", error);
    }
  }

  // View Employees by Department Handler //
  async viewEmployeesByDepartment() {
    try {
      const deptResponse = await this.queries.viewAllDepartments();
      if (!deptResponse || deptResponse.length === 0) {
        console.log("No departments available to display.");
        return; // Early exit if no departments are found
      }

      const departmentChoices = deptResponse.map((department) => ({
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
        return; // Correctly handling the case when no employees are found
      }

      // Proceed to display employees if present
      const table = Tables.viewEmployeesByDepartmentTable(employees);
      console.log(table.toString());
    } catch (error) {
      console.error("Error viewing employees by department:", error);
    }
  }

  //     const employees = await this.queries.viewEmployeesByDepartment(
  //       departmentId
  //     );
  //     if (employees.length === 0) {
  //       console.log("No employees found for this department.");
  //       return;
  //     }

  //     const table = Tables.viewEmployeesByDepartmentTable();

  //     employees.forEach((employee) => {
  //       table.push([
  //         employee.id,
  //         employee.first_name,
  //         employee.last_name,
  //         employee.role_id,
  //         employee.role_name,
  //         employee.department_name,
  //       ]);
  //     });

  //     console.log(table.toString()); // Output the table to the console
  //   } catch (error) {
  //     // Access departmentId here if needed
  //     console.error(
  //       "Error viewing employees by department:",
  //       departmentId, // Access departmentId here
  //       error
  //     );
  //   }
  // }

  // View Roles by Department Handler //
  async viewRolesByDepartment() {
    try {
      const departmentsResponse = await this.queries.viewAllDepartments();
      if (
        !departmentsResponse.success ||
        departmentsResponse.departments.length === 0
      ) {
        console.log("No departments found.");
        return;
      }

      const departmentChoices = departmentsResponse.departments.map(
        (department) => ({
          name: department.name,
          value: department.id,
        })
      );

      const { departmentId } = await inquirer.prompt({
        type: "list",
        name: "departmentId",
        message: "Select a department to view roles:",
        choices: departmentChoices,
      });

      const rolesResponse = await this.queries.getRolesByDepartment(
        departmentId
      );
      if (rolesResponse.length === 0) {
        console.log("No roles found for the selected department.");
        return;
      }

      const table = Tables.viewRolesByDepartmentTable(rolesResponse);
      console.log(table.toString());
    } catch (error) {
      console.error("Error viewing roles by department:", error);
    }
  }

  // View Employees by Role Handler //
  async viewEmployeesByRole() {
    try {
      // Fetch all roles and prompt user to select one
      const roles = await this.queries.viewAllRoles();
      if (!roles || roles.length === 0) {
        console.log("No roles found.");
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

      // Fetch employees for the selected role
      const employees = await this.queries.viewEmployeesByRole(roleId);
      if (!employees || employees.length === 0) {
        console.log("No employees found for this role.");
        return;
      }
      const table = Tables.viewEmployeesByRoleTable(employees);

      console.log(table.toString());
    } catch (error) {
      console.error("Error viewing employees by role:", error);
    }
  }

  // View Total Budget by All Departments Handler //
  async viewTotalBudgetByAllDepartments() {
    try {
      const { totalBudget, departments } =
        await this.queries.viewTotalBudgetByAllDepartments();
      // console.log("Budget data fetched:", departments);  // Debugging output

      if (!departments || departments.length === 0) {
        console.log(chalk.red("No data found or departments are empty."));
        return;
      }

      const table = Tables.viewTotalBudgetTable(departments);
      console.log(
        chalk.bold(`\nTotal Budget Across All Departments: $${totalBudget}\n`)
      );
      console.log(table.toString());
    } catch (error) {
      console.error("Error viewing total budget by all departments:", error);
    }
  }

  // View Total Utilized Budget by Department Handler //

  async viewTotalUtilizedBudgetByDepartment() {
    try {
      const deptResponse = await this.queries.viewAllDepartments();
      if (!deptResponse || deptResponse.departments.length === 0) {
        console.log("No departments available to display.");
        return; // Early exit if no departments are found
      }

      const departmentChoices = deptResponse.departments.map((department) => ({
        name: department.name,
        value: department.id,
      }));

      const { departmentId } = await inquirer.prompt({
        type: "list",
        name: "departmentId",
        message: "Select a department:",
        choices: departmentChoices,
      });

      const [totalUtilizedBudget, employees] = await Promise.all([
        this.queries.viewTotalUtilizedBudgetByDepartment(departmentId),
        this.queries.viewEmployeeDetailsByDepartment(departmentId),
      ]);

      console.log(
        "\nTotal Utilized Budget: " +
          chalk.green(`$${totalUtilizedBudget.toLocaleString()}\n`)
      );

      console.log("Department Budget Details:\n");
      const table = Tables.viewUtilizedBudgetTable(employees);
      console.log(table.toString()); // Make sure to output the string version of the table
    } catch (error) {
      console.error(
        "Error viewing total utilized budget by department:",
        error
      );
    }
  }

  // View Employees by Department Handler
  async viewEmployeesByDepartment() {
    try {
      const response = await this.queries.viewAllDepartments();
      if (
        !response ||
        !response.departments ||
        response.departments.length === 0
      ) {
        console.log("No departments available to display.");
        return; // Early exit if no departments are found
      }

      const departmentChoices = response.departments.map((department) => ({
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
      // console.log("Employees data received:", employees);
      if (!employees || employees.employees.length === 0) {
        console.log("No employees found in this department.");
        return;
      }

      const table = Tables.viewEmployeesByDepartmentTable(employees.employees); // Make sure you pass the correct data structure
      //  const tableString = Tables.viewEmployeesByDepartmentTable(
      //    employees.employees
      //  );
    } catch (error) {
      console.error("Error viewing employees by department:", error);
    }
  }
}

module.exports = Handler;


 //  // Updated function to accept department data
  //   static getTotalBudgetByDepartmentsTable(departments) {
    //     const table = new Table({
      //       head: [
        //         chalk.white("Index"),
        //         chalk.white("Department Name"),
        //         chalk.white("Total Utilized Budget"),
        //         chalk.white("Budget Utilization"),
      //       ],
      //       colAligns: ["center", "left", "left", "left"],
      //       style: {
        //         head: ["yellow"], // Adding color to headers for consistency
        //         border: ["grey"],
      //       },
    //     });

    //     departments.forEach((dept, index) => {
      //       const progressBar = generateProgressBar(
        //         parseFloat(dept.budget_percentage)
      //       );
      //       const color = DynamicColorCoding.getColorByDepartmentName(
        //         dept.department_name
      //       );
      //       table.push([
        //         index + 1, // Make index human-readable by starting from 1
        //         color(dept.department_name),
        //         dept.total_utilized_budget,
        //         dept.budget_percentage,
        //         progressBar,
      //       ]);
    //     });

    //     return table;
  //   }
 // 