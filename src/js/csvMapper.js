
// DOM Elements
const fileUploadArea = document.getElementById('fileUploadArea');
const csvFileInput = document.getElementById('csvFile');
const fileStatus = document.getElementById('fileStatus');
const csvPreview = document.getElementById('csvPreview');
const mapCsvPreview = document.getElementById('mapCsvPreview');
const templateSearch = document.getElementById('templateSearch');
const templateSearchDiv = document.getElementById('templateSearchDiv');
const templateOptions = document.getElementById('templateOptions');
// const selectedTemplate = document.getElementById('selectedTemplate');
const mappingTableBody = document.getElementById('mappingTableBody');
const generateButton = document.getElementById('generateButton');
const addMappingButton = document.getElementById('addMappingButton');
// const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');

// State variables
let mappingConfig = {
    firstname: { columnName: "", delimiter: "", position: 0 },
    lastname: { columnName: "", delimiter: "", position: 0 },
    memberid: { columnName: "", delimiter: "", position: 0 },
    gender: { columnName: "", delimiter: "", position: 0 },
    dob: { columnName: "", delimiter: "", position: 0 },
    pickuptime: { columnName: "", delimiter: "", position: 0 },
    dropofftime: { columnName: "", delimiter: "", position: 0 },
    tollsamt: { columnName: "", delimiter: "", position: 0 },
    congestionfee: { columnName: "", delimiter: "", position: 0 },
    mileage: { columnName: "", delimiter: "", position: 0 },
    servicetype: { columnName: "", delimiter: "", position: 0 },
    authorization: { columnName: "", delimiter: "", position: 0 },
    puaddress: { columnName: "", delimiter: "", position: 0 },
    pucity: { columnName: "", delimiter: "", position: 0 },
    pustate: { columnName: "", delimiter: "", position: 0 },
    pickupzip: { columnName: "", delimiter: "", position: 0 },
    doaddress: { columnName: "", delimiter: "", position: 0 },
    docity: { columnName: "", delimiter: "", position: 0 },
    dostate: { columnName: "", delimiter: "", position: 0 },
    dropoffzip: { columnName: "", delimiter: "", position: 0 },
};

let filename = '';
let savedConfigurations = [];
let isProcessing = false;
let availableColumns = [];
let availableColumnsObject = {};
let previewRows = [];
let csvData = null;
let csvHeaders = [];
let currentTemplate = null;
// let templateFields = {
//     customer: ['Customer ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Address'],
//     product: ['Product ID', 'Product Name', 'Category', 'Price', 'Stock', 'Description'],
//     inventory: ['Item ID', 'Item Name', 'Quantity', 'Location', 'Last Updated', 'Status'],
//     sales: ['Order ID', 'Customer', 'Product', 'Quantity', 'Price', 'Date'],
//     employee: ['Employee ID', 'Name', 'Department', 'Position', 'Hire Date', 'Salary']
// };
// Default template for auto-mapping
const defaultTemplate = {
    firstname: { columnNames: [], delimiter: "", position: 0 },
    lastname: { columnNames: [], delimiter: "", position: 0 },
    memberid: { columnNames: [], delimiter: "", position: 0 },
    gender: { columnNames: [], delimiter: "", position: 0 },
    dob: { columnNames: [], delimiter: "", position: 0 },
    pickuptime: { columnNames: [], delimiter: "", position: 0 },
    dropofftime: { columnNames: [], delimiter: "", position: 0 },
    tollsamt: { columnNames: [], delimiter: "", position: 0 },
    congestionfee: { columnNames: [], delimiter: "", position: 0 },
    mileage: { columnNames: [], delimiter: "", position: 0 },
    servicetype: { columnNames: [], delimiter: "", position: 0 },
    authorization: { columnNames: [], delimiter: "", position: 0 },
    puaddress: { columnNames: [], delimiter: "", position: 0 },
    pucity: { columnNames: [], delimiter: "", position: 0 },
    pustate: { columnNames: [], delimiter: "", position: 0 },
    pickupzip: { columnNames: [], delimiter: "", position: 0 },
    doaddress: { columnNames: [], delimiter: "", position: 0 },
    docity: { columnNames: [], delimiter: "", position: 0 },
    dostate: { columnNames: [], delimiter: "", position: 0 },
    dropoffzip: { columnNames: [], delimiter: "", position: 0 },
};

