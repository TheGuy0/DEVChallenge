//ClassApp DEV Challenge
//Henrique Sandes Lima Almeida

//Parâmetro para número do arquivo de entrada:
const fileNumber = ''
//Formação do nome do arquivo de entrada, supondo que sua formação seja input+fileNumber:
const fileName = 'input' + fileNumber + '.csv'
//Formação do path para o arquivo de entrada
const csvFilePath='./' + fileName
//Leitura de bibliotecas:
const csv = require('csvtojson') //Biblioteca para ler csv e transformar em json
const fs = require('fs') //Biblioteca para salvar o arquivo .json
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance(); //Biblioteca para verificação e formatação de números de celular
const { PhoneNumberFormat } = require('google-libphonenumber');

//Expressão regular para verificação de string válida de e-mail
const email_re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/

function validateEmail(email) {
    return email_re.test(email);
};

//Variável para armazenar os nomes das colunas do arquivo de entrada
let header;

//Chamada de leitura do arquivo de entrada, com modo de saída em output para permitir leitura de colunas com nome duplicado:
csv({
    output: "csv"
})
.fromFile(csvFilePath)
//Salvando nomes das colunas do arquivo de entrada
.on('header',(h)=>{
	header = h
})
.then((obj)=>{
    //Formatação do objeto obtido:
    // console.log(obj);
    // console.log(header);
    //Variáveis de iteração:
    let i, j;
    //Arquivo json formatado:
    let resp = [];
    //Variáveis auxiliares para identificação dos campos do objeto:
    let aux, aux_vec;
    // Variável auxiliar para testar validade do número de telefone:
    let phone_number, phone_string;
    // Variável auxiliar para testar vários valores válidos em uma única entrada:
    let values;
    // Identificando índice onde está o ID:
    for(i = 0; i < header.length; i++){
        if(header[i] == 'eid'){
            break;
        }
    }
    //Salvando índice da coluna correspondente ao ID da pessoa de cada linha:
    let eid_index = i;
    //Passando por todos os objetos lidos:
    for(i = 0; i < obj.length; i++){
        //Identificando se a pessoa do objeto lido já foi adicionada ao objeto formatado, a partir de seu ID:
        for(j = 0; j < resp.length; j++){
            if(resp[j].eid == obj[i][eid_index]){
                break;
            }
        }
        //Se não encontramos um registro válido, criamos um novo:
        if(j == resp.length)
            resp.push({"fullname": '', "eid":'', "groups": [], "addresses": [], "invisible": false, "see_all": false});

        //Filtramos e adicionamos ao novo registro os campos do objeto lido:
        for(x in obj[i]){
            if (obj[i][x] == ""){
                // Se o campo está vazio, descartamos
                continue;
            }
            //Dividindo o nome do campo para conseguir separar tags:
            aux_vec = header[x].split(" ");
            // console.log("\n")
            // console.log(aux_vec)
            // console.log(obj[i][x])
            //Pegando o nome do campo, ou forma de endereço no caso de email e phone:
            aux = aux_vec[0];
            //Para endereços, adicionamos o tipo, as tags e o texto dado de fato como valor
            // console.log(aux)
            if(aux == 'email'){
                //Pegamos todos os valores válidos da entrada, que podem estar separados por espaço ou barra
                values = obj[i][x].split(/[\s\/]+/)
                for(v in values){
                    //e adicionamos todos os endereços de e-mail válidos:
                    if(validateEmail(values[v])){
                        resp[j]['addresses'].push({
                            "type": aux,
                            "tags": aux_vec.slice(1),
                            "address": values[v].trim()
                        });
                    }
                }
            } else if(aux == 'phone'){
                try {
                    //Checamos se realmente é um número na entrada e se ele é válido:
                    phone_number = phoneUtil.parseAndKeepRawInput(obj[i][x], "BR");
                    if (!phoneUtil.isValidNumber(phone_number)) {
                        throw Error();
                    }
                    phone_string = phoneUtil.format(phone_number, PhoneNumberFormat.E164).slice(1);
                } catch (e) {
                    // console.log("Invalid number");
                    continue;
                }
                //Caso o número seja válido, adicionamos ao objeto:
                resp[j]['addresses'].push({
                    "type": aux,
                    "tags": aux_vec.slice(1),
                    "address": phone_string
                });
            //Para grupos adicionamos o novo grupo visto aos grupos já presentes no registro
            } else if(aux == 'group'){
                //Pegamos todos os valores válidos da entrada, que podem estar separados por espaço, barra ou vírgula
                values = obj[i][x].split(/[\/,]+/)
                for(v in values){
                    //e adicionamos à lista todos que ainda não foram adicionados previamente:
                    if(resp[j]['groups'].indexOf(values[v].trim()) == -1){
                        resp[j]['groups'].push(values[v].trim());
                    }
                }
            //Para as flags de estado, mudamos se for encontrado um valor válido
            } else if(aux == 'invisible' || aux == 'see_all'){
                values = obj[i][x];
                //Checando pelas strings que representam os valores de true e false para realizar a atribuição correta:
                if(values == '1' || values == 'yes'){
                    resp[j][aux] = true;
                } else if(values == '0' || values == 'no'){
                    resp[j][aux] = false;
                }
            //No caso geral, colocamos o nome do campo como o valor do campo no objeto lido:
            } else{
                resp[j][aux] = obj[i][x];
            }
        }
    }
    //console.log(resp); //Objeto formatado
    //Transformando o objeto json formatado para string para salvá-lo:
    let output_data = JSON.stringify(resp, null, 2);
    // console.log(resp); //Objeto formatado em forma de string
    //Salvando o arquivo .json resultante:
    fs.writeFileSync('output' + fileNumber + '.json', output_data);
})
 