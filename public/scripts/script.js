//counter logic
const main = document.querySelector("main");
const plus = document.getElementById("plus");
const minus = document.getElementById("minus");
const bookButton = document.getElementById("book-btn");
let counterInput = 1;
let currentlyAvailable = document.getElementById('availableSeats').value;


if(currentlyAvailable == 0) {
    bookButton.disabled = true;
    document.querySelector('.alert').style.opacity = '1';
    document.getElementById('book-btn').setAttribute('disabled', true);
}

plus.addEventListener('click', function() {
    if(counterInput >= currentlyAvailable) {
        alert("No more seats left");
    }else if (counterInput == 7){
        alert("You can reserve up to 7 seats at a time.");
    }else {
        counterInput++;
        document.getElementById("seatsCount").value = counterInput;
    }
});
minus.addEventListener('click', function() {
    if(counterInput == 1) {
        alert("Atleast 1 seat need to be booked")
    }else {
        counterInput--;
        document.getElementById("seatsCount").value = counterInput;
    }
});



//setting today as date of journey
const dateInput = document.getElementById('date');
dateInput.value = formatDate();

function padTo2Digits(num) {
  return num.toString().padStart(2, '0');
}

function formatDate(date = new Date()) {
  return [
    date.getFullYear(),
    padTo2Digits(date.getMonth() + 1),
    padTo2Digits(date.getDate()),
  ].join('-');
}
