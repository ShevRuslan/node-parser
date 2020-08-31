import axios from 'axios';

class Api {
  //Запрос на апи
  getResource = async (url, data, method, headers = {}) => {
    let response = null;
    try {
      response = await axios({
        url:`api/${url}`,
        method: method,
        body: data,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      });
    }
    catch  {
      return response.error = "Возникла ошибка, попробуйте позже";
    }

    return response.data;
  };
  //Функция для создание get-параметром
  createGetParams = (data) => {
    let params = '';
    for (const param in data) {
      let stringParam =`${param}=${data[param]}`;
      stringParam += '&';
      params += stringParam;
    }
    return params;
  }
  //Получение чемпионатов из линии
  getWeapon = async () => {
    let url = 'getWeapon'
    const response = await this.getResource(url, null, 'GET');
    return response;
  }

}
export default new Api();