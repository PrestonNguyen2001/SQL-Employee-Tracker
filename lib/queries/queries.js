
const pool = require("../../db/connection");
const chalk = require("chalk");
const Tables = require("../tables/table");

// General purpose function to execute a database query
const executeQuery = async (query, params) => {
  try {
    return await pool.query(query, params);
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
};

// -------------------------------------
// -- Add
// -------------------------------------

// Function to add a department
const addDepartment = async (name, isTestDepartment = false) => {
  try {
    const existingDepartment = await executeQuery(
      "SELECT * FROM department WHERE name = $1",
      [name]
    );

    if (existingDepartment.rows.length > 0) {
      return {
        success: false,
        message: "A department with the same name already exists.",
      };
    }

    if (!isTestDepartment) {
      await executeQuery("INSERT INTO department (name) VALUES ($1)", [name]);
    }

    return { success: true, message: "Department added successfully." };
  } catch (error) {
    return {
      success: false,
      message: `Error adding department: ${error.message}`,
    };
  }
};

// Function to add a role
const addRole = async (title, salary, departmentId) => {
  try {
    await executeQuery(
      "INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)",
      [title, salary, departmentId]
    );
    return { success: true, message: "Role added successfully." };
  } catch (error) {
    return { success: false, message: `Error adding role: ${error.message}` };
  }
};

// Function to add an employee
const addEmployee = async (
  firstName,
  lastName,
  roleId,
  managerId,
  isManager
) => {
  const query = `
    INSERT INTO employee (first_name, last_name, role_id, manager_id, is_manager)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const params = [firstName, lastName, roleId, managerId, isManager ? 1 : 0]; 

  try {
    return await pool.query(query, params);
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
};

// -------------------------------------
// --  View
// -------------------------------------

// Function to view all departments
const viewAllDepartments = async () => {
  try {
    const query = "SELECT id, name FROM department ORDER BY name ASC";
    const result = await pool.query(query);
    return result.rows || []; 
  } catch (error) {
    console.error("Error fetching departments:", error);
    return [];
  }
};

// Function to view employees by department
const viewEmployeesByDepartment = async (departmentId) => {
  if (!departmentId) {
    console.error("Invalid department ID provided");
    return [];
  }

  try {
    const employeeQuery = `
      SELECT
        e.id,
        e.first_name,
        e.last_name,
        r.id AS role_id,
        r.title AS role_name,
        '$' || r.salary AS salary,
        CONCAT(m.first_name, ' ', m.last_name) AS manager_name,
        d.name AS department_name
      FROM
        employee e
      JOIN
        role r ON e.role_id = r.id
      JOIN
        department d ON r.department_id = d.id
      LEFT JOIN
        employee m ON e.manager_id = m.id
      WHERE
        r.department_id = $1
    `;
    const employeeResult = await pool.query(employeeQuery, [departmentId]);
    return employeeResult.rows || []; 
  } catch (error) {
    console.error("Error fetching employees by department:", error);
    return [];
  }
};

// Function to get total budget by all departments
const viewTotalBudgetByAllDepartments = async () => {
  try {
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

    let totalBudget = 0;
    departmentBudgetsResult.rows.forEach((row) => {
      totalBudget += parseInt(row.total_utilized_budget, 10);
    });

    const formattedTotalBudget = totalBudget.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });

    const result = await pool.query(
      `
      SELECT 
        department.name AS department_name,
        total_utilized_budget,
        (total_utilized_budget / $1 * 100)::numeric(5,2) AS budget_percentage
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
    );

    const departments = result.rows.map((dep) => ({
      ...dep,
      total_utilized_budget: parseFloat(
        dep.total_utilized_budget
      ).toLocaleString("en-US", { style: "currency", currency: "USD" }),
      budget_percentage: dep.budget_percentage + "%",
    }));

    return { totalBudget: formattedTotalBudget, departments };
  } catch (error) {
    console.error("Error calculating total budget by all departments:", error);
    throw error;
  }
};
// Function to view roles by department with department names
const viewRolesByDepartment = async () => {
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

// Function to get total utilized budget by department
const viewTotalUtilizedBudgetByDepartment = async (departmentId) => {
  try {
    const result = await pool.query(
      "SELECT SUM(salary) AS total_utilized_budget FROM employee JOIN role ON employee.role_id = role.id WHERE role.department_id = $1",
      [departmentId]
    );

    const budget = result.rows[0]?.total_utilized_budget || 0;
    return budget
      ? `$${parseFloat(budget)
          .toLocaleString("en-US", { style: "currency", currency: "USD" })
          .slice(1)}`
      : "$0";
  } catch (error) {
    console.error(
      "Error calculating total utilized budget by department:",
      error
    );
    throw error;
  }
};

// Function to get employee details by department
const viewEmployeeDetailsByDepartment = async (departmentId) => {
  try {
    const budgetQuery =
      "SELECT SUM(salary) AS total_utilized_budget FROM employee JOIN role ON employee.role_id = role.id WHERE role.department_id = $1";
    const budgetResult = await pool.query(budgetQuery, [departmentId]);
    const totalBudget = budgetResult.rows[0]?.total_utilized_budget || 0;

    const employeeQuery = `
      SELECT 
        employee.first_name,
        employee.last_name,
        role.id AS role_id,
        role.title AS role,
        role.salary AS role_salary,
        department.name AS department
      FROM 
        employee
      JOIN 
        role ON employee.role_id = role.id
      JOIN 
        department ON role.department_id = department.id
      WHERE 
        role.department_id = $1
    `;
    const employeeResult = await pool.query(employeeQuery, [departmentId]);

    const employees = employeeResult.rows.map((employee) => {
      const budgetPercentage =
        totalBudget > 0
          ? ((employee.role_salary / totalBudget) * 100).toFixed(2) + "%"
          : "0%";
      return {
        ...employee,
        role_salary: `$${parseFloat(employee.role_salary)
          .toLocaleString("en-US", { style: "currency", currency: "USD" })
          .slice(1)}`,
        budget_percentage: budgetPercentage,
      };
    });

    return employees;
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
        role.salary, 
        department.name AS department_name
      FROM 
        role
      INNER JOIN 
        department ON role.department_id = department.id
    `);

    if (!result || !result.rows || result.rows.length === 0) {
      console.error("No roles data fetched or empty results");
      return [];
    }

    const formattedRoles = result.rows.map((role) => ({
      ...role,
      salary: `$${parseFloat(role.salary).toLocaleString("en-US")}`,
    }));

    return formattedRoles;
  } catch (error) {
    console.error("Error fetching roles with department names:", error);
    throw error;
  }
};

// Function to view all employees
const viewAllEmployees = async () => {
  try {
    const result = await pool.query(`
      SELECT 
          e.id,
          e.first_name,
          e.last_name,
          r.title AS role_title, 
          d.name AS department_name, 
          r.salary AS salary, 
          e.is_manager,
          CONCAT(m.first_name, ' ', m.last_name) AS manager_name
        FROM 
            employee e
        LEFT JOIN 
            employee m ON e.manager_id = m.id
        LEFT JOIN
            role r ON e.role_id = r.id  -- Alias 'role' as 'r'
        LEFT JOIN
            department d ON r.department_id = d.id  -- Alias 'department' as 'd'
        ORDER BY 
            e.first_name, e.last_name;
    `);

    const formattedResult = result.rows.map((row) => ({
      ...row,
      salary: `$${parseInt(row.salary).toLocaleString()}`,
    }));

    return formattedResult;
  } catch (error) {
    console.error("Error fetching all employees:", error);
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
  COALESCE(ARRAY_AGG(CONCAT(e.first_name, ' ', e.last_name) ORDER BY e.first_name, e.last_name) FILTER (WHERE e.id IS NOT NULL), ARRAY[]::VARCHAR[]) AS employees,
  r.title AS role_name,
  d.name AS department_name
FROM
  employee m
      LEFT JOIN 
        employee e ON m.id = e.manager_id
JOIN
        role r ON m.role_id = r.id
JOIN
        department d ON r.department_id = d.id
      WHERE
        m.is_manager = TRUE
GROUP BY 
        m.id, m.first_name, m.last_name, r.title, d.name
    `);
    return result.rows;
  } catch (error) {
    console.error("Error fetching managers with employees:", error);
    throw error;
  }
};