// File Upload Handling
fileUploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    fileUploadArea.style.borderColor = '#4299e1';
    fileUploadArea.style.backgroundColor = '#e6f7ff';
});

fileUploadArea.addEventListener('dragleave', () => {
    fileUploadArea.style.borderColor = '#cbd5e0';
    fileUploadArea.style.backgroundColor = '#ebf8ff';
});

fileUploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    fileUploadArea.style.borderColor = '#cbd5e0';
    fileUploadArea.style.backgroundColor = '#ebf8ff';

    if (e.dataTransfer.files.length) {
        csvFileInput.files = e.dataTransfer.files;
        handleFileUpload();
    }
});

csvFileInput.addEventListener('change', handleFileUpload);

function handleFileUpload() {
    const file = csvFileInput.files[0];

    if (file && file.type === 'text/csv') {
        filename = file.name;
        fileStatus.textContent = `File selected: ${file.name}`;
        // templateSearchDiv.style.marginTop = '-635px';

        const reader = new FileReader();
        reader.onload = function (e) {
            processCSV(e.target.result);
        };
        reader.readAsText(file);
    } else {
        filename = '';
        // templateSearchDiv.style.marginTop = '-390px';
        fileStatus.textContent = 'Please select a valid CSV file.';
        csvPreview.innerHTML = '<p>CSV preview will appear here after uploading a file.</p>';
        mapCsvPreview.innerHTML = '<p>Mapped Data Preview (First 2 Rows) will appear here after configuring the mapping.</p>';
        csvData = null;
        csvHeaders = [];
        updateGenerateButtonState();
    }
}

function processCSV(csvText) {
    try {
        isProcessing = true;
        // Simple CSV parsing
        const rows = csvText.split("\n").filter(row => row.trim());
        const headers = rows[0].split(",").map(header => header.trim());
        availableColumns = headers;

        const headersObject = {};
        headers.forEach((header, index) => {
            headersObject[header] = index + 1;
        });
        availableColumnsObject = headersObject;


        const dataRows = rows.slice(1).map(row =>
            row.split(",").map(cell => cell.trim())
        );

        // preview rows (first 2 data rows)
        previewRows = dataRows.slice(0, 2);
        csvData = { headers, headersObject, rows: dataRows };

        // for (let i = 1; i < lines.length; i++) {
        //     if (lines[i].trim() === '') continue;

        //     // Handle commas in quoted fields
        //     let row = [];
        //     let inQuotes = false;
        //     let currentField = '';

        //     for (let j = 0; j < lines[i].length; j++) {
        //         const char = lines[i][j];

        //         if (char === '"') {
        //             inQuotes = !inQuotes;
        //         } else if (char === ',' && !inQuotes) {
        //             row.push(currentField.trim().replace(/"/g, ''));
        //             currentField = '';
        //         } else {
        //             currentField += char;
        //         }
        //     }

        //     row.push(currentField.trim().replace(/"/g, ''));

        //     if (row.length === headers.length) {
        //         const rowObj = {};
        //         headers.forEach((header, index) => {
        //             rowObj[header] = row[index];
        //         });
        //         csvData.push(rowObj);
        //     }
        // }
        // Check if there's a matching saved configuration
        const headerSignature = headers.sort().join(',');
        const matchingConfig = savedConfigurations.find(config => config.headerSignature === headerSignature);

        if (matchingConfig) {
            mappingConfig = matchingConfig.mapping;
            templateSearch.value = matchingConfig.name;
            // alert(`Configuration "${matchingConfig.name}" automatically applied`, "success");
        } else {
            // Try auto-mapping based on the default template
            // Try auto-mapping based on the default template
            const initialMapping = { ...mappingConfig };
            Object.keys(initialMapping).forEach(field => {
                const fieldTemplate = defaultTemplate[field];

                // Look for column name matches
                const columnName = fieldTemplate.columnNames.find(name => headersObject[name]);

                if (columnName) {
                    initialMapping[field] = {
                        columnName: columnName || '',
                        delimiter: "",
                        position: 0
                    };
                }
            });

            mappingConfig = initialMapping;
        }
        displayCSVPreview();
        updateFieldMappings();
        updateGenerateButtonState();
        displayMapCSVPreview();
        isProcessing = false;
    } catch (error) {
        alert("Error processing CSV file. Please check the format.", error.message);
        isProcessing = false;
        console.error('error: ', error);
    }

}

