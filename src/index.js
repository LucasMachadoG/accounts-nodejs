// Em Node.js, "fs" é a abreviação de "file system," que se refere ao módulo integrado que 
// permite que você interaja com o sistema de arquivos do seu sistema operacional. O módulo "fs" fornece 
// métodos para realizar operações de leitura, escrita, manipulação e gerenciamento de arquivos e 
// diretórios no sistema de arquivos local.

import chalk from "chalk";
import inquirer from "inquirer";
import fs from "fs"

operations()

function operations(){
  inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'O que você deseja fazer?',
      choices: [
        'Criar conta',
        'Consultar saldo',
        'Depositar',
        'Sacar',
        'Sair'
      ]
    }
  ]).then((answer) => {
    const action = answer['action']

    if(action === 'Criar conta'){
      createAccount()
    }else if(action === 'Consultar saldo'){
      getAccountBalance()
    }else if(action === 'Depositar'){
      deposit()
    }else if(action === 'Sacar'){
      withdraw()
    }else if(action === 'Sair'){
      console.log(chalk.bgBlue.black('Obrigado por utilizar o accounts'))
      process.exit()
    }
  })
  .catch((error) => console.log(error))
}

function createAccount(){
  console.log(chalk.bgGreen.black('Parabéns por escolher o nosso banco!'))
  console.log(chalk.green('Defina as opções da sua conta a seguir'))

  buildAccount()
}

function buildAccount(){
  inquirer.prompt([
    {
      name: 'accountName',
      message: 'Digite o nome da sua conta:'
    }
  ]).then((anwer) => {
      const accountName = anwer['accountName']

      // Iniciando a criação do nosso banco de dados para criar as contas 

      // Checando se um determinado diretório existe ('accounts'), caso ele não exista nós vamos criar
      if(!fs.existsSync('accounts')){
        // Fazendo a criação
        fs.mkdirSync('accounts')
      }

      // Fazendo a validação se o nome da conta existe
      if(fs.existsSync(`accounts/${accountName}.json`)){
        console.log(chalk.bgRed.black('Esta conta ja existe, escolha outro nome!'))
        buildAccount()
        return
      }

      // Criando a conta
      fs.writeFileSync(`accounts/${accountName}.json`, '{"balance":0}', function(err){
        console.log(err)
      })

      console.log(chalk.green.black('Parabens sua conta foi criada com sucesso!'))
      operations()
  }).catch((error) => console.log(error))
}

function deposit(){
  inquirer.prompt([{
    name: 'accountName',
    message: 'Qual o nome da sua conta?'
  }]).then((answer) => {
        const accountName = answer['accountName']

        if(!checkAccount(accountName)){
          return deposit()
        }

        inquirer.prompt([{
          name: 'amount',
          message: 'Quanto você deseja depositar?'
        }]).then((answer) => {
          const amount = answer['amount']

          addAmount(accountName, amount)
          operations()
        }).catch((err) => console.log(err))
      }
  ).catch((err) => console.log(err))
}

function checkAccount(accountName){
  if(!fs.existsSync(`accounts/${accountName}.json`)){
    console.log(chalk.bgRed.black('Essa conta não existe, tente novamente!'))
    return false
  }
  return true
}

function addAmount(accountName, amount){
  const account = getAccount(accountName)

  if(!amount){
    console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde!'))
    return deposit()
  }

  account.balance = parseFloat(amount) + parseFloat(account.balance)

  fs.writeFileSync(`accounts/${accountName}.json`, JSON.stringify(account),
  function(err) {
    console.log(err)
  })

  console.log(chalk.green(`Foi depositado um valor de R$${amount} na sua conta`))
}


function getAccount(accountName){
  const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
    encoding: 'utf8',
    flag: 'r'
  })

  return JSON.parse(accountJSON)
}

function getAccountBalance(){
  inquirer.prompt([{
    name: 'accountName',
    message: 'Qual o nome da sua conta?'
  }]).then((answer) => {
    const accountName = answer['accountName']

    if(!checkAccount(accountName)){
      return getAccountBalance()
    }

    const accountData = getAccount(accountName)

    console.log(chalk.bgBlue.black(`O saldo da sua conta é R$${accountData.balance}`))
    operations()
  }).catch((err) => console.log(err))
}

function withdraw(){
  inquirer.prompt([{
    name: 'accountName',
    message: 'Qual o nome da sua conta?'
  }]).then((answer) => {
    const accountName = answer['accountName']

    if(!checkAccount(accountName)){
      return withdraw()
    }

    inquirer.prompt([{
      name: 'amount',
      message: 'Informe qual o valor que você deseja sacar:'
    }]).then((answer) => {
      const amount = answer['amount']

      removeAmount(accountName, amount)
      }).catch((error) => console.log(error))
  }).catch((error) => console.log(error))
}

function removeAmount(accountName, amount){
  const accountData = getAccount(accountName)

  if(!amount){
    console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde!'))
    return withdraw()
  }

  if(accountData.balance < amount){
    console.log(chalk.bgRed.black('Valor indisponivel!'))
    return withdraw()
  }

  accountData.balance = parseFloat(accountData.balance) - parseFloat(amount)

  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData),
    function(err) {
      console.log(err)
    }
  )

  console.log(chalk.green(`Foi realizando um saque de R$${amount} da sua conta`))
  operations()
}

