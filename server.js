const mysql = require('mysql');
const inquirer = require('inquirer');
require('console.table');

// mySQL Connection 
const connection = mysql.createConnection({
    host: "localhost",
    port: "3306",
    user: "root",
    password: "root",
    database: "updatedEmployee_db"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log(`
    ╔═══╗─────╔╗──────────────╔═╗╔═╗
    ║╔══╝─────║║──────────────║║╚╝║║
    ║╚══╦╗╔╦══╣║╔══╦╗─╔╦══╦══╗║╔╗╔╗╠══╦═╗╔══╦══╦══╦═╗
    ║╔══╣╚╝║╔╗║║║╔╗║║─║║║═╣║═╣║║║║║║╔╗║╔╗╣╔╗║╔╗║║═╣╔╝
    ║╚══╣║║║╚╝║╚╣╚╝║╚═╝║║═╣║═╣║║║║║║╔╗║║║║╔╗║╚╝║║═╣║
    ╚═══╩╩╩╣╔═╩═╩══╩═╗╔╩══╩══╝╚╝╚╝╚╩╝╚╩╝╚╩╝╚╩═╗╠══╩╝
    ───────║║──────╔═╝║─────────────────────╔═╝║
    ───────╚╝──────╚══╝─────────────────────╚══╝`)
    // Runs Application 
    firstPrompt();
});

// Prompts and Messages
const promptMessages = {
    viewAllEmployees: "View All Employees",
    viewByDepartment: "View All Employees by Department",
    viewByManager: "View All Employees by Manager",
    addEmployee: "Add an Employee",
    removeEmployee: "Remove an Employee",
    updateEmployeeRole: "Update Employee Role",
    updateEmployeeManager: "Update Employee Manager",
    viewAllRoles: "View All Roles",
    exit: "Exit"
}; 

function firstPrompt() {
    inquirer
        .prompt({
            name: 'userChoice',
            type: 'list',
            message: 'What would you like to do?',
            choices: [
                promptMessages.viewAllEmployees,
                promptMessages.viewByDepartment,
                promptMessages.viewByManager,
                promptMessages.viewAllRoles,
                promptMessages.addEmployee,
                promptMessages.removeEmployee,
                promptMessages.updateEmployeeRole,
                promptMessages.updateEmployeeManager,
                promptMessages.exit
            ]
        }) 
        .then(answer => {
            console.log('answer', answer);

            switch(answer.userChoice) {
                case promptMessages.viewAllEmployees: 
                    viewAllEmployees();
                    break;

                case promptMessages.viewByDepartment:
                    viewByDepartment();
                    break;

                case promptMessages.viewByManager:
                    viewByManager();
                    break;

                case promptMessages.viewAllRoles:
                    viewAllRoles();
                    break;

                case promptMessages.addEmployee:
                    addEmployee();
                    break;
                
                case promptMessages.removeEmployee:
                    remove('delete');
                    break;

                case promptMessages.updateEmployeeRole:
                    // remove('role');
                    updateEmployeeRole();
                    break;

                case promptMessages.updateEmployeeManager:
                    updateEmployeeManager();
                    break;

                case promptMessages.exit:
                    connection.end();
                    break;
            }
        });
}

// View all Employees
function viewAllEmployees() {
    var query = 
        `SELECT
            employee.id,
            employee.first_name,
            employee.last_name,
            role.title, 
            department.name AS department, 
            role.salary,
            CONCAT(manager.first_name, ' ', manager.last_name) AS manager
        FROM employee
        LEFT JOIN employee manager 
            ON manager.id = employee.manager_id
        INNER JOIN role 
            ON (role.id = employee.role_id)
        INNER JOIN department 
            ON (department.id = role.department_id)
        ORDER BY employee.id`;

            connection.query(query, (err, res) => {
                if (err) throw err;
           
                console.log('VIEW ALL EMPLOYEES');
                console.table(res);

                firstPrompt();
        });
    }

// View by Departments
function viewByDepartment() {
    var query = 
        `SELECT 
            department.name AS department,
            role.title,
            employee.id,
            employee.first_name,
            employee.last_name,
        FROM employee
        LEFT JOIN role 
            ON (role.id = employee.role_id)
        LEFT JOIN department 
            ON (department.id = role.department_id)
        ORDER BY department.name`;

            connection.query(query, (err, res) => {
                if (err) throw err;
                
                const departmentChoices = res.map((choices) => ({
                    value: choices.id, name: choices.name
                }));

                console.log('VIEW EMPLOYEE BY DEPARTMENT');
                console.table(res);

                getDepartment(departmentChoices);
        });
}

