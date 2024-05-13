const Table = require("cli-table3");
const chalk = require("chalk");
const DynamicColorCoding = require("./colorCoding");

function insertLineBreaks(str, maxLineLength) {
  const words = str.split(" ");
  let currentLine = words[0];
  let formattedString = "";

  for (let i = 1; i < words.length; i++) {
    if (currentLine.length + words[i].length + 1 <= maxLineLength) {
      currentLine += " " + words[i];
    } else {
      formattedString += currentLine + "\n";
      currentLine = words[i];
    }
  }

  formattedString += currentLine; // Add the last line
  return formattedString;
}

function generateProgressBar(percentage, totalLength = 40) {
  const filledLength = Math.round((percentage / 100) * totalLength);
  const filledBar = chalk.green("█").repeat(filledLength);
  const emptyBar = chalk.white("░").repeat(totalLength - filledLength);
  const formattedPercentage = `${percentage.toFixed(2)}%`; // Ensure percentage is formatted to two decimals
  return `${filledBar}${emptyBar} ${formattedPercentage}`; // Append the percentage at the end of the bar
}



class Tables {
  // -------------------------------------
  // --  View
  // -------------------------------------

  // View all departments table
  static viewAllDepartmentsTable(departments) {
    if (!Array.isArray(departments) || departments.length === 0) {
      console.error("Invalid or empty departments data:", departments);
      return new Table(); // Return an empty table to prevent further errors
    }

    const table = new Table({
      head: [
        chalk.white("Index"),
        chalk.white("Department ID"),
        chalk.white("Department Name"),
      ],
      colAligns: ["center", "center", "left"],
      style: { head: [], border: ["grey"] },
    });

    departments.forEach((dept, index) => {
      const color = DynamicColorCoding.getColorByDepartmentName(dept.name);
      table.push([
        index,
        dept.id,
        color(dept.name), // Apply dynamic color to department name
      ]);
    });

    return table;
  }

  // View all roles table
  static viewAllRolesTable(roles) {
    if (!roles || roles.length === 0) {
      console.error(
        "Invalid call to viewAllRolesTable with undefined or empty roles"
      );
      return new Table(); // Return an empty table to prevent further errors
    }

    const table = new Table({
      head: [
        chalk.white("Index"),
        chalk.white("ID"),
        chalk.white("Title"),
        chalk.white("Salary"),
        chalk.white("Department Name"),
      ],
      colWidths: [10, 10, 30, 12, 30],
      style: { head: [], border: ["grey"] },
    });

    roles.forEach((role, index) => {
      const color = DynamicColorCoding.getColorByDepartmentName(
        role.department_name
      );
      table.push([
        index,
        role.id,
        color(role.title), // Apply dynamic color to role title based on department
        role.salary,
        color(role.department_name), // Apply dynamic color to department name
      ]);
    });

    return table;
  }

  // View all employees table
  static viewAllEmployeesTable(employees) {
    if (!employees || employees.length === 0) {
      console.error(
        "Invalid call to viewAllEmployeesTable with undefined or empty employees"
      );
      return new Table(); // Return an empty table to prevent further errors
    }

    const table = new Table({
      head: [
        chalk.white("Index"),
        chalk.white("ID"),
        chalk.white("First Name"),
        chalk.white("Last Name"),
        chalk.white("Role Title"),
        chalk.white("Salary"),
        chalk.white("Department Name"),
        chalk.white("Manager Name"),
      ],
      colAligns: ["center", "center", "left"],
      colWidths: [10, 10, 15, 15, 25, 15, 25, 20],
      style: {
        head: ["yellow"], // Color for the headers
        border: ["grey"], // Table border color
        compact: false,
        "padding-left": 1,
        "padding-right": 1,
      },
    });

    employees.forEach((employee, index) => {
      const roleColor = DynamicColorCoding.getColorByDepartmentName(
        employee.department_name
      );
      const departmentColor = DynamicColorCoding.getColorByDepartmentName(
        employee.department_name
      );

      // Apply line breaks to role title and department name
      const managerName = insertLineBreaks(
        chalk.yellow(employee.manager_name),
        25
      );
      const roleTitle = insertLineBreaks(roleColor(employee.role_title), 30);
      const departmentName = insertLineBreaks(
        departmentColor(employee.department_name),
        30
      );

      table.push([
        index,
        employee.id,
        employee.first_name,
        employee.last_name,
        roleTitle,
        employee.salary,
        departmentName,
        managerName,
      ]);
    });

    return table;
  }

