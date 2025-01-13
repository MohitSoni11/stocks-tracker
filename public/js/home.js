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
  const table = document.getElementById('lot-table');

  const fetchCurrentPrice = await fetch(`/fetch/currentPrice?ticker=${ticker}`);
  const currentPrice = await fetchCurrentPrice.json();

  lotSelect.innerHTML = '';
  for (let i = table.rows.length - 1; i > 0; i--) {
    table.deleteRow(i);
  }

  if (lots.length == 0) {
    table.style.display = 'none';
  } else {
    table.style.display = 'table';
  }

  lots.forEach(async lot => {
    const option = document.createElement('option');
    option.value = lot.lot;
    option.textContent = `${lot.lot}`;
    lotSelect.appendChild(option);

    const fetchAccountType = await fetch(`/fetch/atype?account=${lot.account}`);
    const accountType = await fetchAccountType.json();

    const fetchAvgSoldPrice = await fetch(`/fetch/avgSoldPrice?id=${lot.lot}`);
    const avgSoldPrice = await fetchAvgSoldPrice.json();

    const buyDate = new Date(lot.buyDate);
    const formattedDate = buyDate.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

    console.log(formattedDate);

    const rowData = [
      lot.lot,
      formattedDate,
      accountType.type,
      lot.account,
      lot.buyQuantity,
      lot.buyPrice,
      lot.buyQuantity * lot.buyPrice,
      lot.buyQuantity - lot.sellQuantity,
      currentPrice.price,
      (lot.buyQuantity - lot.sellQuantity) * currentPrice.price,
      lot.sellQuantity,
      avgSoldPrice.price,
      lot.sellReturn,
      lot.sellQuantity * avgSoldPrice.price - lot.buyQuantity * lot.buyPrice
    ]

    const row = table.insertRow();
    rowData.forEach(item => {
      const cell = row.insertCell();
      cell.textContent = item;
    });
  });
}

function updateLots() {
  const ticker = document.querySelector('select[name="sellTicker"]').value;
  fetchLots(ticker);
}

updateLots();

document.querySelector('select[name="sellTicker"]').addEventListener('change', updateLots);