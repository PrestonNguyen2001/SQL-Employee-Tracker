const pool = require('./db/connection');

// -------------------------------------
// --  View
// -------------------------------------

// Function to view all departments
const getAllDepartments = async () => {
  try {
    const result = await pool.query('SELECT * FROM department');
    return result.rows;
  } catch (error) {
    console.error('Error fetching departments:', error);
    throw error;
  }
};

// Function to get total budget by department
const getTotalBudgetByDepartment = async (departmentId) => {
  try {
    const result = await pool.query(
      `
      SELECT SUM(r.salary) AS total_budget
      FROM role r
      INNER JOIN department d ON r.department_id = d.id
      WHERE d.id = $1
    `,
      [departmentId]
    );

    // Extract the total budget from the result
    const totalBudget = parseFloat(result.rows[0].total_budget);

    return totalBudget;
  } catch (error) {
    console.error("Error fetching total budget by department:", error);
    throw error;
  }
};

// Function to view all roles
const getAllRoles = async () => {
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
    console.error('Error fetching roles with department names:', error);
    throw error;
  }
};


// Function to view all employees with salary
const getAllEmployees = async () => {
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
    console.error('Error fetching employees with department names:', error);
    throw error;
  }
};

// Function to view all managers
// Function to view all managers with role name and department name
const getAllManagers = async () => {
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
    console.error('Error fetching managers with employees:', error);
    throw error;
  }
};



// Function to view employees by manager
const getEmployeesByManager = async (managerId) => {
  try {
    const result = await pool.query('SELECT * FROM employee WHERE manager_id = $1', [managerId]);
    return result.rows;
  } catch (error) {
    console.error('Error fetching employees by manager:', error);
    throw error;
  }
};

// Function to view employees by department
const getEmployeesByDepartment = async (departmentId) => {
  try {
    const result = await pool.query(`
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
    `, [departmentId]);
    return result.rows;
  } catch (error) {
    console.error('Error fetching employees by department:', error);
    throw error;
  }
};

// Function to get employees by role
const getEmployeesByRole = async (roleId) => {
  try {
    const result = await pool.query(`
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
    `, [roleId]);
    return result.rows;
  } catch (error) {
    console.error('Error fetching employees by role:', error);
    throw error;
  }
};

// -------------------------------------
// -- Add
// -------------------------------------

// Function to add a department
const addDepartment = async (name, isTestDepartment = false) => {
  try {
    // Check if it's not a test department before inserting
    if (!isTestDepartment) {
      await pool.query("INSERT INTO department (name) VALUES ($1)", [name]);
    }
  } catch (error) {
    console.error("Error adding department:", error);
    throw error;
  }
};

// Function to add a role
const addRole = async (title, salary, departmentId, isTestRole = false) => {
  try {
    // Check if it's not a test role before inserting
    if (!isTestRole) {
      await pool.query(
        "INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)",
        [title, salary, departmentId]
      );
    }
  } catch (error) {
    console.error("Error adding role:", error);
    throw error;
  }
};


// Function to add an employee
const addEmployee = async (
  firstName,
  lastName,
  roleId,
  managerId,
  isTestEmployee = false
) => {
  try {
    // Check if it's not a test employee before inserting
    if (!isTestEmployee) {
      await pool.query(
        "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)",
        [firstName, lastName, roleId, managerId]
      );
    }
  } catch (error) {
    console.error("Error adding employee:", error);
    throw error;
  }
};


// -------------------------------------
// -- Update
// -------------------------------------

// Function to update a role's salary
const updateRoleSalary  = async (roleId, newSalary) => {
  try {
    await pool.query('UPDATE role SET salary = $1 WHERE id = $2', [newSalary, roleId]);
  } catch (error) {
    console.error('Error updating role salary:', error);
    throw error;
  }
};

// Function to update an employee's role
const updateEmployeeRole = async (employeeId, newRoleId) => {
  try {
    await pool.query('UPDATE employee SET role_id = $1 WHERE id = $2', [newRoleId, employeeId]);
  } catch (error) {
    console.error('Error updating employee role:', error);
    throw error;
  }
}

