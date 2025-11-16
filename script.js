const form = document.getElementById('groceryForm');
const itemName = document.getElementById('itemName');
const expiryDate = document.getElementById('expiryDate');
const groceryList = document.getElementById('groceryList');
const notificationsBtn = document.getElementById('notificationsBtn');

let notificationsEnabled = false;

const defaultItems = [
  { name: "Milk", expiry: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0] },
  { name: "Bread", expiry: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0] },
  { name: "Chips", expiry: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString().split('T')[0] }
];

let items = JSON.parse(localStorage.getItem('groceryItems'));
if (!items || items.length === 0) {
  items = defaultItems;
  localStorage.setItem('groceryItems', JSON.stringify(items));
}

function saveItems() {
  localStorage.setItem('groceryItems', JSON.stringify(items));
}

notificationsBtn.addEventListener('click', () => {
  if (!("Notification" in window)) {
    alert("This browser does not support notifications.");
    return;
  }
  if (!notificationsEnabled) {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        notificationsEnabled = true;
        notificationsBtn.textContent = "Disable Notifications";
        alert("Notifications Enabled!");
      } else {
        alert("Notifications Denied!");
      }
    });
  } else {
    notificationsEnabled = false;
    notificationsBtn.textContent = "Enable Notifications";
    alert("Notifications Disabled!");
  }
});

function sendNotification(title, body) {
  if (notificationsEnabled) {
    new Notification(title, { body });
  }
}


function renderList() {
  groceryList.innerHTML = '';
  const today = new Date();
  items.forEach((item, index) => {
    const expDate = new Date(item.expiry);
    const diffDays = Math.ceil((expDate - today) / (1000*60*60*24));

    let colorClass = 'green';
    if (diffDays <= 0) { colorClass = 'red'; }
    else if (diffDays <= 3) { colorClass = 'orange'; }

    const li = document.createElement('li');
    li.className = colorClass;
    li.innerHTML = `<span>${item.name} - Expires on: ${item.expiry}</span>
                    <button class="deleteBtn" onclick="removeItem(${index})">&times;</button>`;
    groceryList.appendChild(li);

    if (diffDays <= 3) {
      sendNotification("Expiry Alert", `${item.name} expires on ${item.expiry}`);
    }
  });
}

function removeItem(index) {
  items.splice(index, 1);
  saveItems();
  renderList();
}

form.addEventListener('submit', e => {
  e.preventDefault();
  items.push({ name: itemName.value, expiry: expiryDate.value });
  saveItems();
  renderList();
  form.reset();
});

renderList();
