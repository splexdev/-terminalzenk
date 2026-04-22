function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function credilinkFormatter(json) {
    return `
CPF: ${json.CPF}
NOME: ${json.NOME}
ENDEREÇO: ${json.TIPO_ENDERECO} ${json.LOGRADOURO}${json.NUMERO ? `, ${json.NUMERO}` : ''} ${json.COMPLEMENTO}
BAIRRO: ${json.BAIRRO || 'N/A'}
CIDADE: ${json.CIDADE || 'N/A'}, ${json.UF || 'N/A'}
CEP: ${json.CEP || 'N/A'}
DATA DE NASCIMENTO: ${json.DT_NASCIMENTO || 'N/A'}
MÃE: ${json.NOME_MAE || 'N/A'}
EMAIL: ${json.EMAIL || 'N/A'}
STATUS DA RECEITA FEDERAL: ${json.STATUS_RECEITA_FEDERAL || 'N/A'}
    `
}


function serasaFormatter(json, module) {

    switch (module) {
        case "cpf": {
            return `
CPF: ${json.CPF || 'N/A'}
NOME: ${json.NOME || 'N/A'}
SEXO: ${json.SEXO === "M" ? "MASCULINO" : "FEMININO" || 'N/A'}
NASCIMENTO: ${formatDate(json.NASC) || 'N/A'}
MÃE: ${json.NOME_MAE || 'N/A'}
PAI: ${json.NOME_PAI || 'N/A'}
ESTADO CIVIL: ${json.ESTCIV === "C" ? "CASADO" : json.ESTCIV === "S" ? "SOLTEIRO" : json.ESTCIV === "D" ? "DIVORCIADO" : json.ESTCIV === "V" ? "VIÚVO" : 'N/A'}
RG: ${json.RG || 'N/A'}
NACIONALIDADE: ${json.NACIONALID || 'N/A'}
SEXO OPOSTO: ${json.SO === "False" ? "Não" : "Sim" || 'N/A'}
SITUAÇÃO CADASTRO: ${json.CD_SIT_CAD || 'N/A'}
DATA SITUAÇÃO: ${formatDate(json.DT_SIT_CAD) || 'N/A'}
DATA INFORMAÇÃO: ${formatDate(json.DT_INFORMACAO) || 'N/A'}
CBO: ${json.CBO || 'N/A'}
ÓRGÃO EMISSOR: ${json.ORGAO_EMISSOR || 'N/A'}
UF EMISSÃO: ${json.UF_EMISSAO || 'N/A'}
MOSAIC: ${json.CD_MOSAIC || 'N/A'}
RENDA: ${json.RENDA || 'N/A'}
FAIXA RENDA: ${json.FAIXA_RENDA_ID || 'N/A'}
TÍTULO ELEITOR: ${json.TITULO_ELEITOR || 'N/A'}
MOSAIC NOVO: ${json.CD_MOSAIC_NOVO || 'N/A'}
MOSAIC SECUNDÁRIO: ${json.CD_MOSAIC_SECUNDARIO || 'N/A'}
PIS: ${json.PIS.PIS || 'N/A'}
PODER AQUISITIVO: ${json.PODER_AQUISITIVO.PODER_AQUISITIVO || 'N/A'}
RENDA PODER AQUISITIVO: ${json.PODER_AQUISITIVO.RENDA_PODER_AQUISITIVO || 'N/A'}
FAIXA PODER AQUISITIVO: ${json.PODER_AQUISITIVO.FX_PODER_AQUISITIVO || 'N/A'}

-------- SCORE --------
${json.SCORE ? `
CSB8: ${json.SCORE.CSB8 || 'N/A'}
CSB8 FAIXA: ${json.SCORE.CSB8_FAIXA || 'N/A'}
CSBA: ${json.SCORE.CSBA || 'N/A'}
CSBA FAIXA: ${json.SCORE.CSBA_FAIXA || 'N/A'}` : 'N/A'}

-------- PARENTES --------
${json.PARENTES ? json.PARENTES.map(parente => `
NOME: ${parente.NOME_VINCULO || 'N/A'}
CPF: ${parente.CPF_VINCULO || 'N/A'}
VÍNCULO: ${parente.VINCULO || 'N/A'}`).join('\n') : 'N/A'}

-------- EMAILS --------
${json.EMAILS ? json.EMAILS.map(email => `
EMAIL: ${email.EMAIL || 'N/A'}
SCORE: ${email.EMAIL_SCORE || 'N/A'}
PESSOAL: ${email.EMAIL_PESSOAL === "S" ? "SIM" : "NÃO" || 'N/A'}
DUPLICADO: ${email.EMAIL_DUPLICADO === "S" ? "SIM" : "NÃO" || 'N/A'}
BLACKLIST: ${email.BLACKLIST === "S" ? "SIM" : "NÃO" || 'N/A'}
ESTRUTURA: ${email.ESTRUTURA || 'N/A'}
STATUS: ${email.STATUS_VT || 'N/A'}
DOMÍNIO: ${email.DOMINIO || 'N/A'}`).join('\n') : 'N/A'}

-------- TELEFONES --------
${json.TELEFONES ? json.TELEFONES.map(telefone => `
(${telefone.DDD}) ${String(telefone.TELEFONE).slice(0, 5)}-${String(telefone.TELEFONE).slice(5)}`).join('\n') : 'N/A'}

-------- ENDEREÇOS --------
${json.ENDERECOS ? json.ENDERECOS.map(endereco => `
TIPO: ${endereco.LOGR_TIPO || 'N/A'}
LOGRADOURO: ${endereco.LOGR_NOME || 'N/A'}${endereco.LOGR_NUMERO ? `, ${endereco.LOGR_NUMERO}` : ''}
COMPLEMENTO: ${endereco.LOGR_COMPLEMENTO || 'N/A'}
BAIRRO: ${endereco.BAIRRO || 'N/A'}
CIDADE: ${endereco.CIDADE || 'N/A'}, ${endereco.UF || 'N/A'}
CEP: ${endereco.CEP || 'N/A'}`).join('\n') : 'N/A'}`
        }

        default: {
            return `
CPF: ${json.CPF || 'N/A'}
NOME: ${json.NOME || 'N/A'}
SEXO: ${json.SEXO === "M" ? "MASCULINO" : "FEMININO" || 'N/A'}
NASCIMENTO: ${formatDate(json.NASC) || 'N/A'}
MÃE: ${json.NOME_MAE || 'N/A'}
PAI: ${json.NOME_PAI || 'N/A'}
ESTADO CIVIL: ${json.ESTCIV === "C" ? "CASADO" : json.ESTCIV === "S" ? "SOLTEIRO" : json.ESTCIV === "D" ? "DIVORCIADO" : json.ESTCIV === "V" ? "VIÚVO" : 'N/A'}
RG: ${json.RG || 'N/A'}
NACIONALIDADE: ${json.NACIONALID || 'N/A'}
SEXO OPOSTO: ${json.SO === "False" ? "NÃO" : "SIM" || 'N/A'}
SITUAÇÃO CADASTRO: ${json.CD_SIT_CAD || 'N/A'}
DATA SITUAÇÃO: ${formatDate(json.DT_SIT_CAD) || 'N/A'}
DATA INFORMAÇÃO: ${formatDate(json.DT_INFORMACAO) || 'N/A'}
CBO: ${json.CBO || 'N/A'}
ÓRGÃO EMISSOR: ${json.ORGAO_EMISSOR || 'N/A'}
UF EMISSÃO: ${json.UF_EMISSAO || 'N/A'}
MOSAIC: ${json.CD_MOSAIC || 'N/A'}
RENDA: ${json.RENDA || 'N/A'}
FAIXA RENDA: ${json.FAIXA_RENDA_ID || 'N/A'}
TÍTULO ELEITOR: ${json.TITULO_ELEITOR || 'N/A'}
MOSAIC NOVO: ${json.CD_MOSAIC_NOVO || 'N/A'}
MOSAIC SECUNDÁRIO: ${json.CD_MOSAIC_SECUNDARIO || 'N/A'}
`
        }
    }
}


