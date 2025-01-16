import fs from 'fs';

export default function updateCredits(customerId) {
//    const currentCreditsJSON = await fs.promises.readFile(`./customers/${customerId}/customer-data.json`, 'utf8');
  //  const currentCredits = JSON.parse(currentCreditsJSON).configSettings.credits;
   // const newCredits = currentCredits - 1;
    const filePath = `./customers/${customerId}/customer-data.json`;

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading customer data:', err);
            return;
        }
    
        try {
            const jsonData = JSON.parse(data);
            const currentCredits = jsonData.configSettings.credits;
            const newCredits = currentCredits - 1;
            jsonData.configSettings.credits = newCredits; // Neuen Wert für credits setzen
    
            fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), (err) => {
                if (err) {
                    console.error('Error writing customer data:', err);
                } else {
                    console.log('Credits updated successfully.', newCredits);
                }
            });
        } catch (parseError) {
            console.error('Error parsing customer data:', parseError);
        }
    });
} 