// Function to view employees by manager
const viewEmployeesByManager = async (managerId) => {
  if (!managerId) {
    console.error("Invalid manager ID provided");
    return [];
  }

  try {
    const query = `
      SELECT
        e.id,
        e.first_name,
        e.last_name,
        e.role_id,
        r.title AS role_name,
        '$' || r.salary AS salary,
        d.name AS department_name
      FROM
        employee e
      JOIN
        role r ON e.role_id = r.id
      JOIN
        department d ON r.department_id = d.id
      WHERE
        e.manager_id = $1
    `;
    const result = await pool.query(query, [managerId]);
    return result.rows;
  } catch (error) {
    console.error("Error fetching employees by manager:", managerId, error);
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
          e.role_id, 
          r.title AS role_title,
          r.salary AS salary,
          d.name AS department_name
      FROM 
          employee e
      JOIN 
          role r ON e.role_id = r.id
      JOIN 
          department d ON r.department_id = d.id
      WHERE 
          e.role_id = $1;
      `,
      [roleId]
    );

    // Format the salary with commas every three digits
    const formattedResult = result.rows.map((row) => ({
      ...row,
      salary: `$${parseInt(row.salary).toLocaleString()}`,
    }));

    return formattedResult;
  } catch (error) {
    console.error("Error fetching employees by role:", error);
    throw error;
  }
};

async function getRolesByDepartment(departmentId) {
  try {
    const result = await pool.query(
      `
      SELECT 
        role.id,
        role.title,
        CONCAT('$', role.salary) AS salary,
        department.name AS department_name
      FROM 
        role
      INNER JOIN 
        department ON role.department_id = department.id
      WHERE 
        role.department_id = $1
    `,
      [departmentId]
    );

    return result.rows || []; 
  } catch (error) {
    console.error("Error fetching roles by department:", error);
    throw error;
  }
}

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
  if (
    newDepartmentName === null ||
    newDepartmentName === undefined ||
    newDepartmentName.trim() === ""
  ) {
    throw new Error("The new department name cannot be null.");
  }

  try {
    const res = await pool.query(
      "UPDATE department SET name = $1 WHERE id = $2 RETURNING *",
      [newDepartmentName, departmentId]
    );

    if (res.rows.length === 0) {
      throw new Error(
        "No department was found with the provided ID, or the name was not changed."
      );
    }

    return res.rows[0];
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
        e.last_name,
        r.title AS role_title,
        CONCAT('$', r.salary) AS role_salary,
        d.name AS department_name
      FROM 
        employee e
      INNER JOIN 
        role r ON e.role_id = r.id
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
        TO_CHAR(r.salary, 'FM$999,999') AS role_salary,
        d.name AS department_name
      FROM 
        employee e
      INNER JOIN 
        role r ON e.role_id = r.id
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
      return false;
    }

    const result = await pool.query("DELETE FROM department WHERE id = $1", [
      departmentId,
    ]);
    if (result.rowCount === 0) {
      console.error(
        "No department was deleted. Department not found or already deleted."
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting department:", error);
    throw error;
  }
};

// Function to delete a role
const deleteRole = async (roleId) => {
  try {
    const employees = await pool.query(
      "SELECT id, first_name, last_name FROM employee WHERE role_id = $1",
      [roleId]
    );

    if (employees.rows.length > 0) {
      console.error(
        chalk.red`Cannot delete role: ${employees.rows.length} employees are still assigned to this role.\n`
      );
      return { success: false, employees: employees.rows };
    }

    await pool.query("DELETE FROM role WHERE id = $1", [roleId]);
    return { success: true };
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