function displayCSVPreview() {
    if (!previewRows || !previewRows.length || !csvData || !csvData.headers || !csvData.headers.length) {
        csvPreview.innerHTML = '<p>No valid data found in the CSV file.</p>';
        return;
    }

    let tableHTML = '<p>Original Data (First 2 Rows)</p><table><thead><tr>';
    const uploadCsvHeaders = Object.keys(csvData.headersObject);
    uploadCsvHeaders.forEach(header => {
        tableHTML += `<th>${header}</th>`;
    });
    tableHTML += '</tr></thead><tbody>';

    // Show first 2 rows only for preview
    previewRows.forEach(row => {
        tableHTML += '<tr>';
        uploadCsvHeaders.forEach(header => {
            tableHTML += `<td>${row[csvData.headersObject[header] - 1] || ''}</td>`;
        });
        tableHTML += '</tr>';
    });

    tableHTML += '</tbody></table>';
    csvPreview.innerHTML = tableHTML;
}

function displayMapCSVPreview() {
    if (!previewRows || !previewRows.length || !csvData || !csvData.headers || !csvData.headers.length || !hasValidMappings()) {
        mapCsvPreview.innerHTML = '<p>Mapped Data Preview (First 2 Rows) will appear here after configuring the mapping.</p>';
        return;
    }
    try {
        errorMessage.style.display = 'none';

        const mappedData = [];

        // Create headers row
        // const fields = templateFields[currentTemplate];
        const fields = Object.keys(mappingConfig);
        let tableHTML = '<p>Mapped Data (First 2 Rows)</p><table><thead><tr>';
        fields.forEach(header => {
            tableHTML += `<th>${header.replace(/_/g, ' ')}</th>`;
        });
        tableHTML += '</tr></thead><tbody>';

        // Show first 2 rows only for preview
        previewRows.forEach(previewRow => {
            tableHTML += '<tr>';
            fields.forEach(field => {
                const fieldConfig = mappingConfig[field];
                const columnIndex = csvData.headersObject[fieldConfig.columnName];
                let value = previewRow[columnIndex - 1] || '';

                // Apply delimiter and position if provided
                const parts = value.split(fieldConfig.delimiter || null);
                const position = parseInt(fieldConfig.position) || 0;
                value = parts.length > position ? parts[position].trim() : '';
                tableHTML += `<td>${value || ''}</td>`;
            });
            // Process each field mapping
            // const rows = mappingTableBody.querySelectorAll('tr');
            // rows.forEach((row, index) => {
            //     const sourceSelect = row.querySelector('.search-input-mapping');
            //     const delimiter = row.querySelector('.delimiter-input').value;
            //     const positionIndex = parseInt(row.querySelector('.position-input').value) || 0;
            //     let columnIndex = csvData.headersObject[sourceSelect.value.trim()];
            //     let sourceValue = previewRow[columnIndex-1] || '';

            //     // Apply delimiter and position if provided
            //     const parts = sourceValue.split(delimiter || null);
            //     const position = parseInt(positionIndex) || 0;
            //     sourceValue = parts.length > position ? parts[position].trim() : parts[0].trim();
            //     tableHTML += `<td>${sourceValue || ''}</td>`;
            // });
            tableHTML += '</tr>';
        });
        tableHTML += '</tbody></table>';
        mapCsvPreview.innerHTML = tableHTML;
    } catch (error) {
        errorMessage.textContent = `An error occurred: ${error.message}`;
        errorMessage.style.display = 'block';
        alert(`An error occurred: ${error.message}`);
        console.error('error: ', error);
    }
}

