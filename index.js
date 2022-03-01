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

//Chamada de leitura do arquivo de entrada:
csv()
.fromFile(csvFilePath)
.then((jsonObj)=>{
    //Formatação do objeto json obtido na entrada:
    //console.log(jsonObj);
    //Variáveis de iteração:
    let i, j;
    //Arquivo json formatado:
    let resp = [];
    //Variáveis auxiliares para identificação dos campos do objeto:
    let aux, aux_vec;
    //Passando por todos os objetos lidos:
    for(i = 0; i < jsonObj.length; i++){
        //Identificando se a pessoa do objeto lido já foi adicionada ao objeto formatado, a partir de seu ID:
        for(j = 0; j < resp.length; j++){
            if(resp[j].eid == jsonObj[i].eid){
                break;
            }
        }
        //Se não encontramos um registro válido, criamos um novo:
        if(j == resp.length)
            resp.push({"fullname": '', "eid":'', "groups": [], "addresses": [], "invisible": false, "see_all": false});

        //Filtramos e adicionamos ao novo registro os campos do objeto lido:
        for(x in jsonObj[i]){
            //Dividindo o nome do campo para conseguir separar tags:
            aux_vec = x.split(" ");
            //Pegando o nome do campo, ou forma de endereço no caso de email e phone:
            aux = aux_vec[0];
            //Para endereços, adicionamos o tipo, as tags e o texto dado de fato como valor
            if(aux == 'email' || aux == 'phone'){
                resp[j]['addresses'].push({
                    "type": aux,
                    "tags": aux_vec.slice(1),
                    "address": jsonObj[i][x]
                });
            //Para grupos adicionamos o novo grupo visto aos grupos já presentes no registro
            } else if(aux == 'group'){
                resp[j]['groups'].push(jsonObj[i][x]);
            //Para as flags de estado, mudamos se for encontrado um valor válido
            } else if(aux == 'invisible' || aux == 'see_all'){
                aux = jsonObj[i][x];
                if(aux == '1' || aux == 'yes'){
                    resp[j][x] = true;
                } else if(aux == '0' || aux == 'no'){
                    resp[j][x] = false;
                }
            //No caso geral, colocamos o nome do campo como o valor do campo no objeto lido
            } else{
                resp[j][x] = jsonObj[i][x];
            }
        }
    }
    //console.log(resp); //Objeto formatado
    //Transformando o objeto json formatado para string para salvá-lo:
    let output_data = JSON.stringify(resp);
    //console.log(resp); //Objeto formatado em forma de string
    //Salvando o arquivo .json resultante:
    fs.writeFileSync('formatted_output' + fileNumber + '.json', output_data);
})
 