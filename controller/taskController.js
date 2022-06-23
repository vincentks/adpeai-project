const axios = require('axios');
const data = require('./data');

axios.interceptors.request.use(config => {
    if (config?.method?.toUpperCase() === 'POST') {
        config.headers['Content-Type'] = 'application/json;charset=utf-8';
    }
    return config;
});

class TaskController {
    async getTopEarner(year) {
        let result = undefined;

        try {
            const employees = new Map();
            result = await axios.get('https://interview.adpeai.com/api/v2/get-task')
            result.data = data;
    
            if (result?.data?.transactions?.length) {
                /**
                 * 1) Filter the data using year 
                 * 2) Find total sum for each employee
                 * 3) Store employee id and total sum in map object
                 */
                result?.data?.transactions?.filter((trans) => new Date(trans?.timeStamp).getFullYear().toString() === year?.toString())
                .forEach((trans) => {
                    if (!employees.has(trans?.employee?.id)) {
                        employees.set(trans?.employee?.id, 0);
                    } 
                    employees.set(trans?.employee?.id, Number(employees.get(trans?.employee?.id)) + Number(trans?.amount));
                });;
    
                let maxSum = -1;
                let id = '';
    
                /**
                 * Find the employee with highest sum total
                 */
                for (let [key, value] of employees.entries()) {
                    if (value > maxSum) {
                        maxSum = value;
                        id = key;
                    }
                }
    
                /**
                 * 1) Filter transactions using employee id having highest sum total and type alpha
                 * 2) Return the final result to client
                 */
                result.data.transactions = result?.data?.transactions?.filter((trans) => trans?.employee?.id?.toLowerCase() === id.toLowerCase() && trans?.type?.toLowerCase() === 'alpha');
            }
        } catch (error) {
            console.log(`Server error. Request: ${JSON.stringify(year)} Response: ${JSON.stringify(error)}`);
            return Promise.reject({message: 'Internal Server Error'});
        }
        
        return Promise.resolve(result?.data);
    }

    async postSubmitTask(requestBody) {
        let result = undefined;

        try {
            result = await axios.post('https://interview.adpeai.com/api/v2/submit-task', JSON.stringify(requestBody));
        } catch (error) {
            console.log(`Server error. Request: ${JSON.stringify(requestBody)} Response: ${JSON.stringify(error)}`);
            return Promise.reject({message: 'Internal Server Error'});
        }

        return Promise.resolve({message: result?.data, status: 200});
    }
}

module.exports = TaskController;
