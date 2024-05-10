const pool = require("../../db/connection");

// -------------------------------------
// --  View
// -------------------------------------

// Function to view all departments
const viewAllDepartments = async () => {
  try {
    const result = await pool.query("SELECT * FROM department");
    return result.rows;
  } catch (error) {
    console.error("Error fetching departments:", error);
    throw error;
  }
};


// Function to get total utilized budget by department
const viewTotalUtilizedBudgetByDepartment = async (departmentId) => {
  try {
    const result = await pool.query(
      "SELECT CONCAT('$', SUM(salary)) AS total_utilized_budget FROM employee JOIN role ON employee.role_id = role.id WHERE role.department_id = $1",
      [departmentId]
    );
    return result.rows[0].total_utilized_budget || "$0"; // Default to '$0' if no result
  } catch (error) {
    console.error(
      "Error calculating total utilized budget by department:",
      error
    );
    throw error;
  }
};

// Function to get total budget by all departments
const viewTotalBudgetByAllDepartments = async () => {
  try {
    // Query to get the total utilized budget by department
    const departmentBudgetsResult = await pool.query(`
      SELECT 
        department_id,
        SUM(salary) AS total_utilized_budget
      FROM 
        role
      JOIN 
        employee ON role.id = employee.role_id
      GROUP BY 
        department_id
    `);

    // Calculate the total budget by summing up the total utilized budget of all departments
    let totalBudget = 0;
    departmentBudgetsResult.rows.forEach((row) => {
      totalBudget += parseInt(row.total_utilized_budget); // Parse as integer to ensure numerical addition
    });

    // Query to get the total budget by all departments
    const result = await pool.query(
      `
      SELECT 
        department.name AS department_name,
        CONCAT('$', total_utilized_budget) AS total_utilized_budget,
        CONCAT(ROUND((total_utilized_budget / $1) * 100, 2), '%') AS budget_percentage
      FROM (
        SELECT 
          department_id,
          SUM(salary) AS total_utilized_budget
        FROM 
          role
        JOIN 
          employee ON role.id = employee.role_id
        GROUP BY 
          department_id
      ) AS department_budgets
      JOIN
        department ON department.id = department_budgets.department_id
    `,
      [totalBudget]
    ); // Pass total budget as a parameter

    return { totalBudget, departments: result.rows };
  } catch (error) {
    console.error("Error calculating total budget by all departments:", error);
    throw error;
  }
};

