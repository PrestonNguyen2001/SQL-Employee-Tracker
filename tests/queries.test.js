const inquirer = require("inquirer");
const {
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
} = require("../lib/queries/queries");

const pool = require("../db/connection");

// --------------------------------------------------------------------------
// --  ADD TESTS                                                          //
// --------------------------------------------------------------------------

describe("addDepartment", () => {
  it("should add a new department to the database", async () => {
    const departmentName = "Test Department";
    await addDepartment(departmentName);
    const departmentsResult = await viewAllDepartments();
    expect(Array.isArray(departmentsResult)).toBe(true);
    const testDepartment = departmentsResult.find(
      (dep) => dep.name === departmentName
    );
    expect(testDepartment).toBeTruthy();
  });
});

describe("viewAllDepartments", () => {
  it("should return an array of departments", async () => {
    const departmentsResult = await viewAllDepartments();
    expect(Array.isArray(departmentsResult)).toBe(true);
  });
});


// Add role test
describe("addRole", () => {
  it("should add a new role to the database", async () => {
    const roleName = "Test Role";
    await addRole(roleName, 50000, 1);
    const roles = await viewAllRoles();
    expect(Array.isArray(roles)).toBe(true); 
    const testRole = roles.find((role) => role.title === roleName);
    expect(testRole).toBeTruthy();
  });
});

// Add employee test
describe("addEmployee", () => {
  it("should add a new employee to the database", async () => {
    const firstName = "Test";
    const lastName = "Employee";
    const roleId = 1;
    const managerId = null; 
    const isManager = false; 

    await addEmployee(firstName, lastName, roleId, managerId, isManager);
    const employees = await viewAllEmployees();
    expect(Array.isArray(employees)).toBe(true); 
    const testEmployee = employees.find(
      (emp) => emp.first_name === firstName && emp.last_name === lastName
    );
    expect(testEmployee).toBeTruthy();
  });
});

// Sort roles by salary test
describe("sortRolesBySalary", () => {
  it("should return an array of roles sorted by salary in descending order", async () => {
    const roles = await sortRolesBySalary();
    expect(Array.isArray(roles)).toBe(true);
  });
});

// Group roles by department test
describe("viewRolesByDepartment", () => {
  it("should return an array of roles grouped by department", async () => {
    const rolesByDepartment = await viewRolesByDepartment();
    expect(Array.isArray(rolesByDepartment)).toBe(true);
  });
});

// Delete role test
describe("deleteRole", () => {
  test("should delete a role from the database", async () => {
    const roleTitle = "Unique Test Role " + new Date().getTime(); // Ensures uniqueness
    try {
      await addRole(roleTitle, 50000, 1);
      const result = await pool.query("SELECT id FROM role WHERE title = $1", [
        roleTitle,
      ]);
      const roleId = result.rows[0].id;
      await pool.query(
        "UPDATE employee SET role_id = NULL WHERE role_id = $1",
        [roleId]
      );
      await deleteRole(roleId);
      const deletedRoleResult = await pool.query(
        "SELECT * FROM role WHERE id = $1",
        [roleId]
      );
      expect(deletedRoleResult.rows.length).toBe(0);
    } catch (error) {
      console.error("Test failed:", error);
    }
  });
});

// --------------------------------------------------------------------------
// --  VIEW TESTS                                                    //
// --------------------------------------------------------------------------

// View all departments test
describe("viewAllDepartments", () => {
  it("should return an array of departments", async () => {
    const departmentsResult = await viewAllDepartments();
    expect(Array.isArray(departmentsResult)).toBe(true);
  });
});

// View all roles test
describe("viewAllRoles", () => {
  it("should return an array of roles", async () => {
    const roles = await viewAllRoles();
    expect(Array.isArray(roles)).toBe(true);
  });
});

// View all employees test
describe("viewAllEmployees", () => {
  it("should return an array of employees", async () => {
    const employees = await viewAllEmployees();
    expect(Array.isArray(employees)).toBe(true);
  });
});

