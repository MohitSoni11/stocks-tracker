/****************************************************************/
/************ Account Type based on Selected Account ************/
/****************************************************************/
async function fetchAccountType(account) {
  if (account == '') {
    document.getElementById('type-display').textContent = 'N/A';
    return;
  }

  const response = await fetch(`/fetch/atype?account=${account}`);
  const data = await response.json();

  document.getElementById('type-display').textContent = data.type;
}

function updateAccountType() {
  const account = document.getElementById('buy-account').value;
  fetchAccountType(account);
}

updateAccountType();

document.getElementById('buy-account').addEventListener('change', updateAccountType);

/***************************************************************/
/************ Company Name based on Selected Ticker ************/
/***************************************************************/
async function fetchCompanyName(ticker) {
  if (ticker == '') {
    document.getElementById('company-display').textContent = 'N/A';
    return;
  }

  const response = await fetch(`/fetch/company?ticker=${ticker}`);
  const data = await response.json();
  document.getElementById("company-display").textContent = data.company;
}

function updateCompanyName() {
  const ticker = document.querySelector('select[name="buyTicker"]').value;
  fetchCompanyName(ticker);
}

updateCompanyName();

document.querySelector('select[name="buyTicker"]').addEventListener('change', updateCompanyName);

/**********************************************/
/************ Default Date for Buy ************/
/**********************************************/
document.addEventListener('DOMContentLoaded', () => {
  const today = new Date();
  const localDate = today.getFullYear() +
    '-' +
    String(today.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(today.getDate()).padStart(2, '0');

  document.getElementById('buy-date').value = localDate;
});

/*********************************************************************/
/************ Lot Numbers & Data based on Selected Ticker ************/
/*********************************************************************/
async function fetchLots(ticker) {
  const response = await fetch(`/fetch/lots?ticker=${ticker}`);
  const data = await response.json();

  const lots = data.lots;
  const lotSelect = document.querySelector('select[name="lot"]');
  const lotDisplay = document.getElementById('lot-display');

  lotSelect.innerHTML = '';
  lots.forEach(lot => {
    const option = document.createElement('option');
    option.value = lot._id;
    option.textContent = `${lot._id}`;
    lotSelect.appendChild(option);

    lotDisplay.append(JSON.stringify(lot, null, 2));
  });
}

document.querySelector('select[name="sellTicker"]').addEventListener('change', function () {
  const ticker = this.value;
  fetchLots(ticker);
});