// Function to get employee details by department
const viewEmployeeDetailsByDepartment = async (departmentId) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        employee.first_name,
        employee.last_name,
        role.title AS role,
        '$' || role.salary AS role_salary,
        department.name AS department,
        ROUND((role.salary / total_utilized_budget) * 100, 2) || '%' AS budget_percentage
      FROM 
        employee
      JOIN 
        role ON employee.role_id = role.id
      JOIN 
        department ON role.department_id = department.id
      JOIN 
        (SELECT SUM(salary) AS total_utilized_budget FROM employee JOIN role ON employee.role_id = role.id WHERE role.department_id = $1) AS total ON true
      WHERE 
        role.department_id = $1
      `,
      [departmentId]
    );
    return result.rows;
  } catch (error) {
    console.error("Error fetching employee details by department:", error);
    throw error;
  }
};

// Function to view all roles
const viewAllRoles = async () => {
  try {
    const result = await pool.query(`
      SELECT 
        role.id,
        role.title,
        CONCAT('$', role.salary) AS salary, -- Include dollar sign before salary
        department.name AS department_name
      FROM 
        role
      INNER JOIN 
        department ON role.department_id = department.id
    `);
    return result.rows;
  } catch (error) {
    console.error("Error fetching roles with department names:", error);
    throw error;
  }
};

// Function to view all employees with salary
const viewAllEmployees = async () => {
  try {
    const result = await pool.query(`
      SELECT 
          e.id, 
          e.first_name, 
          e.last_name, 
          r.title AS role_title, 
          r.salary AS role_salary, -- Include salary from the role table
          d.name AS department_name, 
          CASE 
            WHEN e.manager_id IS NULL THEN NULL 
            ELSE CONCAT(m.first_name, ' ', m.last_name) 
          END AS manager
        FROM 
          employee e
        INNER JOIN 
          role r ON e.role_id = r.id
        LEFT JOIN 
          employee m ON e.manager_id = m.id
        LEFT JOIN
          department d ON r.department_id = d.id
    `);

    const employees = result.rows;

    // If there's only one employee, reset the id to start at 1
    if (employees.length === 1) {
      employees[0].id = 1;
    }

    return employees;
  } catch (error) {
    console.error("Error fetching employees with department names:", error);
    throw error;
  }
};

// Function to view all managers with role name and department name
const viewAllManagers = async () => {
  try {
    const result = await pool.query(`
      SELECT 
        m.id AS manager_id,
        m.first_name AS manager_first_name,
        m.last_name AS manager_last_name,
        ARRAY_AGG(CONCAT(e.first_name, ' ', e.last_name)) AS employees,
        r.title AS role_name,
        d.name AS department_name
      FROM 
        employee m
      LEFT JOIN 
        employee e ON m.id = e.manager_id
      LEFT JOIN
        role r ON m.role_id = r.id
      LEFT JOIN
        department d ON r.department_id = d.id
      GROUP BY 
        m.id, m.first_name, m.last_name, r.title, d.name
      HAVING 
        COUNT(e.id) > 0; -- Only include managers with subordinates
    `);
    return result.rows;
  } catch (error) {
    console.error("Error fetching managers with employees:", error);
    throw error;
  }
};

// Function to view employees by manager
const viewEmployeesByManager = async (managerId) => {
  try {
    const result = await pool.query(
      "SELECT * FROM employee WHERE manager_id = $1",
      [managerId]
    );
    return result.rows;
  } catch (error) {
    console.error("Error fetching employees by manager:", error);
    throw error;
  }
};

// Function to view employees by department
const viewEmployeesByDepartment = async (departmentId) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        e.id, 
        e.first_name, 
        e.last_name, 
        CASE 
          WHEN e.manager_id IS NULL THEN NULL 
          ELSE CONCAT(m.first_name, ' ', m.last_name) 
        END AS manager
      FROM 
        employee e
      LEFT JOIN 
        role r ON e.role_id = r.id
      LEFT JOIN 
        employee m ON e.manager_id = m.id
      WHERE 
        r.department_id = $1
    `,
      [departmentId]
    );
    return result.rows;
  } catch (error) {
    console.error("Error fetching employees by department:", error);
    throw error;
  }
};