// Template Selection
templateSearch.addEventListener('focus', () => {

    // templateSearch.placeholder = 'Please input template name';
    if (templateSearch.placeholder === 'Please input template name') {
        templateSearch.placeholder = '';
    } else templateOptions.style.display = 'block';
});

templateSearch.addEventListener('input', () => {
    templateSearch.placeholder = 'Search for a template...';
    const searchValue = templateSearch.value.toLowerCase();
    const items = templateOptions.querySelectorAll('.dropdown-item');

    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(searchValue) ? 'block' : 'none';
    });

    templateOptions.style.display = 'block';
});

document.addEventListener('click', (e) => {
    if (!templateSearch.contains(e.target) && !templateOptions.contains(e.target)) {
        templateOptions.style.display = 'none';
    }
});

templateOptions.addEventListener('click', (e) => {
    if (e.target.classList.contains('dropdown-item')) {
        const value = parseInt(e.target.getAttribute('data-value'));
        // currentTemplate = value;
        // selectedTemplate.textContent = `Selected template: ${e.target.textContent}`;
        templateSearch.value = e.target.textContent;
        // templateSearch.placeholder = e.target.textContent;
        templateOptions.style.display = 'none';
        mappingConfig = (savedConfigurations[value] || {}).mapping;
        updateFieldMappings();
        updateGenerateButtonState();
        displayMapCSVPreview();
    }
});

// Field Mapping
function updateFieldMappings(newRow = false) {
    if (!csvData || !csvData.rows || !csvData.rows.length) {
        mappingTableBody.innerHTML = '<tr><td colspan="5">No valid data found in the CSV file.</td></tr>';
        return;
    }

    mappingTableBody.innerHTML = '';
    const fields = Object.keys(mappingConfig);
    // const fields = templateFields[currentTemplate];

    fields.forEach(field => {
        addNewRow(field);
    });
}

