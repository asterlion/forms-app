import API_URL from '../config';

const getSalesforceToken = async () => {
    try {
        const response = await fetch(`${API_URL}/api/salesforce-token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
            throw new Error("Ошибка при получении токена от сервера");
        }

        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error("Ошибка получения токена:", error.message);
        return null;
    }
};

export const createSalesforceAccount = async (username, email) => {
    try {
        const response = await fetch(`${API_URL}/api/salesforce/account`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, email }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Ошибка при создании аккаунта в Salesforce: ${errorData.error}`);
        }

        const data = await response.json();
        console.log("Аккаунт успешно создан в Salesforce", data);
        return data;
    } catch (error) {
        console.error("Ошибка интеграции с Salesforce:", error.message);
        throw error;
    }
};
