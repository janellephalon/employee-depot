const mysql = require('mysql');
const inquirer = require('inquirer');
const express = require('express');
require('console.table');

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "employees_db"
});

// connect to the mysql server and sql database
connection.connect(function (err) {
    if (err) throw err;
    userPrompts();
});

// prompts and messages 
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

function prompt() {
    inquirer
        .prompt({
            name: 'action',
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
            switch(answer.action) {
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
                    remove('role');
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

// employees 
function viewAllEmployees() {
    let query = 
        `SELECT
            employee.id,
            employee.first_name,
            employee.last_name,
            role.title, 
            department.name AS department, 
            role.salary,
            CONCAT(manager.first_name, ' ', manager.last_name) AS manager
            FROM employee
            LEFT JOIN employee manager on manager.id = employee.manager_id
            INNER JOIN role ON (role.id = employee.role_id)
            INNER JOIN department ON (department.id = role.department_id)
            ORDER BY employee.id;`
            connection.query(query, (err, res) => {
                if (err) throw err;
                console.log('\n');
                console.log('VIEW ALL EMPLOYEES');
                console.log('\n');
                console.table(res);
                prompt();
        });
    }

function viewByDepartment() {
    let query = 
        `SELECT 
            department.name AS department,
            role.title,
            employee.id,
            employee.first_name,
            employee.last_name,
            FROM employee
            LEFT JOIN role ON (role.id = employee.role_id)
            LEFT JOIN department ON (department.id = role.department_id)
            ORDER BY department.name;`
            connection.query(query, (err, res) => {
                if (err) throw err;
                console.log('\n');
                console.log('VIEW EMPLOYEE BY DEPARTMENT');
                console.log('\n');
                console.table(res);
                prompt();
        });
}

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
        ORDER BY manager;`
        connection.query(query, (err, res) => {
            if (err) throw err;
            console.log('\n');
            console.log('VIEW EMPLOYEE BY MANAGER');
            console.log('\n');
            console.table(res);
            prompt();
    });
}