  // View all managers table
  static viewAllManagersTable(managers) {
    const table = new Table({
      head: [
        chalk.white("Index"),
        chalk.white("Manager ID"),
        chalk.white("First Name"),
        chalk.white("Last Name"),
        chalk.white("Employees"),
        chalk.white("Role Name"),
        chalk.white("Department Name"),
      ],
      colWidths: [12, 12, 15, 15, 20, 25, 25], // Adjust if necessary for alignment
      style: {
        head: ["yellow"],
        border: ["grey"],
        compact: false,
        "padding-left": 1,
        "padding-right": 1,
        wordWrap: true, // Ensure your table library supports or can be made to support word wrapping
      },
    });

    managers.forEach((manager, index) => {
      // Join employee names with a line break to create a multi-line cell
      const employeeNames = manager.employees.join(",\n");

      const color = DynamicColorCoding.getColorByDepartmentName(
        manager.department_name
      );
      table.push([
        index,
        manager.manager_id,
        manager.manager_first_name,
        manager.manager_last_name,
        employeeNames, // This now holds a multi-line string
        color(manager.role_name),
        color(manager.department_name),
      ]);
    });

    return table;
  }

  // View roles by department table
  static viewRolesByDepartmentTable(roles) {
    const table = new Table({
      head: [
        chalk.white("Index"),
        chalk.white("ID"),
        chalk.white("Title"),
        chalk.white("Salary"),
        chalk.white("Department Name"),
      ],
      colWidths: [10, 5, 30, 12, 30],
      style: { head: ["yellow"], border: ["grey"] },
    });

    roles.forEach((role, index) => {
      const color = DynamicColorCoding.getColorByDepartmentName(
        role.department_name
      );
      table.push([
        index + 1, // Human-readable index (starting from 1)
        role.id,
        color(role.title),
        chalk.green(role.salary.toLocaleString()), // Format salary as a localized string
        color(role.department_name),
      ]);
    });

    return table;
  }

  // View Employees by Department table
  static viewEmployeesByDepartmentTable(employees) {
    // Validate input
    if (!Array.isArray(employees) || employees.length === 0) {
      console.error(chalk.red("No employee data provided."));
      return;
    }

    const table = new Table({
      head: [
        chalk.white("ID"),
        chalk.white("First Name"),
        chalk.white("Last Name"),
        chalk.white("Role ID"),
        chalk.white("Role Title"),
        chalk.white("Department Name"),
      ],
      colWidths: [10, 15, 15, 10, 30, 20],
      style: {
        head: ["yellow"],
        border: ["grey"],
        "padding-left": 1,
        "padding-right": 1,
      },
    });

    // console.log("Table: ", table); // Debug log

    employees.forEach((employee) => {
      if (!employee || !employee.department_name) {
        console.error("Invalid or incomplete employee data:", employee);
        return; // Skip this iteration
      }
      const color =
        DynamicColorCoding.getColorByDepartmentName(employee.department_name) ||
        chalk.white; // Default color
      table.push([
        employee.id,
        employee.first_name,
        employee.last_name,
        employee.role_id,
        color(employee.role_name), // Ensure this matches your query alias
        color(employee.department_name),
      ]);
    });

    try {
      console.log(table.toString());
    } catch (error) {
      console.error("Error generating table output:", error);
    }
    return table;
  }

  // View Employees by Manager table
  static viewEmployeesByManagerTable(employees) {
    const table = new Table({
      head: [
        chalk.white("ID"),
        chalk.white("First Name"),
        chalk.white("Last Name"),
        chalk.white("Role ID"),
        chalk.white("Role Title"),
        chalk.white("Salary"),
        chalk.white("Department Name"),
      ],
      colWidths: [10, 15, 15, 10, 20, 15, 20], // Adjust as necessary
      style: {
        head: ["yellow"], // Color for the headers
        border: ["grey"], // Table border color
        "padding-left": 1,
        "padding-right": 1,
      },
    });

    employees.forEach((employee) => {
      const color = DynamicColorCoding.getColorByDepartmentName(
        employee.department_name
      );

      table.push([
        employee.id,
        employee.first_name,
        employee.last_name,
        employee.role_id,
        color(employee.role_name),
        employee.salary,
        color(employee.department_name), // Apply color coding
      ]);
    });

    return table; // Ensure to return the table object for displaying
  }