// Function to update an employee's manager
const updateEmployeeManager = async (employeeId, newManagerId) => {
  try {
      await pool.query('UPDATE employee SET manager_id = $1 WHERE id = $2', [newManagerId, employeeId]);
  } catch (error) {
      console.error('Error updating employee manager:', error);
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
        r.salary AS role_salary,
        d.name AS department_name, 
        CASE 
          WHEN m.id IS NULL THEN NULL 
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
      ORDER BY 
        e.last_name
    `);
    return result.rows;
  } catch (error) {
    console.error('Error sorting employees by last name:', error);
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
        r.salary AS role_salary,
        d.name AS department_name, 
        CASE 
          WHEN m.id IS NULL THEN NULL 
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
      ORDER BY 
        r.salary DESC
    `);
    return result.rows;
  } catch (error) {
    console.error('Error sorting employees by salary:', error);
    throw error;
  }
};



// Function to group employees by role
const groupEmployeesByRole = async () => {
  try {
    const roles = await getAllRoles();
    const roleTitles = roles.map(role => role.title);

    const { roleTitle } = await inquirer.prompt([
      {
        type: 'list',
        name: 'roleTitle',
        message: 'Choose a role to view employees:',
        choices: roleTitles
      }
    ]);

    // Find the role ID associated with the selected role title
    const selectedRole = roles.find(role => role.title === roleTitle);
    const roleId = selectedRole.id;

    // Now we have the role ID, we can fetch employees by role
    const employees = await getEmployeesByRole(roleId);
    return employees;
  } catch (error) {
    console.error('Error grouping employees by role:', error);
    throw error;
  }
};

// Function to sort roles by salary
const sortRolesBySalary = async () => {
  try {
      const result = await pool.query('SELECT title AS role, salary FROM role ORDER BY salary DESC');
      // Add a dollar sign ($) before each salary value
      const rolesWithSalaryFormatted = result.rows.map(role => ({
          ...role,
          salary: '$' + role.salary
      }));
      return rolesWithSalaryFormatted;
  } catch (error) {
      console.error('Error sorting roles by salary:', error);
      throw error;
  }
};


// Function to group roles by department with department names
const groupRolesByDepartment = async () => {
  try {
    const result = await pool.query(`
      SELECT role.title AS role, department.id AS department_id, department.name AS department_name 
      FROM role 
      JOIN department ON role.department_id = department.id 
      ORDER BY role.department_id
    `);
    return result.rows;
  } catch (error) {
    console.error('Error grouping roles by department:', error);
    throw error;
  }
};

// -------------------------------------
// -- Delete
// -------------------------------------

// Function to delete a department
const deleteDepartment = async (departmentId) => {
  try {
    await pool.query('DELETE FROM department WHERE id = $1', [departmentId]);
  } catch (error) {
    console.error('Error deleting department:', error);
    throw error;
  }
};

// Function to delete a role
const deleteRole = async (roleId) => {
  try {
    await pool.query('DELETE FROM role WHERE id = $1', [roleId]);
  } catch (error) {
    console.error('Error deleting role:', error);
    throw error;
  }
};

// Function to delete an employee
const deleteEmployee = async (employeeId) => {
  try {
    await pool.query('DELETE FROM employee WHERE id = $1', [employeeId]);
  } catch (error) {
    console.error('Error deleting employee:', error);
    throw error;
  }
};

module.exports = {
  getAllDepartments,
  getAllRoles,
  getAllEmployees,
  getAllManagers,
  addDepartment,
  addRole,
  addEmployee,
  updateRoleSalary,
  updateEmployeeRole,
  updateEmployeeManager,
  getEmployeesByManager,
  getEmployeesByDepartment,
  getEmployeesByRole,
  sortEmployeesBySalary,
  sortEmployeesByLastName,
  groupEmployeesByRole,
  sortRolesBySalary,
  groupRolesByDepartment,
  deleteDepartment,
  deleteRole,
  deleteEmployee,
  getTotalBudgetByDepartment,
};
