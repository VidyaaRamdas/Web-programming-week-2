document.addEventListener("DOMContentLoaded", initializeCode);

async function initializeCode() {
    console.log("Document is ready!");
    try {
        const { municipalities, valuesData } = await fetchMunicipalities();
        const employmentData = await fetchEmploymentData();
        
        if (valuesData.length !== employmentData.length) {
            console.error("Data length mismatch between values and employment data.");
            return;
        }

        displayData(municipalities, valuesData, employmentData);
    } catch (error) {
        console.error("ERROR: ", error);
    }
}

async function fetchMunicipalities() {
    try {
        const response = await fetch("https://statfin.stat.fi/PxWeb/sq/4e244893-7761-4c4f-8e55-7a8d41d86eff");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return {
            municipalities: Object.values(data.dataset.dimension.Alue.category.label),
            valuesData: data.dataset.value,
        };
    } catch (error) {
        console.error("Fetch error in fetchMunicipalities: ", error);
        return { municipalities: [], valuesData: [] }; // Return empty data on error
    }
}

async function fetchEmploymentData() {
    try {
        const response = await fetch("https://statfin.stat.fi/PxWeb/sq/5e288b40-f8c8-4f1e-b3b0-61b86ce5c065");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.dataset.value;
    } catch (error) {
        console.error("Fetch error in fetchEmploymentData: ", error);
        return []; // Return empty data on error
    }
}

function displayData(municipalities, valuesData, employmentData) {
    const tbody = document.getElementById("fetched-data");

    municipalities.forEach((municipality, index) => {
        const values = valuesData[index];
        const employment = employmentData[index];

        if (values === 0) { // Avoid division by zero
            console.warn(`Values for ${municipality} are zero, skipping...`);
            return;
        }

        const employmentPercentage = ((employment / values) * 100).toFixed(2);

        const row = createTableRow(municipality, values, employment, employmentPercentage);
        tbody.appendChild(row);
    });
}

function createTableRow(municipality, values, employment, employmentPercentage) {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${municipality}</td>
        <td>${values}</td>
        <td>${employment}</td>
        <td>${employmentPercentage}</td>
    `;

    if (employmentPercentage > 45) {
        row.style.backgroundColor = "#abffbd"; // Light green
    } else if (employmentPercentage < 25) {
        row.style.backgroundColor = "#ff9e9e"; // Light red
    }

    return row;
}