function skynetFormatter(json, module) {

    switch (module) {
        case "placa": {
            return `
PLACA: ${json.PLACA || 'N/A'}
SITUAÇÃO: ${json['SITUAÇÃO'] || 'N/A'}
RESTRIÇÃO 1: ${json['RESTRIÇÃO 1'] || 'N/A'}
RESTRIÇÃO 2: ${json['RESTRIÇÃO 2'] || 'N/A'}
RESTRIÇÃO 3: ${json['RESTRIÇÃO 3'] || 'N/A'}
RESTRIÇÃO 4: ${json['RESTRIÇÃO 4'] || 'N/A'}
MARCA/MODELO: ${json['MARCA/MODELO'] || 'N/A'}
COR: ${json.COR || 'N/A'}
ANO FABRICAÇÃO: ${json['ANO - FABRICAÇÃO'] || 'N/A'}
ANO MODELO: ${json['ANO - MODELO'] || 'N/A'}
MUNICÍPIO: ${json.MUNICIPIO || 'N/A'}
ESTADO: ${json.ESTADO || 'N/A'}
CHASSI: ${json.CHASSI || 'N/A'}
RENAVAM: ${json.RENAVAM || 'N/A'}
COMBUSTÍVEL: ${json.COMBUSTIVEL || 'N/A'}
POTÊNCIA: ${json.POTENCIA || 'N/A'}
CILINDRADAS: ${json.CILINDRADAS || 'N/A'}
ORIGEM: ${json.ORIGEM || 'N/A'}
NÚMERO MOTOR: ${json['NÚM. MOTOR'] || 'N/A'}
TIPO VEÍCULO: ${json['TIPO DE VEICULO'] || 'N/A'}
ESPÉCIE: ${json.ESPECIE || 'N/A'}
PASSAGEIROS: ${json['QUANTIDADE DE PASSAGEIROS'] || 'N/A'}
PROPRIETÁRIO: ${json['NOME DO PROPRIETÁRIO'] || 'N/A'}
DOCUMENTO PROPRIETÁRIO: ${json['DOCUMENTO DO PROPRIETÁRIO'] || 'N/A'}
NOME DO POSSUIDOR: ${json['NOME DO POSSUIDOR'] || 'N/A'}
DOCUMENTO POSSUIDOR: ${json['DOCUMENTO DO POSSUIDOR'] || 'N/A'}
EMISSÃO ULTIMO CRV: ${json['EMISSÃO ULTIMO CRV'] || 'N/A'}
ÚLTIMA ATUALIZAÇÃO: ${json['ULTIMA ATUALIZAÇÃO'] || 'N/A'}
            `
        }
    }
}