function addNewRow(field, firstRow = false) {
    const fieldConfig = mappingConfig[field];

    // if (fieldConfig.columnName) {
    //     const columnIndex = csvData.headersObject[fieldConfig.columnName];
    //     if (columnIndex) {
    //     let columnValue = row[columnIndex - 1];

    //     // Apply delimiter and position if provided
    //     const parts = value.split(fieldConfig.delimiter || null);
    //     const position = parseInt(fieldConfig.position) || 0;
    //     value = parts.length > position ? parts[position] : parts[0];
    //     mappedRow[field] = value;
    //     }
    // }


    const row = document.createElement('tr');

    // Target Field
    const targetCell = document.createElement('td');
    targetCell.textContent = field.replace(/_/g, ' ');
    row.appendChild(targetCell);

    // Source Column
    const sourceCell = document.createElement('td');
    const sourceSelectDiv = document.createElement('div');
    // const sourceSelect = document.createElement('select');
    // sourceSelect.classList.add('source-select');
    // sourceSelect.setAttribute('data-field', field);
    sourceSelectDiv.classList.add('search-container-mapping');
    sourceSelectDiv.setAttribute('data-field', field);
    const sourceSelectInput = document.createElement('input');
    sourceSelectInput.type = 'text';
    sourceSelectInput.classList.add('search-input-mapping');
    sourceSelectInput.placeholder = 'Search for a column...';
    sourceSelectInput.value = fieldConfig.columnName;
    sourceSelectDiv.appendChild(sourceSelectInput);

    const sourceSelectDivDropdown = document.createElement('div');
    sourceSelectDivDropdown.classList.add('searchable-dropdown');
    sourceSelectDiv.appendChild(sourceSelectDivDropdown);

    const sourceSelectDivDropdownContent = document.createElement('div');
    sourceSelectDivDropdownContent.classList.add('dropdown-content');
    sourceSelectDivDropdownContent.style.width = '200px';
    sourceSelectDivDropdown.appendChild(sourceSelectDivDropdownContent);

    // const defaultOption = document.createElement('option');
    // defaultOption.value = '';
    // defaultOption.textContent = '-- Select Source --';
    // sourceSelect.appendChild(defaultOption);

    csvData.headers.forEach(header => {
        const option = document.createElement('div');
        option.classList.add('dropdown-item');
        option.setAttribute('data-value', header);
        option.textContent = header;
        sourceSelectDivDropdownContent.appendChild(option);

        // const option = document.createElement('option');
        // option.value = header;
        // option.textContent = header;
        // sourceSelect.appendChild(option);
    });

    // sourceSelect.addEventListener('change', () => {
    //     updatePreview(row);
    //     updateGenerateButtonState();
    // });
    // Template Selection
    sourceSelectInput.addEventListener('focus', () => {
        sourceSelectDivDropdownContent.style.display = 'block';
    });

    sourceSelectInput.addEventListener('input', () => {
        const searchValue = sourceSelectInput.value.toLowerCase().trim();
        const items = sourceSelectDivDropdownContent.querySelectorAll('.dropdown-item');

        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(searchValue) ? 'block' : 'none';
        });

        sourceSelectDivDropdownContent.style.display = 'block';
        if (!searchValue) {
            fieldConfig.columnName = searchValue;
            updatePreview(row, field);
            updateGenerateButtonState();
        }
    });

    document.addEventListener('click', (e) => {
        if (!sourceSelectInput.contains(e.target) && !sourceSelectDivDropdownContent.contains(e.target)) {
            sourceSelectDivDropdownContent.style.display = 'none';
        }
    });

    sourceSelectDivDropdownContent.addEventListener('click', (e) => {
        if (e.target.classList.contains('dropdown-item')) {
            // selectedTemplate.textContent = `Selected template: ${e.target.textContent}`;
            sourceSelectInput.value = e.target.textContent;
            fieldConfig.columnName = sourceSelectInput.value;
            // sourceSelectInput.placeholder = e.target.textContent;
            sourceSelectDivDropdownContent.style.display = 'none';
            updatePreview(row, field);
            updateGenerateButtonState();
        }
    });

    sourceCell.appendChild(sourceSelectDiv);
    row.appendChild(sourceCell);

    // Delimiter
    const delimiterCell = document.createElement('td');
    const delimiterInput = document.createElement('input');
    delimiterInput.type = 'text';
    delimiterInput.classList.add('delimiter-input');
    delimiterInput.placeholder = 'e.g. ,';
    delimiterInput.value = fieldConfig.delimiter;
    delimiterInput.addEventListener('input', () => {
        fieldConfig.delimiter = delimiterInput.value;
        updatePreview(row, field);
    });
    delimiterCell.appendChild(delimiterInput);
    row.appendChild(delimiterCell);

    // Position Index
    const positionCell = document.createElement('td');
    const positionInput = document.createElement('input');
    positionInput.type = 'number';
    positionInput.min = '0';
    positionInput.value = fieldConfig.position;
    positionInput.classList.add('position-input');
    positionInput.addEventListener('input', () => {
        fieldConfig.position = parseInt(positionInput.value);
        updatePreview(row, field);
    });
    positionCell.appendChild(positionInput);
    row.appendChild(positionCell);

    // Preview
    const previewCell = document.createElement('td');
    previewCell.classList.add('preview-value');
    previewCell.textContent = 'No preview available';
    row.appendChild(previewCell);

    if (firstRow) mappingTableBody.prepend(row);
    else mappingTableBody.appendChild(row);
    updatePreview(row, field);
}

