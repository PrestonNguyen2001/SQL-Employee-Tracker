const inquirer = require("inquirer");
const {
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
} = require("../queries");

const pool = require("../db/connection");



describe("getAllDepartments", () => {
  it("should return an array of departments", async () => {
    const departments = await getAllDepartments();
    expect(Array.isArray(departments)).toBe(true);
  });
});

describe("getAllRoles", () => {
  it("should return an array of roles", async () => {
    const roles = await getAllRoles();
    expect(Array.isArray(roles)).toBe(true);
  });
});

describe("getAllEmployees", () => {
  it("should return an array of employees", async () => {
    const employees = await getAllEmployees();
    expect(Array.isArray(employees)).toBe(true);
  });
});

describe("getAllManagers", () => {
  it("should return an array of managers", async () => {
    const managers = await getAllManagers();
    expect(Array.isArray(managers)).toBe(true);
  });
});

describe("addDepartment", () => {
  it("should add a new department to the database", async () => {
    const departmentName =
      "Test Department" + Math.random().toString(36).substring(7);
    await addDepartment(departmentName, false); // Pass false to indicate it's not a test department
    const departments = await getAllDepartments();
    const testDepartment = departments.find(
      (dep) => dep.name === departmentName
    );
    expect(testDepartment).toBeTruthy();
  });
});


describe("addRole", () => {
  it("should add a new role to the database", async () => {
    const roleName = "Test Role" + Math.random().toString(36).substring(7);
    await addRole(roleName, 50000, 1, false); // Pass false to indicate it's not a test role
    const roles = await getAllRoles();
    const testRole = roles.find((role) => role.title === roleName);
    expect(testRole).toBeTruthy();
  });
});


describe("getAllEmployees", () => {
  it("should return an array of employees with salary information", async () => {
    // Call the function
    const employees = await getAllEmployees();

    // Check if the result is an array
    expect(Array.isArray(employees)).toBe(true);

    // Check if the data structure is correct for each employee
    employees.forEach((employee) => {
      expect(employee).toHaveProperty("id");
      expect(employee).toHaveProperty("first_name");
      expect(employee).toHaveProperty("last_name");
      expect(employee).toHaveProperty("role_title");
      expect(employee).toHaveProperty("role_salary");
      expect(employee).toHaveProperty("department_name");
      expect(employee).toHaveProperty("manager");
    });
  });
});

describe("updateRoleSalary", () => {
  it("should update the salary of a role in the database", async () => {
    const roleId = 1; // Replace with the actual role ID
    const newSalary = 60000; // New salary value
    await updateRoleSalary(roleId, newSalary);

    // Check if the salary was updated correctly
    const updatedRole = await pool.query("SELECT * FROM role WHERE id = $1", [
      roleId,
    ]);
    expect(updatedRole.rows.length).toBe(1); // Ensure only one role is found
    const updatedSalary = parseInt(updatedRole.rows[0].salary); // Convert salary to number
    expect(updatedSalary).toBe(newSalary); // Check if salary was updated
  });
});



// describe("updateEmployeeRole", () => {
//   it("should update the role of an employee in the database", async () => {
//     // Add a test employee
//     await addEmployee("Test", "Employee", 1, null, true); // Assuming role ID 1 exists

//     // Update the role of the test employee
//     await updateEmployeeRole(1, 2); // Assuming employee ID 1 exists, and role ID 2 exists

//     // Fetch the updated employee
//     const employees = await getAllEmployees();
//     const updatedEmployee = employees.find((emp) => emp.id === 1);

//     // Ensure updatedEmployee is defined
//     expect(updatedEmployee).toBeDefined();

//     // Assuming the property name for the role ID is different, replace 'roleId' accordingly
//     // Ensure that the role ID of the updated employee matches the expected value (2)
//     expect(updatedEmployee.role_id).toBe(2); // Replace 'role_id' with the actual property name
//   });
// });





// describe("updateEmployeeManager", () => {
//   it("should update the manager of an employee in the database", async () => {
//     await updateEmployeeManager(1, 2); // Assuming employee ID 1 exists, and manager ID 2 exists
//     const updatedEmployee = await getAllEmployees().find((emp) => emp.id === 1);
//     expect(updatedEmployee.manager_id).toBe(2);
//   });
// });

describe("getEmployeesByManager", () => {
  it("should return an array of employees managed by a given manager", async () => {
    const employees = await getEmployeesByManager(1); // Assuming manager ID 1 exists
    expect(Array.isArray(employees)).toBe(true);
  });
});