  // View Employees by Role table
  static viewEmployeesByRoleTable(employees) {
    const table = new Table({
      head: [
        chalk.white("Index"),
        chalk.white("ID"),
        chalk.white("First Name"),
        chalk.white("Last Name"),
        chalk.white("Role ID"),
        chalk.white("Role Title"),
        chalk.white("Salary"),
        chalk.white("Department Name"),
      ],
      colWidths: [10, 10, 15, 15, 10, 30, 15, 20], // Adjusted to correct number of columns
    });

    employees.forEach((employee, index) => {
      const color =
        DynamicColorCoding.getColorByDepartmentName(employee.department_name) ||
        chalk.white; // Apply color or default to white

      const roleTitle = insertLineBreaks(color(employee.role_title), 30);
      table.push([
        index + 1, // Human-readable index starting from 1
        employee.id,
        employee.first_name,
        employee.last_name,
        employee.role_id,
        roleTitle,
        employee.salary,
        color(employee.department_name),
      ]);
    });

    return table; // Return the table object for displaying
  }

  // Total budget by all departments table
  // Updated function to accept department data
  static viewTotalBudgetTable(departments) {
    const table = new Table({
      head: [
        chalk.white("Index"),
        chalk.white("Department Name"),
        chalk.white("Department Budget"),
        chalk.white("Percentage Breakdown"),
      ],
      colAligns: ["center", "left", "right", "center"],
      style: {
        head: ["yellow"], // Adding color to headers for consistency
        border: ["grey"],
      },
    });

    departments.forEach((dept, index) => {
      const progressBar = generateProgressBar(
        parseFloat(dept.budget_percentage)
      );
      const color = DynamicColorCoding.getColorByDepartmentName(
        dept.department_name
      );
      table.push([
        index + 1, // Make index human-readable by starting from 1
        color(dept.department_name),
        dept.total_utilized_budget,
        progressBar,
      ]);
    });

    return table;
  }

  // Budget by department table
  static viewUtilizedBudgetTable(employeeDetails) {
    const table = new Table({
      head: [
        chalk.white("Index"),
        chalk.white("First Name"),
        chalk.white("Last Name"),
        chalk.white("Role"),
        chalk.white("Salary"),
        chalk.white("Department"),
        chalk.white("Budget Utilization"),
      ],
      colAligns: ["center", "left", "left", "left", "right", "left", "left"],
      style: { head: ["yellow"], border: ["grey"] },
    });

    employeeDetails.forEach((employee, index) => {
      // console.log(employee);
      const progressBar = generateProgressBar(
        parseFloat(employee.budget_percentage)
      );
      const color = DynamicColorCoding.getColorByDepartmentName(
        employee.department
      );
      table.push([
        index + 1, // Use index + 1 to start from 1 instead of 0
        chalk.yellow(employee.first_name),
        chalk.yellow(employee.last_name),
        color(employee.role),
        employee.role_salary,
        color(employee.department),
        progressBar,
      ]);
    });

    return table; // Make sure to return the table
  }

  // -------------------------------------
  // --  Role
  // -------------------------------------

  // View all roles table

  // -------------------------------------
  // --  Employee
  // -------------------------------------

  // Sort Employees by Salary table
  static sortEmployeesBySalaryTable(employees) {
    const table = new Table({
      head: [
        chalk.bold("Index"),
        chalk.bold("ID"),
        chalk.bold("First Name"),
        chalk.bold("Last Name"),
        chalk.bold("Role Title"),
        chalk.bold("Role Salary"),
        chalk.bold("Department Name"),
      ],
      colWidths: [10, 5, 15, 15, 30, 12, 20], // Ensure correct column width matching the headers
    });

    employees.forEach((employee, index) => {
      const color = DynamicColorCoding.getColorByDepartmentName(
        employee.department_name
      );
      table.push([
        index + 1, // Adjusted to start from 1 for human readability
        employee.id,
        employee.first_name,
        employee.last_name,
        color(employee.role_title),
        chalk.yellow(employee.role_salary), // Assuming role_salary is the formatted salary
        color(employee.department_name),
      ]);
    });

    return table; // This ensures the table object is returned
  }

  // Sort Employees by Last Name table
  static sortEmployeesByLastNameTable(employees) {
    const table = new Table({
      head: [
        chalk.bold("Index"),
        chalk.bold("ID"),
        chalk.bold("First Name"),
        chalk.bold("Last Name"),
        chalk.bold("Role Title"),
        chalk.bold("Role Salary"),
        chalk.bold("Department Name"),
      ],
      colWidths: [10, 5, 15, 15, 30, 12, 20], // Ensure correct column width matching the headers
    });

    employees.forEach((employee, index) => {
      const color = DynamicColorCoding.getColorByDepartmentName(
        employee.department_name
      );
      table.push([
        index + 1, // Adjusted to start from 1 for human readability
        employee.id,
        employee.first_name,
        chalk.yellow(employee.last_name),
        color(employee.role_title),
        employee.role_salary, // Assuming role_salary is the formatted salary
        color(employee.department_name),
      ]);
    });

    return table; // This ensures the table object is returned
  }
}

module.exports = Tables;

  