function updatePreview(row, mapFieldKey) {
    if (!csvData || !csvData.rows || !csvData.rows.length) return;
    displayMapCSVPreview();
    const sourceSelectInputValue = row.querySelector('.search-input-mapping').value;
    const delimiter = row.querySelector('.delimiter-input').value;
    const positionIndex = parseInt(row.querySelector('.position-input').value) || 0;
    const previewCell = row.querySelector('.preview-value');

    if (!sourceSelectInputValue) {
        previewCell.textContent = 'No source selected';
        return;
    }

    // Get first row for preview
    const firstRow = csvData.rows[0];
    const columnIndex = csvData.headersObject[sourceSelectInputValue];
    if (!columnIndex) {
        previewCell.textContent = 'Invalid source value';
        return;
    }
    let sourceValue = firstRow[columnIndex - 1] || '';

    if (!sourceValue) {
        previewCell.textContent = 'No data available';
        return;
    }

    // Apply delimiter and position if provided
    const parts = sourceValue.split(delimiter || null);
    const position = parseInt(positionIndex) || 0;
    sourceValue = parts.length > position ? parts[position].trim() : "";
    previewCell.textContent = sourceValue;
    // if (delimiter) {
    //     const parts = sourceValue.split(delimiter);
    //     if (positionIndex >= 0 && positionIndex < parts.length) {
    //         previewCell.textContent = parts[positionIndex].trim();
    //     } else {
    //         previewCell.textContent = `Invalid position (max: ${parts.length - 1})`;
    //     }
    // } else {
    //     previewCell.textContent = sourceValue;
    // }
}

// Generate Mapped CSV
generateButton.addEventListener('click', generateMappedCSV);

function updateGenerateButtonState() {
    const hasCSV = csvData && csvData.rows && csvData.rows.length;
    const hasMapping = hasValidMappings();
    addMappingButton.disabled = !hasCSV;
    showPopupButton.disabled = !hasCSV;
    generateButton.disabled = !(hasCSV && hasMapping);
}

function hasValidMappings() {
    const items = document.querySelectorAll('.search-input-mapping');
    let hasAtLeastOneMapping = false;
    items.forEach(item => {
        if (item.value.trim()) {
            hasAtLeastOneMapping = true;
        }
    });

    return hasAtLeastOneMapping;
}