function susFormatter(json) {
    return `
CPF: ${json.cpf || 'N/A'}
MÃE: ${json.mae || 'N/A'}
PAI: ${json.pai || 'N/A'}
MUNICÍPIO DE NASCIMENTO: ${json.municipioNasci || 'N/A'}
MUNICÍPIO: ${json.enderecoMuni || 'N/A'}
LOGRADOURO: ${json.enderecoLogr || 'N/A'}${json.enderecoNu ? `, ${json.enderecoNu}` : ''}
BAIRRO: ${json.enderecoBa || 'N/A'}
CEP: ${json.enderecoCe || 'N/A'}
RG: ${json.rgNumero || 'N/A'}
ÓRGÃO EMISSOR: ${json.rgOrgaoEmi || 'N/A'}
UF: ${json.rgUf || 'N/A'}
CNS: ${json.cns || 'N/A'}
TELEFONE 1: ${json.telefone || 'N/A'}
TELEFONE 2: ${json.telefone2 || 'N/A'}
TELEFONE 3: ${json.telefone3 || 'N/A'}
    `
}

function fotoFormatter(json, database) {
    switch (database) {
        case "fotosp": {
            return json.foto
        }
    }
}

export function formatter(json, database, module) {

    if (database.includes("foto")) {
        return fotoFormatter(json, database);
    }

    if (database === "datasus") {
        return susFormatter(json);
    }

    if (database === "skynet") {
        return skynetFormatter(json, module);
    }

    if (database === "serasa") {
        switch (module) {
            case "nome": {
                let result = "";
                json.forEach(item => {
                    result += serasaFormatter(item, module) + "\n-----------------------\n";
                });
                return result;
            }
            case "cep": {
                let result = "";
                json.forEach(item => {
                    result += serasaFormatter(item, module) + "\n-----------------------\n";
                });
                return result;
            }
            case "pai": {
                let result = "";
                json.forEach(item => {
                    result += serasaFormatter(item, module) + "\n-----------------------\n";
                });
                return result;
            }
            case "mae": {
                let result = "";
                json.forEach(item => {
                    result += serasaFormatter(item, module) + "\n-----------------------\n";
                });
                return result;
            }
            case "telefone": {
                let result = "";
                json.forEach(item => {
                    result += serasaFormatter(item, module) + "\n-----------------------\n";
                });
                return result;
            }
            default: {
                return serasaFormatter(json, module);
            }
        }
    }

    if (database === "credilink") {
        switch (module) {
            case "nome": {
                let result = "";
                json.forEach(item => {
                    result += credilinkFormatter(item) + "\n-----------------------\n";
                });
                return result;
            }
             case "cep": {
                let result = "";
                json.forEach(item => {
                    result += credilinkFormatter(item) + "\n-----------------------\n";
                });
                return result;
            }
            default: {
                return credilinkFormatter(json);
            }
        }
    }


}