// handlers/add.js
const queries = require("../queries/queries");
const inquirer = require("inquirer");

async function handleAddDepartment(name) {
  try {

    const { name } = await inquirer.prompt(
      {
        type: "input",
        name: "name",
        message: "Enter the name of the department:",
      }
    );
    await queries.addDepartment(name);
    console.log("Department added successfully!");
  } catch (error) {
    console.error("Error while adding department: ", error);
  }
}

async function handleAddRole(title, salary, departmentId) {
  try {
    await queries.addRole(title, salary, departmentId);
    console.log("Role added successfully!");
  } catch (error) {
    console.error("Error while adding role: ", error);
  }
}

async function handleAddEmployee(firstName, lastName, roleId, managerId) {
  try {
    await queries.addEmployee(firstName, lastName, roleId, managerId);
    console.log("Employee added successfully!");
  } catch (error) {
    console.error("Error while adding employee: ", error);
  }
}
module.exports = {
  handleAddDepartment,
  handleAddRole,
  handleAddEmployee,
};