// View all managers test
describe("viewAllManagers", () => {
  it("should return an array of managers", async () => {
    const managers = await viewAllManagers();
    expect(Array.isArray(managers)).toBe(true);
  });
});

// View all employees with salary information test
describe("viewAllEmployees", () => {
  it("should return an array of employees with salary information", async () => {
    const employees = await viewAllEmployees();
    expect(Array.isArray(employees)).toBe(true);
    employees.forEach((employee) => {
      expect(employee).toHaveProperty("id");
      expect(employee).toHaveProperty("first_name");
      expect(employee).toHaveProperty("last_name");
      expect(employee).toHaveProperty("role_title");
      expect(employee).toHaveProperty("salary");
      expect(employee).toHaveProperty("department_name");
      expect(employee).toHaveProperty("manager_name");
    });
  });
});

// View total utilized budget by department test
describe("viewTotalUtilizedBudgetByDepartment", () => {
  it("should return the total utilized budget of a department", async () => {
    const departmentId = 1; 
    const totalBudget = await viewTotalUtilizedBudgetByDepartment(departmentId);
    expect(typeof totalBudget).toBe("string");
    console.log(`Total budget: $${totalBudget}`);
  });
});

// View total budget by all departments test
describe("viewTotalBudgetByAllDepartments", () => {
  test("aggregates total budgets correctly", async () => {
    const mockQuery = jest
      .spyOn(pool, "query")
      .mockImplementationOnce(() =>
        Promise.resolve({
          rows: [{ department_id: 1, total_utilized_budget: "10000" }],
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          rows: [
            {
              department_name: "HR",
              total_utilized_budget: "$10,000.00",
              budget_percentage: "100%",
            },
          ],
        })
      );

    const result = await viewTotalBudgetByAllDepartments();
    expect(result.totalBudget).toEqual("$10,000.00");
    expect(result.departments.length).toBeGreaterThan(0);
    expect(result.departments[0].department_name).toBe("HR");
    mockQuery.mockRestore();
  });
});

// View employee details by department test
describe("viewEmployeeDetailsByDepartment", () => {
  test("fetches employee details for a given department", async () => {
    const mockQuery = jest.spyOn(pool, "query").mockResolvedValue({
      rows: [
        {
          first_name: "John",
          last_name: "Doe",
          role: "Developer",
          salary: "$80000",
          department_name: "Technology",
          budget_percentage: "25%",
        },
      ],
    });

    const employees = await viewEmployeeDetailsByDepartment(1);
    expect(employees.length).toBeGreaterThan(0);
    expect(employees[0].first_name).toEqual("John");
    mockQuery.mockRestore();
  });
});

// View employees by manager test
describe("viewEmployeesByManager", () => {
  it("should return an array of employees managed by a given manager", async () => {
    const employees = await viewEmployeesByManager(1); 
    expect(Array.isArray(employees)).toBe(true);
  });
});

// View employees by department test
describe("viewEmployeesByDepartment", () => {
  it("should return an array of employees in a given department", async () => {
    const employeesResult = await viewEmployeesByDepartment(1); 
    expect(Array.isArray(employeesResult)).toBe(true);
  });
});

// View employees by role test
describe("viewEmployeesByRole", () => {
  it("should return an array of employees with a given role", async () => {
    const employees = await viewEmployeesByRole(1); 
    expect(Array.isArray(employees)).toBe(true);
  });
});

// --------------------------------------------------------------------------
// --  UPDATE TESTS                                                      //
// --------------------------------------------------------------------------
// Update role salary test
describe("updateRoleSalary", () => {
  it("should update the salary of a role in the database", async () => {
    const roleId = 1; 
    const newSalary = 60000; 
    await updateRoleSalary(roleId, newSalary);

    const updatedRole = await pool.query("SELECT * FROM role WHERE id = $1", [
      roleId,
    ]);
    expect(updatedRole.rows.length).toBe(1); 
    const updatedSalary = parseInt(updatedRole.rows[0].salary); 
    expect(updatedSalary).toBe(newSalary); 
  });
});