// Get Department
function getDepartment(departmentChoices) {
    inquirer 
        .prompt([
            {
                type: "input",
                name: "department",
                message: "Departments: ",
                choices: departmentChoices
            }
        ]) .then((res) => {
            let query = `SELECT 
                            employee.id,
                            employee.first_name,
                            employee.last_name,
                            role.title,
                            department.name
                        FROM employee
                        JOIN role
                            ON employee.role_id = role.id
                        JOIN department 
                            ON department.id = role.department_id
                        WHERE department.id = ?`
            
            connection.query(query, res.department,(err, res) => {
                if(err) throw err;
                    firstPrompt();
                    console.table(res);
            });
        });
}

// View by Management
function viewByManager() {
    let query = 
        `SELECT 
            CONCAT(manager.first_name, ' ', manager.last_name) AS manager,
            department.name AS department, 
            employee.id, 
            employee.first_name, 
            employee.last_name, 
            role.title 
        FROM employee
        LEFT JOIN employee manager on manager.id = employee.manager_id
        INNER JOIN role ON (role.id = employee.role_id && employee.manager_id != 'NULL')
        INNER JOIN department ON (department.id = role.department_id)
        ORDER BY manager`;

        connection.query(query, (err, res) => {
            if (err) throw err;

            console.log('VIEW EMPLOYEE BY MANAGER');
            console.table(res);

            firstPrompt();
    });
}

// View all Roles 
function viewAllRoles() {
    let query =
        `SELECT 
            role.title,
            employee.id,
            employee.first_name,
            employee.last_name,
            department.name AS department
        FROM employee
        LEFT JOIN role ON (role.id = employee.role_id)
        LEFT JOIN department ON (department.id = role.department_id)
        ORDER BY role.title;`;

        connection.query(query, (err, res) => {
            if (err) throw err;

            console.log('VIEW EMPLOYEE BY ROLE');
            console.table(res);

            firstPrompt();
        });
}

// Add Employee
function addEmployee() {
    let query = 
        `SELECT
            role.id,
            role.title,
            role.salary
        FROM role`

    connection.query(query, (err, res) => {
        if(err) throw err;
        const role = res.map(({ id, title, salary }) => ({
            value: id,
            title: `${ title }`,
            salary: `${ salary }`
        }));

        console.log(res);
        employeeRole(role);
    });
}

function employeeRole(role) {
    inquirer
        .prompt([
            {
                type: "input",
                name: "firstName",
                message: "Employee First Name: "
            },
            {
                type: "input",
                name: "lastName",
                message: "Employee Last Name: "
            },
            {
                type: "list",
                name: "roleId",
                message: "Employee Role: ",
                choices: role
            }
        ]) .then((res) => {
            let query = `INSERT INTO employee SET ?`
            connection.query(query, {
                first_name: res.firstName,
                last_name: res.lastName,
                role_id: res.roleId
            }, (err, res) => {
                if(err) throw err;

                console.table(res);
                console.log(res.insertedRows + "Inserted successfully!\n");

                firstPrompt();
            });
        });
}

function updateEmployeeRole() {
    console.log("Updating an employee!");

    let query = 
    `SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
    FROM employee e
    JOIN role r
      ON e.role_id = r.id
    JOIN department d
    ON d.id = r.department_id
    JOIN employee m
      ON m.id = e.manager_id`

      connection.query(query, function (err, res) {
        if (err) throw err;
    
        const employeeChoices = res.map(({ id, first_name, last_name }) => ({
          value: id, name: `${first_name} ${last_name}`      
        }));
    
        console.table(res);
        console.log("employeeArray To Update!\n")
    
        roleArray(employeeChoices);
      });
}
    
function roleArray(employeeChoices) {
    console.log("Updating an role");
    
    var query =
        `SELECT r.id, r.title, r.salary 
        FROM role r`
        let roleChoices;
    
        connection.query(query, function (err, res) {
        if (err) throw err;
    
        roleChoices = res.map(({ id, title, salary }) => ({
            value: id, title: `${title}`, salary: `${salary}`      
        }));
    
        console.table(res);
        console.log("roleArray to Update!\n")
    
        promptEmployeeRole(employeeChoices, roleChoices);
      });
}

function promptEmployeeRole(employeeChoices, roleChoices) {

    inquirer
      .prompt([
        {
          type: "list",
          name: "employeeId",
          message: "Which employee do you want to set with the role?",
          choices: employeeChoices
        },
        {
          type: "list",
          name: "roleId",
          message: "Which role do you want to update?",
          choices: roleChoices
        },
      ])
      .then(function (answer) {
  
        var query = `UPDATE employee SET role_id = ? WHERE id = ?`
        // when finished prompting, insert a new item into the db with that info
        connection.query(query,
          [ answer.roleId,  
            answer.employeeId
          ],
          function (err, res) {
            if (err) throw err;
  
            console.table(res);
            console.log(res.affectedRows + "Updated successfully!");
  
            firstPrompt();
          });
      });
  }