describe("getEmployeesByDepartment", () => {
  it("should return an array of employees in a given department", async () => {
    const employees = await getEmployeesByDepartment(1); // Assuming department ID 1 exists
    expect(Array.isArray(employees)).toBe(true);
  });
});

describe("getEmployeesByRole", () => {
  it("should return an array of employees with a given role", async () => {
    const employees = await getEmployeesByRole(1); // Assuming role ID 1 exists
    expect(Array.isArray(employees)).toBe(true);
  });
});

describe("sortEmployeesBySalary", () => {
  it("should return an array of employees sorted by salary in descending order", async () => {
    const employees = await sortEmployeesBySalary();
    expect(Array.isArray(employees)).toBe(true);
  });
});

describe("sortEmployeesByLastName", () => {
  it("should return an array of employees sorted by last name", async () => {
    const employees = await sortEmployeesByLastName();
    expect(Array.isArray(employees)).toBe(true);
  });
});

// describe("groupEmployeesByRole", () => {
//   it("should return an array of employees grouped by role", async () => {
//     jest.mock("inquirer", () => ({
//       prompt: jest.fn().mockResolvedValue({ roleTitle: "Engineer" }),
//     }));
//     const employeesByRole = await groupEmployeesByRole();
//     expect(Array.isArray(employeesByRole)).toBe(true);
//   });
// });

// afterAll(async () => {
//   // Assuming the department and role were added with specific names
//   await deleteDepartment("Test Department");
//   await deleteRole("Test Role");
// });

describe("sortRolesBySalary", () => {
  it("should return an array of roles sorted by salary in descending order", async () => {
    const roles = await sortRolesBySalary();
    expect(Array.isArray(roles)).toBe(true);
  });
});

describe("groupRolesByDepartment", () => {
  it("should return an array of roles grouped by department", async () => {
    const rolesByDepartment = await groupRolesByDepartment();
    expect(Array.isArray(rolesByDepartment)).toBe(true);
  });
});

describe("deleteDepartment", () => {
  it("should delete a department from the database", async () => {
    const departmentName = "Unique Test Department"; // Generate a unique name
    await addDepartment(departmentName);
    // Get the department ID of the newly added department
    const departmentsBeforeDeletion = await getAllDepartments();
    const testDepartment = departmentsBeforeDeletion.find(
      (dep) => dep.name === departmentName
    );
    expect(testDepartment).toBeTruthy(); // Ensure the department was added

    // Now delete the department
    await deleteDepartment(testDepartment.id);

    // Verify that the department was deleted
    const departmentsAfterDeletion = await getAllDepartments();
    const deletedDepartment = departmentsAfterDeletion.find(
      (dep) => dep.name === departmentName
    );
    expect(deletedDepartment).toBeFalsy(); // Ensure the department was deleted
  });
});


describe("deleteRole", () => {
  it("should delete a role from the database", async () => {
    const uniqueRoleTitle = "Unique Test Role"; // Generate a unique title
    await addRole(uniqueRoleTitle, 50000, 1); // Assuming department ID 1 exists
    // Get the role ID of the newly added role
    const rolesBeforeDeletion = await getAllRoles();
    const testRole = rolesBeforeDeletion.find(
      (role) => role.title === uniqueRoleTitle
    );
    expect(testRole).toBeTruthy(); // Ensure the role was added

    // Now delete the role
    await deleteRole(testRole.id);

    // Verify that the role was deleted
    const rolesAfterDeletion = await getAllRoles();
    const deletedRole = rolesAfterDeletion.find(
      (role) => role.title === uniqueRoleTitle
    );
    expect(deletedRole).toBeFalsy(); // Ensure the role was deleted
  });
});


describe("deleteEmployee", () => {
  it("should delete an employee from the database", async () => {
    const employeeId = 1; // Assuming employee ID 1 exists
    await addEmployee("Test", "Employee", 1, null); // Assuming role ID 1 exists
    await deleteEmployee(employeeId);
    const employees = await getAllEmployees();
    const testEmployee = employees.find((emp) => emp.id === employeeId);
    expect(testEmployee).toBeFalsy();
  });
});

describe("getTotalBudgetByDepartment", () => {
  it("should return the total budget of a department as a number", async () => {
    const totalBudget = await getTotalBudgetByDepartment(1); // Assuming department ID 1 exists
    expect(typeof totalBudget).toBe("number");
    expect(isNaN(totalBudget)).toBe(false); // Ensure totalBudget is not NaN
    expect(totalBudget >= 0).toBe(true); // Ensure totalBudget is a non-negative number
  });
});



