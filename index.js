#!/usr/bin/env node

const fs = require('fs');
const program = require('commander');
const download = require('download-git-repo');
const handlebars = require('handlebars');
const inquirer = require('inquirer');
const ora = require('ora');
const chalk = require('chalk');
const symbols = require('log-symbols');
const validator = require('validator');

program.version('1.0.0', '-v, --version')
    .command('init <name>')
    .action((name) => {
        if (!fs.existsSync(name)) {
            inquirer.prompt([{
                    name: 'description',
                    message: '请输入项目描述'
                },
                {
                    name: 'author',
                    message: '请输入作者名称'
                },
                //是否类型
                {
                    type: "confirm",
                    name: "sex",
                    message: "Are you male?",
                    default: false
                },
                // 输入类型，添加校验
                {
                    type: "input",
                    name: "phone",
                    message: "What's your phone number",
                    validate: function (value) {
                        return validator.isMobilePhone(value, 'zh-CN') ? true : "Please enter a valid phone number";
                    }
                },

                //select下拉选项
                {
                    type: "list",
                    name: "weight",
                    message: "How much is your weight",
                    choices: ["Large", "Middle", "Small"],
                    filter: function (value) {
                        return value.toLowerCase();
                    }
                },
            ]).then((answers) => {
                const spinner = ora('正在下载模板...');
                spinner.start();
                download('github:github.com:Shoestrong/my_cli#dev', name, {
                    clone: true
                }, (err) => {
                    if (err) {
                        spinner.fail();
                        console.log(symbols.error, chalk.red(err));
                    } else {
                        spinner.succeed();
                        const fileName = `${name}/package.json`;
                        const meta = {
                            name,
                            description: answers.description,
                            author: answers.author
                        }
                        if (fs.existsSync(fileName)) {
                            const content = fs.readFileSync(fileName).toString();
                            const result = handlebars.compile(content)(meta);
                            fs.writeFileSync(fileName, result);
                        }
                        console.log(symbols.success, chalk.green('项目初始化完成'));
                    }
                })
            })
        } else {
            // 错误提示项目已存在，避免覆盖原有项目
            console.log(symbols.error, chalk.red('项目已存在'));
        }
    })
program.parse(process.argv);