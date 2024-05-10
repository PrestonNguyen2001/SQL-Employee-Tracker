// handlers/delete.js
const queries = require("../queries/queries");
const inquirer = require("inquirer");

// Delete Department Handler

async function handleDeleteDepartment() {
  try {
    const departments = await queries.viewAllDepartments();
    const departmentChoices = departments.map(dept => ({ name: dept.name, value: dept.id }));

    const { departmentId, confirmDelete } = await inquirer.prompt([
      {
        type: "list",
        name: "departmentId",
        message: "Choose a department to delete:",
        choices: departmentChoices
      },
      {
        type: "confirm",
        name: "confirmDelete",
        message: "Are you sure you want to delete this department?",
        default: false
      }
    ]);

    if (!confirmDelete) {
      console.log("Deletion cancelled.");
      return;
    }

    const roles = await queries.getRolesByDepartment(departmentId);
    if (roles.length > 0) {
      console.log(
        `Cannot delete department because it has ${roles.length} roles associated with it.`
      );
      console.log("Roles needing reassignment:");
      roles.forEach((role) =>
        console.log(`- Role ID: ${role.id}, Title: ${role.title}`)
      );

      console.log(
        "Please reassign these roles to another department before attempting to delete."
      );
      return; // Exit and prevent deletion until reassignment is done
    }

    await queries.deleteDepartment(departmentId);
    console.log("Department deleted successfully!");
  } catch (error) {
    console.error("Error deleting department:", error);
  }
};



// Delete Role Handler
async function handleDeleteRole() {
 try {
      const roles = await queries.viewAllRoles();
      const roleChoices = roles.map((role) => ({
        name: `${role.id}: ${role.title}`,
        value: role.id,
      }));
      const answers = await inquirer.prompt([
        {
          type: "list",
          name: "roleId",
          message: "Choose the role to delete:",
          choices: roleChoices,
        },
      ]);
      await queries.deleteRole(answers.roleId);
      console.log("Role deleted successfully!");
      // displayRoleOptions();
    } catch (error) {
      console.error("Error deleting role:", error);
    }
  };

// Delete Employee Handler
async function handleDeleteEmployee() {
  try {
      // Fetch all employees
      const employees = await queries.viewAllEmployees();

      // Create an array of choices using the employee names and IDs
      const employeeChoices = employees.map((employee) => ({
        name: `${employee.first_name} ${employee.last_name} (ID: ${employee.id})`,
        value: employee.id,
      }));

      // Prompt the user to choose an employee for deletion
      const answers = await inquirer.prompt([
        {
          type: "list",
          name: "employeeId",
          message: "Choose the employee to delete:",
          choices: employeeChoices,
        },
        {
          type: "confirm",
          name: "confirmDelete",
          message: "Are you sure you want to delete this employee? [y/n]",
          default: false,
        },
      ]);

      // If the user confirms deletion, call the deleteEmployee function with the chosen employee ID
      if (answers.confirmDelete) {
        await queries.deleteEmployee(answers.employeeId);
        console.log("Employee deleted successfully!");
      } else {
        console.log("Deletion cancelled.");
      }

      // Go back to employee options
      // displayEmployeeOptions();
    } catch (error) {
      console.error("Error deleting employee:", error);
    }
  };

async function handleDeleteRoleRequest(roleId) {
  const canDelete = await deleteRole(roleId);
  if (!canDelete) {
    console.log(
      "Please reassign all employees from this role before attempting to delete it."
    );
    // Here you could call another function to handle reassignment
  }
}




module.exports = {
  handleDeleteDepartment,
  handleDeleteRole,
  handleDeleteEmployee,
  handleDeleteRoleRequest
};