function generateMappedCSV() {
    if (!csvData || !csvData.rows || !csvData.rows.length) {
        alert("Please upload a CSV file first", "error");
        return;
    }
    if (!templateSearch.value.trim()) {
        templateSearch.focus();
        templateSearch.placeholder = 'Please input template name';
        alert("Please provide a name for this template", "error");
        return;
    }
    try {
        errorMessage.style.display = 'none';

        // const mappedData = [];

        // Create headers row
        // const fields = Object.keys(mappingConfig);

        // Process each CSV row
        // csvData.rows.forEach(csvRow => {
        //     const mappedRow = {};

        //     // Process each field mapping
        //     const rows = mappingTableBody.querySelectorAll('tr');
        //     rows.forEach((row, index) => {
        //         const field = fields[index];
        //         const sourceSelectInputValue = row.querySelector('.search-input-mapping').value || '';
        //         const delimiter = row.querySelector('.delimiter-input').value;
        //         const positionIndex = parseInt(row.querySelector('.position-input').value) || 0;

        //         let columnIndex = csvData.headersObject[sourceSelectInputValue.trim()];
        //         let sourceValue = csvRow[columnIndex-1] || '';

        //         // Apply delimiter and position if provided
        //         const parts = sourceValue.split(delimiter || null);
        //         const position = parseInt(positionIndex) || 0;
        //         sourceValue = parts.length > position ? parts[position].trim() : parts[0].trim();
        //         mappedRow[field] = sourceValue;
        //     });

        //     mappedData.push(mappedRow);
        // });

        // Create CSV string
        // let csvContent = fields.join(',') + '\n';

        // mappedData.forEach(row => {
        //     const rowValues = fields.map(field => {
        //         let value = row[field] || '';
        //         // Escape quotes and wrap in quotes if needed
        //         if (value.includes('"') || value.includes(',')) {
        //             value = '"' + value.replace(/"/g, '""') + '"';
        //         }
        //         return value;
        //     });
        //     csvContent += rowValues.join(',') + '\n';
        // });

        const { headersObject, rows } = csvData;
        const dataRows = rows.map(row => {
            const dataRow = [];

            Object.keys(mappingConfig).forEach(field => {
                const fieldConfig = mappingConfig[field];
                const columnIndex = headersObject[fieldConfig.columnName];
                let value = row[columnIndex - 1] || '';

                // Apply delimiter and position if provided
                const parts = value.split(fieldConfig.delimiter || null);
                const position = parseInt(fieldConfig.position) || 0;
                value = parts.length > position ? parts[position].trim() : '';
                dataRow.push(value);

                // if (fieldConfig.columnName) {
                // const columnIndex = headersObject[fieldConfig.columnName];
                // if (columnIndex) {
                //     let value = row[columnIndex - 1];

                //     // Apply delimiter and position if provided
                //     const parts = value.split(fieldConfig.delimiter || null);
                //     const position = parseInt(fieldConfig.position) || 0;
                //     value = parts.length > position ? parts[position] : parts[0];
                //     dataRow.push(value);
                // } else {
                //     dataRow.push('');
                // }
                // } else {
                // dataRow.push('');
                // }
            });
            return dataRow.join(",");
        });

        // Convert to CSV format
        const csvString = [
            Object.keys(mappingConfig).join(","),
            ...dataRows,
        ].join("\n");

        // Create download link
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mapped_${filename}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // successMessage.style.display = 'block';
        // setTimeout(() => {
        //     successMessage.style.display = 'none';
        // }, 5000);
        updateConfig();

    } catch (error) {
        errorMessage.textContent = `An error occurred: ${error.message}`;
        errorMessage.style.display = 'block';
        alert(`An error occurred: ${error.message}`);
        console.error('error: ', error);
    }
}
function updateConfig() {
    // Create a unique signature for this CSV structure based on headers
    const headerSignature = availableColumns.sort().join(',');
    // Check if configuration with this name already exists
    const existingConfigIndex = savedConfigurations.findIndex(
        config => config.name === templateSearch.value.trim()
    );

    const newConfig = {
        name: templateSearch.value.trim(),
        mapping: mappingConfig,
        headerSignature,
        createdAt: new Date().toISOString()
    };

    let updatedConfigs;

    if (existingConfigIndex >= 0) {
        // Update existing configuration
        updatedConfigs = [...savedConfigurations];
        updatedConfigs[existingConfigIndex] = newConfig;
        // alert(`Configuration "${templateSearch.value}" updated successfully`);
    } else {
        // Add new configuration
        updatedConfigs = [...savedConfigurations, newConfig];
        // alert(`Configuration "${templateSearch.value}" saved successfully`);
    }

    savedConfigurations = updatedConfigs;
    localStorage.setItem('csvMappingConfigurations', JSON.stringify(updatedConfigs));
}

window.addEventListener("load", () => {
    try {
        const savedConfigs = localStorage.getItem('csvMappingConfigurations');
        if (savedConfigs) {
            savedConfigurations = JSON.parse(savedConfigs);
            savedConfigurations && savedConfigurations.forEach((config, index) => {
                const configSelectDiv = document.createElement('div');
                configSelectDiv.classList.add('dropdown-item');
                configSelectDiv.setAttribute('data-value', index);
                configSelectDiv.textContent = config.name;
                templateOptions.appendChild(configSelectDiv);
            });
        }
    } catch (err) {
        alert(`An error occurred: ${err.message}`);
        console.error('error: ', err);
    }
});

const showPopupButton = document.getElementById('showPopupButton');
const popupContainer = document.getElementById('myPopup');
const popupInput = document.getElementById('popupInput');

showPopupButton.addEventListener('click', () => {
    popupContainer.style.display = 'flex';
    popupInput.focus();
});

addMappingButton.addEventListener('click', () => {
    popupContainer.style.display = 'none';
    const fieldName = popupInput.value;
    mappingConfig[fieldName] = { columnName: "", delimiter: "", position: 0 };
    defaultTemplate[fieldName] = { columnNames: [], delimiter: "", position: 0 };
    addNewRow(fieldName, true);
    popupInput.value = ""; //reset the input field after closing.
});

window.addEventListener('click', (event) => {
    if (event.target === popupContainer) {
        popupContainer.style.display = 'none';
        popupInput.value = "";
    }
});