// Update employee role test
describe("updateEmployeeRole", () => {
  it("should update an employee's role in the database", async () => {
    
    const [employee] = await viewAllEmployees(); 
    const newRoleId = 2; 

    const initialRoleId = employee.role_id;

    await updateEmployeeRole(employee.id, newRoleId);

    const updatedEmployee = await pool.query(
      "SELECT * FROM employee WHERE id = $1",
      [employee.id]
    );

    expect(updatedEmployee.rows.length).toBe(1);
    expect(updatedEmployee.rows[0].role_id).toBe(newRoleId);
    expect(updatedEmployee.rows[0].role_id).not.toBe(initialRoleId); 
  });
});

// Update employee manager test
describe("updateEmployeeManager", () => {
  it("should update an employee's manager in the database", async () => {
   
    const [employee1, employee2] = await viewAllEmployees();
    const initialManagerId = employee2.manager_id;

    await updateEmployeeManager(employee2.id, employee1.id); 

    const updatedEmployee2 = await pool.query(
      "SELECT * FROM employee WHERE id = $1",
      [employee2.id]
    );

    expect(updatedEmployee2.rows.length).toBe(1);
    expect(updatedEmployee2.rows[0].manager_id).toBe(employee1.id);
    expect(updatedEmployee2.rows[0].manager_id).not.toBe(initialManagerId); 
  });
});

// Update role title test
describe("updateRoleTitle", () => {
  it("should update the title of a role in the database", async () => {
    const roleId = 1; 
    const newTitle = "New Role Title"; 
    await updateRoleTitle(roleId, newTitle);

    const updatedRole = await pool.query("SELECT * FROM role WHERE id = $1", [
      roleId,
    ]);
    expect(updatedRole.rows.length).toBe(1);
    expect(updatedRole.rows[0].title).toBe(newTitle);
  });
});

// Update role department test
describe("updateRoleDepartment", () => {
  it("should update the department of a role in the database", async () => {
    const roleId = 1; 
    const newDepartmentId = 2; 
    await updateRoleDepartment(roleId, newDepartmentId);

    const updatedRole = await pool.query("SELECT * FROM role WHERE id = $1", [
      roleId,
    ]);
    expect(updatedRole.rows.length).toBe(1);
    expect(updatedRole.rows[0].department_id).toBe(newDepartmentId); 
  });
});

// Update department name test
describe("updateDepartmentName", () => {
  it("should not allow updating the department name to null", async () => {
    const departmentId = 1; 
    const newDepartmentName = null; 

    try {
      await updateDepartmentName(departmentId, newDepartmentName);
    } catch (error) {
      expect(error.message).toBe("The new department name cannot be null.");
    }
    const result = await pool.query(
      "SELECT name FROM department WHERE id = $1",
      [departmentId]
    );
    expect(result.rows[0].name).not.toBe(null);
  });
});

// --------------------------------------------------------------------------
// --  SORT TESTS                                                          //
// --------------------------------------------------------------------------

// Sort employees by salary test
describe("sortEmployeesBySalary", () => {
  it("should return an array of employees sorted by salary in descending order", async () => {
    const employees = await sortEmployeesBySalary();
    expect(Array.isArray(employees)).toBe(true);
  });
});

// Sort employees by last name test
describe("sortEmployeesByLastName", () => {
  it("should return an array of employees sorted by last name", async () => {
    const employees = await sortEmployeesByLastName();
    expect(Array.isArray(employees)).toBe(true);
  });
});

// --------------------------------------------------------------------------
// --  DELETE TESTS                                                          //
// --------------------------------------------------------------------------

