# Booker.com

This is a web-app to book train tickets

- Designed Ticket Booking Algorithm to reserve nearest seats
- Applied Graph Based Algorithm
- User can also view train coach positions & seats availiabilty

## Local Quick Start

- Clone to your local
- Install dependencies `npm install`
- Add MongoDB password in `.env`
- Update MongoDB url in `app.js`
- Run locally `node app.js`
- Make requests
  - Home: `http://localhost:3000/`
  - Train: `http://localhost:3000/train/:train-number`

## Database Structure

- `Demo` https://frail-school-uniform-newt.cyclic.app/
- `MongoDB` is used in backend as database
- Mongoose schemas
  - Train: A Train having different attributes - Name, Train Number, Seats[]
  - Seats: A Seat having different attributes - Seat Number, Is Booked, Updated On

  ![image](/public/screenshots/train-schema.png) ![image](/public/screenshots/seat-schema.png)



## Book Seats Algorithm Explained

- One person can reserve up to 7 seats at a time.
- If person is reserving seats, the priority will be to book them in one row.
- If seats are not available in one row then the booking should be done in such a way that the nearby
  seats are booked.
- User can book as many tickets as she/he wants until the coach is full.
- Different stages of Algorithm
  - Stage-1: Book Seats in row if available then return
  - Stage-2: Book Seats in such a way that nearby seats are booked then return, using `Graph Based Algorithm`.
  - Stage-3: If not found seats in row or any connected group of seats.
  - Stage-4: Then try to book maximum number of seats nearby if possible then return.

### Application Screeshots
![image](/public/screenshots/home.png)
<br>
![image](/public/screenshots/train.png)
<br>
![image](/public/screenshots/booking.png)

## Follow Me

Ask a question or give us a shout out:

- 💌 https://kundan-6646.github.io/Portfolio/
- 🐣 https://www.linkedin.com/in/kundan-kmr/