// Function to get employees by role
const viewEmployeesByRole = async (roleId) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        e.id, 
        e.first_name, 
        e.last_name, 
        CASE 
          WHEN e.manager_id IS NULL THEN NULL 
          ELSE CONCAT(m.first_name, ' ', m.last_name) 
        END AS manager
      FROM 
        employee e
      LEFT JOIN 
        employee m ON e.manager_id = m.id
      WHERE 
        e.role_id = $1
    `,
      [roleId]
    );
    return result.rows;
  } catch (error) {
    console.error("Error fetching employees by role:", error);
    throw error;
  }
};

// Function to view roles by department with department names
const viewRolesByDepartment = async () => {
  try {
    const result = await pool.query(`
      SELECT role.title AS role, department.id AS department_id, department.name AS department_name 
      FROM role 
      JOIN department ON role.department_id = department.id 
      ORDER BY role.department_id
    `);
    return result.rows;
  } catch (error) {
    console.error("Error grouping roles by department:", error);
    throw error;
  }
};
// Add this function to your queries.js if not already included
async function getRolesByDepartment(departmentId) {
  try {
    const result = await pool.query(
      "SELECT id, title FROM role WHERE department_id = $1",
      [departmentId]
    );
    return result.rows; // Should return an array of { id, title } objects
  } catch (error) {
    console.error("Error fetching roles by department:", error);
    throw error;
  }
}


// -------------------------------------
// -- Add
// -------------------------------------

// Function to add a department
const addDepartment = async (name, isTestDepartment = false) => {
  try {
    // Check if the department already exists
    const existingDepartments = await pool.query(
      "SELECT * FROM department WHERE name = $1",
      [name]
    );

    if (existingDepartments.rows.length > 0) {
      console.log("A department with the same name already exists.");
      return false; // Return false to indicate that the department was not added
    }

    // If it's not a test department and it doesn't exist, then insert
    if (!isTestDepartment) {
      await pool.query("INSERT INTO department (name) VALUES ($1)", [name]);
    }

    console.log("Department added successfully!");
    return true; // Return true to indicate that the department was added
  } catch (error) {
    console.error("Error adding department:", error);
    throw error;
  }
};

// Function to add a role
const addRole = async (title, salary, departmentId) => {
  try {
    await pool.query(
      "INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)",
      [title, salary, departmentId]
    );
  } catch (error) {
    console.error("Error adding role:", error);
    throw error;
  }
};

// Function to add an employee
const addEmployee = async (firstName, lastName, roleId, managerId) => {
  try {
    await pool.query(
      "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)",
      [firstName, lastName, roleId, managerId]
    );
  } catch (error) {
    console.error("Error adding employee:", error);
    throw error;
  }
};

// -------------------------------------
// -- Update
// -------------------------------------

// Function to update a role's salary
const updateRoleSalary = async (roleId, newSalary) => {
  try {
    await pool.query("UPDATE role SET salary = $1 WHERE id = $2", [
      newSalary,
      roleId,
    ]);
  } catch (error) {
    console.error("Error updating role salary:", error);
    throw error;
  }
};

// Function to update an employee's role
const updateEmployeeRole = async (employeeId, newRoleId) => {
  try {
    await pool.query("UPDATE employee SET role_id = $1 WHERE id = $2", [
      newRoleId,
      employeeId,
    ]);
  } catch (error) {
    console.error("Error updating employee role:", error);
    throw error;
  }
};

// Function to update an employee's manager
const updateEmployeeManager = async (employeeId, newManagerId) => {
  try {
    await pool.query("UPDATE employee SET manager_id = $1 WHERE id = $2", [
      newManagerId,
      employeeId,
    ]);
  } catch (error) {
    console.error("Error updating employee manager:", error);
    throw error;
  }
};

// Function to update a department's name
const updateDepartmentName = async (departmentId, newDepartmentName) => {
  try {
    await pool.query("UPDATE department SET name = $1 WHERE id = $2", [
      newDepartmentName,
      departmentId,
    ]);
  } catch (error) {
    console.error("Error updating department name:", error);
    throw error;
  }
};

// Function to update a role's title
const updateRoleTitle = async (roleId, newTitle) => {
  try {
    await pool.query("UPDATE role SET title = $1 WHERE id = $2", [
      newTitle,
      roleId,
    ]);
  } catch (error) {
    console.error("Error updating role title:", error);
    throw error;
  }
};

// Function to update a role's department
const updateRoleDepartment = async (roleId, newDepartmentId) => {
  try {
    await pool.query("UPDATE role SET department_id = $1 WHERE id = $2", [
      newDepartmentId,
      roleId,
    ]);
  } catch (error) {
    console.error("Error updating role department:", error);
    throw error;
  }
};


// -------------------------------------
// -- Sort/Group
// -------------------------------------

// Function to sort employees by last name
const sortEmployeesByLastName = async () => {
  try {
    const result = await pool.query(`
      SELECT 
        e.id, 
        e.first_name, 
        e.last_name
      FROM 
        employee e
      INNER JOIN 
        role r ON e.role_id = r.id
      LEFT JOIN 
        employee m ON e.manager_id = m.id
      LEFT JOIN
        department d ON r.department_id = d.id
      ORDER BY 
        e.last_name
    `);
    return result.rows;
  } catch (error) {
    console.error("Error sorting employees by last name:", error);
    throw error;
  }
};

// Function to sort employees by salary
const sortEmployeesBySalary = async () => {
  try {
    const result = await pool.query(`
      SELECT 
        e.id, 
        e.first_name, 
        e.last_name, 
        r.title AS role_title, 
        CONCAT('$', r.salary) AS role_salary
      FROM 
        employee e
      INNER JOIN 
        role r ON e.role_id = r.id
      LEFT JOIN 
        employee m ON e.manager_id = m.id
      LEFT JOIN
        department d ON r.department_id = d.id
      ORDER BY 
        r.salary DESC
    `);
    return result.rows;
  } catch (error) {
    console.error("Error sorting employees by salary:", error);
    throw error;
  }
};

// Function to sort roles by salary
const sortRolesBySalary = async () => {
  try {
    const result = await pool.query(
      "SELECT title AS role, salary FROM role ORDER BY salary DESC"
    );
    // Add a dollar sign ($) before each salary value
    const rolesWithSalaryFormatted = result.rows.map((role) => ({
      ...role,
      salary: "$" + role.salary,
    }));
    return rolesWithSalaryFormatted;
  } catch (error) {
    console.error("Error sorting roles by salary:", error);
    throw error;
  }
};


// -------------------------------------
// -- Delete
// -------------------------------------

// Function to delete a department
const deleteDepartment = async (departmentId) => {
  try {
    const roles = await getRolesByDepartment(departmentId);
    if (roles.length > 0) {
      console.error(
        `Cannot delete department: ${roles.length} roles are still associated with it.`
      );
      return; // Optionally, throw an error or handle this case as needed
    }
    await pool.query("DELETE FROM department WHERE id = $1", [departmentId]);
    console.log("Department deleted successfully!");
  } catch (error) {
    console.error("Error deleting department:", error);
    throw error;
  }
};


// Function to delete a role
const deleteRole = async (roleId) => {
  try {
    // Check if any employees are assigned to this role
    const employees = await pool.query(
      "SELECT id FROM employee WHERE role_id = $1",
      [roleId]
    );
    if (employees.rows.length > 0) {
      console.error(
        `Cannot delete role: ${employees.rows.length} employees are still assigned to this role.`
      );
      // Optionally, handle reassignment or inform the user to manually reassign before deletion
      return false; // Indicate that the role was not deleted due to active dependencies
    }

    // Proceed with deletion if no employees are assigned to the role
    await pool.query("DELETE FROM role WHERE id = $1", [roleId]);
    console.log("Role deleted successfully!");
    return true; // Indicate successful deletion
  } catch (error) {
    console.error("Error deleting role:", error);
    throw error;
  }
};

// Function to delete an employee
const deleteEmployee = async (employeeId) => {
  try {
    await pool.query("DELETE FROM employee WHERE id = $1", [employeeId]);
  } catch (error) {
    console.error("Error deleting employee:", error);
    throw error;
  }
};

module.exports = {
  viewAllDepartments,
  viewAllRoles,
  viewAllEmployees,
  viewAllManagers,
  viewEmployeesByManager,
  viewEmployeesByDepartment,
  viewEmployeesByRole,
  viewRolesByDepartment,
  viewTotalUtilizedBudgetByDepartment,
  viewTotalBudgetByAllDepartments,
  viewEmployeeDetailsByDepartment,
  getRolesByDepartment,
  addDepartment,
  addRole,
  addEmployee,
  updateRoleSalary,
  updateRoleTitle,
  updateRoleDepartment,
  updateDepartmentName,
  updateEmployeeRole,
  updateEmployeeManager,
  sortEmployeesByLastName,
  sortEmployeesBySalary,
  sortRolesBySalary,
  deleteDepartment,
  deleteRole,
  deleteEmployee,
};