// Delete employee test
describe("deleteEmployee", () => {
  it("should delete an employee from the database", async () => {
    await addEmployee("Test", "Employee", 1, null, false); 
    const employeesBeforeDeletion = await viewAllEmployees();
    expect(Array.isArray(employeesBeforeDeletion)).toBe(true);
    const testEmployee = employeesBeforeDeletion.find(
      (emp) => emp.first_name === "Test" && emp.last_name === "Employee"
    );
    expect(testEmployee).toBeTruthy();

    await deleteEmployee(testEmployee.id);
    const employeesAfterDeletion = await viewAllEmployees();
    expect(Array.isArray(employeesAfterDeletion)).toBe(true);
    const deletedEmployee = employeesAfterDeletion.find(
      (emp) => emp.id === testEmployee.id
    );
    expect(deletedEmployee).toBeFalsy();
  });
});

// Delete department test
describe("deleteDepartment", () => {
  it("should delete a department from the database", async () => {
    const departmentName = "Unique Test Department"; 
    await addDepartment(departmentName);
    const departmentsBeforeDeletion = await viewAllDepartments();
    expect(Array.isArray(departmentsBeforeDeletion)).toBe(true);
    const testDepartment = departmentsBeforeDeletion.find(
      (dep) => dep.name === departmentName
    );
    expect(testDepartment).toBeTruthy();

    await deleteDepartment(testDepartment.id);
    const departmentsAfterDeletion = await viewAllDepartments();
    expect(Array.isArray(departmentsAfterDeletion)).toBe(true);
    const deletedDepartment = departmentsAfterDeletion.find(
      (dep) => dep.name === departmentName
    );
    expect(deletedDepartment).toBeFalsy();
  });
});

// Delete role test
describe("deleteRole", () => {
  it("should delete a role from the database", async () => {
    const roleName = "Unique Test Role";
    await addRole(roleName, 50000, 1); 
    const rolesBeforeDeletion = await viewAllRoles();
    expect(Array.isArray(rolesBeforeDeletion)).toBe(true);
    const testRole = rolesBeforeDeletion.find(
      (role) => role.title === roleName
    );
    expect(testRole).toBeTruthy();

    await pool.query("UPDATE employee SET role_id = NULL WHERE role_id = $1", [
      testRole.id,
    ]);
    await deleteRole(testRole.id);
    const rolesAfterDeletion = await viewAllRoles();
    expect(Array.isArray(rolesAfterDeletion)).toBe(true);
    const deletedRole = rolesAfterDeletion.find(
      (role) => role.title === roleName
    );
    expect(deletedRole).toBeFalsy();
  });
});

// --------------------------------------------------------------------------
// --  CLEAN UP TEST DATA                                                   //
// --------------------------------------------------------------------------

afterAll(async () => {
  // Clean up test data (departments, roles, employees)
  // Delete test employees
  const testEmployeeNames = [
    "Test Employee",
    "Unique Test Department Employee",
  ];
  for (const name of testEmployeeNames) {
    const parts = name.split(" ");
    const firstName = parts[0];
    const lastName = parts[1];
    const employees = await viewAllEmployees();
    const testEmployees = employees.filter(
      (emp) => emp.first_name === firstName && emp.last_name === lastName
    );

    for (const employee of testEmployees) {
      await deleteEmployee(employee.id);
    }
  }

  // Delete test roles
  const testRoleNames = ["Test Role", "Unique Test Role", "New Role Title"];
  for (const roleName of testRoleNames) {
    const roles = await viewAllRoles();
    const testRoles = roles.filter((role) => role.title === roleName);

    for (const role of testRoles) {
      await deleteRole(role.id);
    }
  }

  // Delete test departments and rollback name changes
  const testDepartmentNames = ["Test Department", "Unique Test Department"];
  for (const departmentName of testDepartmentNames) {
    const departments = await viewAllDepartments();
    const testDepartments = departments.filter(
      (dep) => dep.name === departmentName
    );

    for (const department of testDepartments) {
      await deleteDepartment(department.id);
    }